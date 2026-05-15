import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Armchair, Info, CheckCircle2, User, XCircle, Search, RefreshCw } from "lucide-react";
import { listAllStudents, type Student } from "@/lib/students";
import { fetchDashboardSummary } from "@/lib/dashboard";
import { getCurrentLibrary } from "@/lib/library";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LiveSeatMapProps {
  onSelectSeat: (seatNo: string) => void;
  selectedSeat?: string;
  className?: string;
}

export default function LiveSeatMap({ onSelectSeat, selectedSeat, className }: LiveSeatMapProps) {
  const [totalSeats, setTotalSeats] = useState<number>(0);
  const [occupiedSeats, setOccupiedSeats] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summary, allStudents] = await Promise.all([
        fetchDashboardSummary(),
        listAllStudents()
      ]);
      
      setTotalSeats(summary.totalSeats || 0);
      
      const studentMap = new Map<string, Student>();
      if (Array.isArray(allStudents)) {
          // Use same logic as dashboard but more inclusive
          allStudents.forEach(s => {
            if (s.seatNo) {
              const raw = String(s.seatNo).trim().toUpperCase();
              studentMap.set(raw, s);

              const numMatch = raw.match(/\d+/);
              if (numMatch) {
                const n = parseInt(numMatch[0]);
                const p3 = n.toString().padStart(3, "0");
                const p2 = n.toString().padStart(2, "0");
                studentMap.set(`S${p3}`, s);
                studentMap.set(`S${p2}`, s);
                studentMap.set(`S${n}`, s);
                studentMap.set(`${n}`, s);
                studentMap.set(p3, s);
                studentMap.set(p2, s);
              }
            }
          });
      }

      const processedOccupancy: Record<string, Student> = {};
      for (let i = 1; i <= (summary.totalSeats || 0); i++) {
          const padded3 = i.toString().padStart(3, "0");
          const padded2 = i.toString().padStart(2, "0");
          const keysToTry = [`S${padded3}`, `S${padded2}`, `S${i}`, `${i}`, padded2, padded3];

          for (const key of keysToTry) {
            if (studentMap.has(key)) {
              processedOccupancy[i.toString()] = studentMap.get(key)!;
              break;
            }
          }
      }

      setOccupiedSeats(processedOccupancy);
    } catch (error) {
      console.error("Failed to fetch seat map data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const seats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString());
  
  const filteredSeats = searchQuery 
    ? seats.filter(s => s.includes(searchQuery))
    : seats;

  if (loading) {
    return (
      <Card className={cn("rounded-[2.5rem] border-slate-200/60 shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-[2.5rem] border-slate-200/60 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-md flex flex-col", className)}>
      <CardHeader className="bg-slate-900 text-white p-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Armchair className="h-5 w-5 text-primary" />
              Live Seat Topology
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs font-medium mt-1">
              Dashboard-synced station monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchData()}
              disabled={loading}
              className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-tighter text-[10px]">
              {Object.keys(occupiedSeats).length} / {totalSeats} Taken
            </Badge>
          </div>
        </div>
      </CardHeader>

      <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search seat number..." 
            className="pl-10 h-10 rounded-xl border-slate-200 bg-white shadow-sm text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CardContent className="p-6 overflow-y-auto max-h-[500px] custom-scrollbar flex-1">
        <TooltipProvider>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredSeats.map((seatNo) => {
              const student = occupiedSeats[seatNo];
              const isOccupied = !!student;
              const isExpired = student?.isExpired ?? false;
              const isSelected = selectedSeat === seatNo || selectedSeat === `S${seatNo.padStart(3, "0")}` || selectedSeat === `S${seatNo.padStart(2, "0")}`;

              return (
                <Tooltip key={seatNo}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isOccupied}
                      onClick={() => onSelectSeat(`S${seatNo.padStart(3, "0")}`)}
                      className={cn(
                        "relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-500 border-2 group overflow-hidden",
                        isOccupied 
                          ? isExpired 
                            ? "bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/20" 
                            : "bg-slate-900 border-slate-800 shadow-lg shadow-slate-900/20"
                          : isSelected
                            ? "bg-primary border-primary shadow-lg shadow-primary/30 scale-110 z-10 animate-in zoom-in duration-300"
                            : "bg-slate-50 border-slate-100 hover:border-primary/50 hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 active:scale-95"
                      )}
                    >
                      {isSelected && !isOccupied && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                      )}
                      
                      {isOccupied ? (
                        <div className="flex flex-col items-center">
                          <XCircle className="h-3.5 w-3.5 text-white/40 mb-1" />
                          <span className="text-[10px] font-black text-white">{seatNo}</span>
                        </div>
                      ) : (
                        <>
                          <Armchair className={cn(
                            "h-3.5 w-3.5 mb-1 transition-all duration-500",
                            isSelected ? "text-white scale-110" : "text-slate-200 group-hover:text-primary/40"
                          )} />
                          <span className={cn(
                            "text-xs font-black transition-all duration-500",
                            isSelected ? "text-white" : "text-slate-400 group-hover:text-primary"
                          )}>
                            {seatNo}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                          )}
                        </>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-md shadow-xl p-3">
                    {isOccupied ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{student.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge className={cn(
                                  "h-3.5 px-1.5 text-[8px] font-black uppercase tracking-tighter",
                                  isExpired ? "bg-amber-500" : "bg-slate-900"
                              )}>
                                  {isExpired ? "Expired" : "Active"}
                              </Badge>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Seat {seatNo}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-900">Seat {seatNo}</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Available for Selection</p>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {filteredSeats.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching seats found</p>
          </div>
        )}
      </CardContent>

      <div className="p-6 bg-slate-50/80 border-t border-slate-100 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-200 shadow-sm shadow-slate-100" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-900 shadow-sm shadow-slate-900/20" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/20" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Expired</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/20" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Selected</span>
            </div>
          </div>
          <Info className="h-4 w-4 text-slate-300" />
        </div>
      </div>
    </Card>
  );
}
