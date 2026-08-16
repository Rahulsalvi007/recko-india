import React from 'react';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ShieldCheck,
  Star,
  CheckCircle,
  GraduationCap,
  Heart,
  Eye,
  Calendar
} from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onSelect: (p: Property) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onQuickBook: (p: Property) => void;
  index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isSaved,
  onToggleSave,
  onQuickBook,
  index = 0
}) => {
  return (
    <div
      id={`property-card-${property.id}`}
      className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      {/* Image Banner */}
      <div
        onClick={() => onSelect(property)}
        className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer group/img"
      >
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 opacity-95 group-hover/img:opacity-100"
          loading="lazy"
        />

        {/* Hover Click overlay hint */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/90 text-slate-900 font-extrabold text-xs px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl flex items-center space-x-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-transform">
            <Eye className="h-4 w-4 text-zinc-900" />
            <span>Click to View Details</span>
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(property.id);
          }}
          className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-xl transition-all shadow-lg ${
            isSaved
              ? 'bg-rose-500 text-white'
              : 'bg-slate-900/60 text-white hover:bg-white hover:text-rose-500'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Property'}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Subtype & Category Tag */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          <span className="bg-slate-950/90 text-white font-extrabold text-[11px] px-3 py-1 rounded-xl backdrop-blur-md shadow-md border border-white/10">
            {property.subType}
          </span>
          {property.furnishing && (
            <span className="bg-emerald-600/90 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md">
              {property.furnishing}
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3.5 left-3.5 bg-slate-950/90 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 backdrop-blur-md border border-white/10 shadow-lg">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>{property.rating}</span>
          <span className="text-slate-400 font-semibold">({property.reviewsCount})</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Rent & Deposit */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                ₹{(property.rentPerMonth || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400"> / month</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Deposit</span>
              <span className="text-xs font-black text-slate-900 dark:text-zinc-200">₹{(property.deposit || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 hover:text-slate-700 dark:hover:text-amber-300 line-clamp-1 cursor-pointer transition-colors mt-2.5"
          >
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-zinc-400 text-xs font-semibold mt-1.5">
            <MapPin className="h-4 w-4 text-slate-800 dark:text-zinc-300 shrink-0" />
            <span className="truncate">{property.location}, {property.city}</span>
          </div>

          {/* Student Specific Distance Tag */}
          {property.nearbyCollege && (
            <div className="mt-3 bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 rounded-2xl p-2.5 text-xs text-indigo-950 dark:text-indigo-300 flex items-center space-x-2 font-bold shadow-xs">
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">
                {property.distanceToCollegeKm} km from {property.nearbyCollege}
              </span>
            </div>
          )}

          {/* Specs Bar (Beds, Baths, SqFt) */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-zinc-800 my-3 text-xs text-slate-700 dark:text-zinc-300 font-bold">
            {property.bedrooms ? (
              <div className="flex items-center space-x-1.5">
                <BedDouble className="h-4 w-4 text-slate-800 dark:text-zinc-400" />
                <span>{property.bedrooms} Bed</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Maximize2 className="h-4 w-4 text-slate-800 dark:text-zinc-400" />
                <span>Commercial</span>
              </div>
            )}

            {property.bathrooms ? (
              <div className="flex items-center space-x-1.5">
                <Bath className="h-4 w-4 text-slate-800 dark:text-zinc-400" />
                <span>{property.bathrooms} Bath</span>
              </div>
            ) : null}

            <div className="flex items-center space-x-1.5">
              <Maximize2 className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <span>{property.areaSqFt} Sq.Ft</span>
            </div>
          </div>

          {/* Amenities Chips (up to 3) */}
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-extrabold self-center ml-1">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
          
          {/* Owner verification */}
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-800 dark:text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[110px]">
              {property.ownerName}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelect(property)}
              className="p-2.5 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              title="View Full Details"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={() => onQuickBook(property)}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              Rent Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
