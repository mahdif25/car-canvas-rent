import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VehicleColor {
  id: string;
  vehicle_id: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export const useVehicleColors = (vehicleId?: string) =>
  useQuery({
    queryKey: ["vehicle_colors", vehicleId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("vehicle_colors").select("*").order("sort_order");
      if (vehicleId) q = q.eq("vehicle_id", vehicleId);
      const { data, error } = await q;
      if (error) throw error;
      return data as VehicleColor[];
    },
  });

export const useAllVehicleColors = () =>
  useQuery({
    queryKey: ["vehicle_colors", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicle_colors").select("*").order("sort_order");
      if (error) throw error;
      return data as VehicleColor[];
    },
  });

export function getDefaultColor(colors: VehicleColor[], vehicleId: string): VehicleColor | undefined {
  const vehicleColors = colors.filter((c) => c.vehicle_id === vehicleId);
  return vehicleColors.find((c) => c.is_default) || vehicleColors[0];
}

export function getColorById(colors: VehicleColor[], colorId: string): VehicleColor | undefined {
  return colors.find((c) => c.id === colorId);
}
