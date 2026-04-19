import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listAllStudents, searchStudents, Student, toggleEnrollment } from "@/lib/students";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StudentDetailsDialog from "@/components/StudentDetailsDialog";
import EditStudentDialog from "@/components/EditStudentDialog";
import { format, parseISO } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { 
  Pencil, 
  Search, 
  User, 
  MapPin, 
  Calendar, 
  Users, 
  MoreVertical, 
  Eye, 
  Filter, 
  Download,
  AlertCircle,
  Hash,
  ArrowUpDown,
  MessageSquare,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendWhatsApp, waTemplates } from "@/lib/whatsapp";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentsAll({ embedded = false }: { embedded?: boolean }) {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);
    const [editTarget, setEditTarget] = useState<Student | null>(null);
    const [isReAdmission, setIsReAdmission] = useState(false);
    const [tick, setTick] = useState(0);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"name" | "newest">("newest");

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const data = q ? await searchStudents(q) : await listAllStudents();
                setStudents(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Failed to load students", e);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [q, tick, tab]);

    // Intelligent Sorting
    const sortedStudents = useMemo(() => {
        if (sortBy === "name") {
            return [...students].sort((a, b) => a.name.localeCompare(b.name));
        } else {
            return [...students].sort((a, b) => {
                // Secondary sort by regNo if DOJ is missing
                const dateA = a.dateOfJoining || "";
                const dateB = b.dateOfJoining || "";
                return dateB.localeCompare(dateA) || (b.regNo || "").localeCompare(a.regNo || "");
            });
        }
    }, [students, sortBy]);

    const activeCount = useMemo(() => students.filter(s => s.isEnrolled !== false).length, [students]);

    const handleToggleEnrollment = async (s: Student, checked: boolean) => {
        // If we are activating a currently INACTIVE/ARCHIVED student
        if (checked && s.isEnrolled === false) {
            setEditTarget(s);
            setIsReAdmission(true);
            return;
        }

        try {
            await toggleEnrollment(s.id, checked);
            setTick((t) => t + 1);
        } catch (e) {
            console.error("Failed to toggle enrollment", e);
        }
    };

    const regOf = (s: Student) => s.regNo || "—";

    return (
        <div className={cn("flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700", embedded ? "" : "container mx-auto py-8 px-4")}>
            
            {/* Header / Stats Section */}
            {!embedded && (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Student Directory</h1>
                      </div>
                      <p className="text-slate-500 font-medium max-w-lg">Manage all registrations, monitor active memberships, and update student profiles in one place.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                      <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm min-w-[140px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</span>
                          <span className="text-2xl font-black text-slate-900">{students.length}</span>
                      </div>
                      <div className="flex flex-col rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm min-w-[140px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active Now</span>
                          <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
                      </div>
                  </div>
              </div>
            )}

            {/* Toolbar Section */}
            <Card className="rounded-[2rem] border-slate-200/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
                <CardContent className="p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search by name, ID, mobile, seat..." 
                                value={q} 
                                onChange={(e) => setQ(e.target.value)} 
                                className="h-14 rounded-2xl border-slate-200 pl-11 text-base placeholder:text-slate-400 focus:ring-primary/20 hover:border-primary/20 transition-all shadow-sm"
                            />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            <Button 
                              variant={sortBy === "newest" ? "default" : "outline"} 
                              onClick={() => setSortBy("newest")}
                              className="h-10 sm:h-14 rounded-xl sm:rounded-2xl px-3 sm:px-6 text-xs sm:text-base font-bold gap-2"
                            >
                                <Clock className="h-4 w-4" />
                                <span className="hidden xs:inline">Newest</span>
                                <span className="xs:hidden">New</span>
                            </Button>
                            <Button 
                              variant={sortBy === "name" ? "default" : "outline"} 
                              onClick={() => setSortBy("name")}
                              className="h-10 sm:h-14 rounded-xl sm:rounded-2xl px-3 sm:px-6 text-xs sm:text-base font-bold gap-2"
                            >
                                <ArrowUpDown className="h-4 w-4" />
                                <span className="hidden xs:inline">Alphabetical</span>
                                <span className="xs:hidden">Alpha</span>
                            </Button>
                            <Button className="h-10 sm:h-14 rounded-xl sm:rounded-2xl px-3 sm:px-6 text-xs sm:text-base font-bold shadow-xl shadow-primary/20 gap-2">
                                <Download className="h-4 w-4" />
                                <span className="hidden xs:inline">Export</span>
                                <span className="xs:hidden">Exp</span>
                            </Button>
                        </div>
                    </div>

                    {/* Desktop View Table */}
                    <div className="hidden lg:block mt-8 overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/30">
                        <Table>
                            <TableHeader className="bg-slate-900/5">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-slate-500 py-6 pl-8 flex items-center gap-1 group cursor-pointer h-full">Student <ArrowUpDown className="h-3 w-3 group-hover:text-primary" /> </TableHead>
                                    <TableHead className="font-bold text-slate-500">ID & Seat</TableHead>
                                    <TableHead className="font-bold text-slate-500">Contact & Address</TableHead>
                                    <TableHead className="font-bold text-slate-500">Joining Date</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-center">Membership</TableHead>
                                    <TableHead className="font-bold text-slate-500 text-right pr-8">Manage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                  Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                      <TableCell colSpan={6} className="h-16 bg-slate-50/20" />
                                    </TableRow>
                                  ))
                                ) : sortedStudents.map((s) => (
                                    <TableRow key={s.id} className="group hover:bg-white transition-colors border-slate-100 duration-200">
                                        <TableCell className="py-5 pl-8">
                                            <div 
                                                className="flex items-center gap-3 cursor-pointer group/item"
                                                onClick={() => setSelected(s)}
                                            >
                                                <div className="h-11 w-11 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-slate-100 ring-2 ring-primary/10 shadow-sm group-hover/item:ring-primary/30 transition-all duration-300">
                                                  <Avatar className="h-full w-full">
                                                    <AvatarImage src={s.photo} className="object-cover" />
                                                    <AvatarFallback className="bg-gradient-to-br from-slate-50 to-slate-100 text-primary font-black text-xs">
                                                      {s.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                </div>
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-slate-900 leading-none mb-1 group-hover/item:text-primary transition-colors">{s.name}</span>
                                                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{s.mobileNo || "No Mobile"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit font-mono text-[10px] text-slate-500 bg-slate-100/50 border-slate-200">{regOf(s)}</Badge>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                              <Hash className="h-3 w-3 text-primary" />
                                              Seat: {s.seatNo}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="max-w-[180px]">
                                            <div className="flex items-start gap-2">
                                              <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-300 shrink-0" />
                                              <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{s.address || "Add address..."}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                              <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                              <span className="text-xs">{s.dateOfJoining ? format(parseISO(s.dateOfJoining.slice(0, 10)), "dd MMM, yyyy") : "—"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-center gap-2">
                                              <Badge className={cn(
                                                  "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border-none shadow-sm",
                                                  s.isEnrolled !== false ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                                              )}>
                                                {s.isEnrolled !== false ? "Active" : "Archived"}
                                              </Badge>
                                              <Switch 
                                                checked={s.isEnrolled !== false} 
                                                onCheckedChange={(v) => handleToggleEnrollment(s, v)} 
                                                className="scale-90 data-[state=checked]:bg-emerald-500"
                                              />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-1">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => sendWhatsApp({ phone: s.mobileNo, message: waTemplates.welcome(s.name) })} 
                                                className="h-10 w-10 p-0 rounded-xl hover:bg-emerald-50 hover:text-emerald-600"
                                                title="Chat via WhatsApp"
                                              >
                                                <MessageSquare className="h-4.5 w-4.5" />
                                              </Button>
                                              <Button variant="ghost" size="sm" onClick={() => setSelected(s)} className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5 hover:text-primary">
                                                <Eye className="h-4.5 w-4.5" />
                                              </Button>
                                              <Button variant="ghost" size="sm" onClick={() => setEditTarget(s)} className="h-10 w-10 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600">
                                                <Pencil className="h-4.5 w-4.5" />
                                              </Button>
                                              <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
                                                        <MoreVertical className="h-4.5 w-4.5" />
                                                      </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-slate-100">
                                                      <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-2 cursor-pointer">
                                                          <Download className="h-3.5 w-3.5" /> Download ID Card
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-2 cursor-pointer">
                                                          <CreditCard className="h-3.5 w-3.5" /> Payment History
                                                      </DropdownMenuItem>
                                                      <DropdownMenuSeparator />
                                                      <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-2 text-red-500 hover:bg-red-50 cursor-pointer">
                                                          <AlertCircle className="h-3.5 w-3.5" /> Terminate Access
                                                      </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="lg:hidden mt-6 space-y-4">
                        {sortedStudents.map((s) => (
                            <div key={s.id} className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50 p-5 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div 
                                        className="flex items-center gap-4 cursor-pointer"
                                        onClick={() => setSelected(s)}
                                    >
                                        <div className="h-14 w-14 rounded-full overflow-hidden bg-white shadow-lg border-2 border-white ring-4 ring-slate-100 transition-transform group-hover:scale-105 duration-300">
                                          <Avatar className="h-full w-full">
                                            <AvatarImage src={s.photo} className="object-cover" />
                                            <AvatarFallback className="flex items-center justify-center text-primary font-black bg-slate-50 text-xl">
                                              {s.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{s.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="text-[9px] font-mono border-slate-200 text-slate-400 px-1.5 h-4 leading-none">{regOf(s)}</Badge>
                                              <span className="text-[10px] font-bold text-slate-400">Seat {s.seatNo}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={s.isEnrolled !== false} 
                                        onCheckedChange={(v) => handleToggleEnrollment(s, v)}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100/50">
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Membership</p>
                                      <div className="flex items-center gap-1.5">
                                        <div className={cn("h-2 w-2 rounded-full", s.isEnrolled !== false ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-slate-300")} />
                                        <span className="text-xs font-bold text-slate-600">{s.isEnrolled !== false ? "Active" : "Inactive"}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Joined</p>
                                      <span className="text-xs font-bold text-slate-600">{s.dateOfJoining ? format(parseISO(s.dateOfJoining.slice(0, 10)), "dd MMM, yy") : "—"}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-300" />
                                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{s.address || "No address provided"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => sendWhatsApp({ phone: s.mobileNo, message: waTemplates.welcome(s.name) })} 
                                      className="h-10 w-10 p-0 rounded-2xl bg-white shadow-sm border border-emerald-100 text-emerald-600"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSelected(s)} className="h-10 w-10 p-0 rounded-2xl bg-white shadow-sm border border-slate-100">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(s)} className="h-10 w-10 p-0 rounded-2xl bg-white shadow-sm border border-slate-100">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sortedStudents.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                              <Search className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                            <p className="text-slate-500 max-w-xs mt-1">Try adjusting your search query or clear the filter to see all registrations.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selected && (
                <StudentDetailsDialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)} student={selected} />
            )}

            <EditStudentDialog
                open={!!editTarget}
                student={editTarget}
                isReAdmission={isReAdmission}
                onOpenChange={(o) => {
                  if (!o) {
                    setEditTarget(null);
                    setIsReAdmission(false);
                  }
                }}
                onSaved={(updated) => {
                    setStudents((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
                    setEditTarget(null);
                    setIsReAdmission(false);
                }}
            />
        </div>
    );
}

// Custom CreditCard icon helper for dropdown
function CreditCard({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  );
}
