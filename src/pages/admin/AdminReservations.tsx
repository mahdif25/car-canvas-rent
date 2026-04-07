import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type ReservationStatus = Database["public"]["Enums"]["reservation_status"];
type DepositStatus = Database["public"]["Enums"]["deposit_status"];

const statusLabels: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  active: "Active",
  completed: "Terminée",
  cancelled: "Annulée",
};

const depositLabels: Record<DepositStatus, string> = {
  pending: "En attente",
  collected: "Collectée",
  returned: "Restituée",
};

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminReservations = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin-reservations", statusFilter],
    queryFn: async () => {
      const query = supabase.from("reservations").select("*, vehicles(name)").order("created_at", { ascending: false });
      if (statusFilter !== "all") {
        const { data } = await query.eq("status", statusFilter as ReservationStatus);
        return data ?? [];
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({ title: "Statut mis à jour" });
    },
  });

  const updateDeposit = useMutation({
    mutationFn: async ({ id, deposit_status }: { id: string; deposit_status: DepositStatus }) => {
      const { error } = await supabase.from("reservations").update({ deposit_status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({ title: "Statut caution mis à jour" });
    },
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Réservations</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {(Object.keys(statusLabels) as ReservationStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : reservations && reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((r) => (
                <div key={r.id} className="border rounded-lg">
                  <div
                    className="flex flex-wrap items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status as ReservationStatus]}`}>
                        {statusLabels[r.status as ReservationStatus]}
                      </span>
                      <span className="font-medium">{r.customer_first_name} {r.customer_last_name}</span>
                      <span className="text-sm text-muted-foreground">{(r as any).vehicles?.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{r.pickup_date} → {r.return_date}</span>
                      <span className="font-semibold text-primary">{Number(r.total_price).toLocaleString()} MAD</span>
                    </div>
                  </div>

                  {expandedId === r.id && (
                    <div className="border-t p-4 bg-secondary/30 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p>{r.customer_email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Téléphone</p>
                          <p>{r.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Permis</p>
                          <p>{r.customer_license}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lieu</p>
                          <p>{r.pickup_location}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Statut réservation</label>
                          <Select
                            value={r.status}
                            onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v as ReservationStatus })}
                          >
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(statusLabels) as ReservationStatus[]).map((s) => (
                                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium">Caution ({Number(r.deposit_amount).toLocaleString()} MAD)</label>
                          <Select
                            value={r.deposit_status}
                            onValueChange={(v) => updateDeposit.mutate({ id: r.id, deposit_status: v as DepositStatus })}
                          >
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(depositLabels) as DepositStatus[]).map((s) => (
                                <SelectItem key={s} value={s}>{depositLabels[s]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucune réservation.</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminReservations;
