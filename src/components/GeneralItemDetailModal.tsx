import React, { useState } from 'react';
import { GeneralItem } from '../types';
import { makePhoneCall } from '../utils/phoneCall';
import {
  X,
  Star,
  MapPin,
  ShieldCheck,
  Phone,
  Calendar,
  CheckCircle2,
  PackageCheck,
  Tag,
  Wrench,
  AlertCircle,
  Sparkles,
  Heart
} from 'lucide-react';

interface GeneralItemDetailModalProps {
  item: GeneralItem | null;
  onClose: () => void;
  onBookNow?: (item: GeneralItem, durationDays: number, totalCost: number) => void;
  onBook?: (item: GeneralItem) => void;
  isWishlisted?: boolean;
  isSaved?: boolean;
  onToggleWishlist?: (item: GeneralItem) => void;
  onToggleSave?: (id: string) => void;
}

export const GeneralItemDetailModal: React.FC<GeneralItemDetailModalProps> = ({
  item,
  onClose,
  onBookNow,
  onBook,
  isWishlisted,
  isSaved,
  onToggleWishlist,
  onToggleSave
}) => {
  if (!item) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [rentDurationDays, setRentDurationDays] = useState(3);
  const [useMonthlyRate, setUseMonthlyRate] = useState(false);

  const dailyTotal = (item.rentPerDay || 0) * rentDurationDays;
  const monthlyTotal = item.rentPerMonth ? Math.round((item.rentPerMonth / 30) * rentDurationDays) : dailyTotal;
  const calculatedTotal = useMonthlyRate && item.rentPerMonth && rentDurationDays >= 30 ? item.rentPerMonth : dailyTotal;

  const handleBook = () => {
    if (onBook) onBook(item);
    else if (onBookNow) onBookNow(item, rentDurationDays, calculatedTotal);
  };

  const handleToggleSave = () => {
    if (onToggleWishlist) onToggleWishlist(item);
    else if (onToggleSave) onToggleSave(item.id);
  };

  const saved = isSaved || isWishlisted;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white overflow-y-auto w-full h-full min-h-screen animate-in fade-in duration-200">
      <div className="w-full min-h-screen flex flex-col">
        {/* Header Bar */}
          <div className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
                <span>← Back to Rentals</span>
              </button>
              <span className="hidden sm:inline bg-amber-400 text-zinc-950 font-extrabold text-xs px-3 py-1 rounded-lg">
                {item.category?.toUpperCase()}
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                <Tag className="h-3.5 w-3.5" />
                <span>{item.subType}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleWishlist?.(item)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={item.images[activeImageIdx] || item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-extrabold flex items-center space-x-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>{item.rating} ({item.reviewsCount} reviews)</span>
                </div>
              </div>

              {item.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-1">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative h-20 w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIdx === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Owner Info */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{item.title}</h1>
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400 flex items-center space-x-1.5 mt-1">
                    <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{item.location}, {item.city}</span>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 shrink-0 flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
                    {item.ownerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold">Rental Provider</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1">
                      <span>{item.ownerName}</span>
                      {item.ownerVerified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                    </p>
                    <button
                      type="button"
                      onClick={() => makePhoneCall(item.ownerContact, item.ownerName)}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1 hover:underline cursor-pointer"
                      title="Click to Call Provider"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{item.ownerContact || '+91 98765 43210'} (Call)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Specs */}
            {item.specs && item.specs.length > 0 && (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 p-5 rounded-2xl space-y-2">
                <h3 className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider flex items-center space-x-1">
                  <Wrench className="h-4 w-4" />
                  <span>Key Specifications & Included Accessories</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {item.specs.map((spec, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Item Details & Condition</h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                {item.description}
              </p>
            </div>

            {/* Rental Duration & Cost Calculator */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>Select Rental Duration</span>
                </h3>
                <span className="text-xs text-amber-400 font-bold">Refundable Security Deposit: ₹{item.deposit}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Rental Days</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={rentDurationDays}
                    onChange={(e) => setRentDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-end justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Total Estimated Cost</span>
                    <span className="text-xl font-black text-amber-400">₹{calculatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded-md border border-emerald-700/50">
                    Deposit included separately
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleBook()}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Confirm & Reserve Rental for {rentDurationDays} Days</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};
