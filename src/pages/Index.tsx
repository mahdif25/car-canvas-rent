import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Shield, Clock, MapPin, ChevronRight, ChevronLeft, Star, Users, Fuel, Settings2, DoorOpen, Briefcase, Snowflake } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";
import { useVehicles, usePricingTiers, getStartingPriceFromTiers } from "@/hooks/useVehicles";
import { useSiteSettings, HeroTextStyle } from "@/hooks/useSiteSettings";
import { useReviews } from "@/hooks/useReviews";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePickerField } from "@/components/ui/date-picker-field";

const FONT_SIZE_MAP: Record<string, string> = {
  xl: "text-xl", "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl",
  "5xl": "text-5xl md:text-5xl", "6xl": "text-5xl md:text-6xl", "7xl": "text-5xl md:text-7xl",
  lg: "text-lg", base: "text-base", sm: "text-sm",
};

function getAnimationClass(anim: string, delay = false) {
  const suffix = delay ? "-delay" : "";
  const map: Record<string, string> = {
    "fade-up": `animate-hero-fade-up${suffix}`,
    "fade-in": `animate-hero-fade-in${suffix}`,
    "slide-left": `animate-hero-slide-left${suffix}`,
    "slide-right": `animate-hero-slide-right${suffix}`,
    "zoom-in": `animate-hero-zoom-in${suffix}`,
  };
  return map[anim] || "";
}

function getStyleClasses(style: HeroTextStyle) {
  const size = FONT_SIZE_MAP[style?.fontSize] || "text-lg";
  const weight = style?.fontWeight === "bold" ? "font-bold" : style?.fontWeight === "semibold" ? "font-semibold" : "font-normal";
  const align = style?.textAlign === "center" ? "text-center" : "text-left";
  return `${size} ${weight} ${align}`;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

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
  const videoStartTime = siteSettings?.hero_video_start_time ?? 0;
  const titleText = siteSettings?.hero_title_text || "Louez votre voiture";
  const titleHighlight = siteSettings?.hero_title_highlight || "en toute confiance";
  const subtitleText = siteSettings?.hero_subtitle_text || "Des véhicules de qualité, un service professionnel et des prix compétitifs partout au Maroc.";
  const titleAnim = siteSettings?.hero_title_animation || "fade-up";
  const subtitleAnim = siteSettings?.hero_subtitle_animation || "fade-up";
  const titleStyle = siteSettings?.hero_title_style || { fontSize: "5xl", fontWeight: "bold", textAlign: "left" };
  const subtitleStyle = siteSettings?.hero_subtitle_style || { fontSize: "lg", fontWeight: "normal", textAlign: "left" };

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
      <section className="relative text-white overflow-hidden min-h-[85vh] md:min-h-[70vh] flex flex-col justify-center" style={heroType === "color" && heroValue ? { backgroundColor: heroValue } : undefined}>
        {/* Background media wrapper */}
        <div className="absolute inset-0 overflow-hidden">
          {heroType === "color" && !heroValue && <div className="absolute inset-0 bg-dark" />}
          {heroType === "image" && heroValue && (
            <img src={heroValue} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {heroType === "video" && heroValue && (() => {
            const ytId = getYouTubeId(heroValue);
            const mobileScale = siteSettings?.hero_video_mobile_scale ?? 1.5;
            const tabletScale = siteSettings?.hero_video_tablet_scale ?? 1.3;
            const desktopScale = siteSettings?.hero_video_desktop_scale ?? 1.2;
            const mobileOffsetX = siteSettings?.hero_video_mobile_offset_x ?? 50;
            const mobileOffsetY = siteSettings?.hero_video_mobile_offset_y ?? 50;
            const tabletOffsetX = siteSettings?.hero_video_tablet_offset_x ?? 50;
            const tabletOffsetY = siteSettings?.hero_video_tablet_offset_y ?? 50;
            const desktopOffsetX = siteSettings?.hero_video_desktop_offset_x ?? 50;
            const desktopOffsetY = siteSettings?.hero_video_desktop_offset_y ?? 50;
            const ytSrc = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${ytId}${videoStartTime ? `&start=${videoStartTime}` : ''}`;
            return ytId ? (
              <>
                <iframe src={ytSrc} className="absolute inset-0 w-full h-full pointer-events-none md:hidden"
                  style={{ transform: `scale(${mobileScale}) translate(${mobileOffsetX - 50}%, ${mobileOffsetY - 50}%)` }}
                  allow="autoplay; encrypted-media" frameBorder="0" title="Hero video" />
                <iframe src={ytSrc} className="absolute inset-0 w-full h-full pointer-events-none hidden md:block lg:hidden"
                  style={{ transform: `scale(${tabletScale}) translate(${tabletOffsetX - 50}%, ${tabletOffsetY - 50}%)` }}
                  allow="autoplay; encrypted-media" frameBorder="0" title="Hero video" />
                <iframe src={ytSrc} className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
                  style={{ transform: `scale(${desktopScale}) translate(${desktopOffsetX - 50}%, ${desktopOffsetY - 50}%)` }}
                  allow="autoplay; encrypted-media" frameBorder="0" title="Hero video" />
              </>
            ) : (
              <>
                <video src={heroValue} className="absolute inset-0 w-full h-full object-cover md:hidden"
                  style={{ objectPosition: `${mobileOffsetX}% ${mobileOffsetY}%`, transform: `scale(${mobileScale})` }}
                  autoPlay muted loop playsInline />
                <video src={heroValue} className="absolute inset-0 w-full h-full object-cover hidden md:block lg:hidden"
                  style={{ objectPosition: `${tabletOffsetX}% ${tabletOffsetY}%`, transform: `scale(${tabletScale})` }}
                  autoPlay muted loop playsInline />
                <video src={heroValue} className="absolute inset-0 w-full h-full object-cover hidden lg:block"
                  style={{ objectPosition: `${desktopOffsetX}% ${desktopOffsetY}%`, transform: `scale(${desktopScale})` }}
                  autoPlay muted loop playsInline />
              </>
            );
          })()}
          <div className="absolute inset-0 bg-dark" style={{ opacity: heroType !== "color" ? overlayOpacity : 0 }} />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 to-dark/60" style={{ opacity: heroType === "color" ? 1 : 0 }} />
        </div>

        <div className="container relative z-10 py-12 md:py-32">
          <div className={`max-w-2xl space-y-4 md:space-y-6 ${titleStyle.textAlign === "center" ? "mx-auto" : ""}`}>
            <h1 className={`${getStyleClasses(titleStyle)} leading-tight ${getAnimationClass(titleAnim)}`}>
              {titleText} {titleHighlight && <span className="text-primary">{titleHighlight}</span>}
            </h1>
            <p className={`${getStyleClasses(subtitleStyle)} opacity-80 ${getAnimationClass(subtitleAnim, true)}`}>
              {subtitleText}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-6 md:mt-10 bg-background text-foreground p-4 md:p-8 rounded-2xl shadow-xl max-w-4xl">
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
      <section className="py-10">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Nos véhicules <span className="text-primary">populaires</span>
            </h2>
            <Link to="/fleet" className="text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight size={18} />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
                  <Skeleton className="h-36 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-7 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((v) => {
                const vehicleTiers = allTiers.filter((t) => t.vehicle_id === v.id);
                const startingPrice = getStartingPriceFromTiers(vehicleTiers);
                return (
                  <Link
                    key={v.id}
                    to={`/reservation?vehicle=${v.id}`}
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
                        src={v.image_url || "/placeholder.svg"}
                        alt={v.name}
                        className="relative z-10 w-full h-full object-contain transition-transform duration-300"
                        style={{
                          transform: `${v.image_flipped ? 'scaleX(-1)' : ''} scale(${v.image_scale_home ?? 1})`.trim() || 'none'
                        }}
                      />
                    </div>

                    <div className="p-4 space-y-3">
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
                        <span className="border border-primary text-primary px-3 py-1.5 text-sm font-semibold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
