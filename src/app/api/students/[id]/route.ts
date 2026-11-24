import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { validatePhoto, PhotoError } from "@/lib/photo";
import { isValidGrade } from "@/lib/grades";

const updateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  curriculum: z.enum(["CBC", "CAMBRIDGE"]),
  grade: z.string().min(1),
  stream: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().optional(),
  dateOfBirth: z.string().optional(),
  photoUrl: z.string().optional(),
  active: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = updateSchema.parse(await req.json());

    if (!isValidGrade(body.curriculum, body.grade)) {
      return NextResponse.json({ error: "Grade does not match the selected curriculum" }, { status: 400 });
    }

    // Only students in this school can be edited.
    const existing = await prisma.student.findFirst({ where: { id, schoolId: user.schoolId } });
    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const { photoUrl: rawPhoto, dateOfBirth, ...fields } = body;
    const photoUrl = validatePhoto(rawPhoto);

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...fields,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        // Keep the existing photo if no new one was chosen.
        ...(photoUrl ? { photoUrl } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    const message =
      e instanceof PhotoError ? e.message : "Could not save changes. Check the details and try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
