import React, { useState } from 'react';
import { X, Eye, Compass, Maximize2, RotateCcw, Sparkles, Navigation, Layers } from 'lucide-react';
import { Property, Vehicle } from '../types';

interface VirtualTour360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  vehicles: Vehicle[];
}

export const VirtualTour360Modal: React.FC<VirtualTour360ModalProps> = ({
  isOpen,
  onClose,
  properties,
  vehicles
}) => {
  const [activeTab, setActiveTab] = useState<'property' | 'vehicle'>('property');
  const [selectedPropId, setSelectedPropId] = useState<string>(properties[0]?.id || '');
  const [selectedVehId, setSelectedVehId] = useState<string>(vehicles[0]?.id || '');

  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [panX, setPanX] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  if (!isOpen) return null;

  const currentProp = properties.find(p => p.id === selectedPropId) || properties[0];
  const currentVeh = vehicles.find(v => v.id === selectedVehId) || vehicles[0];

  const ROOM_PANORAMAS = [
    { title: 'Living Lounge & Hall', url: currentProp?.images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80', tag: '360° HD Main Area' },
    { title: 'Master Bedroom', url: currentProp?.images[1] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', tag: '360° En-Suite Bedroom' },
    { title: 'Modular Kitchen & Dining', url: currentProp?.images[2] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', tag: '360° Kitchen View' },
    { title: 'Balcony & Skyline View', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80', tag: '360° Panoramic Terrace' }
  ];

  const VEHICLE_PANORAMAS = [
    { title: 'Cabin & Cockpit Dashboard', url: currentVeh?.images[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80', tag: '360° Cockpit View' },
    { title: 'Rear Seating & Leather Interior', url: currentVeh?.images[1] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80', tag: '360° Passenger Cabin' }
  ];

  const viewsList = activeTab === 'property' ? ROOM_PANORAMAS : VEHICLE_PANORAMAS;
  const currentPanorama = viewsList[activeRoomIndex % viewsList.length];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diffX = e.clientX - startX;
    setPanX((prev) => Math.min(100, Math.max(0, prev + diffX * 0.15)));
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md text-white overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 animate-pulse">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black">360° Virtual Walkthrough & Panorama Viewer</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  ⚡ Interactive 3D VR
                </span>
              </div>
              <p className="text-xs text-slate-400">Drag to rotate 360 degrees & inspect details before visiting</p>
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* Category Switcher & Selectors */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setActiveTab('property'); setActiveRoomIndex(0); }}
                className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                  activeTab === 'property' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                }`}
              >
                🏠 Properties (Flats / Villas)
              </button>

              <button
                onClick={() => { setActiveTab('vehicle'); setActiveRoomIndex(0); }}
                className={`px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                  activeTab === 'vehicle' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                }`}
              >
                🚗 Vehicles (Luxury Cockpits)
              </button>
            </div>

            <div className="w-full sm:w-64">
              {activeTab === 'property' ? (
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedVehId}
                  onChange={(e) => setSelectedVehId(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.title} ({v.city})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Interactive 360 Panorama Screen */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative h-[380px] sm:h-[450px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-inner group select-none cursor-grab active:cursor-grabbing"
          >
            <img
              src={currentPanorama.url}
              alt={currentPanorama.title}
              style={{
                objectPosition: `${panX}% 50%`,
                transform: `scale(${zoomLevel / 100})`
              }}
              className="w-full h-full object-cover transition-all duration-100 ease-out"
            />

            {/* Overlay Gradient Controls */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* View Title & Instruction Badge */}
            <div className="absolute top-4 left-4 z-10 space-y-1">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-md shadow-md">
                {currentPanorama.tag}
              </span>
              <h3 className="text-base font-black text-white drop-shadow-md">
                {currentPanorama.title}
              </h3>
            </div>

            <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center space-x-1.5">
              <Navigation className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
              <span>↔️ Drag Mouse / Finger to Pan 360° View</span>
            </div>

            {/* Room / Angle Switcher Buttons */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {viewsList.map((room, idx) => (
                  <button
                    key={room.title}
                    onClick={() => setActiveRoomIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                      activeRoomIndex === idx
                        ? 'bg-amber-400 text-slate-950 scale-105 shadow-lg'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {room.title}
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                  className="px-2.5 py-1 hover:bg-slate-800 rounded-lg text-slate-300 font-bold"
                >
                  - Zoom
                </button>
                <span className="font-mono text-[10px] font-bold text-amber-300 px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                  className="px-2.5 py-1 hover:bg-slate-800 rounded-lg text-slate-300 font-bold"
                >
                  + Zoom
                </button>
                <button
                  onClick={() => { setPanX(50); setZoomLevel(100); }}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
                  title="Reset Angle"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0 text-xs">
          <div className="text-slate-400 font-medium">
            Currently inspecting: <strong className="text-white">{activeTab === 'property' ? currentProp?.title : currentVeh?.title}</strong>
          </div>
          <button
            onClick={onClose}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Close 360° Tour
          </button>
        </div>

      </div>
    </div>
  );
};
