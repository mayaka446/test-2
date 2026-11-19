"use client";
import {useEffect,useState} from "react";
type Row={id:string,name:string,number:string,status:string,remarks:string};
export default function AttendanceClient(){
 const [type,setType]=useState("STUDENT"),[date,setDate]=useState(new Date().toISOString().slice(0,10)),[rows,setRows]=useState<Row[]>([]),[msg,setMsg]=useState(""),[loading,setLoading]=useState(false);
 async function load(){setLoading(true);const r=await fetch(`/api/attendance?type=${type}&date=${date}`);const d=await r.json();setRows(Array.isArray(d)?d:[]);setLoading(false);}
 useEffect(()=>{load()},[type,date]);
 function update(id:string,status:string){setRows(old=>old.map(x=>x.id===id?{...x,status}:x));}
 async function save(){setMsg("");const r=await fetch("/api/attendance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,date,records:rows.map(x=>({id:x.id,status:x.status==="UNMARKED"?"PRESENT":x.status,remarks:x.remarks}))})});const d=await r.json();setMsg(r.ok?`${d.saved} attendance records saved.`:(d.error||"Save failed."));}
 return <div>
  <div className="form-grid" style={{marginBottom:18}}>
   <div className="field"><label>Register type</label><select value={type} onChange={e=>setType(e.target.value)}><option value="STUDENT">Students</option><option value="STAFF">Staff</option></select></div>
   <div className="field"><label>Attendance date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
  </div>
  <div className="actions"><button className="btn secondary" onClick={()=>setRows(old=>old.map(x=>({...x,status:"PRESENT"})))}>Mark all present</button><button className="btn" onClick={save}>Save register</button></div>
  {msg&&<p className="sub">{msg}</p>}
  {loading?<p className="sub">Loading register…</p>:<table className="table"><thead><tr><th>Admission / Staff no.</th><th>Name</th><th>Status</th></tr></thead><tbody>
   {rows.map(x=><tr key={x.id}><td>{x.number}</td><td>{x.name}</td><td><select value={x.status} onChange={e=>update(x.id,e.target.value)}><option value="UNMARKED">Unmarked (defaults present)</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option><option value="EXCUSED">Excused</option></select></td></tr>)}
   {!rows.length&&<tr><td colSpan={3}>No records found. Add students or staff first.</td></tr>}
  </tbody></table>}
 </div>;
}
