import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireRole,getSession} from "@/lib/auth";
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => { switch (char) { case "&": return "&amp;"; case "<": return "&lt;"; case ">": return "&gt;"; case '"': return "&quot;"; default: return "&#39;"; } });
export async function GET(req:NextRequest){
 try{
  const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);
  let studentId=req.nextUrl.searchParams.get("studentId");
  const examinationId=req.nextUrl.searchParams.get("examinationId");
  const session=await getSession();
  if(session?.role==="STUDENT"){const profile=await prisma.student.findUnique({where:{userId:session.id,schoolId:user.schoolId}});if(!profile)return new NextResponse("Student profile is not linked to this account.",{status:404});studentId=profile.id;}
  const students=await prisma.student.findMany({where:{schoolId:user.schoolId,...(studentId?{id:studentId}:{})},include:{results:{where:examinationId?{examinationId}: {},include:{subject:true,examination:true}}},take:100});
  const html=students.map(s=>{const results=s.results;const avg=results.length?results.reduce((a,r)=>a+r.score,0)/results.length:0;return `<section class="report"><h1>MAYAKAS MANAGEMENT SYSTEM</h1><h2>Student Academic Report</h2><p><b>Name:</b> ${escapeHtml(s.firstName)} ${escapeHtml(s.lastName)} &nbsp; <b>Admission:</b> ${escapeHtml(s.admissionNo)}</p><p><b>Curriculum:</b> ${escapeHtml(s.curriculum)} &nbsp; <b>Grade:</b> ${escapeHtml(s.grade)}</p><table><thead><tr><th>Learning area / Subject</th><th>Score</th><th>Grade</th><th>Teacher comment</th></tr></thead><tbody>${results.map(r=>`<tr><td>${escapeHtml(r.subject.name)}</td><td>${escapeHtml(r.score)}</td><td>${escapeHtml(r.grade||"—")}</td><td>${escapeHtml(r.teacherComment||"")}</td></tr>`).join("")}</tbody></table><p><b>Average score:</b> ${avg.toFixed(1)}%</p><p class="sign">Class teacher: __________________ &nbsp;&nbsp; Principal: __________________</p></section>`}).join("");
  return new NextResponse(`<!doctype html><html><head><title>Mayakas Report Cards</title><style>body{font:14px Arial;color:#172b42}.report{max-width:850px;margin:30px auto;padding:30px;border:1px solid #ddd;page-break-after:always}h1,h2{text-align:center}table{width:100%;border-collapse:collapse;margin:25px 0}td,th{border:1px solid #aaa;padding:10px;text-align:left}.sign{margin-top:50px}@media print{.report{border:0;margin:0}}</style></head><body>${html||"<p>No report data found.</p>"}<script>window.print()</script></body></html>`,{headers:{"Content-Type":"text/html"}});
 }catch{return NextResponse.json({error:"Unauthorized"},{status:401});}
}
