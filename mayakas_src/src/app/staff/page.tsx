import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import StaffClient from "./staff-client";
export default async function Staff(){await requireRole(["ADMIN"]);return <Shell><div className="content"><div className="eyebrow">HUMAN RESOURCES</div><h1>Staff directory</h1><p className="sub">Register and manage teaching and non-teaching staff.</p><StaffClient/></div></Shell>}
