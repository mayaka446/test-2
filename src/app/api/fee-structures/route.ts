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
  return `Could not save fee structure: ${e?.code||e?.message||"unknown error"}`;
}

export async function GET(){
  try{
    const user=await requireRole(["ADMIN","BURSAR"]);
    return NextResponse.json(await prisma.feeStructure.findMany({where:{schoolId:user.schoolId},orderBy:[{academicYear:"desc"},{grade:"asc"}]}));
  }catch{
    return NextResponse.json({error:"Unauthorized"},{status:401});
  }
}

export async function POST(req:NextRequest){
  try{
    const user=await requireRole(["ADMIN","BURSAR"]);
    const body=schema.parse(await req.json());
    if(!isValidGrade(body.curriculum,body.grade)) return NextResponse.json({error:"Grade does not match the selected curriculum"},{status:400});
    const fee=await prisma.feeStructure.create({data:{...body,schoolId:user.schoolId}});
    return NextResponse.json(fee,{status:201});
  }catch(e:any){
    return NextResponse.json({error:describe(e)},{status:400});
  }
}
