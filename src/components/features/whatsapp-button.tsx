import { getDefaultWhatsAppUrl } from "@/lib/utils/whatsapp";

export function WhatsAppButton() {
  return (
    <a
      className="whatsapp"
      href={getDefaultWhatsAppUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
    >
      ↗ <span>WhatsApp</span>
    </a>
  );
}
