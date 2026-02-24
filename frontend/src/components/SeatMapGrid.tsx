import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatDetailsDialog } from "./SeatDetailsDialog";
import { listActiveStudents, Student } from "@/lib/students";
import { Loader2 } from "lucide-react";

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

        // Fetch active students from backend
        const activeStudents = await listActiveStudents();
        const studentMap = new Map<string, Student>();

        if (Array.isArray(activeStudents)) {
          activeStudents.forEach(s => {
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
              student = studentMap.get(key);
              break;
            }
          }

          const seatNum = `S${padded3}`; // e.g., "S001"

          newSeats.push({
            id: i,
            number: seatNum,
            available: !student,
            student: student
              ? {
                name: student.name,
                mobile: student.mobileNo || "N/A",
                joiningDate: student.dateOfJoining || student.activeUntil || "N/A",
                paymentStatus: ((student.feesDeposited || 0) >= (student.seasonalFees || 0)) ? "paid" : "pending",
                activeUntil: student.activeUntil,
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
      <Card className="shadow-md animate-fade-in">
        <CardHeader>
          <CardTitle>Seat Map Grid</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-success" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive" />
              <span className="text-muted-foreground">Booked</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 md:grid-cols-10 gap-2">
            {seats.map((seat) => (
              <button
                key={seat.id}
                onClick={() => setSelectedSeat(seat)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                  transition-all hover:scale-105 hover:shadow-md
                  ${seat.available
                    ? "bg-success text-success-foreground"
                    : "bg-destructive text-destructive-foreground"
                  }
                `}
              >
                {seat.number.slice(1)}
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
