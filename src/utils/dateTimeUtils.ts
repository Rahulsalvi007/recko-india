/**
 * Recko-India Standardized Date & Time Utility
 * Ensures Indian Standard Time (IST - Asia/Kolkata) consistency across
 * booking dates, check-in/out, OTP expiries, and dashboard statistics.
 */

/**
 * Get current date string in IST (Asia/Kolkata) in YYYY-MM-DD format.
 */
export function getISTDateString(dateObj: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(dateObj); // YYYY-MM-DD
  } catch (e) {
    return dateObj.toISOString().split('T')[0];
  }
}

/**
 * Get current ISO timestamp string in IST context.
 */
export function getISTTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format date for user-facing display in Indian English format (e.g. 15 Aug 2026).
 */
export function formatISTDateDisplay(dateStr?: string | Date): string {
  if (!dateStr) return 'N/A';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return String(dateStr);
  }
}

/**
 * Format time for user-facing display in IST (e.g. 04:30 PM).
 */
export function formatISTTimeDisplay(dateOrISO?: string | Date): string {
  if (!dateOrISO) return 'N/A';
  try {
    const d = typeof dateOrISO === 'string' ? new Date(dateOrISO) : dateOrISO;
    if (isNaN(d.getTime())) return String(dateOrISO);

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch (e) {
    return String(dateOrISO);
  }
}

/**
 * Calculate difference in days between two YYYY-MM-DD date strings.
 * Minimum returned is 1 day.
 */
export function calculateDateDiffDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  } catch (e) {
    return 1;
  }
}

/**
 * Calculate difference in hours between two date-time strings.
 */
export function calculateTimeDiffHours(startDateTimeStr: string, endDateTimeStr: string): number {
  if (!startDateTimeStr || !endDateTimeStr) return 1;
  try {
    const start = new Date(startDateTimeStr);
    const end = new Date(endDateTimeStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    return Math.max(1, diffHours);
  } catch (e) {
    return 1;
  }
}

/**
 * Validate booking date range.
 * Rejects past dates or end date before start date.
 */
export function validateBookingDateRange(startDateStr: string, endDateStr: string): {
  isValid: boolean;
  errorMessage?: string;
  daysCount: number;
} {
  if (!startDateStr || !endDateStr) {
    return { isValid: false, errorMessage: 'Start date and end date are required.', daysCount: 0 };
  }

  const todayStr = getISTDateString();
  if (startDateStr < todayStr) {
    return { isValid: false, errorMessage: 'Booking start date cannot be in the past.', daysCount: 0 };
  }

  if (endDateStr < startDateStr) {
    return { isValid: false, errorMessage: 'End date cannot be prior to start date.', daysCount: 0 };
  }

  const daysCount = calculateDateDiffDays(startDateStr, endDateStr);
  return { isValid: true, daysCount };
}
