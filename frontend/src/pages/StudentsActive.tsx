import { useEffect, useMemo, useState } from "react";
import { listActiveStudents, searchStudents, Student } from "@/lib/students";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StudentDetailsDialog from "@/components/StudentDetailsDialog";
import { format } from "date-fns";

export default function StudentsActive() {
    // Demo seeding removed
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                let data: Student[] = [];
                if (q) {
                    const all = await searchStudents(q);
                    // Filter for active ones locally if backend search doesn't support state filtering with query
                    // Or we can assume search returns all matches.
                    // Ideally backend search might not filter by active.
                    // For now, let's just show search results.
                    data = all;
                } else {
                    data = await listActiveStudents();
                }
                setStudents(data);
            } catch (e) {
                console.error("Failed to load active students", e);
                setStudents([]);
            }
        };
        fetch();
    }, [q]);

    const regOf = (s: Student) => s.regNo || "—";

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-end justify-between mb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Active Students</h1>
                    <p className="text-sm text-muted-foreground">Currently studying (enrolled and not expired)</p>
                </div>
                <div className="w-full md:w-80">
                    <Label htmlFor="sactive" className="sr-only">Search</Label>
                    <Input id="sactive" placeholder="Search name, reg no, code, seat, phone" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="p-4 text-sm text-muted-foreground">Total {students.length} active student(s)</div>
                    <div className="md:hidden p-4">
                        <div className="space-y-3">
                            {students.map((s) => (
                                <div key={s.id} className="p-3 bg-white rounded-lg shadow-sm border">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-base">{s.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                                                <span className="bg-muted px-1 rounded">{regOf(s)}</span>
                                                {s.dateOfJoining && (
                                                    <span className="font-bold text-blue-600">
                                                        Joined {format(new Date(s.dateOfJoining), "dd MMM")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm mt-1 text-muted-foreground truncate">{s.address || "No address provided"}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={s.activeUntil && new Date(s.activeUntil) < new Date() ? "text-xs text-destructive font-medium" : "text-xs text-emerald-600 font-medium"}>
                                                {s.activeUntil ? format(new Date(s.activeUntil), "dd-MMM-yyyy") : "—"}
                                            </span>
                                            <div>
                                                <Button variant="outline" size="sm" onClick={() => setSelected(s)}>View</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Reg No</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead className="whitespace-nowrap">Joined Date</TableHead>
                                    <TableHead className="whitespace-nowrap">Active Until</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="font-medium">{s.name}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{regOf(s)}</TableCell>
                                        <TableCell><Badge variant="secondary">{s.seatNo}</Badge></TableCell>
                                        <TableCell className="max-w-[240px] truncate">{s.address || "—"}</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold text-blue-600">
                                            {s.dateOfJoining ? format(new Date(s.dateOfJoining), "dd MMM yyyy") : "—"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {s.activeUntil ? (
                                                <span className={new Date(s.activeUntil) < new Date() ? "text-destructive font-medium" : "text-emerald-600 font-medium"}>
                                                    {format(new Date(s.activeUntil), "dd-MMM-yyyy")}
                                                </span>
                                            ) : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelected(s)}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No active students</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selected && (
                <StudentDetailsDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)} student={selected} />
            )}
        </div>
    );
}
