import React, { useState } from 'react';
import { X, Calculator, Users, Share2, DollarSign, CheckCircle2, Copy } from 'lucide-react';

interface SplitBillCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SplitBillCalculatorModal: React.FC<SplitBillCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [totalRent, setTotalRent] = useState<number>(18000);
  const [electricityBill, setElectricityBill] = useState<number>(2400);
  const [wifiBill, setWifiBill] = useState<number>(999);
  const [maidCharges, setMaidCharges] = useState<number>(2000);
  const [otherExpenses, setOtherExpenses] = useState<number>(1500);
  const [numberOfRoommates, setNumberOfRoommates] = useState<number>(3);

  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen) return null;

  const totalExpense = totalRent + electricityBill + wifiBill + maidCharges + otherExpenses;
  const perPersonShare = Math.round(totalExpense / Math.max(1, numberOfRoommates));

  const handleCopyRequest = () => {
    const text = `🏡 *Monthly Flat Expense Breakdown*%0A%0A• Total Rent: ₹${totalRent}%0A• Electricity: ₹${electricityBill}%0A• Wi-Fi Internet: ₹${wifiBill}%0A• Maid/Cook: ₹${maidCharges}%0A• Other Shared Expenses: ₹${otherExpenses}%0A----------------------------%0A💰 *Total Flat Expense:* ₹${totalExpense}%0A👥 *Roommates Count:* ${numberOfRoommates}%0A👉 *YOUR SHARE:* ₹${perPersonShare} / person%0A%0APlease UPI your share before the 5th of this month!`;
    
    navigator.clipboard.writeText(text.replace(/%0A/g, '\n'));
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const text = `🏡 *Monthly Flat Expense Breakdown*%0A%0A• Total Rent: ₹${totalRent}%0A• Electricity: ₹${electricityBill}%0A• Wi-Fi Internet: ₹${wifiBill}%0A• Maid/Cook: ₹${maidCharges}%0A• Other Shared Expenses: ₹${otherExpenses}%0A----------------------------%0A💰 *Total Flat Expense:* ₹${totalExpense}%0A👥 *Roommates Count:* ${numberOfRoommates}%0A👉 *YOUR SHARE:* ₹${perPersonShare} / person%0A%0APlease UPI your share before the 5th of this month!`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Roommate Split-Bill & Expense Calculator</h2>
              <p className="text-xs text-slate-400 font-semibold">Auto-calculate per person share for Rent, Electricity, Wi-Fi & Maid</p>
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
                <Users className="h-4 w-4 text-amber-500" />
                <span>1. Monthly Flat Expenses</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Monthly House Rent (₹)</label>
                <input
                  type="number"
                  value={totalRent}
                  onChange={(e) => setTotalRent(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Electricity Bill (₹)</label>
                <input
                  type="number"
                  value={electricityBill}
                  onChange={(e) => setElectricityBill(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Wi-Fi Broadband (₹)</label>
                <input
                  type="number"
                  value={wifiBill}
                  onChange={(e) => setWifiBill(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Maid / Cook Charges (₹)</label>
                <input
                  type="number"
                  value={maidCharges}
                  onChange={(e) => setMaidCharges(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Number of Roommates (Sharing)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={numberOfRoommates}
                  onChange={(e) => setNumberOfRoommates(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="space-y-4 bg-gradient-to-b from-slate-950 to-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/10 px-3 py-1 rounded-md inline-block mb-3 border border-amber-500/30">
                  💰 LIVE PER-PERSON BREAKDOWN
                </span>

                <div className="space-y-2 border-b border-zinc-800 pb-4">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Total Combined Expenses:</span>
                    <strong className="text-white font-mono text-sm">₹{totalExpense.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Roommates Sharing:</span>
                    <strong className="text-white font-mono text-sm">{numberOfRoommates} Persons</strong>
                  </div>
                </div>

                {/* Big Per-Person Result Card */}
                <div className="pt-4 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">EACH ROOMMATE PAYS:</span>
                  <h2 className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                    ₹{perPersonShare.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">/ person</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium pt-1">
                    Calculated evenly across all {numberOfRoommates} flatmates.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Send Bill Request on WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyRequest}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all border border-slate-700 cursor-pointer text-xs"
                >
                  {copiedMsg ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedMsg ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
