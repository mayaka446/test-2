import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import NotesClient from "./notes-client";
export default async function LessonNotes(){const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);return <Shell><div className="content"><div className="eyebrow">LEARNING RESOURCES</div><h1>Lesson notes</h1><p className="sub">Teaching and learning materials organised by curriculum, grade and subject.</p>{user.role==="STUDENT"?<div className="panel"><p className="sub">Your school resources are listed below. Access is read-only for student accounts.</p><NotesClient readOnly/></div>:<NotesClient/>}</div></Shell>}
