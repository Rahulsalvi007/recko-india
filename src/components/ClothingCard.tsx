import React from 'react';
import { Shirt, MapPin, Sparkles, ShieldCheck, Heart, ArrowRight, MessageCircle } from 'lucide-react';
import { ClothingItem } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface ClothingCardProps {
  clothing: ClothingItem;
  index: number;
  onSelect: (c: ClothingItem) => void;
  onBook: (c: ClothingItem) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  clothing,
  index,
  onSelect = (_c: ClothingItem) => {},
  onBook,
  isSaved = false,
  onToggleSave
}) => {
  if (!clothing) return null;

  const imageUrl = clothing.images?.[0] || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80';

  return (
    <div
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div>
        {/* Image & Badges */}
        <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-zinc-800">
          <img
            src={imageUrl}
            alt={clothing.title || 'Wedding Attire'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* Gender & Size Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-slate-950/90 backdrop-blur-xs text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border border-amber-500/30">
              {clothing.gender}
            </span>
            <span className="bg-indigo-600/90 text-white text-[10px] font-black uppercase px-2 py-1 rounded-xl">
              Size: {clothing.size}
            </span>
          </div>

          {/* Heart Save Button */}
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(clothing.id);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-900/60 text-slate-200 hover:text-white'
              }`}
            >
              <Heart className="h-4 w-4 fill-current" />
            </button>
          )}

          {/* Dry Clean Badge & Price */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            {clothing.dryCleaned && (
              <span className="bg-emerald-500/90 backdrop-blur-xs text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Sanitized & Dry Cleaned</span>
              </span>
            )}
            <div className="ml-auto bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-xl">
              <span className="text-amber-400 font-extrabold text-sm">₹{clothing.rentPerDay}</span>
              <span className="text-[10px] text-slate-300 font-medium">/day</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <div className="text-[11px] font-black text-amber-600 uppercase tracking-wider">
              {clothing.clothingType}
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
              {clothing.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center space-x-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>{clothing.location}, {clothing.city}</span>
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {clothing.description}
          </p>

          <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
            <span>Refundable Deposit:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">₹{clothing.deposit}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5 pt-0 space-y-2">
        <button
          type="button"
          onClick={() => {
            openWhatsAppChat({
              phoneNumber: '+91 98765 43210',
              itemTitle: clothing.title,
              itemCategory: clothing.clothingType,
              ownerName: 'Royal Boutique Host',
              price: `₹${clothing.rentPerDay}/day`,
              location: clothing.location,
              city: clothing.city
            });
          }}
          className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs py-2 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span>Direct WhatsApp Fitting & Inquiry</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(clothing)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold text-xs py-2.5 rounded-2xl transition-all text-center cursor-pointer"
          >
            View Fits
          </button>
          <button
            onClick={() => onBook(clothing)}
            className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs py-2.5 rounded-2xl transition-all text-center shadow-md cursor-pointer flex items-center justify-center space-x-1"
          >
            <span>Rent Outfit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
