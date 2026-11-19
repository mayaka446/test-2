import { PrismaClient, Role, Curriculum } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma=new PrismaClient();
async function main(){
 const school=await prisma.school.upsert({where:{slug:"mayakas"},update:{active:true,status:"APPROVED"},create:{name:"Mayakas Demo School",slug:"mayakas",email:"admin@mayakas.school",currency:"KES",active:true,status:"APPROVED"}});
 const passwordHash=await bcrypt.hash("ChangeMe123!",12);
 const accounts=[
  {name:"System Administrator",email:"admin@mayakas.school",role:Role.ADMIN},
  {name:"Demo Teacher",email:"teacher@mayakas.school",role:Role.TEACHER},
  {name:"Demo Student",email:"student@mayakas.school",role:Role.STUDENT},
  {name:"Demo Bursar",email:"bursar@mayakas.school",role:Role.BURSAR}
 ];
 for(const a of accounts){
  const existing=await prisma.user.findUnique({where:{email:a.email}});
  if(existing) await prisma.user.update({where:{id:existing.id},data:{schoolId:school.id}});
  else await prisma.user.create({data:{...a,passwordHash,schoolId:school.id}});
 }
 for(const subject of [{code:"MATH-CBC",name:"Mathematics",curriculum:Curriculum.CBC},{code:"ENG-CAM",name:"English Language",curriculum:Curriculum.CAMBRIDGE}]){
  const existing=await prisma.subject.findUnique({where:{code:subject.code}});
  if(!existing) await prisma.subject.create({data:{...subject,schoolId:school.id}});
 }
 const platformEmail = process.env.SUPER_ADMIN_EMAIL;
 const platformPassword = process.env.SUPER_ADMIN_PASSWORD;
 if (platformEmail && platformPassword) {
  const platformHash = await bcrypt.hash(platformPassword, 12);
  await prisma.user.upsert({
   where: { email: platformEmail },
   update: { name: "Platform Owner", role: Role.SUPER_ADMIN, schoolId: null, passwordHash: platformHash, active: true },
   create: { name: "Platform Owner", email: platformEmail, role: Role.SUPER_ADMIN, schoolId: null, passwordHash: platformHash },
  });
  console.log(`Platform administrator provisioned: ${platformEmail}`);
 } else {
  console.log("Platform administrator not created. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD before running the seed script.");
 }
 console.log("Seed complete. School code: mayakas. Demo password: ChangeMe123!");
}
main().finally(()=>prisma.$disconnect());
