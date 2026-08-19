import React, { useState } from 'react';
import { X, Trophy, Calendar, Clock, Zap, MapPin, CheckCircle2, ShieldCheck, QrCode, Share2, Plus, Users } from 'lucide-react';
import { SportsTurfItem, RentalBooking, AppNotification } from '../types';
import { saveDocument } from '../lib/firebase';

interface SportsTurfBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  turf: SportsTurfItem | null;
  currentUserEmail?: string;
  currentUserName?: string;
  onBookingConfirmed?: (booking: RentalBooking) => void;
}

export const SportsTurfBookingModal: React.FC<SportsTurfBookingModalProps> = ({
  isOpen,
  onClose,
  turf,
  currentUserEmail,
  currentUserName,
  onBookingConfirmed
}) => {
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [startTimeSlot, setStartTimeSlot] = useState<string>('07:00 PM (Night Floodlight)');
  const [captainName, setCaptainName] = useState<string>(currentUserName || 'Rahul Sharma');
  const [captainPhone, setCaptainPhone] = useState<string>('+91 98765 43210');
  
  // Add-on Equipment Options
  const [needCricketGear, setNeedCricketGear] = useState<boolean>(true);
  const [needBibs, setNeedBibs] = useState<boolean>(false);
  const [needUmpire, setNeedUmpire] = useState<boolean>(false);

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  if (!isOpen || !turf) return null;

  const TIME_SLOTS = [
    '06:00 AM (Early Morning)',
    '08:00 AM (Morning)',
    '04:00 PM (Cool Evening)',
    '06:00 PM (Night Floodlight)',
    '07:00 PM (Night Floodlight)',
    '08:00 PM (Prime Night)',
    '09:00 PM (Prime Night)',
    '10:00 PM (Late Night Match)'
  ];

  // Calculation
  const hourlyRate = turf.rentPerHour || 1200;
  const gearCost = (needCricketGear ? 150 : 0) + (needBibs ? 100 : 0) + (needUmpire ? 300 : 0);
  const totalPrice = (hourlyRate * durationHours) + gearCost;
  const tokenAmount = Math.min(200, Math.round(totalPrice * 0.15));

  const handleConfirmTurfBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingId = `TURF-SLOT-${Date.now().toString(36).toUpperCase()}`;
    setConfirmedBookingId(bookingId);

    const newBooking: RentalBooking = {
      id: bookingId,
      type: 'sports_turf',
      itemId: turf.id,
      itemTitle: `${turf.title} (${durationHours} Hours Ground Slot)`,
      itemImage: turf.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
      startDate: bookingDate,
      daysCount: 1,
      totalPrice: totalPrice,
      tokenPaidAmount: tokenAmount,
      tokenPaymentStatus: 'Paid',
      status: 'Booking Confirmed',
      userName: captainName,
      userPhone: captainPhone,
      userEmail: currentUserEmail || 'captain@renthub.in',
      ownerId: turf.ownerId || 'owner-verified',
      ownerName: turf.title,
      ownerContact: '+91 98765 43210',
      bookingDate: new Date().toISOString()
    };

    // Save to Firestore
    await saveDocument('bookings', newBooking.id, newBooking);

    // Send Notification to Turf Manager
    const notif: AppNotification = {
      id: `notif-turf-${Date.now()}`,
      title: `🏏 New Turf Ground Slot Booked (${durationHours} Hours)`,
      message: `Captain ${captainName} booked ${turf.title} for ${durationHours} hours on ${bookingDate} starting at ${startTimeSlot}. Token Paid: ₹${tokenAmount}`,
      type: 'system',
      timestamp: 'Just now',
      read: false,
      ownerId: turf.ownerId,
      userEmail: currentUserEmail
    };
    await saveDocument('notifications', notif.id, notif);

    if (onBookingConfirmed) {
      onBookingConfirmed(newBooking);
    }

    setIsSuccess(true);
  };

  const handleShareWhatsApp = () => {
    const text = `🏏 *Turf Ground Slot Booking Confirmed!*%0A%0AArena: ${turf.title} (${turf.turfType})%0ADate: ${bookingDate}%0ASlot Time: ${startTimeSlot}%0ADuration: ${durationHours} Hours%0AAdd-ons: ${needCricketGear ? 'Cricket Kit Included' : 'None'}%0ATotal Price: ₹${totalPrice} (Token Paid: ₹${tokenAmount})%0ACaptain: ${captainName}%0ABooking ID: ${confirmedBookingId}%0A%0ABooked via Recko India Sports Arena.`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black">{turf.title}</h2>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  {turf.turfType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{turf.location}, {turf.city}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => { setIsSuccess(false); onClose(); }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {isSuccess ? (
            /* Success Screen with Turf Entry Pass */
            <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30">
                  ✓ TURF GROUND SLOT CONFIRMED
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Ground Booked at {turf.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ground Slot Pass ID: <strong className="text-emerald-400">{confirmedBookingId}</strong>
                </p>
              </div>

              {/* Entry Pass Card */}
              <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto text-left shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Team Captain Details</span>
                    <h4 className="font-extrabold text-sm text-white">{captainName} ({captainPhone})</h4>
                  </div>
                  <QrCode className="h-10 w-10 text-emerald-400 shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Match Date & Start Time</span>
                    <strong className="text-emerald-300 font-mono">{bookingDate} @ {startTimeSlot}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Duration & Rate</span>
                    <strong className="text-white font-mono">{durationHours} Hours (₹{turf.rentPerHour}/hr)</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Exclusive Ground Access Guaranteed</span>
                  </span>
                  <span className="text-amber-400 font-bold">Token Paid: ₹{tokenAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Send Ground Pass to Team on WhatsApp</span>
                </button>

                <button
                  onClick={() => { setIsSuccess(false); onClose(); }}
                  className="bg-zinc-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl transition-all border border-zinc-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleConfirmTurfBooking} className="space-y-5">
              
              {/* Turf Hourly Pricing Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">Ground Rent Rate</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">₹{hourlyRate} <span className="text-xs font-normal text-slate-400">/ hour</span></p>
                </div>
                {turf.floodLights && (
                  <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-xl flex items-center space-x-1">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>24/7 Floodlight Arena</span>
                  </span>
                )}
              </div>

              {/* 1. Select Match Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Match / Game Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Match Starting Time Slot
                  </label>
                  <select
                    value={startTimeSlot}
                    onChange={(e) => setStartTimeSlot(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Duration Selector (Number of Hours) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                  Select Ground Duration (Hours Needed for Full Match)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDurationHours(hrs)}
                      className={`py-3 rounded-xl font-black text-xs transition-all cursor-pointer border text-center flex flex-col items-center justify-center ${
                        durationHours === hrs
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-102'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Clock className="h-4 w-4 mb-0.5" />
                      <span>{hrs} {hrs === 1 ? 'Hour' : 'Hours'}</span>
                      <span className="text-[10px] opacity-80 font-mono">₹{hourlyRate * hrs}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Add-on Sports Equipment Rental */}
              <div className="space-y-2 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <span className="block text-xs font-extrabold text-slate-800 dark:text-zinc-200 mb-1">
                  Add-on Sports Equipment & Referee Services (Optional)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    needCricketGear ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-bold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={needCricketGear}
                      onChange={(e) => setNeedCricketGear(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-[11px]">Cricket Kit (Bats/Stumps) (+₹150)</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    needBibs ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-bold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={needBibs}
                      onChange={(e) => setNeedBibs(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-[11px]">Team Bibs & Vest (+₹100)</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                    needUmpire ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-bold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={needUmpire}
                      onChange={(e) => setNeedUmpire(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-[11px]">Official Match Umpire (+₹300)</span>
                  </label>
                </div>
              </div>

              {/* 4. Team Captain Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Team Captain Name</label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Captain Name"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Captain Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="Mobile Number"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none font-mono"
                  />
                </div>
              </div>

              {/* Summary Bar */}
              <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Total Ground Rent ({durationHours} Hrs)</span>
                  <span className="text-xl font-black text-emerald-400">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Token to Hold Slot</span>
                  <span className="text-sm font-black text-amber-400">₹{tokenAmount} Token</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 cursor-pointer transition-all text-xs flex items-center justify-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span>Confirm Ground Slot & Pay ₹{tokenAmount} Token</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
