import { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  FileDown,
  Send,
  IndianRupee,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchMonthlyReport,
  fetchInvoicePdf,
  sendInvoiceWhatsApp,
  type MonthlyPaymentItem,
} from "@/lib/reports";

/* ── Helpers ───────────────────────────────────────────────── */

function monthInputValue(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonthYear(val: string) {
  const [y, m] = val.split("-").map(Number);
  const d = new Date(y, m - 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function getMethodIcon(method: string) {
  switch (method) {
    case "UPI":
      return <Smartphone className="h-3.5 w-3.5" />;
    case "CARD":
      return <CreditCard className="h-3.5 w-3.5" />;
    default:
      return <Banknote className="h-3.5 w-3.5" />;
  }
}

function getTypeBadge(type: string) {
  if (type === "MEMBERSHIP_RENEWAL") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold">
        Renewal
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100 text-[11px] font-semibold">
      Seasonal
    </Badge>
  );
}

/* ── Component ─────────────────────────────────────────────── */

const MonthlySummary = () => {
  const [monthValue, setMonthValue] = useState(monthInputValue());
  const [items, setItems] = useState<MonthlyPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const { year, month } = useMemo(() => {
    const [y, m] = monthValue.split("-").map(Number);
    return { year: y, month: m };
  }, [monthValue]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchMonthlyReport(year, month);
        if (!cancelled) setItems(data);
      } catch (err: any) {
        console.error("Monthly report load failed", err);
        toast({
          variant: "destructive",
          title: "Failed to load monthly summary",
          description:
            err?.response?.data?.message || err?.message || "Please try again.",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  /* ── Derived stats ─── */
  const totalAmount = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.amount || 0), 0),
    [items]
  );

  const renewalCount = useMemo(
    () => items.filter((i) => i.type === "MEMBERSHIP_RENEWAL").length,
    [items]
  );

  const methodBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((it) => {
      map[it.method] = (map[it.method] || 0) + Number(it.amount || 0);
    });
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (it) =>
          it.studentName.toLowerCase().includes(q) ||
          it.regNo.toLowerCase().includes(q) ||
          (it.seatNo && it.seatNo.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      const diff = Number(a.amount) - Number(b.amount);
      return sortAsc ? diff : -diff;
    });
  }, [items, searchTerm, sortAsc]);

  /* ── Actions ─── */
  const handleSend = async (paymentId: string) => {
    try {
      setSendingId(paymentId);
      await sendInvoiceWhatsApp(paymentId);
      toast({
        title: "Sent on WhatsApp",
        description: "Invoice sent successfully.",
      });
    } catch (err: any) {
      console.error("Send WhatsApp failed", err);
      toast({
        variant: "destructive",
        title: "WhatsApp send failed",
        description:
          err?.response?.data?.message || err?.message || "Please try again.",
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleInvoice = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId);
      const blob = await fetchInvoicePdf(paymentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err: any) {
      console.error("Invoice download failed", err);
      toast({
        variant: "destructive",
        title: "Invoice not available",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to download invoice. Please try again.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  /* ── Render ─── */
  return (
    <div className="space-y-8 pb-8">
      {/* ── Header ────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/30 p-6 md:p-8">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                Reports
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
              Monthly Summary
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground md:text-[15px]">
              Track fee collections, generate invoices, and send receipts — all
              in one place.
            </p>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Viewing
              </span>
              <div className="relative">
                <input
                  id="month-picker"
                  type="month"
                  className="h-11 min-w-[180px] rounded-xl border border-border/80 bg-card px-4 text-sm font-medium shadow-sm transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={monthValue}
                  onChange={(e) => setMonthValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stats Cards Row ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Revenue
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    {inr(totalAmount)}
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatMonthYear(monthValue)}
            </p>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Payments
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    {items.length}
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Transactions this month
            </p>
          </CardContent>
        </Card>

        {/* Renewals */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Renewals
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    {renewalCount}
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Membership renewals
            </p>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Students
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    {new Set(items.map((i) => i.studentId)).size}
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-transform group-hover:scale-110">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Unique students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content Grid ─────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-4">
        {/* Payments Table — takes 3/4 */}
        <div className="xl:col-span-3 space-y-0">
          <Card className="border-border/40 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-card/50 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base font-semibold">
                    Payment Records
                  </CardTitle>
                  {!loading && (
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-medium"
                    >
                      {filteredItems.length} entries
                    </Badge>
                  )}
                </div>

                {/* Search bar */}
                <div className="relative max-w-xs w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="search-payments"
                    type="text"
                    placeholder="Search student, reg no..."
                    className="h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-0 divide-y divide-border/30 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                    <Receipt className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {searchTerm
                      ? "No matching records found"
                      : "No fee submissions this month"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {searchTerm
                      ? "Try adjusting your search"
                      : "Payments will appear here once recorded"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="pl-6 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                          Student
                        </TableHead>
                        <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                          Reg / Seat
                        </TableHead>
                        <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                          Period
                        </TableHead>
                        <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                          Type
                        </TableHead>
                        <TableHead>
                          <button
                            className="flex items-center gap-1 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setSortAsc(!sortAsc)}
                          >
                            Amount
                            {sortAsc ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="pr-6 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((it, idx) => (
                        <TableRow
                          key={it.paymentId}
                          className="group border-border/20 transition-colors hover:bg-muted/30"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Avatar placeholder */}
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                                {it.studentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {it.studentName}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {formatDate(it.paidAt)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium text-foreground">
                                {it.regNo}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Seat {it.seatNo || "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {it.periodStart && it.periodEnd ? (
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium text-foreground">
                                  {formatDate(it.periodStart)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  to {formatDate(it.periodEnd)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{getTypeBadge(it.type)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-foreground">
                                {inr(it.amount)}
                              </span>
                              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                {getMethodIcon(it.method)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg border-border/60 text-xs font-medium shadow-none hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                                onClick={() => handleInvoice(it.paymentId)}
                                disabled={downloadingId === it.paymentId}
                              >
                                <FileDown className="h-3.5 w-3.5" />
                                {downloadingId === it.paymentId
                                  ? "Loading..."
                                  : "Invoice"}
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg text-xs font-medium shadow-none transition-all"
                                disabled={
                                  !it.mobileNo || sendingId === it.paymentId
                                }
                                onClick={() => handleSend(it.paymentId)}
                              >
                                <Send className="h-3.5 w-3.5" />
                                {sendingId === it.paymentId
                                  ? "Sending..."
                                  : "WhatsApp"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>

            {/* Table footer summary */}
            {!loading && filteredItems.length > 0 && (
              <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {filteredItems.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {items.length}
                  </span>{" "}
                  payments
                </p>
                <p className="text-sm font-bold text-foreground">
                  Total: {inr(totalAmount)}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* ── Side Panel ─────────────────────────────── */}
        <div className="space-y-5">
          {/* Payment Method Breakdown */}
          <Card className="border-border/40 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-card/50 pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : Object.keys(methodBreakdown).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No data yet
                </p>
              ) : (
                Object.entries(methodBreakdown).map(([method, amt]) => {
                  const pct = totalAmount > 0 ? (amt / totalAmount) * 100 : 0;
                  return (
                    <div key={method} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                            {getMethodIcon(method)}
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {method}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {inr(amt)}
                        </span>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/40 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-card/50 pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              ) : (
                <div className="divide-y divide-border/20">
                  {items.slice(0, 6).map((it) => (
                    <div
                      key={it.paymentId}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[10px] font-bold text-primary">
                        {it.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {it.studentName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(it.paidAt)} • {it.method}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-foreground">
                          {inr(it.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
