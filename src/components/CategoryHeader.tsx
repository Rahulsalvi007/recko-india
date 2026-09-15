import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Home,
  Building,
  GraduationCap,
  Car,
  Bike,
  Store,
  Briefcase,
  Key,
  Sparkles,
  ChevronDown,
  Navigation,
  ShieldCheck,
  Clock,
  Shield,
  Mic
} from 'lucide-react';
import { MainCategory } from '../types';

interface CategoryHeaderProps {
  activeCategory: MainCategory;
  setActiveCategory: (cat: MainCategory) => void;
  selectedSubType: string;
  setSelectedSubType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  maxBudget: number;
  setMaxBudget: (b: number) => void;
  furnishingFilter: string;
  setFurnishingFilter: (f: string) => void;
  selectedCollege: string;
  setSelectedCollege: (c: string) => void;
  studentViewTab: 'properties' | 'roommates';
  setStudentViewTab: (tab: 'properties' | 'roommates') => void;
  driverFilter: boolean;
  setDriverFilter: (d: boolean) => void;
  onOpenRadar?: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  activeCategory,
  setActiveCategory,
  selectedSubType,
  setSelectedSubType,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  maxBudget,
  setMaxBudget,
  studentViewTab,
  setStudentViewTab,
  driverFilter,
  setDriverFilter,
  onOpenRadar
}) => {
  const [heroTab, setHeroTab] = useState<'properties' | 'vehicles'>(activeCategory === 'vehicle' ? 'vehicles' : 'properties');
  const [isListening, setIsListening] = useState(false);
  const [selectedBudgetLabel, setSelectedBudgetLabel] = useState<string>('Any Budget');

  const handleStartVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('🎙️ Voice Search is supported on Google Chrome, Edge, and modern browsers.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented by browser:', err);
        });
      }
    }
  }, [activeCategory, heroTab]);

  const CITIES = ['All Cities', 'Udaipur, Rajasthan', 'Bangalore', 'Delhi', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Gurgaon'];

  const quickCategories = [
    { label: 'Houses', icon: <Home className="h-5 w-5 text-amber-500" />, cat: 'residential' as MainCategory, subType: 'house' },
    { label: 'Flats', icon: <Building className="h-5 w-5 text-amber-500" />, cat: 'residential' as MainCategory, subType: 'flat' },
    { label: 'PG', icon: <Home className="h-5 w-5 text-amber-500" />, cat: 'residential' as MainCategory, subType: 'pg' },
    { label: 'Hostels', icon: <GraduationCap className="h-5 w-5 text-amber-500" />, cat: 'student' as MainCategory, subType: 'hostel' },
    { label: 'Rooms', icon: <Key className="h-5 w-5 text-amber-500" />, cat: 'residential' as MainCategory, subType: 'room' },
    { label: 'Villas', icon: <Home className="h-5 w-5 text-amber-500" />, cat: 'residential' as MainCategory, subType: 'villa' },
    { label: 'Shops', icon: <Store className="h-5 w-5 text-amber-500" />, cat: 'commercial' as MainCategory, subType: 'shop' },
    { label: 'Offices', icon: <Briefcase className="h-5 w-5 text-amber-500" />, cat: 'commercial' as MainCategory, subType: 'office' },
    { label: 'Bikes', icon: <Bike className="h-5 w-5 text-amber-500" />, cat: 'vehicle' as MainCategory, subType: 'bike' },
    { label: 'Scooters', icon: <Bike className="h-5 w-5 text-amber-500" />, cat: 'vehicle' as MainCategory, subType: 'scooter' },
  ];

  const mainCategoryTabs = [
    { id: 'all' as MainCategory, label: '🌟 All Assets', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'residential' as MainCategory, label: 'Properties', icon: <Home className="h-4 w-4" /> },
    { id: 'commercial' as MainCategory, label: 'Commercial', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'student' as MainCategory, label: 'Student PG', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'vehicle' as MainCategory, label: 'Vehicles', icon: <Car className="h-4 w-4" /> },
    { id: 'hotel' as MainCategory, label: 'Hotels', icon: <Building className="h-4 w-4" /> },
    { id: 'restaurant' as MainCategory, label: 'Dining', icon: <Store className="h-4 w-4" /> },
    { id: 'library' as MainCategory, label: 'Libraries', icon: <Key className="h-4 w-4" /> },
    { id: 'clothing' as MainCategory, label: 'Outfits', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'sports_turf' as MainCategory, label: 'Sports Turfs', icon: <Navigation className="h-4 w-4" /> },
    { id: 'general' as MainCategory, label: 'Appliances', icon: <Store className="h-4 w-4" /> },
  ];

  const handleBudgetChange = (val: string) => {
    setSelectedBudgetLabel(val);
    if (val.includes('10,000')) setMaxBudget(10000);
    else if (val.includes('25,000')) setMaxBudget(25000);
    else if (val.includes('50,000')) setMaxBudget(50000);
    else setMaxBudget(250000);
  };

  const getHeroBgImage = (category: MainCategory, tab: string) => {
    if (category === 'all') {
      return 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Grand Masterpiece Luxury Estate with Infinity Pool & Panoramic Skyline
    }
    if (category === 'vehicle' || tab === 'vehicles') {
      return 'https://images.pexels.com/photos/18503513/pexels-photo-18503513.jpeg'; // Dark Cinematic Luxury Black Sedan
    }
    if (category === 'restaurant') {
      return 'https://media.istockphoto.com/id/528134869/photo/night-view-of-placa-reial.jpg?s=1024x1024&w=is&k=20&c=KDM_c5ST2_LnPXCgu0my_u4uhd6t3lwRCJaCVhg-VPw='; // Gourmet Dining Table Feast
    }
    if (category === 'commercial' || category === 'general') {
      return 'https://images.unsplash.com/photo-1562813733-b31f71025d54?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Office Desktop Essentials Flatlay
    }
    if (category === 'library') {
      return 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80'; // Vintage Grand Wooden Library
    }
    if (category === 'hotel') {
      return 'https://media.istockphoto.com/id/472899538/photo/downtown-cleveland-hotel-entrance-and-waiting-taxi-cab.jpg?s=1024x1024&w=is&k=20&c=ryknwrnjVy-mkmHvN-6lG2my5hbpDn2h3AHa76_BX28=';
    }
    if (category === 'clothing') {
      return 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    }
    if (category === 'sports_turf') {
      return 'https://media.istockphoto.com/id/172939385/photo/three-10k-runners-in-motion.jpg?s=1024x1024&w=is&k=20&c=-wCcqttMEz--HWJUnrzgpkY6ICCpzHgNcBHXA3Tb2jk=';
    }
    // Default Heritage Castle Villa / Property:
    return 'https://images.pexels.com/photos/38765009/pexels-photo-38765009.jpeg';
  };

  return (
    <div className="w-full bg-[#FAF8F5] dark:bg-zinc-950 text-slate-900 dark:text-white pt-4 sm:pt-6 pb-6 sm:pb-8 transition-colors max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* HERO BANNER CARD WITH DYNAMIC CATEGORY BACKGROUND ARCHITECTURE */}
        <div className="relative bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-900 text-white rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl min-h-fit sm:min-h-[460px] flex items-center transition-all duration-500">
          
          {/* Dynamic Background Image per Category (80% Opacity with Slow Motion Effect) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              key={`${activeCategory}-${heroTab}`}
              src={getHeroBgImage(activeCategory, heroTab)}
              alt={`${activeCategory} Category Background`}
              className="w-full h-full object-cover object-center animate-slow-motion transition-transform duration-1000 ease-out hover:scale-100"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Soft Transparent Mask for Text Legibility while keeping image 80% visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent to-slate-950/30 pointer-events-none" />

            {/* Pinned Radar Badge on Building */}
            <div className="absolute top-6 right-6 z-10 hidden sm:block pointer-events-auto">
              <button
                type="button"
                onClick={onOpenRadar}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-blue-400 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-300 cursor-pointer hover:scale-105 transition-all"
              >
                <MapPin className="h-4 w-4 text-white fill-white" />
                <span>Find Assets Within 5 - 50 km Radar</span>
              </button>
            </div>
          </div>

          {/* Left Content Area */}
          <div className="relative z-10 w-full lg:w-3/5 p-4 sm:p-8 lg:p-10 space-y-4 sm:space-y-6">
            
            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none drop-shadow-lg">
                Recko <span className="text-yellow-400 font-black">India</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 drop-shadow-md">
                Your Perfect Rental Partner
              </h2>
              <p className="text-xs sm:text-sm text-white font-bold mt-2 max-w-md leading-relaxed drop-shadow-md">
                Find the perfect property, PG, hostel, luxury villa, or vehicle near you with ease.
              </p>
            </div>

            {/* Properties vs Vehicles Toggle Pills */}
            <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl w-fit border border-zinc-800 shadow-inner">
              <button
                onClick={() => {
                  setHeroTab('properties');
                  setActiveCategory('residential');
                  setSelectedSubType('ALL');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  heroTab === 'properties' && activeCategory !== 'vehicle'
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Properties</span>
              </button>

              <button
                onClick={() => {
                  setHeroTab('vehicles');
                  setActiveCategory('vehicle');
                  setSelectedSubType('ALL');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  heroTab === 'vehicles' || activeCategory === 'vehicle'
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Vehicles</span>
              </button>
            </div>

            {/* Clean High-Contrast Single Unified Search Bar */}
            <div className="bg-white dark:bg-zinc-900 p-2 sm:p-2.5 rounded-3xl border border-slate-300 dark:border-zinc-700 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              
            {/* Main Search Input Field (Light Background, Black High-Contrast Text) */}
            <div className="flex-1 flex items-center space-x-3 px-4 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-300 dark:border-zinc-700 w-full shadow-inner">
              <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" />
              <input
                type="text"
                placeholder={isListening ? '🎙️ Listening... Speak now in Hindi or English...' : 'Search 2 BHK flat, Creta car, Sherwani, PG, Turf, Hotel near you...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 outline-none"
              />
              <button
                type="button"
                onClick={handleStartVoiceSearch}
                className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-1 shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse border-rose-400 font-bold'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-400/40 hover:bg-blue-600 hover:text-white font-bold'
                }`}
                title="Voice Search (Speak Hindi or English)"
              >
                <Mic className="h-4 w-4" />
                <span className="text-[10px] font-black hidden sm:inline">{isListening ? 'Listening' : 'Voice'}</span>
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-500 hover:text-slate-950 dark:hover:text-white font-black text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

              {/* City Location Text Box Input (Light Background, High Contrast) */}
              <div className="flex items-center space-x-2 px-3.5 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-300 dark:border-zinc-700 shrink-0 w-full sm:w-48 shadow-inner">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" />
                <input
                  type="text"
                  placeholder="Enter City / Area..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent font-black text-xs text-slate-950 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 outline-none"
                />
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => setSelectedCity('')}
                    className="text-slate-500 hover:text-slate-950 dark:hover:text-white font-black text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* High-Contrast Bright Blue Search Button */}
              <button
                type="button"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer border border-blue-400 shrink-0 hover:scale-102 active:scale-98"
              >
                <Search className="h-4 w-4 stroke-[3]" />
                <span>Search</span>
              </button>
            </div>

            {/* Smart Finder AI Black Bar */}
            <div className="bg-zinc-950 text-white p-3.5 rounded-2xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 shrink-0">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-yellow-400 block sm:inline mr-2">
                    Smart Finder AI
                  </span>
                  <span className="text-[11px] text-white font-semibold">
                    Describe what you want in natural language and AI will find the best options for you.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN CATEGORY NAVIGATION ROW (High Contrast Black Text & Strong Border) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {mainCategoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setSelectedSubType('ALL');
                setSearchQuery('');
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer border ${
                activeCategory === tab.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 text-slate-950 dark:text-white border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-xs'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* RECKO INDIA PREMIUM HIGHLIGHTS & TRUST BADGE SHOWCASE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-3.5 hover-lift hover-glow-amber cursor-pointer group">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">0% Brokerage Guarantee</h5>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">100% Verified Direct Owners</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-3.5 hover-lift hover-glow-amber cursor-pointer group">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              <Clock className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">Flexible Rent Duration</h5>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">Hourly, Daily & Monthly Stays</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-3.5 hover-lift hover-glow-indigo cursor-pointer group">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
              <Shield className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">NPCI Escrow & Live GPS</h5>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">Safe UPI + Telematics Tracking</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center space-x-3.5 hover-lift hover-glow-amber cursor-pointer group">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform shrink-0">
              <Sparkles className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">AI Smart Recommender</h5>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">Intelligent Search & Match</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
