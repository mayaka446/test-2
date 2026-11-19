"use client";
import {useEffect,useState} from "react";
export default function ResultsClient(){
 const [exams,setExams]=useState<any[]>([]),[students,setStudents]=useState<any[]>([]),[subjects,setSubjects]=useState<any[]>([]),[selected,setSelected]=useState(""),[msg,setMsg]=useState("");
 async function load(){const [e,s,u]=await Promise.all([fetch("/api/examinations").then(x=>x.json()),fetch("/api/students").then(x=>x.json()),fetch("/api/subjects").then(x=>x.json())]);setExams(Array.isArray(e)?e:[]);setStudents(Array.isArray(s)?s:[]);setSubjects(Array.isArray(u)?u:[]);}
 useEffect(()=>{load()},[]);
 async function createExam(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const b=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...b,kind:"EXAM"})});setMsg(r.ok?"Examination created.":"Could not create examination.");if(r.ok){e.currentTarget.reset();load();}}
 async function mark(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const b=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});const d=await r.json();setMsg(r.ok?`Result saved. Grade: ${d.grade}`:(d.error||"Could not save result."));}
 return <div>
  <div className="two-col">
   <section className="panel"><h2>Create examination</h2><form onSubmit={createExam}><div className="form-grid">
    <div className="field"><label>Exam name</label><input name="name" required placeholder="End of Term Assessment"/></div><div className="field"><label>Curriculum</label><select name="curriculum"><option value="CBC">CBC</option><option value="CAMBRIDGE">Cambridge</option></select></div>
    <div className="field"><label>Grade / Year</label><input name="grade" required/></div><div className="field"><label>Term / Session</label><input name="term" required placeholder="Term 1"/></div>
    <div className="field"><label>Academic year</label><input name="academicYear" type="number" defaultValue={new Date().getFullYear()} required/></div><div className="field"><label>Maximum score</label><input name="maxScore" type="number" defaultValue="100" min="1"/></div>
   </div><div className="actions"><button className="btn">Create exam</button></div></form></section>
   <section className="panel"><h2>Record student result</h2><form onSubmit={mark}><div className="field"><label>Examination</label><select name="examinationId" required value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose exam</option>{exams.map(x=><option key={x.id} value={x.id}>{x.name} — {x.grade} ({x.curriculum})</option>)}</select></div>
    <div className="field"><label>Student</label><select name="studentId" required><option value="">Choose student</option>{students.map(x=><option key={x.id} value={x.id}>{x.admissionNo} — {x.firstName} {x.lastName}</option>)}</select></div>
    <div className="field"><label>Subject</label><select name="subjectId" required><option value="">Choose subject</option>{subjects.map(x=><option key={x.id} value={x.id}>{x.name} ({x.curriculum})</option>)}</select></div>
    <div className="field"><label>Score</label><input name="score" type="number" min="0" step="0.01" required/></div><div className="field"><label>Teacher comment (optional)</label><input name="teacherComment"/></div>
    <div className="actions"><button className="btn">Save result and calculate grade</button></div></form></section>
  </div>
  {msg&&<p className="sub">{msg}</p>}
  <div className="actions"><a className="btn secondary" href="/api/report-cards" target="_blank">Open report-card print view</a></div>
 </div>;
}
