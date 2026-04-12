import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Fuel, Settings2, DoorOpen, Briefcase, Snowflake, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useVehicles, usePricingTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeviceType, getScaleForDevice, getScaleForColorOnDevice } from "@/hooks/useDeviceScale";
import { useAllVehicleColors, getDefaultColor, VehicleColor } from "@/hooks/useVehicleColors";
import VehicleColorPicker from "@/components/VehicleColorPicker";

const Fleet = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [selectedColors, setSelectedColors] = useState<Record<string, VehicleColor>>({});
  const deviceType = useDeviceType();

  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles();
  const { data: allTiers = [], isLoading: loadingTiers } = usePricingTiers();
  const { data: allColors = [] } = useAllVehicleColors();

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (transmission !== "all" && v.transmission !== transmission) return false;
      return v.is_available;
    });
  }, [category, transmission, vehicles]);

  const categories = [...new Set(vehicles.map((v) => v.category))];
  const isLoading = loadingVehicles || loadingTiers;

  const getDisplayInfo = (vehicleId: string, vehicle: any) => {
    const selected = selectedColors[vehicleId];
    const def = getDefaultColor(allColors, vehicleId);
    const activeColor = selected || def;
    const image = activeColor?.image_url || vehicle.image_url || "/placeholder.svg";
    const flipped = activeColor ? activeColor.image_flipped : vehicle.image_flipped;
    const scale = activeColor ? getScaleForColorOnDevice(activeColor, 'fleet', deviceType) : getScaleForDevice(vehicle, 'fleet', deviceType);
    return { image, flipped, scale };
  };

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
                const vehicleColors = allColors.filter((c) => c.vehicle_id === v.id);
                const { image: displayImage, flipped: imageFlipped, scale: imageScale } = getDisplayInfo(v.id, v);
                const selectedColorId = selectedColors[v.id]?.id || getDefaultColor(allColors, v.id)?.id;

                return (
                  <Link
                    key={v.id}
                    to={`/fleet/${v.slug || v.id}`}
                    className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="p-4 pb-0 space-y-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{v.category}</span>
                      <h3 className="font-bold text-base">{v.name}</h3>
                      <p className="text-xs text-muted-foreground">ou véhicule similaire...</p>
                    </div>

                    <div className="relative mx-4 mt-3 rounded-xl overflow-hidden h-36 bg-secondary">
                      <div className="absolute inset-0 bg-primary translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                      <img
                        src={displayImage}
                        alt={v.name}
                        className="relative z-10 w-full h-full object-contain transition-transform duration-300"
                        style={{
                          transform: `${imageFlipped ? 'scaleX(-1)' : ''} scale(${imageScale})`.trim() || 'none'
                        }}
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      {vehicleColors.length > 0 && (
                        <VehicleColorPicker
                          colors={vehicleColors}
                          selectedColorId={selectedColorId}
                          onSelect={(color) => setSelectedColors((prev) => ({ ...prev, [v.id]: color }))}
                        />
                      )}

                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Settings2 size={12} className="text-primary" />{v.transmission}</span>
                        <span className="flex items-center gap-1.5"><Fuel size={12} className="text-primary" />{v.fuel}</span>
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-primary" />{v.seats} places</span>
                        <span className="flex items-center gap-1.5"><DoorOpen size={12} className="text-primary" />{v.doors} portes</span>
                        <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-primary" />{v.luggage} valises</span>
                        {v.has_climatisation && (
                          <span className="flex items-center gap-1.5"><Snowflake size={12} className="text-primary" />Clim.</span>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <div>
                          <span className="text-xl font-bold text-primary">{startingPrice}</span>
                          <span className="text-sm text-muted-foreground"> MAD/jour</span>
                        </div>
                        <span
                          role="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/reservation?vehicle=${v.id}${selectedColorId ? `&color=${selectedColorId}` : ''}`);
                          }}
                          className="border border-primary text-primary px-3 py-1.5 text-sm font-semibold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors cursor-pointer"
                        >
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
