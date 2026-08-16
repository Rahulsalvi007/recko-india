import React, { useState } from 'react';
import { Hotel, HotelRoom } from '../types';
import { X, Star, MapPin, Calendar, Users, CheckCircle, Sparkles, Coffee, ShieldCheck, Navigation, MessageCircle, MessageSquare } from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsapp';

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
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] dark:bg-zinc-950 text-slate-900 dark:text-white overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-[#0C1017] text-[#FAF7F2] p-5 sm:p-6 flex justify-between items-center border-b border-slate-800 sticky top-0 z-40 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700"
            >
              <X className="h-4 w-4" />
              <span>← Back to Hotels</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{hotel.title}</h2>
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>{hotel.location}, {hotel.city}</span>
                <span>•</span>
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{hotel.rating} ({hotel.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900">
          
          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 h-64 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={hotel.images[0]}
                alt={hotel.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col gap-3 h-64">
              {hotel.images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="h-30 rounded-2xl overflow-hidden bg-slate-900">
                  <img src={img} alt="Hotel preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Description & Distance Quick Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D8]">
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-2xl">
              {hotel.description}
            </p>

            <button
              onClick={() => onOpenMap(hotel)}
              className="bg-[#151B26] hover:bg-black text-[#FAF7F2] font-black text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 shadow-sm"
            >
              <Navigation className="h-4 w-4 text-amber-300" />
              <span>Map & Distance</span>
            </button>
          </div>

          {/* Select Room Type */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Coffee className="h-4 w-4 text-slate-800" />
              <span>Select Room Type</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotel.rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-950 bg-white shadow-md'
                        : 'border-[#E5E0D8] bg-[#F7F4EE] hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-950">{room.roomType}</h4>
                        <p className="text-xs text-slate-500 font-medium">{room.beds} • Max {room.capacity} Guests</p>
                      </div>
                      <span className="text-base font-black text-slate-950">
                        ₹{room.pricePerNight.toLocaleString('en-IN')}<span className="text-xs text-slate-500">/night</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {room.amenities.map((am, i) => (
                        <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
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
          <div className="bg-[#151B26] text-[#FAF7F2] p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-amber-200 uppercase tracking-wider">
              Stay Details & Instant Reserve
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Check-In Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Check-Out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Guests Count</label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
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
                <p className="text-2xl font-black text-[#FAF7F2]">
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
                  className="bg-[#222B3B] hover:bg-[#2c374b] text-indigo-300 font-black text-xs px-4 py-3 rounded-2xl transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
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
                  onClick={handleBook}
                  className="flex-1 sm:flex-initial bg-[#FAF7F2] hover:bg-white text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-lg cursor-pointer"
                >
                  Confirm Room Booking
                </button>
              </div>
            </div>
          </div>

          {/* Hotel Amenities List */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Hotel Amenities</h3>
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
