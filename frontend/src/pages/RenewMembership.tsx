import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
// import { getUserByEmail } from "@/lib/auth"; // Removed
// import { ensureMembership, getMembership, renew, expireNow } from "@/lib/membership"; // Removed
import { format } from "date-fns";
import { listStudents, searchStudents, Student, renewMembership } from "@/lib/students";
// import { seedDemoData } from "@/lib/demoData"; // Removed
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell } from "lucide-react";

type FindForm = { email: string };
type RenewForm = { months: number; amount: number; method: "cash" | "upi" | "card"; note?: string };

export default function RenewMembership() {
    // Demo data seeding removed


    const [query, setQuery] = useState("");
    const [refreshTick, setRefreshTick] = useState(0);
    const [methodByUser, setMethodByUser] = useState<Record<string, "cash" | "upi" | "card">>({});
    const [students, setStudents] = useState<Student[]>([]);

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
    const renewForm = useForm<RenewForm>({ defaultValues: { months: 1, amount: 500, method: "cash" } });
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

    const markPaidToggle = async (student: Student, checked: boolean) => {
        if (checked) {
            // Renew for 1 month with default amount
            const method = getMethodFor(student);
            // Assuming this is a quick action for default monthly fee
            try {
                await renewMembership(student.id, {
                    months: 1,
                    amount: student.seasonalFees || 500, // Use student's fee or default
                    method: method.toUpperCase() as any,
                    note: "Quick toggle renewal"
                });
                toast({ title: "Renewed", description: `Membership renewed for ${student.name}` });
            } catch (e) {
                toast({ title: "Error", description: "Failed to renew membership", variant: "destructive" });
            }
        } else {
            // Expire logic not available in API yet
            toast({ title: "Not Available", description: "Manual expiry not supported via API yet.", variant: "destructive" });
        }
        // Force refresh of memoized lists
        setRefreshTick((x) => x + 1);
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
        toast({ title: "Student found", description: `${user.name}` });
    };

    const onRenew = async () => {
        if (!foundStudent) return;
        const { months, amount, method, note } = renewForm.getValues();
        try {
            await renewMembership(foundStudent.id, {
                months: Number(months),
                amount: Number(amount),
                method: method.toUpperCase() as any,
                note
            });
            toast({ title: "Membership renewed", description: `Renewal successful.` });
            renewForm.reset(renewForm.getValues());
            setRefreshTick(t => t + 1);
        } catch (e) {
            toast({ title: "Renewal failed", variant: "destructive" });
        }
    };

    const selectedUser = foundStudent;
    // const membership = selectedUser ? getMembership(selectedUser.id) : undefined; // Logic moved to Student.activeUntil

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-semibold">Renew Membership</h1>
                    <p className="text-sm text-muted-foreground">Manage active students, payments, and expiries</p>
                </div>
                <div className="w-full md:w-80">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <Input id="search" placeholder="Search by name, ID" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
            </div>

            {expiringSoon.length > 0 && (
                <Alert className="mb-4">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Expiring soon</AlertTitle>
                    <AlertDescription>
                        {expiringSoon.length} student(s) have memberships expiring within 2 days. Use the toggle to renew quickly.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="mb-6">
                <CardContent className="p-0">
                    <div className="p-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Showing {dueStudents.length} due student(s) (expired or ≤ 5 days)</div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Unique ID</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead className="hidden sm:table-cell">Active until</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dueStudents.map((s) => {
                                    const statusPaid = !s.isExpired;
                                    const daysLeft = s.activeUntil ? Math.ceil((new Date(s.activeUntil).getTime() - Date.now()) / (1000 * 3600 * 24)) : 0;
                                    const soon = !s.isExpired && daysLeft <= 2 && daysLeft >= 0;
                                    return (
                                        <TableRow key={s.id} className={soon ? "bg-amber-50 dark:bg-amber-950/20" : undefined}>
                                            <TableCell>
                                                <div className="font-medium">{s.name}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[220px]">{s.mobileNo}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell font-mono text-xs">{/* Code not in Student interface yet */ s.id}</TableCell>
                                            <TableCell><Badge variant="secondary">{s.seatNo}</Badge></TableCell>
                                            <TableCell className="hidden sm:table-cell">{s.activeUntil ? format(new Date(s.activeUntil), "dd MMM yyyy") : "—"}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={getMethodFor(s)}
                                                    onValueChange={(v) =>
                                                        setMethodByUser((prev) => ({ ...prev, [s.id]: v as "cash" | "upi" | "card" }))
                                                    }
                                                >
                                                    <SelectTrigger className="w-[120px] capitalize">
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
                                                {statusPaid ? (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Paid</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Unpaid</Badge>
                                                )}
                                                {soon && <span className="ml-2 text-xs text-amber-600">Expiring soon</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Switch checked={statusPaid} onCheckedChange={(c) => markPaidToggle(s, c)} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {dueStudents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No due students</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Single-student quick renewal */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <form onSubmit={find.handleSubmit(onFind)} className="grid gap-3 md:grid-cols-[1fr_auto]">
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
                                    <p className="font-medium">{selectedUser.activeUntil ? format(new Date(selectedUser.activeUntil), "dd MMM yyyy") : "—"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedUser && (
                        <form onSubmit={(e) => { e.preventDefault(); onRenew(); }} className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Months</Label>
                                <Input type="number" min={1} step={1} {...renewForm.register("months", { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input type="number" min={0} step={50} {...renewForm.register("amount", { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Method</Label>
                                <Select onValueChange={(v) => renewForm.setValue("method", v as any)} defaultValue={renewForm.getValues("method")}>
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
                            <div className="md:col-span-3 space-y-2">
                                <Label>Note (optional)</Label>
                                <Input placeholder="Receipt no. / reference" {...renewForm.register("note")} />
                            </div>
                            <div className="md:col-span-3">
                                <Button type="submit">Renew membership</Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
