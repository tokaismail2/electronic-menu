import axios from "axios";
import { smsFileLogger } from "./logger";

export type SMSType = "s" | "w" | "ws";

class SMSModule {
  static templates: Record<string, string> = {
    otp_verification: "رمز التحقق الخاص بك هو: {{CODE}}. يرجى عدم مشارکته مع أي شخص.",
    company_user_approved: "تمت الموافقة على حسابك من قبل {{COMPANY_NAME}}. يمكنك الآن تسجيل الدخول واستخدام التطبيق.",
    payment_received: "تم استلام دفعتك بنجاح لطلب رقم {{ORDER_ID}}. يرجى إدخال رمز التحقق {{OTP}} لتأكید الاستلام.",
    payment_verified: "رمز التحقق لإتمام عملية الدفع هو: {{OTP}} لطلب الشراء رقم {{ORDER_ID}} بعدد {{NUMBER_OF_SHARES}} سهم.",
    transfer_completed: "تم استلام {{NUMBER_OF_SHARES}} سهم من {{SYMBOL}} من {{FROM_USER}} بنجاح",
    transfer_cancelled_sender: "تعذر إرسال هديتك إلى {{TO_USER}}. يرجى التواصل مع إدارة الشرکة لمزید من التفاصیل.",
    user_registration_rejected: "تعذر قبول تسجيلك في المنصة من قبل مسؤول الشرکة. یرجی التواصل مع الدعم لمزید من المعلومات."
  };

  /**
   * Send SMS / WhatsApp
   * @param receiver - Phone number
   * @param templateType - Template key name
   * @param data - Variables for template
   * @param type - Mode: 's' (sms), 'w' (whatsapp), 'ws' (sms + whatsapp)
   */
  static async send(
    receiver: string,
    templateType: string,
    data: Record<string, string> = {},
    type: SMSType = "s"
  ): Promise<boolean> {
    receiver = receiver.trim();

    const template = this.templates[templateType];
    if (!template) throw new Error(`Unknown SMS template: ${templateType}`);

    // Replace template variables
    let message = template;
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(`{{${key}}}`, value);
    }

    smsFileLogger.info(`Preparing message for ${receiver}: ${message}`);
    console.log(`Preparing message for ${receiver}: ${message}`);

    try {
      if (type === "s") {
        return await this.sendMobiShastra(receiver, message); // SMS only
      }
      else if (type === "w") {
        return await this.sendWhatsApp(receiver, message); // WhatsApp only
      }
      else if (type === "ws") {
        // Send both
        await this.sendMobiShastra(receiver, message);
        await this.sendWhatsApp(receiver, message);
        return true;
      }
    } catch (error: any) {
      smsFileLogger.error(`Message send failed: ${error.message}`);
      console.error(`Message send failed: ${error.message}`);
      return false;
    }

    return false;
  }

  /** Send SMS through MobiShastra API */
  private static async sendMobiShastra(receiver: string, message: string): Promise<boolean> {
    try {
      const user = "cgtechtrk";
      const password = "b2Ayhw5e";
      const senderId = "CgTech";
      const url = "https://saudi.mshastra.com/sendurl.aspx";

      const response = await axios.get(url, {
        params: {
          user,
          pwd: password,
          senderid: senderId,
          mobileno: receiver,
          msgtext: message,
          CountryCode: "ALL",
        },
      });

      smsFileLogger.info({
        msg: "SMS sent successfully (MobiShastra)",
        status: response.status,
        data: response.data,
        receiver,
        message
      });
      console.log({
        msg: "SMS sent successfully (MobiShastra)",
        status: response.status,
        data: response.data,
        receiver,
        message
      });

      return true;
    } catch (err: any) {
      smsFileLogger.error(`SMS send failed: ${err.message}`);
      console.error(`SMS send failed: ${err.message}`);
      return false;
    }
  }


  /** Send WhatsApp message through local API */
  private static async sendWhatsApp(receiver: string, message: string): Promise<boolean> {
    try {
      const url = "http://192.168.100.12:4000/send-message/user";
      receiver = receiver.replace(/^\+/, "");

      const response = await axios.post(url, {
        number: receiver,
        message: message,
      });

      smsFileLogger.info({
        msg: "WhatsApp sent successfully via local API",
        status: response.status,
        data: response.data,
        receiver,
        message
      });

      return response.status === 200;
    } catch (err: any) {
      smsFileLogger.error(`WhatsApp send failed: ${JSON.stringify(err.response?.data || err.message)}`);
      return false;
    }
  }


}

export default SMSModule;