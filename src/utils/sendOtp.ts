import { addNotificationToQueue } from './notificationQueue';
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function sendOtp(phone: string): string {
    let otp = Math.floor(1000 + Math.random() * 900000).toString();
    console.log(`otp code is ${otp}`);
    otp = "123456";
    const expiresAt = Date.now() + 300 * 1000;
    otpStore.set(`otp_login:${phone}`, { otp, expiresAt });
    // addNotificationToQueue(phone, 'otp_verification', { CODE: otp }, 's');
    return otp;
}

//valid otp
export function validOtpForLogin(phone: string, otp_code: string): boolean {

    const key = `otp_login:${phone}`;
    const record = otpStore.get(key);
    if (!record) {
        return false;
    }
    const { otp: storedOtp, expiresAt: storedExpiresAt } = record;
    if (Date.now() > storedExpiresAt) {
        otpStore.delete(key);
        return false;
    }
    if (storedOtp !== String(otp_code)) {
        return false;
    }
    return true;
}
