import React, { useState } from 'react';
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
  Navigation
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
  const [radius, setRadius] = useState<string>('10 km');
  const [budgetLabel, setBudgetLabel] = useState<string>('₹ 0 - ₹ 2,50,000+');

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
    setBudgetLabel(val);
    if (val.includes('10,000')) setMaxBudget(10000);
    else if (val.includes('25,000')) setMaxBudget(25000);
    else if (val.includes('50,000')) setMaxBudget(50000);
    else setMaxBudget(250000);
  };

  return (
    <div className="w-full bg-[#FAF8F5] dark:bg-zinc-950 text-slate-900 dark:text-white pt-6 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HERO BANNER CARD */}
        <div className="relative bg-gradient-to-r from-slate-50 via-amber-50/30 to-slate-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 shadow-xl min-h-[440px] flex items-center">
          
          {/* Background Building Image (Right Aligned with Soft Gradient Blend) */}
          <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full pointer-events-none z-0">
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
              alt="Modern Residential Apartment Building"
              className="w-full h-full object-cover object-center opacity-90 dark:opacity-80"
            />
            {/* Smooth Left Gradient Blend Mask */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-zinc-900 dark:via-zinc-900/80 dark:to-transparent" />
            
            {/* Pinned Badge on Building */}
            <div className="absolute top-8 right-8 z-10 hidden sm:block">
              <button
                type="button"
                onClick={onOpenRadar}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg border border-amber-300 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-300 cursor-pointer hover:scale-105 transition-all"
              >
                <MapPin className="h-4 w-4 text-slate-950 fill-slate-950" />
                <span>Find Properties Within 5 - 50 km</span>
              </button>
            </div>
          </div>

          {/* Left Content Area */}
          <div className="relative z-10 w-full lg:w-3/5 p-6 sm:p-10 space-y-6">
            
            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Recko <span className="text-amber-500">India</span>
              </h1>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-zinc-200 mt-1">
                Your Perfect Rental Partner
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-2 font-medium max-w-md leading-relaxed">
                Find the perfect property, PG, hostel, or vehicle near you with ease.
              </p>
            </div>

            {/* Properties vs Vehicles Toggle Pills */}
            <div className="flex items-center space-x-2 bg-slate-200/80 dark:bg-zinc-800 p-1 rounded-2xl w-fit border border-slate-300/60 dark:border-zinc-700">
              <button
                onClick={() => {
                  setHeroTab('properties');
                  setActiveCategory('residential');
                  setSelectedSubType('ALL');
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  heroTab === 'properties' && activeCategory !== 'vehicle'
                    ? 'bg-zinc-950 text-white shadow-md'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
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
                    ? 'bg-zinc-950 text-white shadow-md'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Vehicles</span>
              </button>
            </div>

            {/* Search Filter Card */}
            <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-bold text-slate-800 dark:text-zinc-200">
              
              {/* Location Select Dropdown */}
              <div className="sm:col-span-3 bg-slate-50 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                  Location
                </label>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <select
                    value={selectedCity || 'All Cities'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCity(val === 'All Cities' ? '' : val);
                    }}
                    className="w-full bg-transparent font-black text-xs text-slate-900 dark:text-white outline-hidden cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Radius Dropdown */}
              <div className="sm:col-span-2 bg-slate-50 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                  Radius
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full bg-transparent font-black text-xs text-slate-900 dark:text-white outline-hidden cursor-pointer"
                >
                  <option value="5 km">5 km</option>
                  <option value="10 km">10 km</option>
                  <option value="25 km">25 km</option>
                  <option value="50 km">50 km</option>
                </select>
              </div>

              {/* Property / Vehicle Type Dropdown */}
              <div className="sm:col-span-3 bg-slate-50 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                  Category Type
                </label>
                <select
                  value={selectedSubType}
                  onChange={(e) => setSelectedSubType(e.target.value)}
                  className="w-full bg-transparent font-black text-xs text-slate-900 dark:text-white outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="flat">Flats / Apartments</option>
                  <option value="house">Independent House</option>
                  <option value="pg">PG & Hostels</option>
                  <option value="villa">Luxury Villas</option>
                  <option value="shop">Shops & Showrooms</option>
                  <option value="office">Offices</option>
                  <option value="bike">Bikes & Scooters</option>
                  <option value="car">Self-Drive Cars</option>
                </select>
              </div>

              {/* Budget Range Dropdown */}
              <div className="sm:col-span-2 bg-slate-50 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                  Budget
                </label>
                <select
                  value={budgetLabel}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="w-full bg-transparent font-black text-xs text-slate-900 dark:text-white outline-hidden cursor-pointer"
                >
                  <option value="₹ 0 - ₹ 2,50,000+">All Budgets</option>
                  <option value="₹ 0 - ₹ 10,000">₹ 0 - ₹ 10,000</option>
                  <option value="₹ 0 - ₹ 25,000">₹ 0 - ₹ 25,000</option>
                  <option value="₹ 0 - ₹ 50,000">₹ 0 - ₹ 50,000</option>
                </select>
              </div>

              {/* Golden Yellow Search Button */}
              <div className="sm:col-span-2 flex items-center">
                <button
                  onClick={() => {
                    if (searchQuery.trim() === '') {
                      setSelectedSubType('ALL');
                    }
                  }}
                  className="w-full h-full min-h-[42px] bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer border border-amber-300"
                >
                  <Search className="h-4 w-4 stroke-[3]" />
                  <span>Search Now</span>
                </button>
              </div>
            </div>

            {/* Smart Finder AI Black Bar */}
            <div className="bg-zinc-950 text-white p-3.5 rounded-2xl border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 shrink-0">
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-amber-400 block sm:inline mr-2">
                    Smart Finder AI
                  </span>
                  <span className="text-[11px] text-zinc-300 font-medium">
                    Describe what you want in natural language and AI will find the best options for you.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN CATEGORY NAVIGATION ROW */}
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
                  ? 'bg-zinc-950 dark:bg-amber-400 text-white dark:text-zinc-950 border-zinc-900 dark:border-amber-300 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* QUICK CATEGORY ICON CARDS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {quickCategories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(cat.cat);
                setSelectedSubType(cat.subType);
                setSearchQuery('');
              }}
              className={`bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-zinc-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group ${
                activeCategory === cat.cat && selectedSubType === cat.subType ? 'ring-2 ring-amber-400 bg-amber-50/50 dark:bg-zinc-800' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-amber-100/60 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-zinc-200 tracking-tight">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
