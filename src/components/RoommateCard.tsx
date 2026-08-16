import React from 'react';
import {
  GraduationCap,
  MapPin,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Moon,
  Sun,
  Utensils,
  BookOpen
} from 'lucide-react';
import { RoommateProfile } from '../types';

interface RoommateCardProps {
  profile: RoommateProfile;
  onConnect: (profile: RoommateProfile) => void;
  index?: number;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ profile, onConnect, index = 0 }) => {
  return (
    <div
      className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4 hover:-translate-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div>
        {/* Header with Avatar & Student Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-14 w-14 rounded-2xl object-cover border-2 border-zinc-800 dark:border-zinc-700 shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-base">{profile.name}</h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">({profile.age})</span>
              </div>
              <p className="text-xs text-indigo-900 dark:text-indigo-300 font-bold flex items-center space-x-1 mt-0.5">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span className="truncate max-w-[180px]">{profile.college}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {profile.course} • {profile.year}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            {profile.distanceKm !== undefined && (
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center space-x-1 shrink-0 shadow-2xs">
                <MapPin className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                <span>{profile.distanceKm} km nearby</span>
              </span>
            )}
            {profile.studentVerified && (
              <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center space-x-1 shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>VERIFIED</span>
              </span>
            )}
          </div>
        </div>

        {/* Budget & Target Location */}
        <div className="mt-4 bg-slate-50 dark:bg-zinc-800/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs border border-slate-100 dark:border-zinc-700">
          <div>
            <span className="text-slate-400 dark:text-zinc-400 font-medium block">Max Budget</span>
            <span className="font-black text-zinc-800 dark:text-zinc-100 text-sm">
              ₹{profile.budgetPerMonth.toLocaleString('en-IN')}/mo
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-400 font-medium block">Preferred Area</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 truncate block">
              {profile.preferredLocation}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 dark:text-zinc-300 mt-3 line-clamp-2 leading-relaxed">
          "{profile.bio}"
        </p>

        {/* Habit Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] font-medium">
          <span className="bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
            <Utensils className="h-3 w-3" />
            <span>{profile.diet}</span>
          </span>
          <span className="bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md flex items-center space-x-1">
            {profile.sleepSchedule === 'Early Riser' ? (
              <Sun className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            ) : (
              <Moon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            )}
            <span>{profile.sleepSchedule}</span>
          </span>
          <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
            {profile.smoking ? 'Smoker' : 'Non-Smoker'}
          </span>
          <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
            {profile.petsAllowed ? 'Pet Friendly' : 'No Pets'}
          </span>
        </div>

        {/* Hobbies */}
        <div className="mt-3 flex flex-wrap gap-1">
          {profile.hobbies.map((h, i) => (
            <span key={i} className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold px-2 py-0.5 rounded-md">
              #{h}
            </span>
          ))}
        </div>
      </div>

      {/* Connect Button */}
      <button
        onClick={() => onConnect(profile)}
        className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
      >
        <MessageSquare className="h-4 w-4 text-white" />
        <span>Chat & Match with {profile.name.split(' ')[0]}</span>
      </button>
    </div>
  );
};
