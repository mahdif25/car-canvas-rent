import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MessageCircle } from "lucide-react";

const WhatsAppPopup = () => {
  const { data: settings } = useSiteSettings();

  if (!settings?.whatsapp_enabled || !settings.whatsapp_number) return null;

  const number = settings.whatsapp_number.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(settings.whatsapp_message || "");
  const url = `https://wa.me/${number}${message ? `?text=${message}` : ""}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
};

export default WhatsAppPopup;
