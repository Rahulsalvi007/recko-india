import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  CheckCircle2,
  XCircle,
  Car,
  Home,
  Hotel as HotelIcon,
  UtensilsCrossed,
  BookOpen,
  Phone,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  User,
  LogIn,
  BadgeCheck,
  Building2,
  FileCheck,
  Receipt,
  Download,
  Trash2,
  MessageSquare,
  MessageCircle,
  Shirt
} from 'lucide-react';
import { RentalBooking, UserProfile } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface MyBookingsSectionProps {
  bookings: RentalBooking[];
  currentUser?: UserProfile | null;
  onOpenUserAuthModal?: () => void;
  onOpenReceipt: (booking: RentalBooking) => void;
  onOpenTracking?: (booking: RentalBooking) => void;
  onOpenChat?: (booking: RentalBooking) => void;
  onOpenVehicleInspection?: (booking: RentalBooking, mode: 'pickup' | 'return') => void;
  onCancelBooking: (id: string) => void;
  onDeleteBooking?: (id: string) => void;
  onNavigateToRentStore: () => void;
}

export const MyBookingsSection: React.FC<MyBookingsSectionProps> = ({
  bookings,
  currentUser,
  onOpenUserAuthModal,
  onOpenReceipt,
  onOpenTracking,
  onOpenChat,
  onOpenVehicleInspection,
  onCancelBooking,
  onDeleteBooking,
  onNavigateToRentStore
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Pending Verification' | 'Accepted' | 'Completed' | 'Cancelled'>('ALL');

  const handleDeleteOrCancel = (booking: RentalBooking) => {
    const isPending = booking.status === 'Pending Verification' || booking.status === 'Pending Requests' || booking.status === 'Owner Reviewing' || booking.status === 'Active';
    const message = isPending
      ? `Are you sure you want to cancel booking #${booking.id} for "${booking.itemTitle}"?\n\nThis will cancel your request and permanently remove it from your booking history.`
      : `Remove booking #${booking.id} permanently from your history?`;

    if (window.confirm(message)) {
      if (onDeleteBooking) {
        onDeleteBooking(booking.id);
      } else {
        onCancelBooking(booking.id);
      }
    }
  };

  const handleWhatsApp = (b: RentalBooking) => {
    openWhatsAppChat({
      phoneNumber: b.ownerContact || '+91 98765 43210',
      itemTitle: b.itemTitle,
      itemCategory: b.type,
      ownerName: b.ownerName || 'Host',
      price: `₹${b.totalPrice.toLocaleString('en-IN')}`,
      customMessage: `Namaste ${b.ownerName || 'Host'}! I have a booking request (#${b.id}) on RentHub for "${b.itemTitle}". Looking forward to coordinating with you!`
    });
  };

  if (!currentUser) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto px-2 sm:px-4">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-5 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-zinc-800 text-amber-400 border border-zinc-700 px-3.5 py-1 rounded-full text-xs font-black mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Rental Activity & Tenant KYC Hub</span>
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                My Booking Requests & Tenant Verification
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                Track real-time host approvals, tenant identity verification status, and GST rental receipts.
              </p>
            </div>

            <button
              onClick={onNavigateToRentStore}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-amber-400/20 hover:scale-105 shrink-0 flex items-center space-x-2 cursor-pointer w-fit"
            >
              <span>Explore Rentals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Not Logged In State Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-14 text-center space-y-4 shadow-sm max-w-xl mx-auto my-6">
          <div className="h-16 w-16 bg-amber-500/10 dark:bg-zinc-800 rounded-2xl text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">
              Please Log In to View Your Booking Requests
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1 font-medium leading-relaxed">
              Sign in or create an account to view your tenant KYC status, direct owner contact details, and official rental receipts.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenUserAuthModal}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'Pending Verification') {
      return b.status === 'Pending Verification' || b.status === 'Pending' || b.status === 'Active';
    }
    return b.status === filterStatus;
  });

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Home className="h-4 w-4 text-amber-400" />;
      case 'vehicle':
        return <Car className="h-4 w-4 text-emerald-400" />;
      case 'hotel':
        return <HotelIcon className="h-4 w-4 text-sky-400" />;
      case 'restaurant':
        return <UtensilsCrossed className="h-4 w-4 text-rose-400" />;
      case 'clothing':
        return <Shirt className="h-4 w-4 text-purple-400" />;
      case 'library':
        return <BookOpen className="h-4 w-4 text-amber-300" />;
      default:
        return <Home className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-5 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-zinc-800 text-amber-400 border border-zinc-700 px-3.5 py-1 rounded-full text-xs font-black mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Rental Activity & Tenant Verification</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              My Rental Bookings & Verification Status
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              View tenant verification details, live host chat, WhatsApp contact, and official GST token receipts.
            </p>
          </div>

          <button
            onClick={onNavigateToRentStore}
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-lg shadow-amber-400/20 hover:scale-105 shrink-0 flex items-center space-x-2 cursor-pointer w-fit"
          >
            <span>Explore More for Rent</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & History Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: `All Requests (${bookings.length})` },
            { id: 'Pending Verification', label: '🟡 Under Host Review' },
            { id: 'Accepted', label: '🟢 Confirmed / Active' },
            { id: 'Completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold self-end sm:self-center">
          Showing <span className="font-bold text-slate-900 dark:text-zinc-100">{filteredBookings.length}</span> bookings
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm max-w-xl mx-auto my-6">
          <div className="h-14 w-14 bg-amber-500/10 dark:bg-zinc-800 rounded-2xl text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-black">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
              No Booking History Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1 font-medium">
              You do not have any bookings in this section. Cancelled bookings are automatically purged from your history.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onNavigateToRentStore}
              className="bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1.5"
            >
              <span>Browse Verified Stays & Cars</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-4 hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: ID, Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 shrink-0">
                      {getItemTypeIcon(b.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-zinc-100">
                          #{b.id}
                        </span>
                        <span className="text-[10px] uppercase font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                          {b.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium block truncate">
                        Requested on {b.bookingDate}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-black border flex items-center space-x-1 shrink-0 ${
                      b.status === 'Accepted' || b.status === 'Booking Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : b.status === 'Vehicle Picked Up'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : b.status === 'Rental Active'
                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : b.status === 'Return Pending'
                        ? 'bg-orange-50 text-orange-700 border-orange-300'
                        : b.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black'
                        : b.status === 'Rejected' || b.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span>
                      {b.status === 'Pending Verification' ? '🟡 Pending Verification' :
                       b.status === 'Booking Confirmed' || b.status === 'Accepted' ? '🟢 Booking Confirmed' :
                       b.status === 'Vehicle Picked Up' ? '🔵 Vehicle Picked Up' :
                       b.status === 'Rental Active' ? '🟣 Rental Active' :
                       b.status === 'Return Pending' ? '🟠 Return Pending' :
                       b.status === 'Completed' ? '✅ Completed' : b.status}
                    </span>
                  </span>
                </div>

                {/* Main Item Image & Details */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="h-28 sm:h-24 w-full sm:w-28 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 relative border border-slate-100 dark:border-zinc-800">
                    <img
                      src={b.itemImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'}
                      alt={b.itemTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-zinc-100 line-clamp-1">
                      {b.itemTitle}
                    </h3>
                    
                    <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold space-y-1 pt-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Move-In / Start: <strong>{b.startDate}</strong></span>
                      </div>
                      
                      <div className="flex items-center space-x-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>Host: <strong>{b.ownerName || 'Verified Owner'}</strong></span>
                      </div>

                      {b.govIdNumber && (
                        <div className="flex items-center space-x-1.5">
                          <FileCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="font-mono text-[11px]">
                            {b.govIdType || 'Gov ID'}: {b.govIdNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Token Paid Status & Guarantee Seal */}
                <div className="bg-slate-50 dark:bg-zinc-800/70 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-700 dark:text-zinc-300 font-bold">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      Token: <strong className="text-emerald-600 dark:text-emerald-400">₹{b.tokenPaidAmount || 99} (Paid ✓)</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-400 uppercase font-bold block">Estimated Rent</span>
                    <span className="text-sm font-black text-slate-900 dark:text-zinc-100 font-mono">
                      ₹{b.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Direct Owner Communication Strip (Chat + WhatsApp + Call) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => onOpenChat(b)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs py-2 px-2.5 rounded-xl border border-indigo-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Chat Host</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(b)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs py-2 px-2.5 rounded-xl border border-emerald-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </button>

                  {b.ownerContact && (
                    <a
                      href={`tel:${b.ownerContact}`}
                      className="col-span-2 sm:col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 px-2.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center space-x-1.5 text-center"
                    >
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>Call Host</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Actions (Receipt, Pickup Inspection, GPS Track, Cancel/Delete) */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(b)}
                    className="flex-1 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 font-black text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Receipt className="h-3.5 w-3.5 text-amber-400 dark:text-zinc-950" />
                    <span>Token Receipt</span>
                  </button>

                  {b.type === 'vehicle' && onOpenVehicleInspection && (
                    <button
                      type="button"
                      onClick={() => onOpenVehicleInspection(b, (b.status === 'Vehicle Picked Up' || b.status === 'Rental Active' || b.status === 'Return Pending') ? 'return' : 'pickup')}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-2.5 rounded-xl flex items-center space-x-1 cursor-pointer shrink-0 shadow-md shadow-amber-400/20"
                    >
                      <Car className="h-3.5 w-3.5" />
                      <span>
                        {(b.status === 'Vehicle Picked Up' || b.status === 'Rental Active' || b.status === 'Return Pending')
                          ? '🔄 Return & Settle'
                          : '📷 Digital Inspection'}
                      </span>
                    </button>
                  )}


                </div>

                {/* Cancel & Delete from History Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteOrCancel(b)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-extrabold text-xs px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shrink-0 flex items-center space-x-1"
                  title="Cancel and permanently remove from booking history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{b.status === 'Cancelled' ? 'Delete from History' : 'Cancel & Remove'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
