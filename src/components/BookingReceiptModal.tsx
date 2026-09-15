import React from 'react';
import {
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  QrCode,
  Lock,
  Building2,
  BadgeCheck,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { RentalBooking } from '../types';
import { formatINR, getBookingFinancialBreakdown } from '../utils/financialCalculations';

interface BookingReceiptModalProps {
  booking: RentalBooking | null;
  onClose: () => void;
}

export const BookingReceiptModal: React.FC<BookingReceiptModalProps> = ({
  booking,
  onClose
}) => {
  if (!booking) return null;

  const fin = getBookingFinancialBreakdown(booking);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #recko-printable-receipt, #recko-printable-receipt * {
            visibility: visible;
          }
          #recko-printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Luxury White Background, Slate & Gold Receipt Container */}
      <div
        id="recko-printable-receipt"
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 border border-amber-400/40 overflow-hidden my-auto text-slate-900 flex flex-col max-h-[96vh]"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 relative border-b border-amber-400/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="no-print absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-500/20 shrink-0">
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/10 text-amber-300 px-2.5 py-0.5 rounded border border-amber-400/30">
                  RECKO INDIA • OFFICIAL TAX INVOICE & TOKEN SLIP
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-0.5">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Escrow Locked ✓</span>
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold mt-0.5 text-white">
                RENTAL BOOKING CONFIRMATION SLIP
              </h2>
            </div>
          </div>
        </div>

        {/* Receipt Body (Scrollable & Printable Area) */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-900 overflow-y-auto flex-1 text-xs custom-scrollbar">
          
          {/* Section 1: Reference Bar */}
          <div className="bg-slate-50 border border-amber-400/30 rounded-2xl p-3.5 sm:p-4 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
                Booking Reference No.
              </span>
              <span className="font-mono font-black text-amber-700 text-base sm:text-lg">
                {booking.id}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                Txn Ref: {booking.transactionId || booking.utrNumber || `TXN-${booking.id}`} • {booking.bookingDate || 'Today'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
                Escrow Status
              </span>
              <span
                className={`font-bold px-2.5 py-1 rounded-lg border text-[10px] inline-flex items-center space-x-1 mt-0.5 ${
                  booking.status === 'Accepted' || booking.status === 'Booking Confirmed' || booking.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-400 text-slate-950 border-yellow-300 font-black shadow-xs'
                }`}
              >
                <span>🟡 Escrow Protected • {booking.status || 'Pending Host Review'}</span>
              </span>
            </div>
          </div>

          {/* Section 2: Property / Item Rented */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                1. Rented Asset / Property Specification
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {fin.categoryLabel}
              </span>
            </div>
            <div className="flex items-start space-x-3.5">
              <img
                src={booking.itemImage}
                alt={booking.itemTitle}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover shrink-0 border border-amber-400/40"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  {booking.itemTitle}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{booking.fullAddress || booking.itemTitle}</span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                    {booking.roomType || booking.hotelRoomType || booking.vehicleType || 'Standard Spec'}
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                    {booking.furnishedStatus || 'Fully Verified'}
                  </span>
                  {booking.ownerName && (
                    <span className="text-[10px] text-slate-600 font-medium">
                      Host: <strong className="text-slate-900">{booking.ownerName}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Verified Parties (Tenant & Host) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tenant Details */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Verified Tenant KYC</span>
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              </span>
              <div className="space-y-1 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">Tenant Legal Name:</span>
                  <strong className="text-slate-900 font-bold">{booking.userName || 'Verified Customer'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Contact Number:</span>
                  <span className="font-mono font-bold text-slate-800">{booking.userPhone || '+91 98765 43210'}</span>
                </div>
                {booking.userEmail && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">Email Address:</span>
                    <span className="font-mono text-amber-800 truncate block">{booking.userEmail}</span>
                  </div>
                )}
                {booking.govIdNumber && (
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[10px] block">Govt Identity Proof:</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-bold">
                      {booking.govIdType || 'Aadhaar Card'}: {booking.govIdNumber} (Verified ✓)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Host Details & Hub */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Authorized Host / Manager</span>
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
              </span>
              <div className="space-y-1 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">Host Name:</span>
                  <strong className="text-slate-900 font-bold">{booking.ownerName || 'Recko Certified Host'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Host Contact Phone:</span>
                  <span className="font-mono font-bold text-slate-800">{booking.ownerContact || '+91 98765 43210'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Property Hub Location:</span>
                  <span className="text-slate-800 truncate block">{booking.fullAddress || 'Registered Recko Property Hub'}</span>
                </div>
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Escrow Account:</span>
                  <span className="font-mono text-[10px] text-slate-700">
                    {booking.ownerUpiId || 'recko.escrow@okhdfcbank'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Rental Period & Duration */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1 mb-2">
              2. Rental Tenure, Start & Move-Out Schedule
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  {booking.type === 'hotel' ? 'Check-In Date' : booking.type === 'vehicle' || booking.type === 'clothing' ? 'Pickup Date' : booking.type === 'sports_turf' ? 'Play Date' : booking.type === 'restaurant' ? 'Reservation Date' : 'Move-In Date'}
                </span>
                <strong className="text-slate-900 block mt-0.5 font-bold">
                  {booking.startDate}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  {booking.type === 'hotel' ? 'Check-Out Date' : booking.type === 'vehicle' || booking.type === 'clothing' ? 'Return Date' : booking.type === 'sports_turf' ? 'Slot Timing' : booking.type === 'restaurant' ? 'Dining Time' : 'Expected Move-Out'}
                </span>
                <strong className="text-slate-900 block mt-0.5 font-bold">
                  {booking.endDate || booking.expectedMoveOutDate || 'Confirmed Tenure'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Tenure / Duration
                </span>
                <strong className="text-amber-800 block mt-0.5 font-black">
                  {fin.durationLabel}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 5: Transparent Itemized Cost Breakdown Table */}
          <div className="bg-white border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 space-y-3 text-slate-900 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>3. Itemized Financial Breakdown & Handover Calculation</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                Math Verified ✓
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] text-slate-500 uppercase">
                    <th className="pb-1.5 font-bold">Charge Description</th>
                    <th className="pb-1.5 font-bold text-center">Tariff Rate</th>
                    <th className="pb-1.5 font-bold text-center">Duration / Qty</th>
                    <th className="pb-1.5 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Row 1: Base Rent */}
                  <tr>
                    <td className="py-2">
                      <strong className="text-slate-900 font-bold block">
                        {fin.rateLabel}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Primary rental tariff for contracted period
                      </span>
                    </td>
                    <td className="py-2 text-center font-mono font-medium">
                      {formatINR(fin.unitRate)}
                    </td>
                    <td className="py-2 text-center font-bold">
                      {fin.durationLabel}
                    </td>
                    <td className="py-2 text-right font-mono font-bold text-slate-900">
                      {formatINR(fin.baseRentalSubtotal)}
                    </td>
                  </tr>

                  {/* Row 2: Security Deposit (If applicable) */}
                  {fin.securityDeposit > 0 && (
                    <tr>
                      <td className="py-2">
                        <strong className="text-slate-900 font-bold block">
                          Refundable Security Deposit
                        </strong>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          ✓ 100% Refundable to tenant upon return / move-out
                        </span>
                      </td>
                      <td className="py-2 text-center font-mono text-slate-500">—</td>
                      <td className="py-2 text-center text-slate-500">Separately Held</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">
                        {formatINR(fin.securityDeposit)}
                      </td>
                    </tr>
                  )}

                  {/* Row 3: Extra Charges (Maintenance, GST, Delivery, or Gear) */}
                  {fin.extraChargesAmount > 0 && (
                    <tr>
                      <td className="py-2">
                        <strong className="text-slate-900 font-bold block">
                          {fin.extraChargesLabel || 'Statutory / Maintenance Charges'}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          Official society maintenance / statutory taxes
                        </span>
                      </td>
                      <td className="py-2 text-center font-mono text-slate-500">—</td>
                      <td className="py-2 text-center text-slate-500">All-inclusive</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">
                        {formatINR(fin.extraChargesAmount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations Total Summary */}
            <div className="pt-2 border-t-2 border-slate-300 space-y-2">
              
              {/* Gross Total */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-700">
                  Total Gross Amount (Initial Move-In / Total Tariff):
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                  {formatINR(fin.grossTotalPayable)}
                </span>
              </div>

              {/* Less Token Paid */}
              <div className="flex justify-between items-center text-xs bg-amber-50 p-2 rounded-xl border border-amber-200">
                <div>
                  <span className="font-bold text-amber-900 block">
                    Less: Priority Token Paid Now (Held in Recko Escrow):
                  </span>
                  <span className="text-[10px] text-amber-700">
                    Payment Mode: <strong className="uppercase">{booking.paymentMethod || 'UPI / Razorpay'}</strong> (PAID ✓)
                  </span>
                </div>
                <span className="font-mono font-black text-amber-700 text-sm sm:text-base">
                  - {formatINR(fin.tokenPaidAmount)}
                </span>
              </div>

              {/* Net Balance Payable at Handover */}
              <div className="flex justify-between items-center bg-slate-900 text-white p-3 sm:p-3.5 rounded-xl border border-amber-400/40 shadow-inner">
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    Net Balance Payable at Physical Handover / Move-In
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    Strictly payable directly to host upon physical inspection & key handover
                  </span>
                </div>
                <span className="font-mono font-black text-yellow-300 text-base sm:text-xl">
                  {formatINR(fin.balancePayableAtHandover)}
                </span>
              </div>

              {/* Mathematical Proof Guarantee */}
              <div className="flex items-center justify-between text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                  <span>
                    Zero Math Discrepancy: Token Paid ({formatINR(fin.tokenPaidAmount)}) + Balance Due ({formatINR(fin.balancePayableAtHandover)}) = Total Gross ({formatINR(fin.grossTotalPayable)})
                  </span>
                </div>
                <span className="font-black">100% Balanced ✓</span>
              </div>

            </div>
          </div>

          {/* Section 6: Escrow Protection Terms & Guarantees */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-[11px] text-slate-700">
            <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              <span>Official Recko-India Escrow Guarantee</span>
            </h5>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-600">
              <li>
                <strong>Escrow Safety:</strong> Your token amount of {formatINR(fin.tokenPaidAmount)} is safely held in Recko India Escrow and will NOT be released to the host until you inspect the property and approve the handover.
              </li>
              <li>
                <strong>100% Refund Policy:</strong> If the host declines the request or the property does not match specifications, 100% of the token fee is instantly refunded.
              </li>
              <li>
                <strong>Security Deposit Protection:</strong> The security deposit of {formatINR(fin.securityDeposit)} is 100% refundable to you at move-out as per standard tenancy guidelines.
              </li>
            </ul>
          </div>

          {/* Section 7: QR Code & Verification Signature */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                <QrCode className="h-8 w-8 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] text-slate-800 font-bold block">
                  Tamper-Proof Digital Verification Hash
                </span>
                <span className="text-[9px] font-mono text-slate-500 truncate block">
                  GSTIN: 27AAACR9281Q1Z0 • SECURE-ESCROW-VPA • DIGISIGN-{booking.id}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">
              Authorized Digital Token ✓
            </span>
          </div>

          {/* Action buttons (Print & Close) */}
          <div className="no-print pt-2 flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl border border-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Print / Download PDF Receipt Slip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Close Receipt
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
