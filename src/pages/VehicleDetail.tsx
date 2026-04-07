import { useParams, Link } from "react-router-dom";
import { Users, Fuel, Settings2, DoorOpen, Briefcase, Shield, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { mockVehicles, mockPricingTiers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

const VehicleDetail = () => {
  const { id } = useParams();
  const vehicle = mockVehicles.find((v) => v.id === id);
  const tiers = mockPricingTiers.filter((t) => t.vehicle_id === id);

  if (!vehicle) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
          <Link to="/fleet" className="text-primary hover:underline">Retour à la flotte</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-10">
        <div className="container">
          <Link to="/fleet" className="text-primary text-sm font-medium hover:underline mb-6 inline-block">
            ← Retour à la flotte
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image */}
            <div className="rounded-pill overflow-hidden shadow-md">
              <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover aspect-video" />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {vehicle.category}
                </span>
                <h1 className="text-3xl font-bold mt-3">{vehicle.name}</h1>
                <p className="text-muted-foreground">{vehicle.brand} {vehicle.model} — {vehicle.year}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Settings2, label: vehicle.transmission },
                  { icon: Fuel, label: vehicle.fuel },
                  { icon: Users, label: `${vehicle.seats} places` },
                  { icon: DoorOpen, label: `${vehicle.doors} portes` },
                  { icon: Briefcase, label: `${vehicle.luggage} valises` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <s.icon size={18} className="text-primary" />
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Équipements inclus</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-sm bg-secondary px-3 py-1 rounded-full">
                      <Check size={14} className="text-primary" />{f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Table */}
              <div>
                <h3 className="font-semibold mb-3">Tarifs</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-dark text-dark-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Durée</th>
                        <th className="text-right px-4 py-3 font-medium">Prix / jour</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((t, i) => (
                        <tr key={t.id} className={i % 2 === 0 ? "bg-background" : "bg-secondary"}>
                          <td className="px-4 py-3">
                            {t.max_days ? `${t.min_days} - ${t.max_days} jours` : `${t.min_days}+ jours`}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">{t.daily_rate} MAD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deposit */}
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Shield className="text-primary shrink-0" size={24} />
                <div>
                  <p className="font-medium">Caution : {vehicle.security_deposit.toLocaleString()} MAD</p>
                  <p className="text-sm text-muted-foreground">Remboursable après restitution du véhicule</p>
                </div>
              </div>

              <Link to={`/reservation?vehicle=${vehicle.id}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-pill h-12 text-base font-semibold">
                  Réserver maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VehicleDetail;
