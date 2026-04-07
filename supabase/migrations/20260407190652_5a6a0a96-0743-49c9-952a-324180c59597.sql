-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create deposit_status enum
CREATE TYPE public.deposit_status AS ENUM ('pending', 'collected', 'returned');

-- Create reservation_status enum
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- Create vehicle_category enum
CREATE TYPE public.vehicle_category AS ENUM ('SUV', 'Sedan', 'Compact', 'Luxury', 'Minivan');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  category vehicle_category NOT NULL DEFAULT 'Sedan',
  transmission TEXT NOT NULL DEFAULT 'Manuelle',
  fuel TEXT NOT NULL DEFAULT 'Diesel',
  seats INTEGER NOT NULL DEFAULT 5,
  doors INTEGER NOT NULL DEFAULT 4,
  luggage INTEGER NOT NULL DEFAULT 3,
  image_url TEXT,
  security_deposit NUMERIC NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create vehicle_pricing_tiers table
CREATE TABLE public.vehicle_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  min_days INTEGER NOT NULL,
  max_days INTEGER,
  daily_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicle_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Create addon_options table
CREATE TABLE public.addon_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_per_day NUMERIC NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.addon_options ENABLE ROW LEVEL SECURITY;

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_time TEXT DEFAULT '09:00',
  return_time TEXT DEFAULT '09:00',
  pickup_location TEXT NOT NULL,
  return_location TEXT,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_license TEXT NOT NULL,
  customer_nationality TEXT,
  customer_dob DATE,
  total_price NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  deposit_status deposit_status NOT NULL DEFAULT 'pending',
  status reservation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create reservation_addons junction table
CREATE TABLE public.reservation_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
  addon_id UUID REFERENCES public.addon_options(id) NOT NULL
);
ALTER TABLE public.reservation_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles
CREATE POLICY "Admins can read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles
CREATE POLICY "Anyone can view vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Pricing tiers
CREATE POLICY "Anyone can view pricing" ON public.vehicle_pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Admins can insert pricing" ON public.vehicle_pricing_tiers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pricing" ON public.vehicle_pricing_tiers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pricing" ON public.vehicle_pricing_tiers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Addon options
CREATE POLICY "Anyone can view addons" ON public.addon_options FOR SELECT USING (true);
CREATE POLICY "Admins can insert addons" ON public.addon_options FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update addons" ON public.addon_options FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete addons" ON public.addon_options FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reservations
CREATE POLICY "Anyone can create reservation" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all reservations" ON public.reservations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Reservation addons
CREATE POLICY "Anyone can add reservation addons" ON public.reservation_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view reservation addons" ON public.reservation_addons FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addon_options_updated_at BEFORE UPDATE ON public.addon_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true);

CREATE POLICY "Anyone can view vehicle images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
CREATE POLICY "Admins can upload vehicle images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vehicle images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete vehicle images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-images' AND public.has_role(auth.uid(), 'admin'));