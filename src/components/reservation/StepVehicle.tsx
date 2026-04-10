import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Users, Fuel, Settings2, Shield } from "lucide-react";
import { getActiveFeatures } from "@/lib/vehicle-features";
import { Vehicle, PricingTier, getDailyRateFromTiers } from "@/hooks/useVehicles";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  rentalDays: number;
  onNext: () => void;
  onBack: () => void;
  vehicles: Vehicle[];
  pricingTiers: PricingTier[];
}

const StepVehicle = ({ formData, updateForm, rentalDays, onNext, onBack, vehicles, pricingTiers }: Props) => {
  const available = vehicles.filter((v) => v.is_available);

  const selectVehicle = (id: string) => {
    updateForm({ vehicle_id: id });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Choisissez votre véhicule</h2>
      <p className="text-sm text-muted-foreground">
        Durée : <span className="font-medium text-foreground">{rentalDays} jour{rentalDays > 1 ? "s" : ""}</span>
      </p>

      <div className="space-y-4">
        {available.map((v) => {
          const tiers = pricingTiers.filter((t) => t.vehicle_id === v.id);
          const rate = getDailyRateFromTiers(tiers, rentalDays);
          const isSelected = formData.vehicle_id === v.id;

          return (
            <div
              key={v.id}
              onClick={() => selectVehicle(v.id)}
              className={`flex flex-col md:flex-row gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
              }`}
            >
              <img src={v.image_url || "/placeholder.svg"} alt={v.name} className="w-full md:w-48 h-32 object-cover rounded-md" style={{ transform: `${(v as any).image_flipped ? 'scaleX(-1)' : ''} scale(${(v as any).image_scale_reservation ?? 1})`.trim() || 'none' }} />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{v.name}</h3>
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">{v.category}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Settings2 size={14} />{v.transmission}</span>
                    <span className="flex items-center gap-1"><Fuel size={14} />{v.fuel}</span>
                    <span className="flex items-center gap-1"><Users size={14} />{v.seats} places</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {getActiveFeatures(v).map((f) => (
                      <span key={f.key} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        <f.icon size={11} className="text-primary" />{f.label}
                      </span>
                    ))}
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      <Shield size={11} />Tous risques
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-end">
                  <div>
                    <span className="text-2xl font-bold text-primary">{rate}</span>
                    <span className="text-sm text-muted-foreground"> MAD/jour</span>
                    <span className="block text-sm text-muted-foreground">Total: {rate * rentalDays} MAD</span>
                  </div>
                  {isSelected && (
                    <span className="text-primary text-sm font-semibold">✓ Sélectionné</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-pill px-8">Retour</Button>
        <Button onClick={onNext} disabled={!formData.vehicle_id} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill px-8">
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default StepVehicle;
