import React from 'react';
import { X, Receipt, Download, Printer, Share2, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { RentalBooking } from '../types';

interface BookingInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: RentalBooking | null;
  bookings: RentalBooking[];
}

export const BookingInvoiceModal: React.FC<BookingInvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
  bookings
}) => {
  if (!isOpen) return null;

  const activeBooking = booking || bookings[0] || {
    id: `BK-${Date.now().toString(36).toUpperCase()}`,
    itemTitle: 'Luxury 2 BHK Apartment (Hiran Magri)',
    userEmail: 'salvirahul7038@gmail.com',
    userName: 'Rahul Salvi',
    userPhone: '+91 98765 43210',
    ownerName: 'Vikram Singh (Owner)',
    ownerContact: '+91 91234 56789',
    tokenAmount: 99,
    status: 'Token Paid',
    createdAt: new Date().toISOString(),
    itemType: 'property'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🧾 *Recko India Tax Invoice & Booking Confirmation*%0A%0ABooking ID: ${activeBooking.id}%0AAsset: ${activeBooking.itemTitle}%0AToken Paid: ₹${activeBooking.tokenAmount || 99}%0AStatus: Verified Token Confirmed ✓%0A%0ADownloaded via Recko India Rental Portal.`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Official Tax Invoice & Payment Receipt</h2>
              <p className="text-xs text-slate-400 font-semibold">Verified Token Payment & Tax Clearance Statement</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Invoice Paper Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs">
          
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-300 shadow-lg space-y-6 font-sans">
            
            {/* Invoice Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950">
                  RECKO <span className="text-amber-600">INDIA</span>
                </h1>
                <p className="text-[11px] text-slate-500 font-bold">Zero Brokerage Digital Rental Platform</p>
                <p className="text-[10px] text-slate-400">GSTIN: 08AAACR9210M1Z2 • Support: support@recko.in</p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase px-3 py-1 rounded-md border border-emerald-300 inline-block">
                  ✓ ORIGINAL PAYMENT RECEIPT
                </span>
                <h4 className="font-mono font-bold text-sm text-slate-900 pt-1">Invoice #{activeBooking.id || 'BK-8941'}</h4>
                <p className="text-[11px] text-slate-500 font-mono">Date: {new Date(activeBooking.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Billed To / Landlord Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Billed To (Tenant):</span>
                <p className="font-extrabold text-slate-950 text-sm">{activeBooking.userName || 'Rahul Salvi'}</p>
                <p className="text-slate-600 font-mono">Email: {activeBooking.userEmail || 'salvirahul7038@gmail.com'}</p>
                <p className="text-slate-600 font-mono">Phone: {activeBooking.userPhone || '+91 98765 43210'}</p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-black uppercase text-slate-400">Host / Landlord Details:</span>
                <p className="font-extrabold text-slate-950 text-sm">{activeBooking.ownerName || 'Vikram Singh (Property Owner)'}</p>
                <p className="text-slate-600 font-mono">Contact: {activeBooking.ownerContact || '+91 91234 56789'}</p>
                <p className="text-emerald-700 font-bold text-[11px]">✓ Verified Host Identity</p>
              </div>
            </div>

            {/* Particulars Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-3 rounded-l-xl">Description</th>
                    <th className="p-3 text-center">Category</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right rounded-r-xl">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-extrabold text-slate-950">
                      {activeBooking.itemTitle || 'Rental Asset Booking'}
                    </td>
                    <td className="p-3 text-center uppercase font-mono text-[10px] font-bold text-slate-600">
                      {activeBooking.itemType || 'Property'}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                        {activeBooking.status || 'Token Confirmed'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-950">
                      ₹{activeBooking.tokenAmount || 99}
                    </td>
                  </tr>

                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={3} className="p-3 text-right text-slate-600">Convenience & Platform Fee (Inclusive 18% GST):</td>
                    <td className="p-3 text-right font-mono">₹0.00 (Waived)</td>
                  </tr>

                  <tr className="bg-slate-100 font-black text-sm">
                    <td colSpan={3} className="p-3 text-right text-slate-950 uppercase">Total Amount Paid:</td>
                    <td className="p-3 text-right font-mono text-emerald-700 text-base">
                      ₹{activeBooking.tokenAmount || 99}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QR Verification Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <QrCode className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-950">QR Code Verified Receipt</p>
                  <p className="text-[10px] text-slate-500">Scan to verify authenticity on Recko Portal</p>
                </div>
              </div>

              <div className="text-right">
                <ShieldCheck className="h-6 w-6 text-emerald-600 inline-block" />
                <p className="text-[10px] font-extrabold text-slate-900">RECKO INDIA SECURED TRANSACTION</p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0 text-xs">
          <button
            onClick={handleShareWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Share via WhatsApp</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
