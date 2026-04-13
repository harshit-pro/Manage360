import { useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format, addMonths, parseISO } from "date-fns";
import { Student, updateStudent, getStudent, toggleEnrollment, renewMembership, setStudentMeta, isSeatAvailable } from "@/lib/students";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sendWhatsApp, waTemplates } from "@/lib/whatsapp";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Loader2,
    Save,
    Gem,
    User,
    Hash,
    Smartphone,
    MapPin,
    AlertCircle,
    Calendar,
    Wallet,
    ShieldCheck,
    Clock,
    UserPlus,
    Users,
    RefreshCw,
    MessageSquare,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

const schema = z.object({
    name: z.string().min(2, "Name is required"),
    seatNo: z.string().min(1, "Seat No is required"),
    mobileNo: z.string().min(10).max(15).optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    aadharNo: z.string().optional().or(z.literal("")),
    guardianName: z.string().optional().or(z.literal("")),
    guardianMobile: z.string().optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    dateOfJoining: z.string().optional(),
    seasonalFees: z.coerce.number().nonnegative().optional(),
    feesDeposited: z.coerce.number().nonnegative().optional(),
});

type EditFormOutput = z.output<typeof schema>;
type EditFormInput = z.input<typeof schema>;

interface Props {
    open: boolean;
    student: Student | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (updated: Student) => void;
    isReAdmission?: boolean;
}

export default function EditStudentDialog({ open, student, onOpenChange, onSaved, isReAdmission = false }: Props) {
    const { toast } = useToast();
    const [showSuccess, setShowSuccess] = useState<{ 
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

    const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<EditFormInput, any, EditFormOutput>({
        resolver: zodResolver(schema),
    });

    const [seatStatus, setSeatStatus] = useState<"available" | "taken" | "checking" | null>(null);
    const watchedSeat = watch("seatNo");

    useEffect(() => {
        if (!watchedSeat || watchedSeat.trim().length === 0 || (student && watchedSeat === student.seatNo)) {
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
    }, [watchedSeat, student]);

    useEffect(() => {
        if (student) {
            reset({
                name: student.name || "",
                seatNo: student.seatNo || "",
                mobileNo: student.mobileNo || "",
                address: student.address || "",
                aadharNo: student.aadharNo || "",
                guardianName: student.guardianName || "",
                guardianMobile: student.guardianMobile || "",
                gender: (student.gender?.toUpperCase() as "MALE" | "FEMALE" | "OTHER") || "MALE",
                dateOfJoining: isReAdmission 
                    ? new Date().toISOString().slice(0, 10) 
                    : (student.dateOfJoining?.slice(0, 10) || ""),
                seasonalFees: student.seasonalFees ?? 0,
                feesDeposited: 0,
            });
        }
    }, [student, reset, isReAdmission]);

    const watchedJoiningDate = watch("dateOfJoining");
    const watchedSeasonal = Number(watch("seasonalFees")) || 0;
    const watchedDeposited = Number(watch("feesDeposited")) || 0;

    const durationInfo = (() => {
        if (!watchedJoiningDate || watchedSeasonal <= 0) return null;
        const months = Math.floor(watchedDeposited / watchedSeasonal);
        if (months <= 0) return null;
        try {
            const joining = parseISO(watchedJoiningDate);
            const activeUntil = addMonths(joining, months);
            return { months, activeUntil };
        } catch { return null; }
    })();

    const onSubmit = async (data: EditFormOutput) => {
        if (!student) return;
        const seasonal = Number(data.seasonalFees) || 0;
        const deposited = Number(data.feesDeposited) || 0;
        const joiningDate = data.dateOfJoining || new Date().toISOString().slice(0, 10);
        const months = Math.floor(deposited / seasonal) || 1;

        try {
            const existingMonths = student.meta?.currentValidityMonths || 0;
            const existingFees = student.meta?.feesDeposited || student.feesDeposited || 0;

            if (isReAdmission) {
               setStudentMeta(student.id, { 
                   currentValidityMonths: months,
                   feesDeposited: existingFees + deposited
               });
            } else if (deposited > 0) {
               setStudentMeta(student.id, { 
                   currentValidityMonths: existingMonths + months,
                   feesDeposited: existingFees + deposited
               });
            }

            await updateStudent(student.id, {
                name: data.name,
                seatNo: data.seatNo,
                mobileNo: data.mobileNo || undefined,
                address: data.address || undefined,
                aadharNo: data.aadharNo || undefined,
                guardianName: data.guardianName || undefined,
                guardianMobile: data.guardianMobile || undefined,
                gender: data.gender,
                seasonalFees: seasonal,
                dateOfJoining: joiningDate,
                ...(isReAdmission ? { isEnrolled: true } : {}),
            });

            if (isReAdmission) {
                await toggleEnrollment(student.id, true);
                await new Promise(r => setTimeout(r, 600));
            }

            if (deposited > 0) {
                await renewMembership(student.id, {
                    months,
                    amount: deposited,
                    method: "CASH",
                    note: isReAdmission ? "Re-Admission Finalization" : "Renewal",
                    dateOfJoining: joiningDate
                });
                await new Promise(r => setTimeout(r, 400));
            }

            const updated = await getStudent(student.id);
            const activeUntilStr = updated.activeUntil ? format(parseISO(updated.activeUntil.slice(0, 10)), "dd MMM, yyyy") : "N/A";

            if (deposited > 0 || isReAdmission) {
                setShowSuccess({
                    name: updated.name,
                    phone: updated.mobileNo || "",
                    amount: `₹${deposited.toLocaleString("en-IN")}`,
                    validity: activeUntilStr,
                    isReAdmission,
                    regNo: updated.regNo,
                    seatNo: updated.seatNo,
                    monthlyRate: `₹${seasonal.toLocaleString("en-IN")}`,
                    pending: `₹${Math.max(0, seasonal - deposited).toLocaleString("en-IN")}`,
                    period: `${months} Month(s)`,
                    joiningDate: format(new Date(joiningDate), "dd MMM, yyyy")
                });
            } else {
                toast({ title: "Profile Updated", description: "The student profile has been synchronized successfully." });
                onSaved(updated);
                onOpenChange(false);
            }
        } catch (e: any) {
            const message = e?.response?.data?.message || e.message || "Failed to finalize admission";
            toast({ title: "Operation Error", description: message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
                <DialogHeader className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
                    <div className="absolute right-0 top-0 h-full w-2 bg-primary" />
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                            <Gem className="h-4 w-4" />
                            Elite Admission
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <UserPlus className="h-8 w-8 text-primary" />
                            {isReAdmission ? "Re-Admission Protocol" : "Update Profile"}
                        </DialogTitle>
                        <p className="text-slate-400 font-medium italic text-sm">Synchronizing membership records with central core.</p>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Identity Details</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Legal Name *</Label>
                                <Input id="edit-name" className="h-12 rounded-2xl border-slate-200" {...register("name")} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-gender" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Gender *</Label>
                                <Select value={watch("gender")} onValueChange={(v) => setValue("gender", v as any)}>
                                    <SelectTrigger id="edit-gender" className="h-12 rounded-2xl border-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-2xl shadow-xl">
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-aadharNo" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Aadhar Verification</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input id="edit-aadharNo" className="h-12 pl-11 rounded-2xl border-slate-200" placeholder="12-digit UID" {...register("aadharNo")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfJoining" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Admission Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input id="dateOfJoining" type="date" className="h-12 pl-11 rounded-2xl border-slate-200" {...register("dateOfJoining")} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Financial & Placement</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="edit-seatNo" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Assigned Seat *</Label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input id="edit-seatNo" className="h-12 pl-11 pr-12 rounded-2xl border-slate-200 font-bold" {...register("seatNo")} />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {seatStatus === "checking" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                                        {seatStatus === "available" && <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in" />}
                                        {seatStatus === "taken" && <AlertCircle className="h-5 w-5 text-red-500 animate-in slide-in-from-right-2" />}
                                    </div>
                                </div>
                                {errors.seatNo && <p className="text-xs text-destructive">{errors.seatNo.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-seasonalFees" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Seasonal Fees (₹ / mo)</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <Input id="edit-seasonalFees" type="number" className="h-12 pl-8 rounded-2xl border-slate-200 font-black" {...register("seasonalFees")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-feesDeposited" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Current Fee Submitted (₹)</Label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₹</span>
                                    <Input id="edit-feesDeposited" type="number" placeholder="e.g. 600" className="h-12 pl-8 rounded-2xl border-slate-200 font-black text-emerald-600 bg-emerald-50/5 focus:bg-white transition-all" {...register("feesDeposited")} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                {durationInfo ? (
                                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 h-full w-1.5 bg-primary" />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-tighter text-primary">Calculated Validity</p>
                                                <p className="text-sm font-black text-slate-900">{format(durationInfo.activeUntil, "dd MMM, yyyy")}</p>
                                            </div>
                                            <Clock className="h-6 w-6 text-primary/20" />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic pl-2">Enter deposit to calculate period...</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Contact Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="edit-address" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Residency Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
                                    <Textarea id="edit-address" className="pl-11 rounded-2xl border-slate-200 min-h-[80px]" rows={2} {...register("address")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-mobileNo" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Primary Mobile</Label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input id="edit-mobileNo" className="h-12 pl-11 rounded-2xl border-slate-200" {...register("mobileNo")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-guardianName" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Emergency Contact (Guardian)</Label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input id="edit-guardianName" className="h-12 pl-11 rounded-2xl border-slate-200" placeholder="Guardian Name" {...register("guardianName")} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <DialogFooter className="gap-3 pt-6 border-t border-slate-100">
                        <Button type="button" variant="ghost" className="h-13 rounded-2xl px-8 font-bold text-slate-400 mt-2 sm:mt-0" onClick={() => onOpenChange(false)}>Discard</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none h-13 min-w-[200px] rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-200/50 hover:bg-primary transition-all active:scale-[0.98]">
                            {isSubmitting ? (
                              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
                            ) : (
                              <>
                                <Save className="mr-2 h-5 w-5" />
                                {isReAdmission ? "Finalize Re-admission" : "Save Profile"}
                              </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>

                {/* Success Receipt Integration */}
                <Dialog open={!!showSuccess} onOpenChange={(o) => {
                    if (!o) {
                        setShowSuccess(null);
                        // Trigger close of main dialog after success closes
                        if (student) {
                           getStudent(student.id).then(updated => {
                               onSaved(updated);
                               onOpenChange(false);
                           });
                        }
                    }
                }}>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl z-[60]">
                        <div className="bg-primary p-8 text-white relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                                    <RefreshCw className="h-10 w-10 text-primary" />
                                </div>
                                <DialogTitle className="text-2xl font-black text-white">
                                    {showSuccess?.isReAdmission ? "Re-admission Success!" : "Update Complete!"}
                                </DialogTitle>
                                <DialogDescription className="text-primary-foreground opacity-90 font-medium mt-1">
                                    {showSuccess?.name} is officially operational.
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 bg-white">
                            <div className="space-y-4">
                                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Membership Validity</span>
                                    <span className="text-xl font-black text-slate-900">{showSuccess?.validity}</span>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Send confirmation to student</h4>
                                    <Button
                                        onClick={() => {
                                            if (!showSuccess) return;
                                            const msgFunc = showSuccess.isReAdmission ? waTemplates.readmission : waTemplates.renewalSuccess;
                                            const params = showSuccess.isReAdmission
                                                ? {
                                                    name: showSuccess.name,
                                                    regNo: showSuccess.regNo!,
                                                    seatNo: showSuccess.seatNo!,
                                                    monthlyRate: showSuccess.monthlyRate!,
                                                    deposited: showSuccess.amount,
                                                    pending: showSuccess.pending!,
                                                    period: showSuccess.period!,
                                                    joiningDate: showSuccess.joiningDate!,
                                                    validity: showSuccess.validity
                                                }
                                                : [showSuccess.name, showSuccess.amount, showSuccess.validity];

                                            sendWhatsApp({
                                                phone: showSuccess.phone,
                                                message: typeof msgFunc === 'function' ? (msgFunc as any)(...(Array.isArray(params) ? params : [params])) : ""
                                            });
                                        }}
                                        className="w-full h-16 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black flex items-center justify-center gap-3 border-none shadow-lg shadow-emerald-100"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        {showSuccess?.isReAdmission ? "Send Welcome Back Receipt" : "Send Renewal Receipt"}
                                    </Button>
                                    
                                    <Button 
                                        variant="ghost" 
                                        className="w-full h-12 rounded-xl font-bold text-slate-400"
                                        onClick={() => {
                                            setShowSuccess(null);
                                            // Handle cleanup manually
                                            if (student) {
                                                getStudent(student.id).then(updated => {
                                                    onSaved(updated);
                                                    onOpenChange(false);
                                                });
                                            }
                                        }}
                                    >
                                        Skip & Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
