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
import { Loader2, Save, CalendarClock } from "lucide-react";
import { format, addMonths, differenceInCalendarMonths, parseISO } from "date-fns";
import { Student, updateStudent } from "@/lib/students";

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
});

type EditForm = z.infer<typeof schema>;

interface Props {
    open: boolean;
    student: Student | null;
    onOpenChange: (open: boolean) => void;
    onSaved: (updated: Student) => void;
}

export default function EditStudentDialog({ open, student, onOpenChange, onSaved }: Props) {
    const { toast } = useToast();

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<EditForm>({
        resolver: zodResolver(schema) as Resolver<EditForm>,
    });

    // Populate form when student changes
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
                dateOfJoining: student.dateOfJoining?.slice(0, 10) || "",
                seasonalFees: student.seasonalFees ?? undefined,
            });
        }
    }, [student, reset]);

    // Compute live 'Active Until' preview based on current dateOfJoining
    // Preserves the original membership duration in WHOLE MONTHS and applies it to the new joining date.
    const watchedJoiningDate = watch("dateOfJoining");
    const activeUntilPreview = (() => {
        if (!student || !watchedJoiningDate) return null;
        try {
            const newJoining = parseISO(watchedJoiningDate); // YYYY-MM-DD

            const originalJoining = student.dateOfJoining ? parseISO(student.dateOfJoining.slice(0, 10)) : null;
            const originalActiveUntil = student.activeUntil ? parseISO(student.activeUntil) : null;

            if (originalActiveUntil && originalJoining) {
                // Calculate whole months between original joining and original activeUntil
                let months = differenceInCalendarMonths(originalActiveUntil, originalJoining);

                // Adjust: if activeUntil day < joining day, difference overestimates by 1
                if (originalActiveUntil.getDate() < originalJoining.getDate()) {
                    months = Math.max(months - 1, 0);
                }

                // Apply the same duration to the new joining date (at least 1 month)
                return addMonths(newJoining, Math.max(months, 1));
            }
            return null;
        } catch {
            return null;
        }
    })();

    const onSubmit = async (data: EditForm) => {
        if (!student) return;
        try {
            const updated = await updateStudent(student.id, {
                name: data.name,
                seatNo: data.seatNo,
                mobileNo: data.mobileNo || undefined,
                address: data.address || undefined,
                aadharNo: data.aadharNo || undefined,
                guardianName: data.guardianName || undefined,
                guardianMobile: data.guardianMobile || undefined,
                gender: data.gender,
                dateOfJoining: data.dateOfJoining || undefined,
                seasonalFees: data.seasonalFees,
            });
            toast({ title: "Student updated", description: `${data.name}'s details have been saved.` });
            onSaved(updated);
            onOpenChange(false);
        } catch (e: any) {
            const message = e?.response?.data?.message || e.message || "Failed to update student";
            toast({ title: "Update failed", description: message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Edit Student Details
                    </DialogTitle>
                </DialogHeader>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6 pt-2">
                    {/* Identity */}
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
                                <Select
                                    value={watch("gender")}
                                    onValueChange={(v) => setValue("gender", v as "MALE" | "FEMALE" | "OTHER")}
                                >
                                    <SelectTrigger id="edit-gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-aadharNo">Aadhar No</Label>
                                <Input id="edit-aadharNo" placeholder="12-digit number" {...register("aadharNo")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                                <Input
                                    id="dateOfJoining"
                                    type="date"
                                    {...register("dateOfJoining")}
                                />
                                {activeUntilPreview && (
                                    <div className="mt-2 text-xs flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-md border border-emerald-100">
                                        <CalendarClock className="h-3 w-3" />
                                        <span>Active until: <strong>{format(activeUntilPreview, "dd-MMM-yyyy")}</strong></span>
                                        <span className="text-[10px] text-amber-600 font-medium">— recalculated from new joining date</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Library Details */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Library Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-seatNo">Seat No *</Label>
                                <Input id="edit-seatNo" {...register("seatNo")} />
                                {errors.seatNo && <p className="text-xs text-destructive">{errors.seatNo.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-seasonalFees">Seasonal Fees (₹)</Label>
                                <Input id="edit-seasonalFees" type="number" min={0} {...register("seasonalFees")} />
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Textarea id="edit-address" rows={2} placeholder="House no, street, city, pincode" {...register("address")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-mobileNo">Mobile</Label>
                                <Input id="edit-mobileNo" placeholder="10-digit number" {...register("mobileNo")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-guardianName">Guardian's Name</Label>
                                <Input id="edit-guardianName" {...register("guardianName")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-guardianMobile">Guardian's Mobile</Label>
                                <Input id="edit-guardianMobile" {...register("guardianMobile")} />
                            </div>
                        </div>
                    </section>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" />Save Changes</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
