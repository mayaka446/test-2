import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import AssignmentClient from "./assignment-client";
export default async function Assignments(){const user=await requireRole(["ADMIN","TEACHER","STUDENT"]);return <Shell><div className="content"><div className="eyebrow">LEARNING</div><h1>Homework & assignments</h1><p className="sub">Publish curriculum-specific tasks, submit work and mark assignments.</p><AssignmentClient role={user.role}/></div></Shell>}
