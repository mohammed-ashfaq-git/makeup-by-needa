import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppButton({
  whatsappNumber,
  whatsappMessage,
}: {
  whatsappNumber: string;
  whatsappMessage: string;
}) {
  return (
    <a
      className="whatsapp"
      href={buildWhatsAppUrl(whatsappNumber, whatsappMessage)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
    >
      ↗ <span>WhatsApp</span>
    </a>
  );
}
