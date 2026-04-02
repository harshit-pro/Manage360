import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchPaymentDetails, fetchInvoicePdf, type MonthlyPaymentItem } from "@/lib/reports";
import { getLibraryName } from "@/lib/auth";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Award,
  CircleDot,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const InvoiceDetail = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<MonthlyPaymentItem | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
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

  const handleDownload = async () => {
    if (!paymentId || !payment || !invoiceRef.current) return;
    try {
      setDownloading(true);

      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High scale for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${payment.studentName.replace(/\s+/g, "_")}_${paymentId.substring(0, 8)}.pdf`);

      toast({
        title: "Download Complete",
        description: "Your digital receipt has been saved.",
      });
    } catch (err) {
      console.error("PDF Generation failed", err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate invoice. Please use the Print option.",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!payment) return;
    const shareData = {
      title: `Invoice from ${libraryName}`,
      text: `Hello ${payment.studentName}, here is your digital receipt for ${formatCurrency(payment.amount)}.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed", err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Invoice URL saved to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full sm:h-10 sm:w-10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <h1 className="text-sm font-bold text-slate-900 sm:text-lg">Receipt</h1>
              <p className="text-[10px] font-medium text-slate-500 sm:text-xs">#INV-{paymentId?.substring(0, 6).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-lg border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 sm:h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg border-slate-200 px-2 text-[10px] sm:h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden xs:inline">{copied ? "Copied" : "Copy"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg border-slate-200 px-2 text-[10px] sm:h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              onClick={handlePrint}
            >
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Print</span>
            </Button>
            <Button
              size="sm"
              disabled={downloading}
              className="h-8 gap-1.5 rounded-lg shadow-lg shadow-primary/20 px-2 text-[10px] sm:h-10 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              onClick={handleDownload}
            >
              {downloading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-4 sm:w-4" />
              ) : (
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span>{downloading ? "..." : "PDF"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="mx-auto mt-4 max-w-[210mm] px-4 sm:mt-8 sm:px-0 print:mt-0 print:max-w-none print:px-0" ref={invoiceRef}>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:rounded-2xl print:rounded-none print:border-none print:shadow-none">

          {/* Top Navy Accent Strip */}
          <div className="h-1.5 w-full bg-slate-900 sm:h-2 print:h-1" />

          {/* Header Section */}
          <div className="px-5 py-6 sm:px-12 sm:pt-10">
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                    {libraryName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-3xl">{libraryName.toUpperCase()}</h2>
                    <div className="mt-0.5 flex items-center gap-1.5 text-primary sm:mt-1 sm:gap-2">
                      <ShieldCheck className="h-3 w-3 fill-primary/10 sm:h-3.5 sm:w-3.5" />
                      <span className="text-[8px] font-bold uppercase tracking-widest sm:text-[10px]">Official Digital Receipt</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end sm:text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 sm:gap-2 sm:px-4 sm:py-1">
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wide sm:text-xs">Paid</span>
                </div>
                <div className="mt-0 space-y-0.5 sm:mt-4 sm:space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[11px]">Date</p>
                  <p className="text-xs font-bold text-slate-900 sm:text-base">{format(new Date(payment.paidAt), "dd MMM, yyyy")}</p>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="my-6 h-px w-full bg-slate-100 sm:my-10" />

            {/* Billing Grid */}
            <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[11px]">Bill To</p>
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:mt-4 sm:rounded-2xl sm:p-6">
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{payment.studentName}</h3>
                  <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5 sm:pb-2">
                      <span className="text-[10px] font-medium text-slate-500 sm:text-xs">Reg No</span>
                      <span className="text-[10px] font-bold text-slate-900 sm:text-xs">{payment.regNo}</span>
                    </div>
                    {payment.seatNo && (
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5 sm:pb-2">
                        <span className="text-[10px] font-medium text-slate-500 sm:text-xs">Seat</span>
                        <span className="text-[10px] font-bold text-slate-900 sm:text-xs">Seat - {payment.seatNo}</span>
                      </div>
                    )}
                    {payment.mobileNo && (
                      <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                        <span className="text-[10px] font-medium text-slate-500 sm:text-xs">Contact</span>
                        <span className="text-[10px] font-bold text-slate-900 tracking-wide sm:text-xs">{payment.mobileNo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between py-1 sm:py-2">
                <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-col sm:gap-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[11px]">Invoice ID</p>
                    <p className="mt-1 font-mono text-[10px] font-bold text-slate-900 sm:mt-2 sm:text-sm">#INV-{paymentId?.substring(0, 12).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[11px]">Channel</p>
                    <div className="mt-1 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary sm:h-2 sm:w-2" />
                      <p className="text-[10px] font-bold text-slate-900 sm:text-sm">{payment.method}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 sm:mt-0 sm:rounded-xl sm:px-4 sm:py-3">
                  <div className="flex items-center gap-1.5 text-slate-600 sm:gap-2">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-wider sm:text-[11px]">Secure Transaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Table Design */}
            <div className="mt-8 sm:mt-12 overflow-x-auto">
              <div className="min-w-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-sm sm:min-w-0 sm:rounded-2xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-[9px] font-bold uppercase tracking-widest text-slate-400 sm:text-[11px]">
                    <tr>
                      <th className="px-6 py-4 text-white">Service Description</th>
                      <th className="px-6 py-4 text-right text-white">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-8">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold text-slate-900 sm:text-base">
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
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-500 sm:gap-2 sm:text-xs">
                              <span className="hidden xs:inline">Period:</span>
                              <span className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 sm:px-1.5 sm:py-0.5">
                                {format(new Date(payment.periodStart), "dd MMM, yyyy")}
                              </span>
                              <span>—</span>
                              <span className="rounded bg-slate-100 px-1 py-0.5 text-slate-700 sm:px-1.5 sm:py-0.5">
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
                      <td className="px-5 py-4 text-right sm:px-6 sm:py-6">
                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-sm">Grand Total Amount</span>
                      </td>
                      <td className="px-5 py-4 text-right sm:px-6 sm:py-6">
                        <span className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-center text-[9px] font-medium text-slate-400 sm:hidden">
                Swipe horizontally to view full table
              </p>
            </div>

            {/* Terms & Notice */}
            <div className="mt-10 sm:mt-16 pb-8 sm:pb-12">
              <div className="flex flex-col gap-8 border-t border-slate-100 pt-6 sm:gap-6 sm:pt-8 md:flex-row md:justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 sm:text-xs">Policy Notice</h4>
                  <p className="mt-2 max-w-xs text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                    This is an electronically generated document. In accordance with digital record regulations, no physical signature is required.
                  </p>
                </div>
                <div className="flex items-center justify-between md:block md:text-right">
                  <div className="flex flex-col">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 sm:text-xs">Verified By</h4>
                    <p className="mt-1 text-[10px] font-medium text-slate-400 italic sm:text-xs">Manage360 Cloud Platform</p>
                  </div>
                  <div className="mt-0 flex justify-end md:mt-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.href)}`}
                      alt="Verification QR"
                      className="h-10 w-10 opacity-80 mix-blend-multiply sm:h-12 sm:w-12"
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
