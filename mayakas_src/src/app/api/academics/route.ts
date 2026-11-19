import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
const classSchema=z.object({name:z.string().min(1),grade:z.string().min(1),stream:z.string().optional(),curriculum:z.enum(["CBC","CAMBRIDGE"]),academicYear:z.coerce.number().int()});
const subjectSchema=z.object({code:z.string().min(1),name:z.string().min(1),curriculum:z.enum(["CBC","CAMBRIDGE"])});
export async function GET(){try{const user=await requireRole(["ADMIN","TEACHER"]);const [classes,subjects]=await Promise.all([prisma.schoolClass.findMany({where:{schoolId:user.schoolId},orderBy:{name:"asc"}}),prisma.subject.findMany({where:{schoolId:user.schoolId},orderBy:{name:"asc"}})]);return NextResponse.json({classes,subjects});}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
export async function POST(req:NextRequest){try{const user=await requireRole(["ADMIN"]);const b=await req.json();if(b.kind==="SUBJECT")return NextResponse.json(await prisma.subject.create({data:{...subjectSchema.parse(b),schoolId:user.schoolId}}),{status:201});return NextResponse.json(await prisma.schoolClass.create({data:{...classSchema.parse(b),schoolId:user.schoolId}}),{status:201});}catch{return NextResponse.json({error:"Invalid or duplicate academic record"},{status:400});}}
