import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, Fuel, Settings2, Heart, Star, Shield } from "lucide-react";
import { getActiveFeatures } from "@/lib/vehicle-features";
import Layout from "@/components/layout/Layout";
import { useVehicles, usePricingTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeviceType, getScaleForDevice } from "@/hooks/useDeviceScale";

const Fleet = () => {
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const deviceType = useDeviceType();

  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles();
  const { data: allTiers = [], isLoading: loadingTiers } = usePricingTiers();

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (transmission !== "all" && v.transmission !== transmission) return false;
      return v.is_available;
    });
  }, [category, transmission, vehicles]);

  const categories = [...new Set(vehicles.map((v) => v.category))];
  const isLoading = loadingVehicles || loadingTiers;

  return (
    <Layout>
      <section className="py-10">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">
            Notre <span className="text-primary">Flotte</span>
          </h1>
          <p className="text-muted-foreground mb-8">Trouvez le véhicule idéal pour votre voyage</p>

          {/* Chip Filters */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                Toutes catégories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Toutes transmissions" },
                { value: "Automatique", label: "Automatique" },
                { value: "Manuelle", label: "Manuelle" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTransmission(t.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    transmission === t.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((v) => {
                const vehicleTiers = allTiers.filter((t) => t.vehicle_id === v.id);
                const startingPrice = getStartingPriceFromTiers(vehicleTiers);
                return (
                  <Link
                    key={v.id}
                    to={`/reservation?vehicle=${v.id}`}
                    className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative bg-secondary">
                      <img
                        src={v.image_url || "/placeholder.svg"}
                        alt={v.name}
                        className="w-full h-full object-contain transition-transform duration-300"
                        style={{
                          transform: `${v.image_flipped ? 'scaleX(-1)' : ''} scale(${getScaleForDevice(v, 'fleet', deviceType)})`.trim() || 'none'
                        }}
                      />
                      <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <Heart size={18} className="text-muted-foreground" />
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star size={14} className="text-primary fill-primary" />
                        <span className="text-xs font-semibold">4.8</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{v.name}</h3>
                        <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                          {v.category}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Settings2 size={14} />{v.transmission}</span>
                        <span className="flex items-center gap-1"><Fuel size={14} />{v.fuel}</span>
                        <span className="flex items-center gap-1"><Users size={14} />{v.seats}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getActiveFeatures(v).map((f) => (
                          <span key={f.key} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                            <f.icon size={12} className="text-primary" />{f.label}
                          </span>
                        ))}
                        <span className="flex items-center gap-1 text-xs text-primary bg-primary/5 px-2 py-1 rounded-full">
                          <Shield size={12} />Tous risques
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <div>
                          <span className="text-2xl font-bold text-primary">{startingPrice}</span>
                          <span className="text-sm text-muted-foreground"> MAD/jour</span>
                        </div>
                        <span className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold rounded-xl group-hover:bg-accent transition-colors">
                          Réserver
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              Aucun véhicule ne correspond à vos critères.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Fleet;
