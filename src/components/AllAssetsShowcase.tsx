import React from 'react';
import {
  Home,
  Briefcase,
  GraduationCap,
  Car,
  Hotel as HotelIcon,
  UtensilsCrossed,
  BookOpen,
  Shirt,
  Trophy,
  PackageCheck,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Layers
} from 'lucide-react';
import {
  MainCategory,
  Property,
  Vehicle,
  Hotel,
  Restaurant,
  Library,
  ClothingItem,
  SportsTurfItem,
  GeneralItem,
  LandlordUser,
  WishlistItem
} from '../types';
import { PropertyCard } from './PropertyCard';
import { VehicleCard } from './VehicleCard';
import { HotelCard } from './HotelCard';
import { RestaurantCard } from './RestaurantCard';
import { LibraryCard } from './LibraryCard';
import { ClothingCard } from './ClothingCard';
import { SportsTurfCard } from './SportsTurfCard';
import { GeneralItemCard } from './GeneralItemCard';

interface AllAssetsShowcaseProps {
  residentialProperties: Property[];
  commercialProperties: Property[];
  studentProperties: Property[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  libraries: Library[];
  clothingItems: ClothingItem[];
  sportsTurfs: SportsTurfItem[];
  generalItems: GeneralItem[];
  onSelectCategory: (cat: MainCategory) => void;
  onSelectProperty: (p: Property) => void;
  onBookProperty: (p: Property) => void;
  onSelectVehicle: (v: Vehicle) => void;
  onBookVehicle: (v: Vehicle) => void;
  onSelectHotel: (h: Hotel) => void;
  onSelectRestaurant: (r: Restaurant) => void;
  onSelectLibrary: (l: Library) => void;
  onSelectClothing: (c: ClothingItem) => void;
  onBookClothing: (c: ClothingItem) => void;
  onSelectSportsTurf: (t: SportsTurfItem) => void;
  onBookSportsTurf: (t: SportsTurfItem) => void;
  onSelectGeneralItem: (g: GeneralItem) => void;
  onBookGeneralItem: (g: GeneralItem) => void;
  onOpenDirections: (item: any) => void;
  onOpenChat: (item: any) => void;
  savedIds: string[];
  wishlist: WishlistItem[];
  toggleSave: (id: string) => void;
  toggleWishlist: (item: any) => void;
  loggedInLandlord: LandlordUser | null;
  onTrackGPS?: (v: Vehicle) => void;
  onReserveRestaurant?: (r: Restaurant) => void;
}

export const AllAssetsShowcase: React.FC<AllAssetsShowcaseProps> = ({
  residentialProperties,
  commercialProperties,
  studentProperties,
  vehicles,
  hotels,
  restaurants,
  libraries,
  clothingItems,
  sportsTurfs,
  generalItems,
  onSelectCategory,
  onSelectProperty,
  onBookProperty,
  onSelectVehicle,
  onBookVehicle,
  onSelectHotel,
  onSelectRestaurant,
  onSelectLibrary,
  onSelectClothing,
  onBookClothing,
  onSelectSportsTurf,
  onBookSportsTurf,
  onSelectGeneralItem,
  onBookGeneralItem,
  onOpenDirections,
  onOpenChat,
  savedIds,
  wishlist,
  toggleSave,
  toggleWishlist,
  loggedInLandlord,
  onTrackGPS,
  onReserveRestaurant
}) => {
  const totalAssetsCount =
    residentialProperties.length +
    commercialProperties.length +
    studentProperties.length +
    vehicles.length +
    hotels.length +
    restaurants.length +
    libraries.length +
    clothingItems.length +
    sportsTurfs.length +
    generalItems.length;

  const categoryQuickNav = [
    { id: 'residential' as MainCategory, name: 'Flats & Villas', count: residentialProperties.length, icon: <Home className="h-4 w-4" /> },
    { id: 'commercial' as MainCategory, name: 'Commercial', count: commercialProperties.length, icon: <Briefcase className="h-4 w-4" /> },
    { id: 'student' as MainCategory, name: 'Student PGs', count: studentProperties.length, icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'vehicle' as MainCategory, name: 'Vehicles', count: vehicles.length, icon: <Car className="h-4 w-4" /> },
    { id: 'hotel' as MainCategory, name: 'Hotels & Stay', count: hotels.length, icon: <HotelIcon className="h-4 w-4" /> },
    { id: 'restaurant' as MainCategory, name: 'Dining Tables', count: restaurants.length, icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: 'library' as MainCategory, name: 'Study Cabins', count: libraries.length, icon: <BookOpen className="h-4 w-4" /> },
    { id: 'clothing' as MainCategory, name: 'Wedding Outfits', count: clothingItems.length, icon: <Shirt className="h-4 w-4" /> },
    { id: 'sports_turf' as MainCategory, name: 'Sports Turfs', count: sportsTurfs.length, icon: <Trophy className="h-4 w-4" /> },
    { id: 'general' as MainCategory, name: 'Appliances', count: generalItems.length, icon: <PackageCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Master Overview Banner (White, Black & Gold Theme) */}
      <div className="bg-gradient-to-r from-[#0d0d10] via-[#14120c] to-[#0d0d10] border border-amber-500/30 rounded-3xl p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                Sabhi Rental Assets Ek Sath
              </span>
              <span className="text-[11px] font-bold text-amber-300/80 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>100% Escrow Protected</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Recko Unified Rental Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl font-medium leading-relaxed">
              Explore all <strong>{totalAssetsCount} verified assets</strong> across 10 rental categories in India — from 1-4 BHK flats, luxury cars, hotel suites, dining tables to wedding lehengas and floodlit sports turfs.
            </p>
          </div>

          {/* Stat Badges */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-[#18181c] border border-zinc-800 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="block text-lg font-black text-amber-400 font-mono">10</span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Categories</span>
            </div>
            <div className="bg-[#18181c] border border-amber-500/30 p-3 rounded-2xl text-center min-w-[90px]">
              <span className="block text-lg font-black text-amber-400 font-mono">{totalAssetsCount}</span>
              <span className="text-[10px] text-zinc-300 font-bold uppercase">Live Assets</span>
            </div>
          </div>
        </div>

        {/* Quick Category Anchor Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categoryQuickNav.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#18181c] hover:bg-amber-400 hover:text-black text-zinc-200 border border-zinc-700/80 text-xs font-bold transition-all cursor-pointer whitespace-nowrap group shrink-0"
            >
              <span className="text-amber-400 group-hover:text-black transition-colors">{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="text-[10px] font-mono opacity-70 bg-black/30 group-hover:bg-black/10 px-1.5 py-0.2 rounded">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: RESIDENTIAL PROPERTIES (Flats, Villas, Independent Homes)
      ========================================================================= */}
      {residentialProperties.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Residential Homes & Luxury Flats</span>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {residentialProperties.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  1, 2, 3 & 4 BHK Apartments, Gated Villas & Independent Houses with 0% Brokerage
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('residential')}
              className="text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Residential ({residentialProperties.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {residentialProperties.slice(0, 3).map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={idx}
                onSelect={(p) => onSelectProperty(p)}
                isSaved={savedIds.includes(property.id)}
                onToggleSave={toggleSave}
                onQuickBook={(p) => onBookProperty(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 2: COMMERCIAL SPACES (Offices, Shops, Warehouses)
      ========================================================================= */}
      {commercialProperties.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Commercial Spaces & Offices</span>
                  <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {commercialProperties.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Furnished IT Offices, Retail Shops, Showrooms & Co-working Hubs
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('commercial')}
              className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Commercial ({commercialProperties.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {commercialProperties.slice(0, 3).map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={idx}
                onSelect={(p) => onSelectProperty(p)}
                isSaved={savedIds.includes(property.id)}
                onToggleSave={toggleSave}
                onQuickBook={(p) => onBookProperty(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 3: STUDENT PGS & HOSTELS
      ========================================================================= */}
      {studentProperties.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/30">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Student PGs & Co-Living Hostels</span>
                  <span className="text-xs font-mono font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {studentProperties.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Girls/Boys PGs with 3-Time Mess Food, High Speed WiFi & Study Desks near top Colleges
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('student')}
              className="text-xs font-black text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Student PGs ({studentProperties.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentProperties.slice(0, 3).map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={idx}
                onSelect={(p) => onSelectProperty(p)}
                isSaved={savedIds.includes(property.id)}
                onToggleSave={toggleSave}
                onQuickBook={(p) => onBookProperty(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 4: VEHICLES & CARS (Self Drive & Luxury)
      ========================================================================= */}
      {vehicles.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Self-Drive & Luxury Vehicles</span>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {vehicles.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  SUVs, Supercars, Sedans, EV Scooters & Royal Enfields with Instant GPS Dispatch
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('vehicle')}
              className="text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Vehicles ({vehicles.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 3).map((vehicle, idx) => {
              const isOwner = loggedInLandlord ? (loggedInLandlord.id === vehicle.ownerId || vehicle.ownerId === 'owner-verified') : false;
              return (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={idx}
                  isOwner={isOwner}
                  onBook={(v) => onBookVehicle(v)}
                  onTrackGPS={(v) => onTrackGPS?.(v)}
                  isSaved={savedIds.includes(vehicle.id)}
                  onToggleSave={toggleSave}
                  onOpenChat={(item) => onOpenChat(item)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 5: HOTELS & LUXURY SUITES
      ========================================================================= */}
      {hotels.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <HotelIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Verified Hotels & Heritage Resorts</span>
                  <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {hotels.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Instant room selection, free cancellation & verified amenities
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('hotel')}
              className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Hotels ({hotels.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.slice(0, 3).map((hotel, idx) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                index={idx}
                onSelect={(h) => onSelectHotel(h)}
                onBook={(h) => onSelectHotel(h)}
                onOpenDirections={(h) => onOpenDirections(h)}
                isWishlisted={wishlist.some((w) => w.id === hotel.id)}
                onToggleWishlist={(h) =>
                  toggleWishlist({
                    id: h.id,
                    category: 'Hotel',
                    title: h.title,
                    location: h.location,
                    city: h.city,
                    image: h.images[0],
                    priceDisplay: `₹${Math.min(...h.rooms.map((r) => r.pricePerNight))}/night`,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 6: GOURMET DINING & RESTAURANTS
      ========================================================================= */}
      {restaurants.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500 border border-orange-500/30">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Gourmet Dining & Table Reservation</span>
                  <span className="text-xs font-mono font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                    {restaurants.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Rooftop dining, candle-light tables & exclusive chef menus with instant table lock
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('restaurant')}
              className="text-xs font-black text-orange-600 dark:text-orange-400 hover:text-orange-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Restaurants ({restaurants.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.slice(0, 3).map((restaurant, idx) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                index={idx}
                onSelect={(r) => onSelectRestaurant(r)}
                onReserve={(r) => onReserveRestaurant ? onReserveRestaurant(r) : onSelectRestaurant(r)}
                onOpenDirections={(r) => onOpenDirections(r)}
                isWishlisted={wishlist.some((w) => w.id === restaurant.id)}
                onToggleWishlist={(r) =>
                  toggleWishlist({
                    id: r.id,
                    category: 'Restaurant',
                    title: r.title,
                    location: r.location,
                    city: r.city,
                    image: r.images[0],
                    priceDisplay: `₹${r.averageCostForTwo} for two`,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 7: DIGITAL LIBRARIES & STUDY CABINS
      ========================================================================= */}
      {libraries.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Smart Digital Libraries & Study Cabins</span>
                  <span className="text-xs font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {libraries.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  24/7 Silent AC study halls, high-speed WiFi & QR pass entry for students & professionals
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('library')}
              className="text-xs font-black text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Libraries ({libraries.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries.slice(0, 3).map((library, idx) => (
              <LibraryCard
                key={library.id}
                library={library}
                index={idx}
                onSelect={(l) => onSelectLibrary(l)}
                onBook={(l) => onSelectLibrary(l)}
                onOpenDirections={(l) => onOpenDirections(l)}
                isWishlisted={wishlist.some((w) => w.id === library.id)}
                onToggleWishlist={(l) =>
                  toggleWishlist({
                    id: l.id,
                    category: 'Library',
                    title: l.title,
                    location: l.location,
                    city: l.city,
                    image: l.images[0],
                    priceDisplay: `₹${l.monthlyPassPrice}/month`,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 8: DESIGNER CLOTHING & WEDDING ATTIRE
      ========================================================================= */}
      {clothingItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30">
                <Shirt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Designer Wedding Outfits & Lehengas</span>
                  <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                    {clothingItems.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Bridal Lehengas, Tuxedos, Sherwanis & Gowns with Dry Cleaning & Custom Fitting
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('clothing')}
              className="text-xs font-black text-rose-600 dark:text-rose-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Outfits ({clothingItems.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clothingItems.slice(0, 3).map((clothing, idx) => (
              <ClothingCard
                key={clothing.id}
                clothing={clothing}
                index={idx}
                onSelect={(c) => onBookClothing(c)}
                onBook={(c) => onBookClothing(c)}
                isSaved={savedIds.includes(clothing.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 9: SPORTS TURFS & FLOODLIT ARENAS
      ========================================================================= */}
      {sportsTurfs.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-lime-500/15 text-lime-500 border border-lime-500/30">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Sports Arenas, Turfs & Cricket Grounds</span>
                  <span className="text-xs font-mono font-bold text-lime-500 bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/30">
                    {sportsTurfs.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Hourly slots for Box Cricket, 7-A-Side Football Turf & Badminton Courts with Floodlights
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('sports_turf')}
              className="text-xs font-black text-lime-600 dark:text-lime-400 hover:text-lime-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Turfs ({sportsTurfs.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsTurfs.slice(0, 3).map((turf, idx) => (
              <SportsTurfCard
                key={turf.id}
                turf={turf}
                index={idx}
                onSelect={(t) => onBookSportsTurf(t)}
                onBook={(t) => onBookSportsTurf(t)}
                isSaved={savedIds.includes(turf.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 10: APPLIANCES, TOOLS & GADGETS
      ========================================================================= */}
      {generalItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <PackageCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>General Appliances, Cameras & Tools</span>
                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {generalItems.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  DSLR Cameras, PS5 Consoles, Sound Systems, Furniture & Heavy Duty Power Tools
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('general')}
              className="text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center space-x-1 cursor-pointer group shrink-0"
            >
              <span>View All Appliances ({generalItems.length})</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalItems.slice(0, 3).map((item, idx) => (
              <GeneralItemCard
                key={item.id}
                item={item}
                index={idx}
                onSelect={(i) => onSelectGeneralItem(i)}
                onBook={(i) => onBookGeneralItem(i)}
                isSaved={savedIds.includes(item.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
