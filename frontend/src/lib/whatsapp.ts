import { getLibraryName } from "./auth";

interface WhatsAppParams {
  phone: string | undefined;
  message: string;
}

/**
 * Opens WhatsApp with a pre-filled message for the given phone number.
 */
export const sendWhatsApp = ({ phone, message }: WhatsAppParams) => {
  if (!phone) return;
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Default to Indian country code if only 10 digits are provided
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

/**
 * Predefined message templates for student communication
 */
export const waTemplates = {
  // 1. Welcome Message
  welcome: (name: string) => {
    const library = getLibraryName() || "our institute";
    return `Hello ${name}! Welcome to ${library}. We are thrilled to have you join us. Please let us know if you need any assistance getting started.`;
  },

  // 2. Registration Confirmation (Detailed)
  registration: (data: { 
    name: string; 
    regNo: string; 
    seatNo: string; 
    monthlyRate: string;
    deposited: string;
    pending: string;
    period: string;
    joiningDate: string;
    validity: string;
  }) => {
    const library = getLibraryName() || "our institute";
    return `*✨ Registration Successful - ${library} ✨*

Dear *${data.name}*, 

Welcome to our library! Your registration has been processed successfully.

*Member Details:*
━━━━━━━━━━━━━━━━━━━━
🆔 *Reg No:* ${data.regNo}
💺 *Seat No:* ${data.seatNo}
📅 *Joined On:* ${data.joiningDate}
⏳ *Validity:* ${data.validity}
🗓️ *Period:* ${data.period}

*Financial Summary:*
━━━━━━━━━━━━━━━━━━━━
💰 *Monthly Rate:* ${data.monthlyRate}
✅ *Fees Paid:* ${data.deposited}
⏳ *Balance Due:* ${data.pending}

We look forward to having you with us. Please present this receipt if requested at the counter.

Happy Studying! 📚`;
  },

  // 2b. Re-admission Confirmation (Detailed)
  readmission: (data: { 
    name: string; 
    regNo: string; 
    seatNo: string; 
    monthlyRate: string;
    deposited: string;
    pending: string;
    period: string;
    joiningDate: string;
    validity: string;
  }) => {
    const library = getLibraryName() || "our institute";
    return `*✨ Welcome Back! - ${library} ✨*

Dear *${data.name}*, 

We are delighted to have you back! Your re-admission has been processed successfully.

*Membership Details:*
━━━━━━━━━━━━━━━━━━━━
🆔 *Reg No:* ${data.regNo}
💺 *Seat No:* ${data.seatNo}
📅 *Re-joined On:* ${data.joiningDate}
⏳ *New Validity:* ${data.validity}
🗓️ *Duration:* ${data.period}

*Financial Summary:*
━━━━━━━━━━━━━━━━━━━━
💰 *Monthly Rate:* ${data.monthlyRate}
✅ *Fees Paid:* ${data.deposited}
⏳ *Balance Due:* ${data.pending}

Your seat is now active. We wish you the best for your studies! 📚`;
  },

  // 3. Payment / Invoice Receipt
  invoice: (name: string, amount: string, link: string) => {
    const library = getLibraryName() || "our institute";
    return `Hi ${name}, thank you for your payment of ${amount} to ${library}. Your digital receipt is ready.\n\nView/Download Invoice: ${link}\n\nThank you for your continued support!`;
  },

  // 4. Renewal Reminder
  renewalReminder: (name: string, expiry: string) => {
    const library = getLibraryName() || "our institute";
    return `Hi ${name}, this is a friendly reminder that your membership at ${library} is expiring on ${expiry}.\n\nPlease renew your membership to ensure uninterrupted access to your assigned seat.\n\nThank you!`;
  },

  // 5. Due Fees Alert
  dueFees: (name: string, amount: string) => {
    const library = getLibraryName() || "our institute";
    return `Hi ${name}, this is a reminder regarding a pending fee of ${amount} for your membership at ${library}.\n\nWe request you to clear the outstanding balance at your earliest convenience to maintain your active status.\n\nThank you!`;
  },

  // 6. Renewal Confirmation (Detailed)
  renewalSuccess: (name: string, amount: string, validity: string) => {
    const library = getLibraryName() || "our institute";
    return `*✨ Membership Renewed - ${library} ✨*

Dear *${name}*, 

Your membership has been successfully extended. Thank you for your continued support!

*Transaction Details:*
━━━━━━━━━━━━━━━━━━━━
✅ *Amount Paid:* ${amount}
📅 *New Validity:* ${validity}
📊 *Status:* Active Member

We appreciate your association with us. Happy studying! 📚`;
  },

  // 7. Dues Clearance Confirmation (Detailed)
  settlementSuccess: (name: string, amount: string, validity: string) => {
    const library = getLibraryName() || "our institute";
    return `*✨ Fees Settled - ${library} ✨*

Dear *${name}*, 

Thank you for clearing your outstanding dues. Your account is now fully updated.

*Payment Details:*
━━━━━━━━━━━━━━━━━━━━
✅ *Settled Amount:* ${amount}
⏳ *Current Validity:* ${validity}
📊 *Payment Status:* All Dues Cleared

Thank you for your cooperation! 📚`;
  }
};
