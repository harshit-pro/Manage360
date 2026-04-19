import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays, isPast, differenceInDays } from "date-fns";
import { listStudents, searchStudents, Student, renewMembership, membershipMonthsFromDeposit, setStudentMeta, updateStudent, isSeatAvailable } from "@/lib/students";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bell,
  Loader2,
  Search,
  Calendar,
  CreditCard,
  Zap,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Clock,
  ArrowRight,
  RefreshCw,
  Wallet,
  Smartphone,
  Hash,
  Gem,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { sendWhatsApp, waTemplates } from "@/lib/whatsapp";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type FindForm = { email: string };
type RenewForm = {
  seasonalFees: string;
  feesDeposited: string;
  months: string;
  method: "cash" | "upi" | "card";
  note?: string;
  seatNo: string;
};

export default function RenewMembership() {
  const [query, setQuery] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [methodByUser, setMethodByUser] = useState<Record<string, "cash" | "upi" | "card">>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [feeInputs, setFeeInputs] = useState<Record<string, { seasonalFees: string; feesDeposited: string; months: string }>>({});
  const [renewingIds, setRenewingIds] = useState<Set<string>>(new Set());
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [renewedStudent, setRenewedStudent] = useState<{ 
      name: string, 
      phone: string, 
      amount: string, 
      validity: string,
      isReAdmission?: boolean,
      regNo?: string,
      seatNo?: string,
      monthlyRate?: string,
      pending?: string,
      period?: string,
      joiningDate?: string
  } | null>(null);

  const { toast } = useToast();
  const find = useForm<FindForm>();
  const renewForm = useForm<RenewForm>({ defaultValues: { seasonalFees: "", feesDeposited: "", months: "1", method: "cash", seatNo: "" } });
  const { isSubmitting } = renewForm.formState;

  const [isReAdmission, setIsReAdmission] = useState(false);
  const [seatStatus, setSeatStatus] = useState<"available" | "taken" | "checking" | null>(null);
  const watchedSeat = renewForm.watch("seatNo");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = query ? await searchStudents(query) : await listStudents();
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [query, refreshTick]);

  const dueStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (!s.activeUntil) return true;
        const expiryDate = new Date(s.activeUntil);
        const fiveDaysFromNow = addDays(new Date(), 5);
        return isPast(expiryDate) || expiryDate <= fiveDaysFromNow;
      })
      .sort((a, b) => {
        const dateA = a.activeUntil ? new Date(a.activeUntil).getTime() : 0;
        const dateB = b.activeUntil ? new Date(b.activeUntil).getTime() : 0;
        return dateA - dateB;
      });
  }, [students]);

  const stats = useMemo(() => {
    const expired = dueStudents.filter(s => s.isExpired).length;
    const soon = dueStudents.filter(s => !s.isExpired).length;
    return { expired, soon, total: dueStudents.length };
  }, [dueStudents]);

  const getMethodFor = (s: Student): "cash" | "upi" | "card" => methodByUser[s.id] ?? "cash";

  const parseRupeeInt = (raw: string): number => {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") return 0;
    const n = parseInt(digits, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const getFeeInputs = (s: Student) =>
    feeInputs[s.id] ?? {
      seasonalFees: String(s.seasonalFees ?? 0),
      feesDeposited: String(s.feesDeposited ?? 0),
      months: "1",
    };

  const updateFeeInput = (s: Student, field: "seasonalFees" | "feesDeposited" | "months", value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    const current = getFeeInputs(s);
    setFeeInputs((prev) => ({
      ...prev,
      [s.id]: { ...current, [field]: digitsOnly },
    }));
  };

  const handleRenewRow = async (student: Student) => {
    const method = getMethodFor(student);
    const fees = getFeeInputs(student);
    const seasonal = parseRupeeInt(fees.seasonalFees);
    const deposit = parseRupeeInt(fees.feesDeposited);

    if (seasonal < 1) {
      toast({
        title: "Amount Required",
        description: "Please enter a valid seasonal fee.",
        variant: "destructive",
      });
      return;
    }

    const months = parseInt(fees.months, 10) || 1;

    setRenewingIds((prev) => new Set(prev).add(student.id));
    try {
      // Update metadata for accurate validity tracking in UI and cumulative fees
      const existingMonths = student.meta?.currentValidityMonths || 0;
      const existingFees = student.meta?.feesDeposited || student.feesDeposited || 0;
      const isReAdmission = student.isExpired || !student.isEnrolled;

      setStudentMeta(student.id, {
        currentValidityMonths: isReAdmission ? months : (existingMonths + months),
        feesDeposited: isReAdmission ? deposit : (existingFees + deposit)
      });

      const updated = await renewMembership(student.id, {
        months,
        amount: deposit,
        method: method.toUpperCase() as "CASH" | "UPI" | "CARD",
        note: "Instant Renewal",
        dateOfJoining: student.dateOfJoining || undefined,
      });

      setRenewedStudent({
        name: updated.name,
        phone: updated.mobileNo,
        amount: `₹${deposit.toLocaleString("en-IN")}`,
        validity: updated.activeUntil ? format(new Date(updated.activeUntil), "dd MMM, yyyy") : "N/A"
      });

      setPaidIds((prev) => new Set(prev).add(student.id));
      toast({
        title: "Successful!",
        description: `${student.name}'s membership renewed for ${months} month(s).`,
      });
      setRefreshTick((x) => x + 1);
    } catch (e: any) {
      toast({
        title: "Renewal Failed",
        description: e.response?.data?.message || "Internal server error.",
        variant: "destructive",
      });
    } finally {
      setRenewingIds((prev) => { const s = new Set(prev); s.delete(student.id); return s; });
    }
  };

  // Debounced seat check
  useEffect(() => {
    if (!watchedSeat || watchedSeat.trim().length === 0) {
      setSeatStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSeatStatus("checking");
      try {
        const available = await isSeatAvailable(watchedSeat);
        setSeatStatus(available ? "available" : "taken");
      } catch {
        setSeatStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedSeat]);

  const onFind = async (data: FindForm) => {
    const results = await searchStudents(data.email);
    const match = results.find(s => s.mobileNo === data.email || s.name.toLowerCase().includes(data.email.toLowerCase()) || s.regNo === data.email);

    if (!match && results.length === 0) {
      toast({ title: "No Student Found", description: "Could not find a student with that detail.", variant: "destructive" });
      setFoundStudent(null);
      return;
    }

    const user = match || results[0];
    setFoundStudent(user);
    setIsReAdmission(user.isExpired || !user.isEnrolled);
    renewForm.reset({
      seasonalFees: String(user.seasonalFees ?? 0),
      feesDeposited: String(user.feesDeposited ?? 0),
      months: "1",
      method: "cash",
      note: "",
      seatNo: user.seatNo || ""
    });
    toast({ title: "Student Selected", description: `Active session for ${user.name}` });
  };

  const onRenew = async () => {
    if (!foundStudent) return;
    const { seasonalFees, feesDeposited, method, note, months, seatNo } = renewForm.getValues();
    const seasonal = parseRupeeInt(seasonalFees);
    const deposit = parseRupeeInt(feesDeposited);
    const monthsNum = parseInt(months as unknown as string, 10) || 1;

    try {
      // 1. If Rate or Seat changed, update student record first
      // This ensures PendingFees correctly calculates based on the NEW rate
      if (seasonal !== foundStudent.seasonalFees || seatNo !== foundStudent.seatNo) {
        await updateStudent(foundStudent.id, {
          seasonalFees: seasonal,
          seatNo: seatNo,
          isEnrolled: true
        });
      }

      // 2. SYNC LOCAL OVERRIDE: Update cumulative months and fees for the strict validity logic
      const currentMonths = foundStudent.meta?.currentValidityMonths || 0;
      const currentFees = foundStudent.meta?.feesDeposited || foundStudent.feesDeposited || 0;

      setStudentMeta(foundStudent.id, {
        currentValidityMonths: isReAdmission ? monthsNum : (currentMonths + monthsNum),
        feesDeposited: isReAdmission ? deposit : (currentFees + deposit),
        seasonalFees: seasonal // Persist the new rate in meta too
      });

      const updated = await renewMembership(foundStudent.id, {
        months: monthsNum,
        amount: deposit,
        method: method.toUpperCase() as "CASH" | "UPI" | "CARD",
        note: isReAdmission ? "Re-admission Payment" : note,
        dateOfJoining: (isReAdmission ? new Date().toISOString() : foundStudent.dateOfJoining) || undefined,
      });

      const activeUntilStr = updated.activeUntil ? format(new Date(updated.activeUntil), "dd MMM, yyyy") : "N/A";
      const joiningDateStr = format(new Date(), "dd MMM, yyyy");

      setRenewedStudent({
        name: updated.name,
        phone: updated.mobileNo,
        amount: `₹${deposit.toLocaleString("en-IN")}`,
        validity: activeUntilStr,
        // Add more context for the re-admission template
        isReAdmission,
        regNo: updated.regNo,
        seatNo: updated.seatNo,
        monthlyRate: `₹${seasonal.toLocaleString("en-IN")}`,
        pending: `₹${Math.max(0, seasonal - deposit).toLocaleString("en-IN")}`,
        period: `${monthsNum} Month(s)`,
        joiningDate: joiningDateStr
      } as any);

      setFoundStudent(null);
      find.reset();
      setRefreshTick(t => t + 1);
    } catch (e: any) {
      toast({ title: "Failed", description: e.response?.data?.message || "Error", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-2xl md:px-10 md:py-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
                <Clock className="mr-1 h-3 w-3" />
                {format(new Date(), "EEEE, dd MMM")}
              </Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Renew Membership</h1>
            <p className="max-w-md text-slate-300 text-sm md:text-base">
              Effortlessly manage student renewals and keep your library seats filled.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Quick search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500 backdrop-blur-md transition-all focus:bg-white/10 focus:ring-primary/50 sm:w-64"
              />
            </div>
            <Button
              onClick={() => setRefreshTick(t => t + 1)}
              variant="outline"
              className="h-12 w-12 border-white/10 bg-white/5 p-0 text-white hover:bg-white/10"
            >
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pending</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-red-500/10 p-4 backdrop-blur-md border border-red-500/20">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">Expired</p>
            <p className="mt-1 text-2xl font-black text-red-500">{stats.expired}</p>
          </div>
          <div className="rounded-2xl bg-amber-500/10 p-4 backdrop-blur-md border border-amber-500/20">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Expiring Soon</p>
            <p className="mt-1 text-2xl font-black text-amber-500">{stats.soon}</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-4 backdrop-blur-md border border-emerald-500/20">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Success Rate</p>
            <p className="mt-1 text-2xl font-black text-emerald-500">98%</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Due Renewals List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Priority Renewals
            </h2>
            <span className="text-xs font-medium text-slate-500">Showing {dueStudents.length} Students</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 rounded-3xl bg-slate-50 border border-slate-100 italic text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              Synthesizing data...
            </div>
          ) : dueStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-slate-50 border border-slate-100 text-center">
              <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
              <p className="text-slate-500 text-sm max-w-xs">No memberships are currently due for renewal. Good job!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {dueStudents.map((s) => {
                const isPaid = paidIds.has(s.id);
                const isLoading = renewingIds.has(s.id);
                const fees = getFeeInputs(s);
                const months = membershipMonthsFromDeposit(parseRupeeInt(fees.seasonalFees), parseRupeeInt(fees.feesDeposited));

                return (
                  <Card key={s.id} className={cn(
                    "group overflow-hidden rounded-2xl border-slate-200/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300",
                    s.isExpired ? "border-red-100 bg-red-50/5" : "bg-white"
                  )}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Left Info Section */}
                        <div className="p-4 md:p-6 md:w-2/5 border-b md:border-b-0 md:border-r border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
                              <p className="text-xs text-slate-500 truncate">{s.mobileNo || "No contact"}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline" className="bg-slate-50 text-[10px] font-mono">{s.regNo}</Badge>
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px]">Seat {s.seatNo}</Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-bold uppercase tracking-tighter">Status</span>
                              {s.isExpired ? (
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Expired
                                </span>
                              ) : (
                                <span className="text-amber-500 font-bold flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Due Soon
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Active Until:</span>
                              <span className="font-bold text-slate-900">
                                {s.activeUntil ? format(new Date(s.activeUntil), "dd MMM, yyyy") : "N/A"}
                              </span>
                            </div>
                            <Progress value={s.isExpired ? 100 : 75} className={cn("h-1", s.isExpired ? "bg-red-100" : "bg-amber-100")} />
                          </div>
                        </div>

                        {/* Right Form Section */}
                        <div className="p-4 md:p-6 md:flex-1 bg-slate-50/30">
                          <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Rate (₹)</Label>
                              <div className="relative">
                                <Input
                                  value={fees.seasonalFees}
                                  onChange={e => updateFeeInput(s, "seasonalFees", e.target.value)}
                                  className="h-10 bg-white border-slate-200 text-sm pl-7"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Deposit (₹)</Label>
                              <div className="relative">
                                <Input
                                  value={fees.feesDeposited}
                                  onChange={e => updateFeeInput(s, "feesDeposited", e.target.value)}
                                  className="h-10 bg-white border-slate-200 text-sm pl-7"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Duration (Mn)</Label>
                              <div className="relative">
                                <Input
                                  value={fees.months}
                                  onChange={e => updateFeeInput(s, "months", e.target.value)}
                                  className="h-10 bg-white border-slate-200 text-sm pl-7 font-black text-primary"
                                />
                                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                              </div>
                            </div>
                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Method</Label>
                              <Select value={getMethodFor(s)} onValueChange={v => setMethodByUser(prev => ({ ...prev, [s.id]: v as any }))}>
                                <SelectTrigger className="h-10 bg-white border-slate-200 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="upi">UPI</SelectItem>
                                  <SelectItem value="card">Card</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              disabled={isLoading || isPaid || months === null}
                              onClick={() => handleRenewRow(s)}
                              className={cn(
                                "flex-1 h-11 rounded-xl font-bold shadow-lg shadow-primary/10 transition-all",
                                isPaid && "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10"
                              )}
                            >
                              {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : isPaid ? (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Updated
                                </>
                              ) : (
                                <>
                                  <Zap className="mr-2 h-4 w-4 fill-white" /> Renew Student
                                </>
                              )}
                            </Button>
                            {!isPaid && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="h-11 w-11 rounded-xl p-0 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  onClick={() => {
                                    const expiry = s.activeUntil ? format(new Date(s.activeUntil), "dd MMM, yyyy") : "N/A";
                                    sendWhatsApp({
                                      phone: s.mobileNo,
                                      message: waTemplates.renewalReminder(s.name, expiry)
                                    });
                                  }}
                                  title="Remind via WhatsApp"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="h-11 w-11 rounded-xl p-0 border-slate-200" onClick={() => window.location.href = `tel:${s.mobileNo}`}>
                                  <TrendingDown className="h-4 w-4 rotate-[-45deg] text-slate-400" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

        </div>

        {/* Right Panel: Manual Lookup / Checkout (1/3 width) */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">

            <Card className="rounded-3xl border-slate-200/60 shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-2 bg-primary" />
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-1">
                  <Gem className="h-3 w-3" />
                  Direct Access
                </div>
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Search className="h-6 w-6 text-primary" />
                  Lookup Student
                </CardTitle>
                <p className="text-slate-400 text-xs font-medium italic mt-1">Instant ID-based membership retrieval.</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={find.handleSubmit(onFind)} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">Search Detail</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Email, Mobile or ID..."
                        className="h-12 pl-10 rounded-xl border-slate-200"
                        {...find.register("email", { required: true })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-xl shadow-slate-200/50">
                    Lookup Student
                  </Button>
                </form>

                {foundStudent && (
                  <div className="animate-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-6 space-y-8">
                    {/* Student Identity Card */}
                    <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white shadow-2xl transition-all hover:bg-slate-950">
                        <div className="absolute -right-5 -bottom-5 h-32 w-32 rounded-full bg-primary/20 blur-2xl transition-all group-hover:scale-150" />
                        <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 blur-xl" />
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                            <div className="h-14 w-14 rounded-full overflow-hidden bg-white/10 ring-4 ring-white/10 border-2 border-white/20 flex items-center justify-center shadow-inner">
                              <Avatar className="h-full w-full">
                                <AvatarImage src={foundStudent.photo} className="object-cover" />
                                <AvatarFallback className="bg-transparent text-primary text-xl font-black">
                                  {foundStudent.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                                <Badge className={cn(
                                    "h-6 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest border-none shadow-lg",
                                    isReAdmission ? "bg-amber-500 text-white animate-pulse" : "bg-emerald-500 text-white"
                                )}>
                                    {isReAdmission ? "Re-admission Mode" : "Standard Renewal"}
                                </Badge>
                            </div>
                            
                            <div className="space-y-1">
                                <h4 className="text-xl font-black tracking-tight">{foundStudent.name}</h4>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {foundStudent.regNo}</span>
                                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Initial Seat: {foundStudent.seatNo}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); onRenew(); }} className="space-y-8">
                        {/* Placement & Duration Sector */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Hash className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Seat & Cycle</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Assigned Seat</Label>
                                    <div className="relative">
                                        <Input 
                                            placeholder="e.g. S-22" 
                                            className="h-12 pl-10 pr-12 rounded-2xl border-slate-200 font-bold bg-white focus:ring-primary/20" 
                                            {...renewForm.register("seatNo")} 
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                          {seatStatus === "checking" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                                          {seatStatus === "available" && <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in duration-300" />}
                                          {seatStatus === "taken" && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-500 animate-in slide-in-from-right-2 duration-300">
                                              <AlertCircle className="h-3 w-3" />
                                            </div>
                                          )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Period (Mn)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input type="number" min="1" className="h-12 pl-10 rounded-2xl border-slate-200 font-black text-primary bg-white transition-all focus:scale-[1.02]" {...renewForm.register("months")} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Sector */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Financial Setup</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Monthly Rate</Label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                        <Input className="h-12 pl-8 rounded-2xl border-slate-200 font-black text-slate-900 bg-white" {...renewForm.register("seasonalFees")} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Deposit Today</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₹</span>
                                        <Input className="h-12 pl-8 rounded-2xl border-slate-200 font-black text-emerald-600 bg-emerald-50/10 focus:bg-white" {...renewForm.register("feesDeposited")} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-3 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 h-full w-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Target Expiry Date</span>
                                        <span className="font-bold text-primary text-base">
                                            {(() => {
                                                const v = renewForm.watch();
                                                const m = parseInt(v.months as unknown as string, 10) || 1;
                                                const baseDate = isReAdmission ? new Date() : (foundStudent.activeUntil ? new Date(foundStudent.activeUntil) : new Date());
                                                return format(addDays(baseDate, m * 30), "dd MMM, yyyy");
                                            })()}
                                        </span>
                                    </div>
                                    <Calendar className="h-8 w-8 text-primary/10" />
                                </div>
                            </div>
                        </div>

                        {/* Gateway Sector */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Payment Channel</h3>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                              {["cash", "upi", "card"].map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => renewForm.setValue("method", m as any)}
                                  className={cn(
                                    "h-16 flex flex-col items-center justify-center rounded-2xl border-2 transition-all p-1 relative overflow-hidden group/btn",
                                    renewForm.watch("method") === m 
                                      ? "border-primary bg-white text-primary shadow-xl shadow-primary/10" 
                                      : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:text-slate-600 hover:bg-white"
                                  )}
                                >
                                  {renewForm.watch("method") === m && (
                                      <div className="absolute -right-2 -top-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                                          <div className="h-1.5 w-1.5 bg-white rounded-full" />
                                      </div>
                                  )}
                                  {m === "cash" && <Wallet className="h-5 w-5 mb-1 transition-transform group-hover/btn:scale-110" />}
                                  {m === "upi" && <Smartphone className="h-5 w-5 mb-1 transition-transform group-hover/btn:scale-110" />}
                                  {m === "card" && <CreditCard className="h-5 w-5 mb-1 transition-transform group-hover/btn:scale-110" />}
                                  <span className="text-[9px] uppercase font-black tracking-widest">{m}</span>
                                </button>
                              ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Internal Remarks</Label>
                            <Input placeholder="Operation note..." className="h-12 rounded-xl border-slate-200" {...renewForm.register("note")} />
                        </div>

                        <Button type="submit" className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-primary font-black text-lg shadow-2xl shadow-slate-200/50 transition-all active:scale-[0.98] group/submit overflow-hidden relative">
                          <span className="relative z-10 flex items-center gap-2">
                            {isReAdmission ? "Complete Re-admission" : "Initialize Renewal"}
                            <ArrowRight className="h-5 w-5 group-hover/submit:translate-x-1 transition-transform" />
                          </span>
                          <div className="absolute inset-0 bg-primary opacity-0 group-hover/submit:opacity-100 transition-opacity" />
                        </Button>
                      </form>
                    </div>
                  )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Success Dialog with WhatsApp Options */}
      <Dialog open={!!renewedStudent} onOpenChange={(o) => {
        if (!o) setRenewedStudent(null);
      }}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                <RefreshCw className="h-10 w-10 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black text-white">
                {renewedStudent?.isReAdmission ? "Re-admission Complete!" : "Renewal Successful!"}
              </DialogTitle>
              <DialogDescription className="text-primary-foreground opacity-90 font-medium mt-1">
                {renewedStudent?.name} {renewedStudent?.isReAdmission ? "is back with us!" : "has extended their membership."}
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">New Validity Date</span>
                <span className="text-xl font-black text-slate-900">{renewedStudent?.validity}</span>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Send confirmation to student</h4>
                <Button
                  onClick={() => {
                    if (!renewedStudent) return;
                    const msgFunc = renewedStudent.isReAdmission ? waTemplates.readmission : waTemplates.renewalSuccess;
                    const params = renewedStudent.isReAdmission
                      ? {
                        name: renewedStudent.name,
                        regNo: renewedStudent.regNo,
                        seatNo: renewedStudent.seatNo,
                        monthlyRate: renewedStudent.monthlyRate,
                        deposited: renewedStudent.amount,
                        pending: renewedStudent.pending,
                        period: renewedStudent.period,
                        joiningDate: renewedStudent.joiningDate,
                        validity: renewedStudent.validity
                      }
                      : [renewedStudent.name, renewedStudent.amount, renewedStudent.validity];

                    sendWhatsApp({
                      phone: renewedStudent.phone,
                      message: typeof msgFunc === 'function' ? (msgFunc as any)(...(Array.isArray(params) ? params : [params])) : ""
                    });
                  }}
                  className="w-full h-16 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black flex items-center justify-center gap-3 border-none shadow-lg shadow-emerald-100"
                >
                  <MessageSquare className="h-5 w-5" />
                  {renewedStudent?.isReAdmission ? "Send Welcome Back Receipt" : "Send Renewal Receipt"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 bg-white">
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl font-bold text-slate-400"
              onClick={() => setRenewedStudent(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
