import Shell from "@/components/Shell";
import StudentForm from "./student-form";
import { requireRole } from "@/lib/auth";
export default async function NewStudent(){await requireRole(["ADMIN"]);return <Shell><div className="content"><div className="eyebrow">ADMISSIONS</div><h1>Register student</h1><p className="sub">Create a student profile and guardian record.</p><div className="panel"><StudentForm/></div></div></Shell>}
