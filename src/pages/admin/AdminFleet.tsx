import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Upload, Image, Loader2, FlipHorizontal, Monitor, Tablet, Smartphone, Palette } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { STRUCTURED_FEATURES } from "@/lib/vehicle-features";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Database } from "@/integrations/supabase/types";
import type { VehicleColor } from "@/hooks/useVehicleColors";

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

const uploadImage = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("vehicle-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
  return data.publicUrl;
};

const deleteStorageFile = async (url: string) => {
  try {
    const parts = url.split("/vehicle-images/");
    if (parts.length < 2) return;
    const path = decodeURIComponent(parts[1]);
    await supabase.storage.from("vehicle-images").remove([path]);
  } catch {}
};

const ImageUploadField = ({
  value,
  onChange,
  onDelete,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  onDelete?: () => void;
  label?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e: any) {
      toast({ title: "Erreur upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="relative group w-full">
          <img src={value} alt="" className="w-full h-32 object-contain rounded-lg border bg-muted" />
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => ref.current?.click()} disabled={uploading}>
              <Upload size={14} />
            </Button>
            {onDelete && (
              <Button type="button" size="icon" variant="destructive" className="h-7 w-7" onClick={onDelete}>
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-xs">{uploading ? "Upload en cours..." : "Cliquer pour uploader"}</span>
        </button>
      )}
      <Collapsible>
        <CollapsibleTrigger className="text-xs text-muted-foreground hover:underline">ou coller un lien</CollapsibleTrigger>
        <CollapsibleContent>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="mt-1" />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const AdminFleet = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VehicleInsert> & { slug?: string }>({
    name: "", brand: "", model: "", year: new Date().getFullYear(),
    category: "Sedan", transmission: "Manuelle", fuel: "Diesel",
    seats: 5, doors: 4, luggage: 3, security_deposit: 0, is_available: true,
    features: [], has_climatisation: true, has_gps: false, has_bluetooth: false, has_usb: false, has_camera: false,
    slug: "", image_flipped: false, image_scale_home: 1.0, image_scale_fleet: 1.0, image_scale_detail: 1.0, image_scale_reservation: 1.0, image_scale_sidebar: 1.0, image_scale_home_mobile: 1.0, image_scale_home_tablet: 1.0, image_scale_fleet_mobile: 1.0, image_scale_fleet_tablet: 1.0, image_scale_detail_mobile: 1.0, image_scale_detail_tablet: 1.0, image_scale_reservation_mobile: 1.0, image_scale_reservation_tablet: 1.0, image_scale_sidebar_mobile: 1.0, image_scale_sidebar_tablet: 1.0,
  });
  const [tiers, setTiers] = useState(defaultTiers);
  const [featureInput, setFeatureInput] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<Array<Partial<VehicleColor> & { _new?: boolean }>>([]);

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
        await supabase.from("vehicle_pricing_tiers").delete().eq("vehicle_id", editingId);
        const tierInserts = tiers.map((t) => ({ vehicle_id: editingId, ...t }));
        const { error: tierErr } = await supabase.from("vehicle_pricing_tiers").insert(tierInserts);
        if (tierErr) throw tierErr;
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
    setForm({ name: "", brand: "", model: "", year: new Date().getFullYear(), category: "Sedan", transmission: "Manuelle", fuel: "Diesel", seats: 5, doors: 4, luggage: 3, security_deposit: 0, is_available: true, features: [], has_climatisation: true, has_gps: false, has_bluetooth: false, has_usb: false, has_camera: false, slug: "", image_flipped: false, image_scale_home: 1.0, image_scale_fleet: 1.0, image_scale_detail: 1.0, image_scale_reservation: 1.0, image_scale_sidebar: 1.0, image_scale_home_mobile: 1.0, image_scale_home_tablet: 1.0, image_scale_fleet_mobile: 1.0, image_scale_fleet_tablet: 1.0, image_scale_detail_mobile: 1.0, image_scale_detail_tablet: 1.0, image_scale_reservation_mobile: 1.0, image_scale_reservation_tablet: 1.0, image_scale_sidebar_mobile: 1.0, image_scale_sidebar_tablet: 1.0 });
    setTiers(defaultTiers);
    setFeatureInput("");
    setGalleryUrls([]);
  };

  const editVehicle = async (v: Vehicle) => {
    setEditingId(v.id);
    setForm({ name: v.name, brand: v.brand, model: v.model, year: v.year, category: v.category, transmission: v.transmission, fuel: v.fuel, seats: v.seats, doors: v.doors, luggage: v.luggage, security_deposit: Number(v.security_deposit), is_available: v.is_available, image_url: v.image_url, features: v.features ?? [], has_climatisation: v.has_climatisation ?? true, has_gps: v.has_gps ?? false, has_bluetooth: v.has_bluetooth ?? false, has_usb: v.has_usb ?? false, has_camera: v.has_camera ?? false, slug: v.slug ?? "", image_flipped: (v as any).image_flipped ?? false, image_scale_home: Number((v as any).image_scale_home ?? 1), image_scale_fleet: Number((v as any).image_scale_fleet ?? 1), image_scale_detail: Number((v as any).image_scale_detail ?? 1), image_scale_reservation: Number((v as any).image_scale_reservation ?? 1), image_scale_sidebar: Number((v as any).image_scale_sidebar ?? 1), image_scale_home_mobile: Number((v as any).image_scale_home_mobile ?? 1), image_scale_home_tablet: Number((v as any).image_scale_home_tablet ?? 1), image_scale_fleet_mobile: Number((v as any).image_scale_fleet_mobile ?? 1), image_scale_fleet_tablet: Number((v as any).image_scale_fleet_tablet ?? 1), image_scale_detail_mobile: Number((v as any).image_scale_detail_mobile ?? 1), image_scale_detail_tablet: Number((v as any).image_scale_detail_tablet ?? 1), image_scale_reservation_mobile: Number((v as any).image_scale_reservation_mobile ?? 1), image_scale_reservation_tablet: Number((v as any).image_scale_reservation_tablet ?? 1), image_scale_sidebar_mobile: Number((v as any).image_scale_sidebar_mobile ?? 1), image_scale_sidebar_tablet: Number((v as any).image_scale_sidebar_tablet ?? 1) });
    const vehicleTiers = allTiers?.filter((t) => t.vehicle_id === v.id) ?? [];
    setTiers(vehicleTiers.length > 0 ? vehicleTiers.map((t) => ({ min_days: t.min_days, max_days: t.max_days, daily_rate: Number(t.daily_rate) })) : defaultTiers);
    const { data: imgs } = await supabase.from("vehicle_images").select("*").eq("vehicle_id", v.id).order("sort_order");
    setGalleryUrls((imgs ?? []).map((img: any) => img.image_url));
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

  const handleDeleteGalleryImage = async (index: number) => {
    const url = galleryUrls[index];
    if (url?.includes("vehicle-images")) {
      await deleteStorageFile(url);
    }
    setGalleryUrls(galleryUrls.filter((_, idx) => idx !== index));
  };

  const handleDeleteMainImage = async () => {
    const url = form.image_url;
    if (url?.includes("vehicle-images")) {
      await deleteStorageFile(url);
    }
    setForm((f) => ({ ...f, image_url: "" }));
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <label className="text-sm font-medium">Slug (URL)</label>
                <div className="flex gap-2">
                  <Input value={form.slug ?? ""} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="renault-clio-2026" />
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    const slug = (form.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setForm((f) => ({ ...f, slug }));
                  }}>Auto</Button>
                </div>
              </div>
            </div>

            {/* Main Image Upload */}
            <ImageUploadField
              label="Image principale"
              value={form.image_url ?? ""}
              onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
              onDelete={handleDeleteMainImage}
            />

            {/* Image Transform Controls */}
            {form.image_url && (
              <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
                <h4 className="text-sm font-medium flex items-center gap-2"><FlipHorizontal size={16} className="text-primary" /> Ajustements de l'image</h4>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm">Inverser l'image (miroir)</label>
                  <Switch
                    checked={(form as any).image_flipped ?? false}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, image_flipped: checked }))}
                  />
                </div>

                <h4 className="text-sm font-medium">Zoom par emplacement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {([
                    { base: "image_scale_home", label: "Accueil", w: 320, h: 180, objFit: "object-contain", bg: "bg-secondary" },
                    { base: "image_scale_fleet", label: "Flotte", w: 320, h: 180, objFit: "object-contain", bg: "bg-secondary" },
                    { base: "image_scale_detail", label: "Détail véhicule", w: 400, h: 225, objFit: "object-cover", bg: "bg-background" },
                    { base: "image_scale_reservation", label: "Réservation", w: 280, h: 160, objFit: "object-contain", bg: "bg-secondary" },
                    { base: "image_scale_sidebar", label: "Barre latérale", w: 200, h: 130, objFit: "object-contain", bg: "bg-secondary" },
                  ] as const).map((placement) => {
                    const devices = [
                      { suffix: "", label: "Desktop", icon: Monitor },
                      { suffix: "_tablet", label: "Tablet", icon: Tablet },
                      { suffix: "_mobile", label: "Mobile", icon: Smartphone },
                    ];
                    return (
                      <div key={placement.base} className="space-y-2">
                        <label className="text-sm font-medium">{placement.label}</label>
                        {devices.map((device) => {
                          const key = `${placement.base}${device.suffix}` as string;
                          const scaleVal = Number((form as any)[key] ?? 1);
                          const DeviceIcon = device.icon;
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <DeviceIcon size={12} />{device.label}
                                </span>
                                <span className="text-xs text-muted-foreground">{scaleVal.toFixed(2)}x</span>
                              </div>
                              <Slider
                                min={0.5} max={2} step={0.05}
                                value={[scaleVal]}
                                onValueChange={([val]) => setForm((f) => ({ ...f, [key]: val }))}
                              />
                            </div>
                          );
                        })}
                        <div
                          className={`rounded-lg overflow-hidden border ${placement.bg} flex items-center justify-center`}
                          style={{ width: placement.w, height: placement.h, maxWidth: "100%" }}
                        >
                          <img
                            src={form.image_url}
                            alt={placement.label}
                            className={`w-full h-full ${placement.objFit}`}
                            style={{
                              transform: `${(form as any).image_flipped ? 'scaleX(-1)' : ''} scale(${Number((form as any)[placement.base] ?? 1)})`.trim() || 'none'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery Images */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Images supplémentaires (galerie)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryUrls.map((url, i) => (
                  <ImageUploadField
                    key={i}
                    value={url}
                    onChange={(newUrl) => { const u = [...galleryUrls]; u[i] = newUrl; setGalleryUrls(u); }}
                    onDelete={() => handleDeleteGalleryImage(i)}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setGalleryUrls([...galleryUrls, ""])}
                  className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus size={24} />
                  <span className="text-xs">Ajouter une image</span>
                </button>
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name || !form.brand || !form.model} className="bg-primary text-primary-foreground hover:bg-accent rounded-pill w-full sm:w-auto">
                {saveMutation.isPending ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="rounded-pill w-full sm:w-auto">Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : vehicles && vehicles.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                        <td className="py-2 px-3 font-medium">
                          <div className="flex items-center gap-2">
                            {v.image_url && <img src={v.image_url} alt="" className="w-10 h-8 object-contain rounded" />}
                            {v.name}
                          </div>
                        </td>
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

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      {v.image_url && <img src={v.image_url} alt="" className="w-14 h-10 object-contain rounded shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.category} • {v.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={v.is_available}
                          onCheckedChange={(checked) => toggleAvailability.mutate({ id: v.id, is_available: checked })}
                        />
                        <span className="text-xs text-muted-foreground">{v.is_available ? "Disponible" : "Indisponible"}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => editVehicle(v)}><Pencil size={16} /></Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => deleteMutation.mutate(v.id)}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Aucun véhicule. Ajoutez votre premier véhicule.</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminFleet;
