import { ReservationFormData } from "@/lib/types";
import { CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Vehicle, PricingTier, AddonOption, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { Location, getDeliveryFee } from "@/hooks/useLocations";

interface Props {
  formData: ReservationFormData;
  confirmationId: string;
  rentalDays: number;
  vehicle: Vehicle | undefined;
  pricingTiers: PricingTier[];
  addons: AddonOption[];
  locations: Location[];
}

const StepConfirmation = ({ formData, confirmationId, rentalDays, vehicle, pricingTiers, addons, locations }: Props) => {
  const tiers = pricingTiers.filter((t) => t.vehicle_id === formData.vehicle_id);
  const dailyRate = getDailyRateFromTiers(tiers, rentalDays);
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
  const total = vehicleTotal + addonsTotal + deliveryFee;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto text-primary" size={64} />
        <h2 className="text-2xl font-bold">Réservation confirmée !</h2>
        <p className="text-muted-foreground">Votre numéro de réservation est</p>
        <p className="text-3xl font-bold text-primary">{confirmationId}</p>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border">
        <div className="p-5">
          <h3 className="font-semibold mb-3">Détails de la réservation</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-muted-foreground">Véhicule</span>
            <span className="font-medium">{vehicle?.name}</span>
            <span className="text-muted-foreground">Date de départ</span>
            <span>{formData.pickup_date} à {formData.pickup_time}</span>
            <span className="text-muted-foreground">Date de retour</span>
            <span>{formData.return_date} à {formData.return_time}</span>
            <span className="text-muted-foreground">Durée</span>
            <span>{rentalDays} jour{rentalDays > 1 ? "s" : ""}</span>
            <span className="text-muted-foreground">Lieu de prise en charge</span>
            <span>{formData.pickup_location}</span>
            {formData.return_location && formData.return_location !== formData.pickup_location && (
              <>
                <span className="text-muted-foreground">Lieu de retour</span>
                <span>{formData.return_location}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold mb-3">Conducteur</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-muted-foreground">Nom</span>
            <span>{formData.first_name} {formData.last_name}</span>
            <span className="text-muted-foreground">Email</span>
            <span>{formData.email}</span>
            <span className="text-muted-foreground">Téléphone</span>
            <span>{formData.phone}</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold mb-3">Tarification</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Véhicule ({dailyRate} MAD × {rentalDays} jours)</span>
              <span>{vehicleTotal.toLocaleString()} MAD</span>
            </div>
            {formData.selected_addons.map((id) => {
              const addon = addons.find((a) => a.id === id);
              if (!addon) return null;
              return (
                <div key={id} className="flex justify-between">
                  <span>{addon.name} ({addon.price_per_day} MAD × {rentalDays} j)</span>
                  <span>{(Number(addon.price_per_day) * rentalDays).toLocaleString()} MAD</span>
                </div>
              );
            })}
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span>{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} MAD` : "Gratuit"}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{total.toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Caution (remboursable)</span>
              <span>{vehicle ? Number(vehicle.security_deposit).toLocaleString() : 0} MAD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary p-4 rounded-lg text-center text-sm">
        <p className="font-medium">Le paiement sera effectué lors de la prise en charge du véhicule.</p>
        <p className="text-muted-foreground mt-1">Un email de confirmation a été envoyé à {formData.email}</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => window.print()} className="rounded-pill gap-2">
          <Printer size={16} /> Imprimer
        </Button>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground hover:bg-accent rounded-pill px-8">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StepConfirmation;
