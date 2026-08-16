/**
 * WhatsApp Helper Utilities for RentHub
 * Generates direct wa.me URLs with pre-formatted greeting messages.
 */

export interface WhatsAppContactOptions {
  phoneNumber?: string;
  itemTitle?: string;
  itemCategory?: string;
  ownerName?: string;
  price?: number | string;
  location?: string;
  city?: string;
  customMessage?: string;
}

export function formatWhatsAppNumber(rawPhone?: string): string {
  if (!rawPhone) return '919876543210';
  // Remove all non-digits
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  if (digits.length > 10) {
    return digits;
  }
  return '919876543210';
}

export function generateWhatsAppUrl(options: WhatsAppContactOptions): string {
  const phone = formatWhatsAppNumber(options.phoneNumber);
  
  if (options.customMessage) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(options.customMessage)}`;
  }

  const greeting = options.ownerName ? `Hello ${options.ownerName}` : 'Hello';
  const itemDesc = options.itemTitle ? `"${options.itemTitle}"` : 'your listing';
  const categoryDesc = options.itemCategory ? `(${options.itemCategory})` : '';
  const locationDesc = options.city || options.location ? `in ${options.city || options.location}` : '';
  
  const text = `${greeting}! I am contacting you from RentHub regarding ${itemDesc} ${categoryDesc} ${locationDesc}. Is this currently available for rent? I would like more details. Thank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text.trim())}`;
}

export function openWhatsAppChat(options: WhatsAppContactOptions): void {
  const url = generateWhatsAppUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}
