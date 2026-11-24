import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import EditStaffForm from "./edit-staff-form";
export const dynamic = "force-dynamic";

export default async function EditStaff({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ADMIN"]);
  const { id } = await params;
  const s = await prisma.staff.findFirst({ where: { id, schoolId: user.schoolId } });
  if (!s) notFound();
  const staff = {
    id: s.id,
    employeeNo: s.employeeNo,
    name: s.name,
    email: s.email,
    phone: s.phone || "",
    department: s.department || "",
    jobTitle: s.jobTitle,
    photoUrl: s.photoUrl || "",
  };
  return (
    <Shell>
      <div className="content">
        <div className="eyebrow">STAFF RECORDS</div>
        <h1>Edit staff member</h1>
        <div className="panel">
          <EditStaffForm staff={staff} />
        </div>
      </div>
    </Shell>
  );
}
