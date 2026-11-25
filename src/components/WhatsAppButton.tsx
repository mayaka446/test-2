import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@/lib/support";

export default function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 18px",
        borderRadius: 999,
        background: "#25D366",
        color: "#ffffff",
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      }}
    >
      💬 <span>WhatsApp us</span>
    </a>
  );
}
