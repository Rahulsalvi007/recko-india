import React, { useState } from 'react';
import { Restaurant } from '../types';
import { X, Star, MapPin, Calendar, Clock, Users, Utensils, CheckCircle, Navigation, Sparkles } from 'lucide-react';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onConfirmReservation: (reservationDetails: {
    restaurant: Restaurant;
    tableType: string;
    reservationDate: string;
    reservationTime: string;
    guestsCount: number;
    specialRequest?: string;
  }) => void;
  onOpenMap: (restaurant: Restaurant) => void;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurant,
  onClose,
  onConfirmReservation,
  onOpenMap,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>(
    restaurant.tableTypes && restaurant.tableTypes.length > 0 ? restaurant.tableTypes[0] : '2-Seater Couple Table'
  );
  const [reservationDate, setReservationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reservationTime, setReservationTime] = useState<string>('08:00 PM');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [specialRequest, setSpecialRequest] = useState<string>('');
  const [activeMenuTab, setActiveMenuTab] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(restaurant.menu.map((m) => m.category)))];

  const filteredMenu = activeMenuTab === 'All'
    ? restaurant.menu
    : restaurant.menu.filter((m) => m.category === activeMenuTab);

  const handleReserve = () => {
    onConfirmReservation({
      restaurant,
      tableType: selectedTable,
      reservationDate,
      reservationTime,
      guestsCount,
      specialRequest,
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
              <span>← Back to Dining</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{restaurant.title}</h2>
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>{restaurant.location}, {restaurant.city}</span>
                <span>•</span>
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{restaurant.rating} ({restaurant.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900">
          
          {/* Images & Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 h-60 rounded-2xl overflow-hidden bg-slate-900">
              <img src={restaurant.images[0]} alt={restaurant.title} className="w-full h-full object-cover" />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Average Cost</span>
                <p className="text-2xl font-black text-slate-950 mt-0.5">₹{restaurant.averageCostForTwo} <span className="text-xs text-slate-500 font-medium">for two</span></p>
              </div>

              <div className="my-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Opening Hours</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{restaurant.openingHours}</p>
              </div>

              <button
                onClick={() => onOpenMap(restaurant)}
                className="w-full bg-[#151B26] hover:bg-black text-[#FAF7F2] font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <Navigation className="h-4 w-4 text-amber-300" />
                <span>View Directions</span>
              </button>
            </div>
          </div>

          {/* Table Reservation Box */}
          <div className="bg-[#151B26] text-[#FAF7F2] p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-amber-200 uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Instant Table Reservation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Time Slot</label>
                <select
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option value="01:00 PM">01:00 PM (Lunch)</option>
                  <option value="02:30 PM">02:30 PM (Lunch)</option>
                  <option value="07:30 PM">07:30 PM (Dinner)</option>
                  <option value="08:30 PM">08:30 PM (Dinner)</option>
                  <option value="09:30 PM">09:30 PM (Late Dinner)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Party Size</label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option value={2}>2 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={6}>6 Guests</option>
                  <option value={8}>8+ Family/Group</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Seating Zone</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                >
                  {restaurant.tableTypes.map((tt, i) => (
                    <option key={i} value={tt}>{tt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800 gap-3">
              <input
                type="text"
                placeholder="Special Notes (e.g., Birthday Candle, Quiet Corner)..."
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                className="w-full sm:flex-1 bg-[#222B3B] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none"
              />

              <button
                onClick={handleReserve}
                className="w-full sm:w-auto bg-[#FAF7F2] hover:bg-white text-slate-950 font-black text-sm px-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Reserve Table Now
              </button>
            </div>
          </div>

          {/* Menu Items Showcase */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Restaurant Food Menu</h3>
              
              {/* Menu Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveMenuTab(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                      activeMenuTab === cat
                        ? 'bg-slate-950 text-[#FAF7F2]'
                        : 'bg-white text-slate-700 border border-[#E5E0D8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMenu.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-[#E5E0D8] flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      <h4 className="font-extrabold text-sm text-slate-950">{item.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                  </div>
                  <span className="font-black text-sm text-slate-950 bg-[#F7F4EE] px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
                    ₹{item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
