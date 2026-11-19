import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import ResultsClient from "./results-client";
export default async function Results(){const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);return <Shell><div className="content"><div className="eyebrow">ACADEMICS</div><h1>Examinations & results</h1><p className="sub">Curriculum-aware assessments and student performance records.</p>{user.role==="STUDENT"?<div className="panel"><p className="sub">Your report card is available below. Your student account must be linked to your admission profile.</p><a className="btn" href="/api/report-cards" target="_blank">Print my report card</a><p className="sub">Your recorded grades are included in the printable report.</p></div>:<ResultsClient/>}</div></Shell>}
