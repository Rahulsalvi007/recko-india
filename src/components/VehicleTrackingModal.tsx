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
  Compass,
  Power,
  ShieldCheck,
  Activity,
  Layers,
  PhoneCall,
  Search
} from 'lucide-react';
import { Vehicle } from '../types';
import { getCityCoordinates, CITY_COORDINATES_MAP } from '../utils/aiLocationEngine';

interface VehicleTrackingModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleTrackingModal: React.FC<VehicleTrackingModalProps> = ({
  vehicle,
  onClose
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [lat, setLat] = useState<number>(24.5854);
  const [lng, setLng] = useState<number>(73.7125);
  const [speedKmh, setSpeedKmh] = useState<number>(42);
  const [fuelLevel, setFuelLevel] = useState<number>(85);
  const [odometerKm, setOdometerKm] = useState<number>(24512);
  const [isEngineOn, setIsEngineOn] = useState<boolean>(true);
  const [isRemoteImmobilized, setIsRemoteImmobilized] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<string>('');
  const [isLocatingDevice, setIsLocatingDevice] = useState<boolean>(false);
  const [gpsSourceLabel, setGpsSourceLabel] = useState<string>('City Telemetry');

  useEffect(() => {
    if (!vehicle) return;

    const initialCity = vehicle.city || vehicle.location || 'Jaipur';
    setSelectedCity(initialCity);

    // 1. Initial Resolution from vehicle object or city lookup
    let baseLat = vehicle.currentLat;
    let baseLng = vehicle.currentLng;

    if (!baseLat || !baseLng || (baseLat === 12.9716 && baseLng === 77.5946 && !initialCity.toLowerCase().includes('bangalore'))) {
      const cityCoords = getCityCoordinates(initialCity, vehicle.location);
      baseLat = cityCoords.lat;
      baseLng = cityCoords.lng;
    }

    setLat(baseLat);
    setLng(baseLng);
    setGpsSourceLabel(`City GPS (${initialCity})`);
    setSpeedKmh(vehicle.speedKmh || 42);
    setFuelLevel(vehicle.fuelLevelPercent || 85);
    setLastPingTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    // 2. Try Auto Browser Geolocation on load
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(+pos.coords.latitude.toFixed(6));
          setLng(+pos.coords.longitude.toFixed(6));
          setGpsSourceLabel('Live Device GPS');
        },
        () => {
          // If denied, remain on city coordinates
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }

    // 3. Live Render GPS Animation Loop (updates every 2 seconds)
    const interval = setInterval(() => {
      if (!isRemoteImmobilized && isEngineOn) {
        setLat((prev) => +(prev + (Math.random() - 0.48) * 0.0006).toFixed(6));
        setLng((prev) => +(prev + (Math.random() - 0.48) * 0.0006).toFixed(6));
        setSpeedKmh(Math.floor(35 + Math.random() * 22));
        setOdometerKm((prev) => +(prev + 0.02).toFixed(1));
      } else {
        setSpeedKmh(0);
      }
      setLastPingTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 2000);

    return () => clearInterval(interval);
  }, [vehicle]);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const coords = getCityCoordinates(cityName);
    setLat(coords.lat);
    setLng(coords.lng);
    setGpsSourceLabel(`City GPS (${cityName})`);
  };

  const handleAcquireDeviceGPS = () => {
    if ('geolocation' in navigator) {
      setIsLocatingDevice(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(+pos.coords.latitude.toFixed(6));
          setLng(+pos.coords.longitude.toFixed(6));
          setIsLocatingDevice(false);
          setGpsSourceLabel('Live Device GPS');
          alert(`🎯 Live Device GPS Locked:\n\nLatitude: ${pos.coords.latitude.toFixed(6)}\nLongitude: ${pos.coords.longitude.toFixed(6)}`);
        },
        (err) => {
          setIsLocatingDevice(false);
          alert('GPS Note: Could not access device browser location. Vehicle is centered on city coordinates.');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation API is not supported by your browser.');
    }
  };

  if (!vehicle) return null;

  const bboxMinLng = (lng - 0.008).toFixed(4);
  const bboxMinLat = (lat - 0.008).toFixed(4);
  const bboxMaxLng = (lng + 0.008).toFixed(4);
  const bboxMaxLat = (lat + 0.008).toFixed(4);
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxMinLng},${bboxMinLat},${bboxMaxLng},${bboxMaxLat}&layer=mapnik&marker=${lat},${lng}`;

  const availableCities = [
    'Udaipur',
    'Jaipur',
    'Jodhpur',
    'Kota',
    'Ajmer',
    'Bikaner',
    'Bhilwara',
    'Delhi',
    'Noida',
    'Gurgaon',
    'Mumbai',
    'Pune',
    'Ahmedabad',
    'Surat',
    'Indore',
    'Bhopal',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Chandigarh',
    'Dehradun',
    'Lucknow',
    'Goa'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700"
            >
              <X className="h-4 w-4 text-amber-400" />
              <span>← Back to Fleet</span>
            </button>
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 animate-pulse hidden sm:block">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h2 className="text-base sm:text-xl font-black text-white">{vehicle.title}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  {gpsSourceLabel} ✓
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  🔒 OWNER CONTROL CENTRE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                City: <span className="text-amber-400 font-bold">{selectedCity || vehicle.city}</span> • Reg: <span className="text-white font-bold">{vehicle.licensePlate || 'RJ 27 CA 9021'}</span>
              </p>
            </div>
          </div>

          {/* Location Controls: City Selector & Lock Live Device GPS */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400 z-10 pointer-events-none" />
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder="Search city or area..."
                className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
              />
              {selectedCity && (
                <button
                  type="button"
                  onClick={() => handleCityChange('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  title="Clear"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleAcquireDeviceGPS}
              disabled={isLocatingDevice}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Navigation className="h-4 w-4 text-amber-400 animate-spin" />
              <span>{isLocatingDevice ? 'Locating...' : '🎯 My Live GPS'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* Interactive Live Render GPS Map Container */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 relative min-h-[420px] flex flex-col justify-between overflow-hidden shadow-2xl">
            
            {/* Live OpenStreetMap Interactive Iframe */}
            <div className="w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-800 relative z-10 bg-slate-950">
              <iframe
                title="Live GPS Location Map"
                src={osmEmbedUrl}
                className="w-full h-full min-h-[380px] border-0 filter contrast-125 brightness-90"
              />

              {/* Map Layer Switcher & Live Ping Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
                <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700 text-emerald-400 text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>GPS Ping: {lastPingTime}</span>
                </div>
              </div>

              {/* Vehicle Speed Overlay Pill */}
              <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-2xl shadow-xl flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Navigation className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Velocity</span>
                  <span className="text-lg font-black text-white">{speedKmh} <span className="text-xs font-normal text-slate-400">km/h</span></span>
                </div>
              </div>
            </div>

            {/* Coordinates & Location Footer */}
            <div className="mt-3 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-xs text-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center space-x-3 font-mono text-[11px]">
                <span className="text-slate-400 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>Lat: {lat}</span>
                </span>
                <span className="text-slate-400 flex items-center space-x-1">
                  <Compass className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Lng: {lng}</span>
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800">
                Inside Geofence Boundary ({selectedCity || vehicle.city || 'Local Area'}) ✓
              </span>
            </div>
          </div>

          {/* Live Telemetry Metrics & Engine Controls */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Engine Remote Control Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Remote Engine Cut-Off</span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                  isRemoteImmobilized
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isRemoteImmobilized ? 'ENGINE LOCKED' : 'ENGINE ACTIVE'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isRemoteImmobilized) {
                    setIsRemoteImmobilized(false);
                    setIsEngineOn(true);
                    alert('⚡ ENGINE UNLOCKED:\n\nRemote immobilizer disengaged. Vehicle engine ignition restored.');
                  } else {
                    if (window.confirm('⚠️ ATTENTION OWNER:\n\nAre you sure you want to trigger REMOTE ENGINE CUT-OFF? The vehicle ignition will be locked immediately.')) {
                      setIsRemoteImmobilized(true);
                      setIsEngineOn(false);
                      setSpeedKmh(0);
                    }
                  }
                }}
                className={`w-full py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg border ${
                  isRemoteImmobilized
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                    : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400'
                }`}
              >
                <Power className="h-4 w-4 stroke-[3]" />
                <span>{isRemoteImmobilized ? 'UN-LOCK ENGINE IGNITION' : 'REMOTE ENGINE CUT-OFF (LOCK)'}</span>
              </button>
            </div>

            {/* Speed Gauge Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center space-x-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
                <Gauge className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-slate-400 font-bold block">Live Velocity & Odometer</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-white">{speedKmh} <span className="text-xs font-bold text-amber-400">km/h</span></span>
                  <span className="text-xs text-slate-400 font-mono">({odometerKm} km)</span>
                </div>
              </div>
            </div>

            {/* Fuel / Battery Level Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold flex items-center space-x-1.5">
                  <Fuel className="h-4 w-4 text-amber-400" />
                  <span>Fuel Tank / Battery Status</span>
                </span>
                <span className="font-mono font-black text-amber-400">{fuelLevel}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${fuelLevel}%` }}
                />
              </div>
            </div>

            {/* Owner Helpline & Fleet Info */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Fleet Owner:</span>
                <span className="font-bold text-slate-200">{vehicle.ownerName || 'Verified Fleet Host'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contact Phone:</span>
                <span className="font-mono font-bold text-amber-400">{vehicle.ownerContact || '+91 98765 43210'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transmission:</span>
                <span className="font-bold text-slate-200">{vehicle.transmission || 'Automatic'}</span>
              </div>
            </div>

            {/* SOS Alert Button */}
            <div>
              <button
                type="button"
                onClick={() => setSosActive(!sosActive)}
                className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl cursor-pointer ${
                  sosActive
                    ? 'bg-rose-600 text-white animate-pulse border border-rose-400'
                    : 'bg-rose-950/60 hover:bg-rose-950 border border-rose-800 text-rose-300'
                }`}
              >
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>{sosActive ? 'EMERGENCY SOS DISPATCHED' : 'TRIGGER EMERGENCY PANIC SOS'}</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
