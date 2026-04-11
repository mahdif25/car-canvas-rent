import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFleetPlates = () =>
  useQuery({
    queryKey: ["fleet-plates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fleet_plates").select("*").eq("is_active", true).order("plate_number");
      if (error) throw error;
      return data;
    },
  });

export const useAvailablePlates = (vehicleId: string | undefined, pickupDate: string, returnDate: string, excludeReservationId?: string) =>
  useQuery({
    queryKey: ["available-plates", vehicleId, pickupDate, returnDate, excludeReservationId],
    queryFn: async () => {
      if (!vehicleId) return [];

      // Get all active plates for this vehicle type
      const { data: plates, error } = await supabase
        .from("fleet_plates")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("is_active", true)
        .order("plate_number");
      if (error) throw error;
      if (!plates?.length) return [];

      // Get reservations that overlap with the date range and have plates assigned
      const { data: occupied } = await supabase
        .from("reservations")
        .select("assigned_plate_id")
        .not("assigned_plate_id", "is", null)
        .in("status", ["confirmed", "active"])
        .lte("pickup_date", returnDate)
        .gte("return_date", pickupDate);

      const occupiedIds = new Set(
        (occupied ?? [])
          .filter((r) => !excludeReservationId || r.assigned_plate_id !== excludeReservationId)
          .map((r) => r.assigned_plate_id)
      );

      // Actually we need to exclude the current reservation from the occupied set
      if (excludeReservationId) {
        // Re-filter: exclude reservations with the same id
        const { data: occupied2 } = await supabase
          .from("reservations")
          .select("id, assigned_plate_id")
          .not("assigned_plate_id", "is", null)
          .in("status", ["confirmed", "active"])
          .lte("pickup_date", returnDate)
          .gte("return_date", pickupDate);

        const occupiedIds2 = new Set(
          (occupied2 ?? [])
            .filter((r) => r.id !== excludeReservationId)
            .map((r) => r.assigned_plate_id)
        );

        return plates.filter((p) => !occupiedIds2.has(p.id));
      }

      return plates.filter((p) => !occupiedIds.has(p.id));
    },
    enabled: !!vehicleId,
  });
