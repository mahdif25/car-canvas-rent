import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const stepLabels: Record<number, string> = {
  1: "Dates & Lieu",
  2: "Véhicule",
  3: "Options",
  4: "Informations",
  5: "Confirmation",
};

const AdminLeads = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  // Count reservations per email
  const { data: reservations = [] } = useQuery({
    queryKey: ["admin-reservations-for-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("id, customer_email, status");
      return data ?? [];
    },
  });

  // Visitor sessions for expanded detail
  const { data: events = [] } = useQuery({
    queryKey: ["analytics-events-for-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("visitor_id, session_id, page_path, device_type, browser, os, country, city, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      return data ?? [];
    },
  });

  const enrichedLeads = useMemo(() => {
    return leads.map((lead: any) => {
      const email = lead.email?.toLowerCase();
      const matchingRes = email
        ? reservations.filter((r: any) => r.customer_email?.toLowerCase() === email)
        : [];
      const resCount = matchingRes.length;
      const hasActiveRes = matchingRes.some((r: any) => ["pending", "confirmed", "active"].includes(r.status));

      let status: string;
      if (lead.reservation_completed) status = "client";
      else if (lead.last_reservation_step >= 2) status = "abandonné";
      else status = "lead";

      return { ...lead, resCount, hasActiveRes, status };
    });
  }, [leads, reservations]);

  const filtered = useMemo(() => {
    let result = enrichedLeads;
    if (statusFilter !== "all") {
      result = result.filter((l: any) => l.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l: any) =>
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.first_name?.toLowerCase().includes(q) ||
          l.last_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [enrichedLeads, statusFilter, search]);

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
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-secondary text-muted-foreground"}`}>{labels[status] || status}</span>;
  };

  const getVisitorEvents = (visitorId: string) =>
    events.filter((e: any) => e.visitor_id === visitorId).slice(0, 20);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-52"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="abandonné">Abandonné</SelectItem>
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
              {/* Header */}
              <div className="hidden md:grid grid-cols-7 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                <span>Nom</span>
                <span>Email</span>
                <span>Téléphone</span>
                <span>Permis</span>
                <span>Dernière étape</span>
                <span>Réservations</span>
                <span>Statut</span>
              </div>
              {filtered.map((lead: any) => (
                <div key={lead.id} className="border rounded-lg">
                  <div
                    className="grid grid-cols-1 md:grid-cols-7 gap-2 px-4 py-3 cursor-pointer hover:bg-secondary/50 items-center text-sm"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  >
                    <span className="font-medium">{[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"}</span>
                    <span className="break-all text-muted-foreground">{lead.email || "—"}</span>
                    <span className="text-muted-foreground">{lead.phone || "—"}</span>
                    <span className="text-muted-foreground">{lead.license_number || "—"}</span>
                    <span>{stepLabels[lead.last_reservation_step] || `Étape ${lead.last_reservation_step}`}</span>
                    <span>{lead.resCount}</span>
                    <div className="flex items-center gap-2">
                      {statusBadge(lead.status)}
                      {expandedId === lead.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {expandedId === lead.id && (
                    <div className="border-t p-4 bg-secondary/30 space-y-3 text-sm">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div><p className="text-muted-foreground text-xs">Visitor ID</p><p className="font-mono text-xs break-all">{lead.visitor_id}</p></div>
                        <div><p className="text-muted-foreground text-xs">Session ID</p><p className="font-mono text-xs break-all">{lead.session_id}</p></div>
                        <div><p className="text-muted-foreground text-xs">Créé le</p><p>{new Date(lead.created_at).toLocaleDateString("fr-FR")}</p></div>
                        <div><p className="text-muted-foreground text-xs">Mis à jour</p><p>{new Date(lead.updated_at).toLocaleDateString("fr-FR")}</p></div>
                      </div>

                      {lead.visitor_id && (
                        <div>
                          <p className="font-medium text-xs text-muted-foreground mb-2">Dernières pages visitées</p>
                          <div className="space-y-1 max-h-40 overflow-auto">
                            {getVisitorEvents(lead.visitor_id).map((ev: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs py-1 border-b last:border-0">
                                <span className="font-mono">{ev.page_path}</span>
                                <div className="flex gap-3 text-muted-foreground">
                                  <span>{ev.device_type}</span>
                                  <span>{ev.browser}</span>
                                  <span>{[ev.country, ev.city].filter(Boolean).join(", ")}</span>
                                  <span>{new Date(ev.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              </div>
                            ))}
                            {getVisitorEvents(lead.visitor_id).length === 0 && (
                              <p className="text-muted-foreground text-xs">Aucune activité.</p>
                            )}
                          </div>
                        </div>
                      )}
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
