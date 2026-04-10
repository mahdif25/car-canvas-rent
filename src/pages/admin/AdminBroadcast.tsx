import { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ArrowRight, Send, Users, Mail, Gift } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lead {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  reservation_completed: boolean | null;
  last_reservation_step: number | null;
  created_at: string | null;
}

interface Coupon {
  id: string;
  code: string;
  discount_amount: number;
  is_active: boolean;
}

type CouponMode = "none" | "shared" | "unique" | "referral";

const AdminBroadcast = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  // Step 1: Audience
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stepFilter, setStepFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Step 2: Content
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [couponMode, setCouponMode] = useState<CouponMode>("none");
  const [sourceCouponId, setSourceCouponId] = useState("");
  const [couponPrefix, setCouponPrefix] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [friendDiscountAmount, setFriendDiscountAmount] = useState("");
  const [couponExpiresAt, setCouponExpiresAt] = useState("");

  const [sending, setSending] = useState(false);

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["broadcast-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .not("email", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["broadcast-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_amount, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!lead.email) return false;

      // Status filter
      if (statusFilter === "client" && !lead.reservation_completed) return false;
      if (statusFilter === "abandoned" && (lead.reservation_completed || (lead.last_reservation_step || 0) < 1)) return false;
      if (statusFilter === "lead" && (lead.reservation_completed || (lead.last_reservation_step || 0) >= 1)) return false;

      // Step filter
      if (stepFilter !== "all" && (lead.last_reservation_step || 0) < Number(stepFilter)) return false;

      // Date filter
      if (dateFrom && lead.created_at && lead.created_at < dateFrom) return false;
      if (dateTo && lead.created_at && lead.created_at > dateTo + "T23:59:59") return false;

      // Search
      if (search) {
        const s = search.toLowerCase();
        const name = `${lead.first_name || ""} ${lead.last_name || ""}`.toLowerCase();
        if (!name.includes(s) && !lead.email.toLowerCase().includes(s)) return false;
      }

      return true;
    });
  }, [leads, statusFilter, stepFilter, dateFrom, dateTo, search]);

  const toggleAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedLeads = filteredLeads.filter((l) => selectedIds.has(l.id));

  const getStatusLabel = (lead: Lead) => {
    if (lead.reservation_completed) return "Client";
    if ((lead.last_reservation_step || 0) >= 1) return "Abandonné";
    return "Lead";
  };

  const getStatusVariant = (lead: Lead): "default" | "secondary" | "outline" => {
    if (lead.reservation_completed) return "default";
    if ((lead.last_reservation_step || 0) >= 1) return "secondary";
    return "outline";
  };

  const canSend = subject.trim() && selectedLeads.length > 0 && (
    couponMode === "none" ||
    (couponMode === "shared" && sourceCouponId) ||
    (couponMode === "unique" && couponPrefix && discountAmount) ||
    (couponMode === "referral" && couponPrefix && discountAmount && friendDiscountAmount)
  );

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      // 1. Create broadcast record
      const broadcastData: Record<string, any> = {
        subject,
        body_html: bodyHtml,
        coupon_mode: couponMode,
        discount_amount: Number(discountAmount) || 0,
        friend_discount_amount: Number(friendDiscountAmount) || 0,
        coupon_prefix: couponPrefix || null,
        coupon_expires_at: couponExpiresAt || null,
        source_coupon_id: couponMode === "shared" ? sourceCouponId : null,
        filters_json: { statusFilter, stepFilter, dateFrom, dateTo, search },
        recipient_count: selectedLeads.length,
        status: "draft",
      };

      const { data: broadcast, error: bErr } = await supabase
        .from("email_broadcasts")
        .insert(broadcastData)
        .select("id")
        .single();

      if (bErr || !broadcast) throw new Error(bErr?.message || "Failed to create broadcast");

      // 2. Create recipients
      const recipientRows = selectedLeads.map((lead) => ({
        broadcast_id: broadcast.id,
        email: lead.email!,
        name: [lead.first_name, lead.last_name].filter(Boolean).join(" ") || null,
        status: "pending",
      }));

      const { error: rErr } = await supabase.from("broadcast_recipients").insert(recipientRows);
      if (rErr) throw new Error(rErr.message);

      // 3. Invoke send-broadcast edge function
      const { error: sendErr } = await supabase.functions.invoke("send-broadcast", {
        body: { broadcast_id: broadcast.id },
      });

      if (sendErr) throw new Error(sendErr.message);

      toast.success(`Broadcast envoyé à ${selectedLeads.length} destinataires`);
      setStep(1);
      setSelectedIds(new Set());
      setSubject("");
      setBodyHtml("");
      setCouponMode("none");
      setSourceCouponId("");
      setCouponPrefix("");
      setDiscountAmount("");
      setFriendDiscountAmount("");
      setCouponExpiresAt("");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Broadcast Email</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={step === 1 ? "text-primary font-semibold" : ""}>1. Audience</span>
            <span>→</span>
            <span className={step === 2 ? "text-primary font-semibold" : ""}>2. Contenu</span>
            <span>→</span>
            <span className={step === 3 ? "text-primary font-semibold" : ""}>3. Envoi</span>
          </div>
        </div>

        {/* Step 1: Audience */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="abandoned">Abandonné</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Étape min." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les étapes</SelectItem>
                  <SelectItem value="1">Étape 1+</SelectItem>
                  <SelectItem value="2">Étape 2+</SelectItem>
                  <SelectItem value="3">Étape 3+</SelectItem>
                  <SelectItem value="4">Étape 4+</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" placeholder="Du" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" placeholder="Au" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher nom ou email..." className="w-[220px]" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filteredLeads.length > 0 && selectedIds.size === filteredLeads.length}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""} sur {filteredLeads.length}
                </span>
              </div>
              <Button onClick={() => setStep(2)} disabled={selectedIds.size === 0} className="gap-2">
                Suivant <ArrowRight size={16} />
              </Button>
            </div>

            <div className="bg-background rounded-lg border max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Étape</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Chargement...</TableCell></TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucun lead trouvé</TableCell></TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="cursor-pointer" onClick={() => toggleOne(lead.id)}>
                        <TableCell>
                          <Checkbox checked={selectedIds.has(lead.id)} onCheckedChange={() => toggleOne(lead.id)} onClick={(e) => e.stopPropagation()} />
                        </TableCell>
                        <TableCell>{[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"}</TableCell>
                        <TableCell className="text-sm">{lead.email}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(lead)}>{getStatusLabel(lead)}</Badge></TableCell>
                        <TableCell>{lead.last_reservation_step || 0}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {lead.created_at ? format(new Date(lead.created_at), "dd/MM/yyyy") : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4 max-w-2xl">
              <div className="space-y-1">
                <label className="text-sm font-medium">Objet de l'email *</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Offre spéciale rentrée 🚗" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Contenu du message</label>
                <Textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} placeholder="Rédigez votre message promotionnel..." rows={5} />
              </div>

              <div className="space-y-3 border rounded-lg p-4 bg-card">
                <label className="text-sm font-semibold flex items-center gap-2"><Gift size={16} /> Mode coupon</label>
                <Select value={couponMode} onValueChange={(v) => setCouponMode(v as CouponMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun coupon</SelectItem>
                    <SelectItem value="shared">Coupon partagé (existant)</SelectItem>
                    <SelectItem value="unique">Coupon unique par destinataire</SelectItem>
                    <SelectItem value="referral">Parrainage (client + ami)</SelectItem>
                  </SelectContent>
                </Select>

                {couponMode === "shared" && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Sélectionner un coupon</label>
                    <Select value={sourceCouponId} onValueChange={setSourceCouponId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un coupon actif" />
                      </SelectTrigger>
                      <SelectContent>
                        {coupons.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.code} — {Number(c.discount_amount).toLocaleString()} MAD
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(couponMode === "unique" || couponMode === "referral") && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Préfixe du code *</label>
                        <Input value={couponPrefix} onChange={(e) => setCouponPrefix(e.target.value.toUpperCase())} placeholder="Ex: PROMO" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Réduction (MAD) *</label>
                        <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="100" />
                      </div>
                    </div>
                    {couponMode === "referral" && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Réduction ami (MAD) *</label>
                        <Input type="number" value={friendDiscountAmount} onChange={(e) => setFriendDiscountAmount(e.target.value)} placeholder="100" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Date d'expiration (optionnel)</label>
                      <Input type="datetime-local" value={couponExpiresAt} onChange={(e) => setCouponExpiresAt(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {couponMode === "unique"
                        ? `Chaque destinataire recevra un code unique: ${couponPrefix || "PROMO"}-{NOM}`
                        : `Deux codes par destinataire: ${couponPrefix || "REF"}-{NOM} + AMI-${couponPrefix || "REF"}-{NOM}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft size={16} /> Retour
              </Button>
              <Button onClick={() => setStep(3)} disabled={!subject.trim()} className="gap-2">
                Aperçu <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Send */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl">
            <div className="border rounded-lg p-6 bg-card space-y-4">
              <h2 className="text-lg font-semibold">Récapitulatif</h2>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-muted-foreground">Destinataires</span>
                <span className="font-medium flex items-center gap-2"><Users size={14} /> {selectedLeads.length}</span>
                <span className="text-muted-foreground">Objet</span>
                <span className="font-medium">{subject}</span>
                <span className="text-muted-foreground">Mode coupon</span>
                <span className="font-medium capitalize">{couponMode === "none" ? "Aucun" : couponMode}</span>
                {couponMode === "shared" && (
                  <>
                    <span className="text-muted-foreground">Coupon</span>
                    <span className="font-mono font-medium">{coupons.find(c => c.id === sourceCouponId)?.code}</span>
                  </>
                )}
                {(couponMode === "unique" || couponMode === "referral") && (
                  <>
                    <span className="text-muted-foreground">Préfixe</span>
                    <span className="font-mono font-medium">{couponPrefix}</span>
                    <span className="text-muted-foreground">Réduction</span>
                    <span className="font-medium">{Number(discountAmount).toLocaleString()} MAD</span>
                    {couponExpiresAt && (
                      <>
                        <span className="text-muted-foreground">Expire le</span>
                        <span className="font-medium">{format(new Date(couponExpiresAt), "dd/MM/yyyy HH:mm")}</span>
                      </>
                    )}
                  </>
                )}
                {couponMode === "referral" && (
                  <>
                    <span className="text-muted-foreground">Réduction ami</span>
                    <span className="font-medium">{Number(friendDiscountAmount).toLocaleString()} MAD</span>
                  </>
                )}
              </div>

              {bodyHtml && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <p className="text-sm whitespace-pre-wrap">{bodyHtml}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft size={16} /> Retour
              </Button>
              <Button
                onClick={handleSend}
                disabled={!canSend || sending}
                className="gap-2"
              >
                <Send size={16} /> {sending ? "Envoi en cours..." : `Envoyer à ${selectedLeads.length} destinataire${selectedLeads.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBroadcast;
