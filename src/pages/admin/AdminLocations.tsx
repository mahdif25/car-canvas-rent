import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAllLocations, Location } from "@/hooks/useLocations";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

const AdminLocations = () => {
  const { data: locations = [], isLoading } = useAllLocations();
  const queryClient = useQueryClient();

  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newIsFree, setNewIsFree] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editIsFree, setEditIsFree] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["locations-all"] });
    queryClient.invalidateQueries({ queryKey: ["locations"] });
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("locations").insert({
      name: newName.trim(),
      delivery_fee: parseFloat(newFee) || 0,
      is_free: newIsFree,
    });
    if (error) {
      toast.error("Erreur: " + error.message);
      return;
    }
    toast.success("Lieu ajouté");
    setNewName("");
    setNewFee("");
    setNewIsFree(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) {
      toast.error("Erreur: " + error.message);
      return;
    }
    toast.success("Lieu supprimé");
    refresh();
  };

  const handleToggleEnabled = async (loc: Location) => {
    const { error } = await supabase
      .from("locations")
      .update({ is_enabled: !loc.is_enabled })
      .eq("id", loc.id);
    if (error) {
      toast.error("Erreur: " + error.message);
      return;
    }
    refresh();
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditFee(String(loc.delivery_fee));
    setEditIsFree(loc.is_free);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    const { error } = await supabase
      .from("locations")
      .update({
        name: editName.trim(),
        delivery_fee: parseFloat(editFee) || 0,
        is_free: editIsFree,
      })
      .eq("id", editingId);
    if (error) {
      toast.error("Erreur: " + error.message);
      return;
    }
    toast.success("Lieu modifié");
    setEditingId(null);
    refresh();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Gestion des lieux</h1>

      {/* Add form */}
      <div className="bg-background border border-border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Ajouter un lieu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-end gap-3">
          <div className="space-y-1 flex-1 min-w-[180px]">
            <label className="text-sm font-medium">Nom</label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Casablanca Aéroport" />
          </div>
          <div className="space-y-1 sm:w-32">
            <label className="text-sm font-medium">Frais (MAD)</label>
            <Input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Gratuit</label>
            <div className="h-10 flex items-center">
              <Switch checked={newIsFree} onCheckedChange={setNewIsFree} />
            </div>
          </div>
          <Button onClick={handleAdd} className="gap-1 w-full sm:w-auto">
            <Plus size={16} /> Ajouter
          </Button>
        </div>
      </div>

      {/* Table/Cards */}
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Lieu</th>
                  <th className="text-left px-4 py-3 font-medium">Frais livraison</th>
                  <th className="text-center px-4 py-3 font-medium">Gratuit</th>
                  <th className="text-center px-4 py-3 font-medium">Actif</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    {editingId === loc.id ? (
                      <>
                        <td className="px-4 py-3">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                        </td>
                        <td className="px-4 py-3">
                          <Input type="number" value={editFee} onChange={(e) => setEditFee(e.target.value)} className="h-8 w-24" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch checked={editIsFree} onCheckedChange={setEditIsFree} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch checked={loc.is_enabled} onCheckedChange={() => handleToggleEnabled(loc)} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={saveEdit}><Check size={16} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X size={16} /></Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{loc.name}</td>
                        <td className="px-4 py-3">{loc.is_free ? <span className="text-primary font-medium">Gratuit</span> : `${Number(loc.delivery_fee).toLocaleString()} MAD`}</td>
                        <td className="px-4 py-3 text-center">
                          <Switch checked={loc.is_free} onCheckedChange={async () => {
                            await supabase.from("locations").update({ is_free: !loc.is_free }).eq("id", loc.id);
                            refresh();
                          }} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Switch checked={loc.is_enabled} onCheckedChange={() => handleToggleEnabled(loc)} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(loc)}><Pencil size={16} /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 size={16} /></Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {locations.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun lieu configuré</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {locations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucun lieu configuré</p>
            ) : locations.map((loc) => (
              <div key={loc.id} className="border rounded-lg p-4 bg-background space-y-3">
                {editingId === loc.id ? (
                  <>
                    <div className="space-y-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nom du lieu" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Frais (MAD)</label>
                          <Input type="number" value={editFee} onChange={(e) => setEditFee(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Gratuit</label>
                          <div className="h-10 flex items-center"><Switch checked={editIsFree} onCheckedChange={setEditIsFree} /></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} className="flex-1"><Check size={16} className="mr-1" /> Sauver</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="flex-1"><X size={16} className="mr-1" /> Annuler</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{loc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {loc.is_free ? <span className="text-primary font-medium">Gratuit</span> : `${Number(loc.delivery_fee).toLocaleString()} MAD`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => startEdit(loc)}><Pencil size={16} /></Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={loc.is_enabled} onCheckedChange={() => handleToggleEnabled(loc)} />
                        <span className="text-xs text-muted-foreground">{loc.is_enabled ? "Actif" : "Inactif"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={loc.is_free} onCheckedChange={async () => {
                          await supabase.from("locations").update({ is_free: !loc.is_free }).eq("id", loc.id);
                          refresh();
                        }} />
                        <span className="text-xs text-muted-foreground">Gratuit</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminLocations;
