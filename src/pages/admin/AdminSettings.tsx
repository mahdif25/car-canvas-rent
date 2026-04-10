import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteSettings, useUpdateSiteSettings, SiteSettings } from "@/hooks/useSiteSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Palette, BarChart3, Mail, MessageCircle, Star } from "lucide-react";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const save = (fields: (keyof SiteSettings)[]) => {
    const updates: Partial<SiteSettings> = {};
    fields.forEach((f) => {
      (updates as any)[f] = (form as any)[f];
    });
    updateMutation.mutate(updates, {
      onSuccess: () => toast.success("Paramètres sauvegardés"),
      onError: () => toast.error("Erreur lors de la sauvegarde"),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="appearance" className="gap-2"><Palette size={16} />Apparence</TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2"><BarChart3 size={16} />Tracking</TabsTrigger>
            <TabsTrigger value="emails" className="gap-2"><Mail size={16} />Emails</TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2"><MessageCircle size={16} />WhatsApp</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2"><Star size={16} />Avis</TabsTrigger>
          </TabsList>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card rounded-xl p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Arrière-plan Hero</h2>
              <div className="space-y-2">
                <Label>Type d'arrière-plan</Label>
                <Select value={form.hero_bg_type || "color"} onValueChange={(v) => setForm({ ...form, hero_bg_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Couleur unie</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {form.hero_bg_type === "color" ? "Code couleur (hex)" : form.hero_bg_type === "image" ? "URL de l'image" : "URL de la vidéo"}
                </Label>
                <Input
                  value={form.hero_bg_value || ""}
                  onChange={(e) => setForm({ ...form, hero_bg_value: e.target.value })}
                  placeholder={form.hero_bg_type === "color" ? "#1a1a2e" : "https://..."}
                />
              </div>
              <div className="space-y-2">
                <Label>Opacité de l'overlay ({Math.round((form.hero_overlay_opacity ?? 0.6) * 100)}%)</Label>
                <Slider
                  value={[form.hero_overlay_opacity ?? 0.6]}
                  onValueChange={([v]) => setForm({ ...form, hero_overlay_opacity: v })}
                  min={0} max={1} step={0.05}
                />
              </div>
              {/* Preview */}
              {form.hero_bg_type !== "color" && form.hero_bg_value && (
                <div className="relative rounded-lg overflow-hidden h-40">
                  {form.hero_bg_type === "image" ? (
                    <img src={form.hero_bg_value} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={form.hero_bg_value} className="w-full h-full object-cover" autoPlay muted loop />
                  )}
                  <div className="absolute inset-0 bg-dark" style={{ opacity: form.hero_overlay_opacity ?? 0.6 }} />
                  <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">Aperçu</p>
                </div>
              )}
              <Button onClick={() => save(["hero_bg_type", "hero_bg_value", "hero_overlay_opacity"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Tracking */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="bg-card rounded-xl p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Pixels & Analytics</h2>
              {[
                { key: "facebook_pixel_id" as const, label: "Facebook Pixel ID", placeholder: "123456789" },
                { key: "tiktok_pixel_id" as const, label: "TikTok Pixel ID", placeholder: "XXXXX" },
                { key: "google_analytics_id" as const, label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX" },
                { key: "google_tag_manager_id" as const, label: "Google Tag Manager ID", placeholder: "GTM-XXXXXXX" },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input
                    value={(form[field.key] as string) || ""}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <Button onClick={() => save(["facebook_pixel_id", "tiktok_pixel_id", "google_analytics_id", "google_tag_manager_id"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Emails */}
          <TabsContent value="emails" className="space-y-6">
            <div className="bg-card rounded-xl p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Configuration emails</h2>
              <div className="space-y-2">
                <Label>Email de notification</Label>
                <Input
                  type="email"
                  value={form.notification_email || ""}
                  onChange={(e) => setForm({ ...form, notification_email: e.target.value })}
                  placeholder="contact@votresite.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Envoyer un email de confirmation de réservation</Label>
                <Switch
                  checked={form.send_reservation_emails ?? true}
                  onCheckedChange={(v) => setForm({ ...form, send_reservation_emails: v })}
                />
              </div>
              <Button onClick={() => save(["notification_email", "send_reservation_emails"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp" className="space-y-6">
            <div className="bg-card rounded-xl p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Popup WhatsApp</h2>
              <div className="flex items-center justify-between">
                <Label>Activer le popup WhatsApp</Label>
                <Switch
                  checked={form.whatsapp_enabled ?? false}
                  onCheckedChange={(v) => setForm({ ...form, whatsapp_enabled: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>Numéro WhatsApp (avec indicatif)</Label>
                <Input
                  value={form.whatsapp_number || ""}
                  onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                  placeholder="+212600000000"
                />
              </div>
              <div className="space-y-2">
                <Label>Message pré-rempli</Label>
                <Textarea
                  value={form.whatsapp_message || ""}
                  onChange={(e) => setForm({ ...form, whatsapp_message: e.target.value })}
                  placeholder="Bonjour, je souhaite réserver un véhicule..."
                />
              </div>
              <Button onClick={() => save(["whatsapp_enabled", "whatsapp_number", "whatsapp_message"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="bg-card rounded-xl p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Avis Google</h2>
              <div className="flex items-center justify-between">
                <Label>Afficher la section avis</Label>
                <Switch
                  checked={form.show_reviews_section ?? true}
                  onCheckedChange={(v) => setForm({ ...form, show_reviews_section: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Google Reviews</Label>
                <Input
                  value={form.google_reviews_url || ""}
                  onChange={(e) => setForm({ ...form, google_reviews_url: e.target.value })}
                  placeholder="https://g.page/r/..."
                />
              </div>
              <Button onClick={() => save(["show_reviews_section", "google_reviews_url"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
