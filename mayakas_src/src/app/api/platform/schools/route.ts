import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requirePlatformAdmin() {
  const session = await getSession();
  return session?.role === "SUPER_ADMIN" && session.schoolId === null ? session : null;
}

export async function GET() {
  const session = await requirePlatformAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const schools = await prisma.school.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, name: true, slug: true, email: true, phone: true, status: true,
      active: true, createdAt: true, reviewedAt: true, reviewNote: true,
      _count: { select: { users: true, students: true, staff: true } },
    },
  });
  return NextResponse.json({ schools });
}

const updateSchema = z.object({
  schoolId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "SUSPEND", "REACTIVATE"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requirePlatformAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = updateSchema.parse(await req.json());
    const current = await prisma.school.findUnique({ where: { id: body.schoolId } });
    if (!current) return NextResponse.json({ error: "School not found." }, { status: 404 });
    const data = body.action === "APPROVE"
      ? { status: "APPROVED" as const, active: true, reviewedAt: new Date(), reviewNote: body.note || null }
      : body.action === "REJECT"
      ? { status: "REJECTED" as const, active: false, reviewedAt: new Date(), reviewNote: body.note || null }
      : body.action === "SUSPEND"
      ? { status: "SUSPENDED" as const, active: false, reviewedAt: new Date(), reviewNote: body.note || null }
      : { status: "APPROVED" as const, active: true, reviewedAt: new Date(), reviewNote: body.note || null };
    const school = await prisma.school.update({ where: { id: body.schoolId }, data });
    return NextResponse.json({ ok: true, school: { id: school.id, name: school.name, status: school.status, active: school.active } });
  } catch {
    return NextResponse.json({ error: "Unable to update this school application." }, { status: 400 });
  }
}
