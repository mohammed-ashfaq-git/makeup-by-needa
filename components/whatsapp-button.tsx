import { business } from "@/lib/site-data";
export function WhatsAppButton() { return <a className="whatsapp" href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(business.whatsappMessage)}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">↗ <span>WhatsApp</span></a> }
