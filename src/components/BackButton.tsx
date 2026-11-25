"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
export default function BackButton(){
 const path=usePathname();
 if(!path||path==="/dashboard")return null;
 return <div style={{padding:"12px 0 0"}}><Link className="btn" href="/dashboard">← Back to dashboard</Link></div>;
}
