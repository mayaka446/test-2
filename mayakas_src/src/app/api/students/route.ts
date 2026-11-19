import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
const schema=z.object({admissionNo:z.string().min(1),firstName:z.string().min(1),lastName:z.string().min(1),grade:z.string().min(1),curriculum:z.enum(["CBC","CAMBRIDGE"]),stream:z.string().optional(),guardianName:z.string().optional(),guardianPhone:z.string().optional(),guardianEmail:z.string().optional(),dateOfBirth:z.string().optional()});
export async function GET(){try{const user=await requireRole(["ADMIN","TEACHER","BURSAR"]);const students=await prisma.student.findMany({where:{schoolId:user.schoolId,active:true},orderBy:{admissionNo:"asc"}});return NextResponse.json(students);}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
export async function POST(req:NextRequest){try{const user=await requireRole(["ADMIN"]);const body=schema.parse(await req.json());const student=await prisma.student.create({data:{...body,schoolId:user.schoolId,dateOfBirth:body.dateOfBirth?new Date(body.dateOfBirth):undefined}});return NextResponse.json(student,{status:201});}catch(e:any){return NextResponse.json({error:e?.code==="P2002"?"Admission number already exists":"Invalid data or unauthorized request"},{status:400});}}
