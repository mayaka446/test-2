import Shell from "@/components/Shell";
import { requireRole } from "@/lib/auth";
import PaymentForm from "./payment-form";
export default async function NewPayment(){await requireRole(["ADMIN","BURSAR"]);return <Shell><div className="content"><div className="eyebrow">FINANCE</div><h1>Record fee payment</h1><div className="panel"><PaymentForm/></div></div></Shell>}
