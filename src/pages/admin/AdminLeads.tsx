import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, Globe, Facebook, Megaphone } from "lucide-react";

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
}

interface GroupedLead {
  key: string;
  latestEmail: string | null;
  latestPhone: string | null;
  latestFirstName: string | null;
  latestLastName: string | null;
  latestLicense: string | null;
  latestSource: string;
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
      return (data ?? []) as LeadRow[];
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["admin-reservations-for-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("id, customer_email, status");
      return data ?? [];
    },
  });

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
      result = result.filter((g) => g.latestSource === sourceFilter);
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
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes sources</SelectItem>
              <SelectItem value="website">Site web</SelectItem>
              <SelectItem value="facebook_lead_ad">FB Lead Ad</SelectItem>
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
              <div className="hidden md:grid grid-cols-8 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                <span>Nom</span>
                <span>Email</span>
                <span>Téléphone</span>
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
                    className="hidden md:grid grid-cols-8 gap-2 px-4 py-3 cursor-pointer hover:bg-secondary/50 items-center text-sm"
                    onClick={() => setExpandedKey(expandedKey === group.key ? null : group.key)}
                  >
                    <span className="font-medium">{[group.latestFirstName, group.latestLastName].filter(Boolean).join(" ") || "—"}</span>
                    <span className="break-all text-muted-foreground">{group.latestEmail || "—"}</span>
                    <span className="text-muted-foreground">{group.latestPhone || "—"}</span>
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
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{stepLabels[group.maxStep] || `Étape ${group.maxStep}`}</span>
                      <span>{group.entryCount} entrée{group.entryCount > 1 ? "s" : ""}</span>
                      <span>{group.resCount} rés.</span>
                    </div>
                  </div>

                  {expandedKey === group.key && (
                    <div className="border-t p-4 bg-secondary/30 space-y-3 text-sm">
                      <p className="font-medium text-xs text-muted-foreground mb-2">Historique des captures ({group.entryCount} entrées)</p>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {group.entries.map((entry) => (
                          <div key={entry.id} className="border rounded-md p-3 bg-background space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {entry.created_at ? new Date(entry.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                              </span>
                              <span className="text-xs font-medium">
                                {stepLabels[entry.last_reservation_step ?? 0] || `Étape ${entry.last_reservation_step}`}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {entry.first_name && <div><span className="text-muted-foreground">Prénom:</span> {entry.first_name}</div>}
                              {entry.last_name && <div><span className="text-muted-foreground">Nom:</span> {entry.last_name}</div>}
                              {entry.email && <div className="break-all"><span className="text-muted-foreground">Email:</span> {entry.email}</div>}
                              {entry.phone && <div><span className="text-muted-foreground">Tél:</span> {entry.phone}</div>}
                              {entry.license_number && <div><span className="text-muted-foreground">Permis:</span> {entry.license_number}</div>}
                            </div>
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
