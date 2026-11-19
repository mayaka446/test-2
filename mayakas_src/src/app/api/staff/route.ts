import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {requireRole} from "@/lib/auth";
const schema=z.object({employeeNo:z.string().min(1),name:z.string().min(2),email:z.string().email(),phone:z.string().optional(),department:z.string().optional(),jobTitle:z.string().min(2)});
export async function GET(){try{const user=await requireRole(["ADMIN"]);return NextResponse.json(await prisma.staff.findMany({where:{schoolId:user.schoolId},orderBy:{name:"asc"}}));}catch{return NextResponse.json({error:"Unauthorized"},{status:401});}}
export async function POST(req:NextRequest){try{const user=await requireRole(["ADMIN"]);return NextResponse.json(await prisma.staff.create({data:{...schema.parse(await req.json()),schoolId:user.schoolId}}),{status:201});}catch{return NextResponse.json({error:"Invalid or duplicate staff record"},{status:400});}}
