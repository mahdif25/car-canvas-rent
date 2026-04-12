import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { Plus, Car, Pencil } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { useFleetExpenses } from "@/hooks/useFleetExpenses";
import FleetPlateCard from "@/components/admin/fleet/FleetPlateCard";
import FleetPlateDetail from "@/components/admin/fleet/FleetPlateDetail";

const AdminFleetPlates = () => {
  const qc = useQueryClient();
  const { data: vehicles = [] } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPlateId, setSelectedPlateId] = useState<string | null>(null);
  const [filterBrand, setFilterBrand] = useState("all");

  const { data: plates = [], isLoading } = useQuery({
    queryKey: ["fleet-plates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fleet_plates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["plate-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, customer_first_name, customer_last_name, customer_phone, customer_email, pickup_date, return_date, status, assigned_plate_id, vehicle_id, total_price")
        .not("assigned_plate_id", "is", null)
        .order("pickup_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses = [] } = useFleetExpenses();

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!vehicleId || !plateNumber.trim()) throw new Error("Véhicule et immatriculation requis");
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) throw new Error("Véhicule introuvable");

      const payload = {
        vehicle_id: vehicleId,
        plate_number: plateNumber.trim().toUpperCase(),
        brand: vehicle.brand,
        model: vehicle.model,
        notes: notes || null,
      };

      if (editingId) {
        const { error } = await supabase.from("fleet_plates").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("fleet_plates").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fleet-plates"] });
      toast({ title: editingId ? "Véhicule modifié" : "Véhicule ajouté au parc" });
      resetForm();
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fleet_plates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fleet-plates"] });
      toast({ title: "Véhicule retiré du parc" });
      if (selectedPlateId) setSelectedPlateId(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("fleet_plates").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fleet-plates"] }),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setVehicleId("");
    setPlateNumber("");
    setNotes("");
  };

  const editPlate = (plate: any) => {
    setEditingId(plate.id);
    setVehicleId(plate.vehicle_id);
    setPlateNumber(plate.plate_number);
    setNotes(plate.notes || "");
    setShowForm(true);
  };

  const getVehicleImage = (vId: string) => {
    const v = vehicles.find((vh) => vh.id === vId);
    return v?.image_url || null;
  };

  const selectedPlate = plates.find((p) => p.id === selectedPlateId);

  const uniqueBrands = [...new Set(plates.map((p) => p.brand))].sort();
  const filteredPlates = filterBrand === "all" ? plates : plates.filter((p) => p.brand === filterBrand);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Parc Auto</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrer par marque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les marques</SelectItem>
              {uniqueBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus size={18} /> Ajouter un véhicule
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Modifier" : "Ajouter"} un véhicule au parc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Type de véhicule *</label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name} ({v.brand} {v.model})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Immatriculation *</label>
                <Input
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="AB-123-CD"
                  className="uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Notes</label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optionnel" />
              </div>
            </div>
            {selectedVehicle && (
              <p className="text-sm text-muted-foreground">Marque: <strong>{selectedVehicle.brand}</strong> — Modèle: <strong>{selectedVehicle.model}</strong></p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Enregistrement..." : editingId ? "Modifier" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
      ) : plates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Car className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>Aucun véhicule dans le parc. Ajoutez votre premier véhicule.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlates.map((plate) => (
            <FleetPlateCard
              key={plate.id}
              plate={plate}
              vehicleImage={plate.image_url || getVehicleImage(plate.vehicle_id)}
              reservations={reservations}
              expenses={expenses}
              isSelected={selectedPlateId === plate.id}
              onClick={() => setSelectedPlateId(selectedPlateId === plate.id ? null : plate.id)}
              onEdit={() => editPlate(plate)}
            />
          ))}
        </div>
      )}

      {/* Sheet detail panel — slides in from the right */}
      <Sheet open={!!selectedPlate} onOpenChange={(open) => { if (!open) setSelectedPlateId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          {selectedPlate && (
            <div className="p-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded text-base">{selectedPlate.plate_number}</span>
                  <span className="text-muted-foreground font-normal text-sm">{selectedPlate.brand} {selectedPlate.model}</span>
                  <button
                    onClick={() => { setSelectedPlateId(null); editPlate(selectedPlate); }}
                    className="ml-auto p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                </SheetTitle>
              </SheetHeader>
              <FleetPlateDetail
                plate={selectedPlate}
                vehicleImage={selectedPlate.image_url || getVehicleImage(selectedPlate.vehicle_id)}
                reservations={reservations}
                expenses={expenses}
                onClose={() => setSelectedPlateId(null)}
                onEdit={() => { setSelectedPlateId(null); editPlate(selectedPlate); }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminFleetPlates;
