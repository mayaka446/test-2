import Shell from "@/components/Shell";
import { FAQS } from "@/lib/support";
export const dynamic = "force-dynamic";

export default function Help() {
  return (
    <Shell>
      <div className="content">
        <div className="eyebrow">SUPPORT</div>
        <h1>Help & FAQ</h1>
        <p className="sub">Tap a question to see the answer. For anything else, use the WhatsApp button.</p>
        <div className="panel">
          {FAQS.map((f) => (
            <details key={f.q} style={{ padding: "12px 0", borderBottom: "1px solid #eef1f5" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600 }}>{f.q}</summary>
              <p className="sub" style={{ marginTop: 8 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Shell>
  );
}
