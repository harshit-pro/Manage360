import { useEffect, useMemo, useState } from "react";
import { listAllStudents, StudentView } from "@/lib/students";
import { seedDemoData } from "@/lib/demoData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function PendingFees() {
  useEffect(() => { seedDemoData(); }, []);
  const [q, setQ] = useState("");

  const pending = useMemo(() => {
    const all = listAllStudents();
    const filtered = all.filter((s) => (s.isEnrolled !== false) && (s.isExpired || ((s.feesDeposited ?? 0) < (s.seasonalFees ?? 0))));
    if (!q) return filtered;
    const qq = q.toLowerCase();
    return filtered.filter((s) =>
      s.name.toLowerCase().includes(qq) ||
      (s.regNo ?? "").toLowerCase().includes(qq) ||
      s.seatNo.toLowerCase().includes(qq)
    );
  }, [q]);

  const regOf = (s: StudentView) => (s.code ? s.code.replace(/-/g, "") : s.regNo ? s.regNo.replace(/^REG-/, "CL") : "—");
  const pendingAmount = (s: StudentView) => Math.max(0, (s.seasonalFees ?? 0) - (s.feesDeposited ?? 0));

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Pending Fees</h1>
            <p className="text-sm text-muted-foreground">Students with unpaid seasonal fees</p>
          </div>
          <div className="w-full md:w-80">
            <Label htmlFor="spending" className="sr-only">Search</Label>
            <Input id="spending" placeholder="Search name, reg no, seat" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 text-sm text-muted-foreground">Total {pending.length} student(s) with pending fees</div>

            {/* Mobile cards */}
            <div className="md:hidden p-4">
              <div className="space-y-3">
                {pending.map((s) => (
                  <div key={s.userId} className="p-3 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{regOf(s)}</div>
                        <div className="mt-1 text-sm"><Badge variant="secondary">{s.seatNo}</Badge></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Pending</div>
                        <div className="font-semibold">₹{pendingAmount(s).toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {pending.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No pending fees</div>
                )}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Reg No</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((s) => (
                    <TableRow key={s.userId}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">{regOf(s)}</TableCell>
                      <TableCell><Badge variant="secondary">{s.seatNo}</Badge></TableCell>
                      <TableCell className="text-right">₹{pendingAmount(s).toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                  {pending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No pending fees</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
