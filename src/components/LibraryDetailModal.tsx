import React, { useState } from 'react';
import { Library } from '../types';
import { X, Star, MapPin, QrCode, Calendar, BookOpen, ShieldCheck, CheckCircle, Navigation, Sparkles, UserCheck } from 'lucide-react';

interface LibraryDetailModalProps {
  library: Library;
  onClose: () => void;
  onConfirmPassBooking: (passDetails: {
    library: Library;
    passType: 'Daily Pass' | 'Weekly Pass' | 'Monthly Pass';
    allocatedSeatNumber: string;
    startDate: string;
    totalPrice: number;
    qrCodePass: string;
  }) => void;
  onOpenMap: (library: Library) => void;
}

export const LibraryDetailModal: React.FC<LibraryDetailModalProps> = ({
  library,
  onClose,
  onConfirmPassBooking,
  onOpenMap,
}) => {
  const [selectedPassType, setSelectedPassType] = useState<'Daily Pass' | 'Weekly Pass' | 'Monthly Pass'>('Monthly Pass');
  const [allocatedSeatNumber, setAllocatedSeatNumber] = useState<string>('Bay-B / Seat #14');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const priceMap = {
    'Daily Pass': library.dailyPassPrice,
    'Weekly Pass': library.weeklyPassPrice,
    'Monthly Pass': library.monthlyPassPrice,
  };

  const currentPrice = priceMap[selectedPassType];
  const mockQrCode = `QR-PASS-LIB-${library.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleBookPass = () => {
    onConfirmPassBooking({
      library,
      passType: selectedPassType,
      allocatedSeatNumber,
      startDate,
      totalPrice: currentPrice,
      qrCodePass: mockQrCode,
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
              <span>← Back to Libraries</span>
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{library.title}</h2>
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>{library.location}, {library.city}</span>
                <span>•</span>
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>{library.rating} ({library.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900">
          
          {/* Images & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 h-60 rounded-2xl overflow-hidden bg-slate-900">
              <img src={library.images[0]} alt={library.title} className="w-full h-full object-cover" />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E0D8] flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Live Seat Count</span>
                <p className="text-2xl font-black text-slate-950 mt-0.5">
                  {library.availableSeats} <span className="text-xs text-slate-500 font-medium">/ {library.totalSeats} seats free</span>
                </p>
              </div>

              <div className="my-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Private Cabins</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{library.availableCabins} of {library.totalCabins} cabins free</p>
              </div>

              <button
                onClick={() => onOpenMap(library)}
                className="w-full bg-[#151B26] hover:bg-black text-[#FAF7F2] font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <Navigation className="h-4 w-4 text-amber-300" />
                <span>View Distance</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-white p-4 rounded-2xl border border-[#E5E0D8]">
            {library.description}
          </p>

          {/* Membership Pass Chooser */}
          <div className="bg-[#151B26] text-[#FAF7F2] p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-amber-200 uppercase tracking-wider flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Select Membership Pass & Instant QR Generation</span>
            </h3>

            {/* Pass Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['Daily Pass', 'Weekly Pass', 'Monthly Pass'] as const).map((pass) => (
                <div
                  key={pass}
                  onClick={() => setSelectedPassType(pass)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPassType === pass
                      ? 'border-amber-300 bg-[#222B3B] text-white shadow-lg'
                      : 'border-slate-800 bg-[#1A212E] text-slate-300 hover:bg-[#222B3B]'
                  }`}
                >
                  <span className="text-xs font-extrabold uppercase tracking-wider block text-amber-300">{pass}</span>
                  <p className="text-2xl font-black mt-1">₹{priceMap[pass]}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Includes AC, Wi-Fi & Seat Pass</p>
                </div>
              ))}
            </div>

            {/* Date & Seat Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Pass Activation Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Preferred Seat Zone</label>
                <select
                  value={allocatedSeatNumber}
                  onChange={(e) => setAllocatedSeatNumber(e.target.value)}
                  className="w-full bg-[#222B3B] border border-slate-700 rounded-xl px-3 py-2 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option value="Bay-A / Desk #04 (Quiet Bay)">Bay-A / Desk #04 (Silent Zone)</option>
                  <option value="Bay-B / Desk #14 (Window View)">Bay-B / Desk #14 (Window View)</option>
                  <option value="Cabin-02 (Soundproof Workstation)">Cabin-02 (Soundproof Workstation)</option>
                  <option value="General Desk #32">General Reading Desk #32</option>
                </select>
              </div>
            </div>

            {/* Price & Checkout */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800 gap-3">
              <div>
                <span className="text-xs text-slate-400 font-bold">Total Pass Cost:</span>
                <p className="text-2xl font-black text-[#FAF7F2]">₹{currentPrice}</p>
              </div>

              <button
                onClick={handleBookPass}
                className="w-full sm:w-auto bg-[#FAF7F2] hover:bg-white text-slate-950 font-black text-sm px-8 py-3 rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2"
              >
                <QrCode className="h-4 w-4 text-slate-950" />
                <span>Confirm Pass & Generate QR Code</span>
              </button>
            </div>
          </div>

          {/* Library Rules */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Library Guidelines</h3>
            <div className="space-y-1.5">
              {library.rules.map((rule, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-[#E5E0D8]">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
