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

  // 2. Registration Confirmation
  registration: (name: string, seat: string, validity: string) => {
    const library = getLibraryName() || "our institute";
    return `Hi ${name}, your registration at ${library} is successful!\n\nSeat Assignment: ${seat}\nMembership Valid Until: ${validity}\n\nWe look forward to seeing you. Thank you for choosing us!`;
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

  // 6. Renewal Success
  renewalSuccess: (name: string, amount: string, validity: string) => {
    const library = getLibraryName() || "our institute";
    return `Hi ${name}, your membership at ${library} has been successfully renewed!\n\nAmount Paid: ${amount}\nNew Validity: ${validity}\n\nThank you for your continued association!`;
  },

  // 7. Payment Settlement Success (Pending Fees)
  settlementSuccess: (name: string, amount: string, validity: string) => {
    const library = getLibraryName() || "our institute";
    return `Hi ${name}, thank you for clearing your outstanding dues of ${amount} at ${library}.\n\nYour membership is now up to date.\nNew Validity: ${validity}\n\nThank you!`;
  }
};
