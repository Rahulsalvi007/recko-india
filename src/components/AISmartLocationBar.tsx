import React, { useState } from 'react';
import { Sparkles, MapPin, Search } from 'lucide-react';
import { parseAINaturalSearch, ParsedAISearch } from '../utils/aiLocationEngine';

interface AISmartLocationBarProps {
  onAISearchApplied: (parsed: ParsedAISearch) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const POPULAR_CITIES = [
  'All Cities',
  'Udaipur',
  'Jaipur',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Kota',
  'Pune',
  'Hyderabad',
  'Indore',
  'Noida',
  'Gurgaon',
  'Chandigarh'
];

export const AISmartLocationBar: React.FC<AISmartLocationBarProps> = ({
  onAISearchApplied,
  selectedCity,
  setSelectedCity
}) => {
  const [requirementText, setRequirementText] = useState('');

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = `${selectedCity && selectedCity !== 'All Cities' ? selectedCity + ' ' : ''}${requirementText}`.trim();
    const parsed = parseAINaturalSearch(query || 'rentals');
    if (selectedCity && selectedCity !== 'All Cities') {
      parsed.detectedCity = selectedCity;
    }
    onAISearchApplied(parsed);
  };

  const handleQuickPreset = (cityName: string, requirement: string) => {
    setSelectedCity(cityName);
    setRequirementText(requirement);
    const query = `${cityName} ${requirement}`;
    const parsed = parseAINaturalSearch(query);
    parsed.detectedCity = cityName;
    onAISearchApplied(parsed);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm mb-8 text-slate-900 dark:text-zinc-100">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100">
              AI Smart Search Engine
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              Select City & tell AI what you need (e.g. 2 BHK, Girls PG, Bike, Hotel)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-full hidden sm:inline">
          ⚡ RECKO AI 2.0
        </span>
      </div>

      {/* Simplified City + What You Want Form */}
      <form onSubmit={handleExecuteSearch} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* 1. City Dropdown */}
          <div className="md:col-span-4 relative">
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-zinc-500 mb-1 tracking-wider">
              1. Select City / Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <select
                value={selectedCity || 'All Cities'}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-black text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer appearance-none"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All Cities' ? '📍 All Cities (India)' : `📍 ${c}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. What You Want Input */}
          <div className="md:col-span-6">
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 dark:text-zinc-500 mb-1 tracking-wider">
              2. What do you need? (Requirement)
            </label>
            <input
              type="text"
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              placeholder='e.g. "2 BHK Flat under ₹12,000", "Girls PG", "Royal Enfield", "Library"'
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>

          {/* 3. Search Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Search className="h-4 w-4 stroke-[2.5]" />
              <span>AI Search</span>
            </button>
          </div>

        </div>
      </form>

      {/* Quick Prompts */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider mr-1">
          Quick Search:
        </span>

        <button
          onClick={() => handleQuickPreset('Udaipur', '1 BHK Flat under 8000')}
          className="bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] cursor-pointer transition-colors"
        >
          📍 Udaipur 1 BHK &lt; ₹8,000
        </button>

        <button
          onClick={() => handleQuickPreset('Jaipur', 'Girls PG near College')}
          className="bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] cursor-pointer transition-colors"
        >
          👧 Jaipur Girls PG
        </button>

        <button
          onClick={() => handleQuickPreset('Bangalore', 'Bike Rental per day')}
          className="bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] cursor-pointer transition-colors"
        >
          🏍️ Bangalore Bike Rental
        </button>

        <button
          onClick={() => handleQuickPreset('Kota', 'Silent AC Library Pass')}
          className="bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-zinc-300 font-semibold px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] cursor-pointer transition-colors"
        >
          📚 Kota Study Space
        </button>
      </div>

    </div>
  );
};
