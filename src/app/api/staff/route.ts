import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { validatePhoto, PhotoError } from "@/lib/photo";
import { DEPARTMENTS } from "@/lib/departments";

// The staff number is generated on the server, so the client never sends it.
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.enum(DEPARTMENTS),
  jobTitle: z.string().min(2),
  photoUrl: z.string().optional(),
});

// Format: STF/2026/0001. Numbers are checked across all staff so they stay unique.
async function generateStaffNo(): Promise<string> {
  const pattern = `STF/${new Date().getFullYear()}/`;
  const existing = await prisma.staff.findMany({
    where: { employeeNo: { startsWith: pattern } },
    select: { employeeNo: true },
  });
  let highest = 0;
  for (const s of existing) {
    const n = parseInt(s.employeeNo.slice(pattern.length), 10);
    if (!Number.isNaN(n) && n > highest) highest = n;
  }
  return `${pattern}${String(highest + 1).padStart(4, "0")}`;
}

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

    let staff = null;
    for (let attempt = 0; attempt < 3 && !staff; attempt++) {
      const employeeNo = await generateStaffNo();
      try {
        staff = await prisma.staff.create({
          data: { ...body, employeeNo, photoUrl, schoolId: user.schoolId },
        });
      } catch (e: any) {
        if (e?.code !== "P2002" || attempt === 2) throw e;
      }
    }
    return NextResponse.json(staff, { status: 201 });
  } catch (e: any) {
    if (e instanceof PhotoError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e?.name === "ZodError") {
      const issue = e.issues?.[0];
      return NextResponse.json({ error: `Check "${issue?.path?.join(".")}": ${issue?.message}` }, { status: 400 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A staff member with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: `Could not save staff: ${e?.code || e?.message || "unknown error"}` }, { status: 400 });
  }
}
