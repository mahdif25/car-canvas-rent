import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { STRUCTURED_FEATURES } from "@/lib/vehicle-features";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];
type PricingTier = Database["public"]["Tables"]["vehicle_pricing_tiers"]["Row"];

const defaultTiers = [
  { min_days: 1, max_days: 3, daily_rate: 0 },
  { min_days: 4, max_days: 7, daily_rate: 0 },
  { min_days: 8, max_days: 14, daily_rate: 0 },
  { min_days: 15, max_days: 29, daily_rate: 0 },
  { min_days: 30, max_days: null as number | null, daily_rate: 0 },
];

const AdminFleet = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VehicleInsert> & { slug?: string }>({
    name: "", brand: "", model: "", year: new Date().getFullYear(),
    category: "Sedan", transmission: "Manuelle", fuel: "Diesel",
    seats: 5, doors: 4, luggage: 3, security_deposit: 0, is_available: true,
    features: [], has_climatisation: true, has_gps: false, has_bluetooth: false, has_usb: false, has_camera: false,
    slug: "",
  });
  const [tiers, setTiers] = useState(defaultTiers);
  const [featureInput, setFeatureInput] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: allTiers } = useQuery({
    queryKey: ["admin-pricing-tiers"],
    queryFn: async () => {
      const { data } = await supabase.from("vehicle_pricing_tiers").select("*");
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { slug, ...vehicleData } = form;
      const saveData = { ...vehicleData, slug: slug || null };
      if (editingId) {
        const { error } = await supabase.from("vehicles").update(saveData).eq("id", editingId);
        if (error) throw error;
        // Update tiers
        await supabase.from("vehicle_pricing_tiers").delete().eq("vehicle_id", editingId);
        const tierInserts = tiers.map((t) => ({ vehicle_id: editingId, ...t }));
        const { error: tierErr } = await supabase.from("vehicle_pricing_tiers").insert(tierInserts);
        if (tierErr) throw tierErr;
        // Update gallery images
        await supabase.from("vehicle_images").delete().eq("vehicle_id", editingId);
        if (galleryUrls.filter(Boolean).length > 0) {
          const imgInserts = galleryUrls.filter(Boolean).map((url, i) => ({ vehicle_id: editingId, image_url: url, sort_order: i }));
          const { error: imgErr } = await supabase.from("vehicle_images").insert(imgInserts);
          if (imgErr) throw imgErr;
        }
      } else {
        const { data, error } = await supabase.from("vehicles").insert(saveData as VehicleInsert).select().single();
        if (error) throw error;
        const tierInserts = tiers.map((t) => ({ vehicle_id: data.id, ...t }));
        const { error: tierErr } = await supabase.from("vehicle_pricing_tiers").insert(tierInserts);
        if (tierErr) throw tierErr;
        // Insert gallery images
        if (galleryUrls.filter(Boolean).length > 0) {
          const imgInserts = galleryUrls.filter(Boolean).map((url, i) => ({ vehicle_id: data.id, image_url: url, sort_order: i }));
          const { error: imgErr } = await supabase.from("vehicle_images").insert(imgInserts);
          if (imgErr) throw imgErr;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      qc.invalidateQueries({ queryKey: ["admin-pricing-tiers"] });
      toast({ title: editingId ? "Véhicule modifié" : "Véhicule ajouté" });
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
      toast({ title: "Véhicule supprimé" });
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase.from("vehicles").update({ is_available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vehicles"] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", brand: "", model: "", year: new Date().getFullYear(), category: "Sedan", transmission: "Manuelle", fuel: "Diesel", seats: 5, doors: 4, luggage: 3, security_deposit: 0, is_available: true, features: [], has_climatisation: true, has_gps: false, has_bluetooth: false, has_usb: false, has_camera: false, slug: "" });
    setTiers(defaultTiers);
    setFeatureInput("");
    setGalleryUrls([]);
  };

  const editVehicle = (v: Vehicle) => {
    setEditingId(v.id);
    setForm({ name: v.name, brand: v.brand, model: v.model, year: v.year, category: v.category, transmission: v.transmission, fuel: v.fuel, seats: v.seats, doors: v.doors, luggage: v.luggage, security_deposit: Number(v.security_deposit), is_available: v.is_available, image_url: v.image_url, features: v.features ?? [], has_climatisation: (v as any).has_climatisation ?? true, has_gps: (v as any).has_gps ?? false, has_bluetooth: (v as any).has_bluetooth ?? false, has_usb: (v as any).has_usb ?? false, has_camera: (v as any).has_camera ?? false });
    const vehicleTiers = allTiers?.filter((t) => t.vehicle_id === v.id) ?? [];
    setTiers(vehicleTiers.length > 0 ? vehicleTiers.map((t) => ({ min_days: t.min_days, max_days: t.max_days, daily_rate: Number(t.daily_rate) })) : defaultTiers);
    setShowForm(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm((f) => ({ ...f, features: [...(f.features ?? []), featureInput.trim()] }));
      setFeatureInput("");
    }
  };

  const removeFeature = (i: number) => {
    setForm((f) => ({ ...f, features: (f.features ?? []).filter((_, idx) => idx !== i) }));
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion de la flotte</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill gap-2">
            <Plus size={18} /> Ajouter un véhicule
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Modifier le véhicule" : "Nouveau véhicule"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dacia Logan" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marque *</label>
                <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Dacia" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modèle *</label>
                <Input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Logan" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Année</label>
                <Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Select value={form.category as string} onValueChange={(v) => setForm((f) => ({ ...f, category: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["SUV", "Sedan", "Compact", "Luxury", "Minivan"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Transmission</label>
                <Select value={form.transmission} onValueChange={(v) => setForm((f) => ({ ...f, transmission: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manuelle">Manuelle</SelectItem>
                    <SelectItem value="Automatique">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Carburant</label>
                <Select value={form.fuel} onValueChange={(v) => setForm((f) => ({ ...f, fuel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Essence", "Diesel", "Hybride", "Électrique"].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Places</label>
                <Input type="number" value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: parseInt(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Portes</label>
                <Input type="number" value={form.doors} onChange={(e) => setForm((f) => ({ ...f, doors: parseInt(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valises</label>
                <Input type="number" value={form.luggage} onChange={(e) => setForm((f) => ({ ...f, luggage: parseInt(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Caution (MAD)</label>
                <Input type="number" value={form.security_deposit} onChange={(e) => setForm((f) => ({ ...f, security_deposit: parseFloat(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Image</label>
                <Input value={form.image_url ?? ""} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              </div>
            </div>

            {/* Structured Features */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Caractéristiques</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STRUCTURED_FEATURES.map((sf) => (
                  <div key={sf.key} className="flex items-center justify-between p-3 border rounded-xl">
                    <div className="flex items-center gap-2">
                      <sf.icon size={16} className="text-primary" />
                      <span className="text-sm">{sf.label}</span>
                    </div>
                    <Switch
                      checked={(form as any)[sf.key] ?? false}
                      onCheckedChange={(checked) => setForm((f) => ({ ...f, [sf.key]: checked }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Features */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Équipements supplémentaires</label>
              <div className="flex gap-2">
                <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Ex: Toit ouvrant" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                <Button type="button" variant="outline" onClick={addFeature}>Ajouter</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.features ?? []).map((f, i) => (
                  <span key={i} className="bg-secondary text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    {f} <X size={14} className="cursor-pointer" onClick={() => removeFeature(i)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tarification par durée</label>
              <div className="space-y-2">
                {tiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm w-32 shrink-0">
                      {tier.max_days ? `${tier.min_days}-${tier.max_days} jours` : `${tier.min_days}+ jours`}
                    </span>
                    <Input
                      type="number"
                      value={tier.daily_rate}
                      onChange={(e) => {
                        const updated = [...tiers];
                        updated[i] = { ...updated[i], daily_rate: parseFloat(e.target.value) || 0 };
                        setTiers(updated);
                      }}
                      placeholder="MAD/jour"
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">MAD/jour</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.brand || !form.model} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill">
                {saveMutation.isPending ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="rounded-pill">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Véhicule</th>
                    <th className="text-left py-2 px-3">Catégorie</th>
                    <th className="text-left py-2 px-3">Transmission</th>
                    <th className="text-right py-2 px-3">Caution</th>
                    <th className="text-center py-2 px-3">Disponible</th>
                    <th className="text-right py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{v.name}</td>
                      <td className="py-2 px-3">{v.category}</td>
                      <td className="py-2 px-3">{v.transmission}</td>
                      <td className="py-2 px-3 text-right">{Number(v.security_deposit).toLocaleString()} MAD</td>
                      <td className="py-2 px-3 text-center">
                        <Switch
                          checked={v.is_available}
                          onCheckedChange={(checked) => toggleAvailability.mutate({ id: v.id, is_available: checked })}
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => editVehicle(v)}><Pencil size={16} /></Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(v.id)}><Trash2 size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucun véhicule. Ajoutez votre premier véhicule.</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminFleet;
