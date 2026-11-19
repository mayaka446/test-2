import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
import {getSession} from "@/lib/auth";
import {gradeForScore} from "@/lib/validation";
const examSchema=z.object({name:z.string().min(2),curriculum:z.enum(["CBC","CAMBRIDGE"]),grade:z.string().min(1),term:z.string().min(1),academicYear:z.coerce.number().int(),maxScore:z.coerce.number().positive().default(100)});
const markSchema=z.object({examinationId:z.string(),studentId:z.string(),subjectId:z.string(),score:z.coerce.number().min(0),teacherComment:z.string().optional()});
export async function GET(req:NextRequest){
 try{const tenant=await requireRole(["ADMIN","TEACHER","STUDENT"]);const id=req.nextUrl.searchParams.get("examinationId");const session=await getSession();let studentFilter:any={};if(session?.role==="STUDENT"){const profile=await prisma.student.findUnique({where:{userId:session.id,schoolId:tenant.schoolId}});if(!profile)return NextResponse.json([]);studentFilter={studentId:profile.id};}const rows=await prisma.result.findMany({where:{schoolId:tenant.schoolId,...studentFilter,...(id?{examinationId:id}:{})},include:{student:true,subject:true,examination:true},orderBy:[{student:{admissionNo:"asc"}},{subject:{name:"asc"}}]});return NextResponse.json(rows.map(r=>({...r,score:Number(r.score)})));}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}
}
export async function POST(req:NextRequest){
 try{
  const user=await requireRole(["ADMIN","TEACHER"]);const body=await req.json();
  if(body.kind==="EXAM"){
   const b=examSchema.parse(body);const exam=await prisma.examination.create({data:{...b,schoolId:user.schoolId}});return NextResponse.json(exam,{status:201});
  }
  const b=markSchema.parse(body);
  const [exam,student,subject]=await Promise.all([
   prisma.examination.findUnique({where:{id:b.examinationId,schoolId:user.schoolId}}),
   prisma.student.findUnique({where:{id:b.studentId,schoolId:user.schoolId}}),
   prisma.subject.findUnique({where:{id:b.subjectId,schoolId:user.schoolId}})
  ]);
  if(!exam||!student||!subject||b.score>exam.maxScore||student.curriculum!==exam.curriculum||subject.curriculum!==exam.curriculum||student.grade!==exam.grade) return NextResponse.json({error:"Check exam, student and maximum score."},{status:400});
  const bands=await prisma.gradingBand.findMany({where:{schoolId:user.schoolId,curriculum:exam.curriculum}});
  const percent=(b.score/exam.maxScore)*100;
  const grade=gradeForScore(percent,exam.curriculum,bands);
  const result=await prisma.result.upsert({where:{studentId_subjectId_examinationId:{studentId:b.studentId,subjectId:b.subjectId,examinationId:b.examinationId}},create:{...b,schoolId:user.schoolId,grade:grade.grade,teacherComment:b.teacherComment||grade.comment},update:{score:b.score,grade:grade.grade,teacherComment:b.teacherComment||grade.comment}});
  await prisma.auditLog.create({data:{schoolId:user.schoolId,userId:user.id,action:"RESULT_RECORDED",entity:"Result",entityId:result.id}});
  return NextResponse.json({...result,gradeDescription:grade.comment},{status:201});
 }catch{return NextResponse.json({error:"Could not save examination or result"},{status:400});}
}
