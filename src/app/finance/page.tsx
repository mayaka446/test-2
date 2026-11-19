import Shell from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
export const dynamic="force-dynamic";
export default async function Finance(){
 await requireRole(["ADMIN","BURSAR"]);
 const [payments,students]=await Promise.all([prisma.payment.findMany({include:{student:true},orderBy:{paidAt:"desc"},take:100}).catch(()=>[]),prisma.student.count().catch(()=>0)]);
 const total=payments.reduce((s,p)=>s+Number(p.amount),0);
 return <Shell><div className="content"><div className="eyebrow">SCHOOL FINANCE</div><h1>Fee collection</h1><p className="sub">Payment ledger, receipts and fee reconciliation.</p>
 <div className="grid"><div className="stat"><div className="stat-label">Recorded collections</div><div className="stat-value">KES {total.toLocaleString("en-KE")}</div></div><div className="stat"><div className="stat-label">Registered students</div><div className="stat-value">{students}</div></div><div className="stat"><div className="stat-label">Transactions</div><div className="stat-value">{payments.length}</div></div><div className="stat"><div className="stat-label">Reporting currency</div><div className="stat-value">KES</div></div></div>
 <div className="actions"><a className="btn" href="/finance/new">+ Record payment</a><a className="btn secondary" href="/finance/fees">Fee structures & balances</a><a className="btn secondary" href="/reports">View reports</a></div>
 <div className="panel"><h2>Recent transactions</h2><table className="table"><thead><tr><th>Receipt</th><th>Student</th><th>Admission</th><th>Method</th><th>Date</th><th>Amount</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>{p.receiptNo}</td><td>{p.student.firstName} {p.student.lastName}</td><td>{p.student.admissionNo}</td><td>{p.method}</td><td>{p.paidAt.toLocaleDateString()}</td><td>KES {Number(p.amount).toLocaleString()}</td></tr>)}{!payments.length&&<tr><td colSpan={6}>No payments recorded yet.</td></tr>}</tbody></table></div>
 </div></Shell>;
}
