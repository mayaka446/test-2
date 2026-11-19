import Shell from "@/components/Shell";
import {requireRole} from "@/lib/auth";
import FeesClient from "./fees-client";
export default async function FeeSetup(){await requireRole(["ADMIN","BURSAR"]);return <Shell><div className="content"><div className="eyebrow">FINANCE CONFIGURATION</div><h1>Fee structures & balances</h1><p className="sub">Configure term charges and review student fee balances.</p><FeesClient/></div></Shell>}
