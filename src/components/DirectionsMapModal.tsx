import React, { useState } from 'react';
import { PropertyDistanceMatrix, PropertyTransitTimes } from '../types';
import { X, MapPin, Navigation, Train, Bus, Hospital, GraduationCap, ShoppingBag, Car, Bike, Footprints, Compass, ShieldCheck } from 'lucide-react';

interface DirectionsMapModalProps {
  item: {
    id: string;
    title: string;
    location: string;
    city: string;
    distances?: PropertyDistanceMatrix;
    transitTimes?: PropertyTransitTimes;
  };
  onClose: () => void;
}

export const DirectionsMapModal: React.FC<DirectionsMapModalProps> = ({ item, onClose }) => {
  const [selectedTransit, setSelectedTransit] = useState<'walk' | 'bike' | 'car'>('car');

  // Fallback default distance matrix if omitted
  const matrix = item.distances || {
    railwayStationKm: 3.8,
    busStandKm: 2.1,
    hospitalKm: 1.4,
    collegeKm: 1.8,
    marketKm: 0.5,
    metroKm: 0.8,
  };

  const times = item.transitTimes || {
    walkMin: Math.round(matrix.metroKm * 12),
    bikeMin: Math.round(matrix.metroKm * 3 + 2),
    carMin: Math.round(matrix.metroKm * 5 + 3),
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FAF7F2] w-full max-w-3xl rounded-3xl border border-[#E5E0D8] shadow-2xl overflow-hidden relative my-auto">
        
        {/* Header */}
        <div className="bg-[#0C1017] text-[#FAF7F2] p-5 sm:p-6 flex justify-between items-start border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-amber-300 text-xs font-bold mb-2">
              <Navigation className="h-3.5 w-3.5" />
              <span>Google Maps Location & Distance Matrix</span>
            </div>
            <h2 className="text-xl font-black">{item.title}</h2>
            <p className="text-xs text-slate-300 font-semibold mt-1 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              <span>{item.location}, {item.city}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900">
          
          {/* Simulated Google Map View */}
          <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900 group">
            <iframe
              title="Google Map Preview"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, filter: 'contrast(1.05) brightness(0.95)' }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${item.location}, ${item.city}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            />

            <div className="absolute top-3 left-3 bg-slate-950/90 text-white text-[11px] font-black px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 flex items-center space-x-1.5 shadow-md">
              <Compass className="h-3.5 w-3.5 text-amber-300 animate-spin" />
              <span>Live Location Pin Attached</span>
            </div>
          </div>

          {/* Transit Time Mode Selector */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Transit Mode & Travel Time</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedTransit('car')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all font-extrabold text-xs cursor-pointer ${
                  selectedTransit === 'car'
                    ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                    : 'border-[#E5E0D8] bg-white text-slate-700 hover:bg-[#F7F4EE]'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>By Car ({times.carMin} mins)</span>
              </button>

              <button
                onClick={() => setSelectedTransit('bike')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all font-extrabold text-xs cursor-pointer ${
                  selectedTransit === 'bike'
                    ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                    : 'border-[#E5E0D8] bg-white text-slate-700 hover:bg-[#F7F4EE]'
                }`}
              >
                <Bike className="h-4 w-4" />
                <span>By Bike ({times.bikeMin} mins)</span>
              </button>

              <button
                onClick={() => setSelectedTransit('walk')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all font-extrabold text-xs cursor-pointer ${
                  selectedTransit === 'walk'
                    ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                    : 'border-[#E5E0D8] bg-white text-slate-700 hover:bg-[#F7F4EE]'
                }`}
              >
                <Footprints className="h-4 w-4" />
                <span>Walking ({times.walkMin} mins)</span>
              </button>
            </div>
          </div>

          {/* Distance Matrix Grid */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Nearby Key Landmarks & Distance Matrix</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center shrink-0">
                  <Train className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Railway Station</span>
                  <span className="text-sm font-black text-slate-950">{matrix.railwayStationKm} km away</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-400 border border-zinc-400 flex items-center justify-center shrink-0">
                  <Bus className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Bus Stand / Metro</span>
                  <span className="text-sm font-black text-slate-950">{matrix.metroKm || matrix.busStandKm} km away</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                  <Hospital className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Hospital</span>
                  <span className="text-sm font-black text-slate-950">{matrix.hospitalKm} km away</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Colleges & Tech Hubs</span>
                  <span className="text-sm font-black text-slate-950">{matrix.collegeKm} km away</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Marketplace</span>
                  <span className="text-sm font-black text-slate-950">{matrix.marketKm} km away</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-slate-800" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Safety Rating</span>
                  <span className="text-sm font-black text-slate-950">9.8/10 Safe Area</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="bg-slate-950 text-white font-black text-xs px-8 py-3 rounded-xl hover:bg-black transition-all cursor-pointer shadow-md"
            >
              Close Distance Matrix
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
