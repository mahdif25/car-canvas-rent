import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Car, Shield, Star, Phone, ChevronRight, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";

const LandingOffer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: settings } = useSiteSettings();

  // Capture UTM params
  const utmParams = useMemo(() => ({
    utm_source: searchParams.get("utm_source") || "",
    utm_medium: searchParams.get("utm_medium") || "",
    utm_campaign: searchParams.get("utm_campaign") || "",
    utm_content: searchParams.get("utm_content") || "",
    utm_term: searchParams.get("utm_term") || "",
  }), [searchParams]);

  const [form, setForm] = useState({ first_name: "", phone: "", email: "", vehicle_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Autofill detection — poll DOM values for 3s after mount
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(() => {
      attempts++;
      if (!formRef.current || attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      const inputs = formRef.current.querySelectorAll("input");
      const values: Record<string, string> = {};
      inputs.forEach((input) => {
        if (input.name && input.value) values[input.name] = input.value;
      });
      setForm((prev) => ({
        ...prev,
        first_name: values.fname || prev.first_name,
        phone: values.tel || prev.phone,
        email: values.email || prev.email,
      }));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleAutofillAnimation = useCallback((e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName === "onAutoFillStart") {
      const input = e.currentTarget;
      if (input.name && input.value) {
        setForm((prev) => ({
          ...prev,
          ...(input.name === "fname" && { first_name: input.value }),
          ...(input.name === "tel" && { phone: input.value }),
          ...(input.name === "email" && { email: input.value }),
        }));
      }
    }
  }, []);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["landing-vehicles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("id, name, brand, model, image_url, category, fuel, transmission, seats")
        .eq("is_available", true)
        .limit(6);
      return data ?? [];
    },
  });

  const { data: pricingTiers = [] } = useQuery({
    queryKey: ["landing-pricing"],
    queryFn: async () => {
      const { data } = await supabase.from("vehicle_pricing_tiers").select("*");
      return data ?? [];
    },
  });

  const getStartingPrice = (vehicleId: string) => {
    const tiers = pricingTiers.filter((t) => t.vehicle_id === vehicleId);
    if (!tiers.length) return null;
    return Math.min(...tiers.map((t) => t.daily_rate));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.phone) return;
    setSubmitting(true);

    try {
      const visitorId = `landing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await supabase.from("leads").insert({
        source: "facebook_landing",
        first_name: form.first_name,
        phone: form.phone,
        email: form.email || null,
        visitor_id: visitorId,
        session_id: `landing_${utmParams.utm_campaign || "direct"}`,
        last_reservation_step: 1,
      });

      setSubmitted(true);

      // Redirect to reservation with pre-filled data after a brief moment
      setTimeout(() => {
        const params = new URLSearchParams();
        if (form.vehicle_id) params.set("vehicle", form.vehicle_id);
        navigate(`/reservation${params.toString() ? `?${params}` : ""}`);
      }, 1500);
    } catch (err) {
      console.error("Error submitting lead:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Progressive capture on blur
  const handleBlur = async () => {
    if (!form.phone && !form.email) return;
    try {
      await supabase.from("leads").insert({
        source: "facebook_landing",
        first_name: form.first_name || null,
        phone: form.phone || null,
        email: form.email || null,
        visitor_id: `landing_blur_${Date.now()}`,
        session_id: `landing_${utmParams.utm_campaign || "direct"}`,
        last_reservation_step: 0,
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="Centre Lux Car" className="h-10" />
          {settings?.whatsapp_enabled && settings.whatsapp_number && (
            <a
              href={`https://wa.me/${settings.whatsapp_number.replace(/\s/g, "")}?text=${encodeURIComponent(settings.whatsapp_message || "Bonjour, je suis intéressé par vos offres!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <Phone size={16} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Louez votre voiture <span className="text-accent">au meilleur prix</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Des véhicules de qualité, un service professionnel et des prix imbattables au Maroc.
            </p>
            <a href="#form" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity">
              Réserver maintenant <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <Car className="mx-auto text-primary" size={28} />
              <p className="text-2xl font-bold">{vehicles.length}+</p>
              <p className="text-sm text-muted-foreground">Véhicules disponibles</p>
            </div>
            <div className="space-y-1">
              <Star className="mx-auto text-primary" size={28} />
              <p className="text-2xl font-bold">4.9</p>
              <p className="text-sm text-muted-foreground">Note Google</p>
            </div>
            <div className="space-y-1">
              <Shield className="mx-auto text-primary" size={28} />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Assurance incluse</p>
            </div>
            <div className="space-y-1">
              <CheckCircle2 className="mx-auto text-primary" size={28} />
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Support client</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Nos véhicules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 6).map((v) => {
              const price = getStartingPrice(v.id);
              return (
                <div key={v.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  {v.image_url && (
                    <div className="h-40 bg-secondary flex items-center justify-center overflow-hidden">
                      <img src={v.image_url} alt={v.name} className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{v.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{v.fuel}</span>
                      <span>•</span>
                      <span>{v.transmission}</span>
                      <span>•</span>
                      <span>{v.seats} places</span>
                    </div>
                    {price && (
                      <p className="text-primary font-bold text-xl">
                        À partir de {price} MAD<span className="text-sm font-normal text-muted-foreground">/jour</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lead capture form */}
      <section id="form" className="py-10 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-card rounded-2xl p-6 md:p-8 border border-border shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-2">Réservez en 30 secondes</h2>
            <p className="text-center text-muted-foreground mb-6">Remplissez le formulaire et nous vous contacterons</p>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="mx-auto text-green-500" size={48} />
                <p className="text-lg font-semibold">Merci ! Redirection en cours...</p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    name="fname"
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    onBlur={handleBlur}
                    onAnimationStart={handleAutofillAnimation}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    onBlur={handleBlur}
                    placeholder="+212 6XX XXX XXX"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onBlur={handleBlur}
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Véhicule souhaité (optionnel)</Label>
                  <Select value={form.vehicle_id} onValueChange={(v) => setForm({ ...form, vehicle_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full py-6 text-lg" disabled={submitting}>
                  {submitting ? "Envoi..." : "Réserver maintenant"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  En soumettant, vous acceptez nos conditions générales.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} {settings?.footer_copyright || "Centre Lux Car. Tous droits réservés."}</p>
      </footer>
    </div>
  );
};

export default LandingOffer;
