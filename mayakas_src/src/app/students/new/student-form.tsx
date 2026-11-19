"use client";
import {useState} from "react";
export default function StudentForm(){
 const [msg,setMsg]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const r=await fetch("/api/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const j=await r.json();if(r.ok){setMsg("Student registered successfully.");e.currentTarget.reset();}else setMsg(j.error||"Could not save student.");}
 return <form onSubmit={submit}><div className="form-grid">
 {[
 ["admissionNo","Admission number","text"],["firstName","First name","text"],["lastName","Last name","text"],["dateOfBirth","Date of birth","date"],["grade","Grade / Year","text"],["stream","Stream","text"],["guardianName","Parent / guardian name","text"],["guardianPhone","Guardian phone","tel"],["guardianEmail","Guardian email","email"]
 ].map(([n,l,t])=><div className="field" key={n}><label>{l}</label><input name={n} type={t} required={["admissionNo","firstName","lastName","grade"].includes(n)}/></div>)}
 <div className="field"><label>Curriculum</label><select name="curriculum"><option value="CBC">CBC</option><option value="CAMBRIDGE">Cambridge</option></select></div>
 </div><div className="actions"><button className="btn">Save student</button></div>{msg&&<p className="sub">{msg}</p>}</form>;
}
