"use client";
import {useEffect,useState} from "react";
export default function NotesClient({readOnly=false}:{readOnly?:boolean}){
 const [items,setItems]=useState<any[]>([]),[subjects,setSubjects]=useState<any[]>([]),[msg,setMsg]=useState("");
 async function load(){const [n,s]=await Promise.all([fetch("/api/lesson-notes").then(r=>r.json()),fetch("/api/subjects").then(r=>r.json())]);setItems(Array.isArray(n)?n:[]);setSubjects(Array.isArray(s)?s:[]);}
 useEffect(()=>{load()},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const b=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/lesson-notes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});setMsg(r.ok?"Lesson note added.":"Could not save lesson note.");if(r.ok){e.currentTarget.reset();load();}}
 return <>{!readOnly&&<div className="panel" style={{marginBottom:16}}><h2>Add lesson note / resource</h2><form onSubmit={submit}><div className="form-grid">
 <div className="field"><label>Title</label><input name="title" required/></div><div className="field"><label>Subject</label><select name="subjectId" required><option value="">Choose subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name} ({s.curriculum})</option>)}</select></div>
 <div className="field"><label>Grade / Year</label><input name="grade" required/></div><div className="field"><label>Curriculum</label><select name="curriculum"><option value="CBC">CBC</option><option value="CAMBRIDGE">Cambridge</option></select></div>
 <div className="field"><label>File URL</label><input name="fileUrl" type="url" placeholder="https://..." required/></div><div className="field"><label>Description</label><input name="description"/></div>
 </div><div className="actions"><button className="btn">Save resource</button></div>{msg&&<p className="sub">{msg}</p>}</form><p className="sub">This release stores secure resource URLs. Connect private cloud file storage before using real learner documents.</p></div>}
 <div className="panel"><h2>Available lesson notes</h2><table className="table"><thead><tr><th>Title</th><th>Subject</th><th>Grade</th><th>Curriculum</th><th>Resource</th></tr></thead><tbody>{items.map(n=><tr key={n.id}><td>{n.title}</td><td>{n.subject?.name}</td><td>{n.grade}</td><td>{n.curriculum}</td><td><a href={n.fileUrl} target="_blank" rel="noreferrer">Open resource ↗</a></td></tr>)}{!items.length&&<tr><td colSpan={5}>No resources yet.</td></tr>}</tbody></table></div></>;
}
