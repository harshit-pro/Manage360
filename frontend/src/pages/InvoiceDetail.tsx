import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchPaymentDetails, type MonthlyPaymentItem } from "@/lib/reports";
import { getLibraryName } from "@/lib/auth";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Award,
  CircleDot
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const InvoiceDetail = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<MonthlyPaymentItem | null>(null);
  const libraryName = getLibraryName() || "INSTITUTE";

  useEffect(() => {
    if (paymentId) {
      loadPayment();
    }
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const data = await fetchPaymentDetails(paymentId!);
      setPayment(data);
    } catch (err: any) {
      console.error("Failed to load invoice details", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load invoice details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Preparing Your Document...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="rounded-full bg-slate-100 p-4">
          <CircleDot className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Invoice Not Found</h2>
        <p className="mt-2 text-slate-500">The requested invoice could not be located.</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans print:bg-white print:pb-0">
      {/* Action Bar - Hidden in Print */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Official Receipt</h1>
              <p className="text-xs font-medium text-slate-500">#INV-{paymentId?.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-slate-200"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="mx-auto mt-8 max-w-[210mm] print:mt-0 print:max-w-none">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 print:rounded-none print:border-none print:shadow-none">
          
          {/* Top Navy Accent Strip */}
          <div className="h-2 w-full bg-slate-900 print:h-1" />

          {/* Header Section */}
          <div className="px-8 pt-10 sm:px-12">
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                    {libraryName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">{libraryName.toUpperCase()}</h2>
                    <div className="mt-1 flex items-center gap-2 text-primary">
                      <ShieldCheck className="h-3.5 w-3.5 fill-primary/10" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Official Digital Receipt</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wide">Paid in Full</span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date Issued</p>
                  <p className="font-bold text-slate-900">{format(new Date(payment.paidAt), "dd MMMM, yyyy")}</p>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="mt-10 h-px w-full bg-slate-100" />

            {/* Billing Grid */}
            <div className="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Bill To</p>
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                  <h3 className="text-xl font-bold text-slate-900">{payment.studentName}</h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                      <span className="text-xs font-medium text-slate-500">Registry Number</span>
                      <span className="text-xs font-bold text-slate-900">{payment.regNo}</span>
                    </div>
                    {payment.seatNo && (
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <span className="text-xs font-medium text-slate-500">Assigned Seat</span>
                        <span className="text-xs font-bold text-slate-900">Seat - {payment.seatNo}</span>
                      </div>
                    )}
                    {payment.mobileNo && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-medium text-slate-500">Contact</span>
                        <span className="text-xs font-bold text-slate-900 tracking-wide">{payment.mobileNo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between py-2">
                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Invoice Identifier</p>
                    <p className="mt-2 font-mono text-sm font-bold text-slate-900">#INV-{paymentId?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Payment Channel</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-sm font-bold text-slate-900">{payment.method}</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Authenticated Transaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Table Design */}
            <div className="mt-12">
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-white">Service Description</th>
                      <th className="px-6 py-4 text-right text-white">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-8">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-base font-bold text-slate-900">
                            {(() => {
                              if (payment.type === "SEASONAL_FEE") return "Seasonal Administration Fee";
                              if (payment.type === "MEMBERSHIP_RENEWAL") {
                                const isInitial = 
                                  payment.note?.toLowerCase().includes("initial enrollment") || 
                                  (payment.periodStart && payment.dateOfJoining && payment.periodStart === payment.dateOfJoining);
                                return isInitial ? "Initial Enrollment Fee" : "Membership Renewal Fee";
                              }
                              return "Professional Services";
                            })()}
                          </span>
                          {payment.periodStart && payment.periodEnd && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <span>Coverage Period:</span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                                {format(new Date(payment.periodStart), "dd MMM, yyyy")}
                              </span>
                              <span>—</span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                                {format(new Date(payment.periodEnd), "dd MMM, yyyy")}
                              </span>
                            </div>
                          )}
                          {payment.note && (
                            <p className="mt-2 max-w-sm text-xs italic text-slate-400">Note: {payment.note}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-right align-top">
                        <span className="text-lg font-black text-slate-900">{formatCurrency(payment.amount)}</span>
                      </td>
                    </tr>
                    {/* Grand Total Row */}
                    <tr className="bg-slate-900/5">
                      <td className="px-6 py-6 text-right">
                        <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">Grand Total Amount</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms & Notice */}
            <div className="mt-16 pb-12">
              <div className="flex flex-col gap-6 border-t border-slate-100 pt-8 sm:flex-row sm:justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Legal Notice</h4>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
                    This is an electronically generated document. In accordance with digital record regulations, no physical signature is required. All services are subject to the terms of the institution.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Verified System</h4>
                  <p className="mt-2 text-xs font-medium text-slate-400 italic">Manage360 Cloud Platform</p>
                  <div className="mt-4 flex justify-start sm:justify-end">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.href)}`}
                      alt="Verification QR" 
                      className="h-12 w-12 opacity-80 mix-blend-multiply"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-8 py-4 sm:px-12">
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              © {new Date().getFullYear()} Manage360 Cloud
            </p>
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="text-[10px] font-black tracking-tight text-slate-900 underline underline-offset-4">SECURE TRANSACTION</span>
            </div>
          </div>
        </div>

        {/* Print only notice */}
        <p className="mt-6 hidden text-center text-[10px] font-medium text-slate-400 print:block">
          Original Document Generated via Manage360 Secure Gateway. Verification code: {paymentId?.substring(0, 12)}
        </p>
      </div>
    </div>
  );
};

export default InvoiceDetail;
