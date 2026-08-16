import React from 'react';
import { Hotel } from '../types';
import { Star, MapPin, Wifi, Clock, Users, Coffee, Bed, Sparkles, Navigation, Heart } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
  onBook: (hotel: Hotel) => void;
  onOpenDirections: (hotel: Hotel) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (hotel: Hotel) => void;
  index?: number;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onSelect,
  onBook,
  onOpenDirections,
  isWishlisted,
  onToggleWishlist,
  index = 0
}) => {
  const minPrice = hotel.rooms && hotel.rooms.length > 0
    ? Math.min(...hotel.rooms.map((r) => r.pricePerNight))
    : 2500;

  return (
    <div
      id={`hotel-card-${hotel.id}`}
      className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Hotel Image & Overlay Badges */}
      <div
        onClick={() => onSelect(hotel)}
        className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer group/img"
      >
        <img
          src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
          alt={hotel.title}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 opacity-95 group-hover/img:opacity-100"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl">
            Click to View Rooms & Details
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5 z-10">
          <span className="bg-slate-950/90 text-white font-black text-[11px] px-3 py-1 rounded-xl backdrop-blur-md shadow-md border border-white/10 flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Verified Hotel</span>
          </span>
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(hotel);
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
          <span>{hotel.rating}</span>
          <span className="text-slate-400 font-semibold">({hotel.reviewsCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Price & Timing */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                ₹{minPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400"> / night</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Check-In</span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-200">{hotel.checkInTime}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(hotel)}
            className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 cursor-pointer transition-colors mt-2.5"
          >
            {hotel.title}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-zinc-400 text-xs font-semibold mt-1.5">
            <MapPin className="h-4 w-4 text-slate-800 dark:text-zinc-300 shrink-0" />
            <span className="truncate">{hotel.location}, {hotel.city}</span>
          </div>

          {/* Landmark */}
          {hotel.nearbyLandmark && (
            <div className="mt-3 bg-indigo-50/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 rounded-2xl p-2.5 text-xs text-indigo-950 dark:text-indigo-300 flex items-center space-x-2 font-bold">
              <Navigation className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">{hotel.nearbyLandmark}</span>
            </div>
          )}

          {/* Features Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hotel.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center space-x-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={() => onOpenDirections(hotel)}
            className="p-2.5 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 cursor-pointer"
            title="View Map & Distance Matrix"
          >
            <Navigation className="h-4 w-4 text-slate-800 dark:text-zinc-300" />
          </button>

          <button
            onClick={() => onSelect(hotel)}
            className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-200 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            View Rooms
          </button>

          <button
            onClick={() => onBook(hotel)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
          >
            Book Room
          </button>
        </div>
      </div>
    </div>
  );
};
