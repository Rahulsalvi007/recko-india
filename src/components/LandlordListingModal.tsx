import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Check, Building, Car, GraduationCap, Briefcase, Image as ImageIcon, Upload, Trash2, Camera, Shirt, Trophy, ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, Tv, Refrigerator, Zap } from 'lucide-react';
import { MainCategory, Property, Vehicle, ClothingItem, SportsTurfItem, GeneralItem, GeneralItemCategory, LandlordUser } from '../types';
import { saveDocument } from '../lib/firebase';

interface LandlordListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: Property) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddClothing?: (clothing: ClothingItem) => void;
  onAddSportsTurf?: (turf: SportsTurfItem) => void;
  onAddGeneralItem?: (item: GeneralItem) => void;
  loggedInLandlord?: LandlordUser | null;
}

export const LandlordListingModal: React.FC<LandlordListingModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  onAddVehicle,
  onAddClothing,
  onAddSportsTurf,
  onAddGeneralItem,
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');

  // Clothing / Wedding Attire Detailed 10-Section Fields
  const [clothingGender, setClothingGender] = useState<'Boys / Men' | 'Girls / Women' | 'Kids' | 'Unisex'>('Boys / Men');
  const [clothingType, setClothingType] = useState<string>('Sherwani');
  const [clothingSize, setClothingSize] = useState<string>('L');
  const [clothingRentPerDay, setClothingRentPerDay] = useState<number>(500);
  const [clothingDeposit, setClothingDeposit] = useState<number>(1500);
  const [clothingDryCleaned, setClothingDryCleaned] = useState<boolean>(true);
  const [clothingFabric, setClothingFabric] = useState<string>('Silk & Brocade');

  const [clothingBrand, setClothingBrand] = useState('Sabyasachi / Manyavar');
  const [clothingColour, setClothingColour] = useState('Black & Gold');
  const [clothingPatternStyle, setClothingPatternStyle] = useState('Heavy Zari Embroidery');
  const [clothingOccasion, setClothingOccasion] = useState<string>('Wedding');

  const [clothingChest, setClothingChest] = useState('42 inches');
  const [clothingWaist, setClothingWaist] = useState('36 inches');
  const [clothingLength, setClothingLength] = useState('44 inches');
  const [clothingShoulder, setClothingShoulder] = useState('18 inches');
  const [clothingSleeveLength, setClothingSleeveLength] = useState('25 inches');

  const [clothingConditionRating, setClothingConditionRating] = useState<string>('Excellent');
  const [clothingHasStain, setClothingHasStain] = useState(false);
  const [clothingHasTear, setClothingHasTear] = useState(false);
  const [clothingMissingButton, setClothingMissingButton] = useState(false);

  const [clothingHourlyRate, setClothingHourlyRate] = useState<number>(150);
  const [clothingRate1Day, setClothingRate1Day] = useState<number>(500);
  const [clothingRate2Days, setClothingRate2Days] = useState<number>(800);
  const [clothingRate3Days, setClothingRate3Days] = useState<number>(1000);
  const [clothingRate1Week, setClothingRate1Week] = useState<number>(2000);
  const [clothingLateFeePerDay, setClothingLateFeePerDay] = useState<number>(200);

  const [clothingHomeDelivery, setClothingHomeDelivery] = useState(true);
  const [clothingDeliveryFee, setClothingDeliveryFee] = useState<number>(150);
  const [clothingReturnPickup, setClothingReturnPickup] = useState(true);

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

  // Vehicle Hourly Pricing & 9-Section Fields
  const [vehicleHourlyRate, setVehicleHourlyRate] = useState<number>(150);
  const [vehicleDailyRate, setVehicleDailyRate] = useState<number>(1000);
  const [vehicleExtraHourRate, setVehicleExtraHourRate] = useState<number>(200);
  const [vehicleLateFeeRate, setVehicleLateFeeRate] = useState<number>(250);
  const [vehicleGracePeriodMins, setVehicleGracePeriodMins] = useState<number>(15);
  const [vehicleDiffLocationFee, setVehicleDiffLocationFee] = useState<number>(300);

  const [brand, setBrand] = useState('Hyundai');
  const [modelName, setModelName] = useState('Creta');
  const [vehicleVariant, setVehicleVariant] = useState('SX Automatic');
  const [vehicleManufacturingYear, setVehicleManufacturingYear] = useState<number>(2024);
  const [vehicleTransmission, setVehicleTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [vehicleSeats, setVehicleSeats] = useState<number>(5);
  const [vehicleColour, setVehicleColour] = useState('White');
  const [vehicleOdometerKm, setVehicleOdometerKm] = useState<number>(24500);
  const [rentPerDay, setRentPerDay] = useState<number>(1000);
  const [rentPerHour, setRentPerHour] = useState<number>(150);
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'CNG' | 'EV'>('Petrol');
  const [licensePlate, setLicensePlate] = useState('RJ 27 CA 9021');
  const [vehicleMinHours, setVehicleMinHours] = useState<number>(2);
  const [vehicleWeeklyRate, setVehicleWeeklyRate] = useState<number>(6000);
  const [vehicleReturnLocation, setVehicleReturnLocation] = useState('City Central Dropoff Point');
  const [vehicleIncludedKm, setVehicleIncludedKm] = useState<number>(100);
  const [vehicleExtraKmRate, setVehicleExtraKmRate] = useState<number>(10);
  const [vehicleFuelPolicy, setVehicleFuelPolicy] = useState<'Same Level' | 'Full-to-Full'>('Full-to-Full');

  // Commercial / Home Appliances & Electronics Fields (Freez, TV, AC, Coolers, Laptops, Furniture)
  const [applianceCategory, setApplianceCategory] = useState<GeneralItemCategory>('Home Appliances');
  const [applianceType, setApplianceType] = useState<string>('Refrigerator / Freeze');
  const [applianceCondition, setApplianceCondition] = useState<'Brand New' | 'Like New' | 'Good Condition'>('Like New');
  const [applianceRentPerMonth, setApplianceRentPerMonth] = useState<number>(800);
  const [applianceRentPerDay, setApplianceRentPerDay] = useState<number>(150);
  const [applianceDeposit, setApplianceDeposit] = useState<number>(2000);
  const [applianceBrand, setApplianceBrand] = useState<string>('LG / Samsung');
  const [applianceDelivery, setApplianceDelivery] = useState<boolean>(true);
  const [applianceDeliveryFee, setApplianceDeliveryFee] = useState<number>(300);

  const [submittedListing, setSubmittedListing] = useState<{ id: string; title: string; category: string; image: string } | null>(null);

  const resetFormState = (newCat?: MainCategory) => {
    setTitle('');
    setDescription('');
    setImageUrls([]);
    setInputUrl('');
    setLocationScreenshot('');
    setCity('');
    setLocation('');
    setFullAddress('');
    setMapLink('');
    setLatitude(null);
    setLongitude(null);
    setNearbyCollege('');
    setRent(20000);
    setDeposit(40000);
    setBedrooms(2);
    setBathrooms(2);
    setAreaSqFt(1000);
    setFurnishing('Furnished');
    setAmenitiesInput('Wi-Fi, Power Backup, Security, Covered Parking');

    // Vehicle fields reset
    setBrand('Hyundai');
    setModelName('Creta');
    setVehicleVariant('SX Automatic');
    setLicensePlate('');
    setRentPerDay(1000);
    setRentPerHour(150);

    // Clothing fields reset
    setClothingType('Sherwani');
    setClothingBrand('Sabyasachi / Manyavar');
    setClothingColour('Black & Gold');
    setClothingRentPerDay(500);
    setClothingDeposit(1500);

    // Appliance fields reset
    setApplianceCategory('Home Appliances');
    setApplianceType('Refrigerator / Freeze');
    setApplianceCondition('Like New');
    setApplianceRentPerMonth(800);
    setApplianceRentPerDay(150);
    setApplianceDeposit(2000);
    setApplianceBrand('LG / Samsung');
    setApplianceDelivery(true);
    setApplianceDeliveryFee(300);

    const catToUse = newCat || listingCategory;
    if (catToUse === 'residential') setSubType('Apartment');
    else if (catToUse === 'commercial') setSubType('Office');
    else if (catToUse === 'student') setSubType('College PG');
    else if (catToUse === 'vehicle') setSubType('Car');
    else if (catToUse === 'clothing') setSubType('Sherwani');
    else if (catToUse === 'sports_turf') setSubType('Football Turf');
    else if (catToUse === 'general') setSubType('Home Appliances');
  };

  useEffect(() => {
    if (isOpen) {
      resetFormState();
      setSubmittedListing(null);
    }
  }, [isOpen]);

  const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500 KB Limit per Image

  const handleListingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);

    // Validate size (max 500 KB per photo)
    const validFiles: File[] = [];
    selectedFiles.forEach((file) => {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const sizeInKB = (file.size / 1024).toFixed(1);
        alert(`⚠️ File "${file.name}" is ${sizeInKB} KB. Maximum allowed image size is 500 KB per photo.`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) return;

    let readCount = 0;
    const newImages: string[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImages.push(reader.result as string);
        }
        readCount++;
        if (readCount === validFiles.length) {
          setImageUrls((prev) => {
            const combined = [...prev, ...newImages];
            if (combined.length > 4) {
              alert('📸 Note: Maximum 4 photos allowed per listing. Keeping the first 4 photos.');
            }
            return combined.slice(0, 4);
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddUrlImage = () => {
    if (!inputUrl.trim()) return;
    if (imageUrls.length >= 4) {
      alert('⚠️ Maximum 4 photos allowed per listing.');
      return;
    }
    setImageUrls((prev) => [...prev, inputUrl.trim()].slice(0, 4));
    setInputUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
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



  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fallbackImg = (
      listingCategory === 'vehicle'
        ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
        : listingCategory === 'clothing'
        ? 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80'
        : listingCategory === 'sports_turf'
        ? 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80'
        : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    );
    const finalImageList = imageUrls.length > 0 ? imageUrls : [fallbackImg];
    const defaultImg = finalImageList[0];

    if (listingCategory === 'clothing') {
      const newClothing: ClothingItem = {
        id: `cloth-${Date.now()}`,
        title: title || `${clothingBrand} ${clothingType}`,
        category: 'clothing',
        gender: clothingGender,
        clothingType: clothingType as any,
        size: clothingSize as any,
        rentPerDay: clothingRate1Day || clothingRentPerDay || 500,
        deposit: clothingDeposit || 1500,
        location: location || 'Boutique Hub, City Center',
        city: city || 'Udaipur',
        images: finalImageList,
        dryCleaned: clothingDryCleaned,
        ownerId: ownerId.trim() || 'BOUTIQUE-OWNER',
        ownerName: ownerName || 'Royal Attire Studio',
        ownerContact: ownerContact || '+91 98765 43210',
        ownerEmail: 'boutique.owner@example.com',
        ownerAddress: 'Boutique Hub, Udaipur',
        ownerKycId: 'Aadhaar: 9876 5432 1098',
        ownerBankUpi: '9876543210@paytm',
        status: 'Pending Approval',
        rating: 5.0,
        reviewsCount: 1,
        description: description || `${clothingType} for ${clothingGender}. Fabric: ${clothingFabric}. Professional dry-cleaned & steam sanitized.`,
        brand: clothingBrand,
        colour: clothingColour,
        fabric: clothingFabric,
        patternStyle: clothingPatternStyle,
        occasion: clothingOccasion as any,
        measurements: {
          chest: clothingChest,
          waist: clothingWaist,
          length: clothingLength,
          shoulder: clothingShoulder,
          sleeveLength: clothingSleeveLength
        },
        clothingCondition: clothingConditionRating as any,
        conditionAudit: {
          hasStain: clothingHasStain,
          hasTear: clothingHasTear,
          missingButton: clothingMissingButton,
          isAltered: false
        },
        pricingTiers: {
          hourlyRate: clothingHourlyRate,
          rate1Day: clothingRate1Day,
          rate2Days: clothingRate2Days,
          rate3Days: clothingRate3Days,
          rate1Week: clothingRate1Week,
          lateFeePerDay: clothingLateFeePerDay
        },
        deliveryOptions: {
          selfPickup: true,
          homeDelivery: clothingHomeDelivery,
          deliveryFee: clothingDeliveryFee,
          returnPickup: clothingReturnPickup,
          boutiqueAddress: location || 'Boutique Hub, City Center'
        },
        hygieneRules: {
          dryCleanedIncluded: clothingDryCleaned,
          sanitizedSteamIroned: true,
          userWashingAllowed: false,
          stainDamagePolicy: 'Dry clean only by Recko Care. Stains covered under security deposit.'
        }
      };
      saveDocument('clothing', newClothing.id, newClothing);
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
        images: finalImageList,
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
      saveDocument('sports_turfs', newTurf.id, newTurf);
      if (onAddSportsTurf) onAddSportsTurf(newTurf);
    } else if (listingCategory === 'general') {
      const newGeneralItem: GeneralItem = {
        id: `item-${Date.now()}`,
        title: title || `${applianceBrand} ${applianceType}`,
        category: 'general',
        subType: applianceCategory,
        rentPerMonth: applianceRentPerMonth || rent || 800,
        rentPerDay: applianceRentPerDay || 150,
        deposit: applianceDeposit || deposit || 2000,
        location: location || 'City Central Hub',
        city: city || 'Udaipur',
        images: finalImageList,
        specs: [
          `Brand: ${applianceBrand}`,
          `Category: ${applianceType}`,
          `Condition: ${applianceCondition}`,
          ...(applianceDelivery ? [`Home Delivery & Free Installation Available (+₹${applianceDeliveryFee})`] : ['Self Pickup Required'])
        ],
        ownerId: ownerId.trim() || 'OWNER-VERIFIED',
        ownerName: ownerName || 'Commercial Appliance Rental Hub',
        ownerContact: ownerContact || '+91 98765 43210',
        ownerVerified: true,
        status: 'Approved',
        rating: 5.0,
        reviewsCount: 1,
        description: description || `Verified ${applianceType} (${applianceBrand}) available for monthly/daily rental in ${location || city}. In excellent working condition.`,
        condition: applianceCondition as any
      };
      saveDocument('general_items', newGeneralItem.id, newGeneralItem);
      if (onAddGeneralItem) onAddGeneralItem(newGeneralItem);
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
        images: finalImageList,
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
        licensePlate,
        hourlyPrice: vehicleHourlyRate,
        dailyPrice: vehicleDailyRate,
        extraHourRate: vehicleExtraHourRate,
        lateFeePerHour: vehicleLateFeeRate,
        gracePeriodMins: vehicleGracePeriodMins,
        differentLocationFee: vehicleDiffLocationFee
      };
      saveDocument('vehicles', newVehicle.id, newVehicle);
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
        images: finalImageList,
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
      saveDocument('properties', newProperty.id, newProperty);
      onAddProperty(newProperty);
    }

    const createdId = listingCategory === 'general' ? `item-${Date.now()}` : listingCategory === 'clothing' ? `cloth-${Date.now()}` : listingCategory === 'sports_turf' ? `turf-${Date.now()}` : listingCategory === 'vehicle' ? `veh-custom-${Date.now()}` : `prop-custom-${Date.now()}`;
    const createdTitle = title || (listingCategory === 'general' ? `${applianceBrand} ${applianceType}` : listingCategory === 'clothing' ? `${clothingBrand} ${clothingType}` : listingCategory === 'vehicle' ? `${brand} ${modelName}` : subType);

    alert(`🎉 UPLOAD SUCCESSFUL!\n\nYour listing "${createdTitle}" (#${createdId}) has been successfully uploaded and submitted for Admin Verification.`);

    setSubmittedListing({
      id: createdId,
      title: createdTitle,
      category: listingCategory,
      image: defaultImg
    });
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

        {/* Submitted Confirmation View OR Form View */}
        {submittedListing ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Submitted for Admin Audit & Verification</span>
              </span>
              <h3 className="text-xl font-black text-slate-900">
                🎉 Listing Uploaded Successfully!
              </h3>
              <p className="text-slate-600 text-xs max-w-md mx-auto mt-1 font-medium leading-relaxed">
                Your rental listing <strong className="text-slate-900">{submittedListing.title}</strong> (#{submittedListing.id}) has been recorded and submitted to Recko Admin Audit Portal. Once verified, it will be published live!
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs font-mono max-w-md mx-auto">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Listing ID:</span>
                <strong className="text-amber-700 font-black">{submittedListing.id}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-sans">Category:</span>
                <strong className="text-slate-900 uppercase font-sans">{submittedListing.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Verification Status:</span>
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                  🟡 Pending Admin Audit
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setSubmittedListing(null);
                  resetFormState(listingCategory);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="h-4 w-4 text-amber-400" />
                <span>+ Add Another Listing</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Category Picker Tabs */}
        <div className="bg-slate-100/90 backdrop-blur-xs p-2 border-b border-slate-200/80 grid grid-cols-3 sm:grid-cols-7 gap-1 text-[11px] font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              setListingCategory('residential');
              resetFormState('residential');
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
              resetFormState('commercial');
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
              setListingCategory('general');
              resetFormState('general');
            }}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer ${
              listingCategory === 'general'
                ? 'bg-white text-zinc-900 shadow-sm font-black border border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="truncate">TV / Freez / AC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setListingCategory('student');
              resetFormState('student');
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
              resetFormState('vehicle');
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
              resetFormState('clothing');
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
              resetFormState('sports_turf');
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
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooty">Scooty</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Luxury Cars">Luxury Cars</option>
                  </>
                )}
                {listingCategory === 'clothing' && (
                  <>
                    <option value="Sherwani">Designer Sherwani</option>
                    <option value="Lehenga">Wedding Lehenga</option>
                    <option value="Suit">Suit / Tuxedo</option>
                    <option value="Dress">Dress / Gown</option>
                    <option value="Saree">Designer Saree</option>
                    <option value="Jacket">Jacket / Blazer</option>
                    <option value="Shirt">Shirt</option>
                    <option value="Jeans">Jeans / Pants</option>
                    <option value="Other">Other Outfit</option>
                  </>
                )}
                {listingCategory === 'hotel' && (
                  <>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Suite">Luxury Suite</option>
                    <option value="Executive Room">Executive Room</option>
                    <option value="Resort Cottage">Resort Cottage</option>
                  </>
                )}
                {listingCategory === 'restaurant' && (
                  <>
                    <option value="Dining Table">Dining Table</option>
                    <option value="Rooftop">Rooftop Table</option>
                    <option value="Private Cabin">Private Cabin</option>
                    <option value="Party Hall">Party Hall</option>
                  </>
                )}
                {listingCategory === 'library' && (
                  <>
                    <option value="AC Reading Desk">AC Reading Desk</option>
                    <option value="Private Cabin">Private Cabin Desk</option>
                    <option value="General Study Desk">General Study Desk</option>
                  </>
                )}
                {listingCategory === 'sports_turf' && (
                  <>
                    <option value="Football Turf">Football Turf</option>
                    <option value="Cricket Box">Cricket Box Turf</option>
                    <option value="Badminton Court">Badminton Court</option>
                    <option value="Tennis Court">Tennis Court</option>
                  </>
                )}
                {listingCategory === 'general' && (
                  <>
                    <option value="Event Equipment">Event Equipment</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Camera & Lens">Camera & Lens</option>
                    <option value="Tools">Tools & Appliances</option>
                    <option value="Other">Other Item</option>
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

            {/* Vehicle Specific Detailed 9-Section Form */}
            {listingCategory === 'vehicle' && (
              <div className="sm:col-span-2 space-y-5 border-t border-slate-200 pt-4">
                <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-4 rounded-2xl text-slate-950 flex items-center justify-between shadow-md">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">🚗 Car Listing & Document Audit Wizard</h3>
                    <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                      Fill all 9 sections. Submitted listings require Admin document verification before going live.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-black bg-slate-950 text-amber-400 px-3 py-1 rounded-xl shadow-xs">
                    Admin Audit Active
                  </span>
                </div>

                {/* 1. Car Basic Details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>🚗 1. Car Basic Details</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Car Brand *</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyundai / Tata / Mahindra"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Car Model *</label>
                      <input
                        type="text"
                        placeholder="e.g. Creta / Nexon / Thar"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Variant *</label>
                      <input
                        type="text"
                        placeholder="e.g. SX Automatic / ZXi"
                        value={vehicleVariant}
                        onChange={(e) => setVehicleVariant(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Mfg Year *</label>
                      <input
                        type="number"
                        value={vehicleManufacturingYear}
                        onChange={(e) => setVehicleManufacturingYear(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Vehicle Type *</label>
                      <select
                        value={subType}
                        onChange={(e) => setSubType(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Car">SUV / Creta Class</option>
                        <option value="Sedan">Sedan (City / Verna)</option>
                        <option value="Hatchback">Hatchback (Swift / Baleno)</option>
                        <option value="MUV">MUV / 7 Seater (Ertiga / Innova)</option>
                        <option value="Bike">Motorbike / Cruiser</option>
                        <option value="Scooter">Scooter / EV Scooter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Fuel Type *</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="EV">Electric (EV)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Transmission *</label>
                      <select
                        value={vehicleTransmission}
                        onChange={(e) => setVehicleTransmission(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Automatic">Automatic (AMT/CVT)</option>
                        <option value="Manual">Manual Transmission</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Seating Capacity *</label>
                      <input
                        type="number"
                        value={vehicleSeats}
                        onChange={(e) => setVehicleSeats(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Reg Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. RJ 27 CA 9021"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Current Odometer (KM)</label>
                      <input
                        type="number"
                        value={vehicleOdometerKm}
                        onChange={(e) => setVehicleOdometerKm(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Car Photos & Documents Upload */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>📸 2. Car Multi-Angle Photos & Admin Verification Documents</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 font-bold text-[11px]">8 Multi-Angle Vehicle Photos</label>
                      <div className="p-3 bg-white rounded-xl border border-slate-300 text-center">
                        <Upload className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                        <span className="font-bold text-slate-800 text-[11px]">Upload Front, Back, Interior, Dashboard & Odometer</span>
                        <p className="text-[10px] text-slate-500">JPG, PNG up to 10MB per angle</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-slate-800 font-bold text-[11px]">Mandatory Verification Documents (RC, Insurance, PUC)</label>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900">
                        <ShieldCheck className="h-5 w-5 text-amber-600 mb-1" />
                        <span className="font-bold block text-[11px]">🔒 Admin Verification Only</span>
                        <p className="text-[10px] leading-tight">Documents are strictly inspected by Admin team before public approval. Never exposed to public users.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Rental Pricing & Hourly Engine Rules */}
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 space-y-3">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200 pb-2">
                    <span>💰 3. Rental Pricing & Hourly Engine Rules</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Hourly Rate (₹/hr)</label>
                      <input
                        type="number"
                        value={vehicleHourlyRate}
                        onChange={(e) => setVehicleHourlyRate(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Min Rental Hours</label>
                      <input
                        type="number"
                        value={vehicleMinHours}
                        onChange={(e) => setVehicleMinHours(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Daily Rate (₹/day)</label>
                      <input
                        type="number"
                        value={vehicleDailyRate}
                        onChange={(e) => setVehicleDailyRate(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        value={deposit}
                        onChange={(e) => setDeposit(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Extra Hour Charge (₹/hr)</label>
                      <input
                        type="number"
                        value={vehicleExtraHourRate}
                        onChange={(e) => setVehicleExtraHourRate(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">Late Return Fee (₹/hr)</label>
                      <input
                        type="number"
                        value={vehicleLateFeeRate}
                        onChange={(e) => setVehicleLateFeeRate(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Pickup & Return Settings */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>📍 4. Pickup & Return Location Settings</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Pickup Hub Address *</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Return Hub Address *</label>
                      <input
                        type="text"
                        value={vehicleReturnLocation}
                        onChange={(e) => setVehicleReturnLocation(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Usage Rules & Policies */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>⛽ 5. Usage Rules & Allowance Policies</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Included Free KM/Day</label>
                      <input
                        type="number"
                        value={vehicleIncludedKm}
                        onChange={(e) => setVehicleIncludedKm(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Extra KM Rate (₹/km)</label>
                      <input
                        type="number"
                        value={vehicleExtraKmRate}
                        onChange={(e) => setVehicleExtraKmRate(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Fuel Policy</label>
                      <select
                        value={vehicleFuelPolicy}
                        onChange={(e) => setVehicleFuelPolicy(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Full-to-Full">Full-to-Full Tank</option>
                        <option value="Same Level">Same Fuel Level as Pickup</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 9. Listing Interactive Live Preview Box */}
                <div className="bg-amber-400/10 p-4 rounded-2xl border-2 border-amber-400 space-y-3">
                  <span className="font-black text-amber-950 text-xs uppercase tracking-wider block border-b border-amber-300 pb-1.5">
                    ⭐ 9. Listing Live Preview
                  </span>
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-4">
                    <img
                      src={imageUrls[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                      alt="Car Preview"
                      className="h-20 w-28 object-cover rounded-xl border border-amber-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded">
                          {licensePlate || 'RJ 27 CA 9021'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">⭐ 4.8 (Verified)</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm truncate">{brand || 'Hyundai'} {modelName || 'Creta'} {vehicleManufacturingYear}</h4>
                      <p className="text-xs text-slate-600 font-semibold">
                        {vehicleTransmission} • {fuelType} • {vehicleSeats} Seats • {subType || 'SUV'}
                      </p>
                      <div className="flex items-center space-x-3 pt-1 text-xs">
                        <span className="font-mono font-black text-amber-700">₹{vehicleHourlyRate}/hour</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono font-bold text-slate-900">₹{vehicleDailyRate}/day</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">Deposit: <strong>₹{deposit}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clothing Specific Detailed 10-Section Wizard */}
            {listingCategory === 'clothing' && (
              <div className="sm:col-span-2 space-y-5 border-t border-slate-200 pt-4">
                <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-4 rounded-2xl text-slate-950 flex items-center justify-between shadow-md">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">👕 Clothing & Wedding Attire Listing Wizard</h3>
                    <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                      Fill all 10 sections. Submitted outfits require Admin hygiene & authenticity verification before going live.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-black bg-slate-950 text-amber-400 px-3 py-1 rounded-xl shadow-xs">
                    Admin Audit Active
                  </span>
                </div>

                {/* 1. Clothing Details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>👕 1. Clothing & Attire Details</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Attire Category *</label>
                      <select
                        value={clothingType}
                        onChange={(e) => setClothingType(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Sherwani">🕺 Royal Sherwani</option>
                        <option value="Wedding Lehenga">👰 Wedding Lehenga</option>
                        <option value="Designer Suit">🤵 Suit / Tuxedo</option>
                        <option value="Evening Gown">👗 Dress / Gown</option>
                        <option value="Traditional Saree">👘 Saree / Festive</option>
                        <option value="Jacket">🧥 Jacket / Blazer</option>
                        <option value="Shirt">👔 Designer Shirt</option>
                        <option value="Jeans/Pants">👖 Designer Trousers</option>
                        <option value="Other">👕 Indo-Western / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Target Audience *</label>
                      <select
                        value={clothingGender}
                        onChange={(e) => setClothingGender(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Boys / Men">Men (Groom / Formal)</option>
                        <option value="Girls / Women">Women (Bride / Gown)</option>
                        <option value="Kids">Kids / Children Wear</option>
                        <option value="Unisex">Unisex / Indo-Western</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Brand / Designer *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sabyasachi / Manyavar"
                        value={clothingBrand}
                        onChange={(e) => setClothingBrand(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Colour *</label>
                      <input
                        type="text"
                        placeholder="e.g. Black & Gold"
                        value={clothingColour}
                        onChange={(e) => setClothingColour(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Material / Fabric *</label>
                      <input
                        type="text"
                        placeholder="e.g. Silk, Velvet, Brocade"
                        value={clothingFabric}
                        onChange={(e) => setClothingFabric(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Pattern / Work Style</label>
                      <input
                        type="text"
                        placeholder="e.g. Heavy Zari Embroidery"
                        value={clothingPatternStyle}
                        onChange={(e) => setClothingPatternStyle(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Occasion *</label>
                      <select
                        value={clothingOccasion}
                        onChange={(e) => setClothingOccasion(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Wedding">Wedding / Reception</option>
                        <option value="Pre-wedding">Pre-wedding / Sangeet / Haldi</option>
                        <option value="Party">Party / Evening Wear</option>
                        <option value="Traditional">Traditional Festival</option>
                        <option value="Formal">Formal / Corporate</option>
                        <option value="Casual">Casual Shoot</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Size & Measurements */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>📏 2. Size & Measurements Details</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Primary Size *</label>
                      <select
                        value={clothingSize}
                        onChange={(e) => setClothingSize(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="XS">Extra Small (XS)</option>
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">Double XL (XXL)</option>
                        <option value="Free Size">Free Size / Custom Alteration</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Chest (Inches)</label>
                      <input
                        type="text"
                        value={clothingChest}
                        onChange={(e) => setClothingChest(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Waist (Inches)</label>
                      <input
                        type="text"
                        value={clothingWaist}
                        onChange={(e) => setClothingWaist(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Outfit Length (Inches)</label>
                      <input
                        type="text"
                        value={clothingLength}
                        onChange={(e) => setClothingLength(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Condition Audit */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                    <span>🧵 4. Outfit Condition & Quality Audit</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Condition Rating *</label>
                      <select
                        value={clothingConditionRating}
                        onChange={(e) => setClothingConditionRating(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Brand New">Brand New (Unworn)</option>
                        <option value="Like New">Like New (Worn Once)</option>
                        <option value="Excellent">Excellent Condition</option>
                        <option value="Good">Good Quality</option>
                        <option value="Used">Slightly Used</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        checked={clothingHasStain}
                        onChange={(e) => setClothingHasStain(e.target.checked)}
                        className="h-4 w-4 accent-amber-600 rounded cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">Has Minor Stain?</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        checked={clothingHasTear}
                        onChange={(e) => setClothingHasTear(e.target.checked)}
                        className="h-4 w-4 accent-amber-600 rounded cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">Has Minor Tear?</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        checked={clothingMissingButton}
                        onChange={(e) => setClothingMissingButton(e.target.checked)}
                        className="h-4 w-4 accent-amber-600 rounded cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">Missing Button/Hook?</span>
                    </div>
                  </div>
                </div>

                {/* 5. Rental Pricing Tiers */}
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 space-y-3">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200 pb-2">
                    <span>💰 5. Rental Pricing Tiers & Security Deposit</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">1 Day Rent (₹/day) *</label>
                      <input
                        type="number"
                        value={clothingRate1Day}
                        onChange={(e) => setClothingRate1Day(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">2 Days Rent (₹)</label>
                      <input
                        type="number"
                        value={clothingRate2Days}
                        onChange={(e) => setClothingRate2Days(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">3 Days Rent (₹)</label>
                      <input
                        type="number"
                        value={clothingRate3Days}
                        onChange={(e) => setClothingRate3Days(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">1 Week Rent (₹)</label>
                      <input
                        type="number"
                        value={clothingRate1Week}
                        onChange={(e) => setClothingRate1Week(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Security Deposit (₹) *</label>
                      <input
                        type="number"
                        value={clothingDeposit}
                        onChange={(e) => setClothingDeposit(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Late Fee (₹/day)</label>
                      <input
                        type="number"
                        value={clothingLateFeePerDay}
                        onChange={(e) => setClothingLateFeePerDay(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. Hygienic Maintenance */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-300 space-y-2 text-emerald-950 text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <Shirt className="h-5 w-5 text-emerald-600" />
                      <div>
                        <strong className="block text-emerald-900 font-extrabold">🧼 Recko Hygiene & Dry Cleaning Guarantee</strong>
                        <span className="text-[11px] text-emerald-800">Outfit is professionally dry-cleaned, steam-sanitized & sealed before delivery</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={clothingDryCleaned}
                      onChange={(e) => setClothingDryCleaned(e.target.checked)}
                      className="h-5 w-5 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* 10. Listing Interactive Live Preview Box */}
                <div className="bg-amber-400/10 p-4 rounded-2xl border-2 border-amber-400 space-y-3">
                  <span className="font-black text-amber-950 text-xs uppercase tracking-wider block border-b border-amber-300 pb-1.5">
                    👀 10. Clothing Listing Live Preview
                  </span>
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center space-x-4">
                    <img
                      src={imageUrls[0] || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&q=80'}
                      alt="Clothing Preview"
                      className="h-20 w-20 object-cover rounded-xl border border-amber-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {clothingBrand || 'Designer Sherwani'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">⭐ 4.8 (Sanitized ✓)</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm truncate">{title || `${clothingType} (${clothingGender})`}</h4>
                      <p className="text-xs text-slate-600 font-semibold">
                        {clothingColour} • Size: {clothingSize} • {clothingFabric} • {clothingOccasion}
                      </p>
                      <div className="flex items-center space-x-3 pt-1 text-xs">
                        <span className="font-mono font-black text-amber-700">₹{clothingRate1Day}/1 Day</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono font-bold text-slate-900">₹{clothingRate2Days}/2 Days</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">Deposit: <strong>₹{clothingDeposit}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

            {/* Commercial Appliance & Electronics Detailed Form (Freez, TV, AC, Coolers, Laptops, Furniture) */}
            {listingCategory === 'general' && (
              <>
                {/* 1. Appliance Name / Title Input */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Commercial Item / Appliance Name *</span>
                    <span className="text-[10px] text-blue-600 font-bold">e.g. Freez, TV, AC, Cooler, Washing Machine</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LG 260L Double Door Refrigerator 5-Star / Sony 55-inch 4K TV / Voltas 1.5 Ton AC"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                </div>

                {/* 2. Appliance Category Select */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Item Category *</label>
                  <select
                    value={applianceType}
                    onChange={(e) => setApplianceType(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-xs cursor-pointer"
                  >
                    <option value="Refrigerator / Freeze">❄️ Refrigerator / Freeze (Single/Double Door)</option>
                    <option value="Smart LED TV">📺 Smart LED TV (32" / 43" / 55" 4K)</option>
                    <option value="Air Conditioner (AC)">⚡ Air Conditioner (AC 1.5T / 2T Split/Window)</option>
                    <option value="Air Cooler">🌀 Air Cooler (Desert / Tower 70L)</option>
                    <option value="Washing Machine">🧺 Washing Machine (Automatic / Semi-Auto)</option>
                    <option value="Microwave & Oven">🍳 Microwave Oven & OTG</option>
                    <option value="Laptop & Computer">💻 Laptop / PC & Gaming Workstation</option>
                    <option value="Sofa & Living Room Furniture">🛋️ Sofa & Living Room Furniture</option>
                    <option value="Power Inverter & Battery">🔋 Power Inverter & Heavy Battery</option>
                    <option value="Camera & Photography">📷 Camera, DSLR & Lens</option>
                    <option value="Event Sound & Speakers">🔊 Event Sound System & DJ Speakers</option>
                    <option value="Fitness & Gym Equipment">🏋️ Fitness Treadmill & Gym Equipment</option>
                  </select>
                </div>

                {/* 3. Brand & Model Name */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Brand / Manufacturer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LG, Samsung, Voltas, Sony, Whirlpool, Haier, Godrej"
                    value={applianceBrand}
                    onChange={(e) => setApplianceBrand(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none shadow-xs"
                  />
                </div>

                {/* 4. Condition Rating */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Appliance Condition *</label>
                  <select
                    value={applianceCondition}
                    onChange={(e) => setApplianceCondition(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-xs cursor-pointer"
                  >
                    <option value="Brand New">✨ Brand New (Factory Sealed / Unused)</option>
                    <option value="Like New">🌟 Like New / Mint Condition (Barely Used)</option>
                    <option value="Good Condition">✅ Good Working Condition (Fully Tested)</option>
                  </select>
                </div>

                {/* 5. Pricing Tiers */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Rent Per Month (₹/mo) *</label>
                  <input
                    type="number"
                    required
                    value={applianceRentPerMonth}
                    onChange={(e) => setApplianceRentPerMonth(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-blue-700 outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Rent Per Day (₹/day)</label>
                  <input
                    type="number"
                    value={applianceRentPerDay}
                    onChange={(e) => setApplianceRentPerDay(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">Security Deposit (Refundable ₹) *</label>
                  <input
                    type="number"
                    required
                    value={applianceDeposit}
                    onChange={(e) => setApplianceDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-xs"
                  />
                </div>

                {/* 6. Doorstep Delivery & Free Installation Option */}
                <div className="sm:col-span-2 bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl space-y-2">
                  <span className="text-xs font-black text-blue-950 flex items-center space-x-1.5">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Doorstep Logistics & Technician Installation</span>
                  </span>
                  <div className="flex items-center space-x-4 text-xs font-bold text-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applianceDelivery}
                        onChange={(e) => setApplianceDelivery(e.target.checked)}
                        className="h-4 w-4 accent-blue-600 rounded"
                      />
                      <span>Provide Doorstep Delivery & Technician Setup</span>
                    </label>
                    {applianceDelivery && (
                      <div className="flex items-center space-x-1.5 ml-auto">
                        <span className="text-[11px] text-slate-500 font-bold">Delivery Fee (₹):</span>
                        <input
                          type="number"
                          value={applianceDeliveryFee}
                          onChange={(e) => setApplianceDeliveryFee(Number(e.target.value))}
                          className="w-24 p-1.5 bg-white border border-blue-300 rounded-lg text-xs font-black text-blue-700"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Live Preview Card */}
                <div className="sm:col-span-2 bg-blue-500/10 p-4 rounded-2xl border-2 border-blue-500 space-y-3">
                  <span className="font-black text-blue-950 dark:text-blue-200 text-xs uppercase tracking-wider block border-b border-blue-300 pb-1.5">
                    ❄️ Commercial Item Live Card Preview
                  </span>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center space-x-4">
                    <img
                      src={imageUrls[0] || 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80'}
                      alt="Appliance Preview"
                      className="h-20 w-24 object-cover rounded-xl border border-blue-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {applianceBrand || 'Brand Item'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">● {applianceCondition}</span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{title || `${applianceBrand} ${applianceType}`}</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                        {applianceType} • Deposit: ₹{applianceDeposit}
                      </p>
                      <div className="flex items-center space-x-3 pt-1 text-xs">
                        <span className="font-mono font-black text-blue-600">₹{applianceRentPerMonth}/month</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-200">₹{applianceRentPerDay}/day</span>
                      </div>
                    </div>
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

            {/* Property / Asset Multi-Photo Upload Section (Max 4 Photos, Max 500 KB per photo) */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span>Upload Asset Photos (3 - 4 Images)</span>
                </label>
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {imageUrls.length} / 4 Photos Added • Max 500 KB Each
                </span>
              </div>

              {/* Uploaded Photos Grid Preview */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-zinc-700 bg-slate-900 group h-32 shadow-sm">
                      <img src={url} alt={`Listing Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5 bg-slate-950/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {idx === 0 ? '🌟 Main Cover' : `Photo #${idx + 1}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Box (If fewer than 4 images added) */}
              {imageUrls.length < 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
                  {/* File Selector (Multiple Files allowed) */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3.5 text-center bg-white dark:bg-zinc-900 transition-colors flex flex-col justify-center shadow-xs">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="listing-photo-upload-multi"
                      className="hidden"
                      onChange={handleListingFileUpload}
                    />
                    <label
                      htmlFor="listing-photo-upload-multi"
                      className="cursor-pointer flex flex-col items-center space-y-1.5"
                    >
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white hover:underline">
                          Browse / Select Photos
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                          Select 1 to 4 photos from gallery (Max 500 KB per photo)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Add via Web Image URL */}
                  <div className="flex flex-col justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Or Add Direct Web Image URL
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-zinc-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer shadow-xs"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Image Verification Badge */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>AI Image Size Guard: 500 KB Limit & Multi-Photo Verification Active</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Auto-scanned</span>
              </div>
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
      </>
    )}

      </div>
    </div>
  );
};
