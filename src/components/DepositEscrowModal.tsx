import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface DepositEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositEscrowModal: React.FC<DepositEscrowModalProps> = ({
  isOpen,
  onClose
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(30000);
  const [paintDeduction, setPaintDeduction] = useState<number>(0);
  const [utilityDeduction, setUtilityDeduction] = useState<number>(0);
  const [damageDeduction, setDamageDeduction] = useState<number>(0);

  if (!isOpen) return null;

  const totalDeductions = paintDeduction + utilityDeduction + damageDeduction;
  const netRefund = Math.max(0, depositAmount - totalDeductions);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md text-slate-900 dark:text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#0C1017] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">Security Deposit Escrow & Move-Out Refund Tracker</h2>
              <p className="text-xs text-slate-400 font-semibold">Transparent tenant deposit protection & move-out inspection settlement</p>
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
          
          {/* Status Banner */}
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="font-extrabold text-sm text-white block">Security Deposit Held in Escrow Protection</strong>
                <span className="text-[11px] text-emerald-300">Protected under Recko India Tenant Protection Guarantee.</span>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              ✓ ESCROW PROTECTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left: Move-Out Inspection & Deductions Form */}
            <div className="space-y-3 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                1. Initial Deposit & Settlement Form
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Original Security Deposit (₹)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700">
                <span className="text-[11px] font-extrabold text-slate-800 dark:text-zinc-200 block mb-2">Move-Out Deductions (If Applicable):</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Painting & Cleaning Charge (₹)</label>
                    <input
                      type="number"
                      value={paintDeduction}
                      onChange={(e) => setPaintDeduction(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Pending Electricity / Water Bill (₹)</label>
                    <input
                      type="number"
                      value={utilityDeduction}
                      onChange={(e) => setUtilityDeduction(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Property Damage Charge (₹)</label>
                    <input
                      type="number"
                      value={damageDeduction}
                      onChange={(e) => setDamageDeduction(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Net Refund Calculation Box */}
            <div className="space-y-4 bg-gradient-to-b from-slate-950 to-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/10 px-3 py-1 rounded-md inline-block mb-3 border border-emerald-500/30">
                  💰 REFUND CALCULATION STATEMENT
                </span>

                <div className="space-y-2 border-b border-zinc-800 pb-4">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Original Deposit:</span>
                    <strong className="text-white font-mono">₹{depositAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-rose-400 font-medium">
                    <span>Total Deductions:</span>
                    <strong className="font-mono">- ₹{totalDeductions.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="pt-4 text-center space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">NET REFUND AMOUNT TO TENANT:</span>
                  <h2 className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{netRefund.toLocaleString('en-IN')}
                  </h2>
                  <p className="text-[11px] text-slate-300 font-medium pt-1">
                    Direct transfer to Tenant's bank account / UPI upon move-out clearance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`✅ Security deposit refund of ₹${netRefund.toLocaleString('en-IN')} processed successfully!`);
                  onClose();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Process Net Deposit Refund</span>
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
};
