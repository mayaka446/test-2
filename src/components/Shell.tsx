import Link from "next/link";
import { getSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, UserRound, BookOpen, ClipboardCheck, GraduationCap, FileText, Wallet, BarChart3, School, LogOut } from "lucide-react";

const nav = [
  { group: "OVERVIEW", links: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] },
  { group: "SCHOOL MANAGEMENT", links: [
    { label: "Students", path: "/students", icon: Users }, { label: "Staff", path: "/staff", icon: UserRound },
    { label: "Classes & subjects", path: "/academics", icon: School }, { label: "Attendance", path: "/attendance", icon: ClipboardCheck }
  ] },
  { group: "TEACHING & LEARNING", links: [
    { label: "Examinations & results", path: "/results", icon: GraduationCap }, { label: "Assignments", path: "/assignments", icon: BookOpen },
    { label: "Lesson notes", path: "/lesson-notes", icon: FileText }
  ] },
  { group: "FINANCE & INSIGHTS", links: [
    { label: "Fee collection", path: "/finance", icon: Wallet }, { label: "Reports", path: "/reports", icon: BarChart3 }
  ] }
];

export default async function Shell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const allowed = (path: string) => {
    if (session.role === "TEACHER") return !["/finance"].includes(path);
    if (session.role === "STUDENT") return ["/dashboard", "/results", "/assignments", "/lesson-notes", "/attendance"].includes(path);
    if (session.role === "BURSAR") return ["/dashboard", "/students", "/finance", "/reports"].includes(path);
    return true;
  };
  async function signOut() {
    "use server";
    await destroySession();
    redirect("/login");
  }
  return <div className="shell">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand-wrap"><span className="brand-mark">M</span><span><span className="brand">MAYAKAS</span><span className="brand-sub">SCHOOL MANAGEMENT</span></span></Link>
      <div className="school-chip"><span className="online-dot" /> SCHOOL OPERATIONS</div>
      <nav>{nav.map(section => {
        const links = section.links.filter(item => allowed(item.path));
        if (!links.length) return null;
        return <div key={section.group} className="nav-section"><div className="nav-label">{section.group}</div>
          {links.map(({ label, path, icon: Icon }) => <Link className="nav-link" href={path} key={path}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></Link>)}
        </div>;
      })}</nav>
      <div className="sidebar-footer"><div className="secure-note">Secure workspace<br/><span>Access is based on your role.</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="topbar-title"><span className="topbar-kicker">MAYAKAS MANAGEMENT SYSTEM</span><strong>School administration portal</strong></div>
        <div className="user-area"><div className="avatar">{session.name.slice(0, 1).toUpperCase()}</div><div className="user-meta"><strong>{session.name}</strong><span>{session.role.toLowerCase()}</span></div><form action={signOut}><button className="logout-btn" type="submit" aria-label="Sign out"><LogOut size={17}/><span>Sign out</span></button></form></div>
      </header>
      {children}
    </main>
  </div>;
}
