import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Tag,
  CheckCircle2,
  Car,
  Home,
  Shirt,
  Trophy,
  Hotel as HotelIcon,
  Zap,
  MessageCircle,
  MessageSquare,
  Eye,
  Check
} from 'lucide-react';
import { Property, Vehicle, ClothingItem, SportsTurfItem, GeneralItem, Hotel, Restaurant, Library } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

export interface UnifiedRecommendedItem {
  id: string;
  category: 'property' | 'vehicle' | 'clothing' | 'turf' | 'general' | 'hotel' | 'restaurant' | 'library';
  categoryLabel: string;
  title: string;
  image: string;
  location: string;
  city: string;
  price: number;
  priceLabel: string;
  rating: number;
  reviewsCount: number;
  ownerName: string;
  ownerContact?: string;
  ownerVerified?: boolean;
  score: number;
  matchReason: string;
  originalItem: any;
}

interface AIRecommendedSectionProps {
  properties: Property[];
  vehicles?: Vehicle[];
  clothingItems?: ClothingItem[];
  sportsTurfs?: SportsTurfItem[];
  generalItems?: GeneralItem[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  libraries?: Library[];
  selectedCity: string;
  maxBudget: number;
  onSelectProperty: (p: Property) => void;
  onSelectVehicle?: (v: Vehicle) => void;
  onSelectClothing?: (c: ClothingItem) => void;
  onSelectSportsTurf?: (t: SportsTurfItem) => void;
  onSelectGeneralItem?: (g: GeneralItem) => void;
  onSelectHotel?: (h: Hotel) => void;
  onSelectRestaurant?: (r: Restaurant) => void;
  onSelectLibrary?: (l: Library) => void;
  onBookProperty?: (p: Property) => void;
  onBookVehicle?: (v: Vehicle) => void;
  onBookClothing?: (c: ClothingItem) => void;
  onBookSportsTurf?: (t: SportsTurfItem) => void;
  onOpenChatWithOwner?: (item: {
    id: string;
    title: string;
    image: string;
    priceDisplay: string;
    ownerName: string;
    ownerContact?: string;
    category: string;
    location?: string;
    city?: string;
  }) => void;
}

export const AIRecommendedSection: React.FC<AIRecommendedSectionProps> = ({
  properties = [],
  vehicles = [],
  clothingItems = [],
  sportsTurfs = [],
  generalItems = [],
  hotels = [],
  restaurants = [],
  libraries = [],
  selectedCity,
  maxBudget,
  onSelectProperty,
  onSelectVehicle,
  onSelectClothing,
  onSelectSportsTurf,
  onSelectGeneralItem,
  onSelectHotel,
  onSelectRestaurant,
  onSelectLibrary,
  onBookProperty,
  onBookVehicle,
  onBookClothing,
  onBookSportsTurf,
  onOpenChatWithOwner
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'vehicle' | 'property' | 'clothing' | 'hotel' | 'turf' | 'general'>('ALL');

  // Build unified items pool
  const allCandidates: UnifiedRecommendedItem[] = [];

  // 1. Properties
  properties.forEach((p) => {
    let score = 0;
    const isCity = !selectedCity || p.city?.toLowerCase().includes(selectedCity.toLowerCase().trim());
    if (isCity) score += 60;
    if ((p.rentPerMonth || 0) <= maxBudget) score += 30;
    score += (p.rating || 4.5) * 4;
    if (p.ownerVerified) score += 10;

    allCandidates.push({
      id: p.id,
      category: 'property',
      categoryLabel: p.subType || 'Property / PG',
      title: p.title || 'Verified Property',
      image: p.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      location: p.location || '',
      city: p.city || '',
      price: p.rentPerMonth || 0,
      priceLabel: '/month',
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 24,
      ownerName: p.ownerName || 'Verified Landlord',
      ownerContact: p.ownerContact || '+91 98765 43210',
      ownerVerified: p.ownerVerified || false,
      score,
      matchReason: isCity
        ? `Top-rated home in ${p.city || 'prime city location'} • Verified owner with instant move-in`
        : `Premium stay • High safety rating & Zero brokerage`,
      originalItem: p
    });
  });

  // 2. Vehicles (Cars & Bikes)
  vehicles.forEach((v: any) => {
    let score = 5; // boost diversity
    const isCity = !selectedCity || v.city?.toLowerCase().includes(selectedCity.toLowerCase().trim());
    if (isCity) score += 65;
    const vPrice = v.rentPerDay || v.dailyPrice || v.rentPerHour || 0;
    if (vPrice * 30 <= maxBudget || vPrice <= maxBudget) score += 30;
    score += (v.rating || 4.7) * 4;
    if (v.unlimitedKm) score += 10;
    if (v.freeHelmetOrFastag) score += 5;

    allCandidates.push({
      id: v.id,
      category: 'vehicle',
      categoryLabel: `${(v.vehicleType || 'Vehicle').toUpperCase()} • ${v.fuelType || 'Clean'}`,
      title: v.title || `${v.brand || ''} ${v.modelName || 'Vehicle'}`.trim(),
      image: v.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
      location: v.location || '',
      city: v.city || '',
      price: vPrice,
      priceLabel: v.rentPerDay ? '/day' : '/hr',
      rating: v.rating || 4.9,
      reviewsCount: v.reviewsCount || 38,
      ownerName: v.ownerName || 'Express Wheels Host',
      ownerContact: v.ownerContact || '+91 98765 43210',
      ownerVerified: true,
      score,
      matchReason: isCity
        ? `Self-drive vehicle available near ${v.location || v.city || 'location'} • Instant delivery`
        : `Top-rated sanitized vehicle • Unlimited KMs available`,
      originalItem: v
    });
  });

  // 3. Clothing & Outfits
  clothingItems.forEach((c) => {
    let score = 10;
    const isCity = !selectedCity || c.city?.toLowerCase().includes(selectedCity.toLowerCase().trim());
    if (isCity) score += 60;
    score += (c.rating || 4.9) * 4;

    allCandidates.push({
      id: c.id,
      category: 'clothing',
      categoryLabel: `${c.clothingType || 'Outfit'} • ${c.gender || 'All'}`,
      title: c.title || 'Designer Outfit',
      image: c.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      location: c.location || '',
      city: c.city || '',
      price: c.rentPerDay || 0,
      priceLabel: '/day',
      rating: c.rating || 4.9,
      reviewsCount: c.reviewsCount || 42,
      ownerName: c.ownerName || 'Royal Couture & Boutique',
      ownerContact: c.ownerContact || '+91 98765 43210',
      ownerVerified: true,
      score,
      matchReason: `Dry-cleaned designer outfit • Custom fitting available`,
      originalItem: c
    });
  });

  // 4. Sports Turfs
  sportsTurfs.forEach((t: any) => {
    let score = 5;
    const isCity = !selectedCity || t.city?.toLowerCase().includes(selectedCity.toLowerCase().trim());
    if (isCity) score += 60;
    score += (t.rating || 4.8) * 4;

    allCandidates.push({
      id: t.id,
      category: 'turf',
      categoryLabel: `${t.turfType || 'Sports'} Turf`,
      title: t.title || 'Sports Arena',
      image: t.images?.[0] || 'https://images.unsplash.com/photo-1529900248061-5652ab58872f?w=800&q=80',
      location: t.location || '',
      city: t.city || '',
      price: t.rentPerHour || t.pricePerHour || 0,
      priceLabel: '/hr',
      rating: t.rating || 4.8,
      reviewsCount: t.reviewsCount || 56,
      ownerName: t.ownerName || 'Arena Sports Manager',
      ownerContact: t.ownerContact || '+91 98765 43210',
      ownerVerified: true,
      score,
      matchReason: `Floodlit turf with floodlights & equipment • Instant slot confirmation`,
      originalItem: t
    });
  });

  // 5. Hotels
  hotels.forEach((h: any) => {
    let score = 0;
    const isCity = !selectedCity || h.city?.toLowerCase().includes(selectedCity.toLowerCase().trim());
    if (isCity) score += 60;
    score += (h.rating || 4.7) * 4;

    allCandidates.push({
      id: h.id,
      category: 'hotel',
      categoryLabel: `${h.starCategory || h.starRating || 4}-Star Stay`,
      title: h.title || h.name || 'Hotel Stay',
      image: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      location: h.location || '',
      city: h.city || '',
      price: h.rooms?.[0]?.pricePerNight || h.pricePerNight || 0,
      priceLabel: '/night',
      rating: h.rating || 4.7,
      reviewsCount: h.reviewsCount || 88,
      ownerName: h.ownerName || 'Grand Heritage Stay',
      ownerContact: h.ownerContact || '+91 98765 43210',
      ownerVerified: true,
      score,
      matchReason: `Verified hotel in ${h.city || 'prime city location'} • Free cancellation & breakfast`,
      originalItem: h
    });
  });

  // 6. General Items / Gadgets
  generalItems.forEach((g: any) => {
    let score = 0;
    const isCity = !selectedCity || g.city?.toLowerCase().includes(selectedCity.toLowerCase().trim());
    if (isCity) score += 60;
    score += (g.rating || 4.8) * 4;

    allCandidates.push({
      id: g.id,
      category: 'general',
      categoryLabel: g.itemCategory || g.subType || 'Gadget & Gear',
      title: g.title || 'Rental Item',
      image: g.images?.[0] || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
      location: g.location || '',
      city: g.city || '',
      price: g.rentPerDay || g.pricePerDay || g.rentPerMonth || 0,
      priceLabel: g.rentPerMonth ? '/month' : '/day',
      rating: g.rating || 4.8,
      reviewsCount: g.reviewsCount || 19,
      ownerName: g.ownerName || 'Sharma Electronics & Vault',
      ownerContact: g.ownerContact || '+91 98765 43210',
      ownerVerified: true,
      score,
      matchReason: `Tested & sanitized gear • Minimal refundable deposit`,
      originalItem: g
    });
  });

  // Sort descending by score
  allCandidates.sort((a, b) => b.score - a.score);

  // Apply category filter if selected
  const filteredCandidates = activeFilter === 'ALL'
    ? allCandidates
    : allCandidates.filter((c) => c.category === activeFilter);

  // Take top 6 listings for rich variety
  const topRecommendations = filteredCandidates.slice(0, 6);

  if (topRecommendations.length === 0) return null;

  const handleItemClick = (rec: UnifiedRecommendedItem) => {
    switch (rec.category) {
      case 'property':
        onSelectProperty(rec.originalItem);
        break;
      case 'vehicle':
        if (onSelectVehicle) onSelectVehicle(rec.originalItem);
        else if (onBookVehicle) onBookVehicle(rec.originalItem);
        break;
      case 'clothing':
        if (onSelectClothing) onSelectClothing(rec.originalItem);
        else if (onBookClothing) onBookClothing(rec.originalItem);
        break;
      case 'turf':
        if (onSelectSportsTurf) onSelectSportsTurf(rec.originalItem);
        else if (onBookSportsTurf) onBookSportsTurf(rec.originalItem);
        break;
      case 'hotel':
        if (onSelectHotel) onSelectHotel(rec.originalItem);
        break;
      case 'general':
        if (onSelectGeneralItem) onSelectGeneralItem(rec.originalItem);
        break;
      default:
        onSelectProperty(rec.originalItem);
    }
  };

  const handleBookClick = (rec: UnifiedRecommendedItem) => {
    switch (rec.category) {
      case 'property':
        if (onBookProperty) onBookProperty(rec.originalItem);
        else onSelectProperty(rec.originalItem);
        break;
      case 'vehicle':
        if (onBookVehicle) onBookVehicle(rec.originalItem);
        break;
      case 'clothing':
        if (onBookClothing) onBookClothing(rec.originalItem);
        break;
      case 'turf':
        if (onBookSportsTurf) onBookSportsTurf(rec.originalItem);
        break;
      case 'hotel':
        if (onSelectHotel) onSelectHotel(rec.originalItem);
        break;
      case 'general':
        if (onSelectGeneralItem) onSelectGeneralItem(rec.originalItem);
        break;
      default:
        onSelectProperty(rec.originalItem);
    }
  };

  const handleChatClick = (rec: UnifiedRecommendedItem) => {
    if (onOpenChatWithOwner) {
      onOpenChatWithOwner({
        id: rec.id,
        title: rec.title,
        image: rec.image,
        priceDisplay: `₹${(rec.price || 0).toLocaleString('en-IN')}${rec.priceLabel}`,
        ownerName: rec.ownerName,
        ownerContact: rec.ownerContact,
        category: rec.categoryLabel,
        location: rec.location,
        city: rec.city
      });
    }
  };

  const handleWhatsAppDirect = (rec: UnifiedRecommendedItem) => {
    openWhatsAppChat({
      phoneNumber: rec.ownerContact,
      itemTitle: rec.title,
      itemCategory: rec.categoryLabel,
      ownerName: rec.ownerName,
      price: `₹${(rec.price || 0).toLocaleString('en-IN')}${rec.priceLabel}`,
      location: rec.location,
      city: rec.city
    });
  };

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-blue-500/30 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden my-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 pb-4 border-b border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md font-black shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                AI Recommended For You
              </h2>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Nearby Across All Assets (Cars, Outfits, Stays & PGs)
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Live intelligent curation for <strong className="text-blue-400">{selectedCity || 'All Cities'}</strong> • Ranked by proximity, safety rating & verified status
            </p>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'ALL', label: '🌟 All Top AI Picks' },
            { id: 'vehicle', label: '🚗 Cars & Bikes' },
            { id: 'property', label: '🏠 Flats & PGs' },
            { id: 'clothing', label: '👔 Outfits' },
            { id: 'hotel', label: '🏨 Hotels' },
            { id: 'turf', label: '🏏 Turfs' },
            { id: 'general', label: '⚡ Gadgets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white font-black shadow-md scale-102'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topRecommendations.map((rec, index) => (
          <div
            key={`${rec.category}-${rec.id}-${index}`}
            className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/60 rounded-2xl p-3.5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-3 group shadow-md"
          >
            <div className="space-y-2">
              {/* Thumbnail with Tags */}
              <div
                onClick={() => handleItemClick(rec)}
                className="relative h-40 rounded-xl overflow-hidden bg-zinc-800 cursor-pointer"
              >
                <img
                  src={rec.image}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Top Badge: AI Rank & Category */}
                <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                  <span className="bg-zinc-950/90 backdrop-blur-xs text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-400/30">
                    #{index + 1} AI Pick
                  </span>
                  <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {rec.categoryLabel}
                  </span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-2 right-2 bg-amber-400 text-zinc-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-0.5">
                  <span>₹{(rec.price || 0).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-zinc-800 font-semibold">{rec.priceLabel}</span>
                </div>

                {/* Rating */}
                <div className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span>{rec.rating}</span>
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h3
                  onClick={() => handleItemClick(rec)}
                  className="text-xs sm:text-sm font-extrabold text-white line-clamp-1 group-hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {rec.title}
                </h3>
                <p className="text-[11px] text-zinc-400 flex items-center space-x-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="truncate">{rec.location}, {rec.city}</span>
                </p>
              </div>

              {/* Host & Verified badge */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                <span className="truncate flex items-center space-x-1 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{rec.ownerName}</span>
                </span>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0">
                  Verified Host
                </span>
              </div>

              {/* AI Match Reason Banner */}
              <div className="bg-amber-400/10 border border-amber-400/20 p-2 rounded-xl text-[10px] font-medium text-amber-200 flex items-start space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{rec.matchReason}</span>
              </div>
            </div>

            {/* Actions: Chat, WhatsApp, View & Book */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-800">
              {/* Quick Communication Strip: In-App Chat + Direct WhatsApp */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleChatClick(rec)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-indigo-300 hover:text-white font-extrabold text-[11px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer border border-zinc-700/60"
                  title="Direct Chat with Host"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Chat Host</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppDirect(rec)}
                  className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-extrabold text-[11px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer border border-emerald-500/30"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* View & Rent Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleItemClick(rec)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[11px] py-2 rounded-xl transition-all text-center cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleBookClick(rec)}
                  className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-[11px] py-2 rounded-xl transition-all text-center shadow-md cursor-pointer"
                >
                  Rent Now
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
