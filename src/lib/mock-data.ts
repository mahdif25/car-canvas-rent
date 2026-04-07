import { Vehicle, PricingTier, AddonOption } from "./types";

export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    name: "Dacia Logan",
    brand: "Dacia",
    model: "Logan",
    year: 2024,
    category: "Sedan",
    transmission: "Manuelle",
    fuel: "Diesel",
    seats: 5,
    doors: 4,
    luggage: 3,
    image_url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=600&h=400&fit=crop",
    security_deposit: 3000,
    is_available: true,
    features: ["Climatisation", "Bluetooth", "USB"],
  },
  {
    id: "2",
    name: "Renault Clio",
    brand: "Renault",
    model: "Clio",
    year: 2024,
    category: "Compact",
    transmission: "Automatique",
    fuel: "Essence",
    seats: 5,
    doors: 4,
    luggage: 2,
    image_url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop",
    security_deposit: 4000,
    is_available: true,
    features: ["Climatisation", "GPS", "Bluetooth", "Caméra de recul"],
  },
  {
    id: "3",
    name: "Hyundai Tucson",
    brand: "Hyundai",
    model: "Tucson",
    year: 2024,
    category: "SUV",
    transmission: "Automatique",
    fuel: "Diesel",
    seats: 5,
    doors: 4,
    luggage: 4,
    image_url: "https://images.unsplash.com/photo-1606611013016-969c19ba27ea?w=600&h=400&fit=crop",
    security_deposit: 7000,
    is_available: true,
    features: ["Climatisation", "GPS", "Bluetooth", "Caméra de recul", "Sièges chauffants"],
  },
  {
    id: "4",
    name: "Mercedes Classe C",
    brand: "Mercedes",
    model: "Classe C",
    year: 2024,
    category: "Luxury",
    transmission: "Automatique",
    fuel: "Diesel",
    seats: 5,
    doors: 4,
    luggage: 3,
    image_url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop",
    security_deposit: 15000,
    is_available: true,
    features: ["Climatisation", "GPS", "Bluetooth", "Sièges cuir", "Toit ouvrant", "Caméra 360°"],
  },
  {
    id: "5",
    name: "Dacia Duster",
    brand: "Dacia",
    model: "Duster",
    year: 2024,
    category: "SUV",
    transmission: "Manuelle",
    fuel: "Diesel",
    seats: 5,
    doors: 4,
    luggage: 4,
    image_url: "https://images.unsplash.com/photo-1551830820-330a71b99659?w=600&h=400&fit=crop",
    security_deposit: 5000,
    is_available: true,
    features: ["Climatisation", "Bluetooth", "USB", "4x4"],
  },
  {
    id: "6",
    name: "Citroën Berlingo",
    brand: "Citroën",
    model: "Berlingo",
    year: 2024,
    category: "Minivan",
    transmission: "Manuelle",
    fuel: "Diesel",
    seats: 7,
    doors: 5,
    luggage: 5,
    image_url: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&h=400&fit=crop",
    security_deposit: 5000,
    is_available: true,
    features: ["Climatisation", "Bluetooth", "USB", "7 places"],
  },
];

export const mockPricingTiers: PricingTier[] = [
  // Dacia Logan
  { id: "t1", vehicle_id: "1", min_days: 1, max_days: 3, daily_rate: 200 },
  { id: "t2", vehicle_id: "1", min_days: 4, max_days: 7, daily_rate: 180 },
  { id: "t3", vehicle_id: "1", min_days: 8, max_days: 14, daily_rate: 160 },
  { id: "t4", vehicle_id: "1", min_days: 15, max_days: 29, daily_rate: 140 },
  { id: "t5", vehicle_id: "1", min_days: 30, max_days: null, daily_rate: 120 },
  // Renault Clio
  { id: "t6", vehicle_id: "2", min_days: 1, max_days: 3, daily_rate: 250 },
  { id: "t7", vehicle_id: "2", min_days: 4, max_days: 7, daily_rate: 220 },
  { id: "t8", vehicle_id: "2", min_days: 8, max_days: 14, daily_rate: 200 },
  { id: "t9", vehicle_id: "2", min_days: 15, max_days: 29, daily_rate: 180 },
  { id: "t10", vehicle_id: "2", min_days: 30, max_days: null, daily_rate: 160 },
  // Hyundai Tucson
  { id: "t11", vehicle_id: "3", min_days: 1, max_days: 3, daily_rate: 450 },
  { id: "t12", vehicle_id: "3", min_days: 4, max_days: 7, daily_rate: 400 },
  { id: "t13", vehicle_id: "3", min_days: 8, max_days: 14, daily_rate: 350 },
  { id: "t14", vehicle_id: "3", min_days: 15, max_days: 29, daily_rate: 300 },
  { id: "t15", vehicle_id: "3", min_days: 30, max_days: null, daily_rate: 250 },
  // Mercedes Classe C
  { id: "t16", vehicle_id: "4", min_days: 1, max_days: 3, daily_rate: 800 },
  { id: "t17", vehicle_id: "4", min_days: 4, max_days: 7, daily_rate: 700 },
  { id: "t18", vehicle_id: "4", min_days: 8, max_days: 14, daily_rate: 600 },
  { id: "t19", vehicle_id: "4", min_days: 15, max_days: 29, daily_rate: 500 },
  { id: "t20", vehicle_id: "4", min_days: 30, max_days: null, daily_rate: 450 },
  // Dacia Duster
  { id: "t21", vehicle_id: "5", min_days: 1, max_days: 3, daily_rate: 350 },
  { id: "t22", vehicle_id: "5", min_days: 4, max_days: 7, daily_rate: 300 },
  { id: "t23", vehicle_id: "5", min_days: 8, max_days: 14, daily_rate: 270 },
  { id: "t24", vehicle_id: "5", min_days: 15, max_days: 29, daily_rate: 240 },
  { id: "t25", vehicle_id: "5", min_days: 30, max_days: null, daily_rate: 200 },
  // Citroën Berlingo
  { id: "t26", vehicle_id: "6", min_days: 1, max_days: 3, daily_rate: 400 },
  { id: "t27", vehicle_id: "6", min_days: 4, max_days: 7, daily_rate: 350 },
  { id: "t28", vehicle_id: "6", min_days: 8, max_days: 14, daily_rate: 300 },
  { id: "t29", vehicle_id: "6", min_days: 15, max_days: 29, daily_rate: 260 },
  { id: "t30", vehicle_id: "6", min_days: 30, max_days: null, daily_rate: 220 },
];

export const mockAddons: AddonOption[] = [
  { id: "a1", name: "GPS", description: "Navigation GPS portable", price_per_day: 30, is_enabled: true },
  { id: "a2", name: "Siège bébé", description: "Siège auto pour bébé (0-12 mois)", price_per_day: 40, is_enabled: true },
  { id: "a3", name: "Siège enfant", description: "Siège rehausseur pour enfant", price_per_day: 30, is_enabled: true },
  { id: "a4", name: "Conducteur additionnel", description: "Ajout d'un conducteur supplémentaire", price_per_day: 50, is_enabled: true },
  { id: "a5", name: "Livraison aéroport", description: "Livraison et récupération à l'aéroport", price_per_day: 0, is_enabled: false },
  { id: "a6", name: "WiFi portable", description: "Routeur WiFi 4G portable", price_per_day: 25, is_enabled: false },
];

export const locations = [
  "Casablanca - Aéroport Mohammed V",
  "Casablanca - Centre ville",
  "Rabat - Aéroport",
  "Rabat - Centre ville",
  "Marrakech - Aéroport",
  "Marrakech - Centre ville",
  "Agadir - Aéroport",
  "Tanger - Aéroport",
  "Fès - Aéroport",
];

export function getDailyRate(vehicleId: string, days: number): number {
  const tiers = mockPricingTiers.filter((t) => t.vehicle_id === vehicleId);
  const tier = tiers.find(
    (t) => days >= t.min_days && (t.max_days === null || days <= t.max_days)
  );
  return tier?.daily_rate ?? tiers[0]?.daily_rate ?? 0;
}

export function getStartingPrice(vehicleId: string): number {
  const tiers = mockPricingTiers.filter((t) => t.vehicle_id === vehicleId);
  return Math.min(...tiers.map((t) => t.daily_rate));
}
