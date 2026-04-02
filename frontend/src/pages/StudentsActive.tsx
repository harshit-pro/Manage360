import { useEffect, useMemo, useState } from "react";
import { listActiveStudents, searchStudents, Student } from "@/lib/students";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StudentDetailsDialog from "@/components/StudentDetailsDialog";
import { format, parseISO, isPast } from "date-fns";
import { 
  Search, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Eye, 
  Clock, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentsActive({ embedded = false }: { embedded?: boolean }) {
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                let data: Student[] = [];
                if (q) {
                    const all = await searchStudents(q);
                    data = all.filter(s => s.isEnrolled !== false);
                } else {
                    data = await listActiveStudents();
                }
                setStudents(data);
            } catch (e) {
                console.error("Failed to load active students", e);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [q]);

    const sortedStudents = useMemo(() => {
        return [...students].sort((a, b) => a.name.localeCompare(b.name));
    }, [students]);

    const regOf = (s: Student) => s.regNo || "—";

    return (
        <div className={cn("flex flex-col space-y-6 animate-in fade-in duration-700", embedded ? "" : "container mx-auto py-8 px-4")}>
            
            {/* Header / Banner */}
            {!embedded && (
              <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-600 px-8 py-10 text-white shadow-2xl shadow-emerald-200">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
                
                <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md">
                            <UserCheck className="mr-1 h-3 w-3" />
                            Live Roster
                          </Badge>
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-100/80">Real-time Data</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">Active Members</h1>
                        <p className="max-w-md text-emerald-50/80 font-medium">
                          These students are currently enrolled and have active memberships.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/10 p-6 backdrop-blur-sm border border-white/10 min-w-[120px]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/60">Currently Studying</span>
                            <span className="text-3xl font-black text-white">{students.length}</span>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* Desktop View Table */}
            <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/30">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input 
                                placeholder="Quick filter active students..." 
                                value={q} 
                                onChange={(e) => setQ(e.target.value)} 
                                className="h-12 rounded-2xl border-slate-200 pl-11 shadow-sm focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 hover:bg-slate-50">
                            <Clock className="h-4 w-4" /> Recent First
                          </Button>
                        </div>
                    </div>

                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-slate-400 py-6 pl-10 uppercase text-[10px] tracking-widest">Student Info</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Enrollment</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Membership Period</TableHead>
                                    <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right pr-10">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                  Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                      <TableCell colSpan={4} className="h-20" />
                                    </TableRow>
                                  ))
                                ) : sortedStudents.map((s) => {
                                    const expired = s.activeUntil ? isPast(parseISO(s.activeUntil)) : false;
                                    return (
                                        <TableRow key={s.id} className="group hover:bg-emerald-50/30 transition-all duration-300">
                                            <TableCell className="py-6 pl-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3">
                                                      {s.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <span className="font-bold text-slate-900 text-base">{s.name}</span>
                                                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium whitespace-nowrap">
                                                        <MapPin className="h-3 w-3" />
                                                        {s.address || "No address"}
                                                      </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-4">
                                                <div className="flex flex-col gap-1">
                                                  <Badge variant="outline" className="w-fit font-mono text-[10px] bg-slate-50 border-slate-200">{regOf(s)}</Badge>
                                                  <span className="text-xs font-bold text-slate-600">Seat {s.seatNo}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 border-l pl-4 border-slate-100">
                                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Joined</span>
                                                  <span className="text-xs font-bold text-blue-600">{s.dateOfJoining ? format(parseISO(s.dateOfJoining.slice(0, 10)), "dd MMM, yyyy") : "—"}</span>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex flex-col gap-1.5">
                                                  <div className="flex items-center justify-between max-w-[140px]">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active Until</span>
                                                    {expired && <Badge variant="destructive" className="h-4 px-1 py-0 text-[8px]">Expired</Badge>}
                                                  </div>
                                                  <div className={cn(
                                                    "flex items-center gap-2 text-sm font-black",
                                                    expired ? "text-red-500" : "text-emerald-600"
                                                  )}>
                                                    <ShieldCheck className="h-4 w-4" />
                                                    {s.activeUntil ? format(parseISO(s.activeUntil), "dd MMM, yyyy") : "No Date"}
                                                  </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-10">
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  onClick={() => setSelected(s)} 
                                                  className="h-12 px-6 rounded-2xl hover:bg-emerald-600 hover:text-white font-bold transition-all shadow-hover-emerald"
                                                >
                                                  View Profile <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="lg:hidden p-4 space-y-4">
                        {sortedStudents.map((s) => {
                          const expired = s.activeUntil ? isPast(parseISO(s.activeUntil)) : false;
                          return (
                            <Card key={s.id} className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 font-black">
                                              {s.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
                                                <p className="text-xs text-slate-400 font-mono">{regOf(s)}</p>
                                            </div>
                                        </div>
                                        <Badge className="rounded-xl px-3 py-1 bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] uppercase">Active</Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Seat Allocation</p>
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                                              <Smartphone className="h-3 w-3 text-slate-300" />
                                              {s.seatNo}
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Valid Until</p>
                                            <div className={cn("font-bold text-sm", expired ? "text-red-500" : "text-emerald-600")}>
                                              {s.activeUntil ? format(parseISO(s.activeUntil), "dd MMM, yy") : "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={() => setSelected(s)} className="w-full mt-4 h-12 rounded-2xl font-bold bg-slate-900 text-white gap-2">
                                      View Detailed Profile <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                          )
                        })}
                    </div>

                    {!loading && sortedStudents.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                              <Info className="h-10 w-10 text-emerald-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Roster Empty</h3>
                            <p className="max-w-xs text-slate-500 mt-1">No active members found matching your search. Try broadening your query.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selected && (
                <StudentDetailsDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)} student={selected} />
            )}
        </div>
    );
}
