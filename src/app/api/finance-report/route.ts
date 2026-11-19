import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
export async function GET(){try{
 const user=await requireRole(["ADMIN","BURSAR"]);
 const students=await prisma.student.findMany({where:{schoolId:user.schoolId,active:true},include:{payments:true}});
 const structures=await prisma.feeStructure.findMany({where:{schoolId:user.schoolId}});
 const rows=students.map(s=>{
  const due=structures.filter(f=>f.curriculum===s.curriculum&&f.grade===s.grade).reduce((a,f)=>a+Number(f.amount),0);
  const paid=s.payments.reduce((a,p)=>a+Number(p.amount),0);
  return {admissionNo:s.admissionNo,name:`${s.firstName} ${s.lastName}`,curriculum:s.curriculum,grade:s.grade,feesDue:due,paid,balance:Math.max(0,due-paid)};
 });
 return NextResponse.json({students:rows,totals:{feesDue:rows.reduce((a,x)=>a+x.feesDue,0),paid:rows.reduce((a,x)=>a+x.paid,0),balance:rows.reduce((a,x)=>a+x.balance,0)}});
 }catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
