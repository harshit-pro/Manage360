import { useEffect, useMemo, useState } from "react";
import { listAllStudents, searchStudents, Student, toggleEnrollment } from "@/lib/students";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StudentDetailsDialog from "@/components/StudentDetailsDialog";
import EditStudentDialog from "@/components/EditStudentDialog";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentsAll({ embedded = false }: { embedded?: boolean }) {
    // Demo seeding removed
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);
    const [editTarget, setEditTarget] = useState<Student | null>(null);
    const [tick, setTick] = useState(0);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = q ? await searchStudents(q) : await listAllStudents();
                setStudents(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Failed to load students", e);
                setStudents([]);
            }
        };
        fetch();
    }, [q, tick]);

    const regOf = (s: Student) => s.regNo || "—";

    const handleToggleEnrollment = async (s: Student, checked: boolean) => {
        try {
            await toggleEnrollment(s.id, checked);
            setTick((t) => t + 1);
        } catch (e) {
            console.error("Failed to toggle enrollment", e);
        }
    };

    return (
        <div className={cn("min-w-0 max-w-full", embedded ? "" : "container mx-auto p-4")}>
            <div className={cn("mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between")}>
                {!embedded && (
                    <div>
                        <h1 className="text-2xl font-semibold">All Students</h1>
                        <p className="text-sm text-muted-foreground">Every registered student, historical and current</p>
                    </div>
                )}
                {embedded && (
                    <h2 className="text-lg font-semibold text-foreground">All students</h2>
                )}
                <div className={cn("w-full", !embedded && "md:w-80")}>
                    <Label htmlFor="sall" className="sr-only">Search</Label>
                    <Input id="sall" placeholder="Search name, reg, seat, phone" value={q} onChange={(e) => setQ(e.target.value)} className="touch-manipulation" />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="p-4 text-sm text-muted-foreground">Total {students.length} student(s)</div>
                    <div className="md:hidden p-3 sm:p-4">
                        <div className="space-y-3">
                            {students.map((s) => (
                                <div key={s.id} className="rounded-xl border border-border/80 bg-card p-3 shadow-sm touch-manipulation">
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
                                            <Badge className={s.isEnrolled !== false ? "bg-emerald-600" : "bg-destructive"}>{s.isEnrolled !== false ? "Active" : "Not Active"}</Badge>
                                            <div className="flex items-center gap-2">
                                                <Switch checked={s.isEnrolled !== false} onCheckedChange={(v) => handleToggleEnrollment(s, v)} />
                                                <Button variant="outline" size="sm" onClick={() => setSelected(s)}>View</Button>
                                                <Button variant="outline" size="sm" onClick={() => setEditTarget(s)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
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
                                    <TableHead className="hidden sm:table-cell whitespace-nowrap">Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Mark Active</TableHead>
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
                                        <TableCell className="hidden sm:table-cell text-center">
                                            {s.dateOfJoining ? (
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {format(new Date(s.dateOfJoining), "dd MMM yyyy")}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">— unknown —</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {s.isEnrolled !== false ? (
                                                <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
                                            ) : (
                                                <Badge variant="destructive">Not Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Switch
                                                    checked={s.isEnrolled !== false}
                                                    onCheckedChange={(v) => handleToggleEnrollment(s, v)}
                                                    aria-label="Toggle enrollment"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setSelected(s)}>View</Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditTarget(s)}
                                                    className="gap-1"
                                                >
                                                    <Pencil className="h-3 w-3" /> Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No students found</TableCell>
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

            <EditStudentDialog
                open={!!editTarget}
                student={editTarget}
                onOpenChange={(o) => !o && setEditTarget(null)}
                onSaved={(updated) => {
                    setStudents((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
                    setEditTarget(null);
                }}
            />
        </div>
    );
}
