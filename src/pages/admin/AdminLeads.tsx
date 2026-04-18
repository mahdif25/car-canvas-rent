import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, Globe, Facebook, Megaphone, Car } from "lucide-react";

const stepLabels: Record<number, string> = {
  1: "Dates & Lieu",
  2: "Véhicule",
  3: "Options",
  4: "Informations",
  5: "Confirmation",
};

const sourceLabels: Record<string, { label: string; color: string; icon: any }> = {
  website: { label: "Site web", color: "bg-blue-100 text-blue-700", icon: Globe },
  facebook_lead_ad: { label: "FB Lead Ad", color: "bg-indigo-100 text-indigo-700", icon: Facebook },
  facebook_landing: { label: "Landing Page", color: "bg-purple-100 text-purple-700", icon: Megaphone },
};

interface LeadRow {
  id: string;
  visitor_id: string | null;
  session_id: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  license_number: string | null;
  last_reservation_step: number | null;
  reservation_completed: boolean | null;
  reservation_id: string | null;
  capi_allowed: boolean;
  source: string;
  created_at: string | null;
  updated_at: string | null;
  vehicle_id: string | null;
  pickup_date: string | null;
  return_date: string | null;
  pickup_time: string | null;
  return_time: string | null;
  pickup_location: string | null;
  return_location: string | null;
  nationality: string | null;
  dob: string | null;
  cin: string | null;
  passport: string | null;
  license_delivery_date: string | null;
  cin_expiry_date: string | null;
  selected_color_id: string | null;
  selected_addons: string[] | null;
  promo_code: string | null;
  // Facebook Lead Ads fields
  fb_leadgen_id: string | null;
  fb_page_id: string | null;
  fb_form_id: string | null;
  fb_form_name: string | null;
  fb_ad_id: string | null;
  fb_ad_name: string | null;
  fb_adset_id: string | null;
  fb_adset_name: string | null;
  fb_campaign_id: string | null;
  fb_campaign_name: string | null;
  fb_ad_account_id: string | null;
  fb_pixel_id: string | null;
  fb_platform: string | null;
  fb_is_organic: boolean | null;
  fb_is_test_lead: boolean | null;
  fb_lead_type: string | null;
  fb_created_time: string | null;
  fb_raw_field_data: Array<{ name: string; values: string[] }> | null;
}

interface GroupedLead {
  key: string;
  latestEmail: string | null;
  latestPhone: string | null;
  latestFirstName: string | null;
  latestLastName: string | null;
  latestLicense: string | null;
  latestSource: string;
  latestVehicleId: string | null;
  maxStep: number;
  completed: boolean;
  entryCount: number;
  resCount: number;
  status: string;
  entries: LeadRow[];
  latestUpdated: string;
}

const AdminLeads = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      return ((data ?? []) as unknown) as LeadRow[];
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["admin-reservations-for-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("id, customer_email, status");
      return data ?? [];
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin-vehicles-for-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("vehicles").select("id, name, brand, model");
      return data ?? [];
    },
  });

  const vehicleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of vehicles) {
      map.set(v.id, v.name || `${v.brand} ${v.model}`);
    }
    return map;
  }, [vehicles]);

  const grouped: GroupedLead[] = useMemo(() => {
    const map = new Map<string, LeadRow[]>();
    for (const lead of leads) {
      const key = lead.email?.toLowerCase() || lead.visitor_id || lead.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(lead);
    }

    return Array.from(map.entries()).map(([key, entries]) => {
      const latest = entries[0];
      const maxStep = Math.max(...entries.map((e) => e.last_reservation_step ?? 0));
      const completed = entries.some((e) => e.reservation_completed);
      const email = latest.email?.toLowerCase() ?? null;
      const matchingRes = email
        ? reservations.filter((r: any) => r.customer_email?.toLowerCase() === email)
        : [];

      let status: string;
      if (completed) status = "client";
      else if (maxStep >= 2) status = "abandonné";
      else status = "lead";

      return {
        key,
        latestEmail: latest.email,
        latestPhone: latest.phone,
        latestFirstName: latest.first_name,
        latestLastName: latest.last_name,
        latestLicense: latest.license_number,
        latestSource: latest.source || "website",
        latestVehicleId: latest.vehicle_id,
        maxStep,
        completed,
        entryCount: entries.length,
        resCount: matchingRes.length,
        status,
        entries,
        latestUpdated: latest.updated_at || latest.created_at || "",
      };
    }).sort((a, b) => new Date(b.latestUpdated).getTime() - new Date(a.latestUpdated).getTime());
  }, [leads, reservations]);

  const filtered = useMemo(() => {
    let result = grouped;
    if (statusFilter !== "all") {
      result = result.filter((g) => g.status === statusFilter);
    }
    if (sourceFilter !== "all") {
      if (sourceFilter.startsWith("fb_")) {
        const type = sourceFilter.slice(3); // real_user | test_lead | facebook_bot
        result = result.filter(
          (g) =>
            g.latestSource === "facebook_lead_ad" &&
            g.entries.some((e) => e.fb_lead_type === type)
        );
      } else {
        result = result.filter((g) => g.latestSource === sourceFilter);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.latestEmail?.toLowerCase().includes(q) ||
          g.latestPhone?.includes(q) ||
          g.latestFirstName?.toLowerCase().includes(q) ||
          g.latestLastName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [grouped, statusFilter, sourceFilter, search]);

  const sourceBadge = (source: string) => {
    const info = sourceLabels[source] || { label: source, color: "bg-secondary text-muted-foreground", icon: Globe };
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
        <Icon size={10} />
        {info.label}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      client: "bg-green-100 text-green-700",
      abandonné: "bg-yellow-100 text-yellow-700",
      lead: "bg-blue-100 text-blue-700",
    };
    const labels: Record<string, string> = {
      client: "Client",
      abandonné: "Abandonné",
      lead: "Lead",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-secondary text-muted-foreground"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const fmtDate = (d: string | null) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-full sm:w-52" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="abandonné">Abandonné</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes sources</SelectItem>
              <SelectItem value="website">Site web</SelectItem>
              <SelectItem value="facebook_lead_ad">FB Lead Ad (toutes)</SelectItem>
              <SelectItem value="fb_real_user">FB Lead Ad – Réel</SelectItem>
              <SelectItem value="fb_test_lead">FB Lead Ad – Test</SelectItem>
              <SelectItem value="fb_facebook_bot">FB Lead Ad – Bot</SelectItem>
              <SelectItem value="facebook_landing">Landing Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : filtered.length > 0 ? (
            <div className="space-y-2">
              {/* Desktop header */}
              <div className="hidden md:grid grid-cols-9 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                <span>Nom</span>
                <span>Email</span>
                <span>Téléphone</span>
                <span>Véhicule</span>
                <span>Source</span>
                <span>Étape max</span>
                <span>Entrées</span>
                <span>Réservations</span>
                <span>Statut</span>
              </div>
              {filtered.map((group) => (
                <div key={group.key} className="border rounded-lg">
                  {/* Desktop row */}
                  <div
                    className="hidden md:grid grid-cols-9 gap-2 px-4 py-3 cursor-pointer hover:bg-secondary/50 items-center text-sm"
                    onClick={() => setExpandedKey(expandedKey === group.key ? null : group.key)}
                  >
                    <span className="font-medium">{[group.latestFirstName, group.latestLastName].filter(Boolean).join(" ") || "—"}</span>
                    <span className="break-all text-muted-foreground">{group.latestEmail || "—"}</span>
                    <span className="text-muted-foreground">{group.latestPhone || "—"}</span>
                    <span className="text-muted-foreground truncate">
                      {group.latestVehicleId ? (
                        <span className="inline-flex items-center gap-1">
                          <Car size={12} className="text-primary shrink-0" />
                          {vehicleMap.get(group.latestVehicleId) || "—"}
                        </span>
                      ) : "—"}
                    </span>
                    <span>{sourceBadge(group.latestSource)}</span>
                    <span>{stepLabels[group.maxStep] || `Étape ${group.maxStep}`}</span>
                    <span>{group.entryCount}</span>
                    <span>{group.resCount}</span>
                    <div className="flex items-center gap-2">
                      {statusBadge(group.status)}
                      {expandedKey === group.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Mobile card row */}
                  <div
                    className="md:hidden p-3 cursor-pointer"
                    onClick={() => setExpandedKey(expandedKey === group.key ? null : group.key)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{[group.latestFirstName, group.latestLastName].filter(Boolean).join(" ") || "—"}</span>
                      <div className="flex items-center gap-2">
                        {statusBadge(group.status)}
                        {expandedKey === group.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{group.latestEmail || "—"}</p>
                    {group.latestVehicleId && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Car size={10} className="text-primary" />
                        {vehicleMap.get(group.latestVehicleId) || "—"}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {sourceBadge(group.latestSource)}
                      <span>{stepLabels[group.maxStep] || `Étape ${group.maxStep}`}</span>
                      <span>{group.entryCount} entrée{group.entryCount > 1 ? "s" : ""}</span>
                      <span>{group.resCount} rés.</span>
                    </div>
                  </div>

                  {expandedKey === group.key && (
                    <div className="border-t p-4 bg-secondary/30 space-y-3 text-sm">
                      <p className="font-medium text-xs text-muted-foreground mb-2">Historique des captures ({group.entryCount} entrées)</p>
                      <div className="space-y-2 max-h-80 overflow-auto">
                        {group.entries.map((entry) => (
                          <div key={entry.id} className="border rounded-md p-3 bg-background space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {entry.created_at ? new Date(entry.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                              </span>
                              <span className="text-xs font-medium">
                                {stepLabels[entry.last_reservation_step ?? 0] || `Étape ${entry.last_reservation_step}`}
                              </span>
                            </div>

                            {/* Facebook Lead Ad metadata */}
                            {entry.source === "facebook_lead_ad" && (
                              <div className="border-t border-border pt-2 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {entry.fb_lead_type === "real_user" && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Utilisateur réel</span>
                                  )}
                                  {entry.fb_lead_type === "test_lead" && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">Test Facebook</span>
                                  )}
                                  {entry.fb_lead_type === "facebook_bot" && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Bot Facebook</span>
                                  )}
                                  {entry.fb_platform && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-secondary">{entry.fb_platform}</span>
                                  )}
                                  {entry.fb_is_organic && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-secondary">Organique</span>
                                  )}
                                  {entry.fb_created_time && (
                                    <span className="text-xs text-muted-foreground">
                                      FB: {new Date(entry.fb_created_time).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                                    </span>
                                  )}
                                </div>

                                {(entry.fb_campaign_name || entry.fb_adset_name || entry.fb_ad_name || entry.fb_form_name) && (
                                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
                                    {entry.fb_campaign_name && <span className="px-1.5 py-0.5 rounded bg-secondary">{entry.fb_campaign_name}</span>}
                                    {entry.fb_adset_name && <><span>›</span><span className="px-1.5 py-0.5 rounded bg-secondary">{entry.fb_adset_name}</span></>}
                                    {entry.fb_ad_name && <><span>›</span><span className="px-1.5 py-0.5 rounded bg-secondary">{entry.fb_ad_name}</span></>}
                                    {entry.fb_form_name && <><span>›</span><span className="px-1.5 py-0.5 rounded bg-secondary font-medium">{entry.fb_form_name}</span></>}
                                  </div>
                                )}

                                {(entry.fb_pixel_id || entry.fb_ad_account_id) && (
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    {entry.fb_ad_account_id && (
                                      <span className="px-2 py-0.5 rounded-full bg-secondary"><span className="text-muted-foreground">Ad Account:</span> {entry.fb_ad_account_id}</span>
                                    )}
                                    {entry.fb_pixel_id && (
                                      <span className="px-2 py-0.5 rounded-full bg-secondary"><span className="text-muted-foreground">Pixel:</span> {entry.fb_pixel_id}</span>
                                    )}
                                  </div>
                                )}

                                {entry.fb_raw_field_data && entry.fb_raw_field_data.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Champs soumis :</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                      {entry.fb_raw_field_data
                                        .filter((fd) => fd.values && fd.values.some((v) => v))
                                        .map((fd, i) => (
                                          <div key={i} className="break-all">
                                            <span className="text-muted-foreground">{fd.name}:</span> {fd.values.filter(Boolean).join(", ")}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {entry.first_name && <div><span className="text-muted-foreground">Prénom:</span> {entry.first_name}</div>}
                              {entry.last_name && <div><span className="text-muted-foreground">Nom:</span> {entry.last_name}</div>}
                              {entry.email && <div className="break-all"><span className="text-muted-foreground">Email:</span> {entry.email}</div>}
                              {entry.phone && <div><span className="text-muted-foreground">Tél:</span> {entry.phone}</div>}
                            </div>

                            {/* Vehicle & dates */}
                            {(entry.vehicle_id || entry.pickup_date || entry.pickup_location) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs border-t border-border pt-2">
                                {entry.vehicle_id && (
                                  <div className="flex items-center gap-1">
                                    <Car size={10} className="text-primary shrink-0" />
                                    <span className="text-muted-foreground">Véhicule:</span> {vehicleMap.get(entry.vehicle_id) || entry.vehicle_id.slice(0, 8)}
                                  </div>
                                )}
                                {entry.pickup_date && <div><span className="text-muted-foreground">Départ:</span> {fmtDate(entry.pickup_date)} {entry.pickup_time || ""}</div>}
                                {entry.return_date && <div><span className="text-muted-foreground">Retour:</span> {fmtDate(entry.return_date)} {entry.return_time || ""}</div>}
                                {entry.pickup_location && <div><span className="text-muted-foreground">Lieu départ:</span> {entry.pickup_location}</div>}
                                {entry.return_location && <div><span className="text-muted-foreground">Lieu retour:</span> {entry.return_location}</div>}
                              </div>
                            )}

                            {/* Driver details */}
                            {(entry.nationality || entry.cin || entry.passport || entry.license_number || entry.dob) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs border-t border-border pt-2">
                                {entry.nationality && <div><span className="text-muted-foreground">Nationalité:</span> {entry.nationality}</div>}
                                {entry.dob && <div><span className="text-muted-foreground">Né(e):</span> {fmtDate(entry.dob)}</div>}
                                {entry.cin && <div><span className="text-muted-foreground">CIN:</span> {entry.cin}</div>}
                                {entry.passport && <div><span className="text-muted-foreground">Passeport:</span> {entry.passport}</div>}
                                {entry.license_number && <div><span className="text-muted-foreground">Permis:</span> {entry.license_number}</div>}
                                {entry.license_delivery_date && <div><span className="text-muted-foreground">Délivré:</span> {fmtDate(entry.license_delivery_date)}</div>}
                                {entry.cin_expiry_date && <div><span className="text-muted-foreground">Exp. CIN:</span> {fmtDate(entry.cin_expiry_date)}</div>}
                              </div>
                            )}

                            {/* Promo & addons */}
                            {(entry.promo_code || (entry.selected_addons && entry.selected_addons.length > 0)) && (
                              <div className="text-xs border-t border-border pt-2 flex gap-3 flex-wrap">
                                {entry.promo_code && <span><span className="text-muted-foreground">Promo:</span> {entry.promo_code}</span>}
                                {entry.selected_addons && entry.selected_addons.length > 0 && (
                                  <span><span className="text-muted-foreground">Options:</span> {entry.selected_addons.length} sélectionnée(s)</span>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              {entry.reservation_completed && (
                                <span className="text-xs text-green-600 font-medium">✓ Réservation complétée</span>
                              )}
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${entry.capi_allowed ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                {entry.capi_allowed ? "CAPI ✓" : "CAPI ✗"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              Session: {entry.session_id?.slice(0, 8)}… | Visitor: {entry.visitor_id?.slice(0, 8)}…
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucun lead capturé.</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminLeads;
