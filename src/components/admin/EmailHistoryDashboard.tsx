import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailLog {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  metadata: any;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
  sent: { label: "Envoyé", variant: "default", icon: CheckCircle },
  pending: { label: "En attente", variant: "secondary", icon: Clock },
  failed: { label: "Échoué", variant: "destructive", icon: XCircle },
  dlq: { label: "Échoué", variant: "destructive", icon: XCircle },
  suppressed: { label: "Supprimé", variant: "outline", icon: AlertTriangle },
  bounced: { label: "Rebondi", variant: "destructive", icon: XCircle },
  complained: { label: "Plainte", variant: "destructive", icon: AlertTriangle },
};

const TEMPLATE_LABELS: Record<string, string> = {
  "reservation-confirmation": "Confirmation",
  "reservation-update": "Mise à jour",
  "welcome-email": "Bienvenue",
  "promotional-email": "Promotion",
  "auth_emails": "Authentification",
};

const TIME_RANGES = [
  { label: "24h", value: 1 },
  { label: "7j", value: 7 },
  { label: "30j", value: 30 },
];

const PAGE_SIZE = 50;

export default function EmailHistoryDashboard() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysRange, setDaysRange] = useState(7);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - daysRange);

      const { data, error } = await supabase
        .from("email_send_log")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(2000);

      if (error) {
        console.error("Error fetching email logs:", error);
        setLogs([]);
      } else {
        setLogs((data as EmailLog[]) || []);
      }
      setLoading(false);
    };
    fetchLogs();
  }, [daysRange]);

  // Deduplicate by message_id — keep latest status per email
  const deduplicated = useMemo(() => {
    const map = new Map<string, EmailLog>();
    for (const log of logs) {
      const key = log.message_id || log.id;
      if (!map.has(key)) {
        map.set(key, log);
      }
    }
    return Array.from(map.values());
  }, [logs]);

  // Apply filters
  const filtered = useMemo(() => {
    return deduplicated.filter((log) => {
      if (templateFilter !== "all" && log.template_name !== templateFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "failed" && log.status !== "failed" && log.status !== "dlq") return false;
        if (statusFilter !== "failed" && log.status !== statusFilter) return false;
      }
      return true;
    });
  }, [deduplicated, templateFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = deduplicated.length;
    const sent = deduplicated.filter((l) => l.status === "sent").length;
    const failed = deduplicated.filter((l) => l.status === "failed" || l.status === "dlq").length;
    const pending = deduplicated.filter((l) => l.status === "pending").length;
    return { total, sent, failed, pending };
  }, [deduplicated]);

  // Distinct templates
  const templates = useMemo(() => {
    const set = new Set(logs.map((l) => l.template_name));
    return Array.from(set).sort();
  }, [logs]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [templateFilter, statusFilter, daysRange]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] || { label: status, variant: "outline" as const, icon: Clock };
    return <Badge variant={cfg.variant} className="gap-1 text-xs"><cfg.icon size={12} />{cfg.label}</Badge>;
  };

  const getTemplateLabel = (name: string) => TEMPLATE_LABELS[name] || name;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-lg">Historique des emails</h2>

      <Alert className="bg-muted/50 border-border">
        <Info size={16} />
        <AlertDescription className="text-xs text-muted-foreground">
          Le suivi des ouvertures et clics sera disponible prochainement.
        </AlertDescription>
      </Alert>

      {/* Time range */}
      <div className="flex flex-wrap gap-2 items-center">
        {TIME_RANGES.map((r) => (
          <Button
            key={r.value}
            size="sm"
            variant={daysRange === r.value ? "default" : "outline"}
            onClick={() => setDaysRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Mail, color: "text-foreground" },
          { label: "Envoyés", value: stats.sent, icon: CheckCircle, color: "text-green-600" },
          { label: "Échoués", value: stats.failed, icon: XCircle, color: "text-destructive" },
          { label: "En attente", value: stats.pending, icon: Clock, color: "text-yellow-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon size={20} className={s.color} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t} value={t}>{getTemplateLabel(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="sent">Envoyé</SelectItem>
            <SelectItem value="failed">Échoué</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="suppressed">Supprimé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Erreur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun email trouvé
                </TableCell>
              </TableRow>
            )}
            {paged.map((log) => (
              <>
                <TableRow
                  key={log.id}
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{getTemplateLabel(log.template_name)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{log.recipient_email}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                  <TableCell className="text-sm text-destructive max-w-[200px] truncate">{log.error_message || "—"}</TableCell>
                </TableRow>
                {expandedId === log.id && (
                  <TableRow key={`${log.id}-detail`}>
                    <TableCell colSpan={5} className="bg-muted/30 p-4">
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Message ID:</span> {log.message_id || "—"}</p>
                        <p><span className="font-medium">Template:</span> {log.template_name}</p>
                        <p><span className="font-medium">Destinataire:</span> {log.recipient_email}</p>
                        {log.error_message && (
                          <p><span className="font-medium">Erreur:</span> <span className="text-destructive">{log.error_message}</span></p>
                        )}
                        {log.metadata && (
                          <details>
                            <summary className="cursor-pointer font-medium text-muted-foreground">Métadonnées</summary>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {paged.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun email trouvé</p>
        )}
        {paged.map((log) => (
          <Card
            key={log.id}
            className="cursor-pointer"
            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs">{getTemplateLabel(log.template_name)}</Badge>
                {getStatusBadge(log.status)}
              </div>
              <p className="text-sm truncate">{log.recipient_email}</p>
              <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
              {log.error_message && (
                <p className="text-xs text-destructive truncate">{log.error_message}</p>
              )}
              {expandedId === log.id && (
                <div className="pt-2 border-t border-border space-y-1 text-xs">
                  <p><span className="font-medium">Message ID:</span> {log.message_id || "—"}</p>
                  {log.metadata && (
                    <details>
                      <summary className="cursor-pointer font-medium text-muted-foreground">Métadonnées</summary>
                      <pre className="mt-1 text-[10px] bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""} — Page {page + 1}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
