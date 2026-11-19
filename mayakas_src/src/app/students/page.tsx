import Shell from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
export const dynamic="force-dynamic";
export default async function Students(){
 await requireRole(["ADMIN","TEACHER","BURSAR"]);
 const rows=await prisma.student.findMany({orderBy:{admissionNo:"asc"},take:100}).catch(()=>[]);
 return <Shell><div className="content"><div className="eyebrow">SCHOOL RECORDS</div><h1>Student profiles</h1><p className="sub">Admissions, guardians, curriculum and class placement.</p>
 <div className="actions"><a className="btn" href="/students/new">+ Register student</a><span className="pill">CBC + Cambridge</span></div>
 <div className="panel"><table className="table"><thead><tr><th>Admission no.</th><th>Student</th><th>Curriculum</th><th>Grade</th><th>Guardian</th><th>Status</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td>{s.admissionNo}</td><td>{s.firstName} {s.lastName}</td><td>{s.curriculum}</td><td>{s.grade}</td><td>{s.guardianName||"—"}</td><td><span className="pill">{s.active?"Active":"Inactive"}</span></td></tr>)}{!rows.length&&<tr><td colSpan={6}>No student records yet. Register your first student.</td></tr>}</tbody></table></div>
 </div></Shell>;
}
