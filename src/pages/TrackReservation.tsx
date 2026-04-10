import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Car, MapPin, Calendar, CreditCard, Package } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  active: "Active",
  completed: "Terminée",
  cancelled: "Annulée",
};

const depositLabels: Record<string, string> = {
  pending: "En attente",
  collected: "Collectée",
  returned: "Restituée",
};

const TrackReservation = () => {
  const [reservationCode, setReservationCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [addons, setAddons] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!reservationCode.trim() || !email.trim()) {
      toast.error("Veuillez remplir les deux champs.");
      return;
    }

    setLoading(true);
    setReservation(null);

    try {
      // Search by matching the first 8 chars of the ID
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("customer_email", email.trim().toLowerCase())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const match = reservations?.find(
        (r) => r.id.slice(0, 8).toUpperCase() === reservationCode.trim().toUpperCase()
      );

      if (!match) {
        toast.error("Aucune réservation trouvée. Vérifiez vos informations.");
        setLoading(false);
        return;
      }

      setReservation(match);

      // Fetch vehicle
      const { data: v } = await supabase
        .from("vehicles")
        .select("name, brand, model, image_url")
        .eq("id", match.vehicle_id)
        .single();
      setVehicle(v);

      // Fetch addons
      const { data: ra } = await supabase
        .from("reservation_addons")
        .select("addon_id, addon_options(name, price_per_day)")
        .eq("reservation_id", match.id);
      setAddons(ra || []);
    } catch {
      toast.error("Erreur lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const fmt = (n: number) => Number(n).toLocaleString("fr-FR");

  const rentalDays = reservation
    ? Math.max(1, Math.ceil((new Date(reservation.return_date).getTime() - new Date(reservation.pickup_date).getTime()) / 86400000))
    : 0;

  return (
    <Layout>
      <section className="py-10">
        <div className="container max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-primary">Suivi</span> de réservation
          </h1>
          <p className="text-muted-foreground mb-8">
            Entrez votre numéro de réservation et votre email pour consulter les détails.
          </p>

          <Card className="mb-8">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Numéro de réservation</label>
                <Input
                  value={reservationCode}
                  onChange={(e) => setReservationCode(e.target.value.toUpperCase())}
                  placeholder="Ex: AB12CD34"
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl h-12 font-semibold"
              >
                <Search size={18} className="mr-2" />
                {loading ? "Recherche..." : "Rechercher"}
              </Button>
            </CardContent>
          </Card>

          {reservation && (
            <div className="space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Réservation N° {reservation.id.slice(0, 8).toUpperCase()}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  reservation.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                  reservation.status === "active" ? "bg-green-100 text-green-700" :
                  reservation.status === "completed" ? "bg-gray-100 text-gray-700" :
                  reservation.status === "cancelled" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {statusLabels[reservation.status] || reservation.status}
                </span>
              </div>

              {vehicle && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Car size={20} className="text-primary" />
                      <h3 className="font-semibold">Véhicule</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      {vehicle.image_url && (
                        <img src={vehicle.image_url} alt={vehicle.name} className="w-24 h-16 object-cover rounded-lg" />
                      )}
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={20} className="text-primary" />
                    <h3 className="font-semibold">Dates & lieux</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Du :</span> <strong>{fmtDate(reservation.pickup_date)}</strong></div>
                    <div><span className="text-muted-foreground">Au :</span> <strong>{fmtDate(reservation.return_date)}</strong></div>
                    <div className="flex items-start gap-1">
                      <MapPin size={14} className="text-primary mt-0.5" />
                      <span>{reservation.pickup_location}</span>
                    </div>
                    {reservation.return_location && reservation.return_location !== reservation.pickup_location && (
                      <div className="flex items-start gap-1">
                        <MapPin size={14} className="text-primary mt-0.5" />
                        <span>{reservation.return_location}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Durée : {rentalDays} jour{rentalDays > 1 ? "s" : ""}</p>
                </CardContent>
              </Card>

              {addons.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Package size={20} className="text-primary" />
                      <h3 className="font-semibold">Options</h3>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {addons.map((ra: any) => (
                        <li key={ra.addon_id}>{ra.addon_options?.name} — {fmt(Number(ra.addon_options?.price_per_day) * rentalDays)} MAD</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard size={20} className="text-primary" />
                    <h3 className="font-semibold">Tarification</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {reservation.delivery_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frais de livraison</span>
                        <span>{fmt(reservation.delivery_fee)} MAD</span>
                      </div>
                    )}
                    {reservation.discount_amount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Réduction</span>
                        <span>-{fmt(reservation.discount_amount)} MAD</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Caution</span>
                      <span>{fmt(reservation.deposit_amount)} MAD — {depositLabels[reservation.deposit_status]}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{fmt(reservation.total_price)} MAD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TrackReservation;
