"use client";
import {useEffect,useState} from "react";
import CurriculumGradeFields from "@/components/CurriculumGradeFields";

const TERMS=["Term 1","Term 2","Term 3","Full year"];

export default function FeesClient(){
 const [fees,setFees]=useState<any[]>([]),[report,setReport]=useState<any>(null),[msg,setMsg]=useState(""),[editing,setEditing]=useState<any>(null),[formKey,setFormKey]=useState(0);
 async function load(){const [f,r]=await Promise.all([fetch("/api/fee-structures").then(x=>x.json()),fetch("/api/finance-report").then(x=>x.json())]);setFees(Array.isArray(f)?f:[]);setReport(r.totals?r:null);}
 useEffect(()=>{load()},[]);

 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const b=Object.fromEntries(new FormData(e.currentTarget));
  const url=editing?`/api/fee-structures/${editing.id}`:"/api/fee-structures";
  const r=await fetch(url,{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});
  const j=await r.json().catch(()=>({}));
  if(r.ok){setMsg(editing?"Fee structure updated.":"Fee structure saved.");setEditing(null);setFormKey(k=>k+1);load();}
  else setMsg(j.error||"Could not save fee structure.");
 }

 async function remove(f:any){
  if(!confirm(`Delete "${f.name}" for ${f.grade}? This cannot be undone.`))return;
  const r=await fetch(`/api/fee-structures/${f.id}`,{method:"DELETE"});
  const j=await r.json().catch(()=>({}));
  setMsg(r.ok?"Fee structure deleted.":j.error||"Could not delete.");
  if(editing?.id===f.id){setEditing(null);setFormKey(k=>k+1);}
  load();
 }

 function startEdit(f:any){setEditing(f);setMsg("");setFormKey(k=>k+1);window.scrollTo({top:0,behavior:"smooth"});}
 function cancelEdit(){setEditing(null);setMsg("");setFormKey(k=>k+1);}

 return <>
  <div className="two-col">
   <div className="panel">
    <h2>{editing?"Edit fee structure":"Add fee structure"}</h2>
    <form key={formKey} onSubmit={save}><div className="form-grid">
     <div className="field"><label>Description</label><input name="name" required placeholder="Tuition and activity fee" defaultValue={editing?.name||""}/></div>
     <CurriculumGradeFields curriculum={editing?.curriculum} grade={editing?.grade}/>
     <div className="field"><label>Academic year</label><input name="academicYear" type="number" defaultValue={editing?.academicYear||new Date().getFullYear()} required/></div>
     <div className="field"><label>Term / Session</label><select name="term" required defaultValue={editing?.term||""}><option value="" disabled>Select term</option>{TERMS.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
     <div className="field"><label>Amount (KES)</label><input name="amount" type="number" min="0.01" step="0.01" required defaultValue={editing?Number(editing.amount):""}/></div>
    </div>
    <div className="actions">
     <button className="btn">{editing?"Save changes":"Save fee structure"}</button>
     {editing&&<button type="button" className="btn secondary" onClick={cancelEdit}>Cancel</button>}
    </div>
    {msg&&<p className="sub">{msg}</p>}
    </form>
   </div>
   <div className="panel"><h2>Fee position</h2>{report&&<><p>Expected: <b>KES {report.totals.feesDue.toLocaleString()}</b></p><p>Collected: <b>KES {report.totals.paid.toLocaleString()}</b></p><p>Outstanding: <b>KES {report.totals.balance.toLocaleString()}</b></p></>}<a className="btn secondary" href="/api/finance-report" target="_blank">Open balance data</a></div>
  </div>

  <div className="panel" style={{marginTop:16}}><h2>Fee structures</h2><table className="table"><thead><tr><th>Description</th><th>Curriculum</th><th>Grade</th><th>Year</th><th>Term</th><th>Amount</th><th>Actions</th></tr></thead><tbody>
   {fees.map(f=><tr key={f.id}><td>{f.name}</td><td>{f.curriculum}</td><td>{f.grade}</td><td>{f.academicYear}</td><td>{f.term}</td><td>KES {Number(f.amount).toLocaleString()}</td>
    <td><button type="button" className="btn secondary" onClick={()=>startEdit(f)}>✏️ Edit</button>{" "}<button type="button" className="btn secondary" onClick={()=>remove(f)}>Delete</button></td></tr>)}
   {!fees.length&&<tr><td colSpan={7}>No fee structures yet.</td></tr>}
   </tbody></table></div>

  <div className="panel" style={{marginTop:16}}><h2>Student fee balances</h2><table className="table"><thead><tr><th>Admission</th><th>Student</th><th>Curriculum</th><th>Grade</th><th>Due</th><th>Paid</th><th>Balance</th></tr></thead><tbody>{report?.students?.map((s:any)=><tr key={s.admissionNo}><td>{s.admissionNo}</td><td>{s.name}</td><td>{s.curriculum}</td><td>{s.grade}</td><td>{s.feesDue.toLocaleString()}</td><td>{s.paid.toLocaleString()}</td><td>{s.balance.toLocaleString()}</td></tr>)}</tbody></table></div>
 </>;
}
