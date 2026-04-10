import { useState } from "react";
import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Tag, Truck, Shield, Car, Package } from "lucide-react";
import { getActiveFeatures } from "@/lib/vehicle-features";
import { Vehicle, PricingTier, AddonOption, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { Location, getDeliveryFee } from "@/hooks/useLocations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  formData: ReservationFormData;
  updateForm: (u: Partial<ReservationFormData>) => void;
  onConfirm: () => void;
  onBack: () => void;
  rentalDays: number;
  vehicles: Vehicle[];
  pricingTiers: PricingTier[];
  addons: AddonOption[];
  locations: Location[];
  isSubmitting: boolean;
}

const StepSummary = ({ formData, updateForm, onConfirm, onBack, rentalDays, vehicles, pricingTiers, addons, locations, isSubmitting }: Props) => {
  const [promoInput, setPromoInput] = useState(formData.promo_code || "");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(!!formData.coupon_id);

  const vehicle = vehicles.find((v) => v.id === formData.vehicle_id);
  const tiers = pricingTiers.filter((t) => t.vehicle_id === formData.vehicle_id);
  const dailyRate = vehicle ? getDailyRateFromTiers(tiers, rentalDays) : 0;
  const vehicleTotal = dailyRate * rentalDays;

  const addonsTotal = formData.selected_addons.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id);
    return sum + (addon ? Number(addon.price_per_day) * rentalDays : 0);
  }, 0);

  const deliveryFee = getDeliveryFee(
    locations,
    formData.pickup_location,
    formData.return_location || formData.pickup_location
  );

  const discount = formData.discount_amount || 0;
  const total = Math.max(0, vehicleTotal + addonsTotal + deliveryFee - discount);

  const toggleAddon = (id: string) => {
    const current = formData.selected_addons;
    const updated = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    updateForm({ selected_addons: updated });
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", promoInput.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Code promo invalide ou expiré");
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("Ce code promo a expiré");
        return;
      }
      if (data.max_uses !== null && data.current_uses >= data.max_uses) {
        toast.error("Ce code promo a atteint sa limite d'utilisation");
        return;
      }
      updateForm({ promo_code: data.code, discount_amount: Number(data.discount_amount), coupon_id: data.id });
      setPromoApplied(true);
      toast.success(`Code promo appliqué : -${Number(data.discount_amount).toLocaleString()} MAD`);
    } catch {
      toast.error("Erreur lors de la vérification du code");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    updateForm({ promo_code: "", discount_amount: 0, coupon_id: "" });
    setPromoApplied(false);
    setPromoInput("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Récapitulatif & Confirmation</h2>

      {/* Vehicle summary */}
      {vehicle && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Car size={16} className="text-primary" /> Véhicule
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{vehicle.name}</p>
              <p className="text-sm text-muted-foreground">{dailyRate} MAD/jour × {rentalDays} jour{rentalDays > 1 ? "s" : ""}</p>
            </div>
            <span className="font-semibold">{vehicleTotal.toLocaleString()} MAD</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {getActiveFeatures(vehicle).map((f) => (
              <span key={f.key} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                <f.icon size={11} className="text-primary" />{f.label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
            <Shield size={13} />
            <span className="font-medium">Assurance tous risques incluse</span>
          </div>
        </div>
      )}

      {/* Add-ons selection */}
      {addons.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Package size={16} className="text-primary" /> Options supplémentaires
          </div>
          <div className="grid grid-cols-1 gap-3">
            {addons.map((addon) => {
              const isSelected = formData.selected_addons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{addon.name}</p>
                    {addon.description && <p className="text-xs text-muted-foreground">{addon.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-primary font-semibold">{addon.price_per_day} MAD/j</span>
                    {isSelected && <Check size={18} className="text-primary" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Promo code */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <label className="text-sm font-medium flex items-center gap-1">
          <Tag size={14} className="text-primary" /> Code promo
        </label>
        {promoApplied ? (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <Check size={16} className="text-primary" />
            <span className="text-sm font-medium">{formData.promo_code}</span>
            <span className="text-sm text-primary">-{formData.discount_amount.toLocaleString()} MAD</span>
            <button onClick={handleRemovePromo} className="ml-auto text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Entrez votre code promo" onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()} />
            <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={promoLoading || !promoInput.trim()} className="shrink-0 rounded-xl">
              {promoLoading ? "..." : "Appliquer"}
            </Button>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold">Détail du prix</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Véhicule ({rentalDays} jour{rentalDays > 1 ? "s" : ""})</span>
            <span>{vehicleTotal.toLocaleString()} MAD</span>
          </div>

          {formData.selected_addons.map((id) => {
            const addon = addons.find((a) => a.id === id);
            if (!addon) return null;
            return (
              <div key={id} className="flex justify-between">
                <span>{addon.name}</span>
                <span>{(Number(addon.price_per_day) * rentalDays).toLocaleString()} MAD</span>
              </div>
            );
          })}

          <div className="flex justify-between">
            <span className="flex items-center gap-1"><Truck size={14} /> Livraison</span>
            <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} MAD` : "Gratuit"}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-primary">
              <span>Promo ({formData.promo_code})</span>
              <span>-{discount.toLocaleString()} MAD</span>
            </div>
          )}

          <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{total.toLocaleString()} MAD</span>
          </div>
        </div>

        {vehicle && Number(vehicle.security_deposit) > 0 && (
          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl mt-2">
            <Shield className="text-primary shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-muted-foreground">
              Caution de {Number(vehicle.security_deposit).toLocaleString()} MAD (remboursable) à la prise en charge.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl px-8 w-full sm:w-auto">Retour</Button>
        <Button onClick={onConfirm} disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-accent rounded-xl px-8 h-12 font-semibold w-full sm:w-auto">
          {isSubmitting ? "Envoi en cours..." : "Confirmer la réservation"}
        </Button>
      </div>
    </div>
  );
};

export default StepSummary;
