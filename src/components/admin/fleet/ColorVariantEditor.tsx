import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, Loader2, FlipHorizontal, Monitor, Tablet, Smartphone, Palette } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import type { VehicleColor } from "@/hooks/useVehicleColors";

export type ColorVariantState = Partial<VehicleColor> & { _new?: boolean };

interface Props {
  colorVariants: ColorVariantState[];
  onChange: (variants: ColorVariantState[]) => void;
}

const PLACEMENTS = [
  { key: "home", label: "Accueil", w: 240, h: 135 },
  { key: "fleet", label: "Flotte", w: 240, h: 135 },
  { key: "detail", label: "Détail", w: 280, h: 158 },
  { key: "reservation", label: "Réserv.", w: 210, h: 120 },
  { key: "sidebar", label: "Sidebar", w: 160, h: 100 },
] as const;

const DEVICES = [
  { key: "desktop", suffix: "", label: "Desktop", icon: Monitor, factor: 1 },
  { key: "tablet", suffix: "_tablet", label: "Tablet", icon: Tablet, factor: 0.75 },
  { key: "mobile", suffix: "_mobile", label: "Mobile", icon: Smartphone, factor: 0.5 },
] as const;

const uploadImage = async (file: File): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("vehicle-images").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
  return data.publicUrl;
};

const ColorVariantCard = ({
  color,
  index,
  onUpdate,
  onRemove,
  onSetDefault,
}: {
  color: ColorVariantState;
  index: number;
  onUpdate: (data: ColorVariantState) => void;
  onRemove: () => void;
  onSetDefault: () => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [activePlacement, setActivePlacement] = useState<string>("home");
  const [activeDevice, setActiveDevice] = useState<string>("desktop");

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpdate({ ...color, image_url: url });
    } catch (e: any) {
      toast({ title: "Erreur upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const placement = PLACEMENTS.find((p) => p.key === activePlacement)!;
  const device = DEVICES.find((d) => d.key === activeDevice)!;
  const scaleKey = `image_scale_${activePlacement}${device.suffix}` as string;
  const scaleVal = Number((color as any)[scaleKey] ?? 1);
  const previewW = Math.round(placement.w * device.factor);

  return (
    <div className="p-3 border rounded-lg bg-background space-y-3">
      {/* Top row: name, hex, default, delete, image */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={color.color_name || ""}
              onChange={(e) => onUpdate({ ...color, color_name: e.target.value })}
              placeholder="Nom (ex: Rouge)"
              className="flex-1"
            />
            <input
              type="color"
              value={color.color_hex || "#000000"}
              onChange={(e) => onUpdate({ ...color, color_hex: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-border"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={color.is_default ?? false} onCheckedChange={(checked) => { if (checked) onSetDefault(); }} />
              Par défaut
            </label>
            <Button type="button" size="sm" variant="ghost" className="text-destructive h-7" onClick={onRemove}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        <div className="w-full sm:w-40 shrink-0">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
          {color.image_url ? (
            <div className="relative group w-full">
              <img src={color.image_url} alt="" className="w-full h-32 object-contain rounded-lg border bg-muted" />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
              <span className="text-xs">{uploading ? "Upload..." : "Image"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Image adjustments section */}
      {color.image_url && (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
          {/* Flip toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs flex items-center gap-1"><FlipHorizontal size={12} /> Inverser (miroir)</label>
            <Switch checked={color.image_flipped ?? false} onCheckedChange={(checked) => onUpdate({ ...color, image_flipped: checked })} />
          </div>

          {/* Two-panel layout */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left panel: selectors + slider */}
            <div className="flex-1 space-y-3">
              {/* Device selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Appareil</label>
                <Tabs value={activeDevice} onValueChange={setActiveDevice}>
                  <TabsList className="h-8 w-full">
                    {DEVICES.map((d) => (
                      <TabsTrigger key={d.key} value={d.key} className="text-xs gap-1 flex-1">
                        <d.icon size={12} /> {d.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Placement selector */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Emplacement</label>
                <Tabs value={activePlacement} onValueChange={setActivePlacement}>
                  <TabsList className="h-8 w-full flex-wrap">
                    {PLACEMENTS.map((p) => (
                      <TabsTrigger key={p.key} value={p.key} className="text-xs flex-1">
                        {p.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Single zoom slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Zoom</label>
                  <span className="text-xs text-muted-foreground">{scaleVal.toFixed(2)}x</span>
                </div>
                <Slider
                  min={0.5} max={2} step={0.05}
                  value={[scaleVal]}
                  onValueChange={([val]) => onUpdate({ ...color, [scaleKey]: val })}
                />
              </div>
            </div>

            {/* Right panel: live preview */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="rounded-lg overflow-hidden border bg-secondary flex items-center justify-center"
                style={{ width: previewW, height: placement.h, maxWidth: "100%" }}
              >
                <img
                  src={color.image_url}
                  alt={`${placement.label} - ${device.label}`}
                  className="w-full h-full object-contain"
                  style={{
                    transform: `${color.image_flipped ? "scaleX(-1) " : ""}scale(${scaleVal})`,
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {placement.label} — {device.label} ({previewW}×{placement.h})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ColorVariantEditor = ({ colorVariants, onChange }: Props) => {
  const addColor = () => {
    onChange([
      ...colorVariants,
      {
        color_name: "",
        color_hex: "#000000",
        image_url: "",
        is_default: colorVariants.length === 0,
        _new: true,
        image_flipped: false,
        image_scale_home: 1, image_scale_home_mobile: 1, image_scale_home_tablet: 1,
        image_scale_fleet: 1, image_scale_fleet_mobile: 1, image_scale_fleet_tablet: 1,
        image_scale_detail: 1, image_scale_detail_mobile: 1, image_scale_detail_tablet: 1,
        image_scale_reservation: 1, image_scale_reservation_mobile: 1, image_scale_reservation_tablet: 1,
        image_scale_sidebar: 1, image_scale_sidebar_mobile: 1, image_scale_sidebar_tablet: 1,
      },
    ]);
  };

  const updateColor = (idx: number, data: ColorVariantState) => {
    const updated = [...colorVariants];
    updated[idx] = data;
    onChange(updated);
  };

  const removeColor = (idx: number) => {
    onChange(colorVariants.filter((_, i) => i !== idx));
  };

  const setDefault = (idx: number) => {
    onChange(colorVariants.map((c, i) => ({ ...c, is_default: i === idx })));
  };

  return (
    <div className="space-y-3 p-4 border rounded-xl bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Palette size={16} className="text-primary" /> Couleurs disponibles
        </h4>
        <Button type="button" size="sm" variant="outline" onClick={addColor} className="gap-1">
          <Plus size={14} /> Ajouter une couleur
        </Button>
      </div>
      {colorVariants.length === 0 && (
        <p className="text-xs text-muted-foreground">Aucune couleur ajoutée. L'image principale sera utilisée.</p>
      )}
      <div className="space-y-4">
        {colorVariants.map((color, idx) => (
          <ColorVariantCard
            key={color.id || `new-${idx}`}
            color={color}
            index={idx}
            onUpdate={(data) => updateColor(idx, data)}
            onRemove={() => removeColor(idx)}
            onSetDefault={() => setDefault(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorVariantEditor;
