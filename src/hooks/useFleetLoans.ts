import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FleetLoan {
  id: string;
  plate_id: string;
  bank_name: string;
  loan_amount: number;
  monthly_payment: number;
  loan_duration_months: number;
  start_date: string;
  interest_rate: number;
  remaining_amount: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export const useFleetLoans = () =>
  useQuery({
    queryKey: ["fleet-loans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_loans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FleetLoan[];
    },
  });

export const useAddLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<FleetLoan, "id" | "created_at">) => {
      const { error } = await supabase.from("fleet_loans").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet-loans"] }),
  });
};

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<FleetLoan> & { id: string }) => {
      const { error } = await supabase.from("fleet_loans").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet-loans"] }),
  });
};

export const useDeleteLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fleet_loans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet-loans"] }),
  });
};
