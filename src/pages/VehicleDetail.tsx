import { useParams, Link } from "react-router-dom";
import { Users, Fuel, Settings2, DoorOpen, Briefcase, Shield, Check, Star } from "lucide-react";
import { getActiveFeatures } from "@/lib/vehicle-features";
import Layout from "@/components/layout/Layout";
import { useVehicle, usePricingTiers } from "@/hooks/useVehicles";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const VehicleDetail = () => {
  const { id } = useParams();
  const { data: vehicle, isLoading: loadingVehicle } = useVehicle(id);
  const { data: tiers = [], isLoading: loadingTiers } = usePricingTiers(id);

  if (loadingVehicle || loadingTiers) {
    return (
      <Layout>
        <section className="py-10">
          <div className="container">
            <Skeleton className="h-5 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

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

  const specs = [
    { icon: Users, label: `${vehicle.seats} Places`, sublabel: "Capacité" },
    { icon: Settings2, label: vehicle.transmission, sublabel: "Transmission" },
    { icon: Fuel, label: vehicle.fuel, sublabel: "Carburant" },
    { icon: DoorOpen, label: `${vehicle.doors} Portes`, sublabel: "Portes" },
    { icon: Briefcase, label: `${vehicle.luggage} Valises`, sublabel: "Bagages" },
  ];

  return (
    <Layout>
      <section className="py-10">
        <div className="container">
          <Link to="/fleet" className="text-primary text-sm font-medium hover:underline mb-6 inline-block">
            ← Retour à la flotte
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image with dot indicators */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-md">
                <img src={vehicle.image_url || "/placeholder.svg"} alt={vehicle.name} className="w-full h-full object-cover aspect-video" />
              </div>
              {/* Dot indicators (visual) */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-8 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-border" />
                <div className="w-2 h-2 rounded-full bg-border" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    {vehicle.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-primary fill-primary" />
                    <span className="text-sm font-semibold">4.8</span>
                    <span className="text-xs text-muted-foreground">(120 avis)</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mt-2">{vehicle.name}</h1>
                <p className="text-muted-foreground">{vehicle.brand} {vehicle.model} — {vehicle.year}</p>
              </div>

              {/* Spec Icon Cards */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {specs.map((s) => (
                  <div key={s.sublabel} className="bg-secondary rounded-2xl p-4 text-center space-y-2">
                    <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <s.icon size={20} className="text-primary" />
                    </div>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sublabel}</p>
                  </div>
                ))}
              </div>

              {/* Structured feature icons */}
              {getActiveFeatures(vehicle).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Équipements inclus</h3>
                  <div className="flex flex-wrap gap-2">
                    {getActiveFeatures(vehicle).map((f) => (
                      <span key={f.key} className="flex items-center gap-1.5 text-sm bg-secondary px-3 py-1.5 rounded-full">
                        <f.icon size={14} className="text-primary" />{f.label}
                      </span>
                    ))}
                    {vehicle.features?.map((f) => (
                      <span key={f} className="flex items-center gap-1 text-sm bg-secondary px-3 py-1.5 rounded-full">
                        <Check size={14} className="text-primary" />{f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurance badge */}
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <Shield size={18} className="text-primary shrink-0" />
                <p className="text-sm font-medium text-primary">Assurance tous risques incluse</p>
              </div>

              {tiers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Tarifs</h3>
                  <div className="border border-border rounded-2xl overflow-hidden">
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
              )}

              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <Shield className="text-primary shrink-0" size={24} />
                <div>
                  <p className="font-medium">Caution : {Number(vehicle.security_deposit).toLocaleString()} MAD</p>
                  <p className="text-sm text-muted-foreground">Remboursable après restitution du véhicule</p>
                </div>
              </div>

              <Link to={`/reservation?vehicle=${vehicle.id}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-accent rounded-xl h-12 text-base font-semibold">
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
