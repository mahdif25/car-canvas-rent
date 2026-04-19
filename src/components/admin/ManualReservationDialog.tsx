import { useState, useMemo, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInputField } from "@/components/ui/date-input-field";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getDailyRateFromTiers } from "@/hooks/useVehicles";
import { getDeliveryFee, type Location } from "@/hooks/useLocations";
import { useAvailablePlates } from "@/hooks/useFleetPlates";
import { Plus, RotateCcw, Tag } from "lucide-react";
import { toast as sonnerToast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: any[];
  pricingTiers: any[];
  locations: Location[];
  allAddons: any[];
  onSuccess: () => void;
}

const today = () => new Date().toISOString().split("T")[0];
const DRAFT_KEY = "manual_reservation_draft";

const NATIONALITIES = [
  "Marocaine", "Algérienne", "Allemande", "Américaine", "Belge", "Britannique",
  "Canadienne", "Chinoise", "Égyptienne", "Émiratie", "Espagnole", "Française",
  "Indienne", "Italienne", "Jordanienne", "Koweïtienne", "Libanaise", "Libyenne",
  "Mauritanienne", "Néerlandaise", "Nigériane", "Portugaise", "Qatarie",
  "Saoudienne", "Sénégalaise", "Suisse", "Tunisienne", "Turque", "Autre",
];

interface FormState {
  vehicleId: string; pickupDate: string; returnDate: string;
  pickupTime: string; returnTime: string; pickupLocation: string; returnLocation: string;
  firstName: string; lastName: string; email: string; phone: string;
  license: string; licenseDeliveryDate: string; nationality: string;
  cin: string; cinExpiryDate: string; passport: string; dob: string;
  selectedAddons: string[]; assignedPlateId: string;
  hasAdditionalDriver: boolean;
  addFirstName: string; addLastName: string; addPhone: string;
  addLicense: string; addLicenseDeliveryDate: string; addNationality: string;
  addCin: string; addCinExpiryDate: string; addPassport: string; addDob: string;
  customDailyRate: string; couponCode: string;
}

const defaultForm = (): FormState => ({
  vehicleId: "", pickupDate: today(), returnDate: today(),
  pickupTime: "09:00", returnTime: "09:00", pickupLocation: "", returnLocation: "",
  firstName: "", lastName: "", email: "", phone: "",
  license: "", licenseDeliveryDate: "", nationality: "Marocaine",
  cin: "", cinExpiryDate: "", passport: "", dob: "",
  selectedAddons: [], assignedPlateId: "",
  hasAdditionalDriver: false,
  addFirstName: "", addLastName: "", addPhone: "",
  addLicense: "", addLicenseDeliveryDate: "", addNationality: "Marocaine",
  addCin: "", addCinExpiryDate: "", addPassport: "", addDob: "",
  customDailyRate: "", couponCode: "",
});

function loadDraft(): FormState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function ManualReservationDialog({ open, onOpenChange, vehicles, pricingTiers, locations, allAddons, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => loadDraft() || defaultForm());
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount_amount: number } | null>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const { data: availablePlates } = useAvailablePlates(form.vehicleId || undefined, form.pickupDate, form.returnDate);

  const isMoroccan = form.nationality === "Marocaine";
  const addIsMoroccan = form.addNationality === "Marocaine";

  const calc = useMemo(() => {
    const days = Math.max(1, Math.ceil((new Date(form.returnDate).getTime() - new Date(form.pickupDate).getTime()) / 86400000));
    const tiers = pricingTiers.filter((t: any) => t.vehicle_id === form.vehicleId);
    const tierRate = getDailyRateFromTiers(tiers, days);
    const dailyRate = form.customDailyRate ? Number(form.customDailyRate) : tierRate;
    const vehicleTotal = dailyRate * days;
    const addonsTotal = form.selectedAddons.reduce((sum, aid) => {
      const addon = allAddons.find((a: any) => a.id === aid);
      return sum + (addon ? Number(addon.price_per_day) * days : 0);
    }, 0);
    const deliveryFee = getDeliveryFee(locations, form.pickupLocation, form.returnLocation || form.pickupLocation);
    const vehicle = vehicles.find((v: any) => v.id === form.vehicleId);
    const depositAmount = vehicle ? Number(vehicle.security_deposit) : 0;
    const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
    const totalPrice = Math.max(0, vehicleTotal + addonsTotal + deliveryFee - discountAmount);
    return { days, dailyRate, tierRate, vehicleTotal, addonsTotal, deliveryFee, depositAmount, discountAmount, totalPrice };
  }, [form.vehicleId, form.pickupDate, form.returnDate, form.selectedAddons, form.pickupLocation, form.returnLocation, form.customDailyRate, pricingTiers, locations, vehicles, allAddons, appliedCoupon]);

  const resetForm = () => {
    setForm(defaultForm());
    setAppliedCoupon(null);
    localStorage.removeItem(DRAFT_KEY);
  };

  const applyCoupon = async () => {
    const code = form.couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.from("coupons").select("*").eq("code", code).eq("is_active", true).maybeSingle();
      if (error) throw error;
      if (!data) { sonnerToast.error("Code promo invalide ou inactif"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { sonnerToast.error("Ce coupon a expiré"); return; }
      if (data.max_uses && data.current_uses >= data.max_uses) { sonnerToast.error("Ce coupon a atteint son nombre max d'utilisations"); return; }
      if (data.min_rental_days && calc.days < data.min_rental_days) { sonnerToast.error(`Minimum ${data.min_rental_days} jours requis`); return; }
      const subtotal = calc.vehicleTotal + calc.addonsTotal + calc.deliveryFee;
      if (data.min_total_price && subtotal < Number(data.min_total_price)) { sonnerToast.error(`Montant minimum de ${Number(data.min_total_price).toLocaleString()} MAD requis`); return; }
      setAppliedCoupon({ id: data.id, code: data.code, discount_amount: Number(data.discount_amount) });
      sonnerToast.success(`Coupon ${data.code} appliqué: -${Number(data.discount_amount).toLocaleString()} MAD`);
    } catch (err: any) {
      sonnerToast.error(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.vehicleId || !form.firstName || !form.lastName || !form.license || !form.pickupLocation) {
      toast({ title: "Champs obligatoires manquants", description: "Véhicule, nom, prénom, permis et lieu de prise en charge sont requis.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: reservation, error } = await supabase.from("reservations").insert({
        vehicle_id: form.vehicleId,
        pickup_date: form.pickupDate,
        return_date: form.returnDate,
        pickup_time: form.pickupTime,
        return_time: form.returnTime,
        pickup_location: form.pickupLocation,
        return_location: form.returnLocation || form.pickupLocation,
        customer_first_name: form.firstName,
        customer_last_name: form.lastName,
        customer_email: form.email || `manual-${Date.now()}@noemail.local`,
        customer_phone: form.phone || "N/A",
        customer_license: form.license,
        customer_nationality: form.nationality || null,
        customer_dob: form.dob || null,
        customer_cin: form.cin || null,
        customer_passport: form.passport || null,
        customer_license_delivery_date: form.licenseDeliveryDate || null,
        customer_cin_expiry_date: form.cinExpiryDate || null,
        total_price: calc.totalPrice,
        delivery_fee: calc.deliveryFee,
        deposit_amount: calc.depositAmount,
        discount_amount: calc.discountAmount,
        coupon_id: appliedCoupon?.id || null,
        assigned_plate_id: form.assignedPlateId || null,
        custom_daily_rate: form.customDailyRate ? Number(form.customDailyRate) : null,
        status: "confirmed",
        is_manual: true,
        payment_method: "cash",
        marketing_consent: false,
      } as any).select().single();

      if (error) throw error;

      if (form.selectedAddons.length > 0 && reservation) {
        await supabase.from("reservation_addons").insert(
          form.selectedAddons.map((addon_id) => ({ reservation_id: reservation.id, addon_id }))
        );
      }

      if (appliedCoupon && reservation) {
        await supabase.from("coupon_usages").insert({
          coupon_id: appliedCoupon.id,
          reservation_id: reservation.id,
          customer_email: form.email || `manual-${Date.now()}@noemail.local`,
          discount_applied: calc.discountAmount,
        });
      }

      if (form.hasAdditionalDriver && form.addFirstName && form.addLastName && form.addLicense && reservation) {
        await supabase.from("additional_drivers").insert({
          reservation_id: reservation.id,
          first_name: form.addFirstName,
          last_name: form.addLastName,
          phone: form.addPhone || null,
          license_number: form.addLicense,
          nationality: form.addNationality || null,
          dob: form.addDob || null,
          cin: form.addCin || null,
          passport: form.addPassport || null,
          license_delivery_date: form.addLicenseDeliveryDate || null,
          cin_expiry_date: form.addCinExpiryDate || null,
        } as any);
      }

      if (form.email && !form.email.endsWith("@noemail.local") && reservation) {
        const vehicle = vehicles.find((v: any) => v.id === form.vehicleId);
        const dateFmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        const addonsDetails = form.selectedAddons.map((aid) => {
          const addon = allAddons.find((a: any) => a.id === aid);
          return addon ? { name: `${addon.name} (${calc.days}j)`, total: Number(addon.price_per_day) * calc.days } : null;
        }).filter(Boolean) as { name: string; total: number }[];

        const confirmationData = {
          customerName: form.firstName,
          confirmationId: reservation.id.slice(0, 8).toUpperCase(),
          vehicleName: vehicle?.name || "",
          pickupDate: dateFmt(form.pickupDate),
          returnDate: dateFmt(form.returnDate),
          pickupLocation: form.pickupLocation,
          returnLocation: form.returnLocation || form.pickupLocation,
          rentalDays: calc.days,
          dailyRate: calc.dailyRate,
          vehicleTotal: calc.vehicleTotal,
          addonsDetails,
          deliveryFee: calc.deliveryFee,
          discountAmount: calc.discountAmount,
          depositAmount: calc.depositAmount,
          totalPrice: calc.totalPrice,
        };

        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "reservation-confirmation",
            recipientEmail: form.email,
            idempotencyKey: `manual-confirm-${reservation.id}`,
            templateData: confirmationData,
          },
        }).catch(console.error);

        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "welcome-email",
            recipientEmail: form.email,
            idempotencyKey: `manual-welcome-${reservation.id}`,
            templateData: { customerName: form.firstName },
          },
        }).catch(console.error);
      }

      toast({ title: "Réservation créée", description: `Réservation manuelle confirmée pour ${form.firstName} ${form.lastName}.` });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleAddon = (id: string) => {
    set("selectedAddons", form.selectedAddons.includes(id) ? form.selectedAddons.filter((a) => a !== id) : [...form.selectedAddons, id]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={18} /> Nouvelle réservation manuelle
          </DialogTitle>
          <DialogDescription>Créer une réservation en espèces directement depuis le tableau de bord.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle */}
          <div className="space-y-1">
            <Label>Véhicule *</Label>
            <Select value={form.vehicleId} onValueChange={(v) => { set("vehicleId", v); set("assignedPlateId", ""); set("customDailyRate", ""); }}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un véhicule" /></SelectTrigger>
              <SelectContent>
                {vehicles.filter((v) => v.is_available).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.vehicleId && (
            <>
              <div className="space-y-1">
                <Label>Véhicule du parc (immatriculation)</Label>
                <Select value={form.assignedPlateId} onValueChange={(v) => set("assignedPlateId", v)}>
                  <SelectTrigger><SelectValue placeholder="Aucune plaque assignée" /></SelectTrigger>
                  <SelectContent>
                    {(availablePlates ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.plate_number} — {p.brand} {p.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Prix/jour personnalisé (MAD)</Label>
                <Input
                  type="number"
                  value={form.customDailyRate}
                  onChange={(e) => set("customDailyRate", e.target.value)}
                  placeholder={`Tarif auto: ${calc.tierRate.toLocaleString()} MAD`}
                />
              </div>
            </>
          )}

          {/* Dates & times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Date départ *</Label><DateInputField value={form.pickupDate} onChange={(v) => set("pickupDate", v)} /></div>
            <div className="space-y-1"><Label>Heure départ</Label><Input type="time" value={form.pickupTime} onChange={(e) => set("pickupTime", e.target.value)} /></div>
            <div className="space-y-1"><Label>Date retour *</Label><DateInputField value={form.returnDate} onChange={(v) => set("returnDate", v)} /></div>
            <div className="space-y-1"><Label>Heure retour</Label><Input type="time" value={form.returnTime} onChange={(e) => set("returnTime", e.target.value)} /></div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Lieu prise en charge *</Label>
              <Select value={form.pickupLocation} onValueChange={(v) => set("pickupLocation", v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.name}>{l.name}{!l.is_free ? ` (+${l.delivery_fee} MAD)` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Lieu retour</Label>
              <Select value={form.returnLocation} onValueChange={(v) => set("returnLocation", v)}>
                <SelectTrigger><SelectValue placeholder="Même lieu" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.name}>{l.name}{!l.is_free ? ` (+${l.delivery_fee} MAD)` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer info */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Informations client</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Prénom *</Label><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
              <div className="space-y-1"><Label>Nom *</Label><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Optionnel" /></div>
              <div className="space-y-1"><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optionnel" /></div>

              <div className="space-y-1">
                <Label>Nationalité</Label>
                <Select value={form.nationality} onValueChange={(v) => { set("nationality", v); set("cin", ""); set("passport", ""); set("cinExpiryDate", ""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {isMoroccan ? (
                <>
                  <div className="space-y-1"><Label>N° CIN</Label><Input value={form.cin} onChange={(e) => set("cin", e.target.value)} placeholder="Ex: AB123456" /></div>
                  <div className="space-y-1"><Label>Expiration CIN</Label><DateInputField value={form.cinExpiryDate} onChange={(v) => set("cinExpiryDate", v)} /></div>
                </>
              ) : (
                <div className="space-y-1"><Label>N° Passeport</Label><Input value={form.passport} onChange={(e) => set("passport", e.target.value)} /></div>
              )}

              <div className="space-y-1"><Label>N° Permis *</Label><Input value={form.license} onChange={(e) => set("license", e.target.value)} /></div>
              <div className="space-y-1"><Label>Date délivrance permis</Label><DateInputField value={form.licenseDeliveryDate} onChange={(v) => set("licenseDeliveryDate", v)} /></div>
              <div className="space-y-1"><Label>Date de naissance</Label><DateInputField value={form.dob} onChange={(v) => set("dob", v)} showAge maxDate={new Date()} /></div>
            </div>
          </div>

          {/* Addons */}
          {allAddons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Options</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allAddons.filter((a) => a.is_enabled).map((addon) => (
                  <label key={addon.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary/50">
                    <Checkbox checked={form.selectedAddons.includes(addon.id)} onCheckedChange={() => toggleAddon(addon.id)} />
                    <span className="text-sm">{addon.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{Number(addon.price_per_day).toLocaleString()} MAD/j</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional driver */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={form.hasAdditionalDriver} onCheckedChange={(v) => set("hasAdditionalDriver", v)} />
              <Label>Conducteur supplémentaire</Label>
            </div>
            {form.hasAdditionalDriver && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border-l-2 border-primary/20">
                <div className="space-y-1"><Label>Prénom *</Label><Input value={form.addFirstName} onChange={(e) => set("addFirstName", e.target.value)} /></div>
                <div className="space-y-1"><Label>Nom *</Label><Input value={form.addLastName} onChange={(e) => set("addLastName", e.target.value)} /></div>
                <div className="space-y-1"><Label>Téléphone</Label><Input value={form.addPhone} onChange={(e) => set("addPhone", e.target.value)} /></div>
                <div className="space-y-1">
                  <Label>Nationalité</Label>
                  <Select value={form.addNationality} onValueChange={(v) => { set("addNationality", v); set("addCin", ""); set("addPassport", ""); set("addCinExpiryDate", ""); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {addIsMoroccan ? (
                  <>
                    <div className="space-y-1"><Label>N° CIN</Label><Input value={form.addCin} onChange={(e) => set("addCin", e.target.value)} /></div>
                    <div className="space-y-1"><Label>Expiration CIN</Label><DateInputField value={form.addCinExpiryDate} onChange={(v) => set("addCinExpiryDate", v)} /></div>
                  </>
                ) : (
                  <div className="space-y-1"><Label>N° Passeport</Label><Input value={form.addPassport} onChange={(e) => set("addPassport", e.target.value)} /></div>
                )}
                <div className="space-y-1"><Label>N° Permis *</Label><Input value={form.addLicense} onChange={(e) => set("addLicense", e.target.value)} /></div>
                <div className="space-y-1"><Label>Date délivrance permis</Label><DateInputField value={form.addLicenseDeliveryDate} onChange={(v) => set("addLicenseDeliveryDate", v)} /></div>
                <div className="space-y-1"><Label>Date de naissance</Label><DateInputField value={form.addDob} onChange={(v) => set("addDob", v)} showAge maxDate={new Date()} /></div>
              </div>
            )}
          </div>

          {/* Coupon */}
          {form.vehicleId && (
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2"><Tag size={16} /> Code promo</Label>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md text-sm">
                  <span className="font-mono font-bold">{appliedCoupon.code}</span>
                  <span className="text-primary">-{Number(appliedCoupon.discount_amount).toLocaleString()} MAD</span>
                  <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setAppliedCoupon(null)}>Retirer</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={form.couponCode}
                    onChange={(e) => set("couponCode", e.target.value)}
                    placeholder="Ex: SUMMER50"
                    className="font-mono uppercase"
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  />
                  <Button variant="outline" onClick={applyCoupon} disabled={couponLoading || !form.couponCode.trim()}>
                    {couponLoading ? "..." : "Appliquer"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Price preview */}
          {form.vehicleId && (
            <div className="bg-secondary/50 border rounded-lg p-4 space-y-1 text-sm">
              <p className="font-medium text-base mb-2">Aperçu tarif</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Véhicule ({calc.days}j × {calc.dailyRate.toLocaleString()} MAD{form.customDailyRate ? " ✏️" : ""})</span>
                <span>{calc.vehicleTotal.toLocaleString()} MAD</span>
              </div>
              {calc.addonsTotal > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Options</span><span>{calc.addonsTotal.toLocaleString()} MAD</span></div>}
              {calc.deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Frais de livraison</span><span>{calc.deliveryFee.toLocaleString()} MAD</span></div>}
              {calc.discountAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Réduction ({appliedCoupon?.code})</span>
                  <span>-{calc.discountAmount.toLocaleString()} MAD</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Caution</span><span>{calc.depositAmount.toLocaleString()} MAD</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-primary">{calc.totalPrice.toLocaleString()} MAD</span></div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={resetForm} disabled={saving} className="gap-2 w-full sm:w-auto sm:mr-auto">
              <RotateCcw size={14} /> Réinitialiser
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="w-full sm:w-auto">Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Création..." : "Créer la réservation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
