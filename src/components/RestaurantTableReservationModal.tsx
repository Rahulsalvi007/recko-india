import React, { useState } from 'react';
import { X, Utensils, Calendar, Clock, Users, MapPin, CheckCircle2, Sparkles, Heart, Share2, ShieldCheck, QrCode, Phone } from 'lucide-react';
import { Restaurant, RentalBooking, AppNotification } from '../types';
import { saveDocument } from '../lib/firebase';

interface RestaurantTableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  currentUserEmail?: string;
  currentUserName?: string;
  onBookingConfirmed?: (booking: RentalBooking) => void;
}

export const RestaurantTableReservationModal: React.FC<RestaurantTableReservationModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  currentUserEmail,
  currentUserName,
  onBookingConfirmed
}) => {
  const [guestCount, setGuestCount] = useState<number>(2);
  const [seatingPreference, setSeatingPreference] = useState<'Indoor AC' | 'Rooftop Skyline' | 'Private VIP Booth' | 'Garden Outdoor'>('Indoor AC');
  const [reservationDate, setReservationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState<string>('08:00 PM');
  const [occasion, setOccasion] = useState<string>('Casual Dining');
  const [guestName, setGuestName] = useState<string>(currentUserName || 'Rahul Sharma');
  const [guestPhone, setGuestPhone] = useState<string>('+91 98765 43210');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');

  if (!isOpen || !restaurant) return null;

  const TIME_SLOTS = [
    '12:30 PM (Lunch)',
    '01:30 PM (Lunch)',
    '02:30 PM (Lunch)',
    '07:00 PM (Dinner)',
    '08:00 PM (Dinner)',
    '09:00 PM (Dinner)',
    '10:00 PM (Dinner)'
  ];

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingId = `REST-TBL-${Date.now().toString(36).toUpperCase()}`;
    setConfirmedBookingId(bookingId);

    const newBooking: RentalBooking = {
      id: bookingId,
      type: 'restaurant',
      itemId: restaurant.id,
      itemTitle: `${restaurant.title} (Table for ${guestCount})`,
      itemImage: restaurant.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      startDate: reservationDate,
      daysCount: 1,
      totalPrice: 0, // Free Table Reservation
      tokenPaidAmount: 0,
      tokenPaymentStatus: 'Paid',
      status: 'Booking Confirmed',
      userName: guestName,
      userPhone: guestPhone,
      userEmail: currentUserEmail || 'guest@renthub.in',
      ownerId: restaurant.ownerId || 'owner-verified',
      ownerName: restaurant.title,
      ownerContact: restaurant.phone || '+91 91234 56789',
      bookingDate: new Date().toISOString()
    };

    // Save to Firestore
    await saveDocument('bookings', newBooking.id, newBooking);

    // Send Notification to Owner
    const notif: AppNotification = {
      id: `notif-table-${Date.now()}`,
      title: `🍽️ New Table Reservation (${guestCount} Guests)`,
      message: `${guestName} reserved a table for ${guestCount} guests at ${restaurant.title} on ${reservationDate} at ${timeSlot}. Seating: ${seatingPreference}.`,
      type: 'system',
      timestamp: 'Just now',
      read: false,
      ownerId: restaurant.ownerId,
      userEmail: currentUserEmail
    };
    await saveDocument('notifications', notif.id, notif);

    if (onBookingConfirmed) {
      onBookingConfirmed(newBooking);
    }

    setIsSuccess(true);
  };

  const handleShareWhatsApp = () => {
    const text = `🍽️ *Table Reservation Confirmed!*%0A%0ARestaurant: ${restaurant.title}%0AGuests: ${guestCount} Person(s)%0ASeating: ${seatingPreference}%0ADate: ${reservationDate}%0ATime Slot: ${timeSlot}%0AGuest Name: ${guestName}%0ABooking ID: ${confirmedBookingId}%0A%0AReserved via Recko India Dining Portal.`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">{restaurant.title}</h2>
              <p className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                <span>{restaurant.location}, {restaurant.city}</span>
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
            /* Success Screen with Pass & QR */
            <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30">
                  ✓ TABLE RESERVATION CONFIRMED
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Table Reserved at {restaurant.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Reservation Pass ID: <strong className="text-amber-500">{confirmedBookingId}</strong>
                </p>
              </div>

              {/* Reservation Pass Card */}
              <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto text-left shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Guest Details</span>
                    <h4 className="font-extrabold text-sm text-white">{guestName} ({guestPhone})</h4>
                  </div>
                  <QrCode className="h-10 w-10 text-amber-400 shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Date & Time</span>
                    <strong className="text-amber-300 font-mono">{reservationDate} @ {timeSlot}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Party Size</span>
                    <strong className="text-white font-mono">{guestCount} Guests ({seatingPreference})</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Instant Entry Guaranteed</span>
                  </span>
                  <span className="text-slate-400">Call: {restaurant.phone || '+91 91234 56789'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Send Confirmation Pass on WhatsApp</span>
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
            /* Reservation Form */
            <form onSubmit={handleConfirmReservation} className="space-y-5">
              
              {/* Restaurant Quick Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wide">Avg Cost for Two</span>
                  <p className="text-base font-black text-slate-900 dark:text-white">₹{restaurant.averageCostForTwo.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Opening Hours</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-200">{restaurant.openingHours}</p>
                </div>
              </div>

              {/* 1. Party Size / Guest Count Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                  Select Number of Guests (Party Size)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer border flex flex-col items-center justify-center ${
                        guestCount === num
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-102'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 mb-0.5" />
                      <span>{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Seating Preference Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                  Seating Area Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Indoor AC', label: '❄️ Indoor AC' },
                    { id: 'Rooftop Skyline', label: '🌆 Rooftop Skyline' },
                    { id: 'Private VIP Booth', label: '💎 VIP Booth' },
                    { id: 'Garden Outdoor', label: '🌿 Garden Outdoor' }
                  ].map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setSeatingPreference(area.id as any)}
                      className={`p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border text-center ${
                        seatingPreference === area.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md font-extrabold'
                          : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Select Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Occasion Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Dining Occasion (Optional)
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none"
                >
                  <option value="Casual Dining">Casual Dining / Friends Outing</option>
                  <option value="Birthday Celebration 🎂">Birthday Celebration 🎂</option>
                  <option value="Anniversary Dinner 💖">Anniversary Dinner 💖</option>
                  <option value="Business Lunch / Meeting 💼">Business Lunch / Meeting 💼</option>
                  <option value="Candle Light Dinner 🕯️">Candle Light Setup 🕯️</option>
                </select>
              </div>

              {/* 5. Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest Name"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Mobile Number"
                    className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none font-mono"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 cursor-pointer transition-all border border-blue-400 text-xs flex items-center justify-center space-x-2"
              >
                <Utensils className="h-4 w-4" />
                <span>Confirm & Hold Table (Free Reservation)</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
