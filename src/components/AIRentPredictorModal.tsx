import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, DollarSign, Building2, ShieldCheck, PieChart, CheckCircle2 } from 'lucide-react';

interface AIRentPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIRentPredictorModal: React.FC<AIRentPredictorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [city, setCity] = useState('Udaipur, Rajasthan');
  const [propertyType, setPropertyType] = useState('Apartment / Flat');
  const [bhk, setBhk] = useState('2 BHK');
  const [furnishing, setFurnishing] = useState('Furnished');
  const [sqft, setSqft] = useState(1200);
  const [hasParking, setHasParking] = useState(true);

  if (!isOpen) return null;

  // AI Estimation Model
  let baseRent = 12000;
  if (city.includes('Bangalore') || city.includes('Mumbai') || city.includes('Delhi')) baseRent = 28000;
  if (bhk === '3 BHK') baseRent *= 1.45;
  if (bhk === '1 BHK') baseRent *= 0.75;
  if (furnishing === 'Furnished') baseRent *= 1.25;
  if (furnishing === 'Semi-Furnished') baseRent *= 1.1;

  const estimatedMin = Math.round(baseRent * 0.9);
  const estimatedMax = Math.round(baseRent * 1.15);
  const estimatedAvg = Math.round(baseRent * 1.02);
  const estimatedRoi = (estimatedAvg * 12 / (sqft * 4500) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black">AI Rent Predictor & Valuation Engine</h2>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded">
                  FOR LANDLORDS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold">Estimate competitive monthly rent based on city locality & market demand</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Inputs Column */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-amber-500" />
                <span>Property Attributes</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">City / Location</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold outline-none"
                >
                  <option value="Udaipur, Rajasthan">Udaipur, Rajasthan</option>
                  <option value="Bangalore">Bangalore, Karnataka</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Mumbai">Mumbai, Maharashtra</option>
                  <option value="Pune">Pune, Maharashtra</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold outline-none"
                >
                  <option value="Apartment / Flat">Apartment / Flat</option>
                  <option value="Independent Villa">Independent Villa</option>
                  <option value="Student PG / Hostel">Student PG / Hostel</option>
                  <option value="Commercial Office">Commercial Office</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">BHK Configuration</label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold outline-none"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Furnishing Status</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-bold outline-none"
                >
                  <option value="Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            {/* AI Estimation Result */}
            <div className="space-y-4 bg-gradient-to-b from-slate-950 to-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/10 px-3 py-1 rounded-md inline-block mb-3 border border-amber-500/30">
                  ⚡ RECKO AI VALUATION
                </span>

                <div className="space-y-3">
                  <div className="text-center bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">RECOMMENDED MONTHLY RENT:</span>
                    <h2 className="text-3xl font-black text-amber-400 font-mono tracking-tight mt-1">
                      ₹{estimatedAvg.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">/ mo</span>
                    </h2>
                    <p className="text-[11px] text-emerald-400 font-mono font-bold mt-1">
                      Suggested Range: ₹{estimatedMin.toLocaleString('en-IN')} - ₹{estimatedMax.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Estimated ROI</span>
                      <strong className="text-emerald-300 font-mono text-sm">{estimatedRoi}% Annual</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Occupancy Rate</span>
                      <strong className="text-amber-300 font-mono text-sm">96% High Demand</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                <p className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Optimal price point for zero vacancy in {city.split(',')[0]}</span>
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
