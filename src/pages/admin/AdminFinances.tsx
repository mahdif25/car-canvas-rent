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
import { useFleetLoans, useAddLoan, useDeleteLoan, type FleetLoan } from "@/hooks/useFleetLoans";
import { useFleetPlates } from "@/hooks/useFleetPlates";
import { useFleetExpenses, categoryLabel, EXPENSE_CATEGORIES } from "@/hooks/useFleetExpenses";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, TrendingUp, TrendingDown, Banknote, Calculator } from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from "date-fns";
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

  // ---- Per-Car Report ----
  const selectedPlate = plates?.find((p) => p.id === selectedPlateId);
  const plateLoans = loans.filter((l) => l.plate_id === selectedPlateId);
  const plateExpenses = expenses.filter((e) => e.plate_id === selectedPlateId);
  const plateReservations = reservations.filter((r) => r.assigned_plate_id === selectedPlateId);
  const plateTotalRevenue = plateReservations.reduce((s, r) => s + r.total_price, 0);
  const plateTotalExpenses = plateExpenses.reduce((s, e) => s + e.amount, 0);
  const plateTotalLoanMonthly = plateLoans.filter((l) => l.is_active).reduce((s, l) => s + l.monthly_payment, 0);

  // Monthly earnings bar chart (last 12 months)
  const monthlyEarnings = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const m = subMonths(now, i);
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const rev = plateReservations
        .filter((r) => { const d = parseISO(r.pickup_date); return d >= mStart && d <= mEnd; })
        .reduce((s, r) => s + r.total_price, 0);
      months.push({ month: format(m, "MMM yy", { locale: fr }), revenue: rev });
    }
    return months;
  }, [plateReservations, now]);

  // Rental utilization donut (current month)
  const utilization = useMemo(() => {
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const rentedDays = plateReservations
      .filter((r) => {
        const p = parseISO(r.pickup_date);
        const ret = parseISO(r.return_date);
        return p <= monthEnd && ret >= monthStart;
      })
      .reduce((s, r) => {
        const start = parseISO(r.pickup_date) < monthStart ? monthStart : parseISO(r.pickup_date);
        const end = parseISO(r.return_date) > monthEnd ? monthEnd : parseISO(r.return_date);
        return s + differenceInDays(end, start) + 1;
      }, 0);
    const idle = Math.max(0, daysInMonth - rentedDays);
    return [
      { name: "Jours loués", value: Math.min(rentedDays, daysInMonth) },
      { name: "Jours libres", value: idle },
    ];
  }, [plateReservations, monthStart, monthEnd]);

  // Expense category pie
  const expensePie = useMemo(() => {
    const map: Record<string, number> = {};
    plateExpenses.forEach((e) => {
      const label = categoryLabel(e.category);
      map[label] = (map[label] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [plateExpenses]);

  // Cumulative progress line chart
  const progressData = useMemo(() => {
    const months = [];
    let cumRev = 0;
    let cumCost = 0;
    for (let i = 11; i >= 0; i--) {
      const m = subMonths(now, i);
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
      months.push({ month: format(m, "MMM yy", { locale: fr }), revenue: cumRev, costs: cumCost });
    }
    return months;
  }, [plateReservations, plateExpenses, plateTotalLoanMonthly, now]);

  // ---- Summary Table ----
  const summaryRows = useMemo(() => {
    if (!plates) return [];
    return plates.map((p) => {
      const pLoans = loans.filter((l) => l.plate_id === p.id && l.is_active);
      const pExpenses = expenses.filter((e) => e.plate_id === p.id);
      const pReservations = reservations.filter((r) => r.assigned_plate_id === p.id);
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
        net: totalRev - totalExp - loanMonthly * 12,
      };
    });
  }, [plates, loans, expenses, reservations]);

  const summaryTotals = useMemo(() => ({
    loanMonthly: summaryRows.reduce((s, r) => s + r.loanMonthly, 0),
    expenses: summaryRows.reduce((s, r) => s + r.expenses, 0),
    revenue: summaryRows.reduce((s, r) => s + r.revenue, 0),
    net: summaryRows.reduce((s, r) => s + r.net, 0),
  }), [summaryRows]);

  const fmt = (n: number) => n.toLocaleString("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 });

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
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Label>Véhicule :</Label>
              <Select value={selectedPlateId} onValueChange={setSelectedPlateId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Sélectionner un véhicule" /></SelectTrigger>
                <SelectContent>{plates?.map((p) => <SelectItem key={p.id} value={p.id}>{p.plate_number} — {p.brand} {p.model}</SelectItem>)}</SelectContent>
              </Select>
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
                    <CardHeader><CardTitle className="text-sm">Revenus mensuels (12 mois)</CardTitle></CardHeader>
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
                    <CardHeader><CardTitle className="text-sm">Utilisation (mois en cours)</CardTitle></CardHeader>
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
