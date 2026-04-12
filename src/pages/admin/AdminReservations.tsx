import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { useVehicles, usePricingTiers, getDailyRateFromTiers } from "@/hooks/useVehicles";
import { useLocations, useAllLocations, getDeliveryFee } from "@/hooks/useLocations";
import { Printer, Save, Pencil, Check, X, Plus, AlertTriangle, Search, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAvailablePlates } from "@/hooks/useFleetPlates";
import { DatePickerField } from "@/components/ui/date-picker-field";
import type { Database } from "@/integrations/supabase/types";
import ManualReservationDialog from "@/components/admin/ManualReservationDialog";

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
  const [clientEdits, setClientEdits] = useState<Record<string, { field: string; value: string } | null>>({});
  const [manualOpen, setManualOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // Client-side filtering for search and date range
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];
    let filtered = reservations;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((r: any) => {
        const shortId = r.id.slice(0, 8).toLowerCase();
        return (
          shortId.includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.customer_first_name?.toLowerCase().includes(q) ||
          r.customer_last_name?.toLowerCase().includes(q) ||
          r.customer_email?.toLowerCase().includes(q) ||
          r.customer_phone?.toLowerCase().includes(q) ||
          r.customer_license?.toLowerCase().includes(q) ||
          r.customer_cin?.toLowerCase().includes(q) ||
          r.customer_passport?.toLowerCase().includes(q)
        );
      });
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((r: any) => r.pickup_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((r: any) => r.pickup_date <= dateTo);
    }

    return filtered;
  }, [reservations, searchQuery, dateFrom, dateTo]);

  const { data: vehicles = [] } = useVehicles();
  const { data: pricingTiers = [] } = usePricingTiers();
  const { data: locations = [] } = useLocations();
  const { data: allLocations = [] } = useAllLocations();
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

  const { data: additionalDrivers = [] } = useQuery({
    queryKey: ["additional-drivers-all"],
    queryFn: async () => {
      const { data } = await supabase.from("additional_drivers").select("*");
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
      if (error) {
        if (error.message?.includes("assigned vehicle plate")) {
          throw new Error("Impossible d'activer la réservation sans véhicule assigné. Veuillez d'abord assigner une immatriculation.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
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

      const { error: delErr } = await supabase.from("reservation_addons").delete().eq("reservation_id", id);
      if (delErr) throw delErr;

      if (edit.addons.length > 0) {
        const { error: insErr } = await supabase.from("reservation_addons").insert(
          edit.addons.map((addon_id) => ({ reservation_id: id, addon_id }))
        );
        if (insErr) throw insErr;
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["reservation-addons-all"] });
      toast({ title: "Réservation mise à jour" });

      const r = reservations?.find((res: any) => res.id === variables.id);
      if (r) {
        const ed = variables.edit;
        const c = variables.calc;
        const days = Math.max(1, Math.ceil((new Date(ed.return_date).getTime() - new Date(ed.pickup_date).getTime()) / 86400000));
        const tiers = pricingTiers.filter((t: any) => t.vehicle_id === ed.vehicle_id);
        const dailyRate = getDailyRateFromTiers(tiers, days);
        const vehicle = vehicles.find((v: any) => v.id === ed.vehicle_id);
        const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
        const addonDetails = ed.addons.map((aid: string) => {
          const addon = allAddons.find((a: any) => a.id === aid);
          return addon ? { name: `${addon.name} (${days}j)`, total: Number(addon.price_per_day) * days } : null;
        }).filter(Boolean);

        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "reservation-update",
            recipientEmail: r.customer_email,
            idempotencyKey: `res-update-${r.id}-${Date.now()}`,
            templateData: {
              customerName: r.customer_first_name,
              confirmationId: r.id.slice(0, 8).toUpperCase(),
              vehicleName: vehicle?.name || "",
              pickupDate: fmtDate(ed.pickup_date),
              returnDate: fmtDate(ed.return_date),
              pickupLocation: ed.pickup_location,
              returnLocation: ed.return_location || ed.pickup_location,
              rentalDays: days,
              dailyRate,
              vehicleTotal: dailyRate * days,
              addonsDetails: addonDetails,
              deliveryFee: c.deliveryFee,
              depositAmount: c.depositAmount,
              totalPrice: c.totalPrice,
              status: statusLabels[r.status as ReservationStatus] || r.status,
            },
          },
        }).catch(console.error);
      }
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
        ${r.status === "active" && r.assigned_plate_id ? `<div class="row"><span class="label">Immatriculation</span><span class="value" style="font-family:monospace;font-weight:700">${r._assignedPlateNumber || "—"}</span></div>` : ""}
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

  const handleDownloadReport = () => {
    if (!filteredReservations || filteredReservations.length === 0) return;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const rows = filteredReservations.map((r: any) => {
      const days = Math.max(1, Math.ceil((new Date(r.return_date).getTime() - new Date(r.pickup_date).getTime()) / 86400000));
      const vehicle = vehicles.find((v: any) => v.id === r.vehicle_id);
      const plate = r.assigned_plate_id ? "Assigné" : "—";
      const cinPassport = r.customer_cin || r.customer_passport || "—";
      const licenseDate = r.customer_license_delivery_date ? new Date(r.customer_license_delivery_date).toLocaleDateString("fr-FR") : "—";
      const cautionOui = r.deposit_status === "collected" || r.deposit_status === "returned" ? "Oui" : "Non";
      return `<tr>
        <td>${r.id.slice(0, 8).toUpperCase()}</td>
        <td>${vehicle?.name || "—"}</td>
        <td>${r.customer_first_name} ${r.customer_last_name}</td>
        <td>${r.customer_phone}</td>
        <td>${cinPassport}</td>
        <td>${r.pickup_location}</td>
        <td>${r.return_location || r.pickup_location}</td>
        <td>${r.customer_license}</td>
        <td>${licenseDate}</td>
        <td>${days}j</td>
        <td>${Number(r.total_price).toLocaleString("fr-FR")} MAD</td>
        <td>${cautionOui}</td>
        <td>${statusLabels[r.status as ReservationStatus] || r.status}</td>
      </tr>`;
    }).join("");

    const periodLabel = dateFrom || dateTo
      ? `Période: ${dateFrom ? fmtDate(dateFrom) : "—"} → ${dateTo ? fmtDate(dateTo) : "—"}`
      : "Toutes les dates";

    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Rapport Réservations</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 30px; font-size: 11px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .meta { color: #666; margin-bottom: 16px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; font-size: 10px; text-transform: uppercase; }
        tr:nth-child(even) { background: #fafafa; }
        .total { margin-top: 12px; font-size: 13px; font-weight: 600; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <h1>Centre Lux Car — Rapport Réservations</h1>
      <p class="meta">${periodLabel} • ${filteredReservations.length} réservation(s)</p>
      <table>
        <thead><tr>
          <th>ID</th><th>Véhicule</th><th>Nom</th><th>Tél</th><th>CIN/Passeport</th>
          <th>Lieu départ</th><th>Lieu retour</th><th>Permis</th><th>Délivrance permis</th>
          <th>Jours</th><th>Montant</th><th>Caution</th><th>Statut</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="total">Total: ${filteredReservations.reduce((s: number, r: any) => s + Number(r.total_price), 0).toLocaleString("fr-FR")} MAD</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold">Réservations</h1>
        <Button size="sm" onClick={() => setManualOpen(true)} className="gap-1">
          <Plus size={14} /> Nouvelle réservation
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID, nom, email, permis, CIN, passeport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {(Object.keys(statusLabels) as ReservationStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePickerField value={dateFrom} onChange={setDateFrom} placeholder="Date début" className="w-full sm:w-40" />
        <DatePickerField value={dateTo} onChange={setDateTo} placeholder="Date fin" className="w-full sm:w-40" />
        <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap" onClick={() => handleDownloadReport()}>
          <Download size={14} /> Télécharger
        </Button>
      </div>

      <ManualReservationDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        vehicles={vehicles}
        pricingTiers={pricingTiers}
        locations={allLocations.length > 0 ? allLocations : locations}
        allAddons={allAddons}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ["admin-reservations"] });
          qc.invalidateQueries({ queryKey: ["reservation-addons-all"] });
          qc.invalidateQueries({ queryKey: ["additional-drivers-all"] });
        }}
      />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : filteredReservations && filteredReservations.length > 0 ? (
            <div className="space-y-3">
              {filteredReservations.map((r) => {
                const addDriver = additionalDrivers.find((ad: any) => ad.reservation_id === r.id);
                return (
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
                  additionalDriver={addDriver || null}
                  onUpdateStatus={(status) => updateStatus.mutate({ id: r.id, status })}
                  onUpdateDeposit={(deposit_status) => updateDeposit.mutate({ id: r.id, deposit_status })}
                  onSave={(calc) => saveReservation.mutate({ id: r.id, edit: getEdit(r.id, r), calc })}
                  onPrint={(calc) => handlePrint(r, getEdit(r.id, r), calc)}
                  isSaving={saveReservation.isPending}
                  clientEdit={clientEdits[r.id] || null}
                  onStartClientEdit={(field, value) => setClientEdits((prev) => ({ ...prev, [r.id]: { field, value } }))}
                  onCancelClientEdit={() => setClientEdits((prev) => ({ ...prev, [r.id]: null }))}
                  onSaveClientEdit={async (id, field, value) => {
                    const updateObj: any = {};
                    if (field === "email") updateObj.customer_email = value;
                    if (field === "phone") updateObj.customer_phone = value;
                    if (field === "license") updateObj.customer_license = value;
                    if (field.startsWith("add_")) {
                      const addDriverRecord = additionalDrivers.find((ad: any) => ad.reservation_id === id);
                      if (addDriverRecord) {
                        const addUpdateObj: any = {};
                        const addField = field.replace("add_", "");
                        addUpdateObj[addField] = value;
                        const { error } = await supabase.from("additional_drivers").update(addUpdateObj).eq("id", addDriverRecord.id);
                        if (!error) {
                          qc.invalidateQueries({ queryKey: ["additional-drivers-all"] });
                          toast({ title: "Conducteur supplémentaire mis à jour" });
                        }
                      }
                      setClientEdits((prev) => ({ ...prev, [id]: null }));
                      return;
                    }
                    const { error } = await supabase.from("reservations").update(updateObj).eq("id", id);
                    if (!error) {
                      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
                      toast({ title: "Information mise à jour" });
                    }
                    setClientEdits((prev) => ({ ...prev, [id]: null }));
                  }}
                />
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
  additionalDriver: any | null;
  onUpdateStatus: (s: ReservationStatus) => void;
  onUpdateDeposit: (s: DepositStatus) => void;
  onSave: (calc: { totalPrice: number; deliveryFee: number; depositAmount: number }) => void;
  onPrint: (calc: ReturnType<typeof useCalc>) => void;
  isSaving: boolean;
  clientEdit: { field: string; value: string } | null;
  onStartClientEdit: (field: string, value: string) => void;
  onCancelClientEdit: () => void;
  onSaveClientEdit: (id: string, field: string, value: string) => void;
}

const ReservationRow = ({ r, isExpanded, onToggle, edit, onEdit, vehicles, pricingTiers, locations, allAddons, additionalDriver, onUpdateStatus, onUpdateDeposit, onSave, onPrint, isSaving, clientEdit, onStartClientEdit, onCancelClientEdit, onSaveClientEdit }: RowProps) => {
  const calc = useCalc(edit, vehicles, pricingTiers, locations, allAddons);
  const { data: availablePlates = [] } = useAvailablePlates(edit.vehicle_id, edit.pickup_date, edit.return_date, r.id);
  const qc = useQueryClient();

  const shortId = r.id.slice(0, 8).toUpperCase();

  const assignPlate = async (plateId: string | null) => {
    const { error } = await supabase.from("reservations").update({ assigned_plate_id: plateId }).eq("id", r.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["available-plates"] });
      toast({ title: plateId ? "Véhicule assigné" : "Véhicule désassigné" });
    }
  };

  const assignedPlate = availablePlates.find((p) => p.id === r.assigned_plate_id);
  const allPlatesForDropdown = r.assigned_plate_id && !availablePlates.find((p) => p.id === r.assigned_plate_id)
    ? availablePlates
    : availablePlates;

  const toggleAddon = (addonId: string) => {
    const current = edit.addons;
    onEdit({
      addons: current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId],
    });
  };

  return (
    <div className="border rounded-lg">
      {/* Desktop row */}
      <div
        className="hidden sm:flex flex-wrap items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 gap-2"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{shortId}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status as ReservationStatus]}`}>
            {statusLabels[r.status as ReservationStatus]}
          </span>
          {r.is_manual && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Manuel</Badge>}
          {r.payment_method === "cash" && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Cash</Badge>}
          <span className="font-medium text-sm">{r.customer_first_name} {r.customer_last_name}</span>
          <span className="text-sm text-muted-foreground">{(r as any).vehicles?.name}</span>
          {r.assigned_plate_id && assignedPlate && <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">{assignedPlate.plate_number}</Badge>}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <span className="text-xs sm:text-sm">{r.pickup_date} → {r.return_date}</span>
          <span className="font-semibold text-primary text-sm">{Number(r.total_price).toLocaleString()} MAD</span>
        </div>
      </div>

      {/* Mobile row */}
      <div
        className="sm:hidden p-3 cursor-pointer hover:bg-secondary/50"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">{shortId}</span>
            <span className="font-medium text-sm">{r.customer_first_name} {r.customer_last_name}</span>
          </div>
          <div className="flex items-center gap-1">
            {r.is_manual && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Manuel</Badge>}
            {r.payment_method === "cash" && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Cash</Badge>}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[r.status as ReservationStatus]}`}>
              {statusLabels[r.status as ReservationStatus]}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{(r as any).vehicles?.name}</p>
        <div className="flex items-center justify-between mt-1.5 text-xs">
          <span className="text-muted-foreground">{r.pickup_date} → {r.return_date}</span>
          <span className="font-semibold text-primary">{Number(r.total_price).toLocaleString()} MAD</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4 bg-secondary/30 space-y-4">
          {/* Client info with inline edit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: "Email", field: "email", value: r.customer_email },
              { label: "Téléphone", field: "phone", value: r.customer_phone },
              { label: "Permis", field: "license", value: r.customer_license },
              { label: "Délivrance permis", field: "none_ld", value: r.customer_license_delivery_date ? new Date(r.customer_license_delivery_date).toLocaleDateString("fr-FR") : "—" },
              { label: "Nationalité", field: "none_nat", value: r.customer_nationality || "—" },
              ...(r.customer_nationality === "Marocaine" || (!r.customer_nationality && r.customer_cin)
                ? [
                    { label: "CIN", field: "none_cin", value: r.customer_cin || "—" },
                    { label: "Expiration CIN", field: "none_cinexp", value: r.customer_cin_expiry_date ? new Date(r.customer_cin_expiry_date).toLocaleDateString("fr-FR") : "—" },
                  ]
                : [{ label: "Passeport", field: "none_pass", value: r.customer_passport || "—" }]),
            ].map(({ label, field, value }) => (
              <div key={field}>
                <p className="text-muted-foreground">{label}</p>
                {clientEdit?.field === field && !field.startsWith("none_") ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      className="h-7 text-sm"
                      value={clientEdit.value}
                      onChange={(e) => onStartClientEdit(field, e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => onSaveClientEdit(r.id, field, clientEdit.value)} className="text-primary hover:text-primary/80"><Check size={16} /></button>
                    <button onClick={onCancelClientEdit} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <p className={field === "email" ? "break-all" : ""}>{value}</p>
                    {!field.startsWith("none_") && (
                      <button onClick={() => onStartClientEdit(field, value)} className="text-muted-foreground hover:text-primary"><Pencil size={13} /></button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div><p className="text-muted-foreground">Créée le</p><p>{new Date(r.created_at).toLocaleDateString("fr-FR")}</p></div>
          </div>

          {/* Additional driver info */}
          {additionalDriver && (
            <div className="bg-accent/30 border border-border rounded-lg p-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">Conducteur supplémentaire</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Prénom", field: "add_first_name", value: additionalDriver.first_name },
                  { label: "Nom", field: "add_last_name", value: additionalDriver.last_name },
                  { label: "Email", field: "add_email", value: additionalDriver.email || "—" },
                  { label: "Téléphone", field: "add_phone", value: additionalDriver.phone || "—" },
                  { label: "Permis", field: "add_license_number", value: additionalDriver.license_number },
                  { label: "Nationalité", field: "add_nationality", value: additionalDriver.nationality || "—" },
                  { label: "Date de naissance", field: "add_dob", value: additionalDriver.dob ? new Date(additionalDriver.dob).toLocaleDateString("fr-FR") : "—" },
                ].map(({ label, field, value }) => (
                  <div key={field}>
                    <p className="text-muted-foreground">{label}</p>
                    {clientEdit?.field === field ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Input
                          className="h-7 text-sm"
                          value={clientEdit.value}
                          onChange={(e) => onStartClientEdit(field, e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => onSaveClientEdit(r.id, field, clientEdit.value)} className="text-primary hover:text-primary/80"><Check size={16} /></button>
                        <button onClick={onCancelClientEdit} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <p className={field === "add_email" ? "break-all" : ""}>{value}</p>
                        {value !== "—" || field === "add_email" || field === "add_phone" || field === "add_nationality" ? (
                          <button onClick={() => onStartClientEdit(field, field === "add_dob" ? (additionalDriver.dob || "") : (value === "—" ? "" : value))} className="text-muted-foreground hover:text-primary"><Pencil size={13} /></button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
              <DatePickerField value={edit.pickup_date} onChange={(v) => onEdit({ pickup_date: v })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Date retour</label>
              <DatePickerField value={edit.return_date} onChange={(v) => onEdit({ return_date: v })} />
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

          {/* Plate assignment */}
          <div className="bg-accent/30 border border-border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="space-y-1 flex-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  Véhicule assigné (immatriculation)
                  {r.status !== "active" && !r.assigned_plate_id && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle size={14} className="text-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>Assignez un véhicule avant de passer en "Active"</TooltipContent>
                    </Tooltip>
                  )}
                </label>
                <Select
                  value={r.assigned_plate_id || "none"}
                  onValueChange={(v) => assignPlate(v === "none" ? null : v)}
                >
                  <SelectTrigger className="w-full sm:w-60">
                    <SelectValue placeholder="Aucun véhicule assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {allPlatesForDropdown.map((plate) => (
                      <SelectItem key={plate.id} value={plate.id}>
                        {plate.plate_number} — {plate.brand} {plate.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {r.assigned_plate_id && (
                <Badge variant="outline" className="font-mono text-sm self-end">
                  {availablePlates.find((p) => p.id === r.assigned_plate_id)?.plate_number || "Assigné"}
                </Badge>
              )}
            </div>
          </div>

          {/* Status + deposit + actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">Statut réservation</label>
              <Select value={r.status} onValueChange={(v) => onUpdateStatus(v as ReservationStatus)}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusLabels) as ReservationStatus[]).map((s) => (
                    <SelectItem key={s} value={s} disabled={s === "active" && !r.assigned_plate_id}>
                      {statusLabels[s]}{s === "active" && !r.assigned_plate_id ? " ⚠️" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Caution ({calc.depositAmount.toLocaleString()} MAD)</label>
              <Select value={r.deposit_status} onValueChange={(v) => onUpdateDeposit(v as DepositStatus)}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(depositLabels) as DepositStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{depositLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <Button
                size="sm"
                onClick={() => onSave(calc)}
                disabled={isSaving}
                className="gap-1 flex-1 sm:flex-none"
              >
                <Save size={14} /> Sauvegarder
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                r._assignedPlateNumber = availablePlates.find((p: any) => p.id === r.assigned_plate_id)?.plate_number || "";
                onPrint(calc);
              }} className="gap-1 flex-1 sm:flex-none">
                <Printer size={14} /> Imprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
