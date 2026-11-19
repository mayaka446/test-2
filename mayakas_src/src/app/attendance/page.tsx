import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import AttendanceClient from "./attendance-client";
export default async function Attendance(){await requireRole(["ADMIN","TEACHER"]);return <Shell><div className="content"><div className="eyebrow">DAILY REGISTERS</div><h1>Attendance management</h1><p className="sub">Mark and save daily attendance for students and staff.</p><div className="panel"><AttendanceClient/></div></div></Shell>}
