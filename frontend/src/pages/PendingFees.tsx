import { useEffect, useMemo, useState } from "react";
import { format, isPast } from "date-fns";
import { listAllStudents, paySeasonalFee, StudentView, setStudentMeta } from "@/lib/students";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Search, 
  Wallet, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Calendar,
  MoreVertical,
  CheckCircle2,
  ArrowRightCircle,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendWhatsApp, waTemplates } from "@/lib/whatsapp";

export default function PendingFees() {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState<StudentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingStudent, setClearingStudent] = useState<StudentView | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settledStudent, setSettledStudent] = useState<{ name: string, phone: string, amount: string, validity: string } | null>(null);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const all = await listAllStudents();
      setStudents(Array.isArray(all) ? all : []);
    } catch (e) {
      console.error("Failed to load students", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const pendingStudents = useMemo(() => {
    const filtered = students.filter(
      (s) => s.isEnrolled !== false && (s.seasonalFees ?? 0) > (s.feesDeposited ?? 0)
    );
    if (!q) return filtered;
    const qq = q.toLowerCase();
    return filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(qq) ||
        (s.regNo ?? "").toLowerCase().includes(qq) ||
        s.seatNo.toLowerCase().includes(qq)
    );
  }, [q, students]);

  const totalPendingAmount = useMemo(() => {
    return pendingStudents.reduce((sum, s) => {
        const due = (s.seasonalFees ?? 0) - (s.feesDeposited ?? 0);
        return sum + Math.max(0, due);
    }, 0);
  }, [pendingStudents]);

  const expiredCount = useMemo(() => {
    return pendingStudents.filter(s => s.activeUntil && isPast(new Date(s.activeUntil))).length;
  }, [pendingStudents]);

  const regOf = (s: StudentView) => (s.regNo ? s.regNo.replace(/^REG-/, "") : "—");
  const pendingAmount = (s: StudentView) => Math.max(0, (s.seasonalFees ?? 0) - (s.feesDeposited ?? 0));

  const handleClearDues = async () => {
    if (!clearingStudent) return;
    setIsSubmitting(true);
    try {
      await paySeasonalFee({
        studentId: clearingStudent.id,
        amount: pendingAmount(clearingStudent),
        paymentMethod: paymentMethod,
        months: 0, // Dues clearance doesn't extend validity
      });

      const currentFees = (clearingStudent.feesDeposited || 0);
      const amountCleared = pendingAmount(clearingStudent);
      const amountStr = `₹${amountCleared.toLocaleString("en-IN")}`;

      setStudentMeta(clearingStudent.id, { 
          feesDeposited: currentFees + amountCleared,
          // We DO NOT update currentValidityMonths here to keep validity same
      });

      await fetchStudents();
      
      // Get the updated student to show correct validity in dialog
      const all = await listAllStudents();
      const updated = all.find(s => s.id === clearingStudent.id);
      
      setSettledStudent({
          name: clearingStudent.name,
          phone: clearingStudent.mobileNo,
          amount: amountStr,
          validity: updated?.activeUntil ? format(new Date(updated.activeUntil), "dd MMM, yyyy") : "N/A"
      });

      setClearingStudent(null);
    } catch (e: any) {
      toast({ 
        title: "Error", 
        description: e?.response?.data?.message || e.message || "Failed to clear dues", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      
      {/* Header & Stats Dashboard */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-rose-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-400 border border-amber-500/20">
              <Wallet className="h-3.5 w-3.5" />
              Fee Collection Hub
            </div>
            <h1 className="text-4xl font-black md:text-5xl tracking-tight">Pending Fees</h1>
            <p className="text-slate-400 font-medium max-w-sm">Monitor and clear outstanding membership dues with premium tracking tools.</p>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Outstanding</span>
              <div className="text-3xl md:text-4xl font-black text-amber-500 leading-none">
                ₹{totalPendingAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="h-12 w-[1px] bg-white/10 hidden sm:block" />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student Dues</span>
              <div className="text-3xl md:text-4xl font-black text-white leading-none">
                {pendingStudents.length}
              </div>
            </div>
            <div className="h-12 w-[1px] bg-white/10 hidden sm:block" />
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expired Status</span>
              <div className="text-3xl md:text-4xl font-black text-rose-500 leading-none">
                {expiredCount}
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Interface */}
        <div className="relative mt-12 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input 
            className="h-16 w-full rounded-[1.5rem] border-white/5 bg-white/5 pl-12 text-lg text-white placeholder:text-slate-600 focus:bg-white/10 focus:ring-amber-500 transition-all border-none outline-none ring-1 ring-white/10"
            placeholder="Filter by name, reg no or seat number..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Unified Listing Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Overdue Records
          </h2>
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-black px-3">
            {pendingStudents.length} Results
          </Badge>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] bg-emerald-50/50 border border-emerald-100 border-dashed text-center mx-4">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Zero Dues!</h3>
            <p className="text-slate-500 font-medium max-w-sm">All students have cleared their seasonal fees. Your collection performance is outstanding today.</p>
          </div>
        ) : (
          <div className="px-1">
            {/* Desktop View Table */}
            <div className="hidden lg:block overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seat Placement</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validity Period</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Due Amount</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingStudents.map((s) => (
                    <TableRow key={s.id} className="group hover:bg-slate-50/100 border-slate-50 transition-colors">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-black text-lg">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{s.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{regOf(s)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="h-10 rounded-xl px-4 border-slate-200 bg-white font-black text-slate-600 shadow-sm">
                          {s.seatNo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {s.activeUntil ? (
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-black",
                              isPast(new Date(s.activeUntil)) ? "text-rose-500" : "text-emerald-500"
                            )}>
                              {format(new Date(s.activeUntil), "dd MMM yyyy")}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">
                             {isPast(new Date(s.activeUntil)) ? "Membership Expired" : "Active Member"}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-slate-300 font-bold border-slate-100 italic">No Validity Set</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-amber-600">₹{pendingAmount(s).toLocaleString("en-IN")}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Seasonal Fee</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            onClick={() => setClearingStudent(s)}
                            className="h-12 px-6 rounded-2xl bg-slate-950 text-white font-black text-xs gap-2 hover:bg-amber-500 transition-all shadow-lg active:scale-95 group-hover:shadow-amber-200"
                          >
                            Clear Dues
                            <ArrowRightCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const amount = `₹${pendingAmount(s).toLocaleString("en-IN")}`;
                              sendWhatsApp({
                                phone: s.mobileNo,
                                message: waTemplates.dueFees(s.name, amount)
                              });
                            }}
                            className="h-12 w-12 rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            title="Remind via WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4 px-4">
              {pendingStudents.map((s) => (
                <Card key={s.id} className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="p-6 pb-2 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 flex items-center justify-center text-amber-600 font-black text-xl shadow-inner">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-black text-slate-900 text-lg leading-none">{s.name}</h3>
                              <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="h-5 px-2 bg-slate-50 text-[10px]">{s.seatNo}</Badge>
                                <span>#{regOf(s)}</span>
                              </p>
                            </div>
                        </div>
                        <AlertCircle className={cn(
                          "h-6 w-6 mt-1",
                          isPast(new Date(s.activeUntil || "")) ? "text-rose-500" : "text-amber-300"
                        )} />
                      </div>
                      
                      <div className="px-6 py-4 space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                          <div className="space-y-1">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Due Amount</div>
                            <div className="text-2xl font-black text-amber-600">₹{pendingAmount(s).toLocaleString("en-IN")}</div>
                          </div>
                          <div className="h-10 w-[1px] bg-slate-200 mx-2" />
                          <div className="space-y-1 text-right">
                             <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Valid Until</div>
                             <div className={cn("text-sm font-black", isPast(new Date(s.activeUntil || "")) ? "text-rose-500" : "text-slate-600")}>
                                {s.activeUntil ? format(new Date(s.activeUntil), "dd MMM, yy") : "N/A"}
                             </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => setClearingStudent(s)}
                            className="flex-1 h-16 rounded-[1.5rem] bg-slate-950 text-white font-black text-base shadow-2xl active:scale-95 transition-all gap-3"
                          >
                            Finalize Payment
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              const amount = `₹${pendingAmount(s).toLocaleString("en-IN")}`;
                              sendWhatsApp({
                                phone: s.mobileNo,
                                message: waTemplates.dueFees(s.name, amount)
                              });
                            }}
                            className="h-16 w-16 rounded-[1.5rem] border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center"
                          >
                            <MessageSquare className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Processing Dialog */}
      <Dialog open={!!clearingStudent} onOpenChange={(o) => (!o && !isSubmitting) && setClearingStudent(null)}>
        <DialogContent className="max-w-md rounded-3xl md:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl sm:h-auto h-[90vh] flex flex-col">
          <div className="bg-amber-500 p-6 md:p-8 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-black flex items-center gap-3 text-white">
                <Wallet className="h-6 w-6 md:h-7 md:w-7" />
                Settle Payment
              </DialogTitle>
              <DialogDescription className="text-amber-50 font-medium opacity-90 text-xs md:text-sm">
                Authorized entry of fee collection for student records.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8 bg-white">
            {clearingStudent && (
              <>
                <div className="flex items-center gap-4 p-3 md:p-4 rounded-2xl md:rounded-3xl bg-slate-50/50 border border-slate-100">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-amber-200">
                    {clearingStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-900 truncate">{clearingStudent.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                      <Badge variant="outline" className="text-[9px] md:text-[10px] font-bold h-4 md:h-5 px-1 md:px-1.5">{clearingStudent.seatNo}</Badge>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400">ID: {regOf(clearingStudent)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Collection Mode</span>
                    <span className="text-amber-600 font-black text-xs md:text-sm">Full Due Clearance</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[
                      { id: "CASH", icon: Banknote, label: "Cash" },
                      { id: "UPI", icon: Smartphone, label: "UPI" },
                      { id: "CARD", icon: CreditCard, label: "Card" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setPaymentMethod(mode.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center py-3 md:py-4 rounded-2xl md:rounded-3xl border-2 transition-all gap-1 md:gap-2",
                          paymentMethod === mode.id 
                            ? "bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-200" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-amber-200 hover:text-amber-500"
                        )}
                      >
                        <mode.icon className="h-5 w-5 md:h-6 md:w-6" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 md:mt-8 p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-slate-950 text-white flex items-center justify-between relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                     <div className="relative z-10 flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Collected Amount</span>
                        <span className="text-2xl md:text-3xl font-black">₹{pendingAmount(clearingStudent).toLocaleString("en-IN")}</span>
                     </div>
                     <div className="relative z-10 h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                     </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="p-5 md:p-8 pt-0 bg-white gap-2 md:gap-3 flex-shrink-0">
            <Button 
                variant="outline" 
                onClick={() => setClearingStudent(null)} 
                disabled={isSubmitting} 
                className="h-12 md:h-14 flex-1 rounded-xl md:rounded-2xl border-slate-200 font-bold md:font-black text-slate-400 hover:bg-slate-50 text-sm"
            >
              Cancel
            </Button>
            <Button 
                onClick={handleClearDues} 
                disabled={isSubmitting} 
                className="h-12 md:h-14 flex-[2] rounded-xl md:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold md:font-black text-sm md:text-lg shadow-xl shadow-amber-200"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement Success Dialog with WhatsApp Options */}
      <Dialog open={!!settledStudent} onOpenChange={(o) => {
          if (!o) setSettledStudent(null);
      }}>
          <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-amber-500 p-8 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                          <CheckCircle2 className="h-10 w-10 text-amber-500" />
                      </div>
                      <DialogTitle className="text-2xl font-black text-white">Dues Cleared!</DialogTitle>
                      <DialogDescription className="text-amber-50 opacity-90 font-medium mt-1">
                          The outstanding balance for {settledStudent?.name} has been settled.
                      </DialogDescription>
                  </div>
              </div>
              
              <div className="p-8 space-y-6 bg-white">
                  <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Membership Status</span>
                          <span className="text-lg font-black text-slate-900 italic">Validity: {settledStudent?.validity}</span>
                      </div>

                      <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Send confirmation to student</h4>
                          <Button 
                              onClick={() => {
                                  if (!settledStudent) return;
                                  sendWhatsApp({ 
                                      phone: settledStudent.phone, 
                                      message: waTemplates.settlementSuccess(settledStudent.name, settledStudent.amount, settledStudent.validity) 
                                  });
                              }}
                              className="w-full h-16 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black flex items-center justify-center gap-3 border-none shadow-lg shadow-emerald-100"
                          >
                              <MessageSquare className="h-5 w-5" />
                              Send Payment Receipt
                          </Button>
                      </div>
                  </div>
              </div>

              <DialogFooter className="p-8 pt-0 bg-white">
                  <Button 
                      variant="ghost" 
                      className="w-full h-12 rounded-xl font-bold text-slate-400"
                      onClick={() => setSettledStudent(null)}
                  >
                      Close Dashboard
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
