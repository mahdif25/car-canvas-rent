import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, CalendarDays, Clock, CheckCircle } from "lucide-react";

const AdminDashboard = () => {
  const { data: vehicles } = useQuery({
    queryKey: ["admin-vehicles-count"],
    queryFn: async () => {
      const { count } = await supabase.from("vehicles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: reservations } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const pending = reservations?.filter((r) => r.status === "pending").length ?? 0;
  const active = reservations?.filter((r) => r.status === "active").length ?? 0;
  const completed = reservations?.filter((r) => r.status === "completed").length ?? 0;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Véhicules", value: vehicles ?? 0, icon: Car, color: "text-primary" },
          { label: "En attente", value: pending, icon: Clock, color: "text-yellow-500" },
          { label: "Actives", value: active, icon: CalendarDays, color: "text-blue-500" },
          { label: "Terminées", value: completed, icon: CheckCircle, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <s.icon className={s.color} size={32} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Réservations récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations && reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Client</th>
                    <th className="text-left py-2 px-3">Dates</th>
                    <th className="text-left py-2 px-3">Statut</th>
                    <th className="text-right py-2 px-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 px-3">{r.customer_first_name} {r.customer_last_name}</td>
                      <td className="py-2 px-3">{r.pickup_date} → {r.return_date}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          r.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                          r.status === "active" ? "bg-green-100 text-green-700" :
                          r.status === "completed" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-medium">{Number(r.total_price).toLocaleString()} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune réservation pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
