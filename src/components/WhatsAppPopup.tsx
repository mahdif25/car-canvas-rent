import { useState, useRef, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useVehicles, usePricingTiers, getDailyRateFromTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { useLocations } from "@/hooks/useLocations";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, RotateCcw, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Vehicle = { id: string; name: string; brand: string; category: string; image_url: string | null; is_available: boolean };

const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WhatsAppPopup = () => {
  const { data: settings } = useSiteSettings();
  const { data: vehicles } = useVehicles();
  const { data: tiers } = usePricingTiers();
  const { data: locations } = useLocations();
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState("");
  const [pickupLocation, setPickupLocation] = useState<string | null>(null);
  const [autofillName, setAutofillName] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameInputRef.current?.value) {
        setAutofillName(nameInputRef.current.value);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!settings?.whatsapp_enabled || !settings.whatsapp_number) return null;

  const availableVehicles = vehicles?.filter((v) => v.is_available) ?? [];

  const reset = () => { setStep(1); setSelectedVehicle(null); setDays(null); setCustomDays(""); setPickupLocation(null); };
  const close = () => { setIsOpen(false); reset(); };
  const selectVehicle = (v: Vehicle) => { setSelectedVehicle(v); setStep(2); };
  const selectDays = (d: number) => { setDays(d); setStep(3); };
  const selectLocation = (name: string) => { setPickupLocation(name); setStep(4); };

  const getDailyRate = () => {
    if (!selectedVehicle || !days || !tiers) return 0;
    return getDailyRateFromTiers(tiers.filter((t) => t.vehicle_id === selectedVehicle.id), days);
  };

  const openWhatsApp = () => {
    const number = settings.whatsapp_number.replace(/[^0-9]/g, "");
    const rate = getDailyRate();
    const msg = encodeURIComponent(
      `Bonjour, je suis intéressé par la ${selectedVehicle?.name} pour ${days} jours, récupération à ${pickupLocation}.${rate ? ` (à partir de ${rate} MAD/jour)` : ""} Merci!`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  const dayPresets = [1, 3, 7, 14, 30];

  const BotBubble = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-start mb-3">
      <div className="bg-white text-gray-900 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] text-sm shadow-sm">
        {children}
      </div>
    </div>
  );

  const UserBubble = ({ text }: { text: string }) => (
    <div className="flex justify-end mb-3">
      <div className="bg-[#DCF8C6] text-gray-900 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm font-medium shadow-sm">
        {text}
      </div>
    </div>
  );

  return (
    <>
      {/* Hidden autofill input */}
      <input
        ref={nameInputRef}
        type="text"
        name="fname"
        autoComplete="given-name"
        onChange={(e) => setAutofillName(e.target.value)}
        className="absolute opacity-0 h-0 w-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat WhatsApp"
      >
        {isOpen ? <X size={24} /> : <WhatsAppIcon size={28} />}
      </button>

      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col shadow-2xl overflow-hidden ${
            isMobile
              ? "bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh]"
              : "bottom-24 left-6 w-[380px] rounded-2xl max-h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#075E54] text-white px-4 py-3 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <WhatsAppIcon size={20} />
              <span className="font-semibold text-sm">Assistant Location</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={reset} className="hover:bg-white/20 rounded-full p-1" title="Recommencer">
                <RotateCcw size={16} />
              </button>
              <button onClick={close} className="hover:bg-white/20 rounded-full p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0 bg-[#ECE5DD]">
            <div className="p-4 space-y-1">
              <BotBubble>{autofillName ? `Bonjour ${autofillName} ! 👋` : "Bonjour ! 👋"} Quel véhicule vous intéresse ?</BotBubble>

              {step >= 2 && selectedVehicle && <UserBubble text={selectedVehicle.name} />}

              {step === 1 && (
                <div className="space-y-2 mb-3">
                  {availableVehicles.map((v) => {
                    const rate = tiers ? getStartingPriceFromTiers(tiers.filter((t) => t.vehicle_id === v.id)) : 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => selectVehicle(v)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors text-left shadow-sm"
                      >
                        {v.image_url && (
                          <img src={v.image_url} alt={v.name} className="w-16 h-10 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.category}</p>
                          {rate > 0 && <p className="text-xs text-[#25D366] font-semibold">À partir de {rate} MAD/jour</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step >= 2 && (
                <BotBubble>Pour combien de jours souhaitez-vous louer la {selectedVehicle?.name} ?</BotBubble>
              )}

              {step >= 3 && days && <UserBubble text={`${days} jour${days > 1 ? "s" : ""}`} />}

              {step === 2 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dayPresets.map((d) => (
                      <button
                        key={d}
                        onClick={() => selectDays(d)}
                        className="px-3 py-1.5 rounded-full bg-white text-sm font-medium hover:bg-gray-50 transition-colors text-gray-900 shadow-sm"
                      >
                        {d} jour{d > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Autre..."
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white text-sm text-gray-900 shadow-sm"
                    />
                    <button
                      onClick={() => { const n = parseInt(customDays); if (n > 0) selectDays(n); }}
                      disabled={!customDays || parseInt(customDays) < 1}
                      className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-sm disabled:opacity-40"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {step >= 3 && <BotBubble>Où souhaitez-vous récupérer le véhicule ?</BotBubble>}

              {step >= 4 && pickupLocation && <UserBubble text={pickupLocation} />}

              {step === 3 && (
                <div className="space-y-2 mb-3">
                  {locations?.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => selectLocation(loc.name)}
                      className="w-full text-left px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900 shadow-sm"
                    >
                      📍 {loc.name}
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <>
                  <BotBubble>
                    <p className="font-semibold mb-1">Récapitulatif ✅</p>
                    <p>🚗 {selectedVehicle?.name}</p>
                    <p>📅 {days} jour{days! > 1 ? "s" : ""}</p>
                    <p>📍 {pickupLocation}</p>
                    {getDailyRate() > 0 && (
                      <p className="mt-1 font-semibold">À partir de {getDailyRate()} MAD/jour</p>
                    )}
                  </BotBubble>
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={openWhatsApp}
                      className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm shadow-md"
                    >
                      <Send size={16} />
                      Envoyer sur WhatsApp
                    </button>
                  </div>
                </>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default WhatsAppPopup;
