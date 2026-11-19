import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

const cookieName = "mayakas_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "development-only-change-this-secret-now");

export type SessionUser = { id: string; role: Role; name: string; schoolId: string | null; schoolSlug: string | null };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ role: user.role, name: user.name, schoolId: user.schoolId, schoolSlug: user.schoolSlug })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("8h").sign(secret);
  (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.sub), role: payload.role as Role, name: String(payload.name), schoolId: payload.schoolId ? String(payload.schoolId) : null, schoolSlug: payload.schoolSlug ? String(payload.schoolSlug) : null };
  } catch { return null; }
}

export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role) || !session.schoolId) throw new Error("UNAUTHORIZED");
  return session as SessionUser & { schoolId: string };
}

export async function destroySession() { (await cookies()).delete(cookieName); }
