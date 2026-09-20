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
      href={`https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(whatsappMessage)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
    >
      ↗ <span>WhatsApp</span>
    </a>
  );
}
