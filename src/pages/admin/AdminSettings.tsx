import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useSiteSettings, useUpdateSiteSettings, SiteSettings } from "@/hooks/useSiteSettings";
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview, Review } from "@/hooks/useReviews";
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
import { Palette, BarChart3, Mail, MessageCircle, Star, Plus, Pencil, Trash2, FileText } from "lucide-react";
import logo from "@/assets/logo.png";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});

  const { data: reviews = [], isLoading: loadingReviews } = useReviews(false);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<Partial<Review>>({});
  const [addingReview, setAddingReview] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5, time_label: "il y a 1 mois", is_enabled: true, sort_order: 0 });

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
          <TabsList className="w-full flex overflow-x-auto md:grid md:grid-cols-6 h-auto bg-card border border-border gap-1 p-1">
            <TabsTrigger value="appearance" className="gap-2 text-foreground flex-shrink-0 py-3 px-3"><Palette size={16} /><span className="hidden md:inline">Apparence</span></TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2 text-foreground flex-shrink-0 py-3 px-3"><BarChart3 size={16} /><span className="hidden md:inline">Tracking</span></TabsTrigger>
            <TabsTrigger value="emails" className="gap-2 text-foreground flex-shrink-0 py-3 px-3"><Mail size={16} /><span className="hidden md:inline">Emails</span></TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2 text-foreground flex-shrink-0 py-3 px-3"><MessageCircle size={16} /><span className="hidden md:inline">WhatsApp</span></TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 text-foreground flex-shrink-0 py-3 px-3"><Star size={16} /><span className="hidden md:inline">Avis</span></TabsTrigger>
            <TabsTrigger value="content" className="gap-2 text-foreground flex-shrink-0 py-3 px-3"><FileText size={16} /><span className="hidden md:inline">Contenu</span></TabsTrigger>
          </TabsList>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
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
              {form.hero_bg_type === "video" && (
                <div className="space-y-2">
                  <Label>Temps de départ vidéo (secondes)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.hero_video_start_time ?? 0}
                    onChange={(e) => setForm({ ...form, hero_video_start_time: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">YouTube ou lien direct .mp4 supporté</p>
                </div>
              )}
              {form.hero_bg_type === "video" && (
                <>
                  <div className="space-y-2">
                    <Label>Zoom mobile ({((form as any).hero_video_mobile_scale ?? 1.5).toFixed(1)}x)</Label>
                    <Slider
                      value={[(form as any).hero_video_mobile_scale ?? 1.5]}
                      onValueChange={([v]) => setForm({ ...form, hero_video_mobile_scale: v } as any)}
                      min={1} max={3} step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">Agrandir la vidéo sur les écrans mobiles pour éviter les bords noirs</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Zoom desktop ({((form as any).hero_video_desktop_scale ?? 1.2).toFixed(1)}x)</Label>
                    <Slider
                      value={[(form as any).hero_video_desktop_scale ?? 1.2]}
                      onValueChange={([v]) => setForm({ ...form, hero_video_desktop_scale: v } as any)}
                      min={1} max={3} step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position verticale ({(form as any).hero_video_offset_y ?? 50}%)</Label>
                    <Slider
                      value={[(form as any).hero_video_offset_y ?? 50]}
                      onValueChange={([v]) => setForm({ ...form, hero_video_offset_y: v } as any)}
                      min={0} max={100} step={1}
                    />
                    <p className="text-xs text-muted-foreground">0% = haut, 50% = centré, 100% = bas</p>
                  </div>
                </>
              )}
              <Button className="w-full md:w-auto" onClick={() => save(["hero_bg_type", "hero_bg_value", "hero_overlay_opacity", "hero_video_start_time", "hero_video_mobile_scale" as any, "hero_video_desktop_scale" as any, "hero_video_offset_y" as any])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>

            {/* Hero Texts */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Textes du Hero</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre principal</Label>
                  <Input
                    value={form.hero_title_text || ""}
                    onChange={(e) => setForm({ ...form, hero_title_text: e.target.value })}
                    placeholder="Louez votre voiture"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texte surligné (couleur primaire)</Label>
                  <Input
                    value={form.hero_title_highlight || ""}
                    onChange={(e) => setForm({ ...form, hero_title_highlight: e.target.value })}
                    placeholder="en toute confiance"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sous-titre</Label>
                <Textarea
                  value={form.hero_subtitle_text || ""}
                  onChange={(e) => setForm({ ...form, hero_subtitle_text: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Title formatting */}
              <div className="space-y-3 pt-3 border-t border-border">
                <Label className="font-semibold">Formatage du titre</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Taille</Label>
                    <Select value={(form.hero_title_style as any)?.fontSize || "5xl"} onValueChange={(v) => setForm({ ...form, hero_title_style: { ...(form.hero_title_style as any || {}), fontSize: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Poids</Label>
                    <Select value={(form.hero_title_style as any)?.fontWeight || "bold"} onValueChange={(v) => setForm({ ...form, hero_title_style: { ...(form.hero_title_style as any || {}), fontWeight: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="semibold">Semi-bold</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Alignement</Label>
                    <Select value={(form.hero_title_style as any)?.textAlign || "left"} onValueChange={(v) => setForm({ ...form, hero_title_style: { ...(form.hero_title_style as any || {}), textAlign: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="center">Centre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Animation</Label>
                  <Select value={form.hero_title_animation || "fade-up"} onValueChange={(v) => setForm({ ...form, hero_title_animation: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="fade-up">Fade Up</SelectItem>
                      <SelectItem value="fade-in">Fade In</SelectItem>
                      <SelectItem value="slide-left">Slide Left</SelectItem>
                      <SelectItem value="slide-right">Slide Right</SelectItem>
                      <SelectItem value="zoom-in">Zoom In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subtitle formatting */}
              <div className="space-y-3 pt-3 border-t border-border">
                <Label className="font-semibold">Formatage du sous-titre</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Taille</Label>
                    <Select value={(form.hero_subtitle_style as any)?.fontSize || "lg"} onValueChange={(v) => setForm({ ...form, hero_subtitle_style: { ...(form.hero_subtitle_style as any || {}), fontSize: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["sm", "base", "lg", "xl", "2xl", "3xl"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Poids</Label>
                    <Select value={(form.hero_subtitle_style as any)?.fontWeight || "normal"} onValueChange={(v) => setForm({ ...form, hero_subtitle_style: { ...(form.hero_subtitle_style as any || {}), fontWeight: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="semibold">Semi-bold</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Alignement</Label>
                    <Select value={(form.hero_subtitle_style as any)?.textAlign || "left"} onValueChange={(v) => setForm({ ...form, hero_subtitle_style: { ...(form.hero_subtitle_style as any || {}), textAlign: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Gauche</SelectItem>
                        <SelectItem value="center">Centre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Animation</Label>
                  <Select value={form.hero_subtitle_animation || "fade-up"} onValueChange={(v) => setForm({ ...form, hero_subtitle_animation: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      <SelectItem value="fade-up">Fade Up</SelectItem>
                      <SelectItem value="fade-in">Fade In</SelectItem>
                      <SelectItem value="slide-left">Slide Left</SelectItem>
                      <SelectItem value="slide-right">Slide Right</SelectItem>
                      <SelectItem value="zoom-in">Zoom In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full md:w-auto" onClick={() => save(["hero_title_text", "hero_title_highlight", "hero_subtitle_text", "hero_title_animation", "hero_subtitle_animation", "hero_title_style", "hero_subtitle_style"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>

            {/* Logo Size */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Taille du logo</h2>
              <div className="space-y-2">
                <Label>Hauteur du logo ({form.logo_height ?? 48}px)</Label>
                <Slider
                  value={[form.logo_height ?? 48]}
                  onValueChange={([v]) => setForm({ ...form, logo_height: v })}
                  min={32} max={120} step={2}
                />
              </div>
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <img src={logo} alt="Aperçu logo" style={{ height: form.logo_height ?? 48 }} className="w-auto" />
                <span className="text-sm text-muted-foreground">Aperçu</span>
              </div>
              <Button className="w-full md:w-auto" onClick={() => save(["logo_height"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Tracking */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Pixels & Analytics</h2>
              {[
                { key: "facebook_pixel_id" as const, label: "Facebook Pixel ID", placeholder: "123456789" },
                { key: "facebook_capi_token" as const, label: "Facebook Conversions API Token", placeholder: "EAAxxxxxxx..." },
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
                    type={field.key === "facebook_capi_token" ? "password" : "text"}
                  />
                  {field.key === "facebook_capi_token" && (
                    <p className="text-xs text-muted-foreground">
                      Requis pour le suivi serveur (CAPI). Génère-le depuis Facebook Events Manager → Settings → Generate Access Token.
                    </p>
                  )}
                </div>
              ))}
              <div className="space-y-3 pt-2 border-t border-border">
                <Label>Mode de capture des données</Label>
                <Select value={form.lead_capture_mode || "blur"} onValueChange={(v) => setForm({ ...form, lead_capture_mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blur">Au blur (progressif)</SelectItem>
                    <SelectItem value="submit">Au submit (complet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full md:w-auto" onClick={() => save(["facebook_pixel_id", "facebook_capi_token", "tiktok_pixel_id", "google_analytics_id", "google_tag_manager_id", "lead_capture_mode"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Emails */}
          <TabsContent value="emails" className="space-y-6">
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
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
              <Button className="w-full md:w-auto" onClick={() => save(["notification_email", "send_reservation_emails"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp" className="space-y-6">
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
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
              <Button className="w-full md:w-auto" onClick={() => save(["whatsapp_enabled", "whatsapp_number", "whatsapp_message"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Global settings */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Avis Google</h2>
              <div className="flex items-center justify-between">
                <Label>Afficher la section avis sur la page d'accueil</Label>
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
              <Button className="w-full md:w-auto" onClick={() => save(["show_reviews_section", "google_reviews_url"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>

            {/* Reviews list */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Gérer les avis ({reviews.length})</h2>
                <Button size="sm" onClick={() => { setAddingReview(true); setNewReview({ name: "", text: "", rating: 5, time_label: "il y a 1 mois", is_enabled: true, sort_order: reviews.length + 1 }); }}>
                  <Plus size={14} className="mr-1" /> Ajouter
                </Button>
              </div>

              {/* Add form */}
              {addingReview && (
                <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nom</Label>
                      <Input value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} placeholder="Nom du client" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Période</Label>
                      <Input value={newReview.time_label} onChange={(e) => setNewReview({ ...newReview, time_label: e.target.value })} placeholder="il y a 1 mois" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Texte de l'avis</Label>
                    <Textarea value={newReview.text} onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} rows={2} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs mr-1">Note:</Label>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setNewReview({ ...newReview, rating: s })}>
                          <Star size={16} className={s <= newReview.rating ? "text-primary fill-primary" : "text-muted-foreground"} />
                        </button>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <Button size="sm" variant="ghost" onClick={() => setAddingReview(false)}>Annuler</Button>
                    <Button size="sm" disabled={!newReview.name || !newReview.text || createReview.isPending} onClick={() => {
                      createReview.mutate(newReview, {
                        onSuccess: () => { toast.success("Avis ajouté"); setAddingReview(false); },
                        onError: () => toast.error("Erreur"),
                      });
                    }}>Ajouter</Button>
                  </div>
                </div>
              )}

              {loadingReviews ? (
                <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-border rounded-lg p-4 space-y-2">
                      {editingReview === r.id ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nom</Label>
                              <Input value={reviewForm.name ?? r.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Période</Label>
                              <Input value={reviewForm.time_label ?? r.time_label} onChange={(e) => setReviewForm({ ...reviewForm, time_label: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Texte</Label>
                            <Textarea value={reviewForm.text ?? r.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} rows={2} />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Label className="text-xs mr-1">Note:</Label>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                                  <Star size={16} className={s <= (reviewForm.rating ?? r.rating) ? "text-primary fill-primary" : "text-muted-foreground"} />
                                </button>
                              ))}
                            </div>
                            <div className="flex-1" />
                            <Button size="sm" variant="ghost" onClick={() => { setEditingReview(null); setReviewForm({}); }}>Annuler</Button>
                            <Button size="sm" disabled={updateReview.isPending} onClick={() => {
                              updateReview.mutate({ id: r.id, ...reviewForm }, {
                                onSuccess: () => { toast.success("Avis modifié"); setEditingReview(null); setReviewForm({}); },
                                onError: () => toast.error("Erreur"),
                              });
                            }}>Sauvegarder</Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{r.name}</span>
                              <span className="text-xs text-muted-foreground">· {r.time_label}</span>
                              <div className="flex gap-0.5 ml-1">
                                {Array.from({ length: r.rating }).map((_, i) => (
                                  <Star key={i} size={12} className="text-primary fill-primary" />
                                ))}
                              </div>
                              {!r.is_enabled && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Masqué</span>}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{r.text}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Switch
                              checked={r.is_enabled}
                              onCheckedChange={(v) => updateReview.mutate({ id: r.id, is_enabled: v }, {
                                onSuccess: () => toast.success(v ? "Avis affiché" : "Avis masqué"),
                              })}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingReview(r.id); setReviewForm({}); }}>
                              <Pencil size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => {
                              if (confirm("Supprimer cet avis ?")) {
                                deleteReview.mutate(r.id, {
                                  onSuccess: () => toast.success("Avis supprimé"),
                                  onError: () => toast.error("Erreur"),
                                });
                              }
                            }}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Content */}
          <TabsContent value="content" className="space-y-6">
            {/* Footer */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Pied de page (Footer)</h2>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.footer_description || ""}
                  onChange={(e) => setForm({ ...form, footer_description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={form.footer_phone || ""} onChange={(e) => setForm({ ...form, footer_phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.footer_email || ""} onChange={(e) => setForm({ ...form, footer_email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={form.footer_address || ""} onChange={(e) => setForm({ ...form, footer_address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Copyright</Label>
                  <Input value={form.footer_copyright || ""} onChange={(e) => setForm({ ...form, footer_copyright: e.target.value })} />
                </div>
              </div>
              <Button className="w-full md:w-auto" onClick={() => save(["footer_description", "footer_phone", "footer_email", "footer_address", "footer_copyright"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>

            {/* Conditions Générales */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Conditions Générales</h2>
              <p className="text-xs text-muted-foreground">Contenu HTML affiché sur la page /conditions-generales. Laissez vide pour le contenu par défaut.</p>
              <Textarea
                value={form.conditions_generales_html || ""}
                onChange={(e) => setForm({ ...form, conditions_generales_html: e.target.value })}
                rows={10}
                placeholder="<h2>1. Objet</h2><p>...</p>"
              />
              <Button className="w-full md:w-auto" onClick={() => save(["conditions_generales_html"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>

            {/* Politique de Confidentialité */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Politique de Confidentialité</h2>
              <p className="text-xs text-muted-foreground">Contenu HTML affiché sur la page /politique-confidentialite.</p>
              <Textarea
                value={form.privacy_policy_html || ""}
                onChange={(e) => setForm({ ...form, privacy_policy_html: e.target.value })}
                rows={10}
                placeholder="<h2>Protection des données</h2><p>...</p>"
              />
              <Button className="w-full md:w-auto" onClick={() => save(["privacy_policy_html"])} disabled={updateMutation.isPending}>
                Sauvegarder
              </Button>
            </div>

            {/* Politique de Caution */}
            <div className="bg-card rounded-xl p-4 md:p-6 space-y-5 border border-border">
              <h2 className="font-semibold text-lg">Politique de Caution</h2>
              <p className="text-xs text-muted-foreground">Contenu HTML affiché sur la page /politique-caution.</p>
              <Textarea
                value={form.caution_policy_html || ""}
                onChange={(e) => setForm({ ...form, caution_policy_html: e.target.value })}
                rows={10}
                placeholder="<h2>Dépôt de garantie</h2><p>...</p>"
              />
              <Button onClick={() => save(["caution_policy_html"])} disabled={updateMutation.isPending}>
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
