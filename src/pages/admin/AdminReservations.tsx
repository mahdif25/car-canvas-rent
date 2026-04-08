import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { useVehicles, usePricingTiers, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { useLocations, getDeliveryFee } from "@/hooks/useLocations";
import { Printer, RefreshCw } from "lucide-react";
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
  const [editState, setEditState] = useState<Record<string, any>>({});
  const printRef = useRef<HTMLDivElement>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin-reservations", statusFilter],
    queryFn: async () => {
      const query = supabase.from("reservations").select("*, vehicles(name, security_deposit)").order("created_at", { ascending: false });
      if (statusFilter !== "all") {
        const { data } = await query.eq("status", statusFilter as ReservationStatus);
        return data ?? [];
      }
      const { data } = await query;
      return data ?? [];
    },
  });

  const { data: vehicles = [] } = useVehicles();
  const { data: pricingTiers = [] } = usePricingTiers();
  const { data: locations = [] } = useLocations();

  const { data: allAddons = [] } = useQuery({
    queryKey: ["all-addons"],
    queryFn: async () => {
      const { data } = await supabase.from("addon_options").select("*");
      return data ?? [];
    },
  });

  const { data: reservationAddons = [] } = useQuery({
    queryKey: ["reservation-addons-all"],
    queryFn: async () => {
      const { data } = await supabase.from("reservation_addons").select("*");
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

  const getEdit = (id: string, r: any) => {
    if (editState[id]) return editState[id];
    return {
      vehicle_id: r.vehicle_id,
      pickup_date: r.pickup_date,
      return_date: r.return_date,
      pickup_location: r.pickup_location,
      return_location: r.return_location || r.pickup_location,
    };
  };

  const setEdit = (id: string, updates: any) => {
    setEditState((prev) => ({ ...prev, [id]: { ...getEdit(id, {}), ...prev[id], ...updates } }));
  };

  const recalculate = useMutation({
    mutationFn: async ({ id, edit }: { id: string; edit: any }) => {
      const days = Math.max(1, Math.ceil((new Date(edit.return_date).getTime() - new Date(edit.pickup_date).getTime()) / 86400000));
      const tiers = pricingTiers.filter((t) => t.vehicle_id === edit.vehicle_id);
      const dailyRate = getDailyRateFromTiers(tiers, days);
      const vehicleTotal = dailyRate * days;

      const rAddons = reservationAddons.filter((ra) => ra.reservation_id === id);
      const addonsTotal = rAddons.reduce((sum, ra) => {
        const addon = allAddons.find((a) => a.id === ra.addon_id);
        return sum + (addon ? Number(addon.price_per_day) * days : 0);
      }, 0);

      const deliveryFee = getDeliveryFee(locations, edit.pickup_location, edit.return_location || edit.pickup_location);
      const vehicle = vehicles.find((v) => v.id === edit.vehicle_id);
      const depositAmount = vehicle ? Number(vehicle.security_deposit) : 0;
      const totalPrice = vehicleTotal + addonsTotal + deliveryFee;

      const { error } = await supabase.from("reservations").update({
        vehicle_id: edit.vehicle_id,
        pickup_date: edit.pickup_date,
        return_date: edit.return_date,
        pickup_location: edit.pickup_location,
        return_location: edit.return_location,
        total_price: totalPrice,
        delivery_fee: deliveryFee,
        deposit_amount: depositAmount,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({ title: "Réservation recalculée et mise à jour" });
    },
  });

  const handlePrint = (r: any) => {
    const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
    const rAddons = reservationAddons.filter((ra) => ra.reservation_id === r.id);
    const addonNames = rAddons.map((ra) => allAddons.find((a) => a.id === ra.addon_id)?.name).filter(Boolean);

    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`
      <html><head><title>Reçu - ${r.id.slice(0, 8).toUpperCase()}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; max-width: 700px; margin: auto; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td { padding: 6px 0; font-size: 14px; }
        .label { color: #666; width: 40%; }
        .section { font-weight: 600; font-size: 15px; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>Reçu de Réservation</h1>
      <p class="sub">N° ${r.id.slice(0, 8).toUpperCase()} • ${new Date(r.created_at).toLocaleDateString("fr-FR")}</p>

      <div class="section">Client</div>
      <table>
        <tr><td class="label">Nom</td><td>${r.customer_first_name} ${r.customer_last_name}</td></tr>
        <tr><td class="label">Email</td><td>${r.customer_email}</td></tr>
        <tr><td class="label">Téléphone</td><td>${r.customer_phone}</td></tr>
        <tr><td class="label">Permis</td><td>${r.customer_license}</td></tr>
      </table>

      <div class="section">Réservation</div>
      <table>
        <tr><td class="label">Véhicule</td><td>${vehicle?.name || "—"}</td></tr>
        <tr><td class="label">Dates</td><td>${r.pickup_date} → ${r.return_date}</td></tr>
        <tr><td class="label">Lieu prise en charge</td><td>${r.pickup_location}</td></tr>
        <tr><td class="label">Lieu de retour</td><td>${r.return_location || r.pickup_location}</td></tr>
        ${addonNames.length ? `<tr><td class="label">Options</td><td>${addonNames.join(", ")}</td></tr>` : ""}
      </table>

      <div class="section">Tarification</div>
      <table>
        ${Number(r.delivery_fee) > 0 ? `<tr><td class="label">Frais de livraison</td><td>${Number(r.delivery_fee).toLocaleString()} MAD</td></tr>` : ""}
        <tr><td class="label">Caution</td><td>${Number(r.deposit_amount).toLocaleString()} MAD</td></tr>
        <tr class="total-row"><td>Total</td><td>${Number(r.total_price).toLocaleString()} MAD</td></tr>
      </table>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
              {reservations.map((r) => {
                const edit = getEdit(r.id, r);
                return (
                  <div key={r.id} className="border rounded-lg">
                    <div
                      className="flex flex-wrap items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 gap-2"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status as ReservationStatus]}`}>
                          {statusLabels[r.status as ReservationStatus]}
                        </span>
                        <span className="font-medium text-sm">{r.customer_first_name} {r.customer_last_name}</span>
                        <span className="text-sm text-muted-foreground">{(r as any).vehicles?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <span className="text-xs sm:text-sm">{r.pickup_date} → {r.return_date}</span>
                        <span className="font-semibold text-primary text-sm">{Number(r.total_price).toLocaleString()} MAD</span>
                      </div>
                    </div>

                    {expandedId === r.id && (
                      <div className="border-t p-4 bg-secondary/30 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><p className="text-muted-foreground">Email</p><p className="break-all">{r.customer_email}</p></div>
                          <div><p className="text-muted-foreground">Téléphone</p><p>{r.customer_phone}</p></div>
                          <div><p className="text-muted-foreground">Permis</p><p>{r.customer_license}</p></div>
                          <div><p className="text-muted-foreground">Frais livraison</p><p>{Number(r.delivery_fee).toLocaleString()} MAD</p></div>
                        </div>

                        {/* Editable fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Véhicule</label>
                            <Select value={editState[r.id]?.vehicle_id || r.vehicle_id} onValueChange={(v) => setEdit(r.id, { vehicle_id: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {vehicles.map((v) => (
                                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Date départ</label>
                            <Input type="date" value={editState[r.id]?.pickup_date || r.pickup_date} onChange={(e) => setEdit(r.id, { pickup_date: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Date retour</label>
                            <Input type="date" value={editState[r.id]?.return_date || r.return_date} onChange={(e) => setEdit(r.id, { return_date: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Lieu prise en charge</label>
                            <Select value={editState[r.id]?.pickup_location || r.pickup_location} onValueChange={(v) => setEdit(r.id, { pickup_location: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {locations.map((l) => (
                                  <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Lieu retour</label>
                            <Select value={editState[r.id]?.return_location || r.return_location || r.pickup_location} onValueChange={(v) => setEdit(r.id, { return_location: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {locations.map((l) => (
                                  <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-end">
                          <div className="space-y-1">
                            <label className="text-sm font-medium">Statut réservation</label>
                            <Select value={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v as ReservationStatus })}>
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
                            <Select value={r.deposit_status} onValueChange={(v) => updateDeposit.mutate({ id: r.id, deposit_status: v as DepositStatus })}>
                              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(Object.keys(depositLabels) as DepositStatus[]).map((s) => (
                                  <SelectItem key={s} value={s}>{depositLabels[s]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => recalculate.mutate({ id: r.id, edit: { ...getEdit(r.id, r), ...editState[r.id] } })}
                            disabled={!editState[r.id]}
                            className="gap-1"
                          >
                            <RefreshCw size={14} /> Recalculer
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handlePrint(r)} className="gap-1">
                            <Printer size={14} /> Imprimer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
