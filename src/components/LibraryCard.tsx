import React from 'react';
import { Library } from '../types';
import { Star, MapPin, BookOpen, Clock, Heart, Navigation, QrCode, Sparkles } from 'lucide-react';

interface LibraryCardProps {
  library: Library;
  onSelect: (library: Library) => void;
  onBook: (library: Library) => void;
  onOpenDirections: (library: Library) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (library: Library) => void;
  index?: number;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({
  library,
  onSelect,
  onBook,
  onOpenDirections,
  isWishlisted,
  onToggleWishlist,
  index = 0
}) => {
  return (
    <div
      id={`library-card-${library.id}`}
      className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Header Image */}
      <div
        onClick={() => onSelect(library)}
        className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer group/img"
      >
        <img
          src={library.images[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80'}
          alt={library.title}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 opacity-95 group-hover/img:opacity-100"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl">
            Click to View Seats & Details
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5 z-10">
          <span className="bg-slate-950/90 text-white font-black text-[11px] px-3 py-1 rounded-xl backdrop-blur-md shadow-md border border-white/10 flex items-center space-x-1">
            <QrCode className="h-3 w-3 text-indigo-400" />
            <span>Smart QR Pass Entry</span>
          </span>
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(library);
            }}
            className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md z-10 cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-slate-950/70 text-white hover:bg-slate-950'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3.5 left-3.5 bg-slate-950/90 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 backdrop-blur-md border border-white/10 shadow-md">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>{library.rating}</span>
          <span className="text-slate-400 font-semibold">({library.reviewsCount})</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Passes Breakdown */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                ₹{library.dailyPassPrice}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400"> / day pass</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Monthly</span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-200">₹{library.monthlyPassPrice} / mo</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(library)}
            className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 cursor-pointer transition-colors mt-2.5"
          >
            {library.title}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-zinc-400 text-xs font-semibold mt-1.5">
            <MapPin className="h-4 w-4 text-slate-800 dark:text-zinc-300 shrink-0" />
            <span className="truncate">{library.location}, {library.city}</span>
          </div>

          {/* Seat Availability Badge */}
          <div className="mt-3 bg-indigo-50/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 rounded-2xl p-2.5 text-xs text-indigo-950 dark:text-indigo-300 flex items-center justify-between font-bold">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              <span>{library.availableSeats} Seats Available Now</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">({library.totalSeats} Total)</span>
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {library.amenities.slice(0, 4).map((am, i) => (
              <span key={i} className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                {am}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center space-x-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={() => onOpenDirections(library)}
            className="p-2.5 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 cursor-pointer"
            title="View Directions & Distance"
          >
            <Navigation className="h-4 w-4 text-slate-800 dark:text-zinc-300" />
          </button>

          <button
            onClick={() => onSelect(library)}
            className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-200 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            View Details
          </button>

          <button
            onClick={() => onBook(library)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
          >
            Get QR Pass
          </button>
        </div>
      </div>
    </div>
  );
};
