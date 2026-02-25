import { useEffect, useMemo, useState } from "react";
import { listAllStudents, paySeasonalFee, StudentView } from "@/lib/students";
import { seedDemoData } from "@/lib/demoData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function PendingFees() {
  const [q, setQ] = useState("");

  const [students, setStudents] = useState<StudentView[]>([]);
  const [loading, setLoading] = useState(true);

  const [clearingStudent, setClearingStudent] = useState<StudentView | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await listAllStudents();
        setStudents(Array.isArray(all) ? all : []);
      } catch (e) {
        console.error("Failed to load students", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const pending = useMemo(() => {
    const filtered = students.filter((s) => (s.isEnrolled !== false) && ((s.seasonalFees ?? 0) > (s.feesDeposited ?? 0)));
    if (!q) return filtered;
    const qq = q.toLowerCase();
    return filtered.filter((s) =>
      s.name.toLowerCase().includes(qq) ||
      (s.regNo ?? "").toLowerCase().includes(qq) ||
      s.seatNo.toLowerCase().includes(qq)
    );
  }, [q, students]);

  const regOf = (s: StudentView) => (s.regNo ? s.regNo.replace(/^REG-/, "CL") : "—");
  const pendingAmount = (s: StudentView) => Math.max(0, (s.seasonalFees ?? 0) - (s.feesDeposited ?? 0));

  const handleClearDues = async () => {
    if (!clearingStudent) return;
    setIsSubmitting(true);
    try {
      await paySeasonalFee({
        studentId: clearingStudent.id,
        amount: pendingAmount(clearingStudent),
        paymentMethod: paymentMethod,
      });
      toast({ title: "Payment Recorded", description: `Cleared dues for ${clearingStudent.name}.` });
      setClearingStudent(null);
      // Refresh students to update the data
      const all = await listAllStudents();
      setStudents(Array.isArray(all) ? all : []);
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e.message || "Failed to clear dues", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
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
                  <div key={s.id} className="p-3 bg-white rounded-lg shadow-sm border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{regOf(s)}</div>
                        <div className="mt-1 text-sm"><Badge variant="secondary">{s.seatNo}</Badge></div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                          <div className="font-semibold text-destructive">₹{pendingAmount(s).toLocaleString("en-IN")}</div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setClearingStudent(s)}>
                          Clear Dues
                        </Button>
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
                    <TableHead className="text-center w-32">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="font-mono text-xs">{regOf(s)}</TableCell>
                      <TableCell><Badge variant="secondary">{s.seatNo}</Badge></TableCell>
                      <TableCell className="text-right text-destructive font-semibold">₹{pendingAmount(s).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => setClearingStudent(s)}>
                          Clear Dues
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pending fees</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!clearingStudent} onOpenChange={(o) => (!o && !isSubmitting) && setClearingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Pending Fees</DialogTitle>
          </DialogHeader>
          {clearingStudent && (
            <div className="space-y-4 py-2">
              <div className="text-sm">
                Student <span className="font-semibold">{clearingStudent.name}</span> has a pending due of
                <span className="font-semibold text-destructive ml-1">₹{pendingAmount(clearingStudent).toLocaleString("en-IN")}</span>.
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "CASH" | "UPI" | "CARD")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearingStudent(null)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleClearDues} disabled={isSubmitting} className="bg-gradient-to-r from-emerald-500 to-emerald-600">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
