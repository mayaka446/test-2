"use client";
import { useState } from "react";
export default function LoginForm(){
 const [schoolSlug,setSchoolSlug]=useState("mayakas"),[email,setEmail]=useState("admin@mayakas.school"),[password,setPassword]=useState("ChangeMe123!"),[error,setError]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setError("");const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schoolSlug,email,password})});const data=await r.json().catch(()=>({}));if(r.ok)location.href=data.redirectTo||"/dashboard";else setError(data.error||"Sign-in failed. Check your credentials.");}
 return <><form onSubmit={submit} style={{display:"grid",gap:13,marginTop:22}}>
  <div className="field"><label>School code</label><input value={schoolSlug} onChange={e=>setSchoolSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="e.g. mayakas (platform for platform owner)" required/><small>Platform administrator: enter <strong>platform</strong> as the school code.</small></div>
  <div className="field"><label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
  <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
  {error&&<p style={{color:"#b42318",fontSize:12}}>{error}</p>}<button className="btn" style={{padding:13}}>Sign in</button>
 </form>
  <p style={{fontSize:13,textAlign:"center",marginTop:16}}>New school? <a href="/register-school">Register your school</a></p></>;
}
