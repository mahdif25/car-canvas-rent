import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, Fuel, Settings2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useVehicles, usePricingTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const Fleet = () => {
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");

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

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes transmissions</SelectItem>
                <SelectItem value="Automatique">Automatique</SelectItem>
                <SelectItem value="Manuelle">Manuelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-pill overflow-hidden">
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
                    to={`/fleet/${v.id}`}
                    className="group border border-border rounded-pill overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={v.image_url || "/placeholder.svg"}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
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
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <div>
                          <span className="text-2xl font-bold text-primary">{startingPrice}</span>
                          <span className="text-sm text-muted-foreground"> MAD/jour</span>
                        </div>
                        <span className="bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold rounded-pill group-hover:bg-accent transition-colors">
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
