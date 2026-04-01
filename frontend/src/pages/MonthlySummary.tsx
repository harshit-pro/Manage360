import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  ArrowRight,
  Clock,
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

function formatDateShort(iso?: string | null) {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonthYear(val: string) {
  const [y, m] = val.split("-").map(Number);
  const d = new Date(y, m - 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

function getTypeBadge(it: MonthlyPaymentItem, compact = false) {
  const isNewStudent =
    it.type === "MEMBERSHIP_RENEWAL" &&
    (it.note?.toLowerCase().includes("initial enrollment") ||
      (it.periodStart &&
        it.dateOfJoining &&
        it.periodStart === it.dateOfJoining));

  const isRenewal = it.type === "MEMBERSHIP_RENEWAL" && !isNewStudent;

  let colorClasses: string;
  let label: string;

  if (isNewStudent) {
    colorClasses =
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100";
    label = "New Student";
  } else if (isRenewal) {
    colorClasses =
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100";
    label = "Renewal";
  } else {
    colorClasses =
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-100";
    label = "Seasonal";
  }

  return (
    <Badge
      className={`${colorClasses} ${compact ? "text-[10px] px-1.5 py-0" : "text-[11px]"} font-semibold`}
    >
      {label}
    </Badge>
  );
}

function getMethodBadge(method: string) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {getMethodIcon(method)}
      {method}
    </span>
  );
}

/* ── Component ─────────────────────────────────────────────── */

const MonthlySummary = () => {
  const navigate = useNavigate();
  const [monthValue, setMonthValue] = useState(monthInputValue());
  const [items, setItems] = useState<MonthlyPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
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

  const uniqueStudents = useMemo(
    () => new Set(items.map((i) => i.studentId)).size,
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
    // Deduplicate by paymentId (safety net)
    const seen = new Set<string>();
    let result = items.filter((it) => {
      if (seen.has(it.paymentId)) return false;
      seen.add(it.paymentId);
      return true;
    });
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (it) =>
          it.studentName.toLowerCase().includes(q) ||
          it.regNo.toLowerCase().includes(q) ||
          (it.seatNo && it.seatNo.toLowerCase().includes(q))
      );
    }
    if (sortBy === "amount") {
      return [...result].sort((a, b) => {
        const diff = Number(a.amount) - Number(b.amount);
        return sortAsc ? diff : -diff;
      });
    }
    // Default: sort by date (most recent first)
    return [...result].sort((a, b) => {
      const diff = new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [items, searchTerm, sortBy, sortAsc]);

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

  const handleInvoice = (paymentId: string) => {
    navigate(`/invoices/${paymentId}`);
  };

  /* ── Render ─── */
  return (
    <div className="space-y-5 pb-6 sm:space-y-8 sm:pb-8">
      {/* ════════════════════════════════════════════════
          HEADER
         ════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/30 p-4 sm:rounded-2xl sm:p-6 md:p-8">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/8 blur-3xl sm:-right-16 sm:-top-16 sm:h-48 sm:w-48" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-accent/20 blur-2xl sm:-bottom-12 sm:-left-12 sm:h-36 sm:w-36" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 sm:h-9 sm:w-9 sm:rounded-xl">
                <BarChart2 className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary sm:text-[11px]">
                Reports
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
              Monthly Summary
            </h1>
            <p className="max-w-lg text-xs text-muted-foreground sm:text-sm md:text-[15px]">
              Track fee collections, generate invoices, and send receipts.
            </p>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                Viewing
              </span>
              <input
                id="month-picker"
                type="month"
                className="h-10 w-full min-w-[160px] rounded-lg border border-border/80 bg-card px-3 text-sm font-medium shadow-sm transition-all hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-11 sm:min-w-[180px] sm:rounded-xl sm:px-4"
                value={monthValue}
                onChange={(e) => setMonthValue(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════
          STATS CARDS
         ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-3.5 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  Revenue
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-20 sm:h-8 sm:w-28" />
                ) : (
                  <p className="truncate text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    {inr(totalAmount)}
                  </p>
                )}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110 sm:h-10 sm:w-10 sm:rounded-xl">
                <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground sm:mt-2 sm:text-xs">
              {formatMonthYear(monthValue)}
            </p>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-3.5 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  Payments
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
                ) : (
                  <p className="text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    {items.length}
                  </p>
                )}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400 sm:h-10 sm:w-10 sm:rounded-xl">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground sm:mt-2 sm:text-xs">
              Transactions
            </p>
          </CardContent>
        </Card>

        {/* Renewals */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-3.5 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  Renewals
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
                ) : (
                  <p className="text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    {renewalCount}
                  </p>
                )}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400 sm:h-10 sm:w-10 sm:rounded-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground sm:mt-2 sm:text-xs">
              Membership
            </p>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="group relative overflow-hidden border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <CardContent className="relative p-3.5 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  Students
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
                ) : (
                  <p className="text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    {uniqueStudents}
                  </p>
                )}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 transition-transform group-hover:scale-110 dark:text-violet-400 sm:h-10 sm:w-10 sm:rounded-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground sm:mt-2 sm:text-xs">
              Unique students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN CONTENT
         ════════════════════════════════════════════════ */}
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-4">
        {/* ── Payments ── (3/4 on xl) */}
        <div className="xl:col-span-3">
          <Card className="overflow-hidden border-border/40">
            {/* Card Header with search */}
            <CardHeader className="border-b border-border/40 bg-card/50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CardTitle className="text-sm font-semibold sm:text-base">
                    Payment Records
                  </CardTitle>
                  {!loading && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium sm:text-[11px]"
                    >
                      {filteredItems.length}
                    </Badge>
                  )}
                </div>

                {/* Search */}
                <div className="relative w-full sm:max-w-xs sm:w-auto">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
                  <input
                    id="search-payments"
                    type="text"
                    placeholder="Search by name, reg no..."
                    className="h-9 w-full rounded-lg border border-border/60 bg-background pl-8 pr-3 text-sm transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 sm:pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                /* ── Loading skeleton ── */
                <div className="divide-y divide-border/20 p-4 sm:p-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-3 sm:gap-4 sm:py-4"
                    >
                      <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10" />
                      <div className="flex-1 space-y-1.5 sm:space-y-2">
                        <Skeleton className="h-4 w-32 sm:w-40" />
                        <Skeleton className="h-3 w-20 sm:w-24" />
                      </div>
                      <Skeleton className="h-5 w-14 sm:h-6 sm:w-16" />
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 sm:mb-4 sm:h-16 sm:w-16">
                    <Receipt className="h-6 w-6 text-muted-foreground/50 sm:h-7 sm:w-7" />
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
                <>
                  {/* ══════════════════════════════════════
                      DESKTOP TABLE  (hidden on mobile)
                     ══════════════════════════════════════ */}
                  <div className="hidden md:block overflow-x-auto">
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
                            Type
                          </TableHead>
                          <TableHead>
                            <button
                              className="flex items-center gap-1 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                              onClick={() => {
                                if (sortBy === "amount") {
                                  setSortAsc(!sortAsc);
                                } else {
                                  setSortBy("amount");
                                  setSortAsc(false);
                                }
                              }}
                            >
                              Amount
                              {sortBy === "amount" && (sortAsc ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ))}
                            </button>
                          </TableHead>
                          <TableHead className="pr-6 text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((it) => (
                          <TableRow
                            key={it.paymentId}
                            className="group border-border/20 transition-colors hover:bg-muted/30"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                                  {getInitials(it.studentName)}
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
                            <TableCell>{getTypeBadge(it)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-foreground">
                                  {inr(it.amount)}
                                </span>
                                {getMethodBadge(it.method)}
                              </div>
                            </TableCell>
                            <TableCell className="pr-6">
                              <div className="flex justify-end gap-2 opacity-70 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 rounded-lg border-border/60 text-xs font-medium shadow-none transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
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

                  {/* ══════════════════════════════════════
                      MOBILE CARD LIST  (hidden on desktop)
                     ══════════════════════════════════════ */}
                  <div className="block md:hidden divide-y divide-border/20">
                    {/* Sort control */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/15">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {filteredItems.length} payments
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors active:bg-muted/60 ${sortBy === "date" ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"}`}
                          onClick={() => {
                            if (sortBy === "date") setSortAsc(!sortAsc);
                            else { setSortBy("date"); setSortAsc(false); }
                          }}
                        >
                          Recent {sortBy === "date" && (sortAsc ? "↑" : "↓")}
                        </button>
                        <button
                          className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors active:bg-muted/60 ${sortBy === "amount" ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"}`}
                          onClick={() => {
                            if (sortBy === "amount") setSortAsc(!sortAsc);
                            else { setSortBy("amount"); setSortAsc(false); }
                          }}
                        >
                          Amount {sortBy === "amount" && (sortAsc ? "↑" : "↓")}
                        </button>
                      </div>
                    </div>

                    {filteredItems.map((it) => (
                      <div
                        key={it.paymentId}
                        className="px-4 py-3.5 transition-colors active:bg-muted/20"
                      >
                        {/* Row 1: Avatar + Name + Amount */}
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                            {getInitials(it.studentName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {it.studentName}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] text-muted-foreground">
                                    {it.regNo}
                                  </span>
                                  <span className="text-muted-foreground/40">
                                    ·
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    Seat {it.seatNo || "—"}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-foreground">
                                  {inr(it.amount)}
                                </p>
                              </div>
                            </div>

                            {/* Row 2: Period + Type + Method badges */}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {getTypeBadge(it, true)}
                              {getMethodBadge(it.method)}
                            </div>

                            {/* Row 3: Payment date + Actions */}
                            <div className="mt-2.5 flex items-center justify-between">
                              <p className="text-[11px] text-muted-foreground">
                                Paid {formatDate(it.paidAt)}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 gap-1 rounded-md border-border/60 px-2.5 text-[11px] font-medium shadow-none"
                                  onClick={() => handleInvoice(it.paymentId)}
                                  disabled={downloadingId === it.paymentId}
                                >
                                  <FileDown className="h-3 w-3" />
                                  {downloadingId === it.paymentId
                                    ? "..."
                                    : "Invoice"}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 gap-1 rounded-md px-2.5 text-[11px] font-medium shadow-none"
                                  disabled={
                                    !it.mobileNo || sendingId === it.paymentId
                                  }
                                  onClick={() => handleSend(it.paymentId)}
                                >
                                  <Send className="h-3 w-3" />
                                  {sendingId === it.paymentId
                                    ? "..."
                                    : "WhatsApp"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>

            {/* Table / List footer */}
            {!loading && filteredItems.length > 0 && (
              <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-4 py-2.5 sm:px-6 sm:py-3">
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  <span className="font-semibold text-foreground">
                    {filteredItems.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {items.length}
                  </span>{" "}
                  payments
                </p>
                <p className="text-xs font-bold text-foreground sm:text-sm">
                  Total: {inr(totalAmount)}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* ── Side Panel ── */}
        <div className="space-y-5">
          {/* Payment Method Breakdown */}
          <Card className="overflow-hidden border-border/40">
            <CardHeader className="border-b border-border/40 bg-card/50 px-4 pb-3 pt-4 sm:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-5">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : Object.keys(methodBreakdown).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
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
                          <div>
                            <span className="text-xs font-semibold text-foreground">
                              {method}
                            </span>
                            <p className="text-[10px] text-muted-foreground">
                              {Math.round(pct)}%
                            </p>
                          </div>
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
          <Card className="overflow-hidden border-border/40">
            <CardHeader className="border-b border-border/40 bg-card/50 px-4 pb-3 pt-4 sm:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-3 p-4 sm:p-5">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No recent activity
                </p>
              ) : (
                <div className="divide-y divide-border/20">
                  {items.slice(0, 6).map((it) => (
                    <div
                      key={it.paymentId}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20 sm:px-5 sm:py-3.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-[10px] font-bold text-primary">
                        {getInitials(it.studentName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {it.studentName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(it.paidAt)} · {it.method}
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
