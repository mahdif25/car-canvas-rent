import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getDailyRateFromTiers } from "@/hooks/useVehicles";
import { getDeliveryFee, type Location } from "@/hooks/useLocations";
import { useAvailablePlates } from "@/hooks/useFleetPlates";
import { Plus } from "lucide-react";

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

export default function ManualReservationDialog({ open, onOpenChange, vehicles, pricingTiers, locations, allAddons, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState("");
  const [pickupDate, setPickupDate] = useState(today());
  const [returnDate, setReturnDate] = useState(today());
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("09:00");
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [assignedPlateId, setAssignedPlateId] = useState("");

  const { data: availablePlates } = useAvailablePlates(vehicleId || undefined, pickupDate, returnDate);

  // Additional driver
  const [hasAdditionalDriver, setHasAdditionalDriver] = useState(false);
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addLicense, setAddLicense] = useState("");
  const [addNationality, setAddNationality] = useState("");
  const [addDob, setAddDob] = useState("");

  const calc = useMemo(() => {
    const days = Math.max(1, Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000));
    const tiers = pricingTiers.filter((t: any) => t.vehicle_id === vehicleId);
    const dailyRate = getDailyRateFromTiers(tiers, days);
    const vehicleTotal = dailyRate * days;
    const addonsTotal = selectedAddons.reduce((sum, aid) => {
      const addon = allAddons.find((a: any) => a.id === aid);
      return sum + (addon ? Number(addon.price_per_day) * days : 0);
    }, 0);
    const deliveryFee = getDeliveryFee(locations, pickupLocation, returnLocation || pickupLocation);
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    const depositAmount = vehicle ? Number(vehicle.security_deposit) : 0;
    const totalPrice = vehicleTotal + addonsTotal + deliveryFee;
    return { days, dailyRate, vehicleTotal, addonsTotal, deliveryFee, depositAmount, totalPrice };
  }, [vehicleId, pickupDate, returnDate, selectedAddons, pickupLocation, returnLocation, pricingTiers, locations, vehicles, allAddons]);

  const resetForm = () => {
    setVehicleId("");
    setPickupDate(today());
    setReturnDate(today());
    setPickupTime("09:00");
    setReturnTime("09:00");
    setPickupLocation("");
    setReturnLocation("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setLicense("");
    setNationality("");
    setDob("");
    setSelectedAddons([]);
    setAssignedPlateId("");
    setHasAdditionalDriver(false);
    setAddFirstName("");
    setAddLastName("");
    setAddPhone("");
    setAddLicense("");
    setAddNationality("");
    setAddDob("");
  };

  const handleSubmit = async () => {
    if (!vehicleId || !firstName || !lastName || !phone || !license || !pickupLocation) {
      toast({ title: "Champs obligatoires manquants", description: "Véhicule, nom, prénom, téléphone, permis et lieu de prise en charge sont requis.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: reservation, error } = await supabase.from("reservations").insert({
        vehicle_id: vehicleId,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_time: pickupTime,
        return_time: returnTime,
        pickup_location: pickupLocation,
        return_location: returnLocation || pickupLocation,
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_email: email || `manual-${Date.now()}@noemail.local`,
        customer_phone: phone,
        customer_license: license,
        customer_nationality: nationality || null,
        customer_dob: dob || null,
        total_price: calc.totalPrice,
        delivery_fee: calc.deliveryFee,
        deposit_amount: calc.depositAmount,
        discount_amount: 0,
        assigned_plate_id: assignedPlateId || null,
        status: "confirmed",
        is_manual: true,
        payment_method: "cash",
        marketing_consent: false,
      } as any).select().single();

      if (error) throw error;

      // Insert addons
      if (selectedAddons.length > 0 && reservation) {
        await supabase.from("reservation_addons").insert(
          selectedAddons.map((addon_id) => ({ reservation_id: reservation.id, addon_id }))
        );
      }

      // Insert additional driver
      if (hasAdditionalDriver && addFirstName && addLastName && addLicense && reservation) {
        await supabase.from("additional_drivers").insert({
          reservation_id: reservation.id,
          first_name: addFirstName,
          last_name: addLastName,
          phone: addPhone || null,
          license_number: addLicense,
          nationality: addNationality || null,
          dob: addDob || null,
        });
      }

      toast({ title: "Réservation créée", description: `Réservation manuelle confirmée pour ${firstName} ${lastName}.` });
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
    setSelectedAddons((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
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
            <Select value={vehicleId} onValueChange={(v) => { setVehicleId(v); setAssignedPlateId(""); }}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un véhicule" /></SelectTrigger>
              <SelectContent>
                {vehicles.filter((v) => v.is_available).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plate assignment */}
          {vehicleId && (
            <div className="space-y-1">
              <Label>Véhicule du parc (immatriculation)</Label>
              <Select value={assignedPlateId} onValueChange={setAssignedPlateId}>
                <SelectTrigger><SelectValue placeholder="Aucune plaque assignée" /></SelectTrigger>
                <SelectContent>
                  {(availablePlates ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.plate_number} — {p.brand} {p.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dates & times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date départ *</Label>
              <DatePickerField value={pickupDate} onChange={setPickupDate} />
            </div>
            <div className="space-y-1">
              <Label>Heure départ</Label>
              <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Date retour *</Label>
              <DatePickerField value={returnDate} onChange={setReturnDate} />
            </div>
            <div className="space-y-1">
              <Label>Heure retour</Label>
              <Input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Lieu prise en charge *</Label>
              <Select value={pickupLocation} onValueChange={setPickupLocation}>
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
              <Select value={returnLocation} onValueChange={setReturnLocation}>
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
              <div className="space-y-1">
                <Label>Prénom *</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Nom *</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optionnel" />
              </div>
              <div className="space-y-1">
                <Label>Téléphone *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>N° Permis *</Label>
                <Input value={license} onChange={(e) => setLicense(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Nationalité</Label>
                <Input value={nationality} onChange={(e) => setNationality(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Date de naissance</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Addons */}
          {allAddons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Options</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allAddons.filter((a) => a.is_enabled).map((addon) => (
                  <label key={addon.id} className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-secondary/50">
                    <Checkbox checked={selectedAddons.includes(addon.id)} onCheckedChange={() => toggleAddon(addon.id)} />
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
              <Switch checked={hasAdditionalDriver} onCheckedChange={setHasAdditionalDriver} />
              <Label>Conducteur supplémentaire</Label>
            </div>
            {hasAdditionalDriver && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border-l-2 border-primary/20">
                <div className="space-y-1"><Label>Prénom *</Label><Input value={addFirstName} onChange={(e) => setAddFirstName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Nom *</Label><Input value={addLastName} onChange={(e) => setAddLastName(e.target.value)} /></div>
                <div className="space-y-1"><Label>Téléphone</Label><Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} /></div>
                <div className="space-y-1"><Label>N° Permis *</Label><Input value={addLicense} onChange={(e) => setAddLicense(e.target.value)} /></div>
                <div className="space-y-1"><Label>Nationalité</Label><Input value={addNationality} onChange={(e) => setAddNationality(e.target.value)} /></div>
                <div className="space-y-1"><Label>Date de naissance</Label><Input type="date" value={addDob} onChange={(e) => setAddDob(e.target.value)} /></div>
              </div>
            )}
          </div>

          {/* Price preview */}
          {vehicleId && (
            <div className="bg-secondary/50 border rounded-lg p-4 space-y-1 text-sm">
              <p className="font-medium text-base mb-2">Aperçu tarif</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Véhicule ({calc.days}j × {calc.dailyRate.toLocaleString()} MAD)</span><span>{calc.vehicleTotal.toLocaleString()} MAD</span></div>
              {calc.addonsTotal > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Options</span><span>{calc.addonsTotal.toLocaleString()} MAD</span></div>}
              {calc.deliveryFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Frais de livraison</span><span>{calc.deliveryFee.toLocaleString()} MAD</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Caution</span><span>{calc.depositAmount.toLocaleString()} MAD</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-primary">{calc.totalPrice.toLocaleString()} MAD</span></div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Création..." : "Créer la réservation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
