import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FleetExpense {
  id: string;
  plate_id: string;
  category: string;
  description: string | null;
  amount: number;
  expense_date: string;
  created_at: string;
}

export const EXPENSE_CATEGORIES = [
  { value: "cleaning", label: "Nettoyage" },
  { value: "oil_change", label: "Vidange" },
  { value: "repair", label: "Réparation" },
  { value: "part_replacement", label: "Pièce" },
  { value: "insurance", label: "Assurance" },
  { value: "other", label: "Autre" },
] as const;

export const categoryLabel = (cat: string) =>
  EXPENSE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

export const useFleetExpenses = () =>
  useQuery({
    queryKey: ["fleet-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data as FleetExpense[];
    },
  });

export const useAddExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      plate_id: string;
      category: string;
      amount: number;
      expense_date: string;
      description?: string;
    }) => {
      const { error } = await supabase.from("fleet_expenses").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet-expenses"] }),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fleet_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet-expenses"] }),
  });
};
