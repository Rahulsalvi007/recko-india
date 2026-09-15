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
  Sparkles,
  Search
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
import { getCityCoordinates, CITY_COORDINATES_MAP } from '../utils/aiLocationEngine';

interface NearbyRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCity?: string;
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

// Haversine Physical Distance Formula in Kilometers
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isFinite(lat1) || !isFinite(lon1) || !isFinite(lat2) || !isFinite(lon2)) return 999.9;
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lon1) > 180 || Math.abs(lon2) > 180) return 999.9;
  if (lat1 === lat2 && lon1 === lon2) return 0.3;
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
  const distance = R * c;
  return Number(distance.toFixed(1));
}

// Derive accurate true coordinates for items
function getItemTrueCoordinates(
  item: any,
  indexOffset: number = 0
): { lat: number; lng: number } {
  // Explicit latitude & longitude check
  if (item.coordinates?.lat && item.coordinates?.lng && item.coordinates.lat !== 0) {
    return { lat: item.coordinates.lat, lng: item.coordinates.lng };
  }
  if (item.currentLat && item.currentLng && item.currentLat !== 0) {
    return { lat: item.currentLat, lng: item.currentLng };
  }

  // Geocode item's actual city & area location
  const baseCoords = getCityCoordinates(item.city, item.location);

  // Deterministic micro-spread (0.2 to 2.5 km) so items within the same city don't stack on 0.0 km
  const str = `${item.id || ''}${item.title || ''}${item.location || ''}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash) + indexOffset;

  const latOffset = ((positiveHash % 11) * 0.003 - 0.015);
  const lngOffset = ((((positiveHash + 3) % 11) * 0.003) - 0.015);

  return {
    lat: Number((baseCoords.lat + latOffset).toFixed(6)),
    lng: Number((baseCoords.lng + lngOffset).toFixed(6))
  };
}

export const NearbyRadarModal: React.FC<NearbyRadarModalProps> = ({
  isOpen,
  onClose,
  initialCity = '',
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
  const [cityInput, setCityInput] = useState<string>('');
  const [userLat, setUserLat] = useState<number>(26.9124);
  const [userLng, setUserLng] = useState<number>(75.7873);
  const [userLocationName, setUserLocationName] = useState<string>('Jaipur Radar Center');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<RadarAssetFilter>('all');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGPSActive, setIsGPSActive] = useState<boolean>(false);
  const [gpsBannerMsg, setGpsBannerMsg] = useState<string | null>(null);

  // Initialize center coordinates when modal opens or initialCity changes
  useEffect(() => {
    if (!isOpen) return;

    const startCity = initialCity || '';
    setCityInput('');
    setGpsBannerMsg(null);
    const coords = getCityCoordinates(startCity || 'Jaipur');
    setUserLat(coords.lat);
    setUserLng(coords.lng);
    setUserLocationName(startCity ? `${startCity} Radar Center` : 'All Locations Radar Center');
    setIsGPSActive(false);

    // Auto-try browser GPS location silently
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);
          setUserLocationName(`Live Device GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
          setIsGPSActive(true);
        },
        () => {
          // Silently fallback to city radar center without setting any message banner
          setIsGPSActive(false);
        },
        { timeout: 3000, enableHighAccuracy: false }
      );
    }
  }, [isOpen, initialCity]);

  // Trigger GPS auto-locate manually
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsBannerMsg('Geolocation is not supported by your device browser.');
      setTimeout(() => setGpsBannerMsg(null), 4000);
      return;
    }
    setIsLocating(true);
    setGpsBannerMsg(null);
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
        setIsLocating(false);
        setIsGPSActive(false);
        const fallbackCity = cityInput || initialCity || 'Jaipur';
        const coords = getCityCoordinates(fallbackCity);
        setUserLat(coords.lat);
        setUserLng(coords.lng);
        setUserLocationName(`${fallbackCity} Radar Center`);
        
        const msg = error && error.code === 1
          ? `📍 GPS Permission Blocked. Showing items near ${fallbackCity} Radar Center.`
          : `📍 GPS Signal Unavailable. Showing items near ${fallbackCity} Radar Center.`;
        
        setGpsBannerMsg(msg);
        // Auto-dismiss banner after 4 seconds
        setTimeout(() => setGpsBannerMsg(null), 4000);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  // City Search Handler
  const handleCitySearchChange = (cityName: string) => {
    setCityInput(cityName);
    setIsGPSActive(false);
    const coords = getCityCoordinates(cityName);
    setUserLat(coords.lat);
    setUserLng(coords.lng);
    setUserLocationName(`${cityName || 'Selected'} Radar Center`);
  };

  if (!isOpen) return null;

  // Process and compute true Haversine physical distances for ALL rental asset types
  const getNearbyListings = () => {
    const items: any[] = [];

    // 1. Properties
    availableProperties.forEach((p, idx) => {
      const coords = getItemTrueCoordinates(p, idx);
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
      const coords = getItemTrueCoordinates(v, idx);
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
      const coords = getItemTrueCoordinates(c, idx);
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
      const coords = getItemTrueCoordinates(s, idx);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: s.id,
        rawObj: s,
        title: s.title,
        categoryType: `Sports Turf (${s.turfType || 'Arena'})`,
        catKey: 'sports_turf',
        location: s.location,
        city: s.city,
        price: Number(s.rentPerHour || (s as any).price || 0),
        priceUnit: '/hour',
        rating: s.rating,
        image: s.images[0] || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isAvailable: s.isAvailable !== false,
        distanceKm: dist,
        ownerVerified: s.ownerVerified,
        badgeColor: 'bg-slate-100 text-slate-800 dark:text-slate-200 border-slate-300'
      });
    });

    // 5. General Items / Gadgets
    availableGeneralItems.forEach((g, idx) => {
      const coords = getItemTrueCoordinates(g, idx);
      const dist = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);

      items.push({
        id: g.id,
        rawObj: g,
        title: g.title,
        categoryType: `Gadget / Appliance`,
        catKey: 'general',
        location: g.location,
        city: g.city,
        price: Number(g.rentPerDay || (g as any).price || 0),
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
      const coords = getItemTrueCoordinates(h, idx);
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
      const coords = getItemTrueCoordinates(r, idx);
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
      const coords = getItemTrueCoordinates(l, idx);
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

  // Filter by selected category & distance radius
  const categoryFilteredItems = allItems.filter((item) => {
    if (selectedAssetCategory === 'all') return true;
    return item.catKey === selectedAssetCategory;
  });

  // Filter items within radius (500km threshold means All India)
  const radiusFilteredItems = categoryFilteredItems
    .filter((item) => radiusKm >= 500 || item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Fallback if 0 items in selected small radius
  const displayItems = radiusFilteredItems.length > 0
    ? radiusFilteredItems
    : categoryFilteredItems.sort((a, b) => a.distanceKm - b.distanceKm);

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

  const cityListOptions = [
    'Jaipur',
    'Udaipur',
    'Jodhpur',
    'Kota',
    'Ajmer',
    'Bikaner',
    'Bhilwara',
    'Delhi',
    'Noida',
    'Gurgaon',
    'Mumbai',
    'Pune',
    'Ahmedabad',
    'Surat',
    'Indore',
    'Bhopal',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Chandigarh',
    'Dehradun',
    'Lucknow',
    'Goa'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Luxury Container */}
      <div className="bg-white dark:bg-black border border-amber-400/40 text-slate-900 dark:text-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
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
                  {isGPSActive ? 'Live Device GPS Active' : 'City Radar Mode'}
                </span>
              </div>
              <p className="text-amber-300/90 text-xs font-medium mt-0.5">
                Physical Haversine Radius distance calculation for all Properties, Vehicles, Clothes, Turfs & Hotels.
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

        {/* GPS Permission / Alert Banner */}
        {gpsBannerMsg && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-bold shrink-0">
            <span>{gpsBannerMsg}</span>
            <button type="button" onClick={() => setGpsBannerMsg(null)} className="text-amber-500 hover:text-amber-700 p-1 cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 3 Main Controls Bar (Auto GPS, City Selector, Radius Slider) */}
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
                <span>{isLocating ? 'Locating...' : '🎯 Auto Device GPS'}</span>
              </button>
            </div>

            {/* Control 2: Free Text Search Bar */}
            <div className="sm:col-span-5 relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-amber-500 z-10 pointer-events-none" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => handleCitySearchChange(e.target.value)}
                placeholder="Search city, area or landmark (e.g. Jaipur, Udaipur, C-Scheme, Delhi)..."
                className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
              {cityInput && (
                <button
                  type="button"
                  onClick={() => handleCitySearchChange('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1 cursor-pointer"
                  title="Clear Search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Control 3: Radius Range Selector */}
            <div className="sm:col-span-4 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 p-2.5 rounded-xl flex items-center justify-between space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 flex items-center space-x-1">
                <Sliders className="h-3.5 w-3.5 text-amber-500" />
                <span>Radius: <strong className="text-amber-600 dark:text-amber-400 font-black">{radiusKm >= 500 ? 'All India' : `${radiusKm} km`}</strong></span>
              </span>
              <input
                type="range"
                min={2}
                max={500}
                step={radiusKm > 50 ? 50 : 2}
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
              {[3, 5, 10, 15, 25, 50, 100, 500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setRadiusKm(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border shrink-0 ${
                    radiusKm === preset
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {preset >= 500 ? 'All India' : `${preset} km`}
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
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black border-amber-300 shadow-sm'
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
                Found {radiusFilteredItems.length} matching rentals within {radiusKm >= 500 ? 'All India' : `${radiusKm} km`}
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
                  Aapke select kiye hue location (<strong className="text-slate-900 dark:text-white">{userLocationName}</strong>) ke {radiusKm} km radius me filhal koi listing nahi mili. Radius expand karein ya dusra city chunein.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setRadiusKm(50)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Expand Radius to 50 km</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRadiusKm(500)}
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-zinc-800 dark:text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-slate-800 dark:border-zinc-700"
                >
                  Show All India Listings (500 km+)
                </button>
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
