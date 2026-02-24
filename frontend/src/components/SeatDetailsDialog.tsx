import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Seat {
  id: number;
  number: string;
  available: boolean;
  student?: {
    name: string;
    mobile: string;
    joiningDate: string;
    paymentStatus: "paid" | "pending";
    activeUntil?: string;
  };
}

interface SeatDetailsDialogProps {
  seat: Seat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeatDetailsDialog({ seat, open, onOpenChange }: SeatDetailsDialogProps) {
  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seat {seat.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={seat.available ? "default" : "destructive"}>
              {seat.available ? "Available" : "Booked"}
            </Badge>
          </div>

          {!seat.available && seat.student && (
            <>
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Student Name</span>
                  <span className="font-medium">{seat.student.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mobile</span>
                  <span className="font-medium">{seat.student.mobile}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joining Date</span>
                  <span className="font-medium">
                    {seat.student.joiningDate === "N/A" || !seat.student.joiningDate
                      ? "N/A"
                      : format(new Date(seat.student.joiningDate), "dd-MMM-yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  <Badge variant={seat.student.paymentStatus === "paid" ? "default" : "destructive"}>
                    {seat.student.paymentStatus}
                  </Badge>
                </div>

                {seat.student.activeUntil && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Until</span>
                    <span className="font-medium">
                      {format(new Date(seat.student.activeUntil), "dd-MMM-yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
