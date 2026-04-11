import { useState } from "react";
import { ReservationFormData } from "@/lib/types";
import { Vehicle, PricingTier, AddonOption, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { Location } from "@/hooks/useLocations";
import { CalendarDays, MapPin, Car, ChevronUp, ChevronDown, Palette } from "lucide-react";
import { useDeviceScale, getScaleForColorOnDevice, useDeviceType } from "@/hooks/useDeviceScale";
import { useAllVehicleColors, getColorById, getDefaultColor } from "@/hooks/useVehicleColors";

interface Props {
  formData: ReservationFormData;
  rentalDays: number;
  vehicles: Vehicle[];
  pricingTiers: PricingTier[];
  addons: AddonOption[];
  locations: Location[];
  currentStep: number;
  onChangeVehicle?: () => void;
}

const ReservationSidebar = ({ formData, rentalDays, vehicles, pricingTiers, currentStep, onChangeVehicle }: Props) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const vehicle = vehicles.find((v) => v.id === formData.vehicle_id);
  const sidebarScale = useDeviceScale(vehicle, "sidebar");
  const deviceType = useDeviceType();
  const tiers = pricingTiers.filter((t) => t.vehicle_id === formData.vehicle_id);
  const dailyRate = vehicle ? getDailyRateFromTiers(tiers, rentalDays) : 0;
  const vehicleTotal = dailyRate * rentalDays;
  const { data: allColors = [] } = useAllVehicleColors();

  const selectedColor = formData.selected_color_id
    ? getColorById(allColors, formData.selected_color_id)
    : vehicle ? getDefaultColor(allColors, vehicle.id) : undefined;
  const sidebarImage = selectedColor?.image_url || vehicle?.image_url;
  const imageFlipped = selectedColor ? selectedColor.image_flipped : vehicle?.image_flipped;
  const imageScale = selectedColor ? getScaleForColorOnDevice(selectedColor, 'sidebar', deviceType) : sidebarScale;

  // Only show vehicle price in sidebar (no delivery fees, no addons — those appear in step 4)
  const total = vehicleTotal;

  const content = (
    <div className="space-y-4">
      {sidebarImage && (
        <div className="w-full h-28 bg-secondary rounded-lg overflow-hidden">
          <img src={sidebarImage} alt={vehicle?.name} className="w-full h-full object-contain" style={{ transform: `${imageFlipped ? 'scaleX(-1)' : ''} scale(${imageScale})`.trim() || 'none' }} />
        </div>
      )}
      {formData.pickup_location && (
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p>{formData.pickup_location}</p>
            {formData.return_location && formData.return_location !== formData.pickup_location && (
              <p className="text-muted-foreground">Retour : {formData.return_location}</p>
            )}
          </div>
        </div>
      )}

      {formData.pickup_date && formData.return_date && (
        <div className="flex items-start gap-2 text-sm">
          <CalendarDays size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p>{formData.pickup_date} → {formData.return_date}</p>
            <p className="text-muted-foreground">{rentalDays} jour{rentalDays > 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {vehicle && (
        <div className="flex items-start gap-2 text-sm">
          <Car size={16} className="text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{vehicle.name}</p>
              {onChangeVehicle && currentStep > 2 && (
                <button onClick={onChangeVehicle} className="text-xs text-primary hover:underline">
                  Modifier
                </button>
              )}
            </div>
            <p className="text-muted-foreground">{dailyRate} MAD/jour</p>
            {selectedColor && (
              <div className="flex items-center gap-1.5 mt-1">
                <Palette size={12} className="text-primary" />
                <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: selectedColor.color_hex }} />
                <span className="text-xs text-muted-foreground">{selectedColor.color_name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!vehicle && !formData.pickup_date && (
        <p className="text-sm text-muted-foreground">Commencez par remplir les dates et le lieu.</p>
      )}
    </div>
  );

  // Hide sidebar on step 4 (summary has its own breakdown)
  if (currentStep === 4) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block bg-card border border-border p-6 rounded-2xl sticky top-24 space-y-4">
        <h3 className="font-semibold text-lg">Résumé</h3>
        {content}
        {vehicle && (
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between font-bold text-lg">
              <span>Véhicule</span>
              <span className="text-primary">{total.toLocaleString()} MAD</span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Véhicule</span>
            <span className="text-lg font-bold text-primary">{total.toLocaleString()} MAD</span>
          </div>
          {mobileExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
        {mobileExpanded && (
          <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto border-t border-border pt-3">
            {content}
          </div>
        )}
      </div>
    </>
  );
};

export default ReservationSidebar;
