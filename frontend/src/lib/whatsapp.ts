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
 * Helper to get custom template from localStorage or fallback to default
 */
const getCustomTemplate = (key: string, defaultText: string): string => {
  try {
    const json = localStorage.getItem('messageTemplates');
    if (json) {
      const templates = JSON.parse(json);
      return templates[key] || defaultText;
    }
  } catch (e) {
    console.error("Error loading custom templates", e);
  }
  return defaultText;
};

/**
 * Replace placeholders like {{student_name}} with actual data
 */
const formatTemplate = (template: string, data: Record<string, string>) => {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  // Also handle global variables
  result = result.replace(/{{library_name}}/g, getLibraryName() || "our institute");
  return result;
};

/**
 * Predefined message templates for student communication
 */
export const waTemplates = {
  // 1. Welcome Message
  welcome: (name: string) => {
    const template = getCustomTemplate('welcome', "Hello {{student_name}}! Welcome to {{library_name}}. We are thrilled to have you join us. Please let us know if you need any assistance getting started.");
    return formatTemplate(template, { student_name: name });
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
    const template = getCustomTemplate('registration', `*✨ Registration Successful - {{library_name}} ✨*

Dear *{{student_name}}*, 

Welcome to our library! Your registration has been processed successfully.

*Member Details:*
━━━━━━━━━━━━━━━━━━━━
🆔 *Reg No:* {{reg_no}}
💺 *Seat No:* {{seat_no}}
📅 *Joined On:* {{joining_date}}
⏳ *Validity:* {{validity}}
🗓️ *Period:* {{period}}

*Financial Summary:*
━━━━━━━━━━━━━━━━━━━━
💰 *Monthly Rate:* {{monthly_rate}}
✅ *Fees Paid:* {{deposited}}
⏳ *Balance Due:* {{pending}}

We look forward to having you with us. Please present this receipt if requested at the counter.

Happy Studying! 📚`);
    
    return formatTemplate(template, {
      student_name: data.name,
      reg_no: data.regNo,
      seat_no: data.seatNo,
      joining_date: data.joiningDate,
      validity: data.validity,
      period: data.period,
      monthly_rate: data.monthlyRate,
      deposited: data.deposited,
      pending: data.pending
    });
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
     // Re-uses registration template logic for now or could have its own
     return waTemplates.registration(data);
  },

  // 3. Payment / Invoice Receipt
  invoice: (name: string, amount: string, link: string) => {
    const template = getCustomTemplate('invoice', "Hi {{student_name}}, thank you for your payment of {{amount}} to {{library_name}}. Your digital receipt is ready.\n\nView/Download Invoice: {{invoice_link}}\n\nThank you for your continued support!");
    return formatTemplate(template, {
      student_name: name,
      amount: amount,
      invoice_link: link
    });
  },

  // 4. Renewal Reminder
  renewalReminder: (name: string, expiry: string) => {
    const template = getCustomTemplate('reminder', "Hi {{student_name}}, this is a friendly reminder that your membership at {{library_name}} is expiring on {{expiry_date}}.\n\nPlease renew your membership to ensure uninterrupted access to your assigned seat.\n\nThank you!");
    return formatTemplate(template, {
      student_name: name,
      expiry_date: expiry
    });
  },

  // 5. Due Fees Alert
  dueFees: (name: string, amount: string) => {
    const template = getCustomTemplate('dues', "Hi {{student_name}}, this is a reminder regarding a pending fee of {{amount}} for your membership at {{library_name}}.\n\nWe request you to clear the outstanding balance at your earliest convenience to maintain your active status.\n\nThank you!");
    return formatTemplate(template, {
      student_name: name,
      amount: amount
    });
  },

  // 6. Renewal Confirmation (Detailed)
  renewalSuccess: (name: string, amount: string, validity: string) => {
    const template = getCustomTemplate('renewal', `*✨ Membership Renewed - {{library_name}} ✨*

Dear *{{student_name}}*, 

Your membership has been successfully extended. Thank you for your continued support!

*Transaction Details:*
━━━━━━━━━━━━━━━━━━━━
✅ *Amount Paid:* {{amount}}
📅 *New Validity:* {{validity}}
📊 *Status:* Active Member

We appreciate your association with us. Happy studying! 📚`);
    
    return formatTemplate(template, {
      student_name: name,
      amount: amount,
      validity: validity
    });
  },

  // 7. Dues Clearance Confirmation (Detailed)
  settlementSuccess: (name: string, amount: string, validity: string) => {
    const template = getCustomTemplate('settlement', `*✨ Fees Settled - {{library_name}} ✨*

Dear *{{student_name}}*, 

Thank you for clearing your outstanding dues. Your account is now fully updated.

*Payment Details:*
━━━━━━━━━━━━━━━━━━━━
✅ *Settled Amount:* {{amount}}
⏳ *Current Validity:* {{validity}}
📊 *Payment Status:* All Dues Cleared

Thank you for your cooperation! 📚`);

    return formatTemplate(template, {
      student_name: name,
      amount: amount,
      validity: validity
    });
  }
};
