import { ReservationFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Users, Fuel, Settings2, Shield } from "lucide-react";
import { getActiveFeatures } from "@/lib/vehicle-features";
import { Vehicle, PricingTier, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { useDeviceType, getScaleForDevice, getScaleForColorOnDevice } from "@/hooks/useDeviceScale";
import { useAllVehicleColors, getDefaultColor, VehicleColor } from "@/hooks/useVehicleColors";
import VehicleColorPicker from "@/components/VehicleColorPicker";
import { useState, useEffect } from "react";

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
  const deviceType = useDeviceType();
  const { data: allColors = [] } = useAllVehicleColors();
  const [localColors, setLocalColors] = useState<Record<string, VehicleColor>>({});

  // Initialize selected color from formData if present
  useEffect(() => {
    if (formData.selected_color_id && allColors.length > 0) {
      const color = allColors.find((c) => c.id === formData.selected_color_id);
      if (color && !localColors[color.vehicle_id]) {
        setLocalColors((prev) => ({ ...prev, [color.vehicle_id]: color }));
      }
    }
  }, [formData.selected_color_id, allColors]);

  const selectVehicle = (id: string) => {
    const vehicleColors = allColors.filter((c) => c.vehicle_id === id);
    const currentColor = localColors[id] || getDefaultColor(allColors, id);
    updateForm({ vehicle_id: id, selected_color_id: currentColor?.id || "" });
  };

  const handleColorSelect = (vehicleId: string, color: VehicleColor) => {
    setLocalColors((prev) => ({ ...prev, [vehicleId]: color }));
    if (formData.vehicle_id === vehicleId) {
      updateForm({ selected_color_id: color.id });
    }
  };

  const getDisplayImage = (vehicleId: string, defaultImage: string | null) => {
    const selected = localColors[vehicleId];
    if (selected) return selected.image_url;
    const def = getDefaultColor(allColors, vehicleId);
    if (def) return def.image_url;
    return defaultImage || "/placeholder.svg";
  };

  const getImageTransform = (vehicleId: string, vehicle: any) => {
    const activeColor = localColors[vehicleId] || getDefaultColor(allColors, vehicleId);
    const flipped = activeColor ? activeColor.image_flipped : vehicle.image_flipped;
    const scale = activeColor ? getScaleForColorOnDevice(activeColor, 'reservation', deviceType) : getScaleForDevice(vehicle, 'reservation', deviceType);
    return { flipped, scale };
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
          const vehicleColors = allColors.filter((c) => c.vehicle_id === v.id);
          const displayImage = getDisplayImage(v.id, v.image_url);
          const { flipped: imgFlipped, scale: imgScale } = getImageTransform(v.id, v);
          const selectedColorId = localColors[v.id]?.id || getDefaultColor(allColors, v.id)?.id;

          return (
            <div
              key={v.id}
              onClick={() => selectVehicle(v.id)}
              className={`flex flex-col md:flex-row gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-full md:w-48 h-32 rounded-md overflow-hidden bg-secondary shrink-0">
                <img src={displayImage} alt={v.name} className="w-full h-full object-contain" style={{ transform: `${imgFlipped ? 'scaleX(-1)' : ''} scale(${imgScale})`.trim() || 'none' }} />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{v.name}</h3>
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">{v.category}</span>
                  </div>

                  {vehicleColors.length > 0 && (
                    <div className="mt-2">
                      <VehicleColorPicker
                        colors={vehicleColors}
                        selectedColorId={selectedColorId}
                        onSelect={(color) => handleColorSelect(v.id, color)}
                      />
                    </div>
                  )}

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
