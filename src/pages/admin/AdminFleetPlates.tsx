import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, X, Check, ChevronDown, ChevronUp, Car } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";

const AdminFleetPlates = () => {
  const qc = useQueryClient();
  const { data: vehicles = [] } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);
  const [expandedPlate, setExpandedPlate] = useState<string | null>(null);

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
        .select("id, customer_first_name, customer_last_name, pickup_date, return_date, status, assigned_plate_id, vehicle_id")
        .not("assigned_plate_id", "is", null)
        .order("pickup_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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

  // Group plates by vehicle type
  const grouped = vehicles
    .map((v) => ({
      vehicle: v,
      plates: plates.filter((p) => p.vehicle_id === v.id),
    }))
    .filter((g) => g.plates.length > 0);

  const getPlateReservations = (plateId: string) =>
    reservations.filter((r) => r.assigned_plate_id === plateId);

  const getCurrentReservation = (plateId: string) =>
    reservations.find(
      (r) => r.assigned_plate_id === plateId && (r.status === "active" || r.status === "confirmed")
    );

  const statusLabels: Record<string, string> = {
    pending: "En attente", confirmed: "Confirmée", active: "Active", completed: "Terminée", cancelled: "Annulée",
  };
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700", completed: "bg-gray-100 text-gray-700", cancelled: "bg-red-100 text-red-700",
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Parc Auto</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={18} /> Ajouter un véhicule
          </Button>
        )}
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
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Car className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>Aucun véhicule dans le parc. Ajoutez votre premier véhicule.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ vehicle, plates: vPlates }) => (
            <Card key={vehicle.id}>
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30"
                onClick={() => setExpandedVehicle(expandedVehicle === vehicle.id ? null : vehicle.id)}
              >
                <div className="flex items-center gap-3">
                  <Car size={20} className="text-primary" />
                  <div>
                    <p className="font-semibold">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                  </div>
                  <Badge variant="secondary">{vPlates.length} véhicule{vPlates.length > 1 ? "s" : ""}</Badge>
                </div>
                {expandedVehicle === vehicle.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {expandedVehicle === vehicle.id && (
                <CardContent className="pt-0 space-y-2">
                  {vPlates.map((plate) => {
                    const currentRes = getCurrentReservation(plate.id);
                    const plateHistory = getPlateReservations(plate.id);
                    const isExpanded = expandedPlate === plate.id;

                    return (
                      <div key={plate.id} className="border rounded-lg">
                        <div
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 cursor-pointer hover:bg-secondary/20"
                          onClick={() => setExpandedPlate(isExpanded ? null : plate.id)}
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">{plate.plate_number}</span>
                            {!plate.is_active && <Badge variant="destructive" className="text-[10px]">Inactif</Badge>}
                            {currentRes && (
                              <Badge className={`text-[10px] ${statusColors[currentRes.status]}`}>
                                {currentRes.customer_first_name} {currentRes.customer_last_name} — {statusLabels[currentRes.status]}
                              </Badge>
                            )}
                            {!currentRes && plate.is_active && <Badge variant="outline" className="text-[10px] text-green-600">Disponible</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            {plate.notes && <span className="text-xs text-muted-foreground hidden sm:inline">{plate.notes}</span>}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ id: plate.id, is_active: !plate.is_active }); }}
                            >
                              {plate.is_active ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-red-500" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); editPlate(plate); }}>
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer ce véhicule du parc ?")) deleteMutation.mutate(plate.id); }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>

                        {isExpanded && plateHistory.length > 0 && (
                          <div className="border-t px-3 py-2 bg-secondary/20">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Historique des réservations</p>
                            <div className="space-y-1">
                              {plateHistory.map((res) => (
                                <div key={res.id} className="flex items-center justify-between text-xs py-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[res.status]}`}>
                                      {statusLabels[res.status]}
                                    </span>
                                    <span>{res.customer_first_name} {res.customer_last_name}</span>
                                  </div>
                                  <span className="text-muted-foreground">{res.pickup_date} → {res.return_date}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {isExpanded && plateHistory.length === 0 && (
                          <div className="border-t px-3 py-2 bg-secondary/20">
                            <p className="text-xs text-muted-foreground">Aucune réservation assignée.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFleetPlates;
