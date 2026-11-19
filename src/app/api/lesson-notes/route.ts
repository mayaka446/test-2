import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
const schema=z.object({title:z.string().min(2),description:z.string().optional(),subjectId:z.string(),grade:z.string(),curriculum:z.enum(["CBC","CAMBRIDGE"]),fileUrl:z.string().url()});
export async function GET(){try{const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);return NextResponse.json(await prisma.lessonNote.findMany({where:{schoolId:user.schoolId},include:{subject:true},orderBy:{createdAt:"desc"}}));}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
export async function POST(req:NextRequest){try{const user=await requireRole(["ADMIN","TEACHER"]);const b=schema.parse(await req.json());const row=await prisma.lessonNote.create({data:{...b,schoolId:user.schoolId,uploadedBy:user.id}});return NextResponse.json(row,{status:201});}catch{return NextResponse.json({error:"Invalid lesson note or unauthorized"},{status:400});}}
