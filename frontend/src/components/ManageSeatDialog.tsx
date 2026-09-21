import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoveRight, ArrowRightLeft } from "lucide-react";
import { changeSeat, swapSeat, isSeatAvailable, type Student } from "@/lib/students";

type ManageSeatDialogProps = {
    action: "change" | "swap" | null;
    student: Student | null;
    onClose: () => void;
    onUpdate?: (updated: Student) => void;
};

export default function ManageSeatDialog({ action, student, onClose, onUpdate }: ManageSeatDialogProps) {
    const [targetSeat, setTargetSeat] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSeatAction = async () => {
        if (!student || !action) return;
        if (!targetSeat.trim()) {
            setErrorMsg("Please enter a seat number.");
            return;
        }
        setIsSubmitting(true);
        setErrorMsg("");
        try {
            let updated;
            if (action === "change") {
                const available = await isSeatAvailable(targetSeat);
                if (!available) {
                    setErrorMsg("This seat is currently occupied. Use Swap instead.");
                    setIsSubmitting(false);
                    return;
                }
                updated = await changeSeat(student.id, targetSeat);
            } else {
                updated = await swapSeat(student.id, targetSeat);
            }
            if (onUpdate) onUpdate(updated);
            setTargetSeat("");
            onClose();
        } catch (e: any) {
            setErrorMsg(e.response?.data?.message || "Failed to process seat action");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={!!action && !!student} onOpenChange={(o) => { if (!o) { onClose(); setErrorMsg(""); setTargetSeat(""); } }}>
            <DialogContent className="max-w-sm rounded-[2rem] p-6 text-center">
                <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    {action === "change" ? <MoveRight className="h-8 w-8" /> : <ArrowRightLeft className="h-8 w-8" />}
                </div>
                <DialogTitle className="text-xl font-black mb-2">
                    {action === "change" ? "Change Seat" : "Swap Seats"}
                </DialogTitle>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                    {action === "change" 
                        ? `Move ${student?.name} to a new available seat.` 
                        : `Swap ${student?.name}'s seat with another student's seat.`}
                </p>
                <div className="space-y-4">
                    <Input
                        placeholder="Target Seat No (e.g. 25)"
                        value={targetSeat}
                        onChange={(e) => setTargetSeat(e.target.value)}
                        className="h-12 text-center font-bold text-lg rounded-xl"
                    />
                    {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
                    <Button 
                        className="w-full h-12 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleSeatAction}
                        disabled={isSubmitting || !targetSeat.trim()}
                    >
                        {isSubmitting ? "Processing..." : "Confirm"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
