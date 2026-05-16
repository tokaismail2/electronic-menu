export function isValidSaudiPhoneNumber(phone: string): boolean {
    const regex = /^\+?9665\d{8}$/;
    return regex.test(phone);

}