import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
import {isValidGrade} from "@/lib/grades";

const schema=z.object({
  name:z.string().min(2),
  curriculum:z.enum(["CBC","CAMBRIDGE"]),
  grade:z.string().min(1),
  academicYear:z.coerce.number().int(),
  term:z.enum(["Term 1","Term 2","Term 3","Full year"]),
  amount:z.coerce.number().positive(),
});

function describe(e:any){
  if(e?.name==="ZodError"){const i=e.issues?.[0];return `Check "${i?.path?.join(".")}": ${i?.message}`;}
  return `Could not save changes: ${e?.code||e?.message||"unknown error"}`;
}

export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await requireRole(["ADMIN","BURSAR"]);
    const {id}=await params;
    const body=schema.parse(await req.json());
    if(!isValidGrade(body.curriculum,body.grade)) return NextResponse.json({error:"Grade does not match the selected curriculum"},{status:400});
    const existing=await prisma.feeStructure.findFirst({where:{id,schoolId:user.schoolId}});
    if(!existing) return NextResponse.json({error:"Fee structure not found"},{status:404});
    const fee=await prisma.feeStructure.update({where:{id},data:body});
    return NextResponse.json(fee);
  }catch(e:any){
    return NextResponse.json({error:describe(e)},{status:400});
  }
}

export async function DELETE(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await requireRole(["ADMIN","BURSAR"]);
    const {id}=await params;
    const existing=await prisma.feeStructure.findFirst({where:{id,schoolId:user.schoolId}});
    if(!existing) return NextResponse.json({error:"Fee structure not found"},{status:404});
    await prisma.feeStructure.delete({where:{id}});
    return NextResponse.json({ok:true});
  }catch{
    return NextResponse.json({error:"Could not delete fee structure."},{status:400});
  }
}
