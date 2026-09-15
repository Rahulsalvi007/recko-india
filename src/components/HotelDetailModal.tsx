import React, { useState } from 'react';
import { Hotel, HotelRoom } from '../types';
import { X, Star, MapPin, Calendar, Users, CheckCircle, Sparkles, Coffee, ShieldCheck, Navigation, MessageCircle, MessageSquare, Phone } from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsapp';
import { makePhoneCall } from '../utils/phoneCall';

interface HotelDetailModalProps {
  hotel: Hotel;
  onClose: () => void;
  onConfirmBooking: (bookingDetails: {
    hotel: Hotel;
    selectedRoom: HotelRoom;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    totalPrice: number;
    nightsCount: number;
  }) => void;
  onOpenMap: (hotel: Hotel) => void;
  onOpenChat?: (item: any) => void;
}

export const HotelDetailModal: React.FC<HotelDetailModalProps> = ({
  hotel,
  onClose,
  onConfirmBooking,
  onOpenMap,
  onOpenChat
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0].id : ''
  );
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [guestsCount, setGuestsCount] = useState<number>(2);

  const activeRoom = hotel.rooms.find((r) => r.id === selectedRoomId) || hotel.rooms[0];

  // Calculate nights
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffTime = Math.max(d2.getTime() - d1.getTime(), 86400000);
  const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const totalPrice = (activeRoom ? activeRoom.pricePerNight : 3000) * nightsCount;

  const handleBook = () => {
    if (!activeRoom) return;
    onConfirmBooking({
      hotel,
      selectedRoom: activeRoom,
      checkInDate,
      checkOutDate,
      guestsCount,
      totalPrice,
      nightsCount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-slate-900 dark:text-white p-5 sm:p-6 flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
            >
              <X className="h-4 w-4" />
              <span>← Back to Hotels</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{hotel.title}</h2>
              <div className="flex items-center space-x-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{hotel.location}, {hotel.city}</span>
                <span>•</span>
                <div className="flex items-center space-x-1 text-amber-500 dark:text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{hotel.rating} ({hotel.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900 dark:text-white">
          
          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 h-64 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900">
              <img
                src={hotel.images[0]}
                alt={hotel.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col gap-3 h-64">
              {hotel.images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="h-30 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900">
                  <img src={img} alt="Hotel preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Description & Distance Quick Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 font-medium leading-relaxed max-w-2xl">
              {hotel.description}
            </p>

            <button
              onClick={() => onOpenMap(hotel)}
              className="bg-slate-950 hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 shadow-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>Location Map</span>
            </button>
          </div>

          {/* Room Categories */}
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3">Available Room Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hotel.rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-600/30'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{room.roomType}</h4>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">₹{room.pricePerNight.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/night</span></span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-3">{room.beds} • Max {room.capacity} Guests</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((am, i) => (
                        <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Config Bar */}
          <div className="bg-slate-900 dark:bg-zinc-900 text-white p-5 rounded-3xl border border-slate-800 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider">
              Stay Details & Instant Reserve
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Check-In Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Check-Out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Guests Count</label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={5}>5+ Guests</option>
                </select>
              </div>
            </div>

            {/* Price Summary & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-slate-800 gap-3">
              <div>
                <span className="text-xs text-slate-400 font-bold">Total Estimated Cost ({nightsCount} nights):</span>
                <p className="text-2xl font-black text-white">
                  ₹{totalPrice.toLocaleString('en-IN')}
                  <span className="text-xs text-slate-400 font-medium ml-1.5">(Inclusive of Taxes)</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenChat) {
                      onOpenChat({
                        id: hotel.id,
                        title: `${hotel.title} (${activeRoom?.roomType || 'Stay'})`,
                        image: hotel.images[0],
                        priceDisplay: `₹${totalPrice.toLocaleString('en-IN')} (${nightsCount}N)`,
                        ownerName: hotel.ownerName || 'Grand Hotel Manager',
                        ownerContact: hotel.ownerContact || '+91 98765 43210',
                        category: 'Hotel',
                        location: hotel.location,
                        city: hotel.city
                      });
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-blue-300 font-black text-xs px-4 py-3 rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat Hotel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppChat({
                      phoneNumber: hotel.ownerContact || '+91 98765 43210',
                      itemTitle: `${hotel.title} (${activeRoom?.roomType || 'Room'})`,
                      itemCategory: 'Hotel Stay',
                      ownerName: hotel.ownerName || 'Hotel Manager',
                      price: `₹${totalPrice.toLocaleString('en-IN')}`,
                      location: hotel.location,
                      city: hotel.city
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-3 rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => makePhoneCall(hotel.ownerContact || '+91 98765 43210', hotel.ownerName || hotel.title)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Hotel</span>
                </button>

                <button
                  onClick={handleBook}
                  className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-lg cursor-pointer border border-blue-400"
                >
                  Confirm Room Booking
                </button>
              </div>
            </div>
          </div>

          {/* Hotel Amenities List */}
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Hotel Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hotel.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 bg-white p-2.5 rounded-xl border border-[#E5E0D8]">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
