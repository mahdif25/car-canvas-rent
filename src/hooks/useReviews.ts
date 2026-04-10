import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  time_label: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

export function useReviews(enabledOnly = true) {
  return useQuery({
    queryKey: ["reviews", enabledOnly],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*")
        .order("sort_order", { ascending: true });
      if (enabledOnly) {
        query = query.eq("is_enabled", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: Omit<Review, "id" | "created_at">) => {
      const { error } = await supabase.from("reviews").insert(review);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { error } = await supabase.from("reviews").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
