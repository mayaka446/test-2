import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
const schema=z.object({curriculum:z.enum(["CBC","CAMBRIDGE"]),name:z.string().min(1),minScore:z.coerce.number().min(0).max(100),maxScore:z.coerce.number().min(0).max(100),grade:z.string().min(1),description:z.string().optional()}).refine(x=>x.minScore<=x.maxScore);
export async function GET(req:NextRequest){try{const user=await requireRole(["ADMIN","TEACHER"]);const curriculum=req.nextUrl.searchParams.get("curriculum");return NextResponse.json(await prisma.gradingBand.findMany({where:{schoolId:user.schoolId,...(curriculum?{curriculum:curriculum as any}:{})},orderBy:{minScore:"desc"}}));}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
export async function POST(req:NextRequest){try{const user=await requireRole(["ADMIN"]);const b=schema.parse(await req.json());return NextResponse.json(await prisma.gradingBand.create({data:{...b,schoolId:user.schoolId}}),{status:201});}catch{return NextResponse.json({error:"Invalid or duplicate grading band"},{status:400});}}
