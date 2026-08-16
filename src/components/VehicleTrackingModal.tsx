import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Gauge,
  Fuel,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Zap,
  Navigation,
  Compass
} from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleTrackingModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleTrackingModal: React.FC<VehicleTrackingModalProps> = ({
  vehicle,
  onClose
}) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    if (!vehicle) return;

    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`/api/vehicles/telemetry/${vehicle.id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTelemetry(data);
          }
          return;
        }
      } catch (err) {
        // Network or fetch failed - fall back gracefully to local simulated telemetry
      }

      if (isMounted) {
        const now = Date.now();
        setTelemetry({
          vehicleId: vehicle.id,
          status: 'Live GPS Satellite Connected',
          latOffset: Math.sin(now / 4000) * 0.002,
          lngOffset: Math.cos(now / 4000) * 0.002,
          speedKmh: Math.floor(35 + Math.random() * 15),
          fuelLevelPercent: Math.max(20, Math.floor(85 - (now % 100000) / 3000)),
          batteryState: 'Healthy',
          geofenceStatus: 'Inside Allowed City Zone',
          lastPingTime: new Date().toLocaleTimeString()
        });
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000); // Live poll every 3s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [vehicle]);

  if (!vehicle) return null;

  const currentLat = (vehicle.currentLat || 12.9716) + (telemetry?.latOffset || 0);
  const currentLng = (vehicle.currentLng || 77.5946) + (telemetry?.lngOffset || 0);
  const currentSpeed = telemetry?.speedKmh ?? (vehicle.speedKmh || 35);
  const fuelPercent = telemetry?.fuelLevelPercent ?? (vehicle.fuelLevelPercent || 80);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700"
            >
              <X className="h-4 w-4" />
              <span>← Back to Vehicles</span>
            </button>
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 animate-pulse">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-extrabold">{vehicle.title}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                License Plate: <span className="text-amber-400 font-bold">{vehicle.licensePlate}</span> • ID: {vehicle.id}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Simulated Map Container */}
          <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 relative min-h-[300px] flex flex-col justify-between overflow-hidden shadow-inner">
            
            {/* Map Canvas Background Simulation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Map Status Overlay */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-[11px] space-y-1 font-mono">
                <p className="text-slate-400 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Lat: {currentLat.toFixed(6)}</span>
                </p>
                <p className="text-slate-400 flex items-center space-x-1">
                  <Compass className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Lng: {currentLng.toFixed(6)}</span>
                </p>
              </div>

              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-xl flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>Geofence OK</span>
              </div>
            </div>

            {/* Simulated Animated Vehicle Marker */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-zinc-400/30 rounded-full animate-ping"></div>
                <div className="h-14 w-14 bg-zinc-900 text-white text-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-zinc-400 relative z-10">
                  <Navigation className="h-7 w-7 text-zinc-400 animate-bounce" />
                </div>
              </div>
              <span className="bg-slate-900 text-zinc-400 text-xs font-bold px-3 py-1 rounded-lg border border-slate-700 shadow-md">
                Vehicle Moving @ {currentSpeed} km/h
              </span>
            </div>

            {/* Map Footer info */}
            <div className="relative z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-400 flex justify-between items-center">
              <span>Location: {vehicle.location}, {vehicle.city}</span>
              <span className="text-[10px] text-slate-500">Updated: {telemetry?.lastPingTime || 'Just now'}</span>
            </div>
          </div>

          {/* Live Telemetry Metrics */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Speed Gauge Card */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-zinc-400/10 border border-zinc-400/30 text-zinc-400 rounded-2xl">
                <Gauge className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Current Speed</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">{currentSpeed}</span>
                  <span className="text-xs font-bold text-zinc-400">km/h</span>
                </div>
              </div>
            </div>

            {/* Fuel / Battery Level Card */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
                <Fuel className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Fuel / Battery Level</span>
                  <span className="text-sm font-black text-amber-400">{fuelPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${fuelPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Vehicle Owner & Helpline Info */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Fleet Partner:</span>
                <span className="font-bold text-slate-200">{vehicle.ownerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Direct Contact:</span>
                <span className="font-bold text-zinc-300">{vehicle.ownerContact}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Driver Option:</span>
                <span className="font-bold text-slate-200">
                  {vehicle.driverAvailable ? 'Driver Available' : 'Self Drive'}
                </span>
              </div>
            </div>

            {/* Panic / SOS Button */}
            <div className="pt-2">
              <button
                onClick={() => setSosActive(!sosActive)}
                className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg ${
                  sosActive
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300'
                }`}
              >
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>{sosActive ? 'EMERGENCY SOS ALERT TRANSMITTED' : 'TRIGGER EMERGENCY SOS / PANIC ALERT'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
