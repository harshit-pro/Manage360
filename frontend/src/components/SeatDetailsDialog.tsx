import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  User, 
  Phone,
  Calendar,
  CreditCard,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendWhatsApp, waTemplates } from "@/lib/whatsapp";

interface Seat {
  id: number;
  number: string;
  available: boolean;
  student?: {
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

interface SeatDetailsDialogProps {
  seat: Seat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeatDetailsDialog({ seat, open, onOpenChange }: SeatDetailsDialogProps) {
  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
              <div className="h-2 w-8 bg-primary rounded-full" />
              Seat {seat.number}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          <div className="mx-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={cn(
                 "h-10 w-10 rounded-xl flex items-center justify-center",
                 seat.available ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
               )}>
                 <Clock className="h-5 w-5" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Occupancy</span>
                 <span className="font-bold text-slate-900">{seat.available ? "Station Available" : "Station Occupied"}</span>
               </div>
            </div>
            <Badge className={cn(
              "rounded-lg px-3 py-1 font-bold",
              seat.available ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            )}>
              {seat.available ? "Free" : "Booked"}
            </Badge>
          </div>

          {!seat.available && seat.student && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 px-8 pb-8">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                 <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <User className="h-3 w-3" /> Identity
                    </div>
                    <div className="font-bold text-slate-900 truncate">{seat.student.name}</div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">#{seat.student.regNo || "Unknown"}</span>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <Phone className="h-3 w-3" /> Contact
                    </div>
                    <div className="font-bold text-slate-900">{seat.student.mobile}</div>
                 </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Calendar className="h-4 w-4" /> Validity
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900">
                        {seat.student.activeUntil ? format(new Date(seat.student.activeUntil), "dd MMM yyyy") : "N/A"}
                      </span>
                      {seat.student.isExpired && (
                        <span className="text-[9px] font-black uppercase text-rose-500 flex items-center gap-1">
                          <AlertCircle className="h-2 w-2" /> Expired
                        </span>
                      )}
                    </div>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <CreditCard className="h-4 w-4" /> Financial Status
                    </div>
                    <Badge className={cn(
                      "rounded-lg font-bold",
                      seat.student.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )} variant="outline">
                      {seat.student.paymentStatus === "paid" ? "Settled" : "Dues Pending"}
                    </Badge>
                 </div>
              </div>

              <div className="pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full h-14 rounded-2xl font-black bg-slate-950 text-white gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                      <MessageSquare className="h-5 w-5" />
                      Communicate Protocol
                      <Send className="h-4 w-4 opacity-50 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[300px] rounded-2xl p-2 shadow-2xl border-slate-100" align="end">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Crown className="h-3 w-3 text-amber-500" />
                      Select Communication Channel
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="rounded-xl py-3 cursor-pointer group"
                      onClick={() => sendWhatsApp({
                        phone: seat.student?.mobile,
                        message: waTemplates.welcome(seat.student!.name)
                      })}
                    >
                      <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">Welcome Message</span>
                        <span className="text-[10px] text-slate-400">Greet new library members</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="rounded-xl py-3 cursor-pointer group"
                      onClick={() => sendWhatsApp({
                        phone: seat.student?.mobile,
                        message: waTemplates.renewalReminder(seat.student!.name, seat.student?.activeUntil ? format(new Date(seat.student!.activeUntil), "dd MMM") : "soon")
                      })}
                    >
                      <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mr-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">Renewal Reminder</span>
                        <span className="text-[10px] text-slate-400">Notify about membership expiry</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      className="rounded-xl py-3 cursor-pointer group"
                      onClick={() => sendWhatsApp({
                        phone: seat.student?.mobile,
                        message: waTemplates.dueFees(seat.student!.name, seat.student?.totalDue || "pending amount")
                      })}
                    >
                      <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mr-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">Fees Overdue Alert</span>
                        <span className="text-[10px] text-slate-400">Request payment of pending dues</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
