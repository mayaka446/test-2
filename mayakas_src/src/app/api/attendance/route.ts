import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
import {todayAtMidnight} from "@/lib/validation";
const schema=z.object({
  date:z.string().optional(),
  records:z.array(z.object({id:z.string().min(1),status:z.enum(["PRESENT","ABSENT","LATE","EXCUSED"]),remarks:z.string().optional()})).min(1),
  type:z.enum(["STUDENT","STAFF"]).default("STUDENT")
});
export async function GET(req:NextRequest){
 try{
  const user=await requireRole(["ADMIN","TEACHER"]);
  const date=todayAtMidnight(req.nextUrl.searchParams.get("date")||undefined);
  const type=req.nextUrl.searchParams.get("type")||"STUDENT";
  if(type==="STAFF"){
   const rows=await prisma.staff.findMany({where:{schoolId:user.schoolId},include:{attendance:{where:{date}}},orderBy:{name:"asc"}});
   return NextResponse.json(rows.map(x=>({id:x.id,name:x.name,number:x.employeeNo,status:x.attendance[0]?.status||"UNMARKED",remarks:x.attendance[0]?.remarks||""})));
  }
  const rows=await prisma.student.findMany({where:{schoolId:user.schoolId,active:true},include:{attendance:{where:{date}}},orderBy:{admissionNo:"asc"}});
  return NextResponse.json(rows.map(x=>({id:x.id,name:`${x.firstName} ${x.lastName}`,number:x.admissionNo,status:x.attendance[0]?.status||"UNMARKED",remarks:x.attendance[0]?.remarks||""})));
 }catch{return NextResponse.json({error:"Unauthorized or invalid date"},{status:401});}
}
export async function POST(req:NextRequest){
 try{
  const user=await requireRole(["ADMIN","TEACHER"]);
  const b=schema.parse(await req.json()); const date=todayAtMidnight(b.date);
  const results=await prisma.$transaction(b.records.map(r=>b.type==="STAFF"
   ?prisma.staffAttendance.upsert({where:{staffId_date:{staffId:r.id,date}},create:{schoolId:user.schoolId,staffId:r.id,date,status:r.status,remarks:r.remarks},update:{status:r.status,remarks:r.remarks}})
   :prisma.studentAttendance.upsert({where:{studentId_date:{studentId:r.id,date}},create:{schoolId:user.schoolId,studentId:r.id,date,status:r.status,remarks:r.remarks,recordedBy:user.id},update:{status:r.status,remarks:r.remarks,recordedBy:user.id}})
  ));
  await prisma.auditLog.create({data:{schoolId:user.schoolId,userId:user.id,action:"ATTENDANCE_SAVED",entity:b.type+"Attendance"}});
  return NextResponse.json({saved:results.length});
 }catch{return NextResponse.json({error:"Could not save attendance"},{status:400});}
}
