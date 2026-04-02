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
  UserCheck
} from "lucide-react";
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
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header Banner */}
                <div className={cn(
                  "p-8 text-white relative flex flex-col items-center sm:flex-row sm:items-end gap-6",
                  isActive ? "bg-emerald-600" : "bg-slate-900"
                )}>
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                      <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="h-28 w-28 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-4xl font-black shrink-0" style={{ color: isActive ? '#10b981' : '#0f172a' }}>
                        {student.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col items-center sm:items-start space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                            Official Profile
                          </Badge>
                          {isActive ? (
                            <Badge className="bg-emerald-400 text-emerald-950 font-black px-3 py-1 text-[10px] uppercase">Active Member</Badge>
                          ) : (
                            <Badge variant="destructive" className="font-black px-3 py-1 text-[10px] uppercase">Inactive / Expired</Badge>
                          )}
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-center sm:text-left">{student.name}</h2>
                        <div className="flex items-center gap-4 text-white/70 text-sm font-medium">
                          <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {student.regNo}</span>
                          <span className="flex items-center gap-1 text-emerald-200"><UserCheck className="h-3 w-3" /> Seat {student.seatNo}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-8 space-y-8 bg-white max-h-[60vh] overflow-y-auto">
                    {sections.map((section, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                          <section.icon className="h-3.5 w-3.5" />
                          {section.title}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {section.fields.map((field, fIdx) => (
                            <div key={fIdx} className={cn(
                              "flex items-start gap-4 p-4 rounded-3xl border border-slate-50 bg-slate-50/30 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 hover:border-slate-100",
                              field.fullWidth && "sm:col-span-2"
                            )}>
                              <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                <field.icon className="h-4 w-4 text-slate-400" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{field.label}</span>
                                <span className={cn(
                                  "text-sm font-bold text-slate-800 truncate",
                                  field.mono && "font-mono font-medium",
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

                {/* Footer */}
                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl h-12 px-8 font-bold text-slate-600 border-slate-200">
                      Close Profile
                    </Button>
                    <Button className="rounded-2xl h-12 px-8 font-black bg-slate-900 shadow-xl shadow-slate-200/50">
                      Print ID Card
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
