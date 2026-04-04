import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays, isPast, differenceInDays } from "date-fns";
import { listStudents, searchStudents, Student, renewMembership, membershipMonthsFromDeposit, setStudentMeta } from "@/lib/students";
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
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type FindForm = { email: string };
type RenewForm = { seasonalFees: string; feesDeposited: string; months: string; method: "cash" | "upi" | "card"; note?: string };

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

    const { toast } = useToast();
    const find = useForm<FindForm>();
    const renewForm = useForm<RenewForm>({ defaultValues: { seasonalFees: "", feesDeposited: "", months: "1", method: "cash" } });

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
            const currentMonths = student.meta?.currentValidityMonths || 0;
            const currentFees = student.meta?.feesDeposited || student.feesDeposited || 0;
            
            setStudentMeta(student.id, { 
                currentValidityMonths: currentMonths + months,
                feesDeposited: currentFees + deposit
            });

            await renewMembership(student.id, {
                months,
                amount: deposit,
                method: method.toUpperCase() as "CASH" | "UPI" | "CARD",
                note: "Instant Renewal",
                dateOfJoining: student.dateOfJoining || undefined,
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
        renewForm.reset({
            seasonalFees: String(user.seasonalFees ?? 0),
            feesDeposited: String(user.feesDeposited ?? 0),
            months: "1",
            method: "cash",
            note: "",
        });
        toast({ title: "Student Selected", description: `Active session for ${user.name}` });
    };

    const onRenew = async () => {
        if (!foundStudent) return;
        const { seasonalFees, feesDeposited, method, note, months } = renewForm.getValues();
        const seasonal = parseRupeeInt(seasonalFees);
        const deposit = parseRupeeInt(feesDeposited);
        const monthsNum = parseInt(months as unknown as string, 10) || 1;

        try {
            // SYNC LOCAL OVERRIDE: Update cumulative months and fees for the strict validity logic
            const currentMonths = foundStudent.meta?.currentValidityMonths || 0;
            const currentFees = foundStudent.meta?.feesDeposited || foundStudent.feesDeposited || 0;

            setStudentMeta(foundStudent.id, { 
                currentValidityMonths: currentMonths + monthsNum,
                feesDeposited: currentFees + deposit
            });

            const updated = await renewMembership(foundStudent.id, {
                months: monthsNum,
                amount: deposit,
                method: method.toUpperCase() as "CASH" | "UPI" | "CARD",
                note,
                dateOfJoining: foundStudent.dateOfJoining || undefined,
            });
            setFoundStudent(updated);
            toast({ title: "Success", description: "Membership has been extended." });
            setRefreshTick(t => t + 1);
            setFoundStudent(null);
            find.reset();
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
                                                <Select value={getMethodFor(s)} onValueChange={v => setMethodByUser(prev => ({...prev, [s.id]: v as any}))}>
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
                                              <Button variant="outline" className="h-11 w-11 rounded-xl p-0 border-slate-200" onClick={() => window.location.href=`tel:${s.mobileNo}`}>
                                                <TrendingDown className="h-4 w-4 rotate-[-45deg] text-slate-400" />
                                              </Button>
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
                            <CardHeader className="bg-slate-950 text-white p-6">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Manual Renewal
                                </CardTitle>
                                <p className="text-slate-400 text-xs font-medium">Search specifically by Email or Reg ID</p>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
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
                                    <div className="animate-in slide-in-from-top-4 duration-500 border-t border-slate-100 pt-6 space-y-6">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-black">
                                              {foundStudent.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate">{foundStudent.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                  <span>{foundStudent.regNo}</span>
                                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                  <span>Seat {foundStudent.seatNo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={(e) => { e.preventDefault(); onRenew(); }} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-2">
                                                  <Label className="text-xs font-bold text-slate-500">Monthly Rate</Label>
                                                  <Input className="rounded-xl border-slate-200" {...renewForm.register("seasonalFees")} />
                                              </div>
                                              <div className="space-y-2">
                                                  <Label className="text-xs font-bold text-slate-500">Total Deposit</Label>
                                                  <Input className="rounded-xl border-slate-200" {...renewForm.register("feesDeposited")} />
                                              </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500">Duration (Months)</Label>
                                                <Input type="number" min="1" className="rounded-xl border-slate-200 font-bold text-primary" {...renewForm.register("months")} />
                                            </div>

                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                                              <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500 font-medium">New Expiry</span>
                                                <span className="font-bold text-primary">
                                                  {(() => {
                                                    const v = renewForm.watch();
                                                    const m = parseInt(v.months as unknown as string, 10) || 1;
                                                    if (!foundStudent.activeUntil) return "—";
                                                    return format(addDays(new Date(foundStudent.activeUntil), m * 30), "dd MMM, yyyy");
                                                  })()}
                                                </span>
                                              </div>
                                              <Progress value={100} className="h-1.5 bg-slate-200" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500">Payment Gateway</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                  {["cash", "upi", "card"].map(m => (
                                                    <button
                                                      key={m}
                                                      type="button"
                                                      onClick={() => renewForm.setValue("method", m as any)}
                                                      className={cn(
                                                        "h-14 flex flex-col items-center justify-center rounded-xl border-2 transition-all p-1",
                                                        renewForm.watch("method") === m 
                                                          ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                                                          : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600"
                                                      )}
                                                    >
                                                      {m === "cash" && <Wallet className="h-5 w-5 mb-1" />}
                                                      {m === "upi" && <Smartphone className="h-5 w-5 mb-1" />}
                                                      {m === "card" && <CreditCard className="h-5 w-5 mb-1" />}
                                                      <span className="text-[10px] uppercase font-black">{m}</span>
                                                    </button>
                                                  ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-slate-500">Additional Remarks</Label>
                                                <Input placeholder="Note (optional)..." className="rounded-xl border-slate-200" {...renewForm.register("note")} />
                                            </div>

                                            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30">
                                              Confirm Renewal
                                              <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>

            </div>
        </div>
    );
}

// Internal icons helper for Method
function Smartphone({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
    </svg>
  );
}
