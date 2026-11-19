import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogOut, ShieldCheck, School, Clock3, CheckCircle2, XCircle } from "lucide-react";
import SchoolApprovals from "./school-approvals";

export const dynamic = "force-dynamic";

export default async function PlatformSchoolsPage() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN" || session.schoolId !== null) redirect("/login");
  const [pending, approved, rejected, total] = await Promise.all([
    prisma.school.count({ where: { status: "PENDING" } }),
    prisma.school.count({ where: { status: "APPROVED" } }),
    prisma.school.count({ where: { status: { in: ["REJECTED", "SUSPENDED"] } } }),
    prisma.school.count(),
  ]);
  async function signOut() {
    "use server";
    await destroySession();
    redirect("/login");
  }
  return <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#172033" }}>
    <header style={{ background: "#101c35", color: "white", padding: "20px clamp(20px,5vw,64px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}><span style={{ width: 42, height: 42, borderRadius: 12, background: "#3156a6", display: "grid", placeItems: "center", fontWeight: 800 }}>M</span><div><div style={{ fontSize: 11, letterSpacing: 2, opacity: .7 }}>MAYAKAS ERP</div><strong style={{ fontSize: 18 }}>Platform control centre</strong></div></div>
      <form action={signOut}><button style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #53617a", color: "white", background: "transparent", padding: "10px 14px", borderRadius: 9, cursor: "pointer" }}><LogOut size={16}/> Sign out</button></form>
    </header>
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "34px 22px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#3156a6", fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}><ShieldCheck size={17}/> SUPER ADMINISTRATOR</div>
      <h1 style={{ fontSize: 32, margin: "10px 0 6px" }}>School applications</h1>
      <p style={{ color: "#65718a", margin: "0 0 26px" }}>Review applications before granting schools access to their private workspaces.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 28 }}>
        {[["Total schools", total, School], ["Awaiting review", pending, Clock3], ["Approved", approved, CheckCircle2], ["Rejected / suspended", rejected, XCircle]].map(([label, value, Icon]: any) => <section key={label} style={{ background: "white", padding: 20, border: "1px solid #e5eaf2", borderRadius: 14 }}><div style={{ color: "#667085", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}><Icon size={16}/>{label}</div><strong style={{ display: "block", fontSize: 30, marginTop: 8 }}>{value}</strong></section>)}
      </div>
      <SchoolApprovals />
    </div>
  </main>;
}
