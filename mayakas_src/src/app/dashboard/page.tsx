import Shell from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic="force-dynamic";
export default async function Dashboard(){
 const session=await getSession();
 if(session?.role === "SUPER_ADMIN") redirect("/platform/schools");
 if(!session?.schoolId) redirect("/login");
 const [students,staff,payments,assignments]=await Promise.all([
  prisma.student.count({where:{schoolId:session.schoolId,active:true}}).catch(()=>0),
  prisma.staff.count({where:{schoolId:session.schoolId}}).catch(()=>0),
  prisma.payment.aggregate({where:{schoolId:session.schoolId}, _sum:{amount:true}}).catch(()=>({_sum:{amount:0}})),
  prisma.assignment.count({where:{schoolId:session.schoolId}}).catch(()=>0)
 ]);
 const money=Number(payments._sum.amount||0).toLocaleString("en-KE");
 return <Shell><div className="content">
  <div className="eyebrow">SCHOOL OVERVIEW</div><h1>Good day, {session?.name?.split(" ")[0]||"there"}</h1>
  <p className="sub">Here is the current snapshot of your school operations.</p>
  <div className="grid">
   <div className="stat"><div className="stat-label">Active students</div><div className="stat-value">{students}</div><div className="stat-foot">Across CBC and Cambridge</div></div>
   <div className="stat"><div className="stat-label">Staff members</div><div className="stat-value">{staff}</div><div className="stat-foot">Teaching and support staff</div></div>
   <div className="stat"><div className="stat-label">Fees received</div><div className="stat-value">KES {money}</div><div className="stat-foot">Recorded payments to date</div></div>
   <div className="stat"><div className="stat-label">Assignments</div><div className="stat-value">{assignments}</div><div className="stat-foot">Created learning tasks</div></div>
  </div>
  <div className="two-col">
   <section className="panel"><h2>Management workspace</h2><div className="cards">
    {[["Student records","Admissions, profiles, guardians and enrolment"],["Attendance","Daily student and staff registers"],["Academic results","Assessments, grading and report cards"],["Finance","Fee structures, receipts and expenditure"],["Learning resources","Homework, submissions and lesson notes"],["Reports","Academic and financial summaries"]].map(([a,b])=><div className="module" key={a}><strong>{a}</strong><span>{b}</span></div>)}
   </div></section>
   <section className="panel"><h2>System setup checklist</h2>
    {["Confirm school profile and academic calendar","Create CBC and Cambridge classes","Add learning areas and subjects","Register students and guardians","Create fee structures for each term","Assign staff roles and class responsibilities"].map((x,i)=><p key={x} style={{fontSize:12,padding:"9px 0",borderBottom:"1px solid #eef1f5"}}><span className="pill">{i+1}</span> &nbsp;{x}</p>)}
   </section>
  </div>
 </div></Shell>;
}
