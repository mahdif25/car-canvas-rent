import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Phone, Mail, Calendar, TrendingUp, DollarSign, Wrench, ArrowDownUp, Car, ImageIcon, Save } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { format } from "date-fns";
import {
  EXPENSE_CATEGORIES,
  categoryLabel,
  useAddExpense,
  useDeleteExpense,
  type FleetExpense,
} from "@/hooks/useFleetExpenses";

interface Reservation {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_date: string;
  return_date: string;
  status: string;
  total_price: number;
  assigned_plate_id: string | null;
  vehicle_id: string;
}

interface Props {
  plate: {
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    vehicle_id: string;
    is_active: boolean;
    image_url: string | null;
  };
  vehicleImage: string | null;
  reservations: Reservation[];
  expenses: FleetExpense[];
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  active: "Active",
  completed: "Terminée",
  cancelled: "Annulée",
};
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const FleetPlateDetail = ({ plate, vehicleImage, reservations, expenses, onClose }: Props) => {
  const qc = useQueryClient();
  const plateRes = reservations.filter((r) => r.assigned_plate_id === plate.id);
  const currentRes = plateRes.find((r) => r.status === "active" || r.status === "confirmed");
  const plateExpenses = expenses.filter((e) => e.plate_id === plate.id);

  const totalRevenue = plateRes
    .filter((r) => r.status === "completed" || r.status === "active")
    .reduce((sum, r) => sum + (r.total_price || 0), 0);
  const totalExpenses = plateExpenses.reduce((sum, e) => sum + e.amount, 0);

  const daysRemaining = currentRes
    ? Math.max(0, differenceInDays(parseISO(currentRes.return_date), new Date()))
    : null;

  // Image override
  const [imageUrl, setImageUrl] = useState(plate.image_url || "");
  const [imageChanged, setImageChanged] = useState(false);

  const saveImageMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("fleet_plates")
        .update({ image_url: imageUrl.trim() || null })
        .eq("id", plate.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fleet-plates"] });
      toast({ title: "Image mise à jour" });
      setImageChanged(false);
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  // Expense form
  const [expCat, setExpCat] = useState("cleaning");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expDesc, setExpDesc] = useState("");
  const [showExpForm, setShowExpForm] = useState(false);

  const addExpense = useAddExpense();
  const deleteExpense = useDeleteExpense();

  const handleAddExpense = () => {
    if (!expAmount || Number(expAmount) <= 0) {
      toast({ title: "Montant requis", variant: "destructive" });
      return;
    }
    addExpense.mutate(
      {
        plate_id: plate.id,
        category: expCat,
        amount: Number(expAmount),
        expense_date: expDate,
        description: expDesc || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: "Dépense ajoutée" });
          setExpAmount("");
          setExpDesc("");
          setShowExpForm(false);
        },
        onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  const displayImage = vehicleImage;

  return (
    <div className="space-y-4">
      {/* Image Section */}
      <div className="space-y-3">
        <div className="h-36 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
          {displayImage ? (
            <img src={displayImage} alt={`${plate.brand} ${plate.model}`} className="h-full object-contain" />
          ) : (
            <Car className="h-12 w-12 text-muted-foreground/40" />
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-3 w-3" /> Image personnalisée (URL)
          </label>
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImageChanged(true); }}
              placeholder="https://... (laisser vide pour l'image par défaut)"
              className="h-8 text-xs"
            />
            {imageChanged && (
              <Button size="sm" className="h-8 gap-1" onClick={() => saveImageMutation.mutate()} disabled={saveImageMutation.isPending}>
                <Save className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/40 rounded-lg p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold">{plateRes.length}</p>
          <p className="text-xs text-muted-foreground">Réservations</p>
        </div>
        <div className="bg-secondary/40 rounded-lg p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
          <p className="text-lg font-bold">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Revenus (MAD)</p>
        </div>
        <div className="bg-secondary/40 rounded-lg p-3 text-center">
          <Wrench className="h-4 w-4 mx-auto mb-1 text-red-500" />
          <p className="text-lg font-bold">{totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Dépenses (MAD)</p>
        </div>
        <div className="bg-secondary/40 rounded-lg p-3 text-center">
          <ArrowDownUp className="h-4 w-4 mx-auto mb-1 text-blue-600" />
          <p className={`text-lg font-bold ${totalRevenue - totalExpenses >= 0 ? "text-green-600" : "text-red-500"}`}>
            {(totalRevenue - totalExpenses).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Bénéfice net</p>
        </div>
      </div>

      <Tabs defaultValue="availability" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="availability">Disponibilité</TabsTrigger>
          <TabsTrigger value="expenses">Dépenses ({plateExpenses.length})</TabsTrigger>
        </TabsList>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          {currentRes ? (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Réservation en cours</h4>
                  <Badge className={statusColors[currentRes.status]}>
                    {statusLabels[currentRes.status]}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{currentRes.customer_first_name} {currentRes.customer_last_name}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" /> {currentRes.customer_phone}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" /> {currentRes.customer_email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{currentRes.pickup_date} → {currentRes.return_date}</span>
                  </div>
                  <p className="font-semibold text-orange-700">
                    {daysRemaining === 0 ? "Retour aujourd'hui" : `${daysRemaining} jour${daysRemaining! > 1 ? "s" : ""} restant${daysRemaining! > 1 ? "s" : ""}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-6 text-green-600 font-medium">
              ✓ Véhicule disponible
            </div>
          )}

          {plateRes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Historique des réservations</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Dates</TableHead>
                      <TableHead className="text-xs">Montant</TableHead>
                      <TableHead className="text-xs">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plateRes.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell className="text-xs">{res.customer_first_name} {res.customer_last_name}</TableCell>
                        <TableCell className="text-xs">{res.pickup_date} → {res.return_date}</TableCell>
                        <TableCell className="text-xs">{res.total_price?.toLocaleString()} MAD</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${statusColors[res.status]}`}>
                            {statusLabels[res.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          {!showExpForm ? (
            <Button size="sm" onClick={() => setShowExpForm(true)} className="gap-1">
              <Plus size={14} /> Ajouter une dépense
            </Button>
          ) : (
            <Card>
              <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Select value={expCat} onValueChange={setExpCat}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Montant (MAD)"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Description (optionnel)"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddExpense} disabled={addExpense.isPending}>
                    {addExpense.isPending ? "..." : "Ajouter"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowExpForm(false)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {plateExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Catégorie</TableHead>
                    <TableHead className="text-xs text-right">Montant</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plateExpenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-xs">{exp.expense_date}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">{categoryLabel(exp.category)}</Badge>
                        {exp.description && <p className="text-[10px] text-muted-foreground mt-0.5">{exp.description}</p>}
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">{exp.amount.toLocaleString()} MAD</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => {
                            if (confirm("Supprimer cette dépense ?")) {
                              deleteExpense.mutate(exp.id, {
                                onSuccess: () => toast({ title: "Dépense supprimée" }),
                              });
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune dépense enregistrée.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetPlateDetail;
