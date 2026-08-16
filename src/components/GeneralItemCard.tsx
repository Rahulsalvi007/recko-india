import React from 'react';
import { GeneralItem } from '../types';
import { Star, MapPin, ShieldCheck, Heart, Sparkles, PackageCheck, Wrench, Tag } from 'lucide-react';

interface GeneralItemCardProps {
  item: GeneralItem;
  onSelect: (item: GeneralItem) => void;
  onQuickBook?: (item: GeneralItem) => void;
  onBook?: (item: GeneralItem) => void;
  isWishlisted?: boolean;
  isSaved?: boolean;
  onToggleWishlist?: (item: GeneralItem) => void;
  onToggleSave?: (id: string) => void;
  index?: number;
}

export const GeneralItemCard: React.FC<GeneralItemCardProps> = ({
  item,
  onSelect,
  onQuickBook,
  onBook,
  isWishlisted,
  isSaved,
  onToggleWishlist,
  onToggleSave,
  index = 0,
}) => {
  const handleBook = () => {
    if (onBook) onBook(item);
    else if (onQuickBook) onQuickBook(item);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(item);
    else if (onToggleSave) onToggleSave(item.id);
  };

  const saved = isSaved || isWishlisted;
  return (
    <div
      id={`general-item-card-${item.id}`}
      className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Header Image */}
      <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-zinc-800 cursor-pointer" onClick={() => onSelect(item)}>
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1">
            <Tag className="h-3 w-3" />
            <span>{item.subType}</span>
          </span>

          <button
            onClick={handleToggleSave}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              saved
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Banner */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-1">
              <PackageCheck className="h-3 w-3" />
              <span>{item.condition || 'Verified'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-black text-amber-300">
            <Star className="h-3.5 w-3.5 fill-amber-300" />
            <span>{item.rating}</span>
            <span className="text-[10px] text-zinc-300 font-medium">({item.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <div className="flex items-center space-x-1 font-semibold truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{item.location}, {item.city}</span>
            </div>
            {item.ownerVerified && (
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified Owner</span>
              </span>
            )}
          </div>

          <h3
            onClick={() => onSelect(item)}
            className="font-black text-slate-900 dark:text-white text-base hover:text-amber-500 transition-colors line-clamp-2 cursor-pointer"
          >
            {item.title}
          </h3>

          {/* Key Specs Pills */}
          {item.specs && item.specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.specs.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-zinc-700/60"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Booking Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">₹{item.rentPerDay}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">/day</span>
            </div>
            {item.rentPerMonth && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Or ₹{(item.rentPerMonth || 0).toLocaleString('en-IN')}/month
              </p>
            )}
          </div>

          <button
            onClick={handleBook}
            className="bg-zinc-950 hover:bg-black text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-zinc-950 font-black text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-1.5"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Rent Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
