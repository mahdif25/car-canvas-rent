import { ReservationFormData } from "@/lib/types";
import { CheckCircle, Printer, Car, MapPin, CalendarDays, User, CreditCard } from "lucide-react";
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
  const discount = formData.discount_amount || 0;
  const total = vehicleTotal + addonsTotal + deliveryFee - discount;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success header */}
      <div className="text-center space-y-4 py-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="text-primary" size={48} />
        </div>
        <h2 className="text-2xl font-bold">Réservation confirmée !</h2>
        <p className="text-muted-foreground">Votre numéro de réservation est</p>
        <p className="text-3xl font-bold text-primary">{confirmationId}</p>
      </div>

      {/* Reservation details card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Car size={18} className="text-primary" /> Détails de la réservation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Véhicule</span>
              <p className="font-medium">{vehicle?.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Durée</span>
              <p className="font-medium">{rentalDays} jour{rentalDays > 1 ? "s" : ""}</p>
            </div>
            <div className="space-y-1 flex items-start gap-2">
              <CalendarDays size={14} className="text-primary mt-1 shrink-0" />
              <div>
                <span className="text-muted-foreground">Départ</span>
                <p className="font-medium">{formData.pickup_date} à {formData.pickup_time}</p>
              </div>
            </div>
            <div className="space-y-1 flex items-start gap-2">
              <CalendarDays size={14} className="text-primary mt-1 shrink-0" />
              <div>
                <span className="text-muted-foreground">Retour</span>
                <p className="font-medium">{formData.return_date} à {formData.return_time}</p>
              </div>
            </div>
            <div className="space-y-1 flex items-start gap-2">
              <MapPin size={14} className="text-primary mt-1 shrink-0" />
              <div>
                <span className="text-muted-foreground">Prise en charge</span>
                <p className="font-medium">{formData.pickup_location}</p>
              </div>
            </div>
            {formData.return_location && formData.return_location !== formData.pickup_location && (
              <div className="space-y-1 flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-1 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Retour</span>
                  <p className="font-medium">{formData.return_location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" /> Conducteur
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Nom</span>
              <p className="font-medium">{formData.first_name} {formData.last_name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Téléphone</span>
              <p className="font-medium">{formData.phone}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-primary" /> Tarification
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Véhicule ({dailyRate} MAD × {rentalDays} jours)</span>
              <span className="font-medium">{vehicleTotal.toLocaleString()} MAD</span>
            </div>
            {formData.selected_addons.map((id) => {
              const addon = addons.find((a) => a.id === id);
              if (!addon) return null;
              return (
                <div key={id} className="flex justify-between">
                  <span className="text-muted-foreground">{addon.name} ({addon.price_per_day} MAD × {rentalDays} j)</span>
                  <span className="font-medium">{(Number(addon.price_per_day) * rentalDays).toLocaleString()} MAD</span>
                </div>
              );
            })}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais de livraison</span>
              <span className="font-medium">{deliveryFee > 0 ? `${deliveryFee.toLocaleString()} MAD` : "Gratuit"}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Code promo ({formData.promo_code})</span>
                <span>-{discount.toLocaleString()} MAD</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
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

      <div className="bg-secondary p-4 rounded-2xl text-center text-sm">
        <p className="font-medium">Le paiement sera effectué lors de la prise en charge du véhicule.</p>
        <p className="text-muted-foreground mt-1">Un email de confirmation a été envoyé à {formData.email}</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2">
          <Printer size={16} /> Imprimer
        </Button>
        <Link to="/">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl px-8">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StepConfirmation;
