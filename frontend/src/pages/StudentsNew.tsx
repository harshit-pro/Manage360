import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { createStudent, nextRegNo, nextStudentCode, renewMembership } from "@/lib/students";
import { useNavigate } from "react-router-dom";

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

export default function StudentsNew() {
    const { toast } = useToast();
    const nav = useNavigate();
    const defaults = useMemo(() => ({
        membershipMonths: 1,
        seasonalFees: 500,
        feesDeposited: 0,
        gender: "male" as const,
        isEnrolled: true,
        paymentMethod: "cash" as const,
    }), []);

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<NewStudentInput>({
        resolver: zodResolver(schema),
        defaultValues: defaults,
    });

    useEffect(() => {
        // default Date of joining as today
        setValue("dateOfJoining", new Date().toISOString());
        // Load next reg no
        nextRegNo().then((reg) => setValue("regNo", reg));
    }, [setValue]);

    const onSubmit = async (data: NewStudentInput) => {
        try {
            // Create student via API – send fields matching backend StudentCreateRequest DTO
            const student = await createStudent({
                name: data.name.trim(),
                seatNo: data.seatNo,
                address: data.address,
                aadharNo: data.aadharNo,
                dateOfJoining: (data.dateOfJoining || new Date().toISOString()).slice(0, 10),
                mobileNo: data.mobile,
                guardianName: data.guardianName,
                guardianMobile: data.guardianMobile,
                gender: data.gender.toUpperCase(), // Enum: MALE, FEMALE, OTHER
                seasonalFees: data.seasonalFees,
                feesDeposited: data.feesDeposited,
            });

            // Initial membership (optional but helpful)
            if (data.membershipMonths > 0) {
                await renewMembership(student.id, {
                    months: data.membershipMonths,
                    amount: data.feesDeposited > 0 ? data.feesDeposited : data.seasonalFees,
                    method: data.paymentMethod && ["CASH", "UPI", "CARD"].includes(data.paymentMethod.toUpperCase())
                        ? (data.paymentMethod.toUpperCase() as "CASH" | "UPI" | "CARD")
                        : "CASH",
                    note: "Initial Enrollment"
                });
            }

            toast({ title: "Student added", description: `${data.name} has been registered successfully.` });
            nav("/students");
        } catch (e: any) {
            const message = e?.response?.data?.message || e.message || String(e);
            toast({ title: "Could not add student", description: message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Add New Student</h1>

            <Card className="shadow-md">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Identity */}
                        <section>
                            <h2 className="text-lg font-medium mb-4">Identity</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="e.g., Rohan Kumar" {...register("name")} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="aadharNo">Aadhar No</Label>
                                    <Input id="aadharNo" placeholder="12-digit number" {...register("aadharNo")} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select defaultValue={defaults.gender} onValueChange={(v) => setValue("gender", v as any)}>
                                        <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </section>

                        {/* Institute Details */}
                        <section>
                            <h2 className="text-lg font-medium mb-4">Institute Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="regNo">Reg No</Label>
                                    <Input id="regNo" placeholder="REG-0001" {...register("regNo")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seatNo">Seat No</Label>
                                    <Input id="seatNo" placeholder="S-01" {...register("seatNo")} />
                                    {errors.seatNo && <p className="text-sm text-destructive">{errors.seatNo.message}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="dateOfJoining">Date of Joining</Label>
                                    <Input id="dateOfJoining" type="date" value={watch("dateOfJoining")?.slice(0, 10) || ""} onChange={(e) => setValue("dateOfJoining", new Date(e.target.value).toISOString())} />
                                </div>
                            </div>
                        </section>

                        {/* Contacts */}
                        <section>
                            <h2 className="text-lg font-medium mb-4">Contacts</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" placeholder="House no, street, area, city, pincode" {...register("address")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input id="mobile" placeholder="10-digit mobile" {...register("mobile")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardianName">Guardian's Name</Label>
                                    <Input id="guardianName" placeholder="Parent/Guardian name" {...register("guardianName")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guardianMobile">Guardian's Mobile</Label>
                                    <Input id="guardianMobile" placeholder="10-digit mobile" {...register("guardianMobile")} />
                                </div>
                            </div>
                        </section>

                        {/* Fees & Enrollment */}
                        <section>
                            <h2 className="text-lg font-medium mb-4">Fees & Enrollment</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="seasonalFees">Seasonal Fees</Label>
                                    <Input id="seasonalFees" type="number" min={0} {...register("seasonalFees", { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="feesDeposited">Fees Deposited</Label>
                                    <Input id="feesDeposited" type="number" min={0} {...register("feesDeposited", { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="membershipMonths">Membership Months</Label>
                                    <Input id="membershipMonths" type="number" min={1} {...register("membershipMonths", { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select defaultValue={defaults.paymentMethod} onValueChange={(v) => setValue("paymentMethod", v as any)}>
                                        <SelectTrigger id="paymentMethod"><SelectValue placeholder="Method" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-3 md:col-span-4">
                                    <Switch id="isEnrolled" checked={watch("isEnrolled")} onCheckedChange={(v) => setValue("isEnrolled", v)} />
                                    <Label htmlFor="isEnrolled">Currently Enrolled</Label>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>Add Student</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
