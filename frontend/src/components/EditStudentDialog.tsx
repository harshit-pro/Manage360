import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, CalendarClock, CheckCircle2 } from "lucide-react";
import { format, addMonths, parseISO } from "date-fns";
import { Student, updateStudent, getStudent, toggleEnrollment, renewMembership, setStudentMeta } from "@/lib/students";

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

type EditForm = z.infer<typeof schema>;

interface Props {
    open: boolean;
    student: Student | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (updated: Student) => void;
    isReAdmission?: boolean;
}

export default function EditStudentDialog({ open, student, onOpenChange, onSaved, isReAdmission = false }: Props) {
    const { toast } = useToast();

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditForm>({
        resolver: zodResolver(schema) as Resolver<EditForm>,
    });

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
                // ALWAYS default to 0 for the "Current Payment" field.
                // This ensures the user enters the fee for the CURRENT period/renewal.
                feesDeposited: 0,
            });
        }
    }, [student, reset, isReAdmission]);

    const watchedJoiningDate = watch("dateOfJoining");
    const watchedSeasonal = watch("seasonalFees") || 0;
    const watchedDeposited = watch("feesDeposited") || 0;

    // VALIDITY CALCULATION: Derived ONLY from the current form input (New Payment)
    const durationInfo = (() => {
        if (!watchedJoiningDate || watchedSeasonal <= 0) return null;
        // The user specifically wants validity based ON THE CURRENTLY SUBMITTED FEES
        const months = Math.floor(watchedDeposited / watchedSeasonal);
        if (months <= 0) return null;
        try {
            const joining = parseISO(watchedJoiningDate);
            const activeUntil = addMonths(joining, months);
            return { months, activeUntil };
        } catch { return null; }
    })();

    const onSubmit = async (data: EditForm) => {
        if (!student) return;
        const seasonal = Number(data.seasonalFees) || 0;
        const deposited = Number(data.feesDeposited) || 0;
        const joiningDate = data.dateOfJoining || new Date().toISOString().slice(0, 10);
        const months = Math.floor(deposited / seasonal) || 1;

        try {
            // 0. Update cumulative session months and total fees for local validity override
            const existingMonths = student.meta?.currentValidityMonths || 0;
            const existingFees = student.meta?.feesDeposited || student.feesDeposited || 0;

            if (isReAdmission) {
               // Re-admission starts a fresh session with a reset Joining Date
               setStudentMeta(student.id, { 
                   currentValidityMonths: months,
                   feesDeposited: existingFees + deposited
               });
            } else if (deposited > 0) {
               // Normal payment/renewal adds to the existing session count
               setStudentMeta(student.id, { 
                   currentValidityMonths: existingMonths + months,
                   feesDeposited: existingFees + deposited
               });
            }

            // 1. Update basic profile details (Name, Seat, etc.)
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
                // Explicitly set enrolled status if re-admitting to avoid backend defaults
                ...(isReAdmission ? { isEnrolled: true } : {}),
            });

            // 2. Clear membership state if re-admitting to ensure a fresh cycle
            if (isReAdmission) {
                await toggleEnrollment(student.id, true);
                // Minor delay to allow backend to process the status change
                await new Promise(r => setTimeout(r, 600));
            }

            // 3. Process the financial duration (Renewal)
            if (deposited > 0) {
                await renewMembership(student.id, {
                    months,
                    amount: deposited,
                    method: "CASH",
                    note: isReAdmission ? "Re-Admission Finalization" : "Renewal",
                    dateOfJoining: joiningDate
                });
                // Small delay after renewal too
                await new Promise(r => setTimeout(r, 400));
            }

            // 4. Final verification of the student state
            const updated = await getStudent(student.id);

            toast({ 
                title: isReAdmission ? "Re-Admission Successful" : "Profile Updated", 
                description: `Student is now valid until ${updated.activeUntil ? format(parseISO(updated.activeUntil.slice(0, 10)), "dd MMM, yyyy") : "N/A"}.` 
            });
            onSaved(updated);
            onOpenChange(false);
        } catch (e: any) {
            const message = e?.response?.data?.message || e.message || "Failed to finalize admission";
            toast({ title: "Operation Error", description: message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">
                        {isReAdmission ? "Re-Admission Protocol" : "Update Student Profile"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identity</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name *</Label>
                                <Input id="edit-name" {...register("name")} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-gender">Gender *</Label>
                                <Select value={watch("gender")} onValueChange={(v) => setValue("gender", v as any)}>
                                    <SelectTrigger id="edit-gender"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-aadharNo">Aadhar No</Label>
                                <Input id="edit-aadharNo" {...register("aadharNo")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfJoining">Joining Date</Label>
                                <Input id="dateOfJoining" type="date" {...register("dateOfJoining")} />
                                {durationInfo && (
                                    <div className="mt-2 space-y-2 animate-in slide-in-from-top-2">
                                        <div className="text-[10px] flex items-center gap-2 text-primary bg-primary/5 p-2 rounded-xl border border-primary/10">
                                            <CalendarClock className="h-3 w-3" />
                                            <span>Period: <strong>{durationInfo.months} Month(s)</strong></span>
                                        </div>
                                        <div className="text-[10px] flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Valid Until: <strong>{format(durationInfo.activeUntil, "dd MMM yyyy")}</strong></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Financial & Enrollment</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-seatNo">Seat No *</Label>
                                <Input id="edit-seatNo" {...register("seatNo")} />
                                {errors.seatNo && <p className="text-xs text-destructive">{errors.seatNo.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-seasonalFees">Seasonal Fees (₹ / mo)</Label>
                                <Input id="edit-seasonalFees" type="number" {...register("seasonalFees")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-feesDeposited">Current Fee Submitted (₹)</Label>
                                <Input id="edit-feesDeposited" type="number" placeholder="e.g. 600" className="text-emerald-600 font-bold" {...register("feesDeposited")} />
                                <p className="text-[9px] text-muted-foreground italic">Validity will be calculated based ONLY on this current payment.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Textarea id="edit-address" rows={2} {...register("address")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-mobileNo">Mobile</Label>
                                <Input id="edit-mobileNo" {...register("mobileNo")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-guardianName">Guardian</Label>
                                <Input id="edit-guardianName" {...register("guardianName")} />
                            </div>
                        </div>
                    </section>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white font-bold h-12 px-8 rounded-2xl">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finalizing...</> : <><Save className="mr-2 h-4 w-4" />Save Admission</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
