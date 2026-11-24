import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import EditStudentForm from "./edit-student-form";
export const dynamic = "force-dynamic";

export default async function EditStudent({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN"]);
  const { id } = await params;
  const s = await prisma.student.findFirst({ where: { id, schoolId: user.schoolId } });
  if (!s) notFound();
  const student = {
    id: s.id,
    admissionNo: s.admissionNo,
    firstName: s.firstName,
    lastName: s.lastName,
    curriculum: s.curriculum,
    grade: s.grade,
    stream: s.stream || "",
    guardianName: s.guardianName || "",
    guardianPhone: s.guardianPhone || "",
    guardianEmail: s.guardianEmail || "",
    dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().slice(0, 10) : "",
    active: s.active,
    photoUrl: s.photoUrl || "",
  };
  return (
    <Shell>
      <div className="content">
        <div className="eyebrow">SCHOOL RECORDS</div>
        <h1>Edit student</h1>
        <p className="sub">{s.admissionNo} (the admission number cannot be changed)</p>
        <div className="panel">
          <EditStudentForm student={student} />
        </div>
      </div>
    </Shell>
  );
}
