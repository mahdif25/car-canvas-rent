import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { useFleetLoans, useAddLoan, useDeleteLoan, type FleetLoan } from "@/hooks/useFleetLoans";
import { useFleetPlates } from "@/hooks/useFleetPlates";
import { useFleetExpenses, categoryLabel, EXPENSE_CATEGORIES } from "@/hooks/useFleetExpenses";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, TrendingUp, TrendingDown, Banknote, Calculator, Download } from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO, eachMonthOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

const AdminFinances = () => {
  const { data: loans = [], isLoading: loansLoading } = useFleetLoans();
  const { data: plates = [] } = useFleetPlates();
  const { data: expenses = [] } = useFleetExpenses();
  const addLoan = useAddLoan();
  const deleteLoan = useDeleteLoan();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlateId, setSelectedPlateId] = useState<string>("");
  const [simAmount, setSimAmount] = useState("");
  const [simMonths, setSimMonths] = useState("");
  const [simRate, setSimRate] = useState("");

  // Report period state
  const [reportStartDate, setReportStartDate] = useState(() => format(subMonths(new Date(), 12), "yyyy-MM-dd"));
  const [reportEndDate, setReportEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  // Summary period state
  const [summaryStartDate, setSummaryStartDate] = useState(() => format(subMonths(new Date(), 12), "yyyy-MM-dd"));
  const [summaryEndDate, setSummaryEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  // Fetch all reservations for revenue calculation
  const { data: reservations = [] } = useQuery({
    queryKey: ["all-reservations-finances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, assigned_plate_id, pickup_date, return_date, total_price, status, delivery_fee, discount_amount")
        .in("status", ["confirmed", "active", "completed"]);
      if (error) throw error;
      return data;
    },
  });

  // ---- Add Loan Form State ----
  const [form, setForm] = useState({
    plate_id: "",
    bank_name: "",
    loan_amount: "",
    monthly_payment: "",
    loan_duration_months: "",
    start_date: "",
    interest_rate: "0",
    remaining_amount: "",
    notes: "",
  });

  const handleAdd = async () => {
    if (!form.plate_id || !form.bank_name || !form.loan_amount || !form.monthly_payment || !form.loan_duration_months || !form.start_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    await addLoan.mutateAsync({
      plate_id: form.plate_id,
      bank_name: form.bank_name,
      loan_amount: Number(form.loan_amount),
      monthly_payment: Number(form.monthly_payment),
      loan_duration_months: Number(form.loan_duration_months),
      start_date: form.start_date,
      interest_rate: Number(form.interest_rate),
      remaining_amount: Number(form.remaining_amount || form.loan_amount),
      notes: form.notes || null,
      is_active: true,
    });
    toast.success("Crédit ajouté");
    setAddOpen(false);
    setForm({ plate_id: "", bank_name: "", loan_amount: "", monthly_payment: "", loan_duration_months: "", start_date: "", interest_rate: "0", remaining_amount: "", notes: "" });
  };

  // ---- Computed Totals ----
  const activeLoans = loans.filter((l) => l.is_active);
  const totalMonthlyLoan = activeLoans.reduce((s, l) => s + l.monthly_payment, 0);
  const totalLoanBalance = activeLoans.reduce((s, l) => s + l.remaining_amount, 0);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthExpenses = expenses.filter((e) => {
    const d = parseISO(e.expense_date);
    return d >= monthStart && d <= monthEnd;
  });
  const totalMonthlyExpenses = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);

  const currentMonthReservations = reservations.filter((r) => {
    const pickup = parseISO(r.pickup_date);
    return pickup >= monthStart && pickup <= monthEnd;
  });
  const totalMonthlyRevenue = currentMonthReservations.reduce((s, r) => s + r.total_price, 0);
  const netProfit = totalMonthlyRevenue - totalMonthlyExpenses - totalMonthlyLoan;

  // ---- Loan Simulator ----
  const simMonthly = useMemo(() => {
    if (!simAmount || !simMonths) return 0;
    const P = Number(simAmount);
    const n = Number(simMonths);
    const r = Number(simRate || 0) / 100 / 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [simAmount, simMonths, simRate]);

  // ---- Per-Car Report (filtered by period) ----
  const reportStart = parseISO(reportStartDate);
  const reportEnd = parseISO(reportEndDate);

  const selectedPlate = plates?.find((p) => p.id === selectedPlateId);
  const plateLoans = loans.filter((l) => l.plate_id === selectedPlateId);
  const plateExpenses = expenses.filter((e) => {
    if (e.plate_id !== selectedPlateId) return false;
    const d = parseISO(e.expense_date);
    return d >= reportStart && d <= reportEnd;
  });
  const plateReservations = reservations.filter((r) => {
    if (r.assigned_plate_id !== selectedPlateId) return false;
    const pickup = parseISO(r.pickup_date);
    return pickup >= reportStart && pickup <= reportEnd;
  });
  const plateTotalRevenue = plateReservations.reduce((s, r) => s + r.total_price, 0);
  const plateTotalExpenses = plateExpenses.reduce((s, e) => s + e.amount, 0);
  const plateTotalLoanMonthly = plateLoans.filter((l) => l.is_active).reduce((s, l) => s + l.monthly_payment, 0);

  // Monthly earnings bar chart (within report period)
  const monthlyEarnings = useMemo(() => {
    if (!reportStartDate || !reportEndDate) return [];
    const months = eachMonthOfInterval({ start: reportStart, end: reportEnd });
    return months.map((m) => {
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const rev = plateReservations
        .filter((r) => { const d = parseISO(r.pickup_date); return d >= mStart && d <= mEnd; })
        .reduce((s, r) => s + r.total_price, 0);
      return { month: format(m, "MMM yy", { locale: fr }), revenue: rev };
    });
  }, [plateReservations, reportStart, reportEnd]);

  // Rental utilization donut (within report period)
  const utilization = useMemo(() => {
    const totalDays = Math.max(1, differenceInDays(reportEnd, reportStart) + 1);
    const rentedDays = plateReservations.reduce((s, r) => {
      const p = parseISO(r.pickup_date) < reportStart ? reportStart : parseISO(r.pickup_date);
      const ret = parseISO(r.return_date) > reportEnd ? reportEnd : parseISO(r.return_date);
      return s + Math.max(0, differenceInDays(ret, p) + 1);
    }, 0);
    const idle = Math.max(0, totalDays - rentedDays);
    return [
      { name: "Jours loués", value: Math.min(rentedDays, totalDays) },
      { name: "Jours libres", value: idle },
    ];
  }, [plateReservations, reportStart, reportEnd]);

  // Expense category pie (within period)
  const expensePie = useMemo(() => {
    const map: Record<string, number> = {};
    plateExpenses.forEach((e) => {
      const label = categoryLabel(e.category);
      map[label] = (map[label] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [plateExpenses]);

  // Cumulative progress line chart (within period)
  const progressData = useMemo(() => {
    if (!reportStartDate || !reportEndDate) return [];
    const months = eachMonthOfInterval({ start: reportStart, end: reportEnd });
    let cumRev = 0;
    let cumCost = 0;
    return months.map((m) => {
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const rev = plateReservations
        .filter((r) => { const d = parseISO(r.pickup_date); return d >= mStart && d <= mEnd; })
        .reduce((s, r) => s + r.total_price, 0);
      const exp = plateExpenses
        .filter((e) => { const d = parseISO(e.expense_date); return d >= mStart && d <= mEnd; })
        .reduce((s, e) => s + e.amount, 0);
      cumRev += rev;
      cumCost += exp + plateTotalLoanMonthly;
      return { month: format(m, "MMM yy", { locale: fr }), revenue: cumRev, costs: cumCost };
    });
  }, [plateReservations, plateExpenses, plateTotalLoanMonthly, reportStart, reportEnd]);

  // ---- Reservation breakdown for selected plate ----
  const reservationBreakdown = useMemo(() => {
    return plateReservations.map((r) => {
      const days = Math.max(1, differenceInDays(parseISO(r.return_date), parseISO(r.pickup_date)));
      return {
        id: r.id.slice(0, 8).toUpperCase(),
        startDate: r.pickup_date,
        endDate: r.return_date,
        days,
        amount: r.total_price,
      };
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [plateReservations]);

  // ---- Download Report ----
  const handleDownloadReport = () => {
    if (!selectedPlate) return;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const netPlate = plateTotalRevenue - plateTotalExpenses - plateTotalLoanMonthly * Math.max(1, Math.round(differenceInDays(reportEnd, reportStart) / 30));

    const w = window.open("", "_blank", "width=900,height=800");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Rapport - ${selectedPlate.plate_number}</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; color: #1A1A1A; padding: 30px; max-width: 850px; margin: auto; font-size: 13px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; font-weight: 700; }
        .header .sub { font-size: 12px; color: #666; margin-top: 4px; }
        .accent-line { height: 3px; background: linear-gradient(90deg, #00C853, #00C853 40%, #e0e0e0 40%); border-radius: 2px; margin: 16px 0; }
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .kpi { background: #f8f8f8; border-radius: 8px; padding: 14px; }
        .kpi .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
        .kpi .val { font-size: 16px; font-weight: 700; }
        .kpi .val.green { color: #16a34a; }
        .kpi .val.red { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; padding: 6px 8px; border-bottom: 2px solid #eee; }
        td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
        td.right, th.right { text-align: right; }
        .section-title { font-size: 13px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; color: #00C853; text-transform: uppercase; letter-spacing: 1px; }
        .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #999; }
        @media print { body { padding: 15px; } .kpi { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <div class="header">
        <h1>Centre Lux Car — Rapport Financier</h1>
        <p class="sub">${selectedPlate.plate_number} — ${selectedPlate.brand} ${selectedPlate.model}</p>
        <p class="sub">Période : ${fmtDate(reportStartDate)} — ${fmtDate(reportEndDate)}</p>
      </div>
      <div class="accent-line"></div>

      <div class="kpis">
        <div class="kpi"><div class="label">Crédit mensuel</div><div class="val">${fmt(plateTotalLoanMonthly)}</div></div>
        <div class="kpi"><div class="label">Total dépenses</div><div class="val">${fmt(plateTotalExpenses)}</div></div>
        <div class="kpi"><div class="label">Total revenus</div><div class="val green">${fmt(plateTotalRevenue)}</div></div>
        <div class="kpi"><div class="label">Bénéfice net</div><div class="val ${netPlate >= 0 ? 'green' : 'red'}">${fmt(netPlate)}</div></div>
      </div>

      ${utilization[0].value + utilization[1].value > 0 ? `
      <div class="section-title">Utilisation</div>
      <p style="font-size:12px;margin-bottom:4px;">${utilization[0].value} jours loués / ${utilization[1].value} jours libres (${Math.round(utilization[0].value / (utilization[0].value + utilization[1].value) * 100)}% d'occupation)</p>
      ` : ""}

      ${expensePie.length > 0 ? `
      <div class="section-title">Dépenses par catégorie</div>
      <table>
        <thead><tr><th>Catégorie</th><th class="right">Montant</th></tr></thead>
        <tbody>${expensePie.map((e) => `<tr><td>${e.name}</td><td class="right">${e.value.toLocaleString("fr-FR")} MAD</td></tr>`).join("")}</tbody>
      </table>
      ` : ""}

      ${plateLoans.length > 0 ? `
      <div class="section-title">Crédits</div>
      <table>
        <thead><tr><th>Banque</th><th class="right">Montant</th><th class="right">Mensualité</th><th class="right">Restant</th></tr></thead>
        <tbody>${plateLoans.map((l) => `<tr><td>${l.bank_name}</td><td class="right">${Number(l.loan_amount).toLocaleString("fr-FR")} MAD</td><td class="right">${Number(l.monthly_payment).toLocaleString("fr-FR")} MAD</td><td class="right">${Number(l.remaining_amount).toLocaleString("fr-FR")} MAD</td></tr>`).join("")}</tbody>
      </table>
      ` : ""}

      <div class="section-title">Réservations (${reservationBreakdown.length})</div>
      <table>
        <thead><tr><th>ID</th><th>Du</th><th>Au</th><th class="right">Jours</th><th class="right">Montant</th></tr></thead>
        <tbody>
          ${reservationBreakdown.length > 0 ? reservationBreakdown.map((r) => `<tr><td style="font-family:monospace;font-weight:600">${r.id}</td><td>${r.startDate}</td><td>${r.endDate}</td><td class="right">${r.days}</td><td class="right">${Number(r.amount).toLocaleString("fr-FR")} MAD</td></tr>`).join("") : `<tr><td colspan="5" style="text-align:center;color:#999;padding:16px">Aucune réservation</td></tr>`}
          ${reservationBreakdown.length > 0 ? `<tr style="font-weight:700;border-top:2px solid #333"><td colspan="3">Total</td><td class="right">${reservationBreakdown.reduce((s, r) => s + r.days, 0)}</td><td class="right">${reservationBreakdown.reduce((s, r) => s + r.amount, 0).toLocaleString("fr-FR")} MAD</td></tr>` : ""}
        </tbody>
      </table>

      ${monthlyEarnings.length > 0 ? `
      <div class="section-title">Revenus mensuels</div>
      <table>
        <thead><tr><th>Mois</th><th class="right">Revenus</th></tr></thead>
        <tbody>${monthlyEarnings.map((m) => `<tr><td>${m.month}</td><td class="right">${m.revenue.toLocaleString("fr-FR")} MAD</td></tr>`).join("")}</tbody>
      </table>
      ` : ""}

      <div class="accent-line"></div>
      <div class="footer">
        <p>Centre Lux Car • centreluxcar.com</p>
        <p>Rapport généré le ${fmtDate(format(new Date(), "yyyy-MM-dd"))}</p>
      </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ---- Summary Table (filtered by summary period) ----
  const summaryStart = parseISO(summaryStartDate);
  const summaryEnd = parseISO(summaryEndDate);
  const summaryMonths = Math.max(1, Math.round(differenceInDays(summaryEnd, summaryStart) / 30));

  const summaryRows = useMemo(() => {
    if (!plates) return [];
    return plates.map((p) => {
      const pLoans = loans.filter((l) => l.plate_id === p.id && l.is_active);
      const pExpenses = expenses.filter((e) => {
        if (e.plate_id !== p.id) return false;
        const d = parseISO(e.expense_date);
        return d >= summaryStart && d <= summaryEnd;
      });
      const pReservations = reservations.filter((r) => {
        if (r.assigned_plate_id !== p.id) return false;
        const pickup = parseISO(r.pickup_date);
        return pickup >= summaryStart && pickup <= summaryEnd;
      });
      const loanMonthly = pLoans.reduce((s, l) => s + l.monthly_payment, 0);
      const totalExp = pExpenses.reduce((s, e) => s + e.amount, 0);
      const totalRev = pReservations.reduce((s, r) => s + r.total_price, 0);
      return {
        id: p.id,
        plate: p.plate_number,
        brand: `${p.brand} ${p.model}`,
        loanMonthly,
        expenses: totalExp,
        revenue: totalRev,
        net: totalRev - totalExp - loanMonthly * summaryMonths,
      };
    });
  }, [plates, loans, expenses, reservations, summaryStart, summaryEnd, summaryMonths]);

  const summaryTotals = useMemo(() => ({
    loanMonthly: summaryRows.reduce((s, r) => s + r.loanMonthly, 0),
    expenses: summaryRows.reduce((s, r) => s + r.expenses, 0),
    revenue: summaryRows.reduce((s, r) => s + r.revenue, 0),
    net: summaryRows.reduce((s, r) => s + r.net, 0),
  }), [summaryRows]);

  // All reservations in summary period (for agency report download)
  const allReservationsInPeriod = useMemo(() => {
    return reservations
      .filter((r) => {
        const pickup = parseISO(r.pickup_date);
        return pickup >= summaryStart && pickup <= summaryEnd;
      })
      .map((r) => {
        const plate = plates?.find((p) => p.id === r.assigned_plate_id);
        const days = Math.max(1, differenceInDays(parseISO(r.return_date), parseISO(r.pickup_date)));
        return {
          id: r.id.slice(0, 8).toUpperCase(),
          plate: plate ? plate.plate_number : "—",
          startDate: r.pickup_date,
          endDate: r.return_date,
          days,
          amount: r.total_price,
        };
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [reservations, plates, summaryStart, summaryEnd]);

  // ---- Download Agency Report ----
  const handleDownloadAgencyReport = () => {
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    const w = window.open("", "_blank", "width=900,height=800");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Rapport Agence</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; color: #1A1A1A; padding: 30px; max-width: 850px; margin: auto; font-size: 13px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; font-weight: 700; }
        .header .sub { font-size: 12px; color: #666; margin-top: 4px; }
        .accent-line { height: 3px; background: linear-gradient(90deg, #00C853, #00C853 40%, #e0e0e0 40%); border-radius: 2px; margin: 16px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; padding: 6px 8px; border-bottom: 2px solid #eee; }
        td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
        td.right, th.right { text-align: right; }
        .section-title { font-size: 13px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; color: #00C853; text-transform: uppercase; letter-spacing: 1px; }
        .totals td { font-weight: 700; border-top: 2px solid #333; }
        .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #999; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      <div class="header">
        <h1>Centre Lux Car — Rapport Agence</h1>
        <p class="sub">Période : ${fmtDate(summaryStartDate)} — ${fmtDate(summaryEndDate)}</p>
      </div>
      <div class="accent-line"></div>

      <div class="section-title">Résumé par véhicule</div>
      <table>
        <thead><tr><th>Immat.</th><th>Véhicule</th><th class="right">Crédit/mois</th><th class="right">Dépenses</th><th class="right">Revenus</th><th class="right">Bénéfice net</th></tr></thead>
        <tbody>
          ${summaryRows.map((r) => `<tr><td>${r.plate}</td><td>${r.brand}</td><td class="right">${Number(r.loanMonthly).toLocaleString("fr-FR")} MAD</td><td class="right">${Number(r.expenses).toLocaleString("fr-FR")} MAD</td><td class="right">${Number(r.revenue).toLocaleString("fr-FR")} MAD</td><td class="right" style="color:${r.net >= 0 ? '#16a34a' : '#dc2626'};font-weight:600">${Number(r.net).toLocaleString("fr-FR")} MAD</td></tr>`).join("")}
          <tr class="totals"><td colspan="2">Total</td><td class="right">${Number(summaryTotals.loanMonthly).toLocaleString("fr-FR")} MAD</td><td class="right">${Number(summaryTotals.expenses).toLocaleString("fr-FR")} MAD</td><td class="right">${Number(summaryTotals.revenue).toLocaleString("fr-FR")} MAD</td><td class="right" style="color:${summaryTotals.net >= 0 ? '#16a34a' : '#dc2626'};font-weight:700">${Number(summaryTotals.net).toLocaleString("fr-FR")} MAD</td></tr>
        </tbody>
      </table>

      <div class="section-title">Toutes les réservations (${allReservationsInPeriod.length})</div>
      <table>
        <thead><tr><th>ID</th><th>Immat.</th><th>Du</th><th>Au</th><th class="right">Jours</th><th class="right">Montant</th></tr></thead>
        <tbody>
          ${allReservationsInPeriod.length > 0 ? allReservationsInPeriod.map((r) => `<tr><td style="font-family:monospace;font-weight:600">${r.id}</td><td>${r.plate}</td><td>${r.startDate}</td><td>${r.endDate}</td><td class="right">${r.days}</td><td class="right">${Number(r.amount).toLocaleString("fr-FR")} MAD</td></tr>`).join("") : `<tr><td colspan="6" style="text-align:center;color:#999;padding:16px">Aucune réservation</td></tr>`}
          ${allReservationsInPeriod.length > 0 ? `<tr class="totals"><td colspan="4">Total</td><td class="right">${allReservationsInPeriod.reduce((s, r) => s + r.days, 0)}</td><td class="right">${allReservationsInPeriod.reduce((s, r) => s + r.amount, 0).toLocaleString("fr-FR")} MAD</td></tr>` : ""}
        </tbody>
      </table>

      <div class="accent-line"></div>
      <div class="footer">
        <p>Centre Lux Car • centreluxcar.com</p>
        <p>Rapport généré le ${fmtDate(format(new Date(), "yyyy-MM-dd"))}</p>
      </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Finances</h1>

        {/* Section 1 — Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Crédit mensuel</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-bold">{fmt(totalMonthlyLoan)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Solde crédits</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-bold">{fmt(totalLoanBalance)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dépenses (mois)</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-bold">{fmt(totalMonthlyExpenses)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenus (mois)</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-bold text-green-600">{fmt(totalMonthlyRevenue)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Bénéfice net</CardTitle></CardHeader>
            <CardContent>
              <p className={`text-xl font-bold flex items-center gap-1 ${netProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                {netProfit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {fmt(netProfit)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="loans" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="loans"><Banknote className="mr-1 h-4 w-4" />Crédits</TabsTrigger>
            <TabsTrigger value="report">Rapport par véhicule</TabsTrigger>
            <TabsTrigger value="summary">Résumé agence</TabsTrigger>
            <TabsTrigger value="simulator"><Calculator className="mr-1 h-4 w-4" />Simulateur</TabsTrigger>
          </TabsList>

          {/* Section 2 — Loan Management */}
          <TabsContent value="loans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Gestion des crédits</h2>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-1 h-4 w-4" />Ajouter un crédit</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Nouveau crédit</DialogTitle></DialogHeader>
                  <div className="grid gap-3">
                    <div>
                      <Label>Véhicule</Label>
                      <Select value={form.plate_id} onValueChange={(v) => setForm({ ...form, plate_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>{plates?.map((p) => <SelectItem key={p.id} value={p.id}>{p.plate_number} — {p.brand} {p.model}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Banque</Label>
                      <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Montant total</Label><Input type="number" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} /></div>
                      <div><Label>Mensualité</Label><Input type="number" value={form.monthly_payment} onChange={(e) => setForm({ ...form, monthly_payment: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Durée (mois)</Label><Input type="number" value={form.loan_duration_months} onChange={(e) => setForm({ ...form, loan_duration_months: e.target.value })} /></div>
                      <div><Label>Taux (%)</Label><Input type="number" step="0.01" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Date début</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                      <div><Label>Restant</Label><Input type="number" value={form.remaining_amount} onChange={(e) => setForm({ ...form, remaining_amount: e.target.value })} placeholder={form.loan_amount || "Auto"} /></div>
                    </div>
                    <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    <Button onClick={handleAdd} disabled={addLoan.isPending}>Ajouter</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Mensualité</TableHead>
                    <TableHead className="text-right">Restant</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead className="text-right">Durée</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const plate = plates?.find((p) => p.id === loan.plate_id);
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{plate ? `${plate.plate_number}` : "—"}</TableCell>
                        <TableCell>{loan.bank_name}</TableCell>
                        <TableCell className="text-right">{fmt(loan.loan_amount)}</TableCell>
                        <TableCell className="text-right">{fmt(loan.monthly_payment)}</TableCell>
                        <TableCell className="text-right">{fmt(loan.remaining_amount)}</TableCell>
                        <TableCell>{loan.start_date}</TableCell>
                        <TableCell className="text-right">{loan.loan_duration_months} mois</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { deleteLoan.mutate(loan.id); toast.success("Crédit supprimé"); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {loans.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucun crédit enregistré</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Section 3 — Per-Car Report */}
          <TabsContent value="report" className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Label className="shrink-0">Véhicule :</Label>
                <Select value={selectedPlateId} onValueChange={setSelectedPlateId}>
                  <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Sélectionner un véhicule" /></SelectTrigger>
                  <SelectContent>{plates?.map((p) => <SelectItem key={p.id} value={p.id}>{p.plate_number} — {p.brand} {p.model}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Label className="shrink-0">Période :</Label>
                <DatePickerField value={reportStartDate} onChange={setReportStartDate} placeholder="Date début" className="w-full sm:w-44" />
                <span className="text-muted-foreground hidden sm:block">→</span>
                <DatePickerField value={reportEndDate} onChange={setReportEndDate} placeholder="Date fin" className="w-full sm:w-44" />
                {selectedPlateId && (
                  <Button size="sm" variant="outline" onClick={handleDownloadReport} className="gap-1">
                    <Download className="h-4 w-4" /> Télécharger le rapport
                  </Button>
                )}
              </div>
            </div>

            {selectedPlateId && (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Crédit mensuel</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-bold">{fmt(plateTotalLoanMonthly)}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total dépenses</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-bold">{fmt(plateTotalExpenses)}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total revenus</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-bold text-green-600">{fmt(plateTotalRevenue)}</p></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Bénéfice net</CardTitle></CardHeader>
                    <CardContent>
                      <p className={`text-lg font-bold ${plateTotalRevenue - plateTotalExpenses - plateTotalLoanMonthly * 12 >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {fmt(plateTotalRevenue - plateTotalExpenses - plateTotalLoanMonthly * 12)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Monthly Earnings Bar */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Revenus mensuels</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={{ revenue: { label: "Revenus", color: "hsl(var(--primary))" } }} className="h-[250px]">
                        <BarChart data={monthlyEarnings}>
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Utilization Donut */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Utilisation (période)</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={{ rented: { label: "Loués", color: "hsl(var(--primary))" }, idle: { label: "Libres", color: "hsl(var(--muted))" } }} className="h-[250px]">
                        <PieChart>
                          <Pie data={utilization} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                            {utilization.map((_, i) => (
                              <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />{utilization[0].value} jours loués</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted inline-block" />{utilization[1].value} jours libres</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expense Pie */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Dépenses par catégorie</CardTitle></CardHeader>
                    <CardContent>
                      {expensePie.length > 0 ? (
                        <ChartContainer config={Object.fromEntries(expensePie.map((e, i) => [e.name, { label: e.name, color: CHART_COLORS[i % CHART_COLORS.length] }]))} className="h-[250px]">
                          <PieChart>
                            <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                              {expensePie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-muted-foreground text-sm text-center py-12">Aucune dépense</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cumulative Progress Line */}
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Progression financière</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={{ revenue: { label: "Revenus cumulés", color: "hsl(142, 71%, 45%)" }, costs: { label: "Coûts cumulés", color: "hsl(0, 84%, 60%)" } }} className="h-[250px]">
                        <LineChart data={progressData}>
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="costs" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Reservation Breakdown Table */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">Détail des réservations ({reservationBreakdown.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date début</TableHead>
                            <TableHead>Date fin</TableHead>
                            <TableHead className="text-right">Jours</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reservationBreakdown.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono font-semibold">{r.id}</TableCell>
                              <TableCell>{r.startDate}</TableCell>
                              <TableCell>{r.endDate}</TableCell>
                              <TableCell className="text-right">{r.days}</TableCell>
                              <TableCell className="text-right">{Number(r.amount).toLocaleString("fr-FR")} MAD</TableCell>
                            </TableRow>
                          ))}
                          {reservationBreakdown.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucune réservation dans cette période</TableCell></TableRow>
                          )}
                          {reservationBreakdown.length > 0 && (
                            <TableRow className="border-t-2 font-bold">
                              <TableCell colSpan={3}>Total</TableCell>
                              <TableCell className="text-right">{reservationBreakdown.reduce((s, r) => s + r.days, 0)}</TableCell>
                              <TableCell className="text-right">{reservationBreakdown.reduce((s, r) => s + r.amount, 0).toLocaleString("fr-FR")} MAD</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {!selectedPlateId && (
              <p className="text-muted-foreground text-center py-12">Sélectionnez un véhicule pour voir son rapport financier</p>
            )}
          </TabsContent>

          {/* Section 4 — Summary Table */}
          <TabsContent value="summary" className="space-y-4">
            <h2 className="text-lg font-semibold">Résumé par véhicule</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Immatriculation</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead className="text-right">Crédit/mois</TableHead>
                    <TableHead className="text-right">Dépenses total</TableHead>
                    <TableHead className="text-right">Revenus total</TableHead>
                    <TableHead className="text-right">Bénéfice net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.plate}</TableCell>
                      <TableCell>{row.brand}</TableCell>
                      <TableCell className="text-right">{fmt(row.loanMonthly)}</TableCell>
                      <TableCell className="text-right">{fmt(row.expenses)}</TableCell>
                      <TableCell className="text-right">{fmt(row.revenue)}</TableCell>
                      <TableCell className={`text-right font-semibold ${row.net >= 0 ? "text-green-600" : "text-red-500"}`}>{fmt(row.net)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{fmt(summaryTotals.loanMonthly)}</TableCell>
                    <TableCell className="text-right">{fmt(summaryTotals.expenses)}</TableCell>
                    <TableCell className="text-right">{fmt(summaryTotals.revenue)}</TableCell>
                    <TableCell className={`text-right ${summaryTotals.net >= 0 ? "text-green-600" : "text-red-500"}`}>{fmt(summaryTotals.net)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Simulator */}
          <TabsContent value="simulator" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Simulateur de crédit</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Simulez l'impact d'un nouveau crédit sur vos mensualités totales.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><Label>Montant du crédit</Label><Input type="number" placeholder="Ex: 150000" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} /></div>
                  <div><Label>Durée (mois)</Label><Input type="number" placeholder="Ex: 60" value={simMonths} onChange={(e) => setSimMonths(e.target.value)} /></div>
                  <div><Label>Taux annuel (%)</Label><Input type="number" step="0.01" placeholder="Ex: 5.5" value={simRate} onChange={(e) => setSimRate(e.target.value)} /></div>
                </div>
                {simAmount && simMonths && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Mensualité estimée</p>
                        <p className="text-xl font-bold">{fmt(simMonthly)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Total actuel + nouveau</p>
                        <p className="text-xl font-bold">{fmt(totalMonthlyLoan + simMonthly)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Nouveau bénéfice net</p>
                        <p className={`text-xl font-bold ${netProfit - simMonthly >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {fmt(netProfit - simMonthly)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminFinances;
