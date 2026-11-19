"use client";
import {useEffect,useState} from "react";
export default function StaffClient(){
 const [rows,setRows]=useState<any[]>([]),[msg,setMsg]=useState("");
 async function load(){const r=await fetch("/api/staff");setRows(await r.json());}
 useEffect(()=>{load()},[]);
 async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const b=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});setMsg(r.ok?"Staff member registered.":"Could not register staff member.");if(r.ok){e.currentTarget.reset();load();}}
 return <><div className="panel" style={{marginBottom:16}}><h2>Register staff member</h2><form onSubmit={save}><div className="form-grid">{[["employeeNo","Employee number"],["name","Full name"],["email","Email"],["phone","Phone"],["department","Department"],["jobTitle","Job title"]].map(([n,l])=><div className="field" key={n}><label>{l}</label><input name={n} required={["employeeNo","name","email","jobTitle"].includes(n)}/></div>)}</div><div className="actions"><button className="btn">Save staff record</button></div>{msg&&<p className="sub">{msg}</p>}</form></div><div className="panel"><h2>Staff directory</h2><table className="table"><thead><tr><th>Employee no.</th><th>Name</th><th>Job title</th><th>Department</th><th>Email</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.employeeNo}</td><td>{x.name}</td><td>{x.jobTitle}</td><td>{x.department||"—"}</td><td>{x.email}</td></tr>)}</tbody></table></div></>;
}
