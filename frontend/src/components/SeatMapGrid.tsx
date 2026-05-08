import { listAllStudents, Student } from "@/lib/students";
import { Loader2, Zap, Clock, Calendar, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { SeatDetailsDialog } from "./SeatDetailsDialog";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface Seat {
  id: number;
  number: string;
  available: boolean;
  student?: {
    id: string;
    regNo: string;
    name: string;
    mobile: string;
    joiningDate: string;
    paymentStatus: "paid" | "unpaid";
    activeUntil?: string;
    isExpired: boolean;
    totalDue?: string;
  };
}

interface SeatMapGridProps {
  totalSeats: number;
}

export function SeatMapGrid({ totalSeats }: SeatMapGridProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  useEffect(() => {
    async function fetchSeats() {
      try {
        setLoading(true);

        if (totalSeats <= 0) {
          setSeats([]);
          return;
        }

        // Fetch ALL students (including expired) so expired seats show yellow
        const allStudents = await listAllStudents();
        const studentMap = new Map<string, Student>();

        if (Array.isArray(allStudents)) {
          allStudents.filter(s => s.isEnrolled !== false).forEach(s => {
            if (s.seatNo) {
              const raw = String(s.seatNo).trim().toUpperCase();
              studentMap.set(raw, s);

              const numMatch = raw.match(/\d+/);
              if (numMatch) {
                const n = parseInt(numMatch[0]);
                studentMap.set(`S${n.toString().padStart(3, "0")}`, s);
                studentMap.set(`S${n.toString().padStart(2, "0")}`, s);
                studentMap.set(`S${n}`, s);
                studentMap.set(`${n}`, s);
              }
            }
          });
        }

        // Generate grid based on totalSeats from DB and live student data
        const newSeats: Seat[] = [];
        for (let i = 1; i <= totalSeats; i++) {
          const padded3 = i.toString().padStart(3, "0");
          const padded2 = i.toString().padStart(2, "0");
          const keysToTry = [`S${padded3}`, `S${padded2}`, `S${i}`, `${i}`, padded2, padded3];

          let student: Student | undefined;
          for (const key of keysToTry) {
            if (studentMap.has(key)) {
              const matched = studentMap.get(key);
              if (matched) {
                student = matched;
                break;
              }
            }
          }

          const seatNum = `S${padded3}`; // e.g., "S001"

          const isExpired = student?.isExpired ?? false;

          newSeats.push({
            id: i,
            number: seatNum,
            available: !student,
            student: student
              ? {
                id: student.id,
                regNo: student.regNo,
                name: student.name,
                mobile: student.mobileNo || "N/A",
                joiningDate: student.dateOfJoining || student.activeUntil || "N/A",
                paymentStatus: isExpired ? "unpaid" : (student.feesDeposited < student.seasonalFees ? "unpaid" : "paid"),
                activeUntil: student.activeUntil,
                isExpired,
                totalDue: (student.seasonalFees - student.feesDeposited > 0)
                  ? `₹${student.seasonalFees - student.feesDeposited}`
                  : undefined,
              }
              : undefined,
          });
        }
        setSeats(newSeats);
      } catch (error) {
        console.error("Failed to load seat map data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeats();
  }, [totalSeats]);

  if (loading) {
    return (
      <Card className="shadow-md h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl animate-fade-in">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                <div className="h-8 w-2 bg-primary rounded-full" />
                Live Occupancy
              </CardTitle>
              <p className="text-slate-400 text-sm font-medium">Real-time station monitoring.</p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded-full bg-slate-100 border border-slate-200" />
              <span className="text-[10px] font-black uppercase text-slate-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded-full bg-slate-900 shadow-lg shadow-slate-900/20" />
              <span className="text-[10px] font-black uppercase text-slate-400">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 rounded-full bg-amber-400 shadow-lg shadow-amber-400/20" />
              <span className="text-[10px] font-black uppercase text-slate-400">Expired</span>
            </div>

          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 lg:p-8">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5 sm:gap-3">
            {seats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => setSelectedSeat(seat)}
                className={`
                  aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black
                  transition-all hover:scale-105 hover:shadow-lg active:scale-90
                  ${seat.available
                    ? "bg-slate-50 text-slate-400 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50"
                    : seat.student?.isExpired
                      ? "bg-amber-400 text-white shadow-lg shadow-amber-400/20"
                      : "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                  }
                `}
              >
                {seat.number.replace(/\D/g, "")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <SeatDetailsDialog
        seat={selectedSeat}
        open={!!selectedSeat}
        onOpenChange={(open) => !open && setSelectedSeat(null)}
      />
    </>
  );
}
