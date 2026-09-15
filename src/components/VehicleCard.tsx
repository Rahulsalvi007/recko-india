import React from 'react';
import {
  Car,
  Fuel,
  Gauge,
  Navigation,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  Clock,
  Radio,
  UserCheck,
  MessageCircle,
  MessageSquare,
  Phone
} from 'lucide-react';
import { Vehicle } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';
import { makePhoneCall } from '../utils/phoneCall';

interface VehicleCardProps {
  vehicle: Vehicle;
  onBook: (v: Vehicle) => void;
  onTrackGPS: (v: Vehicle) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  index?: number;
  isOwner?: boolean;
  onOpenChat?: (item: any) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onBook,
  onTrackGPS,
  isSaved,
  onToggleSave,
  index = 0,
  isOwner = false,
  onOpenChat
}) => {
  return (
    <div
      id={`vehicle-card-${vehicle.id}`}
      className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Vehicle Image */}
      <div
        onClick={() => onBook(vehicle)}
        className="relative h-52 w-full overflow-hidden bg-slate-900 cursor-pointer group/img"
      >
        <img
          src={vehicle.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={vehicle.title}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 opacity-95 group-hover/img:opacity-100"
          loading="lazy"
        />

        {/* Click Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl flex items-center space-x-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-transform">
            <span>Click to Rent Vehicle</span>
          </span>
        </div>

        {/* Vehicle Subtype Tag */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
          <span className="bg-slate-950/90 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl backdrop-blur-md shadow-md border border-white/10">
            {vehicle.vehicleType}
          </span>
          <span className="bg-indigo-50 text-indigo-950 font-black text-[11px] px-2.5 py-1 rounded-xl shadow-md border border-indigo-200">
            {vehicle.fuelType}
          </span>
        </div>

        {/* GPS Live Tracking Tag (Visible ONLY to Vehicle Owner) */}
        {vehicle.isGPSAvailable && isOwner && (
          <button
            onClick={() => onTrackGPS(vehicle)}
            className="absolute top-3.5 right-3.5 bg-slate-950 hover:bg-black text-indigo-300 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-lg border border-slate-700 animate-pulse cursor-pointer"
            title="Open Live Telemetry & GPS Monitor (Owner Only)"
          >
            <Radio className="h-3.5 w-3.5 text-indigo-400" />
            <span>LIVE GPS</span>
          </button>
        )}

        {/* Rating */}
        <div className="absolute bottom-3.5 left-3.5 bg-slate-950/90 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 backdrop-blur-md border border-white/10 shadow-md">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>{vehicle.rating}</span>
          <span className="text-slate-400 font-semibold">({vehicle.reviewsCount})</span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rate Breakdown */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                ₹{(vehicle.rentPerDay || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400"> / day</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Hourly Rate</span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-200">₹{vehicle.rentPerHour} / hr</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 line-clamp-1 mt-2.5">
            {vehicle.title}
          </h3>

          {/* Pickup Location */}
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-zinc-400 text-xs font-semibold mt-1.5">
            <MapPin className="h-4 w-4 text-slate-800 dark:text-zinc-300 shrink-0" />
            <span className="truncate">{vehicle.location}, {vehicle.city}</span>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-zinc-800 my-3 text-xs text-slate-700 dark:text-zinc-300 font-bold">
            {vehicle.transmission && (
              <div className="flex items-center space-x-1.5">
                <Gauge className="h-4 w-4 text-slate-700 dark:text-zinc-400" />
                <span>{vehicle.transmission}</span>
              </div>
            )}
            {vehicle.seats ? (
              <div className="flex items-center space-x-1.5">
                <Users className="h-4 w-4 text-slate-700 dark:text-zinc-400" />
                <span>{vehicle.seats} Seater</span>
              </div>
            ) : null}
            <div className="flex items-center space-x-1.5">
              <Fuel className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <span>{vehicle.mileageKm}</span>
            </div>
          </div>

          {/* Driver Badge */}
          {vehicle.driverAvailable && (
            <div className="bg-indigo-50/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-zinc-700/80 rounded-2xl px-3 py-2 text-xs text-indigo-950 dark:text-indigo-300 flex items-center space-x-2 font-bold shadow-xs">
              <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                Optional Chauffeur/Driver (+₹{vehicle.driverChargePerDay || 0}/day)
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-zinc-800">
          {/* Quick Communication Bar */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (onOpenChat) {
                  onOpenChat({
                    id: vehicle.id,
                    title: vehicle.title,
                    image: vehicle.images[0],
                    priceDisplay: `₹${(vehicle.rentPerDay || 0).toLocaleString('en-IN')}/day`,
                    ownerName: vehicle.ownerName || 'Express Wheels Host',
                    ownerContact: vehicle.ownerContact || '+91 98765 43210',
                    category: vehicle.vehicleType,
                    location: vehicle.location,
                    city: vehicle.city
                  });
                }
              }}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] py-1.5 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
              title="Chat with Host"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openWhatsAppChat({
                  phoneNumber: vehicle.ownerContact || '+91 98765 43210',
                  itemTitle: vehicle.title,
                  itemCategory: vehicle.vehicleType,
                  ownerName: vehicle.ownerName || 'Vehicle Host',
                  price: `₹${(vehicle.rentPerDay || 0).toLocaleString('en-IN')}/day`,
                  location: vehicle.location,
                  city: vehicle.city
                });
              }}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] py-1.5 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => makePhoneCall(vehicle.ownerContact || '+91 98765 43210', vehicle.ownerName || 'Vehicle Host')}
              className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] py-1.5 px-1 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer border border-amber-200/60 dark:border-amber-800/60"
              title="Call Host"
            >
              <Phone className="h-3.5 w-3.5 text-amber-500" />
              <span>Call</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isOwner ? (
              <button
                onClick={() => onTrackGPS(vehicle)}
                className="flex-1 bg-slate-900 hover:bg-black text-amber-300 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all border border-slate-800 cursor-pointer shadow-xs"
              >
                <Navigation className="h-4 w-4 text-amber-400" />
                <span>Track GPS (Owner)</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleSave(vehicle.id)}
                className={`p-2.5 rounded-xl border font-bold transition-all text-xs cursor-pointer ${
                  isSaved
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-200'
                }`}
                title={isSaved ? 'Saved to Favorites' : 'Save Vehicle'}
              >
                {isSaved ? '❤️' : '🤍'}
              </button>
            )}

            <button
              onClick={() => onBook(vehicle)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <span>Book Vehicle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
