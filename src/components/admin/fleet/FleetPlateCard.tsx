import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Calendar, DollarSign, Wrench, TrendingUp } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

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

interface FleetExpense {
  id: string;
  plate_id: string;
  amount: number;
}

interface Props {
  plate: {
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    vehicle_id: string;
    is_active: boolean;
    notes: string | null;
  };
  vehicleImage: string | null;
  reservations: Reservation[];
  expenses: FleetExpense[];
  isSelected: boolean;
  onClick: () => void;
}

const FleetPlateCard = ({ plate, vehicleImage, reservations, expenses, isSelected, onClick }: Props) => {
  const plateReservations = reservations.filter((r) => r.assigned_plate_id === plate.id);
  const currentRes = plateReservations.find(
    (r) => r.status === "active" || r.status === "confirmed"
  );

  const totalRevenue = plateReservations
    .filter((r) => r.status === "completed" || r.status === "active")
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  const totalExpenses = expenses
    .filter((e) => e.plate_id === plate.id)
    .reduce((sum, e) => sum + e.amount, 0);

  const daysRemaining = currentRes
    ? Math.max(0, differenceInDays(parseISO(currentRes.return_date), new Date()))
    : null;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""} ${!plate.is_active ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Vehicle Image */}
        <div className="h-28 flex items-center justify-center mb-3 bg-secondary/30 rounded-lg overflow-hidden">
          {vehicleImage ? (
            <img src={vehicleImage} alt={`${plate.brand} ${plate.model}`} className="h-full object-contain" />
          ) : (
            <Car className="h-12 w-12 text-muted-foreground/40" />
          )}
        </div>

        {/* Plate & Model */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">{plate.plate_number}</span>
          {!plate.is_active && <Badge variant="destructive" className="text-[10px]">Inactif</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mb-3">{plate.brand} {plate.model}</p>

        {/* Availability */}
        {currentRes ? (
          <Badge className="mb-3 bg-orange-100 text-orange-700 hover:bg-orange-100">
            <Calendar className="h-3 w-3 mr-1" />
            En location — {daysRemaining}j restant{daysRemaining !== 1 ? "s" : ""}
          </Badge>
        ) : plate.is_active ? (
          <Badge variant="outline" className="mb-3 text-green-600 border-green-300">
            Disponible
          </Badge>
        ) : null}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-secondary/40 rounded p-2">
            <TrendingUp className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
            <p className="font-semibold">{plateReservations.length}</p>
            <p className="text-muted-foreground">Rés.</p>
          </div>
          <div className="bg-secondary/40 rounded p-2">
            <DollarSign className="h-3 w-3 mx-auto mb-1 text-green-600" />
            <p className="font-semibold">{totalRevenue.toLocaleString()}</p>
            <p className="text-muted-foreground">MAD</p>
          </div>
          <div className="bg-secondary/40 rounded p-2">
            <Wrench className="h-3 w-3 mx-auto mb-1 text-red-500" />
            <p className="font-semibold">{totalExpenses.toLocaleString()}</p>
            <p className="text-muted-foreground">Dép.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FleetPlateCard;
