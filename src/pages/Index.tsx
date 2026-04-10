import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Shield, Clock, MapPin, ChevronRight, Heart, Star, Users, Fuel, Settings2 } from "lucide-react";
import { getActiveFeatures } from "@/lib/vehicle-features";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";
import { useVehicles, usePricingTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePickerField } from "@/components/ui/date-picker-field";

const Index = () => {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicles();
  const { data: allTiers = [], isLoading: loadingTiers } = usePricingTiers();
  const { data: locations = [], isLoading: loadingLocations } = useLocations();
  const { data: siteSettings } = useSiteSettings();

  const heroType = siteSettings?.hero_bg_type || "color";
  const heroValue = siteSettings?.hero_bg_value || "";
  const overlayOpacity = siteSettings?.hero_overlay_opacity ?? 0.6;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupLocation) params.set("location", pickupLocation);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    navigate(`/reservation?${params.toString()}`);
  };

  const featured = vehicles.filter((v) => v.is_available).slice(0, 3);
  const isLoading = loadingVehicles || loadingTiers || loadingLocations;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative text-white overflow-hidden" style={heroType === "color" && heroValue ? { backgroundColor: heroValue } : undefined}>
        {heroType === "color" && !heroValue && <div className="absolute inset-0 bg-dark" />}
        {heroType === "image" && heroValue && (
          <img src={heroValue} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {heroType === "video" && heroValue && (
          <video src={heroValue} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
        )}
        <div className="absolute inset-0 bg-dark" style={{ opacity: heroType !== "color" ? overlayOpacity : 0 }} />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 to-dark/60" style={{ opacity: heroType === "color" ? 1 : 0 }} />
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Louez votre voiture <span className="text-primary">en toute confiance</span>
            </h1>
            <p className="text-lg opacity-80">
              Des véhicules de qualité, un service professionnel et des prix compétitifs partout au Maroc.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 bg-background text-foreground p-6 md:p-8 rounded-2xl shadow-xl max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" /> Lieu de prise en charge
                </label>
                <Select value={pickupLocation} onValueChange={setPickupLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de départ</label>
                <DatePickerField
                  value={pickupDate}
                  onChange={setPickupDate}
                  placeholder="Choisir"
                  minDate={new Date()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de retour</label>
                <DatePickerField
                  value={returnDate}
                  onChange={setReturnDate}
                  placeholder="Choisir"
                  minDate={pickupDate ? new Date(pickupDate) : new Date()}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-primary text-primary-foreground hover:bg-accent rounded-xl h-10 font-semibold"
              >
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir <span className="text-primary">Centre Lux Car</span> ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Car, title: "Flotte récente", desc: "Des véhicules neufs et bien entretenus" },
              { icon: Shield, title: "Dépôt sécurisé", desc: "Caution transparente et remboursable" },
              { icon: Clock, title: "Disponibilité 24/7", desc: "Service disponible à tout moment" },
              { icon: MapPin, title: "Multi-villes", desc: "Disponible dans les principales villes du Maroc" },
            ].map((b) => (
              <div key={b.title} className="text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <b.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold text-lg">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">
              Nos véhicules <span className="text-primary">populaires</span>
            </h2>
            <Link to="/fleet" className="text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight size={18} />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((v) => {
                const vehicleTiers = allTiers.filter((t) => t.vehicle_id === v.id);
                const startingPrice = getStartingPriceFromTiers(vehicleTiers);
                return (
                  <Link
                    key={v.id}
                    to={`/fleet/${(v as any).slug || v.id}`}
                    className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={v.image_url || "/placeholder.svg"}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <h3 className="font-semibold text-lg">{v.name}</h3>
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
        </div>
      </section>
    </Layout>
  );
};

export default Index;
