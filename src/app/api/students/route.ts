import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { generateAdmissionNo } from "@/lib/admission";

// admissionNo is no longer accepted from the client; it is generated on the server.
const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  grade: z.string().min(1),
  curriculum: z.enum(["CBC", "CAMBRIDGE"]),
  stream: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireRole(["ADMIN", "TEACHER", "BURSAR"]);
    const students = await prisma.student.findMany({
      where: { schoolId: user.schoolId, active: true },
      orderBy: { admissionNo: "asc" },
    });
    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["ADMIN"]);
    const body = schema.parse(await req.json());

    // Two requests can compute the same number at once, so retry on a unique-constraint clash.
    let student = null;
    for (let attempt = 0; attempt < 3 && !student; attempt++) {
      const admissionNo = await generateAdmissionNo(user.schoolId);
      try {
        student = await prisma.student.create({
          data: {
            ...body,
            admissionNo,
            schoolId: user.schoolId,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          },
        });
      } catch (e: any) {
        if (e?.code !== "P2002" || attempt === 2) throw e;
      }
    }

    return NextResponse.json(student, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e?.code === "P2002"
            ? "Could not assign an admission number, please try again"
            : "Invalid data or unauthorized request",
      },
      { status: 400 }
    );
  }
}
