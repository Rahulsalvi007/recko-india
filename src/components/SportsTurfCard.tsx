import React from 'react';
import { Trophy, MapPin, Sparkles, Zap, ShieldCheck, Heart, ArrowRight, MessageCircle } from 'lucide-react';
import { SportsTurfItem } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface SportsTurfCardProps {
  turf: SportsTurfItem;
  index: number;
  onSelect: (t: SportsTurfItem) => void;
  onBook: (t: SportsTurfItem) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const SportsTurfCard: React.FC<SportsTurfCardProps> = ({
  turf,
  index,
  onSelect = (_t: SportsTurfItem) => {},
  onBook,
  isSaved = false,
  onToggleSave
}) => {
  if (!turf) return null;

  const imageUrl = turf.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80';

  return (
    <div
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div>
        {/* Image & Badges */}
        <div className="relative h-60 overflow-hidden bg-slate-100 dark:bg-zinc-800">
          <img
            src={imageUrl}
            alt={turf.title || 'Sports Arena'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* Turf Type Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-md">
              {turf.turfType}
            </span>
            {turf.floodLights && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-1 rounded-xl flex items-center space-x-1">
                <Zap className="h-3 w-3 fill-current" />
                <span>24/7 Floodlights</span>
              </span>
            )}
          </div>

          {/* Heart Save Button */}
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(turf.id);
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

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-xl">
            <span className="text-emerald-400 font-extrabold text-sm">₹{turf.rentPerHour}</span>
            <span className="text-[10px] text-slate-300 font-medium">/hour</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
              {turf.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center space-x-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{turf.location}, {turf.city}</span>
            </p>
          </div>

          {/* Amenities Chips */}
          <div className="flex flex-wrap gap-1">
            {turf.amenities.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-lg"
              >
                ✓ {a}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {turf.description}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-5 pt-0 space-y-2">
        <button
          type="button"
          onClick={() => {
            openWhatsAppChat({
              phoneNumber: '+91 98765 43210',
              itemTitle: turf.title,
              itemCategory: turf.turfType,
              ownerName: 'Arena Manager',
              price: `₹${turf.rentPerHour}/hour`,
              location: turf.location,
              city: turf.city
            });
          }}
          className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs py-2 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span>Direct WhatsApp Turf Booking</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(turf)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold text-xs py-2.5 rounded-2xl transition-all text-center cursor-pointer"
          >
            View Arena
          </button>
          <button
            onClick={() => onBook(turf)}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs py-2.5 rounded-2xl transition-all text-center shadow-md cursor-pointer flex items-center justify-center space-x-1"
          >
            <span>Book Turf Slot</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
