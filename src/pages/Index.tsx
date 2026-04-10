import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Shield, Clock, MapPin, ChevronRight, ChevronLeft, Star, Users, Fuel, Settings2, DoorOpen, Briefcase, Snowflake } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";
import { useVehicles, usePricingTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useReviews } from "@/hooks/useReviews";
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
  const { data: reviews = [] } = useReviews(true);

  const heroType = siteSettings?.hero_bg_type || "color";
  const heroValue = siteSettings?.hero_bg_value || "";
  const overlayOpacity = siteSettings?.hero_overlay_opacity ?? 0.6;
  const showReviews = siteSettings?.show_reviews_section ?? true;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupLocation) params.set("location", pickupLocation);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    navigate(`/reservation?${params.toString()}`);
  };

  const featured = vehicles.filter((v) => v.is_available).slice(0, 3);
  const isLoading = loadingVehicles || loadingTiers || loadingLocations;

  // Reviews carousel state
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

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

      {/* Reviews — compact carousel */}
      {showReviews && reviews.length > 0 && (
        <section className="py-10 bg-secondary">
          <div className="container">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Ce que disent <span className="text-primary">nos clients</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Noté <span className="font-semibold text-foreground">5.00 / 5</span> basé sur {reviews.length * 12}+ avis
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollBy(-1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollBy(1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="min-w-[260px] max-w-[280px] snap-start bg-background rounded-xl p-4 shadow-sm flex-shrink-0 space-y-2"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">{r.text}</p>
                  <div className="pt-1.5 border-t border-border">
                    <p className="font-semibold text-xs">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.time_label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Vehicles — Sovoy style */}
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
                  <Skeleton className="h-48 w-full" />
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
                    className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Header */}
                    <div className="p-5 pb-0 space-y-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{v.category}</span>
                      <h3 className="font-bold text-lg">{v.name}</h3>
                      <p className="text-xs text-muted-foreground">ou véhicule similaire...</p>
                    </div>

                    {/* Car image with Sovoy sliding strip */}
                    <div className="relative mx-5 mt-4 rounded-xl overflow-hidden h-44 bg-secondary">
                      {/* Sliding primary color strip — right to left on hover */}
                      <div className="absolute inset-0 bg-primary translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                      <img
                        src={v.image_url || "/placeholder.svg"}
                        alt={v.name}
                        className="relative z-10 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Features grid */}
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Settings2 size={14} className="text-primary" />{v.transmission}</span>
                        <span className="flex items-center gap-1.5"><Fuel size={14} className="text-primary" />{v.fuel}</span>
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-primary" />{v.seats} places</span>
                        <span className="flex items-center gap-1.5"><DoorOpen size={14} className="text-primary" />{v.doors} portes</span>
                        <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-primary" />{v.luggage} valises</span>
                        {v.has_climatisation && (
                          <span className="flex items-center gap-1.5"><Snowflake size={14} className="text-primary" />Clim.</span>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex justify-between items-center pt-3 border-t border-border">
                        <div>
                          <span className="text-2xl font-bold text-primary">{startingPrice}</span>
                          <span className="text-sm text-muted-foreground"> MAD/jour</span>
                        </div>
                        <span className="border border-primary text-primary px-4 py-2 text-sm font-semibold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
    </Layout>
  );
};

export default Index;
