export type MainCategory = 'all' | 'residential' | 'commercial' | 'student' | 'vehicle' | 'hotel' | 'restaurant' | 'library' | 'general' | 'clothing' | 'sports_turf';

export type ResidentialType = 'Apartment' | 'Villa' | 'PG' | 'Hostel' | 'Independent House';
export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type CommercialType = 'Office' | 'Shop' | 'Warehouse' | 'Co-working Space' | 'Industrial Property';

export type StudentHousingType = 'College PG' | 'Student Hostel' | 'Shared Room' | 'Single Room';

export type VehicleType = 'Bike' | 'Car' | 'Scooty' | 'Bicycle' | 'Luxury Car' | 'Luxury Cars';
export type TransmissionType = 'Manual' | 'Automatic';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'EV' | 'CNG';

export type GeneralItemCategory = 'Camera & Photography' | 'Home Appliances' | 'Furniture' | 'Gadgets & Gaming' | 'Event & Sound' | 'Power Tools' | 'Camping & Fitness';

export type BusinessType = 'Property' | 'Hotel' | 'Restaurant' | 'Library' | 'Vehicle' | 'GeneralItem';

export interface LandlordUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  requestedAt: string;
  documentType?: string;
  documentPhotoUrl?: string;
  businessName?: string;
  businessType?: BusinessType;
  state?: string;
  district?: string;
  city: string;
  address?: string;
  idProofNumber?: string;
  emailVerified?: boolean;
  upiId?: string;
  upiQrUrl?: string;
}

export interface TenantUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Blocked';
  joinedDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  createdAt: string;
  avatarUrl?: string;
  avatar?: string;
  emailVerified?: boolean;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  govIdNumber?: string;
  currentAddress?: string;
}

export interface PropertyDistanceMatrix {
  railwayStationKm: number;
  busStandKm: number;
  hospitalKm: number;
  collegeKm: number;
  marketKm: number;
  metroKm: number;
}

export interface PropertyTransitTimes {
  walkMin: number;
  bikeMin: number;
  carMin: number;
}

export interface Property {
  id: string;
  title: string;
  category: MainCategory;
  type?: string;
  subType: ResidentialType | CommercialType | StudentHousingType;
  rentPerMonth: number;
  price?: number;
  deposit: number;
  securityDeposit?: number;
  bhk?: string;
  location: string;
  state?: string;
  district?: string;
  city: string;
  nearbyLandmark?: string;
  nearbyCollege?: string;
  distanceToCollegeKm?: number;
  distances?: PropertyDistanceMatrix;
  transitTimes?: PropertyTransitTimes;
  images: string[];
  imageUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt: number;
  furnishing?: FurnishingStatus;
  amenities: string[];
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified: boolean;
  ownerUpiId?: string;
  ownerQrUrl?: string;
  status?: 'Approved' | 'Pending Approval' | 'Rejected';
  aiSafetyScore?: number;
  aiFlags?: string[];
  acAvailable?: boolean;
  petFriendly?: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  availableFrom: string;
  genderPreference?: 'Boys' | 'Girls' | 'Unisex' | 'Any';
  foodIncluded?: boolean;
  isAvailable?: boolean;
  mapLink?: string;
  fullAddress?: string;
  locationScreenshot?: string;
  latitude?: number;
  longitude?: number;
}

/* Hotel Module Types */
export interface HotelRoom {
  id: string;
  roomType: 'Standard Room' | 'Deluxe Room' | 'Executive Suite' | 'Family Suite' | 'Presidential Suite';
  pricePerNight: number;
  capacity: number;
  beds: string;
  availableCount: number;
  amenities: string[];
  images: string[];
}

export interface Hotel {
  id: string;
  title: string;
  city: string;
  location: string;
  pricePerNight?: number;
  state?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  imageUrl?: string;
  price?: number;
  description: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  rooms: HotelRoom[];
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified: boolean;
  status: 'Approved' | 'Pending Approval' | 'Rejected';
  isAvailable: boolean;
  nearbyLandmark?: string;
  distances?: PropertyDistanceMatrix;
}

/* Restaurant Module Types */
export interface MenuItem {
  id: string;
  name: string;
  category: 'Starters' | 'Main Course' | 'Desserts' | 'Beverages' | 'Chef Specials';
  price: number;
  description: string;
  isVeg: boolean;
  image?: string;
}

export interface Restaurant {
  id: string;
  title: string;
  city: string;
  location: string;
  pricePerPerson?: number;
  state?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  imageUrl?: string;
  price?: number;
  description: string;
  cuisine: string[];
  openingHours: string;
  averageCostForTwo: number;
  tableTypes: string[];
  tablesCount: number;
  menu: MenuItem[];
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  phone?: string;
  ownerVerified: boolean;
  status: 'Approved' | 'Pending Approval' | 'Rejected';
  isAvailable: boolean;
  nearbyLandmark?: string;
  distances?: PropertyDistanceMatrix;
}

/* Library Module Types */
export interface LibraryMembershipPlan {
  id: string;
  name: string;
  duration: 'Daily Pass' | 'Weekly Pass' | 'Monthly Pass' | 'Quarterly Pass';
  price: number;
  features: string[];
}

export interface Library {
  id: string;
  title: string;
  city: string;
  location: string;
  monthlyFee?: number;
  state?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  imageUrl?: string;
  rentPerMonth?: number;
  price?: number;
  description: string;
  openingHours: string;
  totalSeats: number;
  availableSeats: number;
  totalCabins: number;
  availableCabins: number;
  dailyPassPrice: number;
  weeklyPassPrice: number;
  monthlyPassPrice: number;
  membershipPlans: LibraryMembershipPlan[];
  amenities: string[];
  rules: string[];
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified: boolean;
  status: 'Approved' | 'Pending Approval' | 'Rejected';
  isAvailable: boolean;
  nearbyCollege?: string;
  nearbyLandmark?: string;
  distances?: PropertyDistanceMatrix;
}

export interface RoommateProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  college: string;
  course: string;
  year: string;
  budgetPerMonth: number;
  preferredLocation: string;
  city?: string;
  distanceKm?: number;
  diet: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian';
  sleepSchedule: 'Early Riser' | 'Night Owl' | 'Flexible';
  smoking: boolean;
  petsAllowed: boolean;
  bio: string;
  studentVerified: boolean;
  avatar: string;
  lookingFor: string;
  hobbies: string[];
  phone?: string;
  moveInDate?: string;
  occupation?: string;
}

export interface Vehicle {
  id: string;
  title: string;
  vehicleType: VehicleType;
  brand: string;
  modelName: string;
  year: number;
  rentPerDay: number;
  rentPerHour: number;
  deposit: number;
  location: string;
  state?: string;
  district?: string;
  city: string;
  images: string[];
  imageUrl?: string;
  pricePerDay?: number;
  price?: number;
  transmission?: TransmissionType;
  fuelType: FuelType;
  seats?: number;
  mileageKm: string;
  driverAvailable: boolean;
  driverChargePerDay?: number;
  rating: number;
  reviewsCount: number;
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified?: boolean;
  description?: string;
  status?: 'Approved' | 'Pending Approval' | 'Rejected';
  aiSafetyScore?: number;
  aiFlags?: string[];
  isGPSAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  speedKmh?: number;
  fuelLevelPercent?: number;
  type?: VehicleType;
  licensePlate: string;
  isAvailable?: boolean;

  /* Hourly & Dynamic Rental Engine Rules */
  hourlyPrice?: number;
  dailyPrice?: number;
  weeklyPrice?: number;
  extraHourRate?: number;
  lateFeePerHour?: number;
  gracePeriodMins?: number;
  minRentalHours?: number;
  maxHourlyRentalHours?: number;
  differentLocationFee?: number;

  /* 9-Section Detailed Vehicle Listing Attributes */
  variant?: string;
  colour?: string;
  currentOdometerKm?: number;
  detailedPhotos?: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
    interior?: string;
    dashboard?: string;
    odometer?: string;
    scratches?: string;
  };
  documents?: {
    rcUrl?: string;
    insuranceUrl?: string;
    pucUrl?: string;
    ownerKycUrl?: string;
  };
  homeDeliveryAvailable?: boolean;
  deliveryCharge?: number;
  differentReturnLocationAllowed?: boolean;
  returnLocationHub?: string;
  pickupInstructions?: string;
  includedKmPerDay?: number;
  extraKmChargeRate?: number;
  fuelPolicy?: 'Same Level' | 'Full-to-Full';
  outstationAllowed?: boolean;
  borderCrossingAllowed?: boolean;
  commercialUseAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  availableDays?: string;
  availableTimeSlot?: string;
  advanceBookingNoticeHours?: number;
  ownerEmail?: string;
  ownerAddress?: string;
  ownerKycIdNumber?: string;
  ownerUpiOrBank?: string;
  ownerEmergencyContact?: string;
  cancellationPolicy?: string;
  damagePolicy?: string;
  cleaningFeeIfDirty?: number;
}

export interface GeneralItem {
  id: string;
  title: string;
  category: 'general';
  subType: GeneralItemCategory;
  rentPerDay: number;
  rentPerMonth?: number;
  deposit: number;
  location: string;
  state?: string;
  district?: string;
  city: string;
  images: string[];
  image?: string;
  imageUrl?: string;
  price?: number;
  pricePerDay?: number;
  specs: string[];
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified: boolean;
  status?: 'Approved' | 'Pending Approval' | 'Rejected';
  rating: number;
  reviewsCount: number;
  description: string;
  isAvailable?: boolean;
  condition?: 'Brand New' | 'Like New' | 'Good Condition';
}

export interface RentalBooking {
  id: string;
  type: 'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library' | 'general' | 'clothing' | 'sports_turf';
  itemId: string;
  itemTitle: string;
  itemImage: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  monthsCount?: number;
  daysCount?: number;
  totalPrice: number;
  withDriver?: boolean;
  status: 'Pending' | 'Pending Verification' | 'Owner Reviewing' | 'Approved' | 'Booking Confirmed' | 'Vehicle Picked Up' | 'Rental Active' | 'Return Pending' | 'Pending Requests' | 'Accepted' | 'Rejected' | 'Declined' | 'Completed' | 'Active' | 'Cancelled';
  trackingActive?: boolean;
  currentLat?: number;
  currentLng?: number;
  speedKmh?: number;
  fuelPercent?: number;
  userName: string;
  userPhone: string;
  studentVerified?: boolean;
  bookingDate?: string;
  ownerId?: string;
  ownerName?: string;
  ownerContact?: string;
  rejectionReason?: string;
  decisionDate?: string;

  /* Verification & Token Fields */
  tokenPaidAmount?: number;
  tokenPaymentStatus?: 'Paid' | 'Pending' | 'Refunded';
  paymentMethod?: string;
  utrNumber?: string;
  paymentTxnId?: string;
  ownerUpiId?: string;
  ownerQrUrl?: string;
  userEmail?: string;
  dob?: string;
  currentAddress?: string;
  permanentAddress?: string;
  companyCollegeName?: string;
  occupation?: string;
  monthlyIncome?: string;
  occupantsCount?: number;
  moveInDate?: string;
  expectedMoveOutDate?: string;
  rentalDurationType?: '1 month' | '6 months' | '11 months' | 'Custom';
  preferredVisitDateTime?: string;
  govIdType?: string;
  govIdNumber?: string;
  idProofUrl?: string;
  passportPhotoUrl?: string;
  emergencyContact?: string;

  /* Property Cost & Breakdown Details */
  roomType?: string;
  furnishedStatus?: string;
  maintenanceAmount?: number;
  utilityCharges?: string;
  fullAddress?: string;
  amenities?: string[];
  transactionId?: string;

  /* Comprehensive Pricing & Math Calculation Fields */
  monthlyRent?: number;
  rentPerDay?: number;
  rentPerHour?: number;
  securityDeposit?: number;
  deposit?: number;
  durationCount?: number;
  durationUnit?: 'hours' | 'days' | 'nights' | 'months';
  unitPrice?: number;
  baseRentalPrice?: number;
  maintenanceCharges?: number;
  deliveryFee?: number;
  taxAmount?: number;
  platformFee?: number;
  grossPayableAmount?: number;
  balanceDueAtHandover?: number;
  hotelRoomsCount?: number;
  hotelNightsCount?: number;

  /* Automatic Owner Mobile SMS Alert Fields */
  ownerSmsAlertSent?: boolean;
  ownerSmsAlertText?: string;
  ownerSmsDeliveredTo?: string;
  ownerSmsTimestamp?: string;
  
  /* Vehicle Rental & Digital Inspection Fields */
  vehicleType?: 'Bike' | 'Scooter' | 'Car' | 'SUV' | 'EV';
  registrationNumber?: string;
  fuelType?: string;
  transmission?: string;
  seatingCapacity?: number;
  includedKm?: number;
  extraKmCharge?: number;
  fuelPolicy?: string;
  drivingLicenseNumber?: string;
  drivingLicenseValidity?: string;
  additionalDriverName?: string;
  additionalDriverDL?: string;
  pickupDateTime?: string;
  returnDateTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  pickupOdometerKm?: number;
  returnOdometerKm?: number;
  pickupFuelLevelPercent?: number;
  returnFuelLevelPercent?: number;
  existingDamageNotes?: string;
  extraKmFeePaid?: number;
  depositSettlementAmount?: number;

  /* Hourly Rental Calculation Parameters */
  rentalDurationMode?: 'hourly' | 'daily' | 'weekly';
  pickupTime?: string;
  returnTime?: string;
  totalRentalHours?: number;
  hourlyRateCharged?: number;
  lateReturnFee?: number;
  differentLocationFeePaid?: number;

  /* Module Specific Booking Details */
  hotelRoomType?: string;
  guestsCount?: number;
  restaurantTime?: string;
  restaurantTableType?: string;
  libraryPassType?: string;
  allocatedSeatNumber?: string;
  qrCodePass?: string;
}

export interface WishlistItem {
  id: string;
  itemId: string;
  userEmail?: string;
  category: MainCategory;
  title: string;
  image: string;
  location: string;
  city: string;
  priceDisplay: string;
  rating: number;
  savedAt: string;
}

export interface AbuseReport {
  id: string;
  itemId: string;
  itemTitle: string;
  reporterName: string;
  reason: string;
  date: string;
  type: 'Fake Listing' | 'Abusive Pricing' | 'Spam Phone' | 'Duplicate Photos';
  status: 'Pending' | 'Resolved' | 'Ignored';
}

export interface OwnerNotification {
  id: string;
  ownerId: string;
  title: string;
  message: string;
  date: string;
  type: 'Booking' | 'AdminMessage' | 'System' | 'Approval';
  read: boolean;
}

export interface PropertyReview {
  id: string;
  itemId: string;
  itemType: MainCategory;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AIRecommendationRequest {
  category: MainCategory;
  budget: number;
  location: string;
  familyOrSharing: string;
  furnishingPreference?: string;
  specialNeeds?: string;
}

export interface AIRecommendationResult {
  verdict?: string;
  summary: string;
  recommendedIds: string[];
  keyFactors: string[];
  budgetTips: string;
  parsedParams?: {
    category?: MainCategory;
    maxBudget?: number;
    city?: string;
    guests?: number;
    time?: string;
  };
}

export interface JuniorAdmin {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'Junior Admin';
  permissions: {
    canManageOwners: boolean;
    canViewFeedbacks: boolean;
    canManageListings: boolean;
    canViewAnalytics: boolean;
  };
  createdBy: string;
  createdAt: string;
  status: 'Active' | 'Suspended';
}

/* Clothing & Fashion Rental Types */
export interface ClothingItem {
  id: string;
  title: string;
  category: 'clothing';
  gender: 'Boys / Men' | 'Girls / Women' | 'Kids' | 'Unisex';
  clothingType: 'Wedding Lehenga' | 'Sherwani' | 'Designer Suit' | 'Evening Gown' | 'Pre-wedding Outfit' | 'Traditional Saree' | 'Party Wear' | 'Shirt' | 'Dress' | 'Jacket' | 'Jeans/Pants' | 'Other';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size' | 'Custom';
  rentPerDay: number;
  price?: number;
  deposit: number;
  securityDeposit?: number;
  location: string;
  city: string;
  images: string[];
  imageUrl?: string;
  color?: string;
  dryCleaned: boolean;
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified?: boolean;
  status?: 'Approved' | 'Pending Approval' | 'Rejected';
  rating: number;
  reviewsCount: number;
  description: string;
  isAvailable?: boolean;
  attireType?: string;
  rentPricePerDay?: number;
  rate1Day?: number;

  /* 10-Section Clothing Listing Attributes */
  brand?: string;
  colour?: string;
  fabric?: string;
  patternStyle?: string;
  occasion?: 'Wedding' | 'Party' | 'Casual' | 'Traditional' | 'Formal' | 'Pre-wedding';
  measurements?: {
    chest?: string;
    waist?: string;
    length?: string;
    shoulder?: string;
    sleeveLength?: string;
    blouseSize?: string;
    lehengaWaist?: string;
    dupattaLength?: string;
  };
  detailedPhotos?: {
    front?: string;
    back?: string;
    side?: string;
    fabricCloseUp?: string;
    modelPhoto?: string;
    damageStainPhoto?: string;
  };
  clothingCondition?: 'Brand New' | 'Like New' | 'Excellent' | 'Good' | 'Used';
  conditionAudit?: {
    hasStain?: boolean;
    hasTear?: boolean;
    missingButton?: boolean;
    isAltered?: boolean;
  };
  pricingTiers?: {
    hourlyRate?: number;
    rate1Day?: number;
    rate2Days?: number;
    rate3Days?: number;
    rate1Week?: number;
    lateFeePerDay?: number;
  };
  deliveryOptions?: {
    selfPickup?: boolean;
    homeDelivery?: boolean;
    deliveryFee?: number;
    returnPickup?: boolean;
    boutiqueAddress?: string;
  };
  hygieneRules?: {
    dryCleanedIncluded?: boolean;
    sanitizedSteamIroned?: boolean;
    userWashingAllowed?: boolean;
    stainDamagePolicy?: string;
  };
  ownerEmail?: string;
  ownerAddress?: string;
  ownerKycId?: string;
  ownerBankUpi?: string;
}

/* Sports & Turf Rental Types */
export interface SportsTurfItem {
  id: string;
  title: string;
  category: 'sports_turf';
  turfType: 'Box Cricket Turf' | 'Football Ground' | 'Badminton Court' | 'Swimming Pool' | 'Camping & Trekking Gear' | 'Sports Equipment';
  rentPerHour: number;
  rentPerDay?: number;
  location: string;
  city: string;
  images: string[];
  imageUrl?: string;
  sportType?: string;
  amenities: string[];
  floodLights: boolean;
  ownerId?: string;
  ownerName: string;
  ownerContact: string;
  ownerVerified?: boolean;
  status?: 'Approved' | 'Pending Approval' | 'Rejected';
  rating: number;
  reviewsCount: number;
  description: string;
  isAvailable?: boolean;
  pricePerHour?: number;
  price?: number;
}

/* Global App Notification */
export interface AppNotification {
  id: string;
  userId?: string;
  userEmail?: string;
  targetPhone?: string;
  ownerId?: string;
  ownerEmail?: string;
  recipientRole?: 'user' | 'landlord' | 'admin' | 'all';
  title: string;
  message: string;
  type: 'booking' | 'approval' | 'student_discount' | 'system' | 'ai_alert' | 'image_removed';
  timestamp: string;
  read: boolean;
  link?: string;
  actionRequired?: boolean;
  assetId?: string;
}

/* Duplicate / Fake Image Audit Record */
export interface DuplicateImageAuditRecord {
  id: string;
  imageUrl: string;
  assetId: string;
  assetTitle: string;
  assetType: string;
  ownerName: string;
  ownerContact: string;
  ownerId?: string;
  action: 'Removed' | 'Flagged' | 'Whitelisted';
  removedAt: string;
  notificationSent: boolean;
  reason: string;
}



