import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Location {
  id: string;
  name: string;
  delivery_fee: number;
  is_free: boolean;
  is_enabled: boolean;
}

export const useLocations = () =>
  useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("is_enabled", true)
        .order("name");
      if (error) throw error;
      return data as Location[];
    },
  });

export const useAllLocations = () =>
  useQuery({
    queryKey: ["locations-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Location[];
    },
  });

export const getDeliveryFee = (
  locations: Location[],
  pickupName: string,
  returnName: string
): number => {
  const pickup = locations.find((l) => l.name === pickupName);
  const dropoff = locations.find((l) => l.name === returnName);

  const pickupFee = pickup && !pickup.is_free ? Number(pickup.delivery_fee) : 0;
  const dropoffFee = dropoff && !dropoff.is_free ? Number(dropoff.delivery_fee) : 0;

  return pickupFee + dropoffFee;
};
