/**
 * Recko-India Standardized Financial & Currency Calculation Utility
 * Handles Indian Rupee (INR) formatting, floating-point rounding precision,
 * GST/CGST/SGST tax calculations, platform fees, discounts, and escrow refunds.
 */

import type { RentalBooking } from '../types';

export interface CostBreakdown {
  basePrice: number;
  quantityOrDuration: number;
  subtotal: number;
  discountAmount: number;
  netSubtotal: number;
  gstRatePercent: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  platformFee: number;
  securityDeposit: number;
  totalPayable: number;
  tokenAmount: number;
  balanceDueOnHandover: number;
}

/**
 * Cleanly format Indian Rupee currency values with proper rounding.
 * Prevents floating-point artifacts like ₹99.999999 or ₹1249.999999
 */
export function formatINR(amount: number, showDecimalsIfZero: boolean = false): string {
  const numericVal = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const rounded = Math.round((numericVal + Number.EPSILON) * 100) / 100;
  
  const hasDecimals = rounded % 1 !== 0;
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimalsIfZero || hasDecimals ? 2 : 0,
    minimumFractionDigits: showDecimalsIfZero ? 2 : 0
  };

  return new Intl.NumberFormat('en-IN', options).format(rounded);
}

/**
 * Round a number safely to 2 decimal places.
 */
export function safeRoundCurrency(amount: number): number {
  const numericVal = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return Math.round((numericVal + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate complete transparent cost breakdown for any booking or listing transaction.
 */
export function calculateTransparentCostBreakdown(params: {
  basePrice: number;
  quantityOrDuration?: number;
  discountPercentage?: number;
  gstRatePercent?: number;
  platformFeeFixed?: number;
  securityDeposit?: number;
  tokenAmount?: number;
}): CostBreakdown {
  const basePrice = Math.max(0, safeRoundCurrency(params.basePrice || 0));
  const qty = Math.max(1, params.quantityOrDuration || 1);
  const subtotal = safeRoundCurrency(basePrice * qty);
  
  const discountPct = Math.min(100, Math.max(0, params.discountPercentage || 0));
  const discountAmount = safeRoundCurrency((subtotal * discountPct) / 100);
  const netSubtotal = safeRoundCurrency(subtotal - discountAmount);

  const gstRate = Math.max(0, params.gstRatePercent !== undefined ? params.gstRatePercent : 18);
  const gstAmount = safeRoundCurrency((netSubtotal * gstRate) / 100);
  const cgstAmount = safeRoundCurrency(gstAmount / 2);
  const sgstAmount = safeRoundCurrency(gstAmount - cgstAmount);

  const platformFee = safeRoundCurrency(params.platformFeeFixed || 0);
  const securityDeposit = safeRoundCurrency(params.securityDeposit || 0);

  const totalPayable = safeRoundCurrency(netSubtotal + gstAmount + platformFee + securityDeposit);
  const tokenAmount = safeRoundCurrency(params.tokenAmount || 99);
  const balanceDueOnHandover = Math.max(0, safeRoundCurrency(totalPayable - tokenAmount));

  return {
    basePrice,
    quantityOrDuration: qty,
    subtotal,
    discountAmount,
    netSubtotal,
    gstRatePercent: gstRate,
    gstAmount,
    cgstAmount,
    sgstAmount,
    platformFee,
    securityDeposit,
    totalPayable,
    tokenAmount,
    balanceDueOnHandover
  };
}

/**
 * Calculate Vehicle Inspection Deposit Settlement.
 */
export function calculateInspectionSettlement(params: {
  initialDeposit: number;
  usedKm: number;
  includedKm: number;
  extraKmRate: number;
  lateHours: number;
  lateFeePerHourRate?: number;
}): {
  extraKm: number;
  extraKmFee: number;
  lateFeeTotal: number;
  totalDeduction: number;
  refundedDeposit: number;
} {
  const initialDeposit = safeRoundCurrency(params.initialDeposit || 0);
  const usedKm = Math.max(0, params.usedKm || 0);
  const includedKm = Math.max(0, params.includedKm || 0);
  const extraKmRate = Math.max(0, params.extraKmRate || 0);
  const lateHours = Math.max(0, params.lateHours || 0);
  const lateFeeRate = Math.max(0, params.lateFeePerHourRate || 250);

  const extraKm = Math.max(0, usedKm - includedKm);
  const extraKmFee = safeRoundCurrency(extraKm * extraKmRate);
  const lateFeeTotal = safeRoundCurrency(lateHours * lateFeeRate);
  const totalDeduction = safeRoundCurrency(extraKmFee + lateFeeTotal);
  const refundedDeposit = Math.max(0, safeRoundCurrency(initialDeposit - totalDeduction));

  return {
    extraKm,
    extraKmFee,
    lateFeeTotal,
    totalDeduction,
    refundedDeposit
  };
}

export interface BookingFinancialBreakdown {
  category: string;
  categoryLabel: string;
  rateLabel: string;
  unitRate: number;
  durationLabel: string;
  durationCount: number;
  durationUnit: string;
  baseRentalSubtotal: number;
  securityDeposit: number;
  extraChargesLabel?: string;
  extraChargesAmount: number;
  grossTotalPayable: number;
  tokenPaidAmount: number;
  balancePayableAtHandover: number;
  isMathBalanced: boolean;
}

export function getCategoryDisplayName(type: string): string {
  switch (type) {
    case 'residential': return 'Residential Apartment / House';
    case 'commercial': return 'Commercial Office / Space';
    case 'student': return 'Student Housing / PG Hostel';
    case 'property': return 'Rental Property';
    case 'vehicle': return 'Self-Drive Vehicle';
    case 'hotel': return 'Hotel Stay / Luxury Resort';
    case 'clothing': return 'Designer Attire Rental';
    case 'sports_turf': return 'Sports Arena / Turf Slot';
    case 'library': return 'Study Space / Library Desk';
    case 'restaurant': return 'Fine Dining Reservation';
    case 'general': return 'Home Appliance / Electronic';
    default: return 'Rental Booking';
  }
}

/**
 * Universal resolver that calculates exact, mathematically sound prices,
 * durations, security deposits, token deductions, and balances for any RentalBooking.
 */
export function getBookingFinancialBreakdown(booking: RentalBooking): BookingFinancialBreakdown {
  const type = (booking.type || 'property') as string;
  const tokenPaid = safeRoundCurrency(booking.tokenPaidAmount || 500);

  // If the booking already has explicit enriched fields:
  if (
    typeof booking.unitPrice === 'number' &&
    typeof booking.baseRentalPrice === 'number' &&
    typeof booking.grossPayableAmount === 'number'
  ) {
    const deposit = safeRoundCurrency(booking.securityDeposit || booking.deposit || 0);
    const extraCharges = safeRoundCurrency((booking.maintenanceCharges || 0) + (booking.deliveryFee || 0) + (booking.taxAmount || 0));
    const grossTotal = safeRoundCurrency(booking.grossPayableAmount);
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    let rateLabel = 'Unit Tariff';
    const durationUnit = booking.durationUnit || 'period';
    if (type === 'property' || type === 'residential' || type === 'commercial' || type === 'student') rateLabel = 'Monthly Rent';
    else if (type === 'vehicle') rateLabel = booking.durationUnit === 'hours' ? 'Hourly Rate' : 'Daily Rate';
    else if (type === 'hotel') rateLabel = 'Nightly Tariff';
    else if (type === 'clothing') rateLabel = 'Daily Rent';
    else if (type === 'sports_turf') rateLabel = 'Hourly Slot Rate';
    else if (type === 'general') rateLabel = 'Monthly Rental Fee';

    let extraChargesLabel: string | undefined;
    if (booking.taxAmount && booking.taxAmount > 0) extraChargesLabel = 'Statutory GST & Taxes (12%)';
    else if (booking.maintenanceCharges && booking.maintenanceCharges > 0) extraChargesLabel = 'Monthly Maintenance';
    else if (booking.deliveryFee && booking.deliveryFee > 0) extraChargesLabel = 'Doorstep Delivery & Setup';

    return {
      category: type,
      categoryLabel: getCategoryDisplayName(type),
      rateLabel,
      unitRate: booking.unitPrice,
      durationLabel: `${booking.durationCount || 1} ${booking.durationUnit || 'Units'}`,
      durationCount: booking.durationCount || 1,
      durationUnit,
      baseRentalSubtotal: booking.baseRentalPrice,
      securityDeposit: deposit,
      extraChargesLabel,
      extraChargesAmount: extraCharges,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  // Dynamic fallback deduction for legacy or third-party bookings
  if (type === 'hotel') {
    let nights = booking.hotelNightsCount || 1;
    if (!booking.hotelNightsCount && booking.startDate && booking.endDate) {
      try {
        const d1 = new Date(booking.startDate).getTime();
        const d2 = new Date(booking.endDate).getTime();
        const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diff > 0) nights = diff;
      } catch (e) {
        nights = 1;
      }
    }
    const rooms = booking.hotelRoomsCount || 1;
    const roomNights = nights * rooms;
    const grossTotal = safeRoundCurrency(booking.totalPrice || 3600);
    // 12% GST breakdown
    const baseTariff = safeRoundCurrency(grossTotal / 1.12);
    const gst = safeRoundCurrency(grossTotal - baseTariff);
    const unitRate = safeRoundCurrency(baseTariff / roomNights);
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    return {
      category: 'hotel',
      categoryLabel: getCategoryDisplayName('hotel'),
      rateLabel: 'Nightly Tariff per Room',
      unitRate,
      durationLabel: `${nights} Night(s) × ${rooms} Room(s)`,
      durationCount: nights,
      durationUnit: 'nights',
      baseRentalSubtotal: baseTariff,
      securityDeposit: 0,
      extraChargesLabel: 'Statutory GST & Hotel Luxury Tax (12%)',
      extraChargesAmount: gst,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  if (type === 'vehicle') {
    const isHourly = booking.rentalDurationMode === 'hourly' || Boolean(booking.totalRentalHours);
    if (isHourly) {
      const hours = booking.totalRentalHours || 6;
      const unitRate = booking.hourlyRateCharged || booking.rentPerHour || 150;
      const baseSubtotal = safeRoundCurrency(hours * unitRate);
      const deposit = safeRoundCurrency(booking.securityDeposit || booking.deposit || Math.max(0, (booking.totalPrice || (baseSubtotal + 2000)) - baseSubtotal));
      const grossTotal = safeRoundCurrency(baseSubtotal + deposit);
      const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

      return {
        category: 'vehicle',
        categoryLabel: getCategoryDisplayName('vehicle'),
        rateLabel: 'Hourly Rental Rate',
        unitRate,
        durationLabel: `${hours} Hours Rental`,
        durationCount: hours,
        durationUnit: 'hours',
        baseRentalSubtotal: baseSubtotal,
        securityDeposit: deposit,
        grossTotalPayable: grossTotal,
        tokenPaidAmount: tokenPaid,
        balancePayableAtHandover: balance,
        extraChargesAmount: 0,
        isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
      };
    } else {
      const days = booking.daysCount || 1;
      const grossTotal = safeRoundCurrency(booking.totalPrice || 4500);
      const deposit = safeRoundCurrency(booking.securityDeposit || booking.deposit || 2000);
      const baseSubtotal = Math.max(0, safeRoundCurrency(grossTotal - deposit));
      const unitRate = safeRoundCurrency(baseSubtotal / days);
      const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

      return {
        category: 'vehicle',
        categoryLabel: getCategoryDisplayName('vehicle'),
        rateLabel: 'Daily Rental Rate',
        unitRate,
        durationLabel: `${days} Day(s) Rental`,
        durationCount: days,
        durationUnit: 'days',
        baseRentalSubtotal: baseSubtotal,
        securityDeposit: deposit,
        grossTotalPayable: grossTotal,
        tokenPaidAmount: tokenPaid,
        balancePayableAtHandover: balance,
        extraChargesAmount: 0,
        isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
      };
    }
  }

  if (type === 'clothing') {
    const days = booking.daysCount || 3;
    const grossTotal = safeRoundCurrency(booking.totalPrice || 2600);
    const deposit = safeRoundCurrency(booking.securityDeposit || booking.deposit || 1000);
    const deliveryFee = safeRoundCurrency(booking.deliveryFee || (grossTotal > (deposit + 1500) ? 100 : 0));
    const baseSubtotal = Math.max(0, safeRoundCurrency(grossTotal - deposit - deliveryFee));
    const unitRate = safeRoundCurrency(baseSubtotal / days);
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    return {
      category: 'clothing',
      categoryLabel: getCategoryDisplayName('clothing'),
      rateLabel: 'Daily Apparel Rate',
      unitRate,
      durationLabel: `${days} Day(s) Hire`,
      durationCount: days,
      durationUnit: 'days',
      baseRentalSubtotal: baseSubtotal,
      securityDeposit: deposit,
      extraChargesLabel: deliveryFee > 0 ? 'Doorstep Sanitized Delivery & Return Pickup' : undefined,
      extraChargesAmount: deliveryFee,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  if (type === 'sports_turf') {
    const hours = booking.durationCount || 2;
    const grossTotal = safeRoundCurrency(booking.totalPrice || 1800);
    const gearFee = safeRoundCurrency(booking.maintenanceCharges || (grossTotal % 800 !== 0 ? 200 : 0));
    const baseSubtotal = Math.max(0, safeRoundCurrency(grossTotal - gearFee));
    const unitRate = safeRoundCurrency(baseSubtotal / hours);
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    return {
      category: 'sports_turf',
      categoryLabel: getCategoryDisplayName('sports_turf'),
      rateLabel: 'Hourly Arena Tariff',
      unitRate,
      durationLabel: `${hours} Hours Slot`,
      durationCount: hours,
      durationUnit: 'hours',
      baseRentalSubtotal: baseSubtotal,
      securityDeposit: 0,
      extraChargesLabel: gearFee > 0 ? 'Equipment & Match Gear Kit' : undefined,
      extraChargesAmount: gearFee,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  if (type === 'general') {
    const months = booking.monthsCount || 3;
    const grossTotal = safeRoundCurrency(booking.totalPrice || 4050);
    const deposit = safeRoundCurrency(booking.securityDeposit || booking.deposit || 1000);
    const deliveryFee = safeRoundCurrency(booking.deliveryFee || 250);
    const baseSubtotal = Math.max(0, safeRoundCurrency(grossTotal - deposit - deliveryFee));
    const unitRate = safeRoundCurrency(baseSubtotal / months);
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    return {
      category: 'general',
      categoryLabel: getCategoryDisplayName('general'),
      rateLabel: 'Monthly Appliance Rent',
      unitRate,
      durationLabel: `${months} Months Tenure`,
      durationCount: months,
      durationUnit: 'months',
      baseRentalSubtotal: baseSubtotal,
      securityDeposit: deposit,
      extraChargesLabel: 'Doorstep Delivery & Technician Installation',
      extraChargesAmount: deliveryFee,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  if (type === 'library') {
    const grossTotal = safeRoundCurrency(booking.totalPrice || 1200);
    const passName = booking.libraryPassType || (grossTotal < 500 ? 'Daily Study Pass' : 'Monthly Membership');
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    return {
      category: 'library',
      categoryLabel: getCategoryDisplayName('library'),
      rateLabel: 'Access Pass Fee',
      unitRate: grossTotal,
      durationLabel: passName,
      durationCount: 1,
      durationUnit: passName.toLowerCase().includes('daily') ? 'days' : 'months',
      baseRentalSubtotal: grossTotal,
      securityDeposit: 0,
      extraChargesAmount: 0,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  if (type === 'restaurant') {
    const grossTotal = safeRoundCurrency(booking.totalPrice || 800);
    const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

    return {
      category: 'restaurant',
      categoryLabel: getCategoryDisplayName('restaurant'),
      rateLabel: 'Estimated Dining Order Value',
      unitRate: grossTotal,
      durationLabel: 'Table Reservation',
      durationCount: 1,
      durationUnit: 'table',
      baseRentalSubtotal: grossTotal,
      securityDeposit: 0,
      extraChargesAmount: 0,
      grossTotalPayable: grossTotal,
      tokenPaidAmount: tokenPaid,
      balancePayableAtHandover: balance,
      isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
    };
  }

  // Default: Properties (residential, commercial, student)
  const maintenance = safeRoundCurrency(booking.maintenanceAmount || booking.maintenanceCharges || 0);
  const tenureLabel = booking.rentalDurationType || '11 months';
  
  // Total move-in amount is 1st Month Rent + Deposit + Maintenance
  let grossTotal = safeRoundCurrency(booking.totalPrice || 45000);
  let deposit = safeRoundCurrency(booking.securityDeposit ?? booking.deposit ?? 0);
  let monthlyRent = safeRoundCurrency(booking.monthlyRent || 0);

  if (monthlyRent > 0 && deposit > 0) {
    grossTotal = safeRoundCurrency(monthlyRent + deposit + maintenance);
  } else if (monthlyRent > 0) {
    deposit = safeRoundCurrency(monthlyRent * 2);
    grossTotal = safeRoundCurrency(monthlyRent + deposit + maintenance);
  } else if (grossTotal > 0) {
    // deduce monthly rent and deposit from grossTotal: deposit is ~2x rent
    // grossTotal - maintenance = 3x rent
    const rentPortion = Math.max(0, grossTotal - maintenance);
    monthlyRent = safeRoundCurrency(Math.round(rentPortion / 3));
    deposit = safeRoundCurrency(rentPortion - monthlyRent);
  } else {
    monthlyRent = 15000;
    deposit = 30000;
    grossTotal = 45000;
  }

  const balance = Math.max(0, safeRoundCurrency(grossTotal - tokenPaid));

  return {
    category: type,
    categoryLabel: getCategoryDisplayName(type),
    rateLabel: 'Monthly Rent',
    unitRate: monthlyRent,
    durationLabel: `Lease Tenure: ${tenureLabel} (1st Month Move-In)`,
    durationCount: 1,
    durationUnit: 'months',
    baseRentalSubtotal: monthlyRent,
    securityDeposit: deposit,
    extraChargesLabel: maintenance > 0 ? 'Monthly Society Maintenance' : undefined,
    extraChargesAmount: maintenance,
    grossTotalPayable: grossTotal,
    tokenPaidAmount: tokenPaid,
    balancePayableAtHandover: balance,
    isMathBalanced: Math.abs((tokenPaid + balance) - grossTotal) < 0.01
  };
}

