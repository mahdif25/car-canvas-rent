export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: "SUV" | "Sedan" | "Compact" | "Luxury" | "Minivan";
  transmission: "Automatique" | "Manuelle";
  fuel: "Essence" | "Diesel" | "Hybride" | "Électrique";
  seats: number;
  doors: number;
  luggage: number;
  image_url: string;
  security_deposit: number;
  is_available: boolean;
  features: string[];
}

export interface PricingTier {
  id: string;
  vehicle_id: string;
  min_days: number;
  max_days: number | null;
  daily_rate: number;
}

export interface AddonOption {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  is_enabled: boolean;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_license: string;
  customer_nationality: string;
  customer_dob: string;
  total_price: number;
  deposit_amount: number;
  deposit_status: "pending" | "collected" | "returned";
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  selected_addons: string[];
  created_at: string;
}

export interface AdditionalDriver {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  nationality: string;
  dob: string;
  cin: string;
  passport: string;
  license_delivery_date: string;
  cin_expiry_date: string;
}

export interface ReservationFormData {
  // Step 1
  pickup_location: string;
  pickup_date: string;
  pickup_time: string;
  return_location: string;
  return_date: string;
  return_time: string;
  // Step 2
  vehicle_id: string;
  // Step 3
  selected_addons: string[];
  // Step 4
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  nationality: string;
  dob: string;
  terms_accepted: boolean;
  promo_code: string;
  discount_amount: number;
  coupon_id: string;
  has_additional_driver: boolean;
  additional_driver: AdditionalDriver;
  selected_color_id: string;
  cin: string;
  passport: string;
  license_delivery_date: string;
  cin_expiry_date: string;
}
