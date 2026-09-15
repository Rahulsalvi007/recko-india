/**
 * Universal Phone Call Helper Utility for Recko India / RentHub
 * Formats phone numbers, removes spaces/dashes, copies to clipboard, and triggers tel: URI.
 */

export function cleanPhoneNumber(rawPhone?: string): string {
  if (!rawPhone || !rawPhone.trim()) {
    return '+919876543210';
  }

  // Remove spaces, brackets, dashes, keeping only numbers and leading +
  const cleaned = rawPhone.trim().replace(/[^0-9+]/g, '');

  // If 10 digits without country code, add +91
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    return `+91${cleaned}`;
  }

  // If starts with 91 and 12 digits total without +, prepend +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  return cleaned || '+919876543210';
}

export function makePhoneCall(rawPhone?: string, contactName?: string): void {
  const cleanNumber = cleanPhoneNumber(rawPhone);
  const telUrl = `tel:${cleanNumber}`;

  // 1. Copy phone number to clipboard as a fallback for desktop users
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanNumber).catch(() => {});
    }
  } catch (e) {
    // ignore clipboard error
  }

  // 2. Trigger native OS / Mobile dialer
  window.location.href = telUrl;
}
