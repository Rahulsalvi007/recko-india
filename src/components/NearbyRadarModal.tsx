import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  MapPin,
  LocateFixed,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sliders,
  Home,
  Car,
  Shirt,
  Trophy,
  Tv,
  Hotel as HotelIcon,
  UtensilsCrossed,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Property,
  Vehicle,
  ClothingItem,
  SportsTurfItem,
  GeneralItem,
  Hotel,
  Restaurant,
  Library
} from '../types';

interface NearbyRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProperties?: Property[];
  availableVehicles?: Vehicle[];
  availableClothing?: ClothingItem[];
  availableSportsTurfs?: SportsTurfItem[];
  availableGeneralItems?: GeneralItem[];
  availableHotels?: Hotel[];
  availableRestaurants?: Restaurant[];
  availableLibraries?: Library[];
  onSelectProperty: (p: Property) => void;
  onSelectVehicle?: (v: Vehicle) => void;
  onSelectClothing?: (c: ClothingItem) => void;
  onSelectSportsTurf?: (s: SportsTurfItem) => void;
  onSelectGeneralItem?: (g: GeneralItem) => void;
  onSelectHotel?: (h: Hotel) => void;
  onSelectRestaurant?: (r: Restaurant) => void;
  onSelectLibrary?: (l: Library) => void;
}

export type RadarAssetFilter = 'all' | 'property' | 'vehicle' | 'clothing' | 'sports_turf' | 'general' | 'hotel' | 'restaurant' | 'library';

// Known Indian Cities coordinates dictionary for distance precision
const KNOWN_CITY_COORDS: { [key: string]: { lat: number; lng: number; displayName: string } } = {
  bangalore: { lat: 12.9141, lng: 77.6412, displayName: 'Bangalore' },
  bengaluru: { lat: 12.9141, lng: 77.6412, displayName: 'Bengaluru' },
  hsr: { lat: 12.9141, lng: 77.6412, displayName: 'HSR Layout, Bangalore' },
  koramangala: { lat: 12.9352, lng: 77.6245, displayName: 'Koramangala, Bangalore' },
  indiranagar: { lat: 12.9784, lng: 77.6408, displayName: 'Indiranagar, Bangalore' },
  whitefield: { lat: 12.9698, lng: 77.7500, displayName: 'Whitefield, Bangalore' },

  delhi: { lat: 28.6901, lng: 77.2066, displayName: 'Delhi NCR' },
  ncr: { lat: 28.6139, lng: 77.2090, displayName: 'Delhi NCR' },
  gurgaon: { lat: 28.4950, lng: 77.0895, displayName: 'Gurugram / Gurgaon' },
  gurugram: { lat: 28.4950, lng: 77.0895, displayName: 'Gurugram' },
  noida: { lat: 28.5355, lng: 77.3910, displayName: 'Noida' },
  'hauz khas': { lat: 28.5494, lng: 77.2001, displayName: 'Hauz Khas, Delhi' },

  mumbai: { lat: 19.0600, lng: 72.8680, displayName: 'Mumbai' },
  bandra: { lat: 19.0596, lng: 72.8295, displayName: 'Bandra, Mumbai' },
  bkc: { lat: 19.0600, lng: 72.8680, displayName: 'BKC, Mumbai' },
  andheri: { lat: 19.1136, lng: 72.8697, displayName: 'Andheri, Mumbai' },

  pune: { lat: 18.5679, lng: 73.9143, displayName: 'Pune' },
  hinjewadi: { lat: 18.5912, lng: 73.7389, displayName: 'Hinjewadi, Pune' },
  viman: { lat: 18.5679, lng: 73.9143, displayName: 'Viman Nagar, Pune' },
  'fc road': { lat: 18.5204, lng: 73.8415, displayName: 'FC Road, Pune' },

  hyderabad: { lat: 17.4435, lng: 78.3772, displayName: 'Hyderabad' },
  hitec: { lat: 17.4435, lng: 78.3772, displayName: 'HITEC City, Hyderabad' },
  gachibowli: { lat: 17.4401, lng: 78.3489, displayName: 'Gachibowli, Hyderabad' },

  jaipur: { lat: 26.9124, lng: 75.7873, displayName: 'Jaipur' },
  'c-scheme': { lat: 26.9100, lng: 75.8000, displayName: 'C-Scheme, Jaipur' },
  'malviya nagar': { lat: 26.8530, lng: 75.8188, displayName: 'Malviya Nagar, Jaipur' },

  udaipur: { lat: 24.5854, lng: 73.7125, displayName: 'Udaipur' },
  bhuwana: { lat: 24.6200, lng: 73.7050, displayName: 'Bhuwana, Udaipur' },

  jodhpur: { lat: 26.2389, lng: 73.0243, displayName: 'Jodhpur' },
  kota: { lat: 25.2138, lng: 75.8648, displayName: 'Kota' },
  indore: { lat: 22.7533, lng: 75.8937, displayName: 'Indore' },
  bhopal: { lat: 23.2599, lng: 77.4126, displayName: 'Bhopal' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, displayName: 'Ahmedabad' },
  surat: { lat: 21.1702, lng: 72.8311, displayName: 'Surat' },
  chennai: { lat: 13.0827, lng: 80.2707, displayName: 'Chennai' },
  kolkata: { lat: 22.5726, lng: 88.3639, displayName: 'Kolkata' },
  chandigarh: { lat: 30.7333, lng: 76.7794, displayName: 'Chandigarh' },
  lucknow: { lat: 26.8467, lng: 80.9462, displayName: 'Lucknow' },
  goa: { lat: 15.2993, lng: 74.1240, displayName: 'Goa' },
  varanasi: { lat: 25.3176, lng: 82.9739, displayName: 'Varanasi' }
};

// Haversine Distance Formula in Kilometers
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Derive coordinates for items
function getItemCoordinates(
  itemCity?: string,
  location?: string,
  explicitLat?: number,
  explicitLng?: number,
  indexOffset: number = 0,
  activeCenterLat: number = 12.9141,
  activeCenterLng: number = 77.6412,
  activeCityQuery: string = 'Bangalore'
): { lat: number; lng: number } {
  if (typeof explicitLat === 'number' && typeof explicitLng === 'number' && explicitLat !== 0) {
    return { lat: explicitLat, lng: explicitLng };
  }

  const itemText = `${itemCity || ''} ${location || ''}`.toLowerCase().trim();
  const queryLower = activeCityQuery.toLowerCase().trim();

  // If item's city matches current active city search query
  if (itemCity && queryLower && (itemCity.toLowerCase().includes(queryLower) || queryLower.includes(itemCity.toLowerCase()))) {
    const latOffset = ((indexOffset % 7) * 0.007 - 0.018);
    const lngOffset = (((indexOffset + 3) % 7) * 0.007 - 0.018);
    return { lat: activeCenterLat + latOffset, lng: activeCenterLng + lngOffset };
  }

  // Lookup in city dictionary
  for (const key of Object.keys(KNOWN_CITY_COORDS)) {
    if (itemText.includes(key)) {
      const cityData = KNOWN_CITY_COORDS[key];
      const latOffset = ((indexOffset % 5) * 0.009 - 0.018);
      const lngOffset = (((indexOffset + 2) % 5) * 0.009 - 0.018);
      return { lat: cityData.lat + latOffset, lng: cityData.lng + lngOffset };
    }
  }

  // Default scattered offset around active center
  const defaultLatOffset = ((indexOffset % 9) * 0.012 - 0.035);
  const defaultLngOffset = (((indexOffset + 4) % 9) * 0.012 - 0.035);
  return { lat: activeCenterLat + defaultLatOffset, lng: activeCenterLng + defaultLngOffset };
}

export const NearbyRadarModal: React.FC<NearbyRadarModalProps> = ({
  isOpen,
  onClose,
  availableProperties = [],
  availableVehicles = [],
  availableClothing = [],
  availableSportsTurfs = [],
  availableGeneralItems = [],
  availableHotels = [],
  availableRestaurants = [],
  availableLibraries = [],
  onSelectProperty,
  onSelectVehicle,
  onSelectClothing,
  onSelectSportsTurf,
  onSelectGeneralItem,
  onSelectHotel,
  onSelectRestaurant,
  onSelectLibrary
}) => {
  const [userLat, setUserLat] = useState<number>(12.9141);
  const [userLng, setUserLng] = useState<number>(77.6412);
  const [userLocationName, setUserLocationName] = useState<string>('Bangalore, HSR Layout');
  const [cityInput, setCityInput] = useState<string>('Bangalore');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<RadarAssetFilter>('all');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGPSActive, setIsGPSActive] = useState<boolean>(false);

  // Trigger GPS auto-locate
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setUserLocationName(`Your Live GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        setIsGPSActive(true);
        setIsLocating(false);
      },
      (error) => {
        console.warn('GPS location error:', error);
        setIsLocating(false);
        alert('Could not access live GPS. Reverting to selected city radar.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // City Search Handler
  const handleCitySearchChange = (cityName: string) => {
    setCityInput(cityName);
    setIsGPSActive(false);
    const key = cityName.toLowerCase().trim();
    for (const cityKey of Object.keys(KNOWN_CITY_COORDS)) {
      if (key.includes(cityKey) || cityKey.includes(key)) {
        const c = KNOWN_CITY_COORDS[cityKey];
        setUserLat(c.lat);
        setUserLng(c.lng);
        setUserLocationName(c.displayName);
        return;
      }
    }
    setUserLocationName(`${cityName} Radar Center`);
  };

  if (!isOpen) return null;

  // Process and compute distances for ALL rental asset types
  const getNearbyListings = () => {
    const items: any[] = [];

    // 1. Properties
    availableProperties.forEach((p, idx) => {
      const coords = getItemCoordinates(p.city, p.location, p.coordinates?.lat, p.coordinates?.lng, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: p.id,
        rawObj: p,
        title: p.title,
        categoryType: p.category === 'student' ? 'Student PG' : 'Property / Flat',
        catKey: 'property',
        location: p.location,
        city: p.city,
        price: Number(p.rentPerMonth || (p as any).price || 0),
        priceUnit: '/month',
        rating: p.rating,
        image: p.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        isAvailable: p.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: p.ownerVerified,
        badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300'
      });
    });

    // 2. Vehicles
    availableVehicles.forEach((v, idx) => {
      const coords = getItemCoordinates(v.city, v.location, v.coordinates?.lat, v.coordinates?.lng, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: v.id,
        rawObj: v,
        title: `${v.brand} ${v.modelName || ''} (${v.vehicleType})`,
        categoryType: `${v.vehicleType} Rental`,
        catKey: 'vehicle',
        location: v.location,
        city: v.city,
        price: Number(v.rentPerDay || (v as any).price || 0),
        priceUnit: '/day',
        rating: v.rating,
        image: v.images[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc',
        isAvailable: v.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: v.ownerVerified,
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:text-emerald-300 border-emerald-300'
      });
    });

    // 3. Clothing / Wedding Outfits
    availableClothing.forEach((c, idx) => {
      const coords = getItemCoordinates(c.city, c.location, undefined, undefined, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: c.id,
        rawObj: c,
        title: c.title,
        categoryType: `Outfit (${c.category})`,
        catKey: 'clothing',
        location: c.location,
        city: c.city,
        price: Number(c.rentPerDay || (c as any).price || 0),
        priceUnit: '/day',
        rating: c.rating,
        image: c.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
        isAvailable: c.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: c.ownerVerified,
        badgeColor: 'bg-amber-100 text-amber-900 dark:text-amber-300 border-amber-300'
      });
    });

    // 4. Sports Turfs
    availableSportsTurfs.forEach((s, idx) => {
      const coords = getItemCoordinates(s.city, s.location, undefined, undefined, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: s.id,
        rawObj: s,
        title: s.title,
        categoryType: `Sports Turf (${s.sportType})`,
        catKey: 'sports_turf',
        location: s.location,
        city: s.city,
        price: Number(s.pricePerHour || (s as any).price || 0),
        priceUnit: '/hour',
        rating: s.rating,
        image: s.images[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6',
        isAvailable: s.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: s.ownerVerified,
        badgeColor: 'bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-300'
      });
    });

    // 5. General Items / Gadgets
    availableGeneralItems.forEach((g, idx) => {
      const coords = getItemCoordinates(g.city, g.location, undefined, undefined, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: g.id,
        rawObj: g,
        title: g.title,
        categoryType: `Gadget / Appliance`,
        catKey: 'general',
        location: g.location,
        city: g.city,
        price: Number(g.pricePerDay || (g as any).price || 0),
        priceUnit: '/day',
        rating: g.rating,
        image: g.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147',
        isAvailable: g.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: g.ownerVerified,
        badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300'
      });
    });

    // 6. Hotels
    availableHotels.forEach((h, idx) => {
      const coords = getItemCoordinates(h.city, h.location, undefined, undefined, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: h.id,
        rawObj: h,
        title: h.title,
        categoryType: 'Hotel & Stays',
        catKey: 'hotel',
        location: h.location,
        city: h.city,
        price: Number(h.rooms?.[0]?.pricePerNight || (h as any).pricePerNight || (h as any).price || 2200),
        priceUnit: '/night',
        rating: h.rating,
        image: h.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        isAvailable: h.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: h.ownerVerified,
        badgeColor: 'bg-amber-100 text-amber-900 dark:text-amber-300 border-amber-300'
      });
    });

    // 7. Restaurants / Dining
    availableRestaurants.forEach((r, idx) => {
      const coords = getItemCoordinates(r.city, r.location, undefined, undefined, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: r.id,
        rawObj: r,
        title: r.title,
        categoryType: 'Dining & Cafe',
        catKey: 'restaurant',
        location: r.location,
        city: r.city,
        price: Number(r.averageCostForTwo || (r as any).avgCostForTwo || (r as any).price || 800),
        priceUnit: ' for two',
        rating: r.rating,
        image: r.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        isAvailable: r.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: r.ownerVerified,
        badgeColor: 'bg-amber-100 text-amber-900 dark:text-amber-300 border-amber-300'
      });
    });

    // 8. Libraries / Study Pods
    availableLibraries.forEach((l, idx) => {
      const coords = getItemCoordinates(l.city, l.location, undefined, undefined, idx, userLat, userLng, cityInput);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: l.id,
        rawObj: l,
        title: l.title,
        categoryType: 'Study Library',
        catKey: 'library',
        location: l.location,
        city: l.city,
        price: Number(l.dailyPassPrice || (l as any).monthlyFee || (l as any).price || 200),
        priceUnit: '/day pass',
        rating: l.rating,
        image: l.images[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da',
        isAvailable: l.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: l.ownerVerified,
        badgeColor: 'bg-amber-100 text-amber-900 dark:text-amber-300 border-amber-300'
      });
    });

    return items;
  };

  const allItems = getNearbyListings();

  // Category Filter Tabs
  const assetCategoryTabs: { key: RadarAssetFilter; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'all',
      label: 'All Assets (Sabhi Rentals)',
      icon: <Layers className="h-3.5 w-3.5" />,
      count: allItems.length
    },
    {
      key: 'property',
      label: 'Flats & PGs',
      icon: <Home className="h-3.5 w-3.5" />,
      count: availableProperties.length
    },
    {
      key: 'vehicle',
      label: 'Cars & Bikes',
      icon: <Car className="h-3.5 w-3.5" />,
      count: availableVehicles.length
    },
    {
      key: 'clothing',
      label: 'Wedding & Clothes',
      icon: <Shirt className="h-3.5 w-3.5" />,
      count: availableClothing.length
    },
    {
      key: 'sports_turf',
      label: 'Sports Turfs',
      icon: <Trophy className="h-3.5 w-3.5" />,
      count: availableSportsTurfs.length
    },
    {
      key: 'general',
      label: 'Appliances & Gadgets',
      icon: <Tv className="h-3.5 w-3.5" />,
      count: availableGeneralItems.length
    },
    {
      key: 'hotel',
      label: 'Hotels',
      icon: <HotelIcon className="h-3.5 w-3.5" />,
      count: availableHotels.length
    },
    {
      key: 'restaurant',
      label: 'Dining',
      icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
      count: availableRestaurants.length
    },
    {
      key: 'library',
      label: 'Libraries',
      icon: <BookOpen className="h-3.5 w-3.5" />,
      count: availableLibraries.length
    }
  ];

  // Filter by selected category & distance
  const categoryFilteredItems = allItems.filter((item) => {
    if (selectedAssetCategory === 'all') return true;
    return item.catKey === selectedAssetCategory;
  });

  const radiusFilteredItems = categoryFilteredItems
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Fallback to nearest if 0 items in small radius
  const displayItems = radiusFilteredItems.length > 0
    ? radiusFilteredItems
    : categoryFilteredItems.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8);

  const handleItemClick = (item: any) => {
    onClose();
    if (item.catKey === 'vehicle' && onSelectVehicle) {
      onSelectVehicle(item.rawObj);
    } else if (item.catKey === 'clothing' && onSelectClothing) {
      onSelectClothing(item.rawObj);
    } else if (item.catKey === 'sports_turf' && onSelectSportsTurf) {
      onSelectSportsTurf(item.rawObj);
    } else if (item.catKey === 'general' && onSelectGeneralItem) {
      onSelectGeneralItem(item.rawObj);
    } else if (item.catKey === 'hotel' && onSelectHotel) {
      onSelectHotel(item.rawObj);
    } else if (item.catKey === 'restaurant' && onSelectRestaurant) {
      onSelectRestaurant(item.rawObj);
    } else if (item.catKey === 'library' && onSelectLibrary) {
      onSelectLibrary(item.rawObj);
    } else {
      onSelectProperty(item.rawObj);
    }
  };

  const getCategoryIcon = (catKey: string) => {
    switch (catKey) {
      case 'property': return <Home className="h-3 w-3" />;
      case 'vehicle': return <Car className="h-3 w-3" />;
      case 'clothing': return <Shirt className="h-3 w-3" />;
      case 'sports_turf': return <Trophy className="h-3 w-3" />;
      case 'general': return <Tv className="h-3 w-3" />;
      case 'hotel': return <HotelIcon className="h-3 w-3" />;
      case 'restaurant': return <UtensilsCrossed className="h-3 w-3" />;
      case 'library': return <BookOpen className="h-3 w-3" />;
      default: return <Layers className="h-3 w-3" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Luxury Container: White in Light mode, Pure Black in Dark mode */}
      <div className="bg-white dark:bg-black border border-amber-400/40 text-slate-900 dark:text-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Slate Dark Background with Gold Accent Badge */}
        <div className="bg-slate-900 dark:bg-zinc-950 p-4 sm:p-5 text-white border-b border-amber-400/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-2xl shadow-md shrink-0 font-black">
              <Navigation className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Proximity Rental Radar (All Assets)
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isGPSActive 
                    ? 'bg-amber-400 text-slate-950' 
                    : 'bg-slate-800 text-amber-300 border border-amber-400/30'
                }`}>
                  {isGPSActive ? 'Live GPS Active' : 'City Mode'}
                </span>
              </div>
              <p className="text-amber-300/90 text-xs font-medium mt-0.5">
                Explore nearby Cars, Bikes, Wedding Clothes, Sports Turfs, Appliances, Flats & Hotels within your physical radius.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0 border border-slate-700"
            title="Close Radar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Main Controls Bar (Auto GPS, City Search, Km Slider) */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            
            {/* Control 1: Auto GPS Button */}
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isLocating}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer transition-all border shadow-xs ${
                  isGPSActive
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border-slate-300 dark:border-zinc-700 hover:border-amber-400'
                }`}
              >
                <LocateFixed className={`h-4 w-4 ${isLocating ? 'animate-spin text-amber-500' : isGPSActive ? 'text-slate-950' : 'text-amber-500'}`} />
                <span>{isLocating ? 'Locating...' : 'Auto GPS Location'}</span>
              </button>
            </div>

            {/* Control 2: City Search Input */}
            <div className="sm:col-span-5 relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-amber-500" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => handleCitySearchChange(e.target.value)}
                placeholder="Type City / Area (Jaipur, Udaipur, Bangalore, Delhi, Pune, Mumbai)..."
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Control 3: Km Distance Selector */}
            <div className="sm:col-span-4 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 p-2.5 rounded-xl flex items-center justify-between space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 flex items-center space-x-1">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                <span>Radius: <strong className="text-amber-600 dark:text-amber-400 font-black">{radiusKm} km</strong></span>
              </span>
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

          </div>

          {/* Quick Distance Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
            <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">Quick Distance Presets:</span>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[3, 5, 10, 15, 25, 50].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setRadiusKm(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border shrink-0 ${
                    radiusKm === preset
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {preset} km
                </button>
              ))}
            </div>
          </div>

          {/* ASSET CATEGORY SELECTOR TABS */}
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Select Rental Asset Category:</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                {categoryFilteredItems.length} Available in this category
              </span>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 no-scrollbar">
              {assetCategoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedAssetCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 shrink-0 border ${
                    selectedAssetCategory === tab.key
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black border-amber-300 shadow-sm scale-102'
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700 hover:border-amber-400'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedAssetCategory === tab.key
                      ? 'bg-slate-950/20 text-slate-950 font-black'
                      : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Banner & Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-100/60 dark:bg-black custom-scrollbar">
          
          {/* Active Center Info Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-500/10 border border-amber-400/40 p-3 rounded-2xl text-xs gap-2">
            <div className="flex items-center space-x-2">
              <Compass className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white">
                Radar Center: <strong className="text-amber-700 dark:text-amber-300">{userLocationName}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-900 dark:text-amber-300 bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl border border-amber-400/30 text-[11px] shadow-2xs">
                Found {radiusFilteredItems.length} matching rentals within {radiusKm} km
              </span>
            </div>
          </div>

          {/* EMPTY STATE */}
          {radiusFilteredItems.length === 0 ? (
            <div className="text-center py-10 px-6 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-3.5 my-2">
              <div className="h-14 w-14 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No {selectedAssetCategory !== 'all' ? selectedAssetCategory.replace('_', ' ') : 'rentals'} found within {radiusKm} km
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                  Aapke select kiye hue location (<strong className="text-slate-900 dark:text-white">{userLocationName}</strong>) ke {radiusKm} km radius me filhal koi listing nahi mili. Radius expand karein ya dusra category chunein.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setRadiusKm(25)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Expand Radius to 25 km</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRadiusKm(50)}
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-zinc-800 dark:text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-slate-800 dark:border-zinc-700"
                >
                  Expand Radius to 50 km
                </button>

                {selectedAssetCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedAssetCategory('all')}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-slate-300 dark:border-zinc-700"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* LISTING CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayItems.map((item) => (
              <div
                key={`${item.catKey}-${item.id}`}
                onClick={() => handleItemClick(item)}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl overflow-hidden p-3 flex flex-col justify-between group cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="space-y-2.5">
                  {/* Image & Badges */}
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Distance Badge */}
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-slate-950" />
                      <span>{item.distanceKm} km away</span>
                    </span>

                    {/* Category Type Badge */}
                    <span className={`absolute bottom-2 left-2 font-bold text-[10px] px-2.5 py-0.5 rounded-lg border shadow-xs flex items-center space-x-1 backdrop-blur-md bg-slate-950/85 text-amber-300 border-amber-400/40`}>
                      {getCategoryIcon(item.catKey)}
                      <span className="truncate max-w-[130px]">{item.categoryType}</span>
                    </span>

                    {/* Availability Status Badge */}
                    <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase shadow-2xs ${
                      item.isAvailable ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Booked'}
                    </span>
                  </div>

                  {/* Information */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-bold mb-0.5">
                      <span className="uppercase tracking-wider font-semibold">{item.city}</span>
                      {item.ownerVerified && (
                        <span className="flex items-center text-amber-700 dark:text-amber-400 font-bold">
                          <ShieldCheck className="h-3 w-3 mr-0.5 text-amber-500" /> Verified
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate mt-0.5 flex items-center space-x-1 font-medium">
                      <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>{item.location}, {item.city}</span>
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-amber-700 dark:text-amber-400">
                      ₹{Number(item.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{item.priceUnit}</span>
                  </div>

                  <button className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1 transition-all shadow-xs cursor-pointer">
                    <span>Rent / Book</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between px-5 shrink-0">
          <span>Proximity Radar • Physical Haversine Radius for All Assets</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Close Radar
          </button>
        </div>

      </div>
    </div>
  );
};
