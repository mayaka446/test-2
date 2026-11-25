import Shell from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const money = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div style={{ margin: "14px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>{label}</span>
        <strong>{value} of {total} ({pct}%)</strong>
      </div>
      <div style={{ height: 14, background: "#eef1f5", borderRadius: 8, overflow: "hidden", marginTop: 6 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

export default async function Dashboard() {
  const session = await getSession();
  if (session?.role === "SUPER_ADMIN") redirect("/platform/schools");
  if (!session?.schoolId) redirect("/login");
  const schoolId = session.schoolId;

  const now = new Date();
  const startToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endToday = new Date(startToday.getTime() + 86400000);
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [activeStudents, staffTotal, studentsPresent, staffPresent, recentPayments, totalPaid, assignments] = await Promise.all([
    prisma.student.count({ where: { schoolId, active: true } }).catch(() => 0),
    prisma.staff.count({ where: { schoolId } }).catch(() => 0),
    prisma.studentAttendance.count({ where: { schoolId, status: "PRESENT", date: { gte: startToday, lt: endToday } } }).catch(() => 0),
    prisma.staffAttendance.count({ where: { schoolId, status: "PRESENT", date: { gte: startToday, lt: endToday } } }).catch(() => 0),
    prisma.payment.findMany({ where: { schoolId, paidAt: { gte: sixMonthsAgo } }, select: { amount: true, paidAt: true } }).catch(() => []),
    prisma.payment.aggregate({ where: { schoolId }, _sum: { amount: true } }).catch(() => ({ _sum: { amount: null } })),
    prisma.assignment.count({ where: { schoolId } }).catch(() => 0),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1));
    return { key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: MONTHS[d.getUTCMonth()], total: 0 };
  });
  for (const p of recentPayments as { amount: any; paidAt: Date }[]) {
    const d = new Date(p.paidAt);
    const bucket = months.find((m) => m.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (bucket) bucket.total += Number(p.amount);
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const collected = Number(totalPaid._sum.amount || 0);

  return (
    <Shell>
      <div className="content">
        <div className="eyebrow">SCHOOL OVERVIEW</div>
        <h1>Good day, {session?.name?.split(" ")[0] || "there"}</h1>
        <p className="sub">Here is the current snapshot of your school operations.</p>

        <div className="grid">
          <div className="stat"><div className="stat-label">Active students</div><div className="stat-value">{activeStudents}</div><div className="stat-foot">Across CBC and Cambridge</div></div>
          <div className="stat"><div className="stat-label">Staff members</div><div className="stat-value">{staffTotal}</div><div className="stat-foot">Teaching and support staff</div></div>
          <div className="stat"><div className="stat-label">Fees received</div><div className="stat-value">{money(collected)}</div><div className="stat-foot">All recorded payments</div></div>
          <div className="stat"><div className="stat-label">Assignments</div><div className="stat-value">{assignments}</div><div className="stat-foot">Created learning tasks</div></div>
        </div>

        <div className="two-col">
          <section className="panel">
            <h2>Today&apos;s attendance</h2>
            <p className="sub">Based on attendance marked for today.</p>
            <Bar label="Students present" value={studentsPresent} total={activeStudents} color="#2563eb" />
            <Bar label="Staff present" value={staffPresent} total={staffTotal} color="#16a34a" />
          </section>
          <section className="panel">
            <h2>Fees collected, last 6 months</h2>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 220, marginTop: 10 }}>
              {months.map((m) => (
                <div key={m.key} style={{ flex: 1, textAlign: "center" }}>
                  <div title={money(m.total)} style={{ height: 180, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: `${(m.total / maxMonth) * 100}%`, minHeight: m.total ? 4 : 0, background: "#2563eb", borderRadius: "6px 6px 0 0" }} />
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: "#5b6b7f" }}>{m.total ? money(m.total) : "—"}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="two-col">
          <section className="panel">
            <h2>Management workspace</h2>
            <div className="cards">
              {[["Student records","Admissions, profiles, guardians and enrolment"],["Attendance","Daily student and staff registers"],["Academic results","Assessments, grading and report cards"],["Finance","Fee structures, receipts and expenditure"],["Learning resources","Homework, submissions and lesson notes"],["Reports","Academic and financial summaries"]].map(([a,b]) => (
                <div className="module" key={a}><strong>{a}</strong><span>{b}</span></div>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>System setup checklist</h2>
            {["Confirm school profile and academic calendar","Create CBC and Cambridge classes","Add learning areas and subjects","Register students and guardians","Create fee structures for each term","Assign staff roles and class responsibilities"].map((x, i) => (
              <p key={x} style={{ fontSize: 12, padding: "9px 0", borderBottom: "1px solid #eef1f5" }}><span className="pill">{i + 1}</span> &nbsp;{x}</p>
            ))}
          </section>
        </div>
      </div>
    </Shell>
  );
}
