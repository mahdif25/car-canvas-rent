import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Vehicle = Tables<"vehicles">;
export type PricingTier = Tables<"vehicle_pricing_tiers">;
export type AddonOption = Tables<"addon_options">;

export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("name");
      if (error) throw error;
      return data as Vehicle[];
    },
  });

export const useVehicle = (id: string | undefined) =>
  useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Vehicle;
    },
    enabled: !!id,
  });

export const useVehicleBySlug = (slug: string | undefined) =>
  useQuery({
    queryKey: ["vehicles", "slug", slug],
    queryFn: async () => {
      // Try slug first
      const { data: bySlug } = await supabase.from("vehicles").select("*").eq("slug", slug!).maybeSingle();
      if (bySlug) return bySlug as Vehicle;
      // Fall back to id (UUID)
      const { data: byId, error } = await supabase.from("vehicles").select("*").eq("id", slug!).maybeSingle();
      if (error) throw error;
      return byId as Vehicle | null;
    },
    enabled: !!slug,
  });

export type VehicleImage = { id: string; vehicle_id: string; image_url: string; sort_order: number; created_at: string };

export const useVehicleImages = (vehicleId: string | undefined) =>
  useQuery({
    queryKey: ["vehicle_images", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicle_images").select("*").eq("vehicle_id", vehicleId!).order("sort_order");
      if (error) throw error;
      return data as VehicleImage[];
    },
    enabled: !!vehicleId,
  });

export const usePricingTiers = (vehicleId?: string) =>
  useQuery({
    queryKey: ["pricing_tiers", vehicleId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("vehicle_pricing_tiers").select("*").order("min_days");
      if (vehicleId) q = q.eq("vehicle_id", vehicleId);
      const { data, error } = await q;
      if (error) throw error;
      return data as PricingTier[];
    },
  });

export const useAddons = () =>
  useQuery({
    queryKey: ["addons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("addon_options").select("*").eq("is_enabled", true).order("name");
      if (error) throw error;
      return data as AddonOption[];
    },
  });

export function getDailyRateFromTiers(tiers: PricingTier[], days: number): number {
  if (!tiers.length) return 0;
  const sorted = [...tiers].sort((a, b) => a.min_days - b.min_days);
  for (const t of sorted) {
    if (days >= t.min_days && (t.max_days === null || days <= t.max_days)) {
      return Number(t.daily_rate);
    }
  }
  return Number(sorted[0].daily_rate);
}

export function getStartingPriceFromTiers(tiers: PricingTier[]): number {
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((t) => Number(t.daily_rate)));
}
