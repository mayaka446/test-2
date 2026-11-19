import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole,getSession} from "@/lib/auth";
const schema=z.object({assignmentId:z.string(),textAnswer:z.string().optional(),fileUrl:z.string().url().optional()});
export async function GET(){
 try{
  const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);
  if(user.role==="STUDENT"){
   const profile=await prisma.student.findUnique({where:{userId:user.id,schoolId:user.schoolId}});
   if(!profile)return NextResponse.json({error:"Student profile is not linked to this login."},{status:404});
   return NextResponse.json(await prisma.assignmentSubmission.findMany({where:{schoolId:user.schoolId,studentId:profile.id},include:{assignment:{include:{subject:true}}},orderBy:{submittedAt:"desc"}}));
  }
  return NextResponse.json(await prisma.assignmentSubmission.findMany({where:{schoolId:user.schoolId},include:{student:true,assignment:true},orderBy:{submittedAt:"desc"}}));
 }catch{return NextResponse.json({error:"Unauthorized"},{status:401});}
}
export async function POST(req:NextRequest){
 try{
  const user=await requireRole(["STUDENT"]);
  const profile=await prisma.student.findUnique({where:{userId:user.id,schoolId:user.schoolId}});
  if(!profile)return NextResponse.json({error:"Student profile is not linked to this login."},{status:400});
  const b=schema.parse(await req.json());
  const assignment=await prisma.assignment.findUnique({where:{id:b.assignmentId,schoolId:user.schoolId}});
  if(!assignment||assignment.status!=="PUBLISHED"||assignment.curriculum!==profile.curriculum||assignment.grade!==profile.grade||(assignment.dueDate&&assignment.dueDate.getTime()<Date.now()))return NextResponse.json({error:"Assignment is not available for this learner or the deadline has passed."},{status:404});
  const row=await prisma.assignmentSubmission.upsert({where:{assignmentId_studentId:{assignmentId:b.assignmentId,studentId:profile.id}},create:{...b,schoolId:user.schoolId,studentId:profile.id},update:{textAnswer:b.textAnswer,fileUrl:b.fileUrl,submittedAt:new Date()}});
  return NextResponse.json(row,{status:201});
 }catch{return NextResponse.json({error:"Could not submit assignment"},{status:400});}
}
export async function PATCH(req:NextRequest){
 try{const user=await requireRole(["ADMIN","TEACHER"]);const b=z.object({id:z.string(),score:z.number().min(0),feedback:z.string().optional()}).parse(await req.json());const existing=await prisma.assignmentSubmission.findUnique({where:{id:b.id,schoolId:user.schoolId},include:{assignment:true}});if(!existing||b.score>100)return NextResponse.json({error:"Invalid submission or score."},{status:400});const row=await prisma.assignmentSubmission.update({where:{id:b.id,schoolId:user.schoolId},data:{score:b.score,feedback:b.feedback}});await prisma.auditLog.create({data:{schoolId:user.schoolId,userId:user.id,action:"ASSIGNMENT_GRADED",entity:"AssignmentSubmission",entityId:row.id}});return NextResponse.json(row);}catch{return NextResponse.json({error:"Could not grade submission"},{status:400});}
}
