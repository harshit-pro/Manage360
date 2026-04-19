import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { StudentView } from "@/lib/students";
import { format, parseISO, isPast } from "date-fns";
import { 
  User, 
  MapPin, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Hash, 
  Gem, 
  Info,
  Users,
  AlertCircle,
  Clock,
  Briefcase,
  Contact,
  X,
  UserCheck,
  Camera
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = { open: boolean; onOpenChange: (o: boolean) => void; student: StudentView };

export default function StudentDetailsDialog({ open, onOpenChange, student }: Props) {
    const activeUntil = student.activeUntil ?? student.membership?.activeUntil;
    const membershipStatus = student.membership?.status ?? (student.isExpired ? "EXPIRED" : "ACTIVE");
    const isExpired = student.isExpired ?? membershipStatus === "EXPIRED";
    const isActive = student.isEnrolled !== false && !isExpired;

    const sections = [
      {
        title: "Personal Identity",
        icon: User,
        fields: [
          { label: "Full Name", value: student.name, icon: User },
          { label: "Gender", value: student.gender, icon: Users },
          { label: "Aadhar", value: student.aadharNo, icon: Contact },
          { label: "Reg No", value: student.regNo, icon: Hash, mono: true },
        ]
      },
      {
        title: "Contact & Location",
        icon: MapPin,
        fields: [
          { label: "Mobile", value: student.mobileNo, icon: Smartphone },
          { label: "Guardian", value: student.guardianName, icon: ShieldCheck },
          { label: "Guardian Mobile", value: student.guardianMobile, icon: Smartphone },
          { label: "Address", value: student.address, icon: MapPin, fullWidth: true },
        ]
      },
      {
        title: "Library Enrollment",
        icon: Briefcase,
        fields: [
          { label: "Seat No", value: student.seatNo, icon: Hash, highlight: true },
          { label: "Joining Date", value: student.dateOfJoining ? format(parseISO(student.dateOfJoining.slice(0, 10)), "dd MMM, yyyy") : "—", icon: Calendar },
          { label: "Membership", value: membershipStatus, icon: Clock, status: true },
          { label: "Fees / Month", value: student.seasonalFees ? `₹${student.seasonalFees}` : "—", icon: CreditCard },
          { label: "Total Deposited", value: student.feesDeposited !== undefined ? `₹${student.feesDeposited}` : "—", icon: CreditCard },
          { label: "Validity", value: activeUntil ? format(parseISO(activeUntil.slice(0, 10)), "dd MMM, yyyy") : "—", icon: Calendar, highlight: true },
        ]
      }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
                {/* Header Banner - Fixed size */}
                <div className={cn(
                  "pt-14 pb-8 px-6 sm:pt-16 sm:pb-10 sm:px-10 text-white relative flex flex-col items-center sm:flex-row sm:items-end gap-6 shrink-0",
                  isActive ? "bg-emerald-600" : "bg-slate-900"
                )}>
                    {/* Background Decorative Element */}
                    <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute left-0 bottom-0 h-32 w-32 rounded-full bg-black/5 blur-2xl -translate-x-1/3 translate-y-1/3" />

                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                      <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-9 w-9 p-0 rounded-full hover:bg-white/10 text-white">
                        <X className="h-4.5 w-4.5" />
                      </Button>
                    </div>

                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center shrink-0 relative z-10 border-4 border-white ring-8 ring-white/10">
                        <Avatar className="h-full w-full">
                            <AvatarImage src={student.photo} className="object-cover" />
                            <AvatarFallback className="text-4xl sm:text-5xl font-black bg-white" style={{ color: isActive ? '#10b981' : '#0f172a' }}>
                                {student.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex flex-col items-center sm:items-start space-y-3 relative z-10 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md px-3 py-1 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest border border-white/10">
                            Official Profile
                          </Badge>
                          {isActive ? (
                            <Badge className="bg-emerald-400 text-emerald-950 font-black px-3 py-1 text-[8px] sm:text-[9px] uppercase shadow-lg shadow-emerald-950/20">Active Member</Badge>
                          ) : (
                            <Badge variant="destructive" className="font-black px-3 py-1 text-[8px] sm:text-[9px] uppercase shadow-lg shadow-red-900/20">Inactive / Expired</Badge>
                          )}
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-center sm:text-left leading-tight drop-shadow-sm line-clamp-1">{student.name}</h2>
                        <div className="flex items-center justify-center sm:justify-start gap-4 text-white/80 text-[10px] sm:text-xs font-bold tracking-wide">
                          <span className="flex items-center gap-1.5 opacity-90"><Hash className="h-3 w-3" /> {student.regNo}</span>
                          <span className="flex items-center gap-1.5 text-emerald-100"><UserCheck className="h-3 w-3" /> Seat {student.seatNo}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="p-5 sm:p-8 space-y-8 bg-white overflow-y-auto flex-1 scrollbar-hide">
                    {sections.map((section, idx) => (
                      <div key={idx} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="flex items-center gap-2 px-1">
                          <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                             <section.icon className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {section.title}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {section.fields.map((field, fIdx) => (
                            <div key={fIdx} className={cn(
                              "flex items-center gap-4 p-4 rounded-3xl border border-slate-100/60 bg-slate-50/20 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-100 group",
                              field.fullWidth && "sm:col-span-2"
                            )}>
                              <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <field.icon className="h-4.5 w-4.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{field.label}</span>
                                <span className={cn(
                                  "text-sm font-bold text-slate-800 truncate",
                                  field.mono && "font-mono font-medium tracking-tight",
                                  field.highlight && (isActive ? "text-emerald-600" : "text-primary"),
                                  field.status && (isActive ? "text-emerald-500" : "text-red-500")
                                )}>
                                  {String(field.value || "—")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Footer - Fixed size */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-2xl h-11 px-8 font-bold text-slate-600 border-slate-200">
                      Close Profile
                    </Button>
                    <Button className="w-full sm:w-auto rounded-2xl h-11 px-10 font-black bg-slate-950 text-white shadow-xl shadow-slate-200/60 transition-all active:scale-95">
                      Print ID Card
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
