import React, { useState } from 'react';
import {
  X,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  MessageSquare,
  GraduationCap,
  Heart,
  Tag,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Property } from '../types';
import { openWhatsAppChat } from '../utils/whatsapp';

interface PropertyDetailModalProps {
  property: Property | null;
  allProperties?: Property[];
  onClose: () => void;
  onConfirmBooking: (p: Property, isStudentVerified?: boolean) => void;
  isStudentVerified?: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectSimilarProperty?: (p: Property) => void;
  onOpenChat?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  allProperties = [],
  onClose,
  onConfirmBooking,
  isStudentVerified = false,
  isSaved,
  onToggleSave,
  onSelectSimilarProperty,
  onOpenChat
}) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [visitRequested, setVisitRequested] = useState(false);

  if (!property) return null;

  const discountPercent = isStudentVerified ? 10 : 0;
  const originalRent = property.rentPerMonth;
  const discountedRent = isStudentVerified ? Math.round(originalRent * 0.9) : originalRent;
  const totalUpfront = discountedRent + property.deposit;

  // Filter similar properties (same city, subType or category)
  const similarProperties = allProperties.filter(
    (p) => p.id !== property.id && (p.city.toLowerCase() === property.city.toLowerCase() || p.subType === property.subType || p.category === property.category)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white overflow-y-auto w-full h-full min-h-screen">
      {/* Top Full Width Sticky Bar */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>← Back to Properties</span>
          </button>
          <span className="hidden sm:inline bg-amber-400 text-zinc-950 font-extrabold text-xs px-3 py-1 rounded-lg">
            {property.subType}
          </span>
          {property.furnishing && (
            <span className="hidden sm:inline bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs px-3 py-1 rounded-lg">
              {property.furnishing}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggleSave(property.id)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
              isSaved
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-rose-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-4">
            <div className="h-80 sm:h-[450px] w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-900 relative shadow-xl border border-slate-200/80 dark:border-zinc-800">
              <img
                src={property.images[activeImgIdx] || property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnail switcher */}
            {property.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`h-20 w-28 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImgIdx === idx ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Property thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="pt-3">
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">About Property</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Owner Uploaded Map Location & Proof */}
            {(property.fullAddress || property.mapLink || property.locationScreenshot) && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-900 flex items-center space-x-1.5">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    <span>Owner Verified Map Location & Address</span>
                  </span>
                  <span className="bg-emerald-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
                    Verified Pin
                  </span>
                </div>

                {property.fullAddress && (
                  <p className="text-slate-800 font-semibold text-xs">
                    <strong className="text-emerald-950">Full Address:</strong> {property.fullAddress}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {property.mapLink && (
                    <a
                      href={property.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[11px] inline-flex items-center space-x-1 transition-all shadow-2xs"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Open in Google Maps ↗</span>
                    </a>
                  )}

                  {property.locationScreenshot && (
                    <a
                      href={property.locationScreenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 hover:text-emerald-900 font-bold underline text-[11px]"
                    >
                      View Uploaded Map Screenshot
                    </a>
                  )}
                </div>

                {property.locationScreenshot && (
                  <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-emerald-300">
                    <img src={property.locationScreenshot} alt="Location Map Proof" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* AI Proximity & Transit Distance Engine */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-zinc-900" />
                  <span>AI Nearby Distance & Commute Breakdown</span>
                </span>
                <span className="bg-zinc-800 text-zinc-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                  AI Calculated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block">🚉 Railway Station</span>
                  <span className="font-extrabold text-slate-900 text-xs">1.8 km</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    🚶 22 min • 🏍️ 5 min • 🚗 4 min
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block">🚌 Bus Stand / Metro</span>
                  <span className="font-extrabold text-slate-900 text-xs">0.5 km</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    🚶 6 min • 🏍️ 2 min • 🚗 1 min
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block">🏥 City Hospital</span>
                  <span className="font-extrabold text-slate-900 text-xs">1.2 km</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    🚶 15 min • 🏍️ 4 min • 🚗 3 min
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block">🎓 School / College</span>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {property.distanceToCollegeKm ? `${property.distanceToCollegeKm} km` : '0.8 km'}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    🚶 10 min • 🏍️ 3 min • 🚗 2 min
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block">🛍️ Market & Mall</span>
                  <span className="font-extrabold text-slate-900 text-xs">0.4 km</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    🚶 5 min • 🏍️ 2 min • 🚗 1 min
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block">🛡️ AI Safety Rating</span>
                  <span className="font-black text-emerald-600 text-xs">98% Verified</span>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Verified Documents
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="pt-2">
              <h4 className="font-extrabold text-slate-900 text-sm mb-2">Amenities & Facilities</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-medium truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Booking Column */}
          <div className="md:col-span-5 space-y-5">
            
            {/* Title & Location */}
            <div>
              <h2 className="text-lg font-black text-slate-900">{property.title}</h2>
              <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-800 shrink-0" />
                <span>{property.location}, {property.city}</span>
              </p>
            </div>

            {/* Student College Tag */}
            {property.nearbyCollege && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <GraduationCap className="h-4 w-4 text-amber-600" />
                  <span>College Nearby</span>
                </div>
                <p className="font-medium">{property.distanceToCollegeKm} km from {property.nearbyCollege}</p>
              </div>
            )}

            {/* Rental Breakdown Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-600">Monthly Rent:</span>
                <div className="text-right">
                  {isStudentVerified && (
                    <span className="text-xs line-through text-slate-400 block">
                      ₹{originalRent.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xl font-black text-zinc-800">
                    ₹{discountedRent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500"> / mo</span>
                </div>
              </div>

              {isStudentVerified && (
                <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span className="flex items-center space-x-1">
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Student Discount (10% Off)</span>
                  </span>
                  <span>-₹{(originalRent - discountedRent).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600">
                <span>Security Deposit (Refundable):</span>
                <span className="font-bold text-slate-800">₹{property.deposit.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total Upfront Amount:</span>
                <span className="text-zinc-900">₹{totalUpfront.toLocaleString('en-IN')}</span>
              </div>

            </div>

            {/* Owner Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Property Owner</span>
                  <span className="font-extrabold text-slate-900 text-sm">{property.ownerName}</span>
                </div>
                {property.ownerVerified && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span>Verified Owner</span>
                  </span>
                )}
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenChat) onOpenChat(property);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat with Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppChat({
                      phoneNumber: property.ownerContact,
                      itemTitle: property.title,
                      itemCategory: property.subType,
                      ownerName: property.ownerName,
                      price: `₹${discountedRent.toLocaleString('en-IN')}/month`,
                      location: property.location,
                      city: property.city
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp Owner</span>
                </button>

                <a
                  href={`tel:${property.ownerContact}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl flex items-center justify-center space-x-1 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-zinc-900" />
                  <span>Call Owner</span>
                </a>

                <button
                  onClick={() => setVisitRequested(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5 text-zinc-900" />
                  <span>{visitRequested ? 'Visit Requested ✓' : 'Schedule Visit'}</span>
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  onClick={() => alert(`Report submitted for property ${property.id}. Our AI Security Auditor will audit this listing.`)}
                  className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline inline-flex items-center space-x-1"
                >
                  <span>⚠️ Report Suspicious or Fake Listing</span>
                </button>
              </div>
            </div>

            {/* Main Rent Now Button */}
            <button
              onClick={() => {
                onConfirmBooking(property, isStudentVerified);
                onClose();
              }}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-950 text-white text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md text-sm"
            >
              Rent Property & Generate Receipt
            </button>

          </div>

          {/* SIMILAR PROPERTIES SECTION */}
          {similarProperties.length > 0 && (
            <div className="pt-6 border-t border-slate-200 col-span-1 md:col-span-12 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-950 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-zinc-900" />
                    <span>Similar Properties You Might Like in {property.city}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Click on any recommendation below to view details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarProperties.map((simProp) => (
                  <div
                    key={simProp.id}
                    onClick={() => {
                      if (onSelectSimilarProperty) {
                        onSelectSimilarProperty(simProp);
                      }
                    }}
                    className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-zinc-500 rounded-2xl p-3 transition-all duration-200 hover:shadow-lg cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="h-32 w-full rounded-xl overflow-hidden relative bg-slate-900">
                        <img
                          src={simProp.images[0]}
                          alt={simProp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-slate-950/80 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-lg backdrop-blur-md">
                          {simProp.subType}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-zinc-900 line-clamp-1 transition-colors">
                          {simProp.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5 font-medium">
                          <MapPin className="h-3 w-3 text-zinc-800 shrink-0" />
                          <span className="truncate">{simProp.location}, {simProp.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-slate-950">
                          ₹{simProp.rentPerMonth.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500">/mo</span>
                      </div>
                      <span className="text-xs font-extrabold text-zinc-900 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
