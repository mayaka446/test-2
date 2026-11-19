import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import AcademicsClient from "./academics-client";
export default async function Academics(){await requireRole(["ADMIN","TEACHER"]);return <Shell><div className="content"><div className="eyebrow">ACADEMIC STRUCTURE</div><h1>Classes & subjects</h1><p className="sub">Create distinct class structures and subject catalogues for CBC and Cambridge.</p><AcademicsClient/></div></Shell>}
