"use client";
import {useEffect,useState} from "react";
import {readPhotoFile} from "@/lib/photo";
export default function StaffClient(){
 const [rows,setRows]=useState<any[]>([]),[msg,setMsg]=useState("");
 async function load(){const r=await fetch("/api/staff");const d=await r.json();setRows(Array.isArray(d)?d:[]);if(!r.ok)setMsg(d.error||"Could not load staff.");}
 useEffect(()=>{load()},[]);
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget;
  const data:Record<string,any>=Object.fromEntries(new FormData(form));
  const file=data.photo as File|undefined;
  delete data.photo;
  if(file&&file.size>0){try{data.photoUrl=await readPhotoFile(file);}catch(err:any){setMsg(err.message);return;}}
  const r=await fetch("/api/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  const j=await r.json().catch(()=>({}));
  setMsg(r.ok?"Staff member registered.":j.error||"Could not register staff member.");
  if(r.ok){form.reset();load();}
 }
 return <><div className="panel" style={{marginBottom:16}}><h2>Register staff member</h2><form onSubmit={save}><div className="form-grid">{[["employeeNo","Employee number"],["name","Full name"],["email","Email"],["phone","Phone"],["department","Department"],["jobTitle","Job title"]].map(([n,l])=><div className="field" key={n}><label>{l}</label><input name={n} required={["employeeNo","name","email","jobTitle"].includes(n)}/></div>)}<div className="field"><label>Photo</label><input name="photo" type="file" accept="image/png,image/jpeg,image/webp"/></div></div><div className="actions"><button className="btn">Save staff record</button></div>{msg&&<p className="sub">{msg}</p>}</form></div><div className="panel"><h2>Staff directory</h2><table className="table"><thead><tr><th>Photo</th><th>Employee no.</th><th>Name</th><th>Job title</th><th>Department</th><th>Email</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.photoUrl?<img src={x.photoUrl} alt={x.name} width={40} height={40} style={{borderRadius:"50%",objectFit:"cover"}}/>:"—"}</td><td>{x.employeeNo}</td><td>{x.name}</td><td>{x.jobTitle}</td><td>{x.department||"—"}</td><td>{x.email}</td></tr>)}</tbody></table></div></>;
}
