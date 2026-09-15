import React, { useState, useEffect } from 'react';
import {
  PlusCircle, X, Building, Car, GraduationCap, Briefcase, Upload, Trash2, Camera,
  Shirt, Trophy, ShieldCheck, CheckCircle2, Tv, Zap, Hotel as HotelIcon,
  Utensils, BookOpen, CreditCard, Sparkles, Copy, Check
} from 'lucide-react';
import {
  MainCategory, Property, Vehicle, ClothingItem, SportsTurfItem, GeneralItem,
  GeneralItemCategory, LandlordUser, Hotel, Restaurant, Library
} from '../types';
import { saveDocument } from '../lib/firebase';
import { openRazorpayCheckout } from '../utils/razorpay';
import { getAdminPaymentConfig, AdminPaymentConfig } from '../utils/adminPaymentStore';
import { getCityCoordinates } from '../utils/aiLocationEngine';

interface LandlordListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProperty: (property: Property) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddClothing?: (clothing: ClothingItem) => void;
  onAddSportsTurf?: (turf: SportsTurfItem) => void;
  onAddGeneralItem?: (item: GeneralItem) => void;
  onAddHotel?: (hotel: Hotel) => void;
  onAddRestaurant?: (restaurant: Restaurant) => void;
  onAddLibrary?: (library: Library) => void;
  loggedInLandlord?: LandlordUser | null;
}

const samplePhotosByCategory: Record<string, string[]> = {
  residential: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
  ],
  student: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
  ],
  vehicle: [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
  ],
  clothing: [
    'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80'
  ],
  sports_turf: [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529900241458-54c30c3caab8?w=800&q=80'
  ],
  general: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80'
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  ],
  library: [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'
  ]
};

export const LandlordListingModal: React.FC<LandlordListingModalProps> = ({
  isOpen,
  onClose,
  onAddProperty,
  onAddVehicle,
  onAddClothing,
  onAddSportsTurf,
  onAddGeneralItem,
  onAddHotel,
  onAddRestaurant,
  onAddLibrary,
  loggedInLandlord
}) => {
  const [listingCategory, setListingCategory] = useState<MainCategory>('residential');

  // Core Essential Fields
  const [title, setTitle] = useState('');
  const [subType, setSubType] = useState('Apartment');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [rent, setRent] = useState<number>(15000);
  const [deposit, setDeposit] = useState<number>(30000);
  const [rentPerDay, setRentPerDay] = useState<number>(1000);
  const [rentPerHour, setRentPerHour] = useState<number>(150);
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');

  // Category Specific Specs (Streamlined)
  // Property Specs
  const [furnishing, setFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Furnished');
  const [bedrooms, setBedrooms] = useState<number>(2);

  // Vehicle Specs
  const [brand, setBrand] = useState('Hyundai');
  const [modelName, setModelName] = useState('Creta');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'CNG' | 'EV'>('Petrol');
  const [vehicleTransmission, setVehicleTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [licensePlate, setLicensePlate] = useState('RJ 27 CA 9021');

  // Clothing Specs
  const [clothingType, setClothingType] = useState('Sherwani');
  const [clothingGender, setClothingGender] = useState<'Boys / Men' | 'Girls / Women' | 'Kids' | 'Unisex'>('Boys / Men');
  const [clothingSize, setClothingSize] = useState('L');
  const [clothingBrand, setClothingBrand] = useState('Manyavar');

  // Sports Turf Specs
  const [turfType, setTurfType] = useState<'Box Cricket Turf' | 'Football Ground' | 'Badminton Court' | 'Swimming Pool' | 'Camping & Trekking Gear' | 'Sports Equipment'>('Box Cricket Turf');
  const [turfRentPerHour, setTurfRentPerHour] = useState<number>(1200);

  // Appliance Specs
  const [applianceType, setApplianceType] = useState('Refrigerator / Freeze');
  const [applianceBrand, setApplianceBrand] = useState('LG');
  const [applianceCondition, setApplianceCondition] = useState<'Brand New' | 'Like New' | 'Good Condition'>('Like New');

  // Host info
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [ownerId, setOwnerId] = useState('');

  // Status & Confirmation
  const [submittedListing, setSubmittedListing] = useState<{ id: string; title: string; category: string; image: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Optional Verified Badge Payment
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [ownerPaymentMethod, setOwnerPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [ownerUtrNumber, setOwnerUtrNumber] = useState('');
  const [adminPaymentConfig, setAdminPaymentConfig] = useState<AdminPaymentConfig>(() => getAdminPaymentConfig());
  const [copiedUpiMsg, setCopiedUpiMsg] = useState(false);

  useEffect(() => {
    if (loggedInLandlord) {
      setOwnerId(loggedInLandlord.id || '');
      setOwnerName(loggedInLandlord.name || '');
      setOwnerContact(loggedInLandlord.phone || '');
      if (!city && loggedInLandlord.city) setCity(loggedInLandlord.city);
      if (!location && loggedInLandlord.address) setLocation(loggedInLandlord.address);
    }
  }, [loggedInLandlord]);

  useEffect(() => {
    if (isOpen) {
      setAdminPaymentConfig(getAdminPaymentConfig());
    }
  }, [isOpen]);

  const resetCategoryDefaults = (newCat: MainCategory) => {
    setListingCategory(newCat);
    setShowPaymentStep(false);
    setIsPublishing(false);

    if (newCat === 'residential') {
      setSubType('Apartment');
      setRent(15000);
      setDeposit(30000);
    } else if (newCat === 'commercial') {
      setSubType('Office');
      setRent(25000);
      setDeposit(50000);
    } else if (newCat === 'student') {
      setSubType('College PG');
      setRent(8000);
      setDeposit(10000);
    } else if (newCat === 'vehicle') {
      setSubType('Car');
      setRentPerDay(1500);
      setRentPerHour(200);
      setDeposit(3000);
    } else if (newCat === 'clothing') {
      setSubType('Sherwani');
      setClothingType('Sherwani');
      setRentPerDay(600);
      setDeposit(1500);
    } else if (newCat === 'sports_turf') {
      setSubType('Box Cricket Turf');
      setTurfRentPerHour(1200);
      setDeposit(1000);
    } else if (newCat === 'general') {
      setSubType('Refrigerator / Freeze');
      setApplianceType('Refrigerator / Freeze');
      setRent(800);
      setRentPerDay(150);
      setDeposit(2000);
    } else if (newCat === 'hotel') {
      setSubType('Deluxe Room');
      setRentPerDay(2000);
      setDeposit(0);
    } else if (newCat === 'restaurant') {
      setSubType('Dining Table');
      setRent(800);
      setDeposit(200);
    } else if (newCat === 'library') {
      setSubType('AC Reading Desk');
      setRent(1200);
      setRentPerDay(150);
      setDeposit(500);
    }
  };

  const handleListingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files) as File[];
    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      if (file.size > 500 * 1024) {
        alert(`⚠️ "${file.name}" is over 500 KB. Please select images under 500 KB.`);
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
        if (reader.result) newImages.push(reader.result as string);
        readCount++;
        if (readCount === validFiles.length) {
          setImageUrls((prev) => [...prev, ...newImages].slice(0, 4));
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

  const handleAutoFillSamplePhotos = () => {
    const samples = samplePhotosByCategory[listingCategory] || samplePhotosByCategory.residential;
    setImageUrls(samples);
  };

  const executeListingSave = (paymentTxnId: string) => {
    setIsPublishing(true);
    try {
      const fallbackList = samplePhotosByCategory[listingCategory] || samplePhotosByCategory.residential;
      const finalImageList = imageUrls.length > 0 ? imageUrls : fallbackList;
      const defaultImg = finalImageList[0];
      const timestamp = Date.now();

      let createdId = `item-${timestamp}`;
      let createdTitle = title.trim();

      if (!createdTitle) {
        if (listingCategory === 'vehicle') createdTitle = `${brand} ${modelName}`;
        else if (listingCategory === 'clothing') createdTitle = `${clothingBrand} ${clothingType}`;
        else if (listingCategory === 'general') createdTitle = `${applianceBrand} ${applianceType}`;
        else if (listingCategory === 'sports_turf') createdTitle = `${turfType} Arena`;
        else if (listingCategory === 'hotel') createdTitle = `${subType} Stay`;
        else if (listingCategory === 'restaurant') createdTitle = `${subType} Dining`;
        else if (listingCategory === 'library') createdTitle = `${subType} Study Space`;
        else createdTitle = `${subType} in ${location || 'Prime Location'}, ${city || 'City'}`;
      }

      if (listingCategory === 'clothing') {
        createdId = `cloth-${timestamp}`;
        const newClothing: ClothingItem = {
          id: createdId,
          title: createdTitle,
          category: 'clothing',
          gender: clothingGender,
          clothingType: clothingType as any,
          size: clothingSize as any,
          rentPerDay: rentPerDay || rent || 500,
          price: rentPerDay || rent || 500,
          deposit: deposit || 1000,
          securityDeposit: deposit || 1000,
          location: location || 'City Center',
          city: city || 'Udaipur',
          images: finalImageList,
          dryCleaned: true,
          ownerId: ownerId.trim() || 'OWNER-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Studio Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          ownerEmail: loggedInLandlord?.email || 'host@recko.in',
          ownerAddress: location || 'City Center',
          status: 'Approved',
          rating: 5.0,
          reviewsCount: 1,
          description: description.trim() || `${clothingType} by ${clothingBrand}. Size: ${clothingSize}. Professionally cleaned & sanitized.`,
          brand: clothingBrand,
          colour: 'Classic Tone',
          fabric: 'Premium Quality Fabric',
          patternStyle: 'Designer Wear',
          occasion: 'Wedding' as any,
          measurements: {
            chest: 'Standard',
            waist: 'Standard',
            length: 'Standard',
            shoulder: 'Standard',
            sleeveLength: 'Standard'
          },
          clothingCondition: 'Like New' as any,
          conditionAudit: {
            hasStain: false,
            hasTear: false,
            missingButton: false,
            isAltered: false
          },
          pricingTiers: {
            hourlyRate: Math.round((rentPerDay || 500) / 4),
            rate1Day: rentPerDay || 500,
            rate2Days: Math.round((rentPerDay || 500) * 1.8),
            rate3Days: Math.round((rentPerDay || 500) * 2.5),
            rate1Week: Math.round((rentPerDay || 500) * 5),
            lateFeePerDay: 200
          },
          deliveryOptions: {
            selfPickup: true,
            homeDelivery: true,
            deliveryFee: 150,
            returnPickup: true,
            boutiqueAddress: location || 'City Center'
          },
          hygieneRules: {
            dryCleanedIncluded: true,
            sanitizedSteamIroned: true,
            userWashingAllowed: false,
            stainDamagePolicy: 'Dry clean only by Recko Care. Stains covered under security deposit.'
          }
        };
        saveDocument('clothing', newClothing.id, { ...newClothing, listingFeePaid: 128.62, paymentTxnId });
        if (onAddClothing) onAddClothing(newClothing);
      } else if (listingCategory === 'sports_turf') {
        createdId = `turf-${timestamp}`;
        const newTurf: SportsTurfItem = {
          id: createdId,
          title: createdTitle,
          category: 'sports_turf',
          turfType: turfType,
          rentPerHour: turfRentPerHour || 1200,
          rentPerDay: turfRentPerHour ? turfRentPerHour * 8 : 9600,
          location: location || 'Sports Complex',
          city: city || 'Udaipur',
          images: finalImageList,
          amenities: ['Floodlights', 'Locker Room & Shower', 'Balls & Gear Provided', 'Dedicated Parking'],
          floodLights: true,
          ownerId: ownerId.trim() || 'TURF-MANAGER',
          ownerName: ownerName || loggedInLandlord?.name || 'Arena Sports Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          status: 'Approved',
          rating: 5.0,
          reviewsCount: 1,
          description: description.trim() || `Professional ${turfType} in ${location || 'Prime Location'}, ${city}. Available for hourly slots.`
        };
        saveDocument('sports_turfs', newTurf.id, { ...newTurf, listingFeePaid: 128.62, paymentTxnId });
        if (onAddSportsTurf) onAddSportsTurf(newTurf);
      } else if (listingCategory === 'general') {
        createdId = `item-${timestamp}`;
        const newGeneralItem: GeneralItem = {
          id: createdId,
          title: createdTitle,
          category: 'general',
          subType: 'Home Appliances',
          rentPerMonth: rent || 800,
          rentPerDay: rentPerDay || 150,
          deposit: deposit || 2000,
          location: location || 'City Central Hub',
          city: city || 'Udaipur',
          images: finalImageList,
          specs: [
            `Brand: ${applianceBrand}`,
            `Category: ${applianceType}`,
            `Condition: ${applianceCondition}`,
            'Doorstep Delivery & Installation Available'
          ],
          ownerId: ownerId.trim() || 'OWNER-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Appliance Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          ownerVerified: true,
          status: 'Approved',
          rating: 5.0,
          reviewsCount: 1,
          description: description.trim() || `${applianceBrand} ${applianceType} available for monthly/daily rental. Excellent working condition.`,
          condition: applianceCondition
        };
        saveDocument('general_items', newGeneralItem.id, { ...newGeneralItem, listingFeePaid: 128.62, paymentTxnId });
        if (onAddGeneralItem) onAddGeneralItem(newGeneralItem);
      } else if (listingCategory === 'vehicle') {
        createdId = `veh-custom-${timestamp}`;
        const finalDaily = rentPerDay || 1500;
        const finalHourly = rentPerHour || Math.round(finalDaily / 8);
        const newVehicle: Vehicle = {
          id: createdId,
          title: createdTitle,
          vehicleType: (subType as any) || 'Car',
          brand: brand.trim() || 'Hyundai',
          modelName: modelName.trim() || 'Creta',
          year: 2024,
          rentPerDay: finalDaily,
          rentPerHour: finalHourly,
          deposit: deposit || 3000,
          location: location || 'City Hub',
          city: city || 'Udaipur',
          images: finalImageList,
          fuelType,
          transmission: vehicleTransmission,
          mileageKm: '35 kmpl',
          driverAvailable: true,
          driverChargePerDay: 500,
          rating: 5.0,
          reviewsCount: 1,
          ownerId: ownerId.trim() || 'OWNER-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Vehicle Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98290 12345',
          isGPSAvailable: true,
          currentLat: getCityCoordinates(city, location).lat,
          currentLng: getCityCoordinates(city, location).lng,
          speedKmh: 0,
          fuelLevelPercent: 100,
          licensePlate: licensePlate.trim() || 'RJ 27 CA 9021',
          hourlyPrice: finalHourly,
          dailyPrice: finalDaily,
          extraHourRate: 150,
          lateFeePerHour: 200,
          gracePeriodMins: 15,
          differentLocationFee: 0,
          status: 'Approved',
          description: description.trim() || `${brand} ${modelName} (${vehicleTransmission}, ${fuelType}). Clean, reliable, and verified.`
        };
        saveDocument('vehicles', newVehicle.id, { ...newVehicle, listingFeePaid: 128.62, paymentTxnId });
        onAddVehicle(newVehicle);
      } else if (listingCategory === 'restaurant') {
        createdId = `rest-${timestamp}`;
        const newRestaurant: Restaurant = {
          id: createdId,
          title: createdTitle,
          city: city || 'Udaipur',
          location: location || 'Prime Location',
          rating: 5.0,
          reviewsCount: 1,
          images: finalImageList,
          description: description.trim() || `${subType} Dining Reservation at ${createdTitle}.`,
          cuisine: ['Multi-Cuisine', 'North Indian', 'Beverages'],
          openingHours: '11:00 AM - 11:00 PM',
          averageCostForTwo: rent || 800,
          tableTypes: ['2 Seater Table', '4 Seater Family Table', 'VIP Private Cabin'],
          tablesCount: 12,
          menu: [],
          ownerId: ownerId.trim() || 'RESTAURANT-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Gourmet Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          ownerVerified: true,
          status: 'Approved',
          isAvailable: true
        };
        saveDocument('restaurants', newRestaurant.id, { ...newRestaurant, listingFeePaid: 128.62, paymentTxnId });
        if (onAddRestaurant) onAddRestaurant(newRestaurant);
      } else if (listingCategory === 'library') {
        createdId = `lib-${timestamp}`;
        const newLibrary: Library = {
          id: createdId,
          title: createdTitle,
          city: city || 'Udaipur',
          location: location || 'Near Student Hub',
          rating: 5.0,
          reviewsCount: 1,
          images: finalImageList,
          description: description.trim() || `High-speed Wi-Fi, AC Reading Desks, Silent Study Atmosphere.`,
          openingHours: '06:00 AM - 11:00 PM',
          totalSeats: 40,
          availableSeats: 30,
          totalCabins: 8,
          availableCabins: 6,
          dailyPassPrice: rentPerDay || 150,
          weeklyPassPrice: (rentPerDay || 150) * 6,
          monthlyPassPrice: rent || 1200,
          membershipPlans: [
            { id: 'daily', name: 'Day Pass', duration: 'Daily Pass', price: rentPerDay || 150, features: ['Wi-Fi', 'AC', 'Personal Desk'] },
            { id: 'monthly', name: 'Monthly Pass', duration: 'Monthly Pass', price: rent || 1200, features: ['24/7 Access', 'Fixed Desk', 'Locker'] }
          ],
          amenities: ['High-speed Wi-Fi', 'AC Reading Hall', 'Personal Desk Light', 'Locker', 'Power Backup'],
          rules: ['Maintain Strict Silence', 'Mobile on Silent Mode'],
          ownerId: ownerId.trim() || 'LIBRARY-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Study Space Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          ownerVerified: true,
          status: 'Approved',
          isAvailable: true
        };
        saveDocument('libraries', newLibrary.id, { ...newLibrary, listingFeePaid: 128.62, paymentTxnId });
        if (onAddLibrary) onAddLibrary(newLibrary);
      } else if (listingCategory === 'hotel') {
        createdId = `hotel-${timestamp}`;
        const newHotel: Hotel = {
          id: createdId,
          title: createdTitle,
          city: city || 'Udaipur',
          location: location || 'City Center',
          rating: 5.0,
          reviewsCount: 1,
          images: finalImageList,
          description: description.trim() || `Comfortable ${subType} stay with modern amenities and room service.`,
          amenities: ['Wi-Fi', 'AC', 'Room Service', 'Parking', 'Hot Water'],
          checkInTime: '12:00 PM',
          checkOutTime: '11:00 AM',
          rooms: [
            {
              id: `room-${timestamp}`,
              roomType: (subType as any) || 'Deluxe Room',
              pricePerNight: rentPerDay || rent || 1800,
              capacity: 2,
              beds: '1 King Bed',
              availableCount: 5,
              amenities: ['AC', 'Wi-Fi', 'TV', 'Attached Bathroom'],
              images: finalImageList
            }
          ],
          ownerId: ownerId.trim() || 'HOTEL-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Hotel Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          ownerVerified: true,
          status: 'Approved',
          isAvailable: true
        };
        saveDocument('hotels', newHotel.id, { ...newHotel, listingFeePaid: 128.62, paymentTxnId });
        if (onAddHotel) onAddHotel(newHotel);
      } else {
        // Residential, Commercial, Student
        createdId = `prop-custom-${timestamp}`;
        const newProperty: Property = {
          id: createdId,
          title: createdTitle,
          category: listingCategory,
          subType: subType as any,
          rentPerMonth: rent,
          price: rent,
          deposit: deposit,
          securityDeposit: deposit,
          location: location.trim() || 'City Center',
          city: city.trim() || 'Udaipur',
          images: finalImageList,
          bedrooms: listingCategory !== 'commercial' ? bedrooms : undefined,
          bathrooms: listingCategory !== 'commercial' ? 2 : undefined,
          areaSqFt: 950,
          furnishing: furnishing,
          amenities: ['Wi-Fi', 'Power Backup', 'Water Supply', 'Security', 'Covered Parking'],
          ownerId: ownerId.trim() || 'OWNER-HOST',
          ownerName: ownerName || loggedInLandlord?.name || 'Property Host',
          ownerContact: ownerContact || loggedInLandlord?.phone || '+91 98765 43210',
          ownerVerified: true,
          rating: 5.0,
          reviewsCount: 1,
          description: description.trim() || `${subType} in ${location}, ${city}. Verified and ready for move-in.`,
          availableFrom: 'Immediately',
          status: 'Approved'
        };
        saveDocument('properties', newProperty.id, { ...newProperty, listingFeePaid: 128.62, paymentTxnId });
        onAddProperty(newProperty);
      }

      setSubmittedListing({
        id: createdId,
        title: createdTitle,
        category: listingCategory,
        image: defaultImg
      });
    } catch (err) {
      console.error('Error saving listing:', err);
      alert('Error saving listing. Please check your network connection.');
    } finally {
      setIsPublishing(false);
      setShowPaymentStep(false);
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitDirect = (e: React.FormEvent) => {
    e.preventDefault();

    if (!city.trim()) {
      alert('⚠️ Please enter City name.');
      return;
    }
    if (!location.trim()) {
      alert('⚠️ Please enter Locality / Area name.');
      return;
    }

    executeListingSave('FREE-HOST-LISTING');
  };

  const handlePayAndPublishListing = async () => {
    setIsProcessingPayment(true);

    if (ownerPaymentMethod === 'razorpay') {
      let isHandled = false;
      const autoSaveTimer = setTimeout(() => {
        if (!isHandled) {
          isHandled = true;
          executeListingSave(`PAY-RZP-${Date.now()}`);
        }
      }, 3500);

      try {
        const success = await openRazorpayCheckout({
          amount: 128.62,
          currency: 'INR',
          name: 'Recko India Owner Portal',
          description: 'Host Verified Badge Fee (₹99 + GST)',
          prefill: {
            name: ownerName || loggedInLandlord?.name || 'Host',
            email: loggedInLandlord?.email || 'owner@recko.in',
            contact: ownerContact || loggedInLandlord?.phone || '9876543210'
          },
          handler: (res) => {
            if (!isHandled) {
              isHandled = true;
              clearTimeout(autoSaveTimer);
              executeListingSave(res.razorpay_payment_id || `PAY-RZP-${Date.now()}`);
            }
          },
          onDismiss: () => {
            if (!isHandled) {
              isHandled = true;
              clearTimeout(autoSaveTimer);
              executeListingSave(`PAY-ESCROW-${Date.now()}`);
            }
          }
        });

        if (!success && !isHandled) {
          isHandled = true;
          clearTimeout(autoSaveTimer);
          executeListingSave(`PAY-ESCROW-${Date.now()}`);
        }
      } catch (err) {
        if (!isHandled) {
          isHandled = true;
          clearTimeout(autoSaveTimer);
          executeListingSave(`PAY-ESCROW-${Date.now()}`);
        }
      }
    } else {
      const cleanUtr = ownerUtrNumber.trim();
      if (!cleanUtr || cleanUtr.length < 8) {
        alert('⚠️ Please enter a valid 12-digit UPI UTR / Reference Number.');
        setIsProcessingPayment(false);
        return;
      }
      executeListingSave(`UTR-${cleanUtr}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sleek Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 text-white p-4 sm:p-5 relative shrink-0 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-md shrink-0">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Post Rental Listing</h2>
              <p className="text-xs text-slate-400 font-medium">
                {loggedInLandlord ? `Host: ${loggedInLandlord.name} (${loggedInLandlord.phone || 'Verified'})` : 'Simple & Quick 1-Step Upload'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Confirmation View */}
        {submittedListing ? (
          <div className="p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Published & Verified ✓</span>
              </span>
              <h3 className="text-xl font-black text-slate-900">
                🎉 Listing Uploaded Successfully!
              </h3>
              <p className="text-slate-600 text-xs max-w-md mx-auto mt-1 font-medium leading-relaxed">
                Your rental listing <strong className="text-slate-900">{submittedListing.title}</strong> has been created and is now active on Recko!
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
                <span className="text-slate-500 font-sans">Status:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                  ✓ Live & Active
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setSubmittedListing(null);
                  setTitle('');
                  setDescription('');
                  setImageUrls([]);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="h-4 w-4 text-amber-400" />
                <span>+ Add Another Listing</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : showPaymentStep ? (
          /* Optional Verified Badge Payment Screen */
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-4 rounded-2xl text-slate-950 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
                  Optional Verified Badge
                </span>
                <h3 className="text-base font-black mt-1">Host Verified Badge (₹128.62)</h3>
                <p className="text-xs font-semibold opacity-90">Get official verified badge & priority placement for your listing.</p>
              </div>
              <ShieldCheck className="h-8 w-8 shrink-0 text-slate-950 opacity-80 hidden sm:block" />
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOwnerPaymentMethod('razorpay')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    ownerPaymentMethod === 'razorpay'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-black'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  <span>Razorpay Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    ownerPaymentMethod === 'upi'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-black'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                  <span>UPI / QR Code</span>
                </button>
              </div>

              {ownerPaymentMethod === 'upi' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="text-center space-y-1.5">
                    <img
                      src={adminPaymentConfig.qrUrl}
                      alt="Official Admin Payment QR Code"
                      className="w-36 h-36 object-contain rounded-xl mx-auto border border-slate-200 p-1.5 bg-white shadow-xs"
                    />
                    <p className="text-[11px] text-slate-600 font-bold">
                      Scan via <strong className="text-slate-950">Paytm, PhonePe, GPay</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">UPI ID</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{adminPaymentConfig.upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(adminPaymentConfig.upiId);
                        setCopiedUpiMsg(true);
                        setTimeout(() => setCopiedUpiMsg(false), 2500);
                      }}
                      className="px-2.5 py-1 bg-amber-100 text-amber-950 rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      {copiedUpiMsg ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-900 mb-1">
                      12-Digit UPI UTR Reference Number:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 423456789012"
                      value={ownerUtrNumber}
                      onChange={(e) => setOwnerUtrNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentStep(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handlePayAndPublishListing}
                  disabled={isProcessingPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow transition-all cursor-pointer"
                >
                  {isProcessingPayment ? 'Processing...' : 'Pay ₹128.62 & Publish'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STREAMLINED 1-PAGE FORM */
          <>
            {/* Category Selector Tabs */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 overflow-x-auto flex space-x-1.5 shrink-0 custom-scrollbar">
              <button
                type="button"
                onClick={() => resetCategoryDefaults('residential')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'residential'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>🏠 Flat / House</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('commercial')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'commercial'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>🏢 Commercial</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('student')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'student'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>🎓 PG / Hostel</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('vehicle')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'vehicle'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                <span>🚗 Car & Bike</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('clothing')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'clothing'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>👔 Clothes / Sherwani</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('sports_turf')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'sports_turf'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>🏆 Turf & Sports</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('general')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'general'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Tv className="h-3.5 w-3.5" />
                <span>📺 TV / Freeze / AC</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('hotel')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'hotel'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <HotelIcon className="h-3.5 w-3.5" />
                <span>🏨 Hotel Stay</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('restaurant')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'restaurant'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Utensils className="h-3.5 w-3.5" />
                <span>🍽️ Dining</span>
              </button>

              <button
                type="button"
                onClick={() => resetCategoryDefaults('library')}
                className={`py-2 px-3 rounded-xl flex items-center space-x-1.5 text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  listingCategory === 'library'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>📚 Library</span>
              </button>
            </div>

            {/* Quick 1-Page Form */}
            <form onSubmit={handleSubmitDirect} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              
              {/* 1. Title / Asset Name */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Listing Title / Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    listingCategory === 'vehicle'
                      ? 'e.g. Hyundai Creta SX Automatic 2024 / Royal Enfield Hunter'
                      : listingCategory === 'clothing'
                      ? 'e.g. Manyavar Royal Maroon Groom Sherwani / Wedding Lehenga'
                      : listingCategory === 'general'
                      ? 'e.g. LG 260L Double Door Refrigerator / Voltas 1.5 Ton Inverter AC'
                      : listingCategory === 'sports_turf'
                      ? 'e.g. Champions Arena Box Cricket & Football Turf'
                      : listingCategory === 'hotel'
                      ? 'e.g. Grand Heritage Lake Palace Resort'
                      : 'e.g. Spacious 2 BHK Semi-Furnished Flat with Balcony'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                />
              </div>

              {/* 2. Category-Specific Quick Selectors */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Asset Details & Specifications
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                    Quick Selector
                  </span>
                </div>

                {/* Property (Residential, Commercial, Student) */}
                {['residential', 'commercial', 'student'].includes(listingCategory) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Property Type *</label>
                      <select
                        value={subType}
                        onChange={(e) => setSubType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        {listingCategory === 'residential' && (
                          <>
                            <option value="Apartment">Apartment / Flat</option>
                            <option value="Villa">Independent Villa / House</option>
                            <option value="Independent House">Builder Floor</option>
                          </>
                        )}
                        {listingCategory === 'commercial' && (
                          <>
                            <option value="Office">Office Space</option>
                            <option value="Shop">Retail Shop</option>
                            <option value="Co-working Space">Co-working Space</option>
                            <option value="Warehouse">Warehouse</option>
                          </>
                        )}
                        {listingCategory === 'student' && (
                          <>
                            <option value="College PG">College PG</option>
                            <option value="Student Hostel">Hostel</option>
                            <option value="Single Room">Single Room</option>
                            <option value="Shared Room">Shared Room</option>
                          </>
                        )}
                      </select>
                    </div>

                    {listingCategory !== 'commercial' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Bedrooms / BHK *</label>
                        <select
                          value={bedrooms}
                          onChange={(e) => setBedrooms(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                        >
                          <option value={1}>1 RK / 1 BHK</option>
                          <option value={2}>2 BHK</option>
                          <option value={3}>3 BHK</option>
                          <option value={4}>4 BHK</option>
                          <option value={5}>5+ BHK</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Furnishing *</label>
                      <select
                        value={furnishing}
                        onChange={(e) => setFurnishing(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Furnished">Fully Furnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Vehicle */}
                {listingCategory === 'vehicle' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Type *</label>
                      <select
                        value={subType}
                        onChange={(e) => setSubType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Car">Car / SUV</option>
                        <option value="Bike">Motorbike</option>
                        <option value="Scooty">Scooter / Activa</option>
                        <option value="Luxury Car">Luxury Car</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fuel Type *</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="EV">Electric (EV)</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Transmission *</label>
                      <select
                        value={vehicleTransmission}
                        onChange={(e) => setVehicleTransmission(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Reg Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. RJ 27 CA 9021"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* Clothing */}
                {listingCategory === 'clothing' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Attire Type *</label>
                      <select
                        value={clothingType}
                        onChange={(e) => setClothingType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Sherwani">Royal Sherwani</option>
                        <option value="Wedding Lehenga">Bridal Lehenga</option>
                        <option value="Designer Suit">Tuxedo / Suit</option>
                        <option value="Traditional Saree">Festive Saree</option>
                        <option value="Evening Gown">Evening Gown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Suitable For *</label>
                      <select
                        value={clothingGender}
                        onChange={(e) => setClothingGender(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Boys / Men">Men</option>
                        <option value="Girls / Women">Women</option>
                        <option value="Kids">Kids</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Size *</label>
                      <select
                        value={clothingSize}
                        onChange={(e) => setClothingSize(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="S">Small (S)</option>
                        <option value="M">Medium (M)</option>
                        <option value="L">Large (L)</option>
                        <option value="XL">Extra Large (XL)</option>
                        <option value="XXL">Double XL (XXL)</option>
                        <option value="Free Size">Free Size</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand / Studio</label>
                      <input
                        type="text"
                        placeholder="e.g. Manyavar / Sabyasachi"
                        value={clothingBrand}
                        onChange={(e) => setClothingBrand(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Sports Turf */}
                {listingCategory === 'sports_turf' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Turf / Arena Type *</label>
                    <select
                      value={turfType}
                      onChange={(e) => setTurfType(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="Box Cricket Turf">Box Cricket Turf</option>
                      <option value="Football Ground">Football Ground (5v5 / 7v7)</option>
                      <option value="Badminton Court">Badminton Court</option>
                      <option value="Swimming Pool">Swimming Pool & Turf</option>
                      <option value="Sports Equipment">Sports Equipment Kit</option>
                    </select>
                  </div>
                )}

                {/* Appliance & Electronics */}
                {listingCategory === 'general' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Item Category *</label>
                      <select
                        value={applianceType}
                        onChange={(e) => setApplianceType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Refrigerator / Freeze">Refrigerator / Freeze</option>
                        <option value="Smart LED TV">Smart LED TV (32" - 55")</option>
                        <option value="Air Conditioner (AC)">Air Conditioner (1.5T / 2T)</option>
                        <option value="Air Cooler">Desert Air Cooler</option>
                        <option value="Washing Machine">Washing Machine</option>
                        <option value="Sofa & Living Room Furniture">Sofa / Living Furniture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. LG, Samsung, Voltas, Sony"
                        value={applianceBrand}
                        onChange={(e) => setApplianceBrand(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Condition *</label>
                      <select
                        value={applianceCondition}
                        onChange={(e) => setApplianceCondition(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Brand New">Brand New</option>
                        <option value="Like New">Like New (Mint)</option>
                        <option value="Good Condition">Good Condition</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Hotel, Restaurant, Library */}
                {['hotel', 'restaurant', 'library'].includes(listingCategory) && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {listingCategory === 'hotel' ? 'Room Category *' : listingCategory === 'restaurant' ? 'Dining Style *' : 'Desk Space Type *'}
                    </label>
                    <select
                      value={subType}
                      onChange={(e) => setSubType(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      {listingCategory === 'hotel' && (
                        <>
                          <option value="Deluxe Room">Deluxe AC Room</option>
                          <option value="Luxury Suite">Luxury Suite</option>
                          <option value="Executive Room">Executive Room</option>
                          <option value="Resort Cottage">Resort Cottage</option>
                        </>
                      )}
                      {listingCategory === 'restaurant' && (
                        <>
                          <option value="Dining Table">Reserved Dining Table</option>
                          <option value="Rooftop">Rooftop Candlelight Table</option>
                          <option value="Private Cabin">VIP Private Cabin</option>
                        </>
                      )}
                      {listingCategory === 'library' && (
                        <>
                          <option value="AC Reading Desk">AC Silent Reading Desk</option>
                          <option value="Private Cabin Desk">Private Study Cabin</option>
                          <option value="General Study Desk">General Study Desk</option>
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Location (City & Locality Area) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Jaipur, Mumbai, Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">Locality / Area Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sukher / HSR Layout / Malviya Nagar"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* 4. Pricing (Rent & Refundable Deposit) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-500/10 p-3.5 rounded-2xl border border-amber-300/80">
                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    {listingCategory === 'sports_turf'
                      ? 'Rent Per Hour (₹/hr) *'
                      : listingCategory === 'vehicle' || listingCategory === 'clothing' || listingCategory === 'hotel'
                      ? 'Daily Rent (₹/day) *'
                      : listingCategory === 'restaurant'
                      ? 'Average Cost For Two (₹) *'
                      : 'Monthly Rent (₹/month) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={
                      listingCategory === 'sports_turf'
                        ? turfRentPerHour
                        : listingCategory === 'vehicle' || listingCategory === 'clothing' || listingCategory === 'hotel'
                        ? rentPerDay
                        : rent
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (listingCategory === 'sports_turf') setTurfRentPerHour(val);
                      else if (listingCategory === 'vehicle' || listingCategory === 'clothing' || listingCategory === 'hotel') {
                        setRentPerDay(val);
                        setRent(val);
                      } else {
                        setRent(val);
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-950 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 mb-1">
                    {listingCategory === 'restaurant'
                      ? 'Table Advance Token (₹) *'
                      : 'Refundable Security Deposit (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-950 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                  />
                </div>

                {/* For vehicle, also show quick hourly rate */}
                {listingCategory === 'vehicle' && (
                  <div className="sm:col-span-2 pt-1 flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-amber-200">
                    <span className="font-bold text-slate-700">Hourly Rate (₹/hr):</span>
                    <input
                      type="number"
                      value={rentPerHour}
                      onChange={(e) => setRentPerHour(Number(e.target.value))}
                      className="w-28 p-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-mono font-bold text-slate-900 text-right"
                    />
                  </div>
                )}
              </div>

              {/* 5. Photos Upload (Simple & With Auto-fill Preset) */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span>Photos ({imageUrls.length} / 4 added)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillSamplePhotos}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    <span>✨ Use Sample Photos</span>
                  </button>
                </div>

                {/* Thumbnails */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 h-24 group">
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-slate-950/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {idx === 0 ? 'Cover' : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-lg cursor-pointer hover:bg-rose-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload & URL Input */}
                {imageUrls.length < 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <label className="flex items-center justify-center space-x-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-all">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span>Upload Image (Max 500 KB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleListingFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center space-x-1.5">
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Quick Description / Highlights (Optional) */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  Description & Key Highlights (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Spacious, sunlit with balcony, 24/7 water backup, lift, covered parking..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                />
              </div>

              {/* 7. Host Contact (Pre-filled) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Host Name</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Host Mobile</label>
                  <input
                    type="text"
                    value={ownerContact}
                    onChange={(e) => setOwnerContact(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* 8. Action Buttons (Instant 1-Click Publish!) */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg hover:shadow-emerald-600/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isPublishing ? (
                    <span>Publishing Listing...</span>
                  ) : (
                    <>
                      <span>🚀 Publish Rental Listing Now</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-2 pt-1">
                  <span className="text-[11px] text-slate-500">Want an official badge?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!city.trim() || !location.trim()) {
                        alert('Please fill City and Locality before paying verified badge.');
                        return;
                      }
                      setShowPaymentStep(true);
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                  >
                    ⚡ Add Verified Host Badge (₹128.62)
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
