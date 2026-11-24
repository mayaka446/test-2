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
    return NextResponse.json(
      { error: e instanceof PhotoError ? e.message : "Invalid or duplicate staff record" },
      { status: 400 }
    );
  }
}
