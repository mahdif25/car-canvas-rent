import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Car, Shield, Clock, MapPin, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { mockVehicles, getStartingPrice, locations } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const Index = () => {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (pickupLocation) params.set("location", pickupLocation);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    navigate(`/reservation?${params.toString()}`);
  };

  const featured = mockVehicles.slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-dark text-dark-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 to-dark/60" />
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
          <div className="mt-10 bg-background text-foreground p-6 rounded-pill shadow-xl max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lieu de prise en charge</label>
                <Select value={pickupLocation} onValueChange={setPickupLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de départ</label>
                <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de retour</label>
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-primary text-primary-foreground hover:bg-accent rounded-pill h-10 font-semibold"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Car, title: "Flotte récente", desc: "Des véhicules neufs et bien entretenus" },
              { icon: Shield, title: "Dépôt sécurisé", desc: "Caution transparente et remboursable" },
              { icon: Clock, title: "Disponibilité 24/7", desc: "Service disponible à tout moment" },
              { icon: MapPin, title: "Multi-villes", desc: "Disponible dans les principales villes du Maroc" },
            ].map((b) => (
              <div key={b.title} className="text-center space-y-3 p-6 bg-background rounded-pill shadow-sm">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((v) => (
              <Link
                key={v.id}
                to={`/fleet/${v.id}`}
                className="group border border-border rounded-pill overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg">{v.name}</h3>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>{v.transmission}</span>
                    <span>•</span>
                    <span>{v.fuel}</span>
                    <span>•</span>
                    <span>{v.seats} places</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-primary">{getStartingPrice(v.id)}</span>
                      <span className="text-sm text-muted-foreground"> MAD/jour</span>
                    </div>
                    <span className="text-sm text-primary font-medium group-hover:underline">
                      Détails →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
