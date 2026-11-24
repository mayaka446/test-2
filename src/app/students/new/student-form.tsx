"use client";
import {useState} from "react";
import {readPhotoFile} from "@/lib/photo";
import CurriculumGradeFields from "@/components/CurriculumGradeFields";
export default function StudentForm(){
 const [msg,setMsg]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget;
  const data:Record<string,any>=Object.fromEntries(new FormData(form));
  const file=data.photo as File|undefined;
  delete data.photo;
  if(file&&file.size>0){try{data.photoUrl=await readPhotoFile(file);}catch(err:any){setMsg(err.message);return;}}
  const r=await fetch("/api/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  const j=await r.json();
  if(r.ok){setMsg(`Student registered successfully. Admission number: ${j.admissionNo}`);form.reset();}
  else setMsg(j.error||"Could not save student.");
 }
 return <form onSubmit={submit}><div className="form-grid">
 <p className="sub">The admission number is assigned automatically when the student is saved.</p>
 {
 [
 ["firstName","First name","text"],["lastName","Last name","text"],["dateOfBirth","Date of birth","date"],["stream","Stream","text"],["guardianName","Parent / guardian name","text"],["guardianPhone","Guardian phone","tel"],["guardianEmail","Guardian email","email"]
 ].map(([n,l,t])=><div className="field" key={n}><label>{l}</label><input name={n} type={t} required={["firstName","lastName"].includes(n)}/></div>)
 }
 <CurriculumGradeFields/>
 <div className="field"><label>Photo</label><input name="photo" type="file" accept="image/*"/></div>
 </div><div className="actions"><button className="btn">Save student</button></div>{msg&&<p className="sub">{msg}</p>}</form>;
}
