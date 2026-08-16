import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Check, Building, Car, GraduationCap, Briefcase, Image as ImageIcon, Upload, Trash2, Camera, Shirt, Trophy, ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MainCategory, Property, Vehicle, ClothingItem, SportsTurfItem, LandlordUser } from '../types';

interface LandlordListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: Property) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddClothing?: (clothing: ClothingItem) => void;
  onAddSportsTurf?: (turf: SportsTurfItem) => void;
  loggedInLandlord?: LandlordUser | null;
}

export const LandlordListingModal: React.FC<LandlordListingModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  onAddVehicle,
  onAddClothing,
  onAddSportsTurf,
  loggedInLandlord
}) => {
  const [listingCategory, setListingCategory] = useState<MainCategory>('residential');
  
  // Property Fields
  const [title, setTitle] = useState('');
  const [subType, setSubType] = useState('Apartment');
  const [rent, setRent] = useState<number>(20000);
  const [deposit, setDeposit] = useState<number>(40000);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [locationScreenshot, setLocationScreenshot] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [nearbyCollege, setNearbyCollege] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [areaSqFt, setAreaSqFt] = useState<number>(1000);
  const [furnishing, setFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Furnished');
  const [amenitiesInput, setAmenitiesInput] = useState('Wi-Fi, Power Backup, Security, Covered Parking');
  const [ownerId, setOwnerId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');

  useEffect(() => {
    if (loggedInLandlord) {
      setOwnerId(loggedInLandlord.id);
      setOwnerName(loggedInLandlord.name);
      setOwnerContact(loggedInLandlord.phone || '');
    }
  }, [loggedInLandlord]);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Clothing / Wedding Attire Specific Fields
  const [clothingGender, setClothingGender] = useState<'Boys / Men' | 'Girls / Women' | 'Kids' | 'Unisex'>('Boys / Men');
  const [clothingType, setClothingType] = useState<'Wedding Lehenga' | 'Sherwani' | 'Designer Suit' | 'Evening Gown' | 'Pre-wedding Outfit' | 'Traditional Saree' | 'Party Wear'>('Sherwani');
  const [clothingSize, setClothingSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size'>('L');
  const [clothingRentPerDay, setClothingRentPerDay] = useState<number>(2500);
  const [clothingDeposit, setClothingDeposit] = useState<number>(5000);
  const [clothingDryCleaned, setClothingDryCleaned] = useState<boolean>(true);
  const [clothingFabric, setClothingFabric] = useState<string>('Silk & Velvet Brocade');

  // Sports & Turf Specific Fields
  const [turfType, setTurfType] = useState<'Box Cricket Turf' | 'Football Ground' | 'Badminton Court' | 'Swimming Pool' | 'Camping & Trekking Gear' | 'Sports Equipment'>('Box Cricket Turf');
  const [turfRentPerHour, setTurfRentPerHour] = useState<number>(1200);
  const [turfRentPerDay, setTurfRentPerDay] = useState<number>(10000);
  const [turfSurface, setTurfSurface] = useState<string>('FIFA Approved 50mm Artificial Grass');
  const [turfSlotTiming, setTurfSlotTiming] = useState<string>('06:00 AM - 12:00 AM Midnight');
  const [turfFloodLights, setTurfFloodLights] = useState<boolean>(true);
  const [turfLockerRoom, setTurfLockerRoom] = useState<boolean>(true);
  const [turfEquipmentProvided, setTurfEquipmentProvided] = useState<boolean>(true);
  const [turfParking, setTurfParking] = useState<boolean>(true);

  const handleListingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocationScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchCurrentGPS = () => {
    setIsLocatingGPS(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          setMapLink(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`);
          setIsLocatingGPS(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setIsLocatingGPS(false);
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocatingGPS(false);
    }
  };

  // Vehicle Specific Fields
  const [brand, setBrand] = useState('Royal Enfield');
  const [modelName, setModelName] = useState('Classic 350');
  const [rentPerDay, setRentPerDay] = useState<number>(800);
  const [rentPerHour, setRentPerHour] = useState<number>(90);
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'>('Petrol');
  const [licensePlate, setLicensePlate] = useState('KA 05 RN 1234');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const defaultImg = imageUrl.trim() || (
      listingCategory === 'vehicle'
        ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
        : listingCategory === 'clothing'
        ? 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80'
        : listingCategory === 'sports_turf'
        ? 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80'
        : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    );

    if (listingCategory === 'clothing') {
      const newClothing: ClothingItem = {
        id: `cloth-${Date.now()}`,
        title: title || `${clothingType} (${clothingGender})`,
        category: 'clothing',
        gender: clothingGender,
        clothingType: clothingType,
        size: clothingSize,
        rentPerDay: clothingRentPerDay,
        deposit: clothingDeposit,
        location: location || 'Boutique Hub',
        city: city || 'Udaipur',
        images: [defaultImg],
        dryCleaned: clothingDryCleaned,
        ownerId: ownerId.trim() || 'BOUTIQUE-OWNER',
        ownerName: ownerName || 'Royal Attire Studio',
        ownerContact: ownerContact || '+91 98765 43210',
        status: 'Approved',
        rating: 5.0,
        reviewsCount: 1,
        description: description || `${clothingType} for ${clothingGender}. Fabric: ${clothingFabric || 'Silk & Zari Brocade'}. Dry-cleaned, sanitized & ready for wedding event rental.`
      };
      if (onAddClothing) onAddClothing(newClothing);
    } else if (listingCategory === 'sports_turf') {
      const amenitiesList = [
        ...(turfFloodLights ? ['Floodlights'] : []),
        ...(turfLockerRoom ? ['Locker Room & Shower'] : []),
        ...(turfEquipmentProvided ? ['Balls & Gear Provided'] : []),
        ...(turfParking ? ['Dedicated Parking'] : []),
        ...amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean)
      ];

      const newTurf: SportsTurfItem = {
        id: `turf-${Date.now()}`,
        title: title || `${turfType} Arena`,
        category: 'sports_turf',
        turfType: turfType,
        rentPerHour: turfRentPerHour,
        rentPerDay: turfRentPerDay,
        location: location || 'Sports Complex',
        city: city || 'Udaipur',
        images: [defaultImg],
        amenities: Array.from(new Set(amenitiesList)),
        floodLights: turfFloodLights,
        ownerId: ownerId.trim() || 'TURF-MANAGER',
        ownerName: ownerName || 'Arena Sports Hub',
        ownerContact: ownerContact || '+91 98765 43210',
        status: 'Approved',
        rating: 5.0,
        reviewsCount: 1,
        description: description || `Professional ${turfType} in ${location || 'Prime City Location'}. ${turfSurface ? `Surface: ${turfSurface}.` : ''} Operating Hours: ${turfSlotTiming}.`
      };
      if (onAddSportsTurf) onAddSportsTurf(newTurf);
    } else if (listingCategory === 'vehicle') {
      const newVehicle: Vehicle = {
        id: `veh-custom-${Date.now()}`,
        title: title || `${brand} ${modelName} Rental`,
        vehicleType: subType as any || 'Bike',
        brand,
        modelName,
        year: 2024,
        rentPerDay,
        rentPerHour,
        deposit,
        location,
        city,
        images: [defaultImg],
        fuelType,
        mileageKm: '35 kmpl',
        driverAvailable: true,
        driverChargePerDay: 500,
        rating: 5.0,
        reviewsCount: 1,
        ownerId: ownerId.trim() || 'OWNER-VERIFIED',
        ownerName,
        ownerContact,
        isGPSAvailable: true,
        currentLat: 12.9716,
        currentLng: 77.5946,
        speedKmh: 0,
        fuelLevelPercent: 100,
        licensePlate
      };
      onAddVehicle(newVehicle);
    } else {
      const newProperty: Property = {
        id: `prop-custom-${Date.now()}`,
        title: title || `${subType} in ${location}, ${city}`,
        category: listingCategory,
        subType: subType as any,
        rentPerMonth: rent,
        deposit,
        location,
        city,
        ...(nearbyCollege.trim() ? {
          nearbyCollege: nearbyCollege.trim(),
          distanceToCollegeKm: 0.8
        } : {}),
        images: [defaultImg],
        ...(listingCategory !== 'commercial' ? {
          bedrooms,
          bathrooms
        } : {}),
        areaSqFt,
        furnishing,
        amenities: amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean),
        ownerId: ownerId.trim() || 'OWNER-VERIFIED',
        ownerName,
        ownerContact,
        ownerVerified: true,
        rating: 5.0,
        reviewsCount: 1,
        description: description || 'Newly posted verified rental property listing.',
        availableFrom: 'Immediately',
        ...(fullAddress.trim() ? { fullAddress: fullAddress.trim() } : {}),
        ...(mapLink.trim() ? { mapLink: mapLink.trim() } : {}),
        ...(locationScreenshot ? { locationScreenshot } : {}),
        ...(latitude !== null ? { latitude } : {}),
        ...(longitude !== null ? { longitude } : {})
      };
      onAddProperty(newProperty);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Glass Gradient */}
        <div className="bg-gradient-to-r from-slate-950 via-zinc-800 to-slate-900 text-white p-5 sm:p-6 relative shrink-0 border-b border-zinc-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-zinc-800 to-zinc-800 border border-zinc-400/80 text-white rounded-2xl shadow-lg shadow-zinc-800/50 shrink-0">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Post New Rental Listing</h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Residential House, Commercial Office, Student PG, or Vehicle for Rent
              </p>
            </div>
          </div>
        </div>

        {/* Category Picker Tabs */}
        <div className="bg-slate-100/90 backdrop-blur-xs p-2 border-b border-slate-200/80 grid grid-cols-3 sm:grid-cols-6 gap-1 text-[11px] font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              setListingCategory('residential');
              setSubType('Apartment');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'residential'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-zinc-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Residential</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setListingCategory('commercial');
              setSubType('Office');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'commercial'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-zinc-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Commercial</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setListingCategory('student');
              setSubType('College PG');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'student'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-zinc-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Student PG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setListingCategory('vehicle');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'vehicle'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-zinc-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setListingCategory('clothing');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'clothing'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-amber-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="truncate">👔 Clothes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setListingCategory('sports_turf');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'sports_turf'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-emerald-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="truncate">🏆 Turf & Sports</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/40">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Listing Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Listing Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Spacious 2 BHK Sunlit Flat with Balcony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs"
              />
            </div>

            {/* Sub Type */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Sub-Type
              </label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs cursor-pointer"
              >
                {listingCategory === 'residential' && (
                  <>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Independent House">Independent House</option>
                  </>
                )}
                {listingCategory === 'commercial' && (
                  <>
                    <option value="Office">Office Space</option>
                    <option value="Shop">Retail Shop</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Co-working Space">Co-working Space</option>
                    <option value="Industrial Property">Industrial Property</option>
                  </>
                )}
                {listingCategory === 'student' && (
                  <>
                    <option value="College PG">College PG</option>
                    <option value="Student Hostel">Student Hostel</option>
                    <option value="Shared Room">Shared Room</option>
                    <option value="Single Room">Single Room</option>
                  </>
                )}
                {listingCategory === 'vehicle' && (
                  <>
                    <option value="Bike">Bike</option>
                    <option value="Car">Car</option>
                    <option value="Scooty">Scooty</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Luxury Cars">Luxury Cars</option>
                  </>
                )}
              </select>
            </div>

            {/* Pricing for Vehicles, Clothes, Turf & Properties */}
            {listingCategory === 'vehicle' ? (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Rent Per Day (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={rentPerDay}
                    onChange={(e) => setRentPerDay(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Rent Per Hour (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={rentPerHour}
                    onChange={(e) => setRentPerHour(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
              </>
            ) : listingCategory === 'clothing' ? (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Rent Per Day (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={clothingRentPerDay}
                    onChange={(e) => setClothingRentPerDay(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Security Deposit (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={clothingDeposit}
                    onChange={(e) => setClothingDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
              </>
            ) : listingCategory === 'sports_turf' ? (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Rent Per Hour (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={turfRentPerHour}
                    onChange={(e) => setTurfRentPerHour(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Full Day / Shift Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={turfRentPerDay}
                    onChange={(e) => setTurfRentPerDay(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Rent Per Month (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
              </>
            )}

            {/* Location & City */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">City Name</label>
              <input
                type="text"
                required
                placeholder="Enter city (e.g. Udaipur, Mumbai, Delhi...)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">
                Locality / Area Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HSR Layout Sector 3"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs"
              />
            </div>

            {/* Exact Location & Map Upload Section */}
            <div className="sm:col-span-2 bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-emerald-700" />
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                    Exact Property Location & Map Upload
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFetchCurrentGPS}
                  disabled={isLocatingGPS}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-extrabold transition-all cursor-pointer shadow-xs flex items-center space-x-1"
                >
                  <span>{isLocatingGPS ? 'Detecting GPS...' : '📍 Auto-Fetch My GPS Pin'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Street Address & Door/Flat No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 302, Green Avenue, Main Road"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Maps Link / GPS Pin URL</label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/?q=..."
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              {/* Map/Location Screenshot File Upload */}
              <div className="pt-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Upload Location Map Photo / Screenshot / Electricity Bill Proof
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-emerald-300 hover:border-emerald-500 rounded-xl cursor-pointer text-xs font-bold text-emerald-800 transition-all shadow-2xs">
                    <Upload className="h-4 w-4 text-emerald-600" />
                    <span>Choose Location Map File / Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocationScreenshotUpload}
                      className="hidden"
                    />
                  </label>

                  {locationScreenshot && (
                    <div className="relative h-12 w-20 rounded-lg overflow-hidden border border-emerald-400">
                      <img src={locationScreenshot} alt="Location Map Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLocationScreenshot('')}
                        className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student College name if student listing */}
            {listingCategory === 'student' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Nearby College Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. RV College of Engineering (RVCE)"
                  value={nearbyCollege}
                  onChange={(e) => setNearbyCollege(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden shadow-2xs"
                />
              </div>
            )}

            {/* Vehicle specific fields */}
            {listingCategory === 'vehicle' && (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">License Plate No.</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
              </>
            )}

            {/* Clothing Specific Detailed Fields */}
            {listingCategory === 'clothing' && (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Target Audience / Gender *</label>
                  <select
                    value={clothingGender}
                    onChange={(e) => setClothingGender(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs cursor-pointer"
                  >
                    <option value="Boys / Men">Boys / Men (Groom, Tuxedo, Sherwani)</option>
                    <option value="Girls / Women">Girls / Women (Bride, Lehenga, Saree)</option>
                    <option value="Kids">Kids / Children Wear</option>
                    <option value="Unisex">Unisex / Indo-Western</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Attire Type *</label>
                  <select
                    value={clothingType}
                    onChange={(e) => setClothingType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs cursor-pointer"
                  >
                    <option value="Wedding Lehenga">Wedding Lehenga</option>
                    <option value="Sherwani">Royal Sherwani</option>
                    <option value="Designer Suit">Designer Suit / Tuxedo</option>
                    <option value="Evening Gown">Evening Gown</option>
                    <option value="Pre-wedding Outfit">Pre-wedding / Haldi Outfit</option>
                    <option value="Traditional Saree">Traditional Saree</option>
                    <option value="Party Wear">Party Wear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Size *</label>
                  <select
                    value={clothingSize}
                    onChange={(e) => setClothingSize(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs cursor-pointer"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">Double XL (XXL)</option>
                    <option value="Free Size">Free Size / Custom Alteration Available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Fabric & Work Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Silk, Zardosi Embroidery, Sequin Work"
                    value={clothingFabric}
                    onChange={(e) => setClothingFabric(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2 bg-amber-50/80 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shirt className="h-5 w-5 text-amber-600" />
                    <div>
                      <span className="text-xs font-extrabold text-amber-950 block">Professional Dry Clean Guarantee</span>
                      <span className="text-[10px] text-amber-800">Assures renter that the outfit is steam-sanitized & dry-cleaned before delivery</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={clothingDryCleaned}
                    onChange={(e) => setClothingDryCleaned(e.target.checked)}
                    className="h-5 w-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Sports & Turf Specific Detailed Fields */}
            {listingCategory === 'sports_turf' && (
              <>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Sports Facility Type *</label>
                  <select
                    value={turfType}
                    onChange={(e) => setTurfType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs cursor-pointer"
                  >
                    <option value="Box Cricket Turf">Box Cricket Turf</option>
                    <option value="Football Ground">Football Ground (5v5 / 7v7 / 11v11)</option>
                    <option value="Badminton Court">Badminton Court (Wooden/Synthetic)</option>
                    <option value="Swimming Pool">Swimming Pool & Resort Turf</option>
                    <option value="Camping & Trekking Gear">Camping & Outdoor Trekking Gear</option>
                    <option value="Sports Equipment">Sports Equipment & Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Turf Surface Quality</label>
                  <input
                    type="text"
                    placeholder="e.g. FIFA Grade 50mm Synthetic Turf"
                    value={turfSurface}
                    onChange={(e) => setTurfSurface(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Operating Hours / Slot Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:00 AM - 12:00 AM Midnight"
                    value={turfSlotTiming}
                    onChange={(e) => setTurfSlotTiming(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2 bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl space-y-2">
                  <span className="text-xs font-black text-emerald-950 flex items-center space-x-1.5">
                    <Trophy className="h-4 w-4 text-emerald-600" />
                    <span>Turf Facilities & Player Amenities</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-slate-800">
                    <label className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turfFloodLights}
                        onChange={(e) => setTurfFloodLights(e.target.checked)}
                        className="accent-emerald-600"
                      />
                      <span>⚡ Floodlights</span>
                    </label>
                    <label className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turfLockerRoom}
                        onChange={(e) => setTurfLockerRoom(e.target.checked)}
                        className="accent-emerald-600"
                      />
                      <span>🚿 Locker/Shower</span>
                    </label>
                    <label className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turfEquipmentProvided}
                        onChange={(e) => setTurfEquipmentProvided(e.target.checked)}
                        className="accent-emerald-600"
                      />
                      <span>🏏 Balls & Gear</span>
                    </label>
                    <label className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-emerald-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turfParking}
                        onChange={(e) => setTurfParking(e.target.checked)}
                        className="accent-emerald-600"
                      />
                      <span>🚗 Free Parking</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Property specs (Only for Residential, Commercial, Student PG) */}
            {['residential', 'commercial', 'student'].includes(listingCategory) && (
              <>
                {listingCategory !== 'commercial' && (
                  <>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Area (Sq. Ft)</label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Furnishing</label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-900 outline-hidden shadow-2xs cursor-pointer"
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </>
            )}

            {/* Property / Vehicle Photo Upload Section */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>Upload Listing Photo</span>
                <span className="text-[10px] text-zinc-900 font-extrabold uppercase">Device Upload or Direct Web URL</span>
              </label>

              {imageUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-500/40 bg-slate-900 p-2 group shadow-sm">
                    <img
                      src={imageUrl}
                      alt="Listing Photo Preview"
                      className="w-full h-44 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="bg-rose-600 text-white p-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-rose-700 transition-colors cursor-pointer shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>AI Image Authenticity Engine: Ready for Verification</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Auto-scanned</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: File Browser / Drag and Drop */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-zinc-500 rounded-2xl p-4 text-center bg-white/80 transition-colors flex flex-col justify-center shadow-2xs">
                    <input
                      type="file"
                      accept="image/*"
                      id="listing-photo-upload"
                      className="hidden"
                      onChange={handleListingFileUpload}
                    />
                    <label
                      htmlFor="listing-photo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-1.5"
                    >
                      <div className="p-2.5 bg-zinc-800 text-zinc-900 rounded-2xl">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 hover:underline">
                          Choose Image File
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Select photo from device / camera
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Option 2: Image Web URL */}
                  <div className="flex flex-col justify-center bg-white/80 p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Or Paste Image Web URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full p-2 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 bg-white outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Owner Contact & ID */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Owner Phone</label>
              <input
                type="text"
                required
                value={ownerContact}
                onChange={(e) => setOwnerContact(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Owner / Landlord User ID (Aadhaar / License / Reg ID)</label>
              <input
                type="text"
                placeholder="e.g. LL-89021 or Aadhaar / PAN / RC No."
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-900 outline-hidden focus:ring-2 focus:ring-zinc-400 shadow-2xs"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-zinc-800 to-zinc-800 hover:from-zinc-800 hover:to-zinc-800 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md hover:shadow-zinc-800/20 mt-2 cursor-pointer"
          >
            Publish Rental Listing
          </button>
        </form>

      </div>
    </div>
  );
};
