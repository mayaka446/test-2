import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { validatePhoto, PhotoError } from "@/lib/photo";

const updateSchema = z.object({
  employeeNo: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().min(2),
  photoUrl: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    const existing = await prisma.staff.findFirst({ where: { id, schoolId: user.schoolId } });
    if (!existing) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

    const { photoUrl: rawPhoto, ...fields } = body;
    const photoUrl = validatePhoto(rawPhoto);
    const updated = await prisma.staff.update({
      where: { id },
      data: { ...fields, ...(photoUrl ? { photoUrl } : {}) },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e instanceof PhotoError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Another staff member already uses this employee number or email" }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not save changes. Check the details and try again." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["ADMIN"]);
    const { id } = await params;
    const existing = await prisma.staff.findFirst({ where: { id, schoolId: user.schoolId } });
    if (!existing) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });

    const attendance = await prisma.staffAttendance.count({ where: { staffId: id } });
    if (attendance > 0) {
      return NextResponse.json(
        { error: `Cannot delete: this person has ${attendance} attendance record(s). Attendance history is kept.` },
        { status: 400 }
      );
    }
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete staff member." }, { status: 400 });
  }
}
