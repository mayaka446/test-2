import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  schoolName: z.string().min(2).max(120),
  schoolSlug: z.string().min(3).max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  adminName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(10),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const [existingSchool, existingUser] = await Promise.all([
      prisma.school.findUnique({ where: { slug: body.schoolSlug } }),
      prisma.user.findUnique({ where: { email: body.email } }),
    ]);
    if (existingSchool || existingUser) {
      return NextResponse.json({ error: existingSchool ? "School code is already in use." : "Email address is already registered." }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const school = await prisma.$transaction(async (tx) => {
      const created = await tx.school.create({ data: {
        name: body.schoolName, slug: body.schoolSlug, email: body.email, phone: body.phone,
        currency: "KES", status: "PENDING", active: false,
      } });
      await tx.user.create({ data: {
        name: body.adminName, email: body.email, passwordHash, role: "ADMIN",
        schoolId: created.id, active: true,
      } });
      return created;
    });
    return NextResponse.json({
      ok: true,
      message: "Your application has been submitted. You can sign in after the platform administrator approves your school.",
      school: { name: school.name, slug: school.slug, status: school.status },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the registration details." }, { status: 400 });
    return NextResponse.json({ error: "Unable to submit the school application. Please try again." }, { status: 400 });
  }
}
