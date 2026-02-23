import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { StudentView } from "@/lib/students";
import { format } from "date-fns";

type Props = { open: boolean; onOpenChange: (o: boolean) => void; student: StudentView };

export default function StudentDetailsDialog({ open, onOpenChange, student }: Props) {
    const rows: Array<[string, string | number | undefined]> = [
        ["Name", student.name],
        ["Reg No", student.regNo],
        ["Aadhar No", student.aadharNo],
        ["Address", student.address],
        ["Seat No", student.seatNo],
        ["Student ID", student.id],
        ["Date of Joining", student.dateOfJoining ? format(new Date(student.dateOfJoining), "dd MMM yyyy") : "—"],
        ["Mobile", student.mobileNo],
        ["Guardian's Name", student.guardianName],
        ["Guardian's Mobile", student.guardianMobile],
        ["Gender", student.gender],
        ["Membership Period", student.membershipMonths ? `${student.membershipMonths} months` : "—"],
        ["Seasonal Fees", student.seasonalFees],
        ["Fees Deposited", student.feesDeposited],
        ["Payment Status", student.isExpired ? "Not Active" : "Active"],
        ["Active Until", student.activeUntil ? format(new Date(student.activeUntil), "dd MMM yyyy") : "—"],
        ["Is Enrolled", student.isEnrolled === false ? "No" : "Yes"],
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {student.name}
                        <Badge variant={student.isEnrolled !== false && !student.isExpired ? "secondary" : "destructive"}>
                            {student.isEnrolled !== false && !student.isExpired ? "Active" : "Not Active"}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rows.map(([k, v]) => (
                        <div key={k} className="text-sm">
                            <div className="text-muted-foreground">{k}</div>
                            <div className="font-medium break-words">{String(v ?? "—")}</div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
