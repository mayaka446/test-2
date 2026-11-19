"use client";
import {useState} from "react";
export default function RegisterSchool(){
 const [form,setForm]=useState({schoolName:"",schoolSlug:"",adminName:"",email:"",password:"",phone:""});
 const [error,setError]=useState(""); const [success,setSuccess]=useState(""); const [busy,setBusy]=useState(false);
 function update(k:keyof typeof form,v:string){setForm(x=>({...x,[k]:v,...(k==="schoolName"&&!x.schoolSlug?{schoolSlug:v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}: {})}));}
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/schools/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Registration failed");setSuccess(d.message||"Application submitted for approval.");}catch(e:any){setError(e.message||"Unable to register school.");}finally{setBusy(false);}}
 return <main className="auth-page"><section className="auth-card"><div className="brand-mark">M</div><p className="eyebrow">MAYAKAS SCHOOL ERP</p><h1>Register your school</h1><p>Create a separate, private workspace for your school.</p><form onSubmit={submit} className="stack-form">
  <label>School name<input required value={form.schoolName} onChange={e=>update("schoolName",e.target.value)} placeholder="e.g. Mayakas Academy"/></label>
  <label>School code / web login ID<input required minLength={3} value={form.schoolSlug} onChange={e=>update("schoolSlug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="e.g. mayakas-academy"/><small>Use this code whenever you sign in.</small></label>
  <label>Administrator full name<input required value={form.adminName} onChange={e=>update("adminName",e.target.value)}/></label>
  <label>Administrator email<input required type="email" value={form.email} onChange={e=>update("email",e.target.value)}/></label>
  <label>Phone (optional)<input value={form.phone} onChange={e=>update("phone",e.target.value)}/></label>
  <label>Password (at least 10 characters)<input required minLength={10} type="password" value={form.password} onChange={e=>update("password",e.target.value)}/></label>
  {error&&<p className="form-error">{error}</p>}{success&&<div role="status" style={{background:"#ecfdf3",border:"1px solid #abefc6",color:"#067647",padding:14,borderRadius:10,fontSize:13}}><strong>Application received.</strong><br/>{success}<br/><br/>Your school will remain pending until it is approved. Please keep your school code: <strong>{form.schoolSlug}</strong>.</div>}<button className="btn" disabled={busy||!!success}>{busy?"Submitting application…":"Submit for approval"}</button>
 </form><p className="auth-foot">Already registered? <a href="/login">Sign in</a></p><p className="auth-foot">New school applications are reviewed by the platform administrator before access is granted.</p></section></main>
}
