"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Check, X, PauseCircle, RefreshCw, Building2, Mail, Phone, Users } from "lucide-react";

type School = { id: string; name: string; slug: string; email: string | null; phone: string | null; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"; active: boolean; createdAt: string; reviewedAt: string | null; reviewNote: string | null; _count: { users: number; students: number; staff: number } };
const statusStyle: Record<string, { bg: string; color: string }> = { PENDING: { bg: "#fff4e5", color: "#b54708" }, APPROVED: { bg: "#ecfdf3", color: "#067647" }, REJECTED: { bg: "#fef3f2", color: "#b42318" }, SUSPENDED: { bg: "#f2f4f7", color: "#475467" } };
export default function SchoolApprovals() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  async function load() { setLoading(true); setError(""); try { const r = await fetch("/api/platform/schools", { cache: "no-store" }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not load schools."); setSchools(d.schools); } catch (e: any) { setError(e.message || "Could not load schools."); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function act(school: School, action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE") {
    const labels = { APPROVE: "approve", REJECT: "reject", SUSPEND: "suspend", REACTIVATE: "reactivate" };
    if (!window.confirm(`Are you sure you want to ${labels[action]} ${school.name}?`)) return;
    setBusy(school.id); setError("");
    try { const r = await fetch("/api/platform/schools", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schoolId: school.id, action }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || "Action failed."); await load(); }
    catch (e: any) { setError(e.message || "Action failed."); } finally { setBusy(null); }
  }
  const visible = schools.filter(s => filter === "ALL" || s.status === filter);
  return <section style={{ background: "white", border: "1px solid #e5eaf2", borderRadius: 16, overflow: "hidden" }}>
    <div style={{ padding: 20, borderBottom: "1px solid #edf0f5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><h2 style={{ margin: 0, fontSize: 18 }}>Registered schools</h2><p style={{ color: "#667085", fontSize: 13, margin: "5px 0 0" }}>Approve, reject or suspend access to a school workspace.</p></div><div style={{ display: "flex", gap: 8 }}><select value={filter} onChange={e => setFilter(e.target.value)} style={{ border: "1px solid #d0d5dd", borderRadius: 8, padding: "9px 10px", background: "white" }}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="SUSPENDED">Suspended</option></select><button onClick={load} style={{ border: "1px solid #d0d5dd", borderRadius: 8, padding: "8px 11px", background: "white", cursor: "pointer" }} aria-label="Refresh"><RefreshCw size={16}/></button></div></div>
    {error && <p role="alert" style={{ margin: 16, padding: 12, color: "#b42318", background: "#fef3f2", borderRadius: 8 }}>{error}</p>}
    {loading ? <p style={{ padding: 24, color: "#667085" }}>Loading school applications…</p> : visible.length === 0 ? <p style={{ padding: 24, color: "#667085" }}>No schools found for this status.</p> : <div style={{ display: "grid", gap: 0 }}>{visible.map(s => <article key={s.id} style={{ padding: 20, borderTop: "1px solid #edf0f5", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "center" }}>
      <div><div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}><h3 style={{ margin: 0, fontSize: 16 }}>{s.name}</h3><span style={{ background: statusStyle[s.status].bg, color: statusStyle[s.status].color, borderRadius: 99, padding: "4px 9px", fontSize: 11, fontWeight: 700 }}>{s.status}</span></div>
        <p style={{ color: "#667085", fontSize: 12, margin: "7px 0 10px" }}>School code: <strong style={{ color: "#344054" }}>{s.slug}</strong> · Applied {new Date(s.createdAt).toLocaleDateString()}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", color: "#667085", fontSize: 12 }}><span><Mail size={13} style={{ verticalAlign: "-2px" }}/> {s.email || "No email"}</span><span><Phone size={13} style={{ verticalAlign: "-2px" }}/> {s.phone || "No phone"}</span><span><Users size={13} style={{ verticalAlign: "-2px" }}/> {s._count.students} learners · {s._count.staff} staff · {s._count.users} users</span></div>
        {s.reviewNote && <p style={{ margin: "9px 0 0", color: "#667085", fontSize: 12 }}>Review note: {s.reviewNote}</p>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "flex-end" }}>
        {s.status === "PENDING" && <><button disabled={busy === s.id} onClick={() => act(s, "APPROVE")} style={button("#067647")}><Check size={14}/> Approve</button><button disabled={busy === s.id} onClick={() => act(s, "REJECT")} style={button("#b42318")}><X size={14}/> Reject</button></>}
        {s.status === "APPROVED" && <button disabled={busy === s.id} onClick={() => act(s, "SUSPEND")} style={button("#475467")}><PauseCircle size={14}/> Suspend</button>}
        {(s.status === "SUSPENDED" || s.status === "REJECTED") && <button disabled={busy === s.id} onClick={() => act(s, "REACTIVATE")} style={button("#067647")}><Check size={14}/> Reactivate</button>}
      </div>
    </article>)}</div>}
  </section>;
}
function button(color: string): CSSProperties { return { display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${color}`, color, background: "white", borderRadius: 8, padding: "8px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }; }
