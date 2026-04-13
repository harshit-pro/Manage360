import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { createStudent, nextRegNo, nextStudentCode, renewMembership, membershipMonthsFromDeposit, setStudentMeta, isSeatAvailable } from "@/lib/students";
import { deleteDraft } from "@/lib/drafts";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  UserPlus, 
  User, 
  MapPin, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  Users, 
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Gem,
  Lock,
  Wallet,
  Clock,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sendWhatsApp, waTemplates } from "@/lib/whatsapp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    seatNo: z.string().min(1, "Seat No is required"),
    regNo: z.string().min(1),
    dateOfJoining: z.string().optional(), // ISO string
    address: z.string().min(3, "Address is required").optional(),
    aadharNo: z.string().min(12).max(14).optional(),
    mobile: z.string().min(10).max(15).optional(),
    guardianName: z.string().optional(),
    guardianMobile: z.string().min(10).max(15).optional(),
    gender: z.enum(["male", "female", "other"]).default("male"),
    seasonalFees: z.coerce.number().nonnegative().default(500),
    feesDeposited: z.coerce.number().nonnegative().default(0),
    isEnrolled: z.boolean().default(true),
    membershipMonths: z.coerce.number().int().positive().default(1),
    paymentMethod: z.enum(["cash", "upi", "card"]).default("cash"),
});

export type NewStudentInput = z.infer<typeof schema>;
type NewStudentFormInput = z.input<typeof schema>;

export default function StudentsNew({ embedded = false }: { embedded?: boolean }) {
    const { toast } = useToast();
    const nav = useNavigate();
    const [registeredStudent, setRegisteredStudent] = useState<{ 
        id: string, 
        name: string, 
        phone: string, 
        seat: string, 
        validity: string,
        regNo: string,
        joiningDate: string,
        monthlyRate: string,
        deposited: string,
        pending: string,
        period: string
    } | null>(null);
    const defaults = useMemo(() => ({
        membershipMonths: 1,
        seasonalFees: 500,
        feesDeposited: 0,
        gender: "male" as const,
        isEnrolled: true,
        paymentMethod: "cash" as const,
    }), []);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<NewStudentFormInput, unknown, NewStudentInput>({
        resolver: zodResolver(schema),
        defaultValues: defaults,
    });

    useEffect(() => {
        setValue("dateOfJoining", new Date().toISOString().slice(0, 10));
    }, [setValue]);

    useEffect(() => {
        nextRegNo().then((reg) => setValue("regNo", reg));
    }, [setValue]);

    // Pre-fill from draft if redirected from Drafts tab
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("cl.draftToRegister");
            if (!raw) return;
            const draft = JSON.parse(raw);
            if (draft.name) setValue("name", draft.name);
            if (draft.mobileNo) setValue("mobile", draft.mobileNo);
            if (draft.seatNo) setValue("seatNo", draft.seatNo);
            // Store draft ID so we can delete it after successful registration
            sessionStorage.setItem("cl.draftId", draft.id || "");
            sessionStorage.removeItem("cl.draftToRegister");
        } catch {}
    }, [setValue]);

    const watchedName = watch("name");
    const watchedSeat = watch("seatNo");
    const watchedReg = watch("regNo");
    const watchedJoiningDate = watch("dateOfJoining");
    const watchedSeasonalFees = watch("seasonalFees") as number;
    const watchedFeesDeposited = watch("feesDeposited") as number;
    const watchedMembershipMonths = watch("membershipMonths") as number;

    const resolvedMembershipMonths = useMemo(() => {
        return Number(watchedMembershipMonths) || 1;
    }, [watchedMembershipMonths]);

    const [isCheckingSeat, setIsCheckingSeat] = useState(false);
    const [seatStatus, setSeatStatus] = useState<"available" | "taken" | "checking" | null>(null);

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

    const activeUntilPreview = useMemo(() => {
        if (!watchedJoiningDate) return null;
        try {
            const [y, m, d] = watchedJoiningDate.slice(0, 10).split("-").map(Number);
            if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
            const base = new Date(y, m - 1, d);
            const months = resolvedMembershipMonths;
            const result = new Date(base);
            const targetMonth = result.getMonth() + months;
            result.setMonth(targetMonth);
            if (result.getMonth() > (targetMonth % 12)) result.setDate(0);
            return result;
        } catch { return null; }
    }, [watchedJoiningDate, resolvedMembershipMonths]);

    const onSubmit = async (data: NewStudentInput) => {
        try {
            // 1. Create the student record with 0 initial deposit to avoid double-counting
            const student = await createStudent({
                name: data.name.trim(),
                seatNo: data.seatNo,
                address: data.address,
                aadharNo: data.aadharNo,
                dateOfJoining: (data.dateOfJoining || new Date().toISOString()).slice(0, 10),
                mobileNo: data.mobile,
                guardianName: data.guardianName,
                guardianMobile: data.guardianMobile,
                gender: data.gender.toUpperCase(),
                seasonalFees: data.seasonalFees,
                feesDeposited: 0, // Explicitly 0 here
            });

            // 2. Process the formal membership payment
            if (data.feesDeposited > 0 || data.membershipMonths > 0) {
                const seasonal = data.seasonalFees;
                let months: number;
                let amount: number;
                
                if (data.feesDeposited > 0) {
                    months = data.membershipMonths;
                    amount = data.feesDeposited;
                } else {
                    months = data.membershipMonths;
                    amount = seasonal * months;
                }

                await renewMembership(student.id, {
                    months,
                    amount,
                    method: data.paymentMethod && ["CASH", "UPI", "CARD"].includes(data.paymentMethod.toUpperCase())
                        ? (data.paymentMethod.toUpperCase() as "CASH" | "UPI" | "CARD")
                        : "CASH",
                    note: "Initial Enrollment Payment",
                    dateOfJoining: (data.dateOfJoining || new Date().toISOString()).slice(0, 10)
                });

                // Update metadata for accurate validity tracking in UI and cumulative fees
                setStudentMeta(student.id, { 
                    currentValidityMonths: months,
                    feesDeposited: amount 
                });
            }

            // If this was from a draft, clean it up
            const draftId = sessionStorage.getItem("cl.draftId");
            if (draftId) {
                await deleteDraft(draftId);
                sessionStorage.removeItem("cl.draftId");
            }


            const activeUntil = activeUntilPreview ? format(activeUntilPreview, "dd MMM, yyyy") : "N/A";
            const joiningDateStr = data.dateOfJoining ? format(new Date(data.dateOfJoining), "dd MMM, yyyy") : format(new Date(), "dd MMM, yyyy");
            
            setRegisteredStudent({
                id: student.id,
                name: data.name,
                phone: data.mobile || "",
                seat: data.seatNo,
                validity: activeUntil,
                regNo: student.regNo,
                joiningDate: joiningDateStr,
                monthlyRate: `₹${data.seasonalFees.toLocaleString("en-IN")}`,
                deposited: `₹${data.feesDeposited.toLocaleString("en-IN")}`,
                pending: `₹${Math.max(0, data.seasonalFees - data.feesDeposited).toLocaleString("en-IN")}`,
                period: `${resolvedMembershipMonths} Month(s)`
            });

            toast({ title: "Registration Successful", description: `${data.name} is now a member with correct validity.` });
            // nav(embedded ? "/students?tab=all" : "/students"); // Handled by dialog close
        } catch (e: any) {
            const message = e?.response?.data?.message || e.message || String(e);
            toast({ title: "Registration Failed", description: message, variant: "destructive" });
        }
    };

    return (
        <div className={cn("flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000", embedded && "pb-6")}>
            {!embedded && (
              <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                    <Gem className="h-4 w-4" />
                    Premium Onboarding
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Add New Student</h1>
                  <p className="text-slate-500 font-medium max-w-xl">Initialize a high-class membership record with automated enrollment and ID generation.</p>
              </div>
            )}

            {/* Mobile Preview */}
            <div className="lg:hidden">
              <RegistrationSummaryCard 
                name={watchedName} 
                seat={watchedSeat} 
                joiningDate={watchedJoiningDate} 
                months={resolvedMembershipMonths} 
                activeUntil={activeUntilPreview} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200/60 shadow-2xl shadow-slate-200/40 bg-white/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-8">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <UserPlus className="h-6 w-6 text-primary" />
                            Enrollment Portal
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium italic">Complete the verified registration protocol below.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                            {/* Personal Information */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Identity Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Legal Name</Label>
                                        <Input placeholder="e.g. Aryan Malhotra" className="h-12 rounded-2xl border-slate-200" {...register("name")} />
                                        {errors.name && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Aadhar Identification</Label>
                                        <div className="relative">
                                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                          <Input placeholder="12-digit UID" className="h-12 pl-10 rounded-2xl border-slate-200" {...register("aadharNo")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Gender Specification</Label>
                                        <Select defaultValue={"male"} onValueChange={(v) => setValue("gender", v as any)}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 font-medium">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male Member</SelectItem>
                                                <SelectItem value="female">Female Member</SelectItem>
                                                <SelectItem value="other">Universal/Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Primary Mobile No</Label>
                                        <div className="relative">
                                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                          <Input placeholder="+91 00000 00000" className="h-12 pl-10 rounded-2xl border-slate-200" {...register("mobile")} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Verification & Contact</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Permanent Residential Address</Label>
                                        <Textarea placeholder="Full address details for the student record..." className="rounded-[1.5rem] border-slate-200 bg-slate-50/30" rows={3} {...register("address")} />
                                        {errors.address && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.address.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Guardian / Parent Name</Label>
                                        <Input placeholder="Authority Contact Name" className="h-12 rounded-2xl border-slate-200" {...register("guardianName")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Guardian Mobile</Label>
                                        <Input placeholder="Emergency mobile no..." className="h-12 rounded-2xl border-slate-200" {...register("guardianMobile")} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">Membership Initialization</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Reg ID (Auto)</Label>
                                        <div className="h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center px-4 font-mono text-sm font-bold text-slate-400">
                                            {watchedReg || "Loading..."}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Seat Assignment</Label>
                                        <div className="relative">
                                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                          <Input placeholder="e.g. S-22" className="h-12 pl-10 pr-12 rounded-2xl border-slate-200 font-bold" {...register("seatNo")} />
                                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {seatStatus === "checking" && <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                            {seatStatus === "available" && <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in duration-300" />}
                                            {seatStatus === "taken" && (
                                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-500 animate-in slide-in-from-right-2 duration-300">
                                                <AlertCircle className="h-3 w-3" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Taken</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {errors.seatNo && <p className="text-[10px] font-bold text-red-500 pl-1">{errors.seatNo.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Start Date</Label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-2xl border-slate-200"
                                            value={watch("dateOfJoining")?.slice(0, 10) || ""}
                                            onChange={(e) => setValue("dateOfJoining", `${e.target.value}T00:00:00Z`)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Monthly Rate (₹)</Label>
                                        <Input type="number" className="h-12 rounded-2xl border-slate-200 font-black" {...register("seasonalFees", { valueAsNumber: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Admission Fee Submitted (₹)</Label>
                                        <Input type="number" className="h-12 rounded-2xl border-slate-200 font-black text-emerald-600" {...register("feesDeposited", { valueAsNumber: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Payment Channel</Label>
                                        <Select defaultValue={"cash"} onValueChange={(v) => setValue("paymentMethod", v as any)}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-200 font-bold capitalize">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Hard Cash</SelectItem>
                                                <SelectItem value="upi">UPI / Online</SelectItem>
                                                <SelectItem value="card">Card Payment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Membership Duration (Months)</Label>
                                        <div className="relative">
                                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                          <Input type="number" min="1" className="h-12 pl-10 rounded-2xl border-slate-200 font-black text-primary" {...register("membershipMonths", { valueAsNumber: true })} />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground pl-1">Sets the validity period for this payment.</p>
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-8">
                                <div className="flex items-center gap-4">
                                  <Switch checked={watch("isEnrolled")} onCheckedChange={(v) => setValue("isEnrolled", v)} className="data-[state=checked]:bg-emerald-500" />
                                  <div className="flex flex-col">
                                    <Label className="font-bold text-slate-800">Assign Instant Enrollment</Label>
                                    <span className="text-xs text-slate-400">Mark as active member immediately upon registration.</span>
                                  </div>
                                </div>
                                <Button 
                                  type="submit" 
                                  disabled={isSubmitting} 
                                  className="h-16 px-12 rounded-[1.5rem] bg-slate-950 text-white font-black text-lg gap-3 shadow-2xl hover:bg-primary transition-all active:scale-95"
                                >
                                  {isSubmitting ? "Finalizing..." : "Complete Registration"}
                                  <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Desktop Summary Sidebar */}
                <div className="hidden lg:block space-y-6">
                    <div className="sticky top-24">
                        <RegistrationSummaryCard 
                            name={watchedName} 
                            seat={watchedSeat} 
                            joiningDate={watchedJoiningDate} 
                            months={resolvedMembershipMonths} 
                            activeUntil={activeUntilPreview} 
                        />
                    </div>
                    <div className="p-4 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-1 text-center">
                        <ShieldCheck className="h-6 w-6 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Data Encryption</span>
                        <p className="text-[9px] text-slate-300">All student records are encrypted and stored in accordance with local data protection regulations.</p>
                    </div>
                </div>
            </div>

            {/* Success Dialog with WhatsApp Options */}
            <Dialog open={!!registeredStudent} onOpenChange={(o) => {
                if (!o) {
                    setRegisteredStudent(null);
                    nav(embedded ? "/students?tab=all" : "/students");
                }
            }}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-white">Registration Complete!</DialogTitle>
                            <DialogDescription className="text-emerald-50 opacity-90 font-medium mt-1">
                                {registeredStudent?.name} has been successfully enrolled.
                            </DialogDescription>
                        </div>
                    </div>
                    
                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Send confirmation to student</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <Button 
                                    onClick={() => {
                                        if (!registeredStudent) return;
                                        sendWhatsApp({ 
                                            phone: registeredStudent.phone, 
                                            message: waTemplates.registration({
                                                name: registeredStudent.name,
                                                regNo: registeredStudent.regNo,
                                                seatNo: registeredStudent.seat,
                                                monthlyRate: registeredStudent.monthlyRate,
                                                deposited: registeredStudent.deposited,
                                                pending: registeredStudent.pending,
                                                period: registeredStudent.period,
                                                joiningDate: registeredStudent.joiningDate,
                                                validity: registeredStudent.validity
                                            })
                                        });
                                    }}
                                    className="h-16 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black flex items-center justify-center gap-3 border-none shadow-lg shadow-emerald-100"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    Send Reg. Receipt
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => {
                                        if (!registeredStudent) return;
                                        sendWhatsApp({ 
                                            phone: registeredStudent.phone, 
                                            message: waTemplates.welcome(registeredStudent.name) 
                                        });
                                    }}
                                    className="h-16 rounded-2xl border-slate-200 font-bold flex items-center justify-center gap-3 hover:bg-slate-50"
                                >
                                    <User className="h-5 w-5 text-slate-400" />
                                    Send Welcome Msg
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 bg-white">
                        <Button 
                            variant="ghost" 
                            className="w-full h-12 rounded-xl font-bold text-slate-400"
                            onClick={() => {
                                setRegisteredStudent(null);
                                nav(embedded ? "/students?tab=all" : "/students");
                            }}
                        >
                            Done, Go to Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RegistrationSummaryCard({ name, seat, joiningDate, months, activeUntil }: any) {
    return (
        <Card className="rounded-[2.5rem] border-emerald-100 bg-emerald-50/20 shadow-xl overflow-hidden">
            <CardHeader className="p-6 bg-emerald-600 text-white">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Registration Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="h-20 w-20 rounded-[2rem] bg-white shadow-inner flex items-center justify-center text-3xl font-black text-emerald-600 mb-3 border border-emerald-100">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <h4 className="text-xl font-black text-slate-900 truncate w-full">{name || "New Student"}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Preview Card</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-y border-emerald-100/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100/50">
                          <Hash className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Seat Assignment</span>
                      </div>
                      <span className="text-sm font-black text-slate-800">{seat || "PENDING"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-emerald-100/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100/50">
                          <Calendar className="h-3 w-3 text-emerald-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Start Date</span>
                      </div>
                      <span className="text-sm font-black text-slate-800">{joiningDate ? format(new Date(joiningDate), "dd MMM, yyyy") : "TBD"}</span>
                  </div>
                  <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase">Membership Period</span>
                      <Badge className="bg-emerald-500 text-white font-black px-3">{months} Month(s)</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Valid Until</span>
                      <span className="text-base font-black text-emerald-600">
                        {activeUntil ? format(activeUntil, "dd MMM, yyyy") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
            </CardContent>
        </Card>
    );
}
