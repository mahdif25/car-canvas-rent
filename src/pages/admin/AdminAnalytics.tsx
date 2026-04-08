import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { Users, Eye, Monitor, Globe } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const AdminAnalytics = () => {
  const [range, setRange] = useState("7");

  const since = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - Number(range));
    return d.toISOString();
  }, [range]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["analytics-events", range],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const uniqueVisitors = new Set(events.map((e: any) => e.visitor_id)).size;
    const totalPageViews = events.filter((e: any) => e.event_type === "page_view").length;
    const totalSessions = new Set(events.map((e: any) => e.session_id)).size;
    const reservationSteps = events.filter((e: any) => e.event_type === "reservation_step");

    // Pages
    const pageCounts: Record<string, number> = {};
    events.filter((e: any) => e.event_type === "page_view").forEach((e: any) => {
      pageCounts[e.page_path || "/"] = (pageCounts[e.page_path || "/"] || 0) + 1;
    });
    const pages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    // Devices
    const deviceCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      deviceCounts[e.device_type || "unknown"] = (deviceCounts[e.device_type || "unknown"] || 0) + 1;
    });
    const devices = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

    // Browsers
    const browserCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      browserCounts[e.browser || "unknown"] = (browserCounts[e.browser || "unknown"] || 0) + 1;
    });
    const browsers = Object.entries(browserCounts).map(([name, value]) => ({ name, value }));

    // OS
    const osCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      osCounts[e.os || "unknown"] = (osCounts[e.os || "unknown"] || 0) + 1;
    });
    const osList = Object.entries(osCounts).map(([name, value]) => ({ name, value }));

    // Locations
    const locCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      const loc = [e.country, e.city].filter(Boolean).join(", ") || "Inconnu";
      locCounts[loc] = (locCounts[loc] || 0) + 1;
    });
    const locationsList = Object.entries(locCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);

    // Referrers
    const refCounts: Record<string, number> = {};
    events.filter((e: any) => e.referrer).forEach((e: any) => {
      try {
        const host = new URL(e.referrer).hostname;
        refCounts[host] = (refCounts[host] || 0) + 1;
      } catch {
        refCounts[e.referrer] = (refCounts[e.referrer] || 0) + 1;
      }
    });
    const referrers = Object.entries(refCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Funnel
    const stepLabels = ["Dates & Lieu", "Véhicule", "Options", "Informations", "Confirmation"];
    const stepCounts = [1, 2, 3, 4, 5].map((step) => {
      const visitors = new Set(
        reservationSteps
          .filter((e: any) => e.metadata?.step >= step)
          .map((e: any) => e.visitor_id)
      ).size;
      return { name: stepLabels[step - 1], value: visitors, step };
    });

    // Daily views chart
    const dailyMap: Record<string, number> = {};
    events.filter((e: any) => e.event_type === "page_view").forEach((e: any) => {
      const day = new Date(e.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const dailyViews = Object.entries(dailyMap).map(([day, views]) => ({ day, views })).reverse();

    return { uniqueVisitors, totalPageViews, totalSessions, pages, devices, browsers, osList, locationsList, referrers, stepCounts, dailyViews };
  }, [events]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Aujourd'hui</SelectItem>
            <SelectItem value="7">7 jours</SelectItem>
            <SelectItem value="30">30 jours</SelectItem>
            <SelectItem value="90">90 jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Chargement...</p>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <Users className="text-primary" size={28} />
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>
                  <p className="text-sm text-muted-foreground">Visiteurs uniques</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <Eye className="text-primary" size={28} />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPageViews}</p>
                  <p className="text-sm text-muted-foreground">Pages vues</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <Monitor className="text-primary" size={28} />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily views chart */}
          {stats.dailyViews.length > 0 && (
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Pages vues par jour</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.dailyViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="funnel" className="space-y-4">
            <TabsList className="flex-wrap bg-secondary text-foreground">
              <TabsTrigger value="funnel">Entonnoir</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="devices">Appareils</TabsTrigger>
              <TabsTrigger value="locations">Géographie</TabsTrigger>
              <TabsTrigger value="referrers">Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="funnel">
              <Card>
                <CardHeader><CardTitle className="text-base">Entonnoir de réservation</CardTitle></CardHeader>
                <CardContent>
                  {stats.stepCounts.some((s) => s.value > 0) ? (
                    <div className="space-y-3">
                      {stats.stepCounts.map((step, i) => {
                        const maxVal = stats.stepCounts[0]?.value || 1;
                        const pct = maxVal > 0 ? Math.round((step.value / maxVal) * 100) : 0;
                        return (
                          <div key={step.step} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Étape {step.step}: {step.name}</span>
                              <span className="font-medium">{step.value} ({pct}%)</span>
                            </div>
                            <div className="h-6 bg-secondary rounded overflow-hidden">
                              <div
                                className="h-full rounded transition-all"
                                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Aucune donnée de réservation.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pages">
              <Card>
                <CardHeader><CardTitle className="text-base">Pages les plus visitées</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.pages.map((p) => (
                      <div key={p.path} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span className="font-mono">{p.path}</span>
                        <span className="font-medium">{p.count}</span>
                      </div>
                    ))}
                    {stats.pages.length === 0 && <p className="text-muted-foreground text-center py-4">Aucune donnée.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Type d'appareil", data: stats.devices },
                  { title: "Navigateur", data: stats.browsers },
                  { title: "Système", data: stats.osList },
                ].map((section) => (
                  <Card key={section.title}>
                    <CardHeader><CardTitle className="text-sm">{section.title}</CardTitle></CardHeader>
                    <CardContent>
                      {section.data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={section.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                              {section.data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-muted-foreground text-center text-sm">—</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="locations">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe size={18} /> Géographie des visiteurs</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.locationsList.map((l) => (
                      <div key={l.location} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span>{l.location}</span>
                        <span className="font-medium">{l.count}</span>
                      </div>
                    ))}
                    {stats.locationsList.length === 0 && <p className="text-muted-foreground text-center py-4">Aucune donnée.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrers">
              <Card>
                <CardHeader><CardTitle className="text-base">Sources de trafic</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.referrers.map((r) => (
                      <div key={r.source} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span>{r.source}</span>
                        <span className="font-medium">{r.count}</span>
                      </div>
                    ))}
                    {stats.referrers.length === 0 && <p className="text-muted-foreground text-center py-4">Aucune donnée (trafic direct).</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
