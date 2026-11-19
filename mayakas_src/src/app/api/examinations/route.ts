import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
export async function GET(){try{const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);return NextResponse.json(await prisma.examination.findMany({where:{schoolId:user.schoolId},orderBy:{createdAt:"desc"}}));}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
