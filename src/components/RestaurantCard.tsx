import React from 'react';
import { Restaurant } from '../types';
import { Star, MapPin, Utensils, Clock, Users, Heart, Navigation, Sparkles } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
  onReserve: (restaurant: Restaurant) => void;
  onOpenDirections: (restaurant: Restaurant) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (restaurant: Restaurant) => void;
  index?: number;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onSelect,
  onReserve,
  onOpenDirections,
  isWishlisted,
  onToggleWishlist,
  index = 0
}) => {
  return (
    <div
      id={`restaurant-card-${restaurant.id}`}
      className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Image Header */}
      <div
        onClick={() => onSelect(restaurant)}
        className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer group/img"
      >
        <img
          src={restaurant.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}
          alt={restaurant.title}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 opacity-95 group-hover/img:opacity-100"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl">
            Click to View Menu & Details
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5 z-10">
          <span className="bg-slate-950/90 text-white font-black text-[11px] px-3 py-1 rounded-xl backdrop-blur-md shadow-md border border-white/10 flex items-center space-x-1">
            <Utensils className="h-3 w-3 text-indigo-400" />
            <span>FSSAI Approved</span>
          </span>
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(restaurant);
            }}
            className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md z-10 cursor-pointer ${isWishlisted
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
          <span>{restaurant.rating}</span>
          <span className="text-slate-400 font-semibold">({restaurant.reviewsCount})</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Average Cost & Hours */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                ₹{restaurant.averageCostForTwo.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400"> for two</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Timings</span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-200">{restaurant.openingHours}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(restaurant)}
            className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 cursor-pointer transition-colors mt-2.5"
          >
            {restaurant.title}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-zinc-400 text-xs font-semibold mt-1.5">
            <MapPin className="h-4 w-4 text-slate-800 dark:text-zinc-300 shrink-0" />
            <span className="truncate">{restaurant.location}, {restaurant.city}</span>
          </div>

          {/* Cuisines */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {restaurant.cuisine.map((c, i) => (
              <span key={i} className="bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-300 text-[11px] font-black px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center space-x-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={() => onOpenDirections(restaurant)}
            className="p-2.5 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700 cursor-pointer"
            title="View Directions & Distance"
          >
            <Navigation className="h-4 w-4 text-slate-800 dark:text-zinc-300" />
          </button>

          <button
            onClick={() => onSelect(restaurant)}
            className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-200 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            View Menu
          </button>

          <button
            onClick={() => onReserve(restaurant)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
          >
            Reserve Table
          </button>
        </div>
      </div>
    </div>
  );
};
