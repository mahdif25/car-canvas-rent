import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { useVehicles, usePricingTiers, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { useLocations, getDeliveryFee } from "@/hooks/useLocations";
import { Printer, Save } from "lucide-react";
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

interface EditState {
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  addons: string[];
}

const AdminReservations = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Record<string, EditState>>({});

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

  const initEdit = (r: any): EditState => {
    const currentAddons = reservationAddons.filter((ra) => ra.reservation_id === r.id).map((ra) => ra.addon_id);
    return {
      vehicle_id: r.vehicle_id,
      pickup_date: r.pickup_date,
      return_date: r.return_date,
      pickup_location: r.pickup_location,
      return_location: r.return_location || r.pickup_location,
      addons: currentAddons,
    };
  };

  const getEdit = (id: string, r: any): EditState => {
    return editState[id] || initEdit(r);
  };

  const setEdit = (id: string, r: any, updates: Partial<EditState>) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...getEdit(id, r), ...updates },
    }));
  };

  const handleExpand = (id: string, r: any) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!editState[id]) {
      setEditState((prev) => ({ ...prev, [id]: initEdit(r) }));
    }
  };

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

  const saveReservation = useMutation({
    mutationFn: async ({ id, edit, calc }: { id: string; edit: EditState; calc: { totalPrice: number; deliveryFee: number; depositAmount: number } }) => {
      const { error } = await supabase.from("reservations").update({
        vehicle_id: edit.vehicle_id,
        pickup_date: edit.pickup_date,
        return_date: edit.return_date,
        pickup_location: edit.pickup_location,
        return_location: edit.return_location,
        total_price: calc.totalPrice,
        delivery_fee: calc.deliveryFee,
        deposit_amount: calc.depositAmount,
      }).eq("id", id);
      if (error) throw error;

      // Sync addons: delete all then insert new
      const { error: delErr } = await supabase.from("reservation_addons").delete().eq("reservation_id", id);
      if (delErr) throw delErr;

      if (edit.addons.length > 0) {
        const { error: insErr } = await supabase.from("reservation_addons").insert(
          edit.addons.map((addon_id) => ({ reservation_id: id, addon_id }))
        );
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["reservation-addons-all"] });
      toast({ title: "Réservation mise à jour" });
    },
  });

  const handlePrint = (r: any, edit: EditState, calc: ReturnType<typeof useCalc>) => {
    const vehicle = vehicles.find((v) => v.id === edit.vehicle_id);
    const addonItems = edit.addons.map((aid) => allAddons.find((a) => a.id === aid)).filter(Boolean);
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

    const statusBadgeColors: Record<string, string> = {
      pending: "#fef3c7;color:#b45309", confirmed: "#dbeafe;color:#1d4ed8", active: "#d1fae5;color:#047857",
      completed: "#f3f4f6;color:#374151", cancelled: "#fee2e2;color:#b91c1c",
    };
    const depositBadgeColors: Record<string, string> = {
      pending: "#fef3c7;color:#b45309", collected: "#d1fae5;color:#047857", returned: "#dbeafe;color:#1d4ed8",
    };

    const w = window.open("", "_blank", "width=800,height=700");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Reçu - ${r.id.slice(0, 8).toUpperCase()}</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; color: #1A1A1A; padding: 40px; max-width: 700px; margin: auto; }
        .header { text-align: center; margin-bottom: 28px; }
        .header h1 { font-size: 20px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .header .ref { font-size: 13px; color: #666; }
        .accent-line { height: 3px; background: linear-gradient(90deg, #00C853, #00C853 40%, #e0e0e0 40%); border-radius: 2px; margin: 20px 0; }
        .section { background: #f8f8f8; border-radius: 10px; padding: 20px 24px; margin-bottom: 16px; }
        .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #00C853; margin-bottom: 14px; }
        .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        .row .label { color: #666; min-width: 160px; }
        .row .value { font-weight: 500; text-align: right; }
        .pricing .row { padding: 6px 0; }
        .divider { border: none; border-top: 1px solid #ddd; margin: 8px 0; }
        .divider-bold { border: none; border-top: 2px solid #1A1A1A; margin: 8px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0 0; }
        .total-row .label { font-size: 16px; font-weight: 700; }
        .total-row .value { font-size: 20px; font-weight: 700; color: #00C853; }
        .badges { display: flex; gap: 16px; justify-content: center; margin: 20px 0; flex-wrap: wrap; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #999; }
        .footer .thanks { font-size: 14px; font-weight: 500; color: #1A1A1A; margin-bottom: 4px; }
        @media print { body { padding: 20px; } .section { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>

      <div class="header">
        <h1>Centre Lux Car</h1>
        <p style="font-size:14px;font-weight:600;margin-top:2px;">REÇU DE RÉSERVATION</p>
        <p class="ref">N° ${r.id.slice(0, 8).toUpperCase()} • ${fmtDate(r.created_at)}</p>
      </div>

      <div class="accent-line"></div>

      <div class="section">
        <div class="section-title">Informations Client</div>
        <div class="row"><span class="label">Nom</span><span class="value">${r.customer_first_name} ${r.customer_last_name}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${r.customer_email}</span></div>
        <div class="row"><span class="label">Téléphone</span><span class="value">${r.customer_phone}</span></div>
        <div class="row"><span class="label">Permis</span><span class="value">${r.customer_license}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Détails de la Réservation</div>
        <div class="row"><span class="label">Véhicule</span><span class="value">${vehicle?.name || "—"}</span></div>
        <div class="row"><span class="label">Durée</span><span class="value">${calc.days} jour${calc.days > 1 ? "s" : ""}</span></div>
        <div class="row"><span class="label">Du</span><span class="value">${fmtDate(edit.pickup_date)}</span></div>
        <div class="row"><span class="label">Au</span><span class="value">${fmtDate(edit.return_date)}</span></div>
        <div class="row"><span class="label">Prise en charge</span><span class="value">${edit.pickup_location}</span></div>
        <div class="row"><span class="label">Retour</span><span class="value">${edit.return_location || edit.pickup_location}</span></div>
        ${addonItems.length ? `<div class="row"><span class="label">Options</span><span class="value">${addonItems.map((a: any) => a.name).join(", ")}</span></div>` : ""}
      </div>

      <div class="section pricing">
        <div class="section-title">Tarification</div>
        <div class="row"><span class="label">Véhicule (${calc.days}j × ${calc.dailyRate.toLocaleString("fr-FR")} MAD)</span><span class="value">${calc.vehicleTotal.toLocaleString("fr-FR")} MAD</span></div>
        ${addonItems.map((a: any) => `<div class="row"><span class="label">${a.name} (${calc.days}j × ${Number(a.price_per_day).toLocaleString("fr-FR")} MAD)</span><span class="value">${(Number(a.price_per_day) * calc.days).toLocaleString("fr-FR")} MAD</span></div>`).join("")}
        ${calc.deliveryFee > 0 ? `<div class="row"><span class="label">Frais de livraison</span><span class="value">${calc.deliveryFee.toLocaleString("fr-FR")} MAD</span></div>` : ""}
        <hr class="divider">
        <div class="row"><span class="label">Caution</span><span class="value">${calc.depositAmount.toLocaleString("fr-FR")} MAD</span></div>
        <hr class="divider-bold">
        <div class="total-row"><span class="label">TOTAL</span><span class="value">${calc.totalPrice.toLocaleString("fr-FR")} MAD</span></div>
      </div>

      <div class="badges">
        <span class="badge" style="background:${statusBadgeColors[r.status] || "#f3f4f6;color:#374151"}">Statut: ${statusLabels[r.status as ReservationStatus]}</span>
        <span class="badge" style="background:${depositBadgeColors[r.deposit_status] || "#f3f4f6;color:#374151"}">Caution: ${depositLabels[r.deposit_status as DepositStatus]}</span>
      </div>

      <div class="accent-line"></div>

      <div class="footer">
        <p class="thanks">Merci pour votre confiance !</p>
        <p>Centre Lux Car • centreluxcar.com</p>
      </div>

      </body></html>`);
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
              {reservations.map((r) => (
                <ReservationRow
                  key={r.id}
                  r={r}
                  isExpanded={expandedId === r.id}
                  onToggle={() => handleExpand(r.id, r)}
                  edit={getEdit(r.id, r)}
                  onEdit={(updates) => setEdit(r.id, r, updates)}
                  vehicles={vehicles}
                  pricingTiers={pricingTiers}
                  locations={locations}
                  allAddons={allAddons}
                  onUpdateStatus={(status) => updateStatus.mutate({ id: r.id, status })}
                  onUpdateDeposit={(deposit_status) => updateDeposit.mutate({ id: r.id, deposit_status })}
                  onSave={(calc) => saveReservation.mutate({ id: r.id, edit: getEdit(r.id, r), calc })}
                  onPrint={(calc) => handlePrint(r, getEdit(r.id, r), calc)}
                  isSaving={saveReservation.isPending}
                />
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

// --- Calc helper used by the row ---
function useCalc(edit: EditState, vehicles: any[], pricingTiers: any[], locations: any[], allAddons: any[]) {
  return useMemo(() => {
    const days = Math.max(1, Math.ceil((new Date(edit.return_date).getTime() - new Date(edit.pickup_date).getTime()) / 86400000));
    const tiers = pricingTiers.filter((t: any) => t.vehicle_id === edit.vehicle_id);
    const dailyRate = getDailyRateFromTiers(tiers, days);
    const vehicleTotal = dailyRate * days;

    const addonsTotal = edit.addons.reduce((sum, aid) => {
      const addon = allAddons.find((a: any) => a.id === aid);
      return sum + (addon ? Number(addon.price_per_day) * days : 0);
    }, 0);

    const deliveryFee = getDeliveryFee(locations, edit.pickup_location, edit.return_location || edit.pickup_location);
    const vehicle = vehicles.find((v: any) => v.id === edit.vehicle_id);
    const depositAmount = vehicle ? Number(vehicle.security_deposit) : 0;
    const totalPrice = vehicleTotal + addonsTotal + deliveryFee;

    return { days, dailyRate, vehicleTotal, addonsTotal, deliveryFee, depositAmount, totalPrice };
  }, [edit, vehicles, pricingTiers, locations, allAddons]);
}

// --- Row component ---
interface RowProps {
  r: any;
  isExpanded: boolean;
  onToggle: () => void;
  edit: EditState;
  onEdit: (updates: Partial<EditState>) => void;
  vehicles: any[];
  pricingTiers: any[];
  locations: any[];
  allAddons: any[];
  onUpdateStatus: (s: ReservationStatus) => void;
  onUpdateDeposit: (s: DepositStatus) => void;
  onSave: (calc: { totalPrice: number; deliveryFee: number; depositAmount: number }) => void;
  onPrint: (calc: ReturnType<typeof useCalc>) => void;
  isSaving: boolean;
}

const ReservationRow = ({ r, isExpanded, onToggle, edit, onEdit, vehicles, pricingTiers, locations, allAddons, onUpdateStatus, onUpdateDeposit, onSave, onPrint, isSaving }: RowProps) => {
  const calc = useCalc(edit, vehicles, pricingTiers, locations, allAddons);

  const toggleAddon = (addonId: string) => {
    const current = edit.addons;
    onEdit({
      addons: current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId],
    });
  };

  return (
    <div className="border rounded-lg">
      <div
        className="flex flex-wrap items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 gap-2"
        onClick={onToggle}
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

      {isExpanded && (
        <div className="border-t p-4 bg-secondary/30 space-y-4">
          {/* Client info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">Email</p><p className="break-all">{r.customer_email}</p></div>
            <div><p className="text-muted-foreground">Téléphone</p><p>{r.customer_phone}</p></div>
            <div><p className="text-muted-foreground">Permis</p><p>{r.customer_license}</p></div>
            <div><p className="text-muted-foreground">Créée le</p><p>{new Date(r.created_at).toLocaleDateString("fr-FR")}</p></div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Véhicule</label>
              <Select value={edit.vehicle_id} onValueChange={(v) => onEdit({ vehicle_id: v })}>
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
              <Input type="date" value={edit.pickup_date} onChange={(e) => onEdit({ pickup_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Date retour</label>
              <Input type="date" value={edit.return_date} onChange={(e) => onEdit({ return_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Lieu prise en charge</label>
              <Select value={edit.pickup_location} onValueChange={(v) => onEdit({ pickup_location: v })}>
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
              <Select value={edit.return_location} onValueChange={(v) => onEdit({ return_location: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Addon checkboxes */}
          {allAddons.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allAddons.map((addon) => (
                  <label key={addon.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary/50">
                    <Checkbox
                      checked={edit.addons.includes(addon.id)}
                      onCheckedChange={() => toggleAddon(addon.id)}
                    />
                    <span className="text-sm">{addon.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{Number(addon.price_per_day).toLocaleString()} MAD/j</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Live price preview */}
          <div className="bg-background border rounded-lg p-4 space-y-1 text-sm">
            <p className="font-medium text-base mb-2">Aperçu tarif</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Véhicule ({calc.days}j × {calc.dailyRate.toLocaleString()} MAD)</span><span>{calc.vehicleTotal.toLocaleString()} MAD</span></div>
            {calc.addonsTotal > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Options</span><span>{calc.addonsTotal.toLocaleString()} MAD</span></div>}
            {calc.deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Frais de livraison</span><span>{calc.deliveryFee.toLocaleString()} MAD</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Caution</span><span>{calc.depositAmount.toLocaleString()} MAD</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-primary">{calc.totalPrice.toLocaleString()} MAD</span></div>
          </div>

          {/* Status + deposit + actions */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Statut réservation</label>
              <Select value={r.status} onValueChange={(v) => onUpdateStatus(v as ReservationStatus)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusLabels) as ReservationStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Caution ({calc.depositAmount.toLocaleString()} MAD)</label>
              <Select value={r.deposit_status} onValueChange={(v) => onUpdateDeposit(v as DepositStatus)}>
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
              onClick={() => onSave(calc)}
              disabled={isSaving}
              className="gap-1"
            >
              <Save size={14} /> Sauvegarder
            </Button>
            <Button size="sm" variant="outline" onClick={() => onPrint(calc)} className="gap-1">
              <Printer size={14} /> Imprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
