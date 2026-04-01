import api from "./api";

export type MonthlyPaymentItem = {
  paymentId: string;
  type: "MEMBERSHIP_RENEWAL" | "SEASONAL_FEE" | "OTHER";
  method: "CASH" | "UPI" | "CARD";
  amount: number;
  paidAt: string; // ISO timestamp
  periodStart?: string | null; // yyyy-MM-dd
  periodEnd?: string | null; // yyyy-MM-dd
  studentId: string;
  studentName: string;
  regNo: string;
  seatNo?: string | null;
  dateOfJoining?: string | null; // yyyy-MM-dd
  mobileNo?: string | null;
  note?: string | null;
};

export async function fetchMonthlyReport(year: number, month: number): Promise<MonthlyPaymentItem[]> {
  const res = await api.get("/reports/monthly", { params: { year, month } });
  return res.data;
}

export async function sendInvoiceWhatsApp(paymentId: string): Promise<void> {
  await api.post(`/invoices/${paymentId}/send-whatsapp`);
}

export async function fetchInvoicePdf(paymentId: string): Promise<Blob> {
  const res = await api.get(`/invoices/${paymentId}.pdf`, { responseType: "blob" });
  return res.data as Blob;
}

