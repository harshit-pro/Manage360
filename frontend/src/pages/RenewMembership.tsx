import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { listStudents, searchStudents, Student, renewMembership, membershipMonthsFromDeposit } from "@/lib/students";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Loader2 } from "lucide-react";

type FindForm = { email: string };
type RenewForm = { seasonalFees: string; feesDeposited: string; method: "cash" | "upi" | "card"; note?: string };

export default function RenewMembership() {
    // Demo data seeding removed


    const [query, setQuery] = useState("");
    const [refreshTick, setRefreshTick] = useState(0);
    const [methodByUser, setMethodByUser] = useState<Record<string, "cash" | "upi" | "card">>({});
    const [students, setStudents] = useState<Student[]>([]);
    // Per-row editable fee inputs and loading/paid state
    const [feeInputs, setFeeInputs] = useState<Record<string, { seasonalFees: string; feesDeposited: string }>>({});
    const [renewingIds, setRenewingIds] = useState<Set<string>>(new Set());
    const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchStudents = async () => {
            const data = query ? await searchStudents(query) : await listStudents();
            setStudents(data);
        };
        fetchStudents();
    }, [query, refreshTick]);

    // Only show expired or expiring within 5 days
    // Only show expired or expiring within 5 days
    // Note: 'daysLeft' logic needs to be calculated since API might not return it directly, or we check activeUntil
    const dueStudents = useMemo(
        () => students.filter((s) => s.isExpired || (s.activeUntil && (new Date(s.activeUntil).getTime() - Date.now()) < 5 * 86400000)).sort((a, b) => (new Date(a.activeUntil || 0).getTime() - new Date(b.activeUntil || 0).getTime())),
        [students],
    );

    const expiringSoon = useMemo(() => dueStudents.filter((s) => !s.isExpired), [dueStudents]);

    const find = useForm<FindForm>();
    const renewForm = useForm<RenewForm>({ defaultValues: { seasonalFees: "", feesDeposited: "", method: "cash" } });
    const { toast } = useToast();

    // One-time alert for soon-to-expire memberships
    useEffect(() => {
        if (expiringSoon.length > 0) {
            toast({
                title: `Renewal reminders`,
                description: `${expiringSoon.length} membership(s) expiring within 2 days`,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getMethodFor = (s: Student): "cash" | "upi" | "card" =>
        methodByUser[s.id] ?? "cash";

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
        };

    const updateFeeInput = (s: Student, field: "seasonalFees" | "feesDeposited", value: string) => {
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
                title: "Seasonal fees required",
                description: "Enter a seasonal fee amount of at least ₹1.",
                variant: "destructive",
            });
            return;
        }
        const months = membershipMonthsFromDeposit(seasonal, deposit);
        if (months === null) {
            toast({
                title: "Invalid fee amounts",
                description:
                    "Fees deposited must be a multiple of seasonal fees (e.g. ₹500/month → ₹500, ₹1000, ₹1500 for 1–3 months).",
                variant: "destructive",
            });
            return;
        }
        setRenewingIds((prev) => new Set(prev).add(student.id));
        try {
            await renewMembership(student.id, {
                months,
                amount: deposit,
                method: method.toUpperCase() as "CASH" | "UPI" | "CARD",
                note: "Renewal",
                dateOfJoining: student.dateOfJoining || undefined,
            });
            setPaidIds((prev) => new Set(prev).add(student.id));
            toast({
                title: "Renewed",
                description: `Membership renewed for ${student.name} (${months} month${months === 1 ? "" : "s"}).`,
            });
            setRefreshTick((x) => x + 1);
        } catch (e: unknown) {
            const msg =
                e && typeof e === "object" && "response" in e
                    ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast({
                title: "Error",
                description: msg || "Failed to renew membership",
                variant: "destructive",
            });
        } finally {
            setRenewingIds((prev) => { const s = new Set(prev); s.delete(student.id); return s; });
        }
    };

    const [foundStudent, setFoundStudent] = useState<Student | null>(null);

    const onFind = async (data: FindForm) => {
        // Search API by query (using email as query)
        const results = await searchStudents(data.email);
        const match = results.find(s => s.mobileNo === data.email || s.name.toLowerCase().includes(data.email.toLowerCase()));
        // Note: The API searchStudents implementation searches by name/id. 
        // Ideally we should have a `getByEmail` API. For now, we take the first result if explicit email search isn't supported.
        // Assuming searchStudents(q) searches broadly.

        if (!match && results.length === 0) {
            toast({ title: "No student found", description: "Check the query or ask them to sign up.", variant: "destructive" });
            setFoundStudent(null);
            return;
        }
        const user = match || results[0];
        setFoundStudent(user);
        renewForm.reset({
            seasonalFees: String(user.seasonalFees ?? 0),
            feesDeposited: String(user.feesDeposited ?? 0),
            method: "cash",
            note: "",
        });
        toast({ title: "Student found", description: `${user.name}` });
    };

    const onRenew = async () => {
        if (!foundStudent) return;
        const { seasonalFees, feesDeposited, method, note } = renewForm.getValues();
        const seasonal = parseRupeeInt(seasonalFees);
        const deposit = parseRupeeInt(feesDeposited);
        if (seasonal < 1) {
            toast({ title: "Seasonal fees required", description: "Enter seasonal fees (at least ₹1).", variant: "destructive" });
            return;
        }
        const monthsNum = membershipMonthsFromDeposit(seasonal, deposit);
        if (monthsNum === null) {
            toast({
                title: "Invalid fee amounts",
                description:
                    "Fees deposited must be a multiple of seasonal fees (e.g. ₹500/month → ₹500, ₹1000, ₹1500).",
                variant: "destructive",
            });
            return;
        }
        try {
            const updated = await renewMembership(foundStudent.id, {
                months: monthsNum,
                amount: deposit,
                method: method.toUpperCase() as "CASH" | "UPI" | "CARD",
                note,
                dateOfJoining: foundStudent.dateOfJoining || undefined,
            });
            // Update local state with the fresh student data (contains recalculated activeUntil)
            setFoundStudent(updated);
            toast({
                title: "Membership renewed",
                description: `Renewed for ${monthsNum} month${monthsNum === 1 ? "" : "s"}.`,
            });
            renewForm.reset({
                seasonalFees: String(updated.seasonalFees ?? seasonal),
                feesDeposited: String(updated.feesDeposited ?? deposit),
                method,
                note: "",
            });
            setRefreshTick(t => t + 1);
        } catch (e: unknown) {
            const msg =
                e && typeof e === "object" && "response" in e
                    ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            toast({ title: "Renewal failed", description: msg, variant: "destructive" });
        }
    };

    const selectedUser = foundStudent;
    // const membership = selectedUser ? getMembership(selectedUser.id) : undefined; // Logic moved to Student.activeUntil

    return (
        <div className="mx-auto w-full min-w-0 max-w-full overflow-x-hidden py-2 md:max-w-5xl md:py-2">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight md:text-2xl">Renew membership</h1>
                    <p className="text-sm text-muted-foreground">Due renewals and quick pay — full width on your phone</p>
                </div>
                <div className="w-full md:max-w-sm">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <Input
                        id="search"
                        placeholder="Search by name, ID"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="touch-manipulation"
                    />
                </div>
            </div>

            {expiringSoon.length > 0 && (
                <Alert className="mb-4">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Expiring soon</AlertTitle>
                    <AlertDescription>
                        {expiringSoon.length} student(s) have memberships expiring within 2 days.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="mb-6">
                <CardContent className="p-0">
                    <div className="p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">Showing {dueStudents.length} due student(s) (expired or ≤ 5 days)</div>
                        <p className="text-xs text-muted-foreground">
                            Deposited fees must be a multiple of seasonal fees; membership extends by deposit ÷ seasonal (e.g. ₹500 and ₹1500 → 3 months).
                        </p>
                    </div>
                    {/* Mobile: full-width cards — no horizontal scroll */}
                    <div className="space-y-3 p-3 md:hidden">
                        {dueStudents.map((s) => {
                            const isPaid = paidIds.has(s.id);
                            const isLoading = renewingIds.has(s.id);
                            const daysLeft = s.activeUntil ? Math.ceil((new Date(s.activeUntil).getTime() - Date.now()) / (1000 * 3600 * 24)) : 0;
                            const soon = !s.isExpired && daysLeft <= 2 && daysLeft >= 0;
                            const rowFees = getFeeInputs(s);
                            const seasonalNum = parseRupeeInt(rowFees.seasonalFees);
                            const depositNum = parseRupeeInt(rowFees.feesDeposited);
                            const monthsCovered = membershipMonthsFromDeposit(seasonalNum, depositNum);
                            const feesValid = monthsCovered !== null;
                            return (
                                <div
                                    key={s.id}
                                    className={`rounded-xl border border-border/80 bg-card p-4 shadow-sm touch-manipulation ${soon ? "ring-1 ring-amber-400/50" : ""}`}
                                >
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold leading-tight">{s.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{s.mobileNo || "—"}</p>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono">{s.regNo || "—"}</span>
                                                <Badge variant="secondary" className="text-xs">{s.seatNo}</Badge>
                                            </div>
                                        </div>
                                        {isPaid ? (
                                            <Badge className="shrink-0 bg-emerald-600">Paid</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="shrink-0">Unpaid</Badge>
                                        )}
                                    </div>
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        Active until:{" "}
                                        <span className="font-medium text-foreground">
                                            {s.activeUntil ? format(new Date(s.activeUntil), "dd MMM yyyy") : "—"}
                                        </span>
                                        {soon && !isPaid && (
                                            <span className="ml-2 text-amber-600">Expiring soon</span>
                                        )}
                                    </p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Seasonal / month (₹)</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                className="w-full"
                                                value={rowFees.seasonalFees}
                                                onChange={(e) => updateFeeInput(s, "seasonalFees", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Deposited (₹)</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                className="w-full"
                                                value={rowFees.feesDeposited}
                                                onChange={(e) => updateFeeInput(s, "feesDeposited", e.target.value)}
                                            />
                                            {monthsCovered != null && (
                                                <p className="text-xs text-muted-foreground">{monthsCovered} month{monthsCovered === 1 ? "" : "s"}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Method</Label>
                                            <Select
                                                value={getMethodFor(s)}
                                                onValueChange={(v) =>
                                                    setMethodByUser((prev) => ({ ...prev, [s.id]: v as "cash" | "upi" | "card" }))
                                                }
                                            >
                                                <SelectTrigger className="w-full capitalize">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="upi">UPI</SelectItem>
                                                    <SelectItem value="card">Card</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            className="w-full"
                                            disabled={isLoading || isPaid || !feesValid}
                                            onClick={() => handleRenewRow(s)}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPaid ? "Done" : "Renew now"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {dueStudents.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">No due students</p>
                        )}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Reg No</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead className="hidden sm:table-cell">Active Until</TableHead>
                                    <TableHead>Seasonal Fees</TableHead>
                                    <TableHead>Fees Deposited</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dueStudents.map((s) => {
                                    const isPaid = paidIds.has(s.id);
                                    const isLoading = renewingIds.has(s.id);
                                    const daysLeft = s.activeUntil ? Math.ceil((new Date(s.activeUntil).getTime() - Date.now()) / (1000 * 3600 * 24)) : 0;
                                    const soon = !s.isExpired && daysLeft <= 2 && daysLeft >= 0;
                                    const rowFees = getFeeInputs(s);
                                    const seasonalNum = parseRupeeInt(rowFees.seasonalFees);
                                    const depositNum = parseRupeeInt(rowFees.feesDeposited);
                                    const monthsCovered = membershipMonthsFromDeposit(seasonalNum, depositNum);
                                    const feesValid = monthsCovered !== null;
                                    return (
                                        <TableRow key={s.id} className={soon ? "bg-amber-50 dark:bg-amber-950/20" : undefined}>
                                            <TableCell>
                                                <div className="font-medium">{s.name}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[220px]">{s.mobileNo}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{s.regNo || "—"}</TableCell>
                                            <TableCell><Badge variant="secondary">{s.seatNo}</Badge></TableCell>
                                            <TableCell className="hidden sm:table-cell">{s.activeUntil ? format(new Date(s.activeUntil), "dd-MMM-yyyy") : "—"}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    className="w-[100px]"
                                                    placeholder="0"
                                                    value={rowFees.seasonalFees}
                                                    onChange={(e) => updateFeeInput(s, "seasonalFees", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    className="w-[100px]"
                                                    placeholder="0"
                                                    value={rowFees.feesDeposited}
                                                    onChange={(e) => updateFeeInput(s, "feesDeposited", e.target.value)}
                                                />
                                                {monthsCovered != null && (
                                                    <p className="text-xs text-muted-foreground mt-1">{monthsCovered} month{monthsCovered === 1 ? "" : "s"}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={getMethodFor(s)}
                                                    onValueChange={(v) =>
                                                        setMethodByUser((prev) => ({ ...prev, [s.id]: v as "cash" | "upi" | "card" }))
                                                    }
                                                >
                                                    <SelectTrigger className="w-[100px] capitalize">
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="upi">UPI</SelectItem>
                                                        <SelectItem value="card">Card</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {isPaid ? (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Paid</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Unpaid</Badge>
                                                )}
                                                {soon && !isPaid && <span className="ml-2 text-xs text-amber-600">Expiring soon</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    disabled={isLoading || isPaid || !feesValid}
                                                    title={
                                                        !feesValid
                                                            ? "Deposited amount must be a multiple of seasonal (e.g. 500, 1000, 1500 for ₹500/mo)"
                                                            : undefined
                                                    }
                                                    onClick={() => handleRenewRow(s)}
                                                >
                                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPaid ? "Done" : "Renew"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {dueStudents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No due students</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card className="min-w-0 border-border/80">
                <CardContent className="space-y-6 p-4 md:p-6">
                    <form onSubmit={find.handleSubmit(onFind)} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                        <div className="space-y-2">
                            <Label htmlFor="email">Student email</Label>
                            <Input id="email" placeholder="student@example.com" {...find.register("email", { required: true })} />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" className="w-full md:w-auto">Find student</Button>
                        </div>
                    </form>

                    {selectedUser && (
                        <div className="rounded-md border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{selectedUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.mobileNo}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Active until</p>
                                    <p className="font-medium">{selectedUser.activeUntil ? format(new Date(selectedUser.activeUntil), "dd-MMM-yyyy") : "—"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedUser && (
                        <form onSubmit={(e) => { e.preventDefault(); onRenew(); }} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Seasonal fees (₹ / month)</Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="0"
                                    {...renewForm.register("seasonalFees")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fees deposited (₹)</Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="0"
                                    {...renewForm.register("feesDeposited")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Membership period</Label>
                                <div className="flex min-h-11 items-center rounded-md border border-input bg-muted/40 px-3 text-sm md:min-h-10">
                                    {(() => {
                                        const v = renewForm.watch();
                                        const m = membershipMonthsFromDeposit(parseRupeeInt(v.seasonalFees), parseRupeeInt(v.feesDeposited));
                                        return m != null ? `${m} month${m === 1 ? "" : "s"}` : "—";
                                    })()}
                                </div>
                            </div>
                            <p className="md:col-span-3 text-xs text-muted-foreground">
                                Deposited total must be a whole multiple of the seasonal fee; active-until extends by that many months (e.g. ₹500 + ₹1500 → 3 months).
                            </p>
                            <div className="space-y-2">
                                <Label>Method</Label>
                                <Select onValueChange={(v) => renewForm.setValue("method", v as RenewForm["method"])} value={renewForm.watch("method")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Note (optional)</Label>
                                <Input placeholder="Receipt no. / reference" {...renewForm.register("note")} />
                            </div>
                            <div className="md:col-span-3">
                                <Button
                                    type="submit"
                                    disabled={(() => {
                                        const v = renewForm.watch();
                                        return membershipMonthsFromDeposit(parseRupeeInt(v.seasonalFees), parseRupeeInt(v.feesDeposited)) === null;
                                    })()}
                                >
                                    Renew membership
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
