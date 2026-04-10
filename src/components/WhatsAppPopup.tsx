import { useState, useRef, useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useVehicles, usePricingTiers, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { useLocations } from "@/hooks/useLocations";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageCircle, X, RotateCcw, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Vehicle = { id: string; name: string; brand: string; category: string; image_url: string | null; is_available: boolean };

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

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step, isOpen]);

  if (!settings?.whatsapp_enabled || !settings.whatsapp_number) return null;

  const availableVehicles = vehicles?.filter((v) => v.is_available) ?? [];

  const reset = () => {
    setStep(1);
    setSelectedVehicle(null);
    setDays(null);
    setCustomDays("");
    setPickupLocation(null);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const selectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setStep(2);
  };

  const selectDays = (d: number) => {
    setDays(d);
    setStep(3);
  };

  const selectLocation = (name: string) => {
    setPickupLocation(name);
    setStep(4);
  };

  const getDailyRate = () => {
    if (!selectedVehicle || !days || !tiers) return 0;
    const vehicleTiers = tiers.filter((t) => t.vehicle_id === selectedVehicle.id);
    return getDailyRateFromTiers(vehicleTiers, days);
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
      <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] text-sm">
        {children}
      </div>
    </div>
  );

  const UserBubble = ({ text }: { text: string }) => (
    <div className="flex justify-end mb-3">
      <div className="bg-[#25D366] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm font-medium">
        {text}
      </div>
    </div>
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat WhatsApp"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} fill="white" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-background border shadow-2xl ${
            isMobile
              ? "bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh]"
              : "bottom-24 left-6 w-[380px] rounded-2xl max-h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#25D366] text-white px-4 py-3 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} fill="white" />
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
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-1">
              {/* Step 1 */}
              <BotBubble>Bonjour ! 👋 Quel véhicule vous intéresse ?</BotBubble>

              {step >= 2 && selectedVehicle && <UserBubble text={selectedVehicle.name} />}

              {step === 1 && (
                <div className="space-y-2 mb-3">
                  {availableVehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectVehicle(v)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl border bg-card hover:bg-accent transition-colors text-left"
                    >
                      {v.image_url && (
                        <img src={v.image_url} alt={v.name} className="w-16 h-10 object-cover rounded-lg" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2 */}
              {step >= 2 && (
                <BotBubble>
                  Pour combien de jours souhaitez-vous louer la {selectedVehicle?.name} ?
                </BotBubble>
              )}

              {step >= 3 && days && <UserBubble text={`${days} jour${days > 1 ? "s" : ""}`} />}

              {step === 2 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dayPresets.map((d) => (
                      <button
                        key={d}
                        onClick={() => selectDays(d)}
                        className="px-3 py-1.5 rounded-full border bg-card text-sm font-medium hover:bg-accent transition-colors text-foreground"
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
                      className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm text-foreground"
                    />
                    <button
                      onClick={() => {
                        const n = parseInt(customDays);
                        if (n > 0) selectDays(n);
                      }}
                      disabled={!customDays || parseInt(customDays) < 1}
                      className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-sm disabled:opacity-40"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step >= 3 && (
                <BotBubble>Où souhaitez-vous récupérer le véhicule ?</BotBubble>
              )}

              {step >= 4 && pickupLocation && <UserBubble text={pickupLocation} />}

              {step === 3 && (
                <div className="space-y-2 mb-3">
                  {locations?.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => selectLocation(loc.name)}
                      className="w-full text-left px-4 py-2.5 rounded-xl border bg-card hover:bg-accent transition-colors text-sm font-medium text-foreground"
                    >
                      📍 {loc.name}
                      {!loc.is_free && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (+{loc.delivery_fee} MAD)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4 — Summary */}
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
