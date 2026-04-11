import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminAddons = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price_per_day: 0, is_enabled: true });

  const { data: addons, isLoading } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: async () => {
      const { data } = await supabase.from("addon_options").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("addon_options").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addon_options").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-addons"] });
      toast({ title: editingId ? "Option modifiée" : "Option ajoutée" });
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addon_options").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-addons"] });
      toast({ title: "Option supprimée" });
    },
  });

  const toggleEnabled = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from("addon_options").update({ is_enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-addons"] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", price_per_day: 0, is_enabled: true });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des options</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill gap-2">
            <Plus size={18} /> <span className="hidden sm:inline">Ajouter une option</span><span className="sm:hidden">Ajouter</span>
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Modifier l'option" : "Nouvelle option"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="GPS" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix/jour (MAD)</label>
                <Input type="number" value={form.price_per_day} onChange={(e) => setForm((f) => ({ ...f, price_per_day: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Navigation GPS portable" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_enabled} onCheckedChange={(checked) => setForm((f) => ({ ...f, is_enabled: checked }))} />
              <label className="text-sm">Activé</label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill w-full sm:w-auto">
                {saveMutation.isPending ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="rounded-pill w-full sm:w-auto">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : addons && addons.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Nom</th>
                      <th className="text-left py-2 px-3">Description</th>
                      <th className="text-right py-2 px-3">Prix/jour</th>
                      <th className="text-center py-2 px-3">Activé</th>
                      <th className="text-right py-2 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addons.map((a) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2 px-3 font-medium">{a.name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{a.description}</td>
                        <td className="py-2 px-3 text-right">{Number(a.price_per_day)} MAD</td>
                        <td className="py-2 px-3 text-center">
                          <Switch checked={a.is_enabled} onCheckedChange={(checked) => toggleEnabled.mutate({ id: a.id, is_enabled: checked })} />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingId(a.id); setForm({ name: a.name, description: a.description ?? "", price_per_day: Number(a.price_per_day), is_enabled: a.is_enabled }); setShowForm(true); }}>
                              <Pencil size={16} />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(a.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {addons.map((a) => (
                  <div key={a.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{a.name}</p>
                        {a.description && <p className="text-sm text-muted-foreground mt-0.5">{a.description}</p>}
                      </div>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">{Number(a.price_per_day)} MAD/j</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={a.is_enabled} onCheckedChange={(checked) => toggleEnabled.mutate({ id: a.id, is_enabled: checked })} />
                        <span className="text-xs text-muted-foreground">{a.is_enabled ? "Activé" : "Désactivé"}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => { setEditingId(a.id); setForm({ name: a.name, description: a.description ?? "", price_per_day: Number(a.price_per_day), is_enabled: a.is_enabled }); setShowForm(true); }}>
                          <Pencil size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => deleteMutation.mutate(a.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucune option. Ajoutez votre première option.</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAddons;
