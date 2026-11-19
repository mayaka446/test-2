import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
const schema = z.object({ schoolSlug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/), email: z.string().email(), password: z.string().min(1) });
export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    if (body.schoolSlug === "platform") {
      const user = await prisma.user.findFirst({ where: { email: body.email, schoolId: null, role: "SUPER_ADMIN", active: true } });
      if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return NextResponse.json({ error: "Invalid platform administrator credentials." }, { status: 401 });
      await createSession({ id: user.id, role: user.role, name: user.name, schoolId: null, schoolSlug: null });
      return NextResponse.json({ ok: true, redirectTo: "/platform/schools" });
    }
    const school = await prisma.school.findUnique({ where: { slug: body.schoolSlug } });
    if (!school) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    if (school.status === "PENDING") return NextResponse.json({ error: "Your school application is awaiting platform administrator approval." }, { status: 403 });
    if (school.status === "REJECTED") return NextResponse.json({ error: "This school application was not approved. Contact platform support." }, { status: 403 });
    if (school.status === "SUSPENDED" || !school.active) return NextResponse.json({ error: "This school workspace is currently suspended. Contact platform support." }, { status: 403 });
    if (school.status !== "APPROVED") return NextResponse.json({ error: "This school is not approved for access." }, { status: 403 });
    const user = await prisma.user.findFirst({ where: { email: body.email, schoolId: school.id } });
    if (!user || !user.active || !(await bcrypt.compare(body.password, user.passwordHash))) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    await createSession({ id: user.id, role: user.role, name: user.name, schoolId: school.id, schoolSlug: school.slug });
    return NextResponse.json({ ok: true, school: { name: school.name, slug: school.slug } });
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
}
