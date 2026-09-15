import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  MapPin,
  IndianRupee,
  RotateCcw,
  MessageSquare,
  Compass,
  Send,
  Bot,
  User as UserIcon,
  HelpCircle,
  Tag,
  Copy,
  Volume2,
  Trash2
} from 'lucide-react';
import {
  Property,
  Vehicle,
  ClothingItem,
  SportsTurfItem,
  GeneralItem,
  Hotel,
  Restaurant,
  Library,
  AIRecommendationResult
} from '../types';
import { getApiUrl } from '../utils/apiConfig';
import { generateConciergeReply } from '../utils/conciergeAiEngine';
import { queryUniversalAIEngine } from '../utils/universalAiEngine';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProperties: Property[];
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

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
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
  const [activeTab, setActiveTab] = useState<'advisor' | 'concierge'>('concierge');

  // Advisor State
  const [whatYouWant, setWhatYouWant] = useState<string>('Hyundai Creta Self-Drive Car');
  const [location, setLocation] = useState<string>('Gurgaon');
  const [budget, setBudget] = useState<number>(5000);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIRecommendationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Concierge Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Namaste! Main Recko-India ka 24/7 Smart AI Assistant hoon.\n\nAap mujhse Flats, Student PGs, Self-Drive Cars/Bikes, TV/Fridge/AC, Wedding Outfits, Turfs ya Hotels ke bare me **kuch bhi** pooch sakte hain!\n\n💡 Try asking:\n• *"Jaipur me 2 BHK flat dikhao"*\n• *"AC ya Fridge rent par kitne ka milega?"*\n• *"Thar rent lene ke rules kya hain?"*\n• *"Booking kaise karein aur owner ka number kaise milega?"*',
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'concierge' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading, activeTab]);

  if (!isOpen) return null;

  // Prepare combined listings context across all asset types
  const getAllListingsContext = () => {
    const list: any[] = [];

    // 1. Properties
    (availableProperties || []).forEach((p) =>
      list.push({
        id: p.id,
        rawObj: p,
        title: p.title,
        type: 'property',
        categoryDisplay: p.category === 'student' ? 'Student PG' : 'Property / Flat',
        city: p.city || 'Bangalore',
        location: p.location || '',
        fullLocation: `${p.location || ''}, ${p.city || ''}`,
        price: p.rentPerMonth,
        priceUnit: '/month',
        rentPerMonth: p.rentPerMonth,
        amenities: p.amenities || [],
        image: p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
        badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-300'
      })
    );

    // 2. Vehicles
    (availableVehicles || []).forEach((v) =>
      list.push({
        id: v.id,
        rawObj: v,
        title: `${v.brand} ${v.modelName || ''} (${v.vehicleType || 'Vehicle'})`,
        type: 'vehicle',
        categoryDisplay: `${v.vehicleType || 'Vehicle'} (${v.transmission || 'Manual'})`,
        city: v.city || '',
        location: v.location || '',
        fullLocation: `${v.location || ''}, ${v.city || ''}`,
        price: v.rentPerDay,
        priceUnit: '/day',
        rentPerMonth: (v.rentPerDay || 0) * 30,
        pricePerDay: v.rentPerDay || 0,
        amenities: [v.vehicleType, v.fuelType, v.transmission || '', v.brand],
        image: v.images && v.images[0] ? v.images[0] : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      })
    );

    // 3. Clothing
    (availableClothing || []).forEach((c) =>
      list.push({
        id: c.id,
        rawObj: c,
        title: c.title,
        type: 'clothing',
        categoryDisplay: `Outfit (${c.gender || 'Unisex'})`,
        city: c.city || '',
        location: c.location || '',
        fullLocation: `${c.location || ''}, ${c.city || ''}`,
        price: c.rentPerDay,
        priceUnit: '/day',
        rentPerMonth: (c.rentPerDay || 0) * 30,
        amenities: [c.category, c.size, c.color],
        image: c.images && c.images[0] ? c.images[0] : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      })
    );

    // 4. Sports Turfs
    (availableSportsTurfs || []).forEach((s) =>
      list.push({
        id: s.id,
        rawObj: s,
        title: s.title,
        type: 'sports_turf',
        categoryDisplay: `Sports Turf (${s.sportType})`,
        city: s.city || '',
        location: s.location || '',
        fullLocation: `${s.location || ''}, ${s.city || ''}`,
        price: s.pricePerHour,
        priceUnit: '/hour',
        rentPerMonth: (s.pricePerHour || 0) * 30,
        amenities: s.amenities || [s.sportType],
        image: s.images && s.images[0] ? s.images[0] : 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
      })
    );

    // 5. General Items
    (availableGeneralItems || []).forEach((g) =>
      list.push({
        id: g.id,
        rawObj: g,
        title: g.title,
        type: 'general',
        categoryDisplay: `Item (${g.category})`,
        city: g.city || '',
        location: g.location || '',
        fullLocation: `${g.location || ''}, ${g.city || ''}`,
        price: g.pricePerDay,
        priceUnit: '/day',
        rentPerMonth: (g.pricePerDay || 0) * 30,
        amenities: [g.category, g.condition],
        image: g.images && g.images[0] ? g.images[0] : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80',
        badgeColor: 'bg-amber-500/10 text-amber-800 border-amber-300'
      })
    );

    // 6. Hotels
    (availableHotels || []).forEach((h: any) =>
      list.push({
        id: h.id,
        rawObj: h,
        title: h.title || h.name || 'Hotel Stay',
        type: 'hotel',
        categoryDisplay: `Hotel (${h.starRating || 4}★)`,
        city: h.city || '',
        location: h.location || '',
        fullLocation: `${h.location || ''}, ${h.city || ''}`,
        price: h.pricePerNight || 2000,
        priceUnit: '/night',
        rentPerMonth: (h.pricePerNight || 2000) * 30,
        amenities: h.amenities || [],
        image: h.images && h.images[0] ? h.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      })
    );

    // 7. Restaurants
    (availableRestaurants || []).forEach((r: any) =>
      list.push({
        id: r.id,
        rawObj: r,
        title: r.title || r.name || 'Restaurant',
        type: 'restaurant',
        categoryDisplay: `Restaurant (${r.cuisine || 'Fine Dining'})`,
        city: r.city || '',
        location: r.location || '',
        fullLocation: `${r.location || ''}, ${r.city || ''}`,
        price: r.averageCostForTwo || r.avgCostForTwo || 800,
        priceUnit: ' for two',
        rentPerMonth: r.averageCostForTwo || r.avgCostForTwo || 800,
        amenities: [r.cuisine || 'Dining', r.ambiance || 'AC'],
        image: r.images && r.images[0] ? r.images[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      })
    );

    // 8. Libraries
    (availableLibraries || []).forEach((l: any) =>
      list.push({
        id: l.id,
        rawObj: l,
        title: l.title || l.name || 'Library & Study Spot',
        type: 'library',
        categoryDisplay: `Library / Study Spot`,
        city: l.city || '',
        location: l.location || '',
        fullLocation: `${l.location || ''}, ${l.city || ''}`,
        price: l.monthlyFee || 1000,
        priceUnit: '/month',
        rentPerMonth: l.monthlyFee || 1000,
        amenities: l.amenities || [],
        image: l.images && l.images[0] ? l.images[0] : 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      })
    );

    return list;
  };

  const handleAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatYouWant.trim()) {
      setErrorMsg('Please enter what rental asset or service you are looking for.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setResult(null);

    const allListings = getAllListingsContext();
    const userLoc = location.trim().toLowerCase();
    const userReq = whatYouWant.trim().toLowerCase();

    // Perform smart client-side matching engine
    const generateLocalResult = () => {
      const reqKeywords = userReq.split(/\s+/).filter(k => k.length > 2);
      
      const matched = allListings.filter((item) => {
        const titleLower = (item.title || '').toLowerCase();
        const typeLower = (item.type || '').toLowerCase();
        const catLower = (item.categoryDisplay || '').toLowerCase();
        const cityLower = (item.city || '').toLowerCase();
        const locLower = (item.location || '').toLowerCase();

        const titleMatch = reqKeywords.some(k => titleLower.includes(k) || typeLower.includes(k) || catLower.includes(k)) || titleLower.includes(userReq);
        const cityMatch = !userLoc || cityLower.includes(userLoc) || locLower.includes(userLoc) || userReq.includes(cityLower);
        const budgetMatch = !budget || (item.price || 0) <= budget * 1.5;
        
        return (titleMatch || cityMatch) && budgetMatch;
      });

      const matchedIds = matched.slice(0, 4).map((x) => x.id);
      const displayLocation = location.trim() || 'your location';

      return {
        recommendedIds: matchedIds.length > 0 ? matchedIds : allListings.slice(0, 3).map((x) => x.id),
        summary: `Found ${matchedIds.length || allListings.length} verified listings in ${displayLocation} matching your query "${whatYouWant}". All assets are 100% verified with zero brokerage direct host contacts.`,
        keyFactors: [
          `Verified direct host contact in ${displayLocation}`,
          `Transparent 100% Bank Escrow security deposit protection`,
          `Instant online booking slot reservation`
        ],
        budgetTips: `Book directly through Recko Escrow to save 100% brokerage fees and secure an instant refundable token slot.`,
        verdict: '✅ Verified Matches Found'
      };
    };

    try {
      const resp = await fetch(getApiUrl('/api/gemini/recommend'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatYouWant,
          location,
          budget,
          availableListings: allListings.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            city: item.city,
            location: item.location,
            price: item.price,
            priceUnit: item.priceUnit,
            amenities: item.amenities
          }))
        })
      }).catch(() => null);

      if (resp && resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await resp.json();
          setResult(data);
          return;
        }
      }

      // Netlify / Static hosting fallback
      setResult(generateLocalResult());
    } catch (err: any) {
      setResult(generateLocalResult());
    } finally {
      setLoading(false);
    }
  };

  const getClientConciergeReply = (query: string): string => {
    return queryUniversalAIEngine(query, {
      properties: availableProperties || [],
      vehicles: availableVehicles || [],
      clothing: availableClothing || [],
      sportsTurfs: availableSportsTurfs || [],
      generalItems: availableGeneralItems || [],
      hotels: availableHotels || [],
      restaurants: availableRestaurants || [],
      libraries: availableLibraries || []
    }, 'tenant');
  };

  const handleSendChat = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = (customQuery || chatInput).trim();
    if (!queryToSend) return;
    setChatInput('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user' as const, text: queryToSend, time };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(getApiUrl('/api/gemini/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: queryToSend,
          history: updatedHistory.slice(-8).map((m) => ({ role: m.role, content: m.text }))
        })
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (resp && resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await resp.json();
          if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 5) {
            setChatMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                text: data.reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setChatLoading(false);
            return;
          }
        }
      }

      // Fallback to ultra-accurate real-database client concierge engine
      const localReply = getClientConciergeReply(queryToSend);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: localReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      const localReply = getClientConciergeReply(queryToSend);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: localReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const getMatchedListings = () => {
    if (!result || !result.recommendedIds) return [];
    const all = getAllListingsContext();
    const matches = all.filter((item) => result.recommendedIds.includes(item.id));
    if (matches.length > 0) return matches;
    return all.slice(0, 3);
  };

  const matchedItems = getMatchedListings();

  const handleItemClick = (item: any) => {
    onClose();
    if (item.type === 'property') {
      const p = availableProperties.find((x) => x.id === item.id);
      if (p) onSelectProperty(p);
    } else if (item.type === 'vehicle') {
      const v = availableVehicles.find((x) => x.id === item.id);
      if (v && onSelectVehicle) onSelectVehicle(v);
    } else if (item.type === 'clothing') {
      const c = availableClothing.find((x) => x.id === item.id);
      if (c && onSelectClothing) onSelectClothing(c);
    } else if (item.type === 'sports_turf') {
      const s = availableSportsTurfs.find((x) => x.id === item.id);
      if (s && onSelectSportsTurf) onSelectSportsTurf(s);
    } else if (item.type === 'general') {
      const g = availableGeneralItems.find((x) => x.id === item.id);
      if (g && onSelectGeneralItem) onSelectGeneralItem(g);
    } else if (item.type === 'hotel') {
      const h = availableHotels.find((x) => x.id === item.id);
      if (h && onSelectHotel) onSelectHotel(h);
    } else if (item.type === 'restaurant') {
      const r = availableRestaurants.find((x) => x.id === item.id);
      if (r && onSelectRestaurant) onSelectRestaurant(r);
    } else if (item.type === 'library') {
      const l = availableLibraries.find((x) => x.id === item.id);
      if (l && onSelectLibrary) onSelectLibrary(l);
    }
  };

  // Quick Preset Requirements
  const quickAssetOptions = [
    { label: '🚗 Creta Car (Self-Drive)', query: 'Hyundai Creta Car Rental', defaultLoc: 'Gurgaon', defaultBudget: 2800 },
    { label: '🏍️ Royal Enfield Bike', query: 'Royal Enfield Hunter 350 Bike', defaultLoc: 'Bangalore', defaultBudget: 999 },
    { label: '👗 Bridal Lehenga', query: 'Bridal Raw Silk Lehenga Choli Set', defaultLoc: 'Jaipur', defaultBudget: 2500 },
    { label: '👔 Groom Sherwani', query: 'Royal Velvet Groom Sherwani with Dupatta', defaultLoc: 'Delhi', defaultBudget: 1800 },
    { label: '🏏 Box Cricket Turf', query: 'Box Cricket Turf & Floodlight Ground', defaultLoc: 'Udaipur', defaultBudget: 800 },
    { label: '🎮 PS5 Console', query: 'PS5 Gaming Console Bundle', defaultLoc: 'Delhi', defaultBudget: 850 },
    { label: '🏠 2 BHK Flat', query: '2 BHK Furnished Flat for Rent', defaultLoc: 'Bangalore', defaultBudget: 28000 },
    { label: '🛏️ Student PG Room', query: 'Student PG Room with Food & WiFi', defaultLoc: 'Kota', defaultBudget: 8500 }
  ];

  const popularCities = ['Jaipur', 'Udaipur', 'Bangalore', 'Delhi', 'Gurgaon', 'Mumbai', 'Pune', 'Hyderabad', 'Kota'];

  const quickChatChips = [
    '🏠 2 BHK Flat in Jaipur',
    '🚗 Thar Self-Drive Rent',
    '❄️ AC & Fridge Rental Rates',
    '👗 Bridal Lehenga & Sherwani',
    '⚽ Cricket Turf Hourly Rate',
    '📚 24/7 Library Study Pass',
    '🏨 Hotel Room Tariffs',
    '📱 Booking Kaise Karein?',
    '🔒 Security Deposit Refund Rules',
    '🤝 Zero Brokerage Direct Contact'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Luxury White Background, Black Text & Golden Accents Container */}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-blue-500/40 overflow-hidden my-4 text-slate-900 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Dark Slate & Blue Top Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white relative shrink-0 border-b border-blue-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Close AI Help"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white rounded-2xl shadow-md font-black ring-4 ring-blue-500/20">
              <Sparkles className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Recko-India AI Assistant
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Smart Match & 24/7 Chat
                </span>
              </div>
              <p className="text-slate-300 text-xs font-medium mt-0.5">
                AI-powered rental recommendations and 24/7 concierge support across India.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs (Black & Blue) */}
          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Smart Match Advisor</span>
            </button>

            <button
              onClick={() => setActiveTab('concierge')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'concierge'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-black shadow-md shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>24/7 AI Concierge Chat</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SMART MATCH ADVISOR */}
        {/* ========================================================================= */}
        {activeTab === 'advisor' && (
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-white text-slate-900 custom-scrollbar">
            
            {/* Quick Preset Asset Chips */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-amber-400/30">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                <Tag className="h-3.5 w-3.5 text-amber-500" />
                <span>Quick Rental Presets (One-Tap Search):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickAssetOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setWhatYouWant(opt.query);
                      setLocation(opt.defaultLoc);
                      setBudget(opt.defaultBudget);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white text-slate-800 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer shadow-2xs"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdvisorSubmit} className="space-y-3.5">
              
              {/* Field 1: What You Want */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <span>1. What rental asset do you want? (Kya chahiye?)</span>
                </label>
                <input
                  type="text"
                  value={whatYouWant}
                  onChange={(e) => setWhatYouWant(e.target.value)}
                  placeholder="e.g. Creta Car, Royal Enfield Bike, Wedding Lehenga, Sherwani, Cricket Turf, 2 BHK Flat"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Field 2: Location */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <span>2. Location / City (Exact Location Matching)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Udaipur, Bangalore, Gurgaon, Delhi NCR, Pune, Mumbai, Kota"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  required
                />
                {/* Popular Cities Pills */}
                <div className="flex items-center space-x-1 mt-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Popular:</span>
                  {popularCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setLocation(c)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer shrink-0 ${
                        location.toLowerCase() === c.toLowerCase()
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Price / Budget */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <IndianRupee className="h-4 w-4 text-amber-500" />
                    <span>3. Budget / Target Price (₹)</span>
                  </label>
                  <span className="text-xs font-bold text-amber-800 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-400/40 font-mono">
                    ₹{budget.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-8">
                    <input
                      type="range"
                      min={300}
                      max={100000}
                      step={100}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-center space-x-1">
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2 font-medium">
                  <HelpCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.005] text-xs border border-blue-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>AI Matching Rentals in {location || 'India'}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-slate-950" />
                    <span>Find Verified Matches with AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Results Section */}
            {result && (
              <div className="space-y-3.5 pt-3 border-t border-slate-200 animate-in fade-in duration-300">
                
                {/* Verdict Header Badge */}
                <div className="flex justify-between items-center bg-amber-500/10 border border-amber-400/40 p-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-amber-900 text-xs">
                      {result.verdict || '✅ Recommended Matches'}
                    </span>
                  </div>
                  <button
                    onClick={() => setResult(null)}
                    className="text-[11px] font-bold text-amber-700 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Conversational AI Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>AI Advisor Analysis:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {result.summary}
                  </p>
                </div>

                {/* Key Factors */}
                {result.keyFactors && result.keyFactors.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 block">
                      📌 Key Rental Factors:
                    </span>
                    <ul className="space-y-1">
                      {result.keyFactors.map((kf, i) => (
                        <li key={i} className="text-[11px] text-slate-700 font-medium flex items-start space-x-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{kf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pro Tip */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start space-x-2.5">
                  <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950 text-[11px] block">
                      💡 Bargaining & Savings Tip:
                    </span>
                    <p className="text-[11px] text-emerald-800 font-medium leading-normal mt-0.5">
                      {result.budgetTips}
                    </p>
                  </div>
                </div>

                {/* Matched Cards */}
                {matchedItems.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center justify-between">
                      <span>🎯 Top Recommended Asset Matches ({matchedItems.length}):</span>
                    </h4>

                    <div className="space-y-2">
                      {matchedItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="bg-white border border-slate-200 hover:border-amber-500 p-3 rounded-2xl shadow-xs hover:shadow-md cursor-pointer transition-all flex items-center space-x-3 group"
                        >
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span className={`text-[9px] font-bold px-2 py-0.2 rounded-md border ${item.badgeColor}`}>
                                {item.categoryDisplay}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                {item.city}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-600">
                              {item.title}
                            </h5>

                            <p className="text-[11px] text-slate-500 truncate flex items-center space-x-1 mt-0.5 font-medium">
                              <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                              <span>{item.fullLocation || item.location}</span>
                            </p>

                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs font-black text-amber-700">
                                ₹{(item.price || 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {item.priceUnit}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1 shrink-0 shadow-xs cursor-pointer"
                          >
                            <span>View / Book</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 24/7 AI CONCIERGE CHAT */}
        {/* ========================================================================= */}
        {activeTab === 'concierge' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-white text-slate-900">
            {/* Quick Chat Suggestion Chips & Clear Chat Toolbar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar min-w-0">
                <span className="text-[10px] font-bold text-slate-400 shrink-0">Suggested:</span>
                {quickChatChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSendChat(undefined, chip);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white text-slate-800 border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              {chatMessages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear AI chat history and start fresh?')) {
                      setChatMessages([
                        {
                          role: 'assistant',
                          text: 'Namaste! Main Recko-India ka 24/7 Smart AI Assistant hoon.\n\nAap mujhse Flats, Student PGs, Self-Drive Cars/Bikes, TV/Fridge/AC, Wedding Outfits, Turfs ya Hotels ke bare me **kuch bhi** pooch sakte hain!\n\n💡 Try asking:\n• *"Jaipur me 2 BHK flat dikhao"*\n• *"AC ya Fridge rent par kitne ka milega?"*\n• *"Thar rent lene ke rules kya hain?"*\n• *"Booking kaise karein aur owner ka number kaise milega?"*',
                          time: 'Just now'
                        }
                      ]);
                      try {
                        localStorage.removeItem('renthub_ai_concierge_chat');
                      } catch {}
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center space-x-1 transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Clear chat history"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear Chat</span>
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white font-bold rounded-tr-xs shadow-xs'
                        : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-xs font-medium'
                    }`}
                  >
                    <div className="space-y-1">
                      {msg.text.split('\n').map((line, lineIdx) => {
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={lineIdx} className={line === '' ? 'h-2' : ''}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong
                                    key={pIdx}
                                    className={`font-black ${
                                      msg.role === 'user' ? 'text-amber-300' : 'text-amber-700'
                                    }`}
                                  >
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/50 text-[10px]">
                      <span className={msg.role === 'user' ? 'text-slate-300' : 'text-slate-400 font-medium'}>
                        {msg.time}
                      </span>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const clean = msg.text.replace(/[*_#`~]/g, '');
                                const ut = new SpeechSynthesisUtterance(clean.slice(0, 300));
                                ut.lang = 'hi-IN';
                                window.speechSynthesis.speak(ut);
                              }
                            }}
                            className="text-slate-400 hover:text-amber-600 font-bold flex items-center space-x-0.5 cursor-pointer"
                            title="Listen to Voice Readout"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>Listen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text);
                              alert('📋 Concierge response copied to clipboard!');
                            }}
                            className="text-slate-400 hover:text-amber-600 font-bold flex items-center space-x-0.5 cursor-pointer"
                            title="Copy Answer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold border border-slate-700">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 p-2 font-medium">
                  <Bot className="h-4 w-4 text-amber-500 animate-spin" />
                  <span className="animate-pulse">Recko-India AI is thinking...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Poochiye flats, cars, AC/TV, turfs, hotels ya booking rules ke bare me..."
                className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Send className="h-4 w-4 text-slate-950" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
