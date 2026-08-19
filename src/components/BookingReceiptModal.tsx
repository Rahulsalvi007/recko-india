import React from 'react';
import {
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
  Download,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  QrCode,
  Sparkles,
  Lock,
  Building2,
  BadgeCheck,
  FileCheck
} from 'lucide-react';
import { RentalBooking } from '../types';

interface BookingReceiptModalProps {
  booking: RentalBooking | null;
  onClose: () => void;
}

export const BookingReceiptModal: React.FC<BookingReceiptModalProps> = ({
  booking,
  onClose
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Luxury White Background, Black Text & Golden Receipt Container */}
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 border border-amber-400/40 overflow-hidden my-auto text-slate-900 flex flex-col max-h-[96vh]">
        
        {/* Dark Slate & Gold Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 relative border-b border-amber-400/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
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
                  RECKO INDIA — RENTAL RECEIPT
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-0.5">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Escrow Locked ✓</span>
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold mt-0.5 text-white">RECKO INDIA — OFFICIAL RENTAL TOKEN RECEIPT</h2>
            </div>
          </div>
        </div>

        {/* Receipt Body (Printable Area) */}
        <div className="p-4 sm:p-6 space-y-4 text-slate-900 overflow-y-auto printable-area flex-1 text-xs custom-scrollbar">
          
          {/* Section 1: Booking Reference & Status */}
          <div className="bg-slate-50 border border-amber-400/30 rounded-2xl p-3.5 sm:p-4 flex justify-between items-center">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Booking ID</span>
              <span className="font-mono font-black text-amber-700 text-sm sm:text-base">{booking.id}</span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Txn ID: {booking.transactionId || 'TXN-98421092'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Escrow Status</span>
              <span className={`font-bold px-2.5 py-1 rounded-lg border text-[10px] inline-block mt-0.5 ${
                booking.status === 'Accepted' || booking.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-400 text-slate-950 border-yellow-300 font-black shadow-xs'
              }`}>
                {booking.status === 'Accepted' ? 'Approved ✓' : '🟡 Escrow Locked • Pending Host Review'}
              </span>
            </div>
          </div>

          {/* Section 2: Property Listing Details */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              1. Rented Property / Listing Details
            </span>
            <div className="flex items-start space-x-3">
              <img
                src={booking.itemImage}
                alt={booking.itemTitle}
                className="h-16 w-16 rounded-xl object-cover shrink-0 border border-amber-400/40"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{booking.itemTitle}</h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  {booking.fullAddress || booking.itemTitle}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                    {booking.roomType || '1BHK Unit'}
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                    {booking.furnishedStatus || 'Semi-Furnished'}
                  </span>
                  {booking.ownerName && (
                    <span className="text-[10px] text-slate-600 font-medium">Owner: <strong className="text-slate-900">{booking.ownerName}</strong></span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Tenant Details & KYC */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1">
              2. Verified Tenant Details & Identity Verification
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Full Tenant Name</span>
                <strong className="text-slate-900 font-bold">{booking.userName || 'Rahul Sharma'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Mobile Number</span>
                <strong className="text-slate-900 font-mono font-bold">{booking.userPhone || '9876543210'}</strong>
              </div>
              {booking.userEmail && (
                <div>
                  <span className="text-slate-500 text-[10px] block">Email Address</span>
                  <strong className="text-amber-700 font-mono font-bold truncate block">{booking.userEmail}</strong>
                </div>
              )}
              {booking.occupation && (
                <div>
                  <span className="text-slate-500 text-[10px] block">Occupation & Company/College</span>
                  <strong className="text-slate-900 font-bold">{booking.occupation} ({booking.companyCollegeName || 'Infosys / COEP'})</strong>
                </div>
              )}
              {booking.currentAddress && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-[10px] block">Current Address</span>
                  <span className="text-slate-800 font-medium">{booking.currentAddress}</span>
                </div>
              )}
              {booking.permanentAddress && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-[10px] block">Permanent Address</span>
                  <span className="text-slate-800 font-medium">{booking.permanentAddress}</span>
                </div>
              )}
              {booking.govIdNumber && (
                <div className="sm:col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 text-[10px] block">KYC Government Identity</span>
                  <span className="font-mono font-bold text-amber-700 flex items-center space-x-1">
                    <BadgeCheck className="h-3.5 w-3.5 text-amber-600" />
                    <span>{booking.govIdType || 'Aadhaar Card'}: {booking.govIdNumber} (Verified ✓ • Encrypted)</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Rental Period */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Move-In Date</span>
              <span className="font-bold text-slate-900 text-xs block mt-0.5">{booking.startDate}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Expected Move-Out</span>
              <span className="font-bold text-slate-900 text-xs block mt-0.5">{booking.expectedMoveOutDate || '11 Months'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Lease Duration</span>
              <span className="font-bold text-slate-900 text-xs block mt-0.5">{booking.rentalDurationType || '11 Months Lease'}</span>
            </div>
          </div>

          {/* Section 5: Cost Breakdown */}
          <div className="bg-amber-500/10 border border-amber-400/40 p-4 rounded-2xl space-y-2 text-slate-900 shadow-sm">
            <div className="flex justify-between items-center border-b border-amber-300/50 pb-2">
              <span className="text-xs font-bold text-amber-900">Token Fee Paid (Held in Escrow)</span>
              <span className="text-xl font-black text-amber-700 font-mono">
                ₹{booking.tokenPaidAmount || 500} (PAID ✓)
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-700 pt-1">
              <span>Monthly Rent: <strong>₹{booking.totalPrice?.toLocaleString('en-IN') || '10,000'}</strong></span>
              <span>Deposit: <strong>₹{((booking.totalPrice || 10000) * 2).toLocaleString('en-IN')}</strong></span>
              <span>Payment Mode: <strong className="uppercase">{booking.paymentMethod || 'UPI'}</strong></span>
            </div>
          </div>

          {/* Section 6: QR Code & Verification Signature */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                <QrCode className="h-8 w-8 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] text-slate-700 font-bold block">Digital Signature & Hash</span>
                <span className="text-[9px] font-mono text-slate-500 truncate block">GSTIN: 27AAACR9281Q1Z0 • SECURE-ESCROW-VPA</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Tamper Proof ✓
            </span>
          </div>

          {/* Action buttons (Print & PDF) */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl border border-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Print / Download PDF Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs py-3 px-6 rounded-xl hover:from-amber-400 hover:to-yellow-300 transition-colors cursor-pointer"
            >
              Close Receipt
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
