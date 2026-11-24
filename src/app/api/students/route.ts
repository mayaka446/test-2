import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { validatePhoto, PhotoError } from "@/lib/photo";

const schema = z.object({
  employeeNo: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().min(2),
  photoUrl: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireRole(["ADMIN"]);
    return NextResponse.json(
      await prisma.staff.findMany({ where: { schoolId: user.schoolId }, orderBy: { name: "asc" } })
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["ADMIN"]);
    const body = schema.parse(await req.json());
    const photoUrl = validatePhoto(body.photoUrl);
    const staff = await prisma.staff.create({
      data: { ...body, photoUrl, schoolId: user.schoolId },
    });
    return NextResponse.json(staff, { status: 201 });
  } catch (e: any) {
    if (e instanceof PhotoError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e?.name === "ZodError") {
      const issue = e.issues?.[0];
      return NextResponse.json({ error: `Check "${issue?.path?.join(".")}": ${issue?.message}` }, { status: 400 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A staff member with this employee number or email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: `Could not save staff: ${e?.code || e?.message || "unknown error"}` }, { status: 400 });
  }
}
