import React, { useState } from 'react';
import {
  X,
  Car,
  Gauge,
  Fuel,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Camera,
  ArrowRight,
  DollarSign,
  Printer
} from 'lucide-react';
import { RentalBooking } from '../types';
import { calculateInspectionSettlement, formatINR } from '../utils/financialCalculations';

interface VehicleInspectionModalProps {
  booking: RentalBooking | null;
  mode: 'pickup' | 'return';
  onClose: () => void;
  onSaveInspection: (updatedBooking: RentalBooking) => void;
}

export const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({
  booking,
  mode,
  onClose,
  onSaveInspection
}) => {
  if (!booking) return null;

  const isPickup = mode === 'pickup';

  // State for Pickup Inspection
  const [odometerPickup, setOdometerPickup] = useState<number>(booking.pickupOdometerKm || 25430);
  const [fuelPickup, setFuelPickup] = useState<number>(booking.pickupFuelLevelPercent || 70);
  const [damageNotes, setDamageNotes] = useState<string>(booking.existingDamageNotes || 'Front bumper minor scratch (Pre-existing)');
  const [docRcChecked, setDocRcChecked] = useState<boolean>(true);
  const [docInsuranceChecked, setDocInsuranceChecked] = useState<boolean>(true);

  // State for Return Inspection
  const [odometerReturn, setOdometerReturn] = useState<number>(booking.returnOdometerKm || 25780);
  const [fuelReturn, setFuelReturn] = useState<number>(booking.returnFuelLevelPercent || 70);
  const [lateHours, setLateHours] = useState<number>(0);

  // Calculations for Return via Standardized Financial Utility
  const includedKm = (booking as any).includedKm || 300;
  const extraKmChargeRate = (booking as any).extraKmCharge || 10;
  const usedKm = Math.max(0, odometerReturn - odometerPickup);
  const initialDeposit = (booking as any)?.securityDeposit || (booking as any)?.deposit || 2000;

  const settlement = calculateInspectionSettlement({
    initialDeposit,
    usedKm,
    includedKm,
    extraKmRate: extraKmChargeRate,
    lateHours,
    lateFeePerHourRate: 250
  });

  const extraKm = settlement.extraKm;
  const extraKmFee = settlement.extraKmFee;
  const lateFeeTotal = settlement.lateFeeTotal;
  const finalSettlementDeposit = settlement.refundedDeposit;

  const handleSave = () => {
    let newStatus = booking.status;
    if (isPickup) {
      newStatus = 'Vehicle Picked Up';
    } else {
      newStatus = 'Completed';
    }

    const updatedBooking: RentalBooking = {
      ...booking,
      status: newStatus,
      pickupOdometerKm: odometerPickup,
      pickupFuelLevelPercent: fuelPickup,
      existingDamageNotes: damageNotes,
      returnOdometerKm: odometerReturn,
      returnFuelLevelPercent: fuelReturn,
      extraKmFeePaid: extraKmFee,
      depositSettlementAmount: finalSettlementDeposit
    };

    onSaveInspection(updatedBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-amber-400/40 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900 flex flex-col max-h-[96vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative border-b border-amber-400/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-2xl font-black shrink-0">
              <Car className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                {isPickup ? 'Step 6: Digital Pickup Inspection' : 'Step 7: Return & Deposit Settlement'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {isPickup ? 'Vehicle Handover & Odometer Check' : 'Vehicle Return & Final Extra KM Settlement'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Vehicle Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center space-x-3">
            <img
              src={booking.itemImage}
              alt={booking.itemTitle}
              className="h-16 w-20 object-cover rounded-xl border border-amber-400/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                  {booking.registrationNumber || 'MH 12 QX 4920'}
                </span>
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">
                  {booking.vehicleType || 'Car / SUV'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 truncate mt-1">{booking.itemTitle}</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Renter: <strong className="text-slate-900">{booking.userName}</strong> ({booking.userPhone})
              </p>
            </div>
          </div>

          {/* PICKUP INSPECTION FORM */}
          {isPickup && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300/70 space-y-3">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200 pb-2">
                  <Gauge className="h-4 w-4 text-amber-600" />
                  <span>Pickup Odometer & Fuel Level Record</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Odometer Reading (KM) *</label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-2.5 h-4 w-4 text-amber-500" />
                      <input
                        type="number"
                        value={odometerPickup}
                        onChange={(e) => setOdometerPickup(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Fuel / Battery Level (%) *</label>
                    <div className="relative">
                      <Fuel className="absolute left-3 top-2.5 h-4 w-4 text-amber-500" />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={fuelPickup}
                        onChange={(e) => setFuelPickup(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Existing Scratches / Damage Notes</label>
                  <textarea
                    rows={2}
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Note any existing scratches, dent or bumper marks..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* Document Verification & Photo Upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                  <FileCheck className="h-4 w-4 text-amber-500" />
                  <span>Mandatory Document Check & Digital Agreement</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 font-medium">
                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docRcChecked}
                      onChange={(e) => setDocRcChecked(e.target.checked)}
                      className="h-4 w-4 accent-amber-500 rounded"
                    />
                    <span>Original RC Book & Insurance Verified ✓</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docInsuranceChecked}
                      onChange={(e) => setDocInsuranceChecked(e.target.checked)}
                      className="h-4 w-4 accent-amber-500 rounded"
                    />
                    <span>Driving Licence Valid & Match Verified ✓</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* RETURN INSPECTION & SETTLEMENT FORM */}
          {!isPickup && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300/70 space-y-3">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200 pb-2">
                  <Gauge className="h-4 w-4 text-amber-600" />
                  <span>Return Odometer & Final KM Calculation</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Pickup Odometer (Start)</label>
                    <input
                      type="number"
                      disabled
                      value={odometerPickup}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2 text-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Return Odometer (End) *</label>
                    <input
                      type="number"
                      value={odometerReturn}
                      onChange={(e) => setOdometerReturn(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* KM Breakdown Table */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total KM Driven:</span>
                    <strong className="text-slate-900">{usedKm} KM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Included Free KM:</span>
                    <strong className="text-emerald-700">{includedKm} KM</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1">
                    <span className="text-amber-800 font-bold">Extra Chargeable KM ({extraKm} KM × ₹{extraKmChargeRate}/km):</span>
                    <strong className="text-amber-700 font-bold">₹{extraKmFee}</strong>
                  </div>
                </div>
              </div>

                {/* Late Return & Grace Period Section */}
                <div className="pt-2 border-t border-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-800 font-semibold">Late Return Hours (Grace Period: 15 Mins)</label>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">Rate: ₹250 / hour</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={lateHours}
                    onChange={(e) => setLateHours(Number(e.target.value))}
                    placeholder="0 hours"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Returns within 15 minutes of scheduled time incur 0 late fee. Beyond 15 mins, whole-hour late fee applies.
                  </p>
                </div>

              {/* Deposit Refund Settlement Box */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 space-y-2 text-emerald-950">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Security Deposit Settlement & Refund</span>
                </h4>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Initial Deposit Held in Escrow:</span>
                    <strong className="font-mono">{formatINR(initialDeposit)}</strong>
                  </div>
                  {extraKmFee > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Extra KM Charges Deduction ({extraKm} KM):</span>
                      <strong className="font-mono">-{formatINR(extraKmFee)}</strong>
                    </div>
                  )}
                  {lateFeeTotal > 0 && (
                    <div className="flex justify-between text-rose-700">
                      <span>Late Return Fee Deduction ({lateHours} hrs × ₹250):</span>
                      <strong className="font-mono">-{formatINR(lateFeeTotal)}</strong>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-emerald-300 pt-1 text-sm font-black text-emerald-900">
                    <span>Final Deposit Amount Refunded to Renter:</span>
                    <span className="font-mono text-emerald-700 text-base">{formatINR(finalSettlementDeposit)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-4 w-4 stroke-[3]" />
              <span>
                {isPickup ? 'Confirm Pickup Inspection & Hand Over Vehicle' : 'Complete Return & Settle Security Deposit'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
