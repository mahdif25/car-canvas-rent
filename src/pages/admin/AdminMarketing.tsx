import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount_amount: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CouponUsage {
  id: string;
  coupon_id: string;
  reservation_id: string;
  customer_email: string;
  discount_applied: number;
  created_at: string;
}

const AdminMarketing = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_amount: "", max_uses: "", expires_at: "" });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const { data: usages = [] } = useQuery({
    queryKey: ["coupon_usages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupon_usages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as CouponUsage[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("coupons").insert({
        code: newCoupon.code.toUpperCase().trim(),
        discount_amount: Number(newCoupon.discount_amount),
        max_uses: newCoupon.max_uses ? Number(newCoupon.max_uses) : null,
        expires_at: newCoupon.expires_at || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setDialogOpen(false);
      setNewCoupon({ code: "", discount_amount: "", max_uses: "", expires_at: "" });
      toast.success("Coupon créé avec succès");
    },
    onError: (err: any) => {
      toast.error(err.message?.includes("duplicate") ? "Ce code existe déjà" : "Erreur lors de la création");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const isExpired = (c: Coupon) => c.expires_at && new Date(c.expires_at) < new Date();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Marketing — Coupons</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Nouveau coupon</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un coupon</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Code promo *</label>
                  <Input value={newCoupon.code} onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value }))} placeholder="EX: SUMMER50" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Réduction (MAD) *</label>
                  <Input type="number" value={newCoupon.discount_amount} onChange={(e) => setNewCoupon((p) => ({ ...p, discount_amount: e.target.value }))} placeholder="100" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nombre max d'utilisations</label>
                  <Input type="number" value={newCoupon.max_uses} onChange={(e) => setNewCoupon((p) => ({ ...p, max_uses: e.target.value }))} placeholder="Illimité si vide" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Date d'expiration</label>
                  <Input type="datetime-local" value={newCoupon.expires_at} onChange={(e) => setNewCoupon((p) => ({ ...p, expires_at: e.target.value }))} />
                </div>
                <Button onClick={() => createMutation.mutate()} disabled={!newCoupon.code || !newCoupon.discount_amount || createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Création..." : "Créer le coupon"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : coupons.length === 0 ? (
          <p className="text-muted-foreground">Aucun coupon créé.</p>
        ) : (
          <div className="bg-background rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Réduction</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => {
                  const couponUsages = usages.filter((u) => u.coupon_id === coupon.id);
                  const expanded = expandedCoupon === coupon.id;
                  return (
                    <Collapsible key={coupon.id} open={expanded} onOpenChange={() => setExpandedCoupon(expanded ? null : coupon.id)} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer">
                            <TableCell>{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</TableCell>
                            <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                            <TableCell>{Number(coupon.discount_amount).toLocaleString()} MAD</TableCell>
                            <TableCell>{coupon.current_uses} / {coupon.max_uses ?? "∞"}</TableCell>
                            <TableCell>
                              {isExpired(coupon) ? (
                                <Badge variant="secondary">Expiré</Badge>
                              ) : coupon.is_active ? (
                                <Badge className="bg-primary/10 text-primary border-primary/20">Actif</Badge>
                              ) : (
                                <Badge variant="outline">Inactif</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                            <TableCell>
                              <Switch
                                checked={coupon.is_active}
                                onCheckedChange={(checked) => toggleMutation.mutate({ id: coupon.id, is_active: checked })}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/30 p-0">
                              <div className="p-4">
                                <h4 className="text-sm font-semibold mb-2">Historique d'utilisation ({couponUsages.length})</h4>
                                {couponUsages.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">Aucune utilisation.</p>
                                ) : (
                                  <div className="space-y-1 text-sm">
                                    {couponUsages.map((u) => (
                                      <div key={u.id} className="flex items-center gap-4">
                                        <span className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString("fr-FR")}</span>
                                        <span>{u.customer_email}</span>
                                        <span className="font-mono text-xs text-muted-foreground">#{u.reservation_id.slice(0, 8)}</span>
                                        <span className="text-primary font-medium">-{Number(u.discount_applied).toLocaleString()} MAD</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMarketing;
