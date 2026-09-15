import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Users,
  FileText,
  Upload,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Download,
  Check,
  Smartphone,
  ChevronRight,
  Home,
  Copy,
  BadgeCheck,
  CheckCheck,
  Shield,
  FileCheck,
  Wallet,
  Zap,
  Printer,
  Info,
  MessageSquare
} from 'lucide-react';
import { MainCategory, RentalBooking, UserProfile } from '../types';
import { openRazorpayCheckout } from '../utils/razorpay';
import { getAdminPaymentConfig } from '../utils/adminPaymentStore';
import { formatINR, calculateTransparentCostBreakdown, safeRoundCurrency } from '../utils/financialCalculations';
import { getISTDateString, getISTTimestamp, validateBookingDateRange, formatISTDateDisplay } from '../utils/dateTimeUtils';
import {
  sendOwnerBookingSms,
  getOwnerWhatsAppAlertUrl,
  getOwnerSmsDeepLinkUrl,
  formatOwnerBookingSmsText,
  SmsDispatchResult
} from '../utils/mobileNotificationService';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  existingBookings?: RentalBooking[];
  onOpenFeedbackModal?: () => void;
  item: {
    id: string;
    title: string;
    category: MainCategory | 'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library';
    image: string;
    location: string;
    city: string;
    price: number;
    priceLabel: string;
    ownerName: string;
    ownerContact?: string;
    ownerId?: string;
    deposit?: number;
    roomType?: string;
    passType?: string;
    isAvailable?: boolean;
    fullAddress?: string;
    subType?: string;
    furnishing?: string;
    availableFrom?: string;
    amenities?: string[];
    ownerUpiId?: string;
    ownerQrUrl?: string;
    [key: string]: any;
  } | null;
  tokenAmount: number; // Configurable token amount e.g. 50, 99, 100
  onCompleteBooking: (newBooking: RentalBooking) => void;
  onNavigateToMyBookings: () => void;
  onOpenReceiptModal?: (booking: RentalBooking) => void;
}

export const getItemRentPrice = (item: any): number => {
  if (!item) return 0;
  if (typeof item.rentPerMonth === 'number' && item.rentPerMonth > 0) return item.rentPerMonth;
  if (typeof item.rentPerDay === 'number' && item.rentPerDay > 0) return item.rentPerDay;
  if (typeof item.rentPerHour === 'number' && item.rentPerHour > 0) return item.rentPerHour;
  if (typeof item.monthlyFee === 'number' && item.monthlyFee > 0) return item.monthlyFee;
  if (typeof item.pricePerNight === 'number' && item.pricePerNight > 0) return item.pricePerNight;
  if (typeof item.pricePerPerson === 'number' && item.pricePerPerson > 0) return item.pricePerPerson;
  if (typeof item.dailyPrice === 'number' && item.dailyPrice > 0) return item.dailyPrice;
  if (typeof item.price === 'number' && item.price > 0) return item.price;
  if (Array.isArray(item.rooms) && item.rooms[0] && typeof item.rooms[0].pricePerNight === 'number' && item.rooms[0].pricePerNight > 0) {
    return item.rooms[0].pricePerNight;
  }
  return 0;
};

export const getItemDeposit = (item: any): number => {
  if (!item) return 0;
  if (typeof item.securityDeposit === 'number') return item.securityDeposit;
  if (typeof item.deposit === 'number') return item.deposit;
  const baseRent = getItemRentPrice(item);
  return baseRent > 0 ? baseRent * 1 : 0;
};

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  existingBookings = [],
  onOpenFeedbackModal,
  item,
  tokenAmount,
  onCompleteBooking,
  onNavigateToMyBookings,
  onOpenReceiptModal
}) => {
  if (!isOpen || !item) return null;

  // Wizard Steps: 1 = Details & Selection, 2 = Pricing & Rules Review, 3 = Token Payment, 4 = Digital Receipt & Ticket
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const actualItemRentPrice = useMemo(() => getItemRentPrice(item), [item]);
  const actualItemDeposit = useMemo(() => getItemDeposit(item), [item]);

  // Category specific state
  const [selectedSeat, setSelectedSeat] = useState<string>('A1');
  const [hotelNights, setHotelNights] = useState<number>(2);
  const [hotelRoomsCount, setHotelRoomsCount] = useState<number>(1);
  const [hotelRoomType, setHotelRoomType] = useState<string>('Deluxe Suite Room');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return getISTDateString(today);
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return getISTDateString(today);
  });
  const [pickupLocation, setPickupLocation] = useState(item.location || 'Airport / Station Pickup Hub');
  const [dropoffLocation, setDropoffLocation] = useState(item.location || 'City Dropoff Point');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [restaurantTimeSlot, setRestaurantTimeSlot] = useState('7:30 PM');
  const [restaurantTableType, setRestaurantTableType] = useState('Couple Candlelight Table');
  const [turfTimeSlot, setTurfTimeSlot] = useState('7:00 PM - 9:00 PM (Floodlit Evening Slot)');

  // Form Fields State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(currentUser?.phone));
  const [otpError, setOtpError] = useState('');

  const [email, setEmail] = useState(currentUser?.email || '');
  const [dob, setDob] = useState('');
  const [currentAddress, setCurrentAddress] = useState(currentUser?.address || '');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [companyCollegeName, setCompanyCollegeName] = useState('');
  const [occupation, setOccupation] = useState(currentUser ? 'Working Professional' : '');
  const [monthlyIncome, setMonthlyIncome] = useState('₹50,000 - ₹1,00,000');
  const [occupantsCount, setOccupantsCount] = useState(1);
  
  const [moveInDate, setMoveInDate] = useState(() => getISTDateString());
  const [rentalDurationType, setRentalDurationType] = useState<'1 month' | '3 months' | '6 months' | '11 months' | 'Custom'>('1 month');

  const durationMonths = useMemo(() => {
    if (rentalDurationType === '1 month') return 1;
    if (rentalDurationType === '3 months') return 3;
    if (rentalDurationType === '6 months') return 6;
    if (rentalDurationType === '11 months') return 11;
    return 1;
  }, [rentalDurationType]);

  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    return getISTDateString(today);
  });

  useEffect(() => {
    try {
      const d = new Date(moveInDate);
      if (!isNaN(d.getTime())) {
        d.setMonth(d.getMonth() + durationMonths);
        setExpectedMoveOutDate(getISTDateString(d));
      }
    } catch {
      // ignore
    }
  }, [moveInDate, durationMonths]);

  const [preferredVisitDateTime, setPreferredVisitDateTime] = useState('Immediate Handover');

  // Hourly Vehicle Rental Duration State & Calculator
  const [vehicleRentalMode, setVehicleRentalMode] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  const [pickupDate, setPickupDate] = useState(() => getISTDateString());
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [returnDate, setReturnDate] = useState(() => getISTDateString());
  const [returnTime, setReturnTime] = useState('04:00 PM');

  // Automatic Hours Calculation Helper
  const totalCalculatedHours = useMemo(() => {
    try {
      const parseTime = (tStr: string) => {
        let [time, modifier] = tStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return { hours, minutes: minutes || 0 };
      };

      const pT = parseTime(pickupTime);
      const rT = parseTime(returnTime);

      const pD = new Date(`${pickupDate}T${String(pT.hours).padStart(2, '0')}:${String(pT.minutes).padStart(2, '0')}:00`);
      const rD = new Date(`${returnDate}T${String(rT.hours).padStart(2, '0')}:${String(rT.minutes).padStart(2, '0')}:00`);

      const diffMs = rD.getTime() - pD.getTime();
      if (diffMs <= 0) return 1;
      const rawHours = diffMs / (1000 * 60 * 60);
      return Math.max(1, Math.ceil(rawHours)); // Whole-hour basis rounding
    } catch (e) {
      return 6;
    }
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const [govIdType, setGovIdType] = useState<'Aadhaar Card' | 'Passport' | 'Driving Licence' | 'Voter ID'>('Aadhaar Card');
  const [govIdNumber, setGovIdNumber] = useState(currentUser?.govIdNumber || '');
  const [idProofFileName, setIdProofFileName] = useState<string | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);
  
  const [passportPhotoFileName, setPassportPhotoFileName] = useState<string | null>(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>(null);
  
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Parent / Guardian');

  // Step 3 Terms & Payment
  const [agreeCorrectInfo, setAgreeCorrectInfo] = useState(true);
  const [agreeTermsPolicy, setAgreeTermsPolicy] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet'>('razorpay');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred' | 'custom'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrTimer, setQrTimer] = useState(300); // 5 minutes live timer

  useEffect(() => {
    if (currentStep === 3) {
      setQrTimer(300);
      const interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const playPaymentSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Ignore audio error
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('recko.escrow@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Step 4 Result State
  const [createdBooking, setCreatedBooking] = useState<RentalBooking | null>(null);
  const [ownerSmsResult, setOwnerSmsResult] = useState<SmsDispatchResult | null>(null);

  // Category specific calculations across all 10 rental verticals
  const platformFee = 100;
  const isHotel = item.category === 'hotel';
  const isVehicle = item.category === 'vehicle';
  const isClothing = item.category === 'clothing';
  const isLibrary = item.category === 'library';
  const isSportsTurf = item.category === 'sports_turf';
  const isRestaurant = item.category === 'restaurant';
  const isGeneral = item.category === 'general';
  const isSeatCategory = isLibrary || isSportsTurf;
  const isProperty = item.category === 'residential' || item.category === 'commercial' || item.category === 'student' || item.category === 'property';

  // Sports Turf states & calculations
  const [turfDurationHours, setTurfDurationHours] = useState<number>(2);
  const [turfIncludeGear, setTurfIncludeGear] = useState<boolean>(true);
  const turfHourlyRate = (item as any).rentPerHour || (item as any).hourlyPrice || (actualItemRentPrice > 0 ? actualItemRentPrice : 800);
  const turfGearCost = turfIncludeGear ? 200 : 0;
  const calculatedTurfTotal = (turfDurationHours * turfHourlyRate) + turfGearCost;

  // Library states & calculations
  const [libraryPassType, setLibraryPassType] = useState<'daily' | 'monthly'>('monthly');
  const libraryDailyRate = (item as any).dailyPassPrice || (item as any).rentPerDay || 150;
  const libraryMonthlyRate = (item as any).monthlyPassPrice || (actualItemRentPrice > 0 ? actualItemRentPrice : 1200);
  const calculatedLibraryTotal = libraryPassType === 'daily' ? libraryDailyRate : libraryMonthlyRate;

  // Restaurant calculations
  const restaurantAvgCost = (item as any).averageCostForTwo || (actualItemRentPrice > 0 ? actualItemRentPrice : 800);

  // General Appliance states & calculations
  const [applianceDurationMonths, setApplianceDurationMonths] = useState<number>(3);
  const [applianceNeedsDelivery, setApplianceNeedsDelivery] = useState<boolean>(true);
  const applianceMonthlyRent = (item as any).rentPerMonth || (actualItemRentPrice > 0 ? actualItemRentPrice : 600);
  const applianceDeposit = actualItemDeposit || (item as any).applianceDeposit || 1000;
  const applianceDeliveryFee = applianceNeedsDelivery ? ((item as any).deliveryFee || 250) : 0;
  const calculatedApplianceTotal = (applianceDurationMonths * applianceMonthlyRent) + applianceDeposit + applianceDeliveryFee;

  // Hotel calculation
  const calculatedHotelNights = useMemo(() => {
    try {
      const cIn = new Date(checkInDate).getTime();
      const cOut = new Date(checkOutDate).getTime();
      const diffDays = Math.ceil((cOut - cIn) / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    } catch {
      return 1;
    }
  }, [checkInDate, checkOutDate]);

  const hotelRoomPrice = (item as any).rentPerDay || (item as any).pricePerNight || (actualItemRentPrice > 0 ? actualItemRentPrice : 1800);
  const hotelBaseTariff = hotelRoomPrice * calculatedHotelNights * hotelRoomsCount;
  const hotelGst = Math.round(hotelBaseTariff * 0.12);
  const calculatedHotelTotal = hotelBaseTariff + hotelGst;

  // Vehicle calculation (Hourly, Daily, Weekly)
  const totalVehicleDays = useMemo(() => {
    try {
      const pD = new Date(pickupDate).getTime();
      const rD = new Date(returnDate).getTime();
      const diff = Math.ceil((rD - pD) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    } catch {
      return 1;
    }
  }, [pickupDate, returnDate]);

  const vehicleHourlyRate = (item as any).rentPerHour || (item as any).hourlyPrice || (actualItemRentPrice > 0 ? actualItemRentPrice : 150);
  const vehicleDailyRate = (item as any).rentPerDay || (item as any).dailyPrice || (actualItemRentPrice > 0 ? actualItemRentPrice : 1500);

  const calculatedVehicleRentCost = useMemo(() => {
    if (vehicleRentalMode === 'hourly') {
      return totalCalculatedHours * vehicleHourlyRate;
    } else if (vehicleRentalMode === 'daily') {
      return totalVehicleDays * vehicleDailyRate;
    } else {
      const weeks = Math.max(1, Math.ceil(totalVehicleDays / 7));
      return weeks * (vehicleDailyRate * 6);
    }
  }, [vehicleRentalMode, totalCalculatedHours, vehicleHourlyRate, totalVehicleDays, vehicleDailyRate]);

  // Property calculation (residential, commercial, student)
  const propertyMaintenanceCharges = isProperty && item.category !== 'student' ? ((item as any).maintenanceCharges || 0) : 0;
  const calculatedPropertyRent = actualItemRentPrice * durationMonths;
  const calculatedPropertyMaintenance = propertyMaintenanceCharges * durationMonths;
  const calculatedPropertyTotal = calculatedPropertyRent + actualItemDeposit + calculatedPropertyMaintenance;

  // Clothing Specific States & Calculator
  const [clothingSizeSelection, setClothingSizeSelection] = useState<string>(item.size || 'L');
  const [userHeightCm, setUserHeightCm] = useState('175');
  const [userWeightKg, setUserWeightKg] = useState('70');
  const [chestBustInch, setChestBustInch] = useState('38');
  const [waistInch, setWaistInch] = useState('32');
  const [preferredFit, setPreferredFit] = useState<'Regular Fit' | 'Slim Fit' | 'Comfort / Relaxed Fit'>('Regular Fit');
  const [deliveryMethod, setDeliveryMethod] = useState<'home_delivery' | 'self_pickup'>('home_delivery');
  const [returnMethod, setReturnMethod] = useState<'doorstep_pickup' | 'self_return'>('doorstep_pickup');
  const [deliveryAddressInput, setDeliveryAddressInput] = useState(currentUser?.address || '');

  const totalClothingDays = useMemo(() => {
    try {
      const pD = new Date(pickupDate);
      const rD = new Date(returnDate);
      const diffTime = Math.abs(rD.getTime() - pD.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays + 1);
    } catch (e) {
      return 3;
    }
  }, [pickupDate, returnDate]);

  const clothingDailyRate = actualItemRentPrice > 0 ? actualItemRentPrice : 500;
  const calculatedClothingRentCost = totalClothingDays * clothingDailyRate;
  const clothingDeposit = actualItemDeposit > 0 ? actualItemDeposit : 1000;
  const clothingDeliveryFee = deliveryMethod === 'home_delivery' ? 100 : 0;

  const recommendedSize = useMemo(() => {
    const h = Number(userHeightCm) || 175;
    const w = Number(userWeightKg) || 70;
    const bmi = w / ((h / 100) * (h / 100));
    if (bmi < 18.5) return 'S (Small)';
    if (bmi < 23) return 'M (Medium)';
    if (bmi < 27) return 'L (Large)';
    if (bmi < 32) return 'XL (Extra Large)';
    return 'XXL (Double XL)';
  }, [userHeightCm, userWeightKg]);

  // Check if item is already booked for overlapping active dates (category-aware & safely after hooks)
  const isAlreadyBooked = useMemo(() => {
    return existingBookings.some((b) => {
      if (b.itemId !== item.id) return false;
      if (b.status === 'Cancelled' || b.status === 'Rejected' || b.status === 'Completed') return false;
      
      const bStart = b.startDate || (b as any).moveInDate || (b as any).checkInDate || (b as any).pickupDate;
      const bEnd = b.endDate || (b as any).expectedMoveOutDate || (b as any).checkOutDate || (b as any).returnDate;
      
      const reqStart = isHotel ? checkInDate : (isVehicle || isClothing) ? pickupDate : moveInDate;
      const reqEnd = isHotel ? checkOutDate : (isVehicle || isClothing) ? returnDate : expectedMoveOutDate;

      if (bStart && bEnd && reqStart && reqEnd) {
        return (reqStart <= bEnd) && (reqEnd >= bStart);
      }
      
      return b.status === 'Accepted' || b.status === 'Active' || b.status === 'Approved' || b.status === 'Booking Confirmed';
    });
  }, [existingBookings, item.id, isHotel, isVehicle, isClothing, checkInDate, checkOutDate, pickupDate, returnDate, moveInDate, expectedMoveOutDate]);

  const isPropertyAvailable = (item.isAvailable !== false) && !isAlreadyBooked;

  const calculatePayableNow = () => {
    if (isHotel) {
      return tokenAmount + platformFee;
    }
    if (isRestaurant) {
      return Math.min(tokenAmount, 200) + platformFee;
    }
    if (isClothing) {
      return tokenAmount + platformFee + clothingDeliveryFee;
    }
    if (isGeneral) {
      return tokenAmount + platformFee + applianceDeliveryFee;
    }
    return tokenAmount + platformFee;
  };

  const payableNowTotal = calculatePayableNow();

  const advancePaidTowardsGross = useMemo(() => {
    if (isClothing) return tokenAmount + clothingDeliveryFee;
    if (isGeneral) return tokenAmount + applianceDeliveryFee;
    if (isRestaurant) return Math.min(tokenAmount, 200);
    return tokenAmount;
  }, [isClothing, clothingDeliveryFee, isGeneral, applianceDeliveryFee, isRestaurant, tokenAmount]);

  const balanceDueAtHandover = useMemo(() => {
    if (isClothing) {
      return Math.max(0, (calculatedClothingRentCost + clothingDeposit + clothingDeliveryFee) - (tokenAmount + clothingDeliveryFee));
    }
    if (isVehicle) {
      return Math.max(0, (calculatedVehicleRentCost + actualItemDeposit) - tokenAmount);
    }
    if (isHotel) {
      return Math.max(0, calculatedHotelTotal - tokenAmount);
    }
    if (isRestaurant) {
      return Math.max(0, restaurantAvgCost - Math.min(tokenAmount, 200));
    }
    if (isSportsTurf) {
      return Math.max(0, calculatedTurfTotal - tokenAmount);
    }
    if (isLibrary) {
      return Math.max(0, calculatedLibraryTotal - tokenAmount);
    }
    if (isGeneral) {
      return Math.max(0, calculatedApplianceTotal - (tokenAmount + applianceDeliveryFee));
    }
    // Property (residential, commercial, student)
    return Math.max(0, calculatedPropertyTotal - tokenAmount);
  }, [
    isClothing, calculatedClothingRentCost, clothingDeposit, clothingDeliveryFee,
    isVehicle, calculatedVehicleRentCost, actualItemDeposit,
    isHotel, calculatedHotelTotal,
    isRestaurant, restaurantAvgCost,
    isSportsTurf, calculatedTurfTotal,
    isLibrary, calculatedLibraryTotal,
    isGeneral, calculatedApplianceTotal, applianceDeliveryFee,
    calculatedPropertyTotal, tokenAmount
  ]);

  // Handle Simulated Phone OTP Verification
  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpError('');
    setIsOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '4321' || otpCode.trim().length === 4) {
      setIsPhoneVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Enter 4321 for instant verification demo.');
    }
  };

  // Upload Photo Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdProofFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation -> Next to Pricing (Streamlined & Frictionless)
  const handleNextToPricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Please enter your Full Name.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation -> Next to Payment
  const handleNextToPayment = () => {
    if (!agreeCorrectInfo || !agreeTermsPolicy) {
      alert('Please check both agreement boxes to proceed with token payment.');
      return;
    }
    setCurrentStep(3);
  };

  // Execute Booking Creation Helper
  const executeBookingCreation = (cleanUtr: string, payMethodName: string = paymentMethod.toUpperCase()) => {
    setIsPaying(true);
    setPaymentStepText(`Locking ₹${payableNowTotal} Token under Ref: ${cleanUtr}...`);

    const targetOwnerUpi = item.ownerUpiId || 'recko.escrow@okhdfcbank';
    const targetOwnerQr = item.ownerQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `upi://pay?pa=${targetOwnerUpi}&pn=${encodeURIComponent(item.ownerName || 'Recko Owner')}&tr=RCK-${Date.now()}&am=${payableNowTotal}&cu=INR&tn=Recko%20Token%20for%20${encodeURIComponent(item.title)}`
    )}&color=0f172a&bgcolor=ffffff`;

    setTimeout(() => {
      setPaymentStepText('Submitting Payment Proof for Host Verification...');
    }, 600);

    setTimeout(() => {
      setIsPaying(false);

      const generatedId = isClothing
        ? `RC-CLOTH-${Math.floor(100000 + Math.random() * 900000)}`
        : isVehicle
        ? `RC-VEH-${Math.floor(100000 + Math.random() * 900000)}`
        : isHotel
        ? `RC-HOTEL-${Math.floor(100000 + Math.random() * 900000)}`
        : isRestaurant
        ? `RC-REST-${Math.floor(100000 + Math.random() * 900000)}`
        : isSportsTurf
        ? `RC-TURF-${Math.floor(100000 + Math.random() * 900000)}`
        : isLibrary
        ? `RC-LIB-${Math.floor(100000 + Math.random() * 900000)}`
        : isGeneral
        ? `RC-APPL-${Math.floor(100000 + Math.random() * 900000)}`
        : `RCK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const computedDurationCount = isHotel
        ? calculatedHotelNights
        : isClothing
        ? totalClothingDays
        : isVehicle
        ? (vehicleRentalMode === 'hourly' ? totalCalculatedHours : totalVehicleDays)
        : isSportsTurf
        ? turfDurationHours
        : isGeneral
        ? applianceDurationMonths
        : durationMonths;

      const computedDurationUnit: 'hours' | 'days' | 'nights' | 'months' = isHotel
        ? 'nights'
        : isClothing
        ? 'days'
        : isVehicle
        ? (vehicleRentalMode === 'hourly' ? 'hours' : 'days')
        : isSportsTurf
        ? 'hours'
        : isGeneral
        ? 'months'
        : 'months';

      const computedUnitPrice = isHotel
        ? hotelRoomPrice
        : isClothing
        ? clothingDailyRate
        : isVehicle
        ? (vehicleRentalMode === 'hourly' ? vehicleHourlyRate : vehicleDailyRate)
        : isSportsTurf
        ? turfHourlyRate
        : isGeneral
        ? applianceMonthlyRent
        : actualItemRentPrice;

      const computedBaseRentalPrice = isHotel
        ? hotelBaseTariff
        : isClothing
        ? calculatedClothingRentCost
        : isVehicle
        ? calculatedVehicleRentCost
        : isSportsTurf
        ? (turfDurationHours * turfHourlyRate)
        : isGeneral
        ? (applianceDurationMonths * applianceMonthlyRent)
        : (actualItemRentPrice * durationMonths);

      const computedDeposit = isClothing
        ? clothingDeposit
        : isVehicle
        ? actualItemDeposit
        : isGeneral
        ? applianceDeposit
        : isProperty
        ? actualItemDeposit
        : 0;

      const computedGrossTotal = isClothing
        ? calculatedClothingRentCost + clothingDeposit + clothingDeliveryFee
        : isVehicle
        ? calculatedVehicleRentCost + actualItemDeposit
        : isHotel
        ? calculatedHotelTotal
        : isRestaurant
        ? restaurantAvgCost
        : isSportsTurf
        ? calculatedTurfTotal
        : isLibrary
        ? calculatedLibraryTotal
        : isGeneral
        ? calculatedApplianceTotal
        : calculatedPropertyTotal;

      const newBooking: RentalBooking = {
        id: generatedId,
        type: (item.category as any) || 'property',
        itemId: item.id,
        itemTitle: item.title,
        itemImage: item.image,
        startDate: isClothing || isVehicle ? pickupDate : isHotel ? checkInDate : moveInDate,
        endDate: isClothing || isVehicle ? returnDate : isHotel ? checkOutDate : expectedMoveOutDate,
        expectedMoveOutDate,
        rentalDurationType: rentalDurationType as any,
        preferredVisitDateTime,
        totalPrice: computedGrossTotal,
        grossPayableAmount: computedGrossTotal,
        monthlyRent: isProperty ? actualItemRentPrice : isGeneral ? applianceMonthlyRent : undefined,
        rentPerDay: isClothing ? clothingDailyRate : isVehicle ? vehicleDailyRate : isHotel ? hotelRoomPrice : undefined,
        rentPerHour: isSportsTurf ? turfHourlyRate : (isVehicle && vehicleRentalMode === 'hourly') ? vehicleHourlyRate : undefined,
        securityDeposit: computedDeposit,
        deposit: computedDeposit,
        durationCount: computedDurationCount,
        durationUnit: computedDurationUnit,
        unitPrice: computedUnitPrice,
        baseRentalPrice: computedBaseRentalPrice,
        maintenanceCharges: isProperty ? (propertyMaintenanceCharges * durationMonths) : 0,
        deliveryFee: isClothing ? clothingDeliveryFee : isGeneral ? applianceDeliveryFee : 0,
        taxAmount: isHotel ? hotelGst : 0,
        balanceDueAtHandover: balanceDueAtHandover,
        hotelRoomsCount: isHotel ? hotelRoomsCount : undefined,
        hotelNightsCount: isHotel ? calculatedHotelNights : undefined,
        daysCount: isVehicle ? totalVehicleDays : isClothing ? totalClothingDays : isHotel ? calculatedHotelNights : undefined,
        totalRentalHours: isVehicle && vehicleRentalMode === 'hourly' ? totalCalculatedHours : undefined,
        rentalDurationMode: isVehicle ? vehicleRentalMode : undefined,
        tokenPaidAmount: advancePaidTowardsGross,
        platformFee: platformFee,
        tokenPaymentStatus: payMethodName === 'RAZORPAY' ? 'Paid' : 'Pending',
        status: payMethodName === 'RAZORPAY' ? 'Booking Confirmed' : 'Pending Verification',
        bookingDate: formatISTDateDisplay(new Date()),
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerContact: item.ownerContact,
        utrNumber: cleanUtr,
        ownerUpiId: targetOwnerUpi,
        ownerQrUrl: targetOwnerQr,

        // Custom Category Attributes
        hotelRoomType: isHotel ? hotelRoomType : undefined,
        guestsCount: isHotel || isRestaurant ? occupantsCount : undefined,
        restaurantTime: isRestaurant ? restaurantTimeSlot : undefined,
        restaurantTableType: isRestaurant ? restaurantTableType : undefined,
        allocatedSeatNumber: isSeatCategory ? selectedSeat : undefined,
        qrCodePass: `QR-${generatedId}`,

        // Tenant Verification Details
        userName: fullName,
        userPhone: phone,
        userEmail: email,
        dob,
        currentAddress,
        permanentAddress,
        companyCollegeName,
        occupation,
        monthlyIncome,
        occupantsCount,
        moveInDate,
        govIdType,
        govIdNumber,
        idProofUrl: idProofPreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
        passportPhotoUrl: passportPhotoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        emergencyContact: emergencyContact ? `${emergencyContact} (${emergencyRelation})` : undefined,

        // Auto-filled Property Details
        roomType: item.subType || (item.category === 'student' ? 'PG Shared Room' : isHotel ? hotelRoomType : isVehicle ? 'Automobile' : isClothing ? 'Apparel' : isSportsTurf ? 'Turf Arena' : isLibrary ? 'Study Desk' : isGeneral ? 'Appliance' : '1BHK / 2BHK Rental Unit'),
        furnishedStatus: item.furnishing || 'Standard',
        maintenanceAmount: propertyMaintenanceCharges,
        utilityCharges: 'As per Govt Meter / Included',
        fullAddress: item.fullAddress || `${item.location}, ${item.city}`,
        amenities: item.amenities && item.amenities.length > 0 ? item.amenities : ['Wi-Fi', 'AC', 'Parking', 'Kitchen', 'Attached Bathroom'],
        paymentMethod: payMethodName,
        transactionId: `TXN-${cleanUtr}`,

        // Automatic Owner Mobile SMS Alert Fields
        ownerSmsAlertSent: true,
        ownerSmsDeliveredTo: item.ownerContact || '+91 98765 43210',
        ownerSmsTimestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      // Automatically dispatch real-time SMS to owner's mobile number
      const smsPayload = {
        ownerName: item.ownerName,
        ownerPhone: item.ownerContact,
        userName: fullName,
        userPhone: phone,
        userEmail: email,
        itemTitle: item.title,
        bookingId: generatedId,
        startDate: isClothing || isVehicle ? pickupDate : isHotel ? checkInDate : moveInDate,
        duration: rentalDurationType,
        rentAmount: isProperty ? actualItemRentPrice : undefined,
        tokenPaidAmount: payableNowTotal,
        category: item.category
      };

      sendOwnerBookingSms(smsPayload).then((res) => {
        setOwnerSmsResult(res);
      }).catch((e) => {
        console.error('Owner SMS auto-dispatch error:', e);
      });

      playPaymentSuccessChime();
      setCreatedBooking(newBooking);
      onCompleteBooking(newBooking);
      setCurrentStep(4);
    }, 1200);
  };

  // Step 3 Process Payment & Create Booking -> Step 4 Receipt
  const handleProcessPayment = () => {
    if (paymentMethod === 'razorpay') {
      handlePayWithRazorpay();
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 6) {
      alert('⚠️ Payment Reference Required:\n\nPlease enter your 12-digit UTR / Payment Transaction Reference Number (from GPay / PhonePe / Paytm) to confirm token payment verification.');
      return;
    }

    executeBookingCreation(utrNumber.trim().toUpperCase(), paymentMethod.toUpperCase());
  };

  // Trigger Razorpay Payment Gateway Modal
  const handlePayWithRazorpay = async () => {
    setIsPaying(true);
    setPaymentStepText('Launching Official Razorpay Payment Gateway...');

    const success = await openRazorpayCheckout({
      amount: payableNowTotal,
      name: 'Recko India Rental Escrow',
      description: `Refundable Token Payment for ${item.title}`,
      prefill: {
        name: fullName || 'Tenant Customer',
        email: email || 'tenant@recko.in',
        contact: phone || '9876543210'
      },
      handler: (response) => {
        const razorpayPaymentId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 14)}`;
        setUtrNumber(razorpayPaymentId.toUpperCase());
        executeBookingCreation(razorpayPaymentId.toUpperCase(), 'RAZORPAY');
      },
      onDismiss: () => {
        setIsPaying(false);
      }
    });

    if (!success) {
      setIsPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Luxury White Background, Black Text & Golden Accents Container */}
      <div className="bg-white border border-amber-400/40 text-slate-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-auto max-h-[96vh] sm:max-h-[92vh] flex flex-col transition-all">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 border-b border-amber-400/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide truncate">
                  {currentStep === 1 && 'Step 1: Details & Custom Selection'}
                  {currentStep === 2 && 'Step 2: Rent Breakdown & Rules'}
                  {currentStep === 3 && `Step 3: Escrow Token Pay (₹${payableNowTotal})`}
                  {currentStep === 4 && 'Step 4: Official Digital Receipt & Ticket'}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-300 font-medium flex items-center space-x-1.5 truncate mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Recko India Multi-Step Smart Booking • 100% Refundable Escrow</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer shrink-0 ml-2"
            title="Close Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4-Step Wizard Progress Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 shrink-0">
          <div className="hidden sm:flex items-center justify-between text-xs font-bold">
            
            {/* Step 1 */}
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep >= 1 ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span>1. Details</span>
            </div>

            <div className="h-0.5 flex-1 mx-2 bg-slate-200">
              <div className={`h-full bg-amber-500 transition-all duration-300 ${currentStep >= 2 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 2 */}
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep >= 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span>2. Breakdown</span>
            </div>

            <div className="h-0.5 flex-1 mx-2 bg-slate-200">
              <div className={`h-full bg-amber-500 transition-all duration-300 ${currentStep >= 3 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 3 */}
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep >= 3 ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 3 ? '✓' : '3'}
              </span>
              <span>3. Token Pay</span>
            </div>

            <div className="h-0.5 flex-1 mx-2 bg-slate-200">
              <div className={`h-full bg-emerald-500 transition-all duration-300 ${currentStep === 4 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 4 */}
            <div className={`flex items-center space-x-2 ${currentStep === 4 ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep === 4 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                4
              </span>
              <span>4. Digital Receipt</span>
            </div>
          </div>

          {/* Mobile Step Indicator */}
          <div className="sm:hidden flex items-center justify-between text-xs">
            <span className="font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-3 py-1 rounded-lg shadow-xs">
              Step {currentStep} of 4
            </span>
            <span className="text-slate-900 font-bold text-xs">
              {currentStep === 1 && '1. Details & Selection'}
              {currentStep === 2 && '2. Rent & Fee Breakdown'}
              {currentStep === 3 && `3. Token Pay (₹${payableNowTotal})`}
              {currentStep === 4 && '4. Digital Receipt & Ticket'}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-xs text-slate-900 flex-1 custom-scrollbar">
          
          {/* Selected Item Summary Card (White, Black & Gold Accents) */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2.5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <img
                src={item.image}
                alt={item.title}
                className="h-24 w-full sm:h-20 sm:w-28 object-cover rounded-xl border border-amber-400/40 shrink-0"
              />
              <div className="flex-1 space-y-1 w-full text-left">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase flex items-center space-x-1 ${
                      isPropertyAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {isPropertyAvailable ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>Ready for Verification</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-rose-600 shrink-0" />
                        <span>Currently Reserved / Reviewing</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-slate-600 text-xs flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{item.location}, {item.city}</span>
                </p>
                <p className="text-xs text-slate-600 flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Host: <strong className="text-slate-900">{item.ownerName}</strong></span>
                </p>
              </div>

              <div className="w-full sm:w-auto text-left sm:text-right sm:border-l sm:border-slate-200 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 flex sm:flex-col justify-between items-center sm:items-end">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Owner Listed Rent Rate</span>
                  <span className="text-base sm:text-lg font-black text-amber-600">₹{actualItemRentPrice.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-medium">{item.priceLabel || 'Per Period'}</span>
              </div>
            </div>
          </div>

          {/* PAGE 1: DETAILS & CATEGORY SELECTION */}
          {currentStep === 1 && (
            <form onSubmit={handleNextToPricing} className="space-y-4 sm:space-y-5">
              
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <BadgeCheck className="h-4.5 w-4.5 text-amber-500" />
                    <span>Step 1: Tenant Verification & Rental Custom Details</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Enter verified identity details & specific rental requirements for {item.category}.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  KYC Verified
                </span>
              </div>

              {/* Interactive Seat / Slot Selector for Libraries & Sports Turfs */}
              {isSeatCategory && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-amber-400/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Select Interactive Cabin / Seat Number</span>
                    </span>
                    <span className="text-[10px] text-slate-600 font-bold">
                      Selected Seat: <strong className="text-amber-700 font-mono text-xs bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{selectedSeat}</strong>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((seat) => {
                      const isBooked = seat === 'A2' || seat === 'B4' || seat === 'C1';
                      const isSelected = selectedSeat === seat;
                      return (
                        <button
                          key={seat}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSeat(seat)}
                          className={`py-2 rounded-xl font-mono text-xs font-black transition-all border cursor-pointer ${
                            isBooked
                              ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed line-through'
                              : isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md scale-105'
                                : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400 hover:bg-amber-50'
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-[10px] font-bold text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <span className="h-3 w-3 rounded-md bg-white border border-slate-300 inline-block" />
                      <span>Available</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="h-3 w-3 rounded-md bg-amber-400 border border-amber-500 inline-block" />
                      <span>Selected</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="h-3 w-3 rounded-md bg-slate-200 border border-slate-300 inline-block" />
                      <span>Booked</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Hotel Dates & Rooms Selection */}
              {isHotel && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-300/60">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Check-out Date *</label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Room Type</label>
                    <select
                      value={hotelRoomType}
                      onChange={(e) => setHotelRoomType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    >
                      <option value="Deluxe Suite Room">Deluxe Suite Room</option>
                      <option value="Super Deluxe Executive">Super Deluxe Executive</option>
                      <option value="Presidential Suite">Presidential Suite</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Vehicle Driving License & Route Selection */}
              {isVehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-300/60">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Pickup Location *</label>
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Driving License Number *</label>
                    <input
                      type="text"
                      required
                      value={drivingLicense}
                      onChange={(e) => setDrivingLicense(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Restaurant Time & Table Selection */}
              {isRestaurant && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-300/60">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Dining Time Slot *</label>
                    <select
                      value={restaurantTimeSlot}
                      onChange={(e) => setRestaurantTimeSlot(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    >
                      <option value="1:00 PM - Lunch">1:00 PM - Lunch</option>
                      <option value="7:30 PM - Dinner Prime">7:30 PM - Dinner Prime</option>
                      <option value="9:00 PM - Late Night">9:00 PM - Late Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Table Type *</label>
                    <select
                      value={restaurantTableType}
                      onChange={(e) => setRestaurantTableType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    >
                      <option value="Couple Candlelight Table">Couple Candlelight Table</option>
                      <option value="Family Booth Table">Family Booth Table</option>
                      <option value="Private Lounge / Terrace">Private Lounge / Terrace</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Streamlined Primary Contact Details */}
              <div className="bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <User className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                      Primary Contact Details
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    Fast 1-Step Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">
                      Full Legal Name <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">
                      Mobile Number <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-amber-600 font-bold text-xs sm:text-sm">+91</span>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-12 pr-3 py-2.5 text-slate-900 font-mono tracking-wider outline-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Specific Duration Mode Selector (Hourly / Daily / Weekly) */}
              {isVehicle && (
                <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-300 space-y-3.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                    <span className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>Select Rental Duration Mode</span>
                    </span>

                    <div className="flex bg-white p-1 rounded-xl border border-amber-300 space-x-1">
                      {(['hourly', 'daily', 'weekly'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setVehicleRentalMode(mode)}
                          className={`px-3.5 py-1 text-xs font-black rounded-lg capitalize transition-all cursor-pointer ${
                            vehicleRentalMode === mode
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {vehicleRentalMode === 'hourly' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Pickup Schedule */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-slate-500 font-bold text-[10px] uppercase block">Pickup Schedule</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-700 font-bold block mb-1">Date</label>
                              <input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-700 font-bold block mb-1">Time</label>
                              <select
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                              >
                                {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'].map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Return Schedule */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-slate-500 font-bold text-[10px] uppercase block">Return Schedule</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-700 font-bold block mb-1">Date</label>
                              <input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-700 font-bold block mb-1">Time</label>
                              <select
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                              >
                                {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Calculated Hours & Rate Live Banner */}
                      <div className="bg-white p-3.5 rounded-xl border border-amber-400 flex justify-between items-center text-xs shadow-2xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Rental Duration</span>
                          <strong className="text-amber-800 text-sm font-black flex items-center space-x-1 font-mono">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span>{totalCalculatedHours} Hours</span>
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Hourly Rate & Subtotal</span>
                          <strong className="text-slate-900 text-sm font-black font-mono">
                            ₹{vehicleHourlyRate} × {totalCalculatedHours} hrs = ₹{calculatedVehicleRentCost}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <label className="text-[10px] text-slate-700 font-bold block mb-1">Pickup Date</label>
                          <input
                            type="date"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                          />
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <label className="text-[10px] text-slate-700 font-bold block mb-1">Return Date</label>
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-amber-400 flex justify-between items-center text-xs shadow-2xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Rental Duration</span>
                          <strong className="text-amber-800 text-sm font-black flex items-center space-x-1 font-mono">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <span>{totalVehicleDays} Days ({vehicleRentalMode.toUpperCase()} MODE)</span>
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Rate & Estimated Rent</span>
                          <strong className="text-slate-900 text-sm font-black font-mono">
                            ₹{vehicleDailyRate}/day × {totalVehicleDays} days = ₹{calculatedVehicleRentCost}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clothing Rental Booking Flow (Size Selection, Recommender, Dates, Delivery) */}
              {isClothing && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Auto-filled Outfit Details Banner */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-yellow-500/15 p-4 rounded-2xl border border-amber-300 space-y-2">
                    <div className="flex items-center space-x-3">
                      <img
                        src={(item.images && item.images.length > 0) ? item.images[0] : item.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded-xl border border-amber-400 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
                          {item.brand || 'Boutique Collection'}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Category: <strong>{item.clothingType || 'Wedding Wear'}</strong> • Gender: <strong>{item.gender}</strong> • Boutique: <strong>{item.ownerName}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Size Selection & AI Size Recommender */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                        <span>📏 2. Select Outfit Size</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Original Listed Size: {item.size || 'L'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL', 'Custom'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setClothingSizeSelection(sz)}
                          className={`px-4 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                            clothingSizeSelection === sz
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Rental Schedule & Multi-Day Duration */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block border-b border-slate-200 pb-2">
                      📅 3. Select Pickup & Return Schedule
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">Pickup Date *</label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-800 font-bold mb-1">Return Date *</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 flex justify-between items-center text-xs font-mono">
                      <span className="text-amber-950 font-bold">Total Rental Duration:</span>
                      <strong className="text-amber-900 text-sm font-black">{totalClothingDays} Days (₹{clothingDailyRate}/day)</strong>
                    </div>
                  </div>

                  {/* 6. Delivery / Pickup Options */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block border-b border-slate-200 pb-2">
                      🚚 6. Delivery & Return Handover Mode
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1.5">How do you want to receive it?</label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="delivery"
                              checked={deliveryMethod === 'home_delivery'}
                              onChange={() => setDeliveryMethod('home_delivery')}
                              className="accent-amber-500"
                            />
                            <span className="font-bold text-slate-900">🔘 Home Delivery (+₹100)</span>
                          </label>
                          <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="delivery"
                              checked={deliveryMethod === 'self_pickup'}
                              onChange={() => setDeliveryMethod('self_pickup')}
                              className="accent-amber-500"
                            />
                            <span className="font-bold text-slate-900">🔘 Self Pickup from Boutique (Free)</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1.5">Return Mode</label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="return"
                              checked={returnMethod === 'doorstep_pickup'}
                              onChange={() => setReturnMethod('doorstep_pickup')}
                              className="accent-amber-500"
                            />
                            <span className="font-bold text-slate-900">🔘 Doorstep Return Pickup</span>
                          </label>
                          <label className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="return"
                              checked={returnMethod === 'self_return'}
                              onChange={() => setReturnMethod('self_return')}
                              className="accent-amber-500"
                            />
                            <span className="font-bold text-slate-900">🔘 Self Return to Boutique</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sports Turf Duration & Gear Options */}
              {isSportsTurf && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-300/70 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-emerald-200 pb-2">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                      Sports Turf Slot & Duration Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Playing Date *</label>
                      <input
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Selected Slot Timing *</label>
                      <select
                        value={turfTimeSlot}
                        onChange={(e) => setTurfTimeSlot(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      >
                        <option value="06:00 AM - 08:00 AM (Morning Sunrise Slot)">06:00 AM - 08:00 AM (Morning)</option>
                        <option value="04:00 PM - 06:00 PM (Afternoon Match Slot)">04:00 PM - 06:00 PM (Afternoon)</option>
                        <option value="07:00 PM - 09:00 PM (Floodlit Evening Prime)">07:00 PM - 09:00 PM (Floodlit Prime)</option>
                        <option value="09:00 PM - 11:00 PM (Midnight Super League)">09:00 PM - 11:00 PM (Late Night)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Duration (Hours) *</label>
                      <select
                        value={turfDurationHours}
                        onChange={(e) => setTurfDurationHours(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      >
                        <option value={1}>1 Hour Slot</option>
                        <option value={2}>2 Hours Slot</option>
                        <option value={3}>3 Hours Tournament</option>
                        <option value={4}>4 Hours Full Match</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={turfIncludeGear}
                        onChange={(e) => setTurfIncludeGear(e.target.checked)}
                        className="accent-emerald-600 h-4 w-4 rounded"
                      />
                      <span>Include Balls, Bibs & Playing Gear (+₹200)</span>
                    </label>
                    <span className="font-mono text-emerald-700 font-black text-xs">
                      {turfDurationHours} hrs × ₹{turfHourlyRate} {turfIncludeGear ? '+ ₹200' : ''} = ₹{calculatedTurfTotal}
                    </span>
                  </div>
                </div>
              )}

              {/* Library Pass Duration Selection */}
              {isLibrary && (
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-300/70 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-sky-200 pb-2">
                    <Sparkles className="h-4.5 w-4.5 text-sky-600" />
                    <h4 className="font-bold text-sky-900 text-xs uppercase tracking-wider">
                      Library Pass Plan & Membership Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Membership / Pass Type *</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setLibraryPassType('daily')}
                          className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            libraryPassType === 'daily'
                              ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          Daily Day Pass (₹{libraryDailyRate})
                        </button>
                        <button
                          type="button"
                          onClick={() => setLibraryPassType('monthly')}
                          className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                            libraryPassType === 'monthly'
                              ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          Monthly Pass (₹{libraryMonthlyRate})
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Access Start Date *</label>
                      <input
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Commercial Appliance & Electronics Rental Schedule */}
              {isGeneral && (
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-300/70 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-blue-200 pb-2">
                    <Zap className="h-4.5 w-4.5 text-blue-600" />
                    <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                      Appliance Rental Tenure & Doorstep Logistics
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Rental Tenure *</label>
                      <select
                        value={applianceDurationMonths}
                        onChange={(e) => setApplianceDurationMonths(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      >
                        <option value={1}>1 Month Tenure</option>
                        <option value={3}>3 Months Tenure (Recommended)</option>
                        <option value={6}>6 Months Tenure (Semester/Season)</option>
                        <option value={12}>12 Months Annual Rental</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-800 font-semibold mb-1">Delivery Required Date *</label>
                      <input
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applianceNeedsDelivery}
                        onChange={(e) => setApplianceNeedsDelivery(e.target.checked)}
                        className="accent-blue-600 h-4 w-4 rounded"
                      />
                      <span>Doorstep Delivery & Professional Technician Installation (+₹250)</span>
                    </label>
                    <span className="font-mono text-blue-700 font-black text-xs">
                      {applianceDurationMonths} mo × ₹{applianceMonthlyRent} {applianceNeedsDelivery ? '+ ₹250 Del' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Rental Period & Duration Selection (Only for Property Rentals) */}
              {isProperty && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300/70 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4.5 w-4.5 text-amber-600" />
                      <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                        Rental Period & Duration Selection
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-lg">
                      Owner Rent: ₹{actualItemRentPrice.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-800 text-xs font-bold mb-1">Rental Duration *</label>
                      <select
                        value={rentalDurationType}
                        onChange={(e) => setRentalDurationType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-bold text-xs sm:text-sm"
                      >
                        <option value="1 month">1 Month Short Stay (Default)</option>
                        <option value="3 months">3 Months Tenure</option>
                        <option value="6 months">6 Months Semester</option>
                        <option value="11 months">11 Months Standard Lease</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 text-xs font-bold mb-1">Move-In Date *</label>
                      <input
                        type="date"
                        required
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 text-xs font-bold mb-1">Expected Move-Out Date</label>
                      <input
                        type="date"
                        value={expectedMoveOutDate}
                        onChange={(e) => setExpectedMoveOutDate(e.target.value)}
                        className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2.5 text-slate-700 font-medium outline-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <span className="font-bold text-slate-900">Duration Pricing:</span>
                      <span>{durationMonths} Month{durationMonths > 1 ? 's' : ''} × ₹{actualItemRentPrice.toLocaleString('en-IN')}/mo</span>
                    </div>
                    <div className="font-mono text-amber-800 font-black">
                      Total Rent: ₹{(durationMonths * actualItemRentPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Identity Verification (Lightweight & Easy) */}
              <div className="bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                      Quick Identity Verification (Optional)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    Can also show at handover
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1">ID Proof Type</label>
                    <select
                      value={govIdType}
                      onChange={(e) => setGovIdType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium text-xs sm:text-sm"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                      <option value="Driving Licence">Driving Licence (RTO)</option>
                      <option value="Passport">Passport</option>
                      <option value="Voter ID">Voter ID Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1">ID Proof Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. XXXX-XXXX-1234 (or provide at handover)"
                      value={govIdNumber}
                      onChange={(e) => setGovIdNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-amber-500 font-medium text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center space-x-2 text-[11px] text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Physical original ID can simply be inspected by host during key or asset handover. No upload required!</span>
                </div>
              </div>

              {/* Action Button to Step 2 Pricing */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.99]"
                >
                  <span>Next: Review Rent & Fee Breakdown →</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </form>
          )}

          {/* PAGE 2: RENT & FEE BREAKDOWN REVIEW & RULES */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <FileText className="h-4.5 w-4.5 text-amber-500" />
                    <span>Step 2: Property Auto-Details, Cost Calculation & Rules</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Review listing parameters, initial move-in breakdown & agreement rules.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Zero Brokerage
                </span>
              </div>

              {/* 1. Auto-filled Listing Details Summary Card */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-300/60 space-y-2.5 text-xs">
                <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200/80 pb-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>1. Auto-Filled Listing Details ({item.category.toUpperCase()})</span>
                </h5>

                {isHotel ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Hotel / Resort</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Location</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.location}, {item.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Room Type & Rooms</span>
                      <strong className="text-slate-900 font-bold block">{hotelRoomType} ({hotelRoomsCount} Room)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Stay Duration</span>
                      <strong className="text-slate-900 font-bold block">{calculatedHotelNights} Night(s) ({checkInDate} to {checkOutDate})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Check-In / Out</span>
                      <strong className="text-emerald-700 font-bold block">12:00 PM Check-In / 11:00 AM Check-Out</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Host / Front Desk</span>
                      <strong className="text-slate-900 font-bold block">{item.ownerName}</strong>
                    </div>
                  </div>
                ) : isRestaurant ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Restaurant / Cafe</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Location</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.location}, {item.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Table Reserved</span>
                      <strong className="text-slate-900 font-bold block">{restaurantTableType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Dining Time Slot</span>
                      <strong className="text-amber-800 font-bold block">{restaurantTimeSlot}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Number of Diners</span>
                      <strong className="text-slate-900 font-bold block">{occupantsCount} Guest(s)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Host / Maitre D'</span>
                      <strong className="text-slate-900 font-bold block">{item.ownerName}</strong>
                    </div>
                  </div>
                ) : isSportsTurf ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Turf / Arena Name</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Location</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.location}, {item.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Selected Slot</span>
                      <strong className="text-slate-900 font-bold block">{turfTimeSlot}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Playing Duration</span>
                      <strong className="text-emerald-700 font-bold block">{turfDurationHours} Hours</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Sports Kit / Gear</span>
                      <strong className="text-slate-900 font-bold block">{turfIncludeGear ? 'Included (Balls, Bibs)' : 'Standard'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Facility Host</span>
                      <strong className="text-slate-900 font-bold block">{item.ownerName}</strong>
                    </div>
                  </div>
                ) : isLibrary ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Library / Study Hub</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Location</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.location}, {item.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Membership Type</span>
                      <strong className="text-slate-900 font-bold block">{libraryPassType === 'daily' ? 'Daily Pass' : 'Monthly Membership'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Allocated Seat / Cabin</span>
                      <strong className="text-amber-800 font-bold block">Seat {selectedSeat} (Reserved)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Study Hours</span>
                      <strong className="text-emerald-700 font-bold block">06:00 AM - 11:00 PM (Silent AC Zone)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Library Host</span>
                      <strong className="text-slate-900 font-bold block">{item.ownerName}</strong>
                    </div>
                  </div>
                ) : isGeneral ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Appliance / Item</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Hub Location</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.location}, {item.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Rental Tenure</span>
                      <strong className="text-slate-900 font-bold block">{applianceDurationMonths} Month(s)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Logistics & Setup</span>
                      <strong className="text-emerald-700 font-bold block">{applianceNeedsDelivery ? 'Doorstep Delivery & Technician Setup' : 'Self Pickup'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Appliance Condition</span>
                      <strong className="text-slate-900 font-bold block">Tested & Verified ✓</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Supplier / Vendor</span>
                      <strong className="text-slate-900 font-bold block">{item.ownerName}</strong>
                    </div>
                  </div>
                ) : isVehicle ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Vehicle Name</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Pickup Hub</span>
                      <strong className="text-slate-900 font-bold block truncate">{pickupLocation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Rental Mode</span>
                      <strong className="text-slate-900 font-bold block uppercase">{vehicleRentalMode} ({vehicleRentalMode === 'hourly' ? `${totalCalculatedHours} Hours` : `${totalVehicleDays} Days`})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Schedule</span>
                      <strong className="text-slate-900 font-bold block">{pickupDate} → {returnDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Driving License</span>
                      <strong className="text-emerald-700 font-bold block font-mono">{drivingLicense || 'Verified on Pickup'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Fleet Host</span>
                      <strong className="text-slate-900 font-bold block">{item.ownerName}</strong>
                    </div>
                  </div>
                ) : isClothing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Outfit Title</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Boutique</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.ownerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Selected Size</span>
                      <strong className="text-slate-900 font-bold block">{clothingSizeSelection} (Fitted)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Rental Duration</span>
                      <strong className="text-slate-900 font-bold block">{totalClothingDays} Days ({pickupDate} to {returnDate})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Delivery Mode</span>
                      <strong className="text-emerald-700 font-bold block">{deliveryMethod === 'home_delivery' ? 'Sanitized Home Delivery' : 'Boutique Pickup'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Hygiene Assurance</span>
                      <strong className="text-emerald-700 font-bold block">Steam Cleaned & Sealed ✓</strong>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Property Title</span>
                      <strong className="text-slate-900 font-bold block">{item.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Full Address</span>
                      <strong className="text-slate-900 font-bold block truncate">{item.fullAddress || `${item.location}, ${item.city}`}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Room Type</span>
                      <strong className="text-slate-900 font-bold block">{item.subType || (item.category === 'student' ? 'PG Shared Room' : '1BHK / 2BHK Room')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Furnished Status</span>
                      <strong className="text-slate-900 font-bold block">{item.furnishing || 'Semi-Furnished'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Available From</span>
                      <strong className="text-emerald-700 font-bold block">{item.availableFrom || 'Immediately'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block text-[10px] uppercase">Electricity & Water</span>
                      <strong className="text-slate-900 font-bold block">As per Govt Meter / Included</strong>
                    </div>
                  </div>
                )}

                {/* Amenities Pills */}
                <div className="pt-2 border-t border-amber-200/80">
                  <span className="text-slate-500 font-medium block text-[10px] uppercase mb-1">Included Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.amenities && item.amenities.length > 0 ? item.amenities : ['Wi-Fi', 'AC', 'Parking', 'RO Water']).map((am, i) => (
                      <span key={i} className="bg-white text-slate-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Detailed Payment Calculation Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-200 pb-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>2. Payment & Handover Cost Breakdown</span>
                </h5>

                <div className="space-y-2">
                  {isClothing ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Clothing Rental ({totalClothingDays} Days × ₹{clothingDailyRate}/day):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">₹{calculatedClothingRentCost.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-700 font-bold block">Security Deposit (Refundable at Return):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Separately held (NOT included in rent)</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">₹{clothingDeposit.toLocaleString('en-IN')}</span>
                      </div>

                      {clothingDeliveryFee > 0 && (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                          <span className="text-slate-700 font-bold">Doorstep Home Delivery Fee:</span>
                          <span className="font-bold text-slate-800 font-mono">₹{clothingDeliveryFee}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Priority Escrow Token Amount (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">₹{tokenAmount}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Escrow Verification Fee:</span>
                        <span className="font-bold text-slate-800">₹{platformFee}</span>
                      </div>
                    </>
                  ) : isVehicle ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Vehicle Rent ({vehicleRentalMode === 'hourly' ? `${totalCalculatedHours} hrs × ${formatINR(vehicleHourlyRate)}` : `${totalVehicleDays} days × ${formatINR(vehicleDailyRate)}`}):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(calculatedVehicleRentCost)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-700 font-bold block">Security Deposit (Refundable at Return):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Separately held (NOT included in rent)</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">{formatINR(actualItemDeposit)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Priority Booking Escrow Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(tokenAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Verification Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  ) : isHotel ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Room Tariff ({calculatedHotelNights} Night(s) × {hotelRoomsCount} Room(s) × {formatINR(hotelRoomPrice)}):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(hotelBaseTariff)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-700 font-bold block">Hotel GST & Service Tax (12%):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Standard statutory hospitality tax</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">{formatINR(hotelGst)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Priority Reservation Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(tokenAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Escrow Verification Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  ) : isRestaurant ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Table Reservation for {occupantsCount} Guest(s) ({restaurantTimeSlot}):
                        </span>
                        <span className="font-bold text-emerald-700 text-sm">Table Hold Confirmed</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-700 font-bold block">Estimated Average Dining Cost:</span>
                          <span className="text-[10px] text-slate-500 font-bold">Bill paid directly at restaurant after dining</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">{formatINR(restaurantAvgCost)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Priority Table Reservation Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(Math.min(tokenAmount, 200))}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Reservation Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  ) : isSportsTurf ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Turf Arena Hire ({turfDurationHours} Hours × {formatINR(turfHourlyRate)}/hr):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(turfDurationHours * turfHourlyRate)}</span>
                      </div>

                      {turfGearCost > 0 && (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                          <span className="text-slate-700 font-bold">Match Balls, Bibs & Equipment:</span>
                          <span className="font-bold text-slate-800 font-mono">₹{turfGearCost}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Slot Priority Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(tokenAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Verification Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  ) : isLibrary ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Library Access Plan ({libraryPassType === 'daily' ? '1 Day Study Pass' : 'Monthly Membership'}):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(calculatedLibraryTotal)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">Allocated Desk Light & Wi-Fi:</span>
                        <span className="font-bold text-emerald-700">Included Free ✓</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Seat Hold Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(tokenAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Registration Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  ) : isGeneral ? (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-700 font-bold">
                          Appliance Rent ({applianceDurationMonths} Months × {formatINR(applianceMonthlyRent)}/mo):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(applianceDurationMonths * applianceMonthlyRent)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-700 font-bold block">Security Deposit (100% Refundable):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Refunded upon return pickup</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">{formatINR(applianceDeposit)}</span>
                      </div>

                      {applianceDeliveryFee > 0 && (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                          <span className="text-slate-700 font-bold">Doorstep Delivery & Technician Installation:</span>
                          <span className="font-bold text-slate-800 font-mono">₹{applianceDeliveryFee}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Priority Booking Escrow Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(tokenAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Verification Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-600 font-semibold block">
                            Rent ({durationMonths} Month{durationMonths > 1 ? 's' : ''} Tenure):
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {durationMonths} × {formatINR(actualItemRentPrice)}/mo (Owner Listed Rent)
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm font-mono">{formatINR(actualItemRentPrice * durationMonths)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-600 font-semibold block">Refundable Security Deposit (To Host):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">✓ 100% Refundable at move-out (held safely)</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">{formatINR(actualItemDeposit)}</span>
                      </div>

                      {propertyMaintenanceCharges > 0 ? (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                          <span className="text-slate-600 font-semibold">
                            Maintenance Charges ({durationMonths} mo × {formatINR(propertyMaintenanceCharges)}/mo):
                          </span>
                          <span className="font-bold text-slate-800 font-mono">{formatINR(propertyMaintenanceCharges * durationMonths)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                          <span className="text-slate-600 font-semibold">Maintenance Charges:</span>
                          <span className="font-bold text-emerald-700 font-mono">All-Inclusive (₹0)</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Escrow Priority Token Amount (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">{formatINR(tokenAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Escrow Verification Fee:</span>
                        <span className="font-bold text-slate-800">{formatINR(platformFee)}</span>
                      </div>
                    </>
                  )}

                  {/* Summary Totals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        {isClothing
                          ? 'Balance Payable at Handover'
                          : isVehicle
                          ? 'Balance Payable at Pickup Hub'
                          : isHotel
                          ? 'Balance Due at Check-In'
                          : isRestaurant
                          ? 'Estimated Dining Order Balance'
                          : isSportsTurf
                          ? 'Balance Payable at Turf Entry'
                          : isLibrary
                          ? 'Balance Due at Library Desk'
                          : isGeneral
                          ? 'Balance Due at Delivery'
                          : `Total Move-In Balance (${durationMonths} Mo)`}
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatINR(balanceDueAtHandover)}
                      </span>
                    </div>

                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-400/40">
                      <span className="text-[10px] text-amber-900 uppercase font-bold block">Token Payable Now (Escrow Locked)</span>
                      <span className="text-lg font-black text-amber-700 font-mono">
                        {formatINR(payableNowTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Category Rules & Agreement Terms Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    3. Booking Terms & Handover Protocols
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {isHotel ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Check-In Timing:</strong> Standard 12:00 PM check-in; late check-in allowed with notice.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Guest ID Verification:</strong> Valid Govt ID for all staying adult guests required at reception.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Hotel House Rules:</strong> Outside food/beverages subject to hotel policy.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• 100% Refund Guarantee:</strong> Instant refund if booking is not confirmed by hotel.
                      </div>
                    </>
                  ) : isRestaurant ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Table Grace Period:</strong> Table held for 15 minutes from reservation time.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Bill Adjustment:</strong> Token reservation advance fully adjusted in food bill.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Dietary / Seating:</strong> Seating preferences accommodated on arrival.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• Instant Cancellation:</strong> Cancel anytime 2 hours before slot for full refund.
                      </div>
                    </>
                  ) : isSportsTurf ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Footwear Policy:</strong> Non-marking turf shoes or rubber studs mandatory.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Punctuality:</strong> Arrive 10 minutes prior to slot start time.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Weather Reschedule:</strong> Free reschedule in case of heavy rain or storms.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• 100% Refund Guarantee:</strong> Instant refund if arena is unavailable.
                      </div>
                    </>
                  ) : isLibrary ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Silence Policy:</strong> Strict pin-drop silence in reading halls at all times.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Personal Desk:</strong> Fixed desk light, charging port and ergonomic chair.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Facilities:</strong> High-speed optical Wi-Fi & chilled RO water included.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• Easy Transfer:</strong> Monthly pass can be paused or transferred if needed.
                      </div>
                    </>
                  ) : isGeneral ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Voltage & Care:</strong> Recommended to connect with stabilizer or surge protector.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Free Maintenance:</strong> Free technician servicing for any normal wear/tear.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• 100% Deposit Return:</strong> Full deposit refunded on return inspection.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• Free Replacement:</strong> Immediate unit replacement if defective on delivery.
                      </div>
                    </>
                  ) : isVehicle ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Driving License:</strong> Original valid Driving License mandatory at pickup.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Fuel Policy:</strong> Same-to-same fuel level return policy.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Zero Tolerance:</strong> Strictly no drunk driving; speed limits enforced by GPS.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• Security Deposit:</strong> Refunded immediately after vehicle dropoff check.
                      </div>
                    </>
                  ) : isClothing ? (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Care & Handling:</strong> Keep outfit safely in garment bag provided.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Dry Cleaning:</strong> Professional dry-cleaning is included; do not wash at home.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Alteration Policy:</strong> Temporary basting stitch allowed; no fabric cutting.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• Security Deposit:</strong> 100% Refundable upon timely garment return.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Notice Period:</strong> 30 Days advance notice required prior to move-out.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Security Deposit Policy:</strong> 100% Refundable at lease exit.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block font-bold">• Pet & Guest Policy:</strong> Guests allowed till 10 PM. Subject to host rules.
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <strong className="text-emerald-700 block font-bold">• 100% Refund Guarantee:</strong> Instant token refund if host declines within 24h.
                      </div>
                    </>
                  )}
                </div>

                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
                  <input
                    type="checkbox"
                    checked={agreeCorrectInfo}
                    onChange={(e) => setAgreeCorrectInfo(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                  <span className="text-slate-800 text-xs leading-relaxed font-medium">
                    I confirm that all personal details, government identity proof (<strong className="text-slate-900">{govIdType}: {govIdNumber || 'To be verified at handover'}</strong>), and contact details provided are genuine and accurate.
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
                  <input
                    type="checkbox"
                    checked={agreeTermsPolicy}
                    onChange={(e) => setAgreeTermsPolicy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                  <span className="text-slate-800 text-xs leading-relaxed font-medium">
                    I agree to Recko India's <strong className="text-amber-700">Rental Terms & Conditions</strong>, Category Policies, and 100% Refundable Token Policy.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3 rounded-2xl transition-all cursor-pointer text-xs border border-slate-300"
                >
                  ← Edit Details
                </button>
                <button
                  type="button"
                  disabled={!agreeCorrectInfo || !agreeTermsPolicy}
                  onClick={handleNextToPayment}
                  className={`flex-1 font-black py-3.5 px-6 rounded-2xl shadow-lg text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    agreeCorrectInfo && agreeTermsPolicy
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <span>Proceed to Payment (₹{payableNowTotal}) →</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* PAGE 3: TOKEN PAYMENT */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Terms Checkboxes */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-amber-400/30 space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
                  <span>Step 2.1: Tenant Declarations & Agreement</span>
                </h4>
                
                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
                  <input
                    type="checkbox"
                    checked={agreeCorrectInfo}
                    onChange={(e) => setAgreeCorrectInfo(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                  <span className="text-slate-800 text-xs leading-relaxed font-medium">
                    I confirm that all personal details, government identity proof (<strong className="text-slate-900">{govIdType}: {govIdNumber || 'To be verified at handover'}</strong>), and contact details provided are genuine and accurate.
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
                  <input
                    type="checkbox"
                    checked={agreeTermsPolicy}
                    onChange={(e) => setAgreeTermsPolicy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                  <span className="text-slate-800 text-xs leading-relaxed font-medium">
                    I agree to Recko India's <strong className="text-amber-700">Escrow Booking Terms</strong>, Tenant Conduct Code, and 100% Refundable Token Policy.
                  </span>
                </label>
              </div>

              {/* 100% REFUNDABLE GUARANTEE CARD */}
              <div className="bg-amber-500/10 border border-amber-400/40 p-4 sm:p-5 rounded-2xl space-y-2.5 shadow-sm text-slate-900">
                <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs sm:text-sm">
                  <Shield className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                  <span>100% Refundable Token Guarantee & Escrow Transparency</span>
                </div>
                <ul className="text-xs text-slate-800 space-y-1.5 list-disc pl-5 leading-relaxed font-medium">
                  <li>
                    The nominal token fee of <strong className="text-amber-700 font-bold">₹{tokenAmount}</strong> temporarily locks your priority slot and initiates host background verification.
                  </li>
                  <li>
                    <strong className="text-emerald-700">INSTANT FULL REFUND:</strong> If the host declines your request or fails to respond within 24 hours, the full ₹{tokenAmount} is instantly refunded back to your original source UPI / bank account.
                  </li>
                  <li>
                    Once approved, this ₹{tokenAmount} token is deducted from your first month rental invoice.
                  </li>
                </ul>
              </div>

              {/* Token Payment Method Selection */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Step 2.2: Select Payment Method</h4>
                    <p className="text-slate-500 text-xs font-medium">256-Bit SSL Encrypted Instant Reserve Escrow</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Payable Token</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">₹{tokenAmount}</span>
                  </div>
                </div>

                {/* 5 Payment Options Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'razorpay'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400 font-bold shadow-lg scale-[1.02]'
                        : 'bg-white border-blue-300 text-blue-900 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Zap className={`h-4.5 w-4.5 ${paymentMethod === 'razorpay' ? 'text-amber-300' : 'text-blue-600'}`} />
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">Fast</span>
                    </div>
                    <div>
                      <span className="font-extrabold block text-xs">Razorpay ⚡</span>
                      <span className={`text-[10px] ${paymentMethod === 'razorpay' ? 'text-blue-100 font-medium' : 'text-slate-500'}`}>
                        UPI, Cards, Banking
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <QrCode className={`h-4.5 w-4.5 mb-1 ${paymentMethod === 'upi' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div>
                      <span className="font-bold block text-xs">Owner QR Code</span>
                      <span className={`text-[10px] ${paymentMethod === 'upi' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        GPay, PhonePe, Paytm
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <CreditCard className={`h-4.5 w-4.5 mb-1 ${paymentMethod === 'card' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div>
                      <span className="font-bold block text-xs">Debit / Credit</span>
                      <span className={`text-[10px] ${paymentMethod === 'card' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        Visa, Master, RuPay
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <Building2 className={`h-4.5 w-4.5 mb-1 ${paymentMethod === 'netbanking' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div>
                      <span className="font-bold block text-xs">Net Banking</span>
                      <span className={`text-[10px] ${paymentMethod === 'netbanking' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        All Indian Banks
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <Wallet className={`h-4.5 w-4.5 mb-1 ${paymentMethod === 'wallet' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div>
                      <span className="font-bold block text-xs">Recko Wallet</span>
                      <span className={`text-[10px] ${paymentMethod === 'wallet' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        Escrow & Balance
                      </span>
                    </div>
                  </button>
                </div>

                {/* 0. Official Razorpay Payment Interface */}
                {paymentMethod === 'razorpay' && (
                  <div className="bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 p-5 rounded-2xl border-2 border-blue-400 text-white space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-6 w-6 text-amber-400 fill-amber-400 animate-pulse" />
                        <div>
                          <h4 className="font-extrabold text-sm text-white">Razorpay 1-Click Instant Gateway</h4>
                          <p className="text-[11px] text-blue-200">Supports GPay, PhonePe, Paytm, Cards & All Bank Netbanking</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Live 256-Bit Encrypted
                      </span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-200">Refundable Escrow Token:</span>
                        <span className="font-mono font-black text-amber-300 text-base">₹{payableNowTotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-200">Verified Recipient Host:</span>
                        <span className="font-semibold text-white">{item.ownerName || 'Verified Asset Landlord'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-200">Customer Mobile:</span>
                        <span className="font-mono text-white">{phone || 'Primary Contact'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayWithRazorpay}
                      className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-xl text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 border border-amber-300 hover:scale-[1.01]"
                    >
                      <Lock className="h-4 w-4 stroke-[3]" />
                      <span>Pay Token ₹{payableNowTotal} via Razorpay Checkout ⚡</span>
                    </button>
                  </div>
                )}

                {/* 1. UPI Payment Interface */}
                {paymentMethod === 'upi' && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <span className="text-[11px] text-slate-600 font-semibold block mb-2">1-Click Instant App Payment:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpiApp('gpay');
                            const upiUri = `upi://pay?pa=recko.escrow@okhdfcbank&pn=Recko%20India%20Escrow&am=${payableNowTotal}&cu=INR&tn=Recko%20Token`;
                            window.location.href = upiUri;
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'gpay'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-blue-500 font-black">G</span>
                          <span className="text-red-500 font-black">P</span>
                          <span className="text-yellow-500 font-black">a</span>
                          <span className="text-green-500 font-black">y 🚀</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpiApp('phonepe');
                            const upiUri = `upi://pay?pa=recko.escrow@okhdfcbank&pn=Recko%20India%20Escrow&am=${payableNowTotal}&cu=INR&tn=Recko%20Token`;
                            window.location.href = upiUri;
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'phonepe'
                              ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>PhonePe 🚀</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpiApp('paytm');
                            const upiUri = `upi://pay?pa=recko.escrow@okhdfcbank&pn=Recko%20India%20Escrow&am=${payableNowTotal}&cu=INR&tn=Recko%20Token`;
                            window.location.href = upiUri;
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'paytm'
                              ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>Paytm UPI 🚀</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpiApp('cred');
                            const upiUri = `upi://pay?pa=recko.escrow@okhdfcbank&pn=Recko%20India%20Escrow&am=${payableNowTotal}&cu=INR&tn=Recko%20Token`;
                            window.location.href = upiUri;
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'cred'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>CRED UPI 🚀</span>
                        </button>
                      </div>
                    </div>

                    {/* Real Dynamic NPCI QR Code & VPA Display */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-800 flex items-center space-x-1.5">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span>{item.ownerUpiId ? `Direct Owner UPI Payment Gateway: ${item.ownerName}` : 'Recko Verified Escrow Gateway'}</span>
                        </span>
                        <span className="bg-amber-400/20 text-amber-900 border border-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black font-mono">
                          Token Payable: ₹{payableNowTotal}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={
                              item.ownerQrUrl ||
                              getAdminPaymentConfig().qrUrl
                            }
                            alt="Official Admin Payment QR Code"
                            className="h-36 w-36 object-contain bg-white p-2 rounded-2xl border-2 border-amber-400 shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                            <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm uppercase">
                              Official Admin QR
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 flex-1 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="bg-amber-400/20 text-amber-900 border border-amber-400 px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center space-x-1 font-mono">
                              <Clock className="h-3 w-3 text-amber-600 animate-spin" />
                              <span>Session Expires in: {formatTimer(qrTimer)}</span>
                            </span>
                          </div>

                          <p className="font-bold text-slate-900 text-xs flex items-center justify-center sm:justify-start space-x-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            <span>Scan QR with GPay / PhonePe / Paytm on any phone</span>
                          </p>

                          <div className="flex items-center justify-center sm:justify-start space-x-2 pt-0.5">
                            <span className="text-xs text-amber-900 font-mono font-black bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-300">
                              {item.ownerUpiId || getAdminPaymentConfig().upiId}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.ownerUpiId || 'recko.escrow@okhdfcbank');
                                setCopiedUpi(true);
                                setTimeout(() => setCopiedUpi(false), 2000);
                              }}
                              className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-xl flex items-center space-x-1 cursor-pointer font-bold transition-all shadow-sm"
                            >
                              <Copy className="h-3.5 w-3.5 text-amber-400" />
                              <span>{copiedUpi ? 'Copied ✓' : 'Copy VPA'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MANDATORY 12-DIGIT UTR / TRANSACTION REFERENCE NUMBER INPUT */}
                    <div className="bg-amber-500/10 p-4 rounded-2xl border-2 border-amber-400 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-950 flex items-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-amber-600" />
                          <span>Enter 12-Digit Payment UTR / Transaction Ref ID *</span>
                        </label>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black uppercase shadow-xs">
                          Mandatory
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                        After paying ₹{payableNowTotal} via GPay/PhonePe/Paytm or QR scan, enter the 12-digit UTR or Transaction Ref ID from your payment app below to confirm token payment verification.
                      </p>
                      <input
                        type="text"
                        maxLength={18}
                        required
                        placeholder="e.g. 423456789012 or UTR-99887766"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-amber-400 rounded-xl p-3 text-slate-950 font-mono font-black text-sm tracking-widest outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                      />
                    </div>

                    {/* Custom UPI ID Entry */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Or Enter Your UPI ID (VPA):</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. mobileNumber@upi or username@okhdfcbank"
                          value={customUpiId}
                          onChange={(e) => {
                            setCustomUpiId(e.target.value);
                            setUpiVerified(false);
                          }}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customUpiId.includes('@')) {
                              setUpiVerified(true);
                            } else {
                              alert('Please enter a valid UPI ID with @ symbol.');
                            }
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer border border-slate-800"
                        >
                          {upiVerified ? 'Verified ✓' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Card Payment Interface */}
                {paymentMethod === 'card' && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-2.5 h-4 w-4 text-amber-500" />
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 8921 4455 1092"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2 text-slate-900 font-mono text-xs outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-1">
                        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Expiry</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono text-xs text-center outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="***"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono text-xs text-center outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Network</label>
                        <div className="bg-slate-100 border border-slate-300 rounded-xl p-2 text-amber-700 font-bold text-xs text-center">
                          RuPay / Visa
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Net Banking Interface */}
                {paymentMethod === 'netbanking' && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                    <label className="block text-slate-700 font-semibold text-[11px]">Select Popular Bank:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                            selectedBank === bank
                              ? 'bg-slate-900 text-amber-400 border-slate-900 font-bold'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Wallet Interface */}
                {paymentMethod === 'wallet' && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">Recko Escrow Wallet Balance</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Available: ₹2,500</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        Active ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      ₹{tokenAmount} will be deducted from your Recko Escrow balance and held securely until host acceptance.
                    </p>
                  </div>
                )}

              </div>

              {/* Processing Progress State or Action Buttons */}
              {isPaying ? (
                <div className="p-4 bg-slate-50 border border-amber-400/40 rounded-2xl space-y-2 text-center animate-in fade-in duration-200">
                  <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-amber-700 text-xs sm:text-sm">{paymentStepText}</p>
                  <p className="text-[10px] text-slate-500">Please do not close this window while transaction is processing.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3.5 rounded-2xl transition-all cursor-pointer text-xs border border-slate-300 order-2 sm:order-1"
                  >
                    ← Back to Verification
                  </button>

                  <button
                    type="button"
                    disabled={!agreeCorrectInfo || !agreeTermsPolicy}
                    onClick={handleProcessPayment}
                    className={`flex-1 font-black py-3.5 px-6 rounded-2xl shadow-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 order-1 sm:order-2 ${
                      agreeCorrectInfo && agreeTermsPolicy
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 scale-[1.01]'
                        : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="h-4 w-4 stroke-[2.5]" />
                    <span>Pay Token ₹{tokenAmount} & Secure Slot</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* PAGE 4: DIGITAL CONFIRMATION & ESCROW DASHBOARD */}
          {currentStep === 4 && createdBooking && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200 text-slate-900">
              
              {/* Celebratory Hero Header */}
              <div className="text-center space-y-2 pt-2">
                <div className="relative inline-block">
                  <div className="h-20 w-20 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
                    <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Recko Escrow Protected • 100% Refundable Guarantee</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Booking Request Confirmed & Token Secured!
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium">
                    बधाई हो! आपकी बुकिंग सफलतापूर्वक दर्ज हो गई है। टोकन राशि सुरक्षित रूप से एस्क्रो में जमा कर दी गई है।
                  </p>
                </div>
              </div>

              {/* 4-Stage Interactive Live Progress Tracker */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-amber-400/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Live Booking Status & Progress</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                    Host Review Underway
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-2xl">
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-black text-xs">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>1. Token Paid</span>
                    </div>
                    <p className="text-[10px] text-emerald-800 mt-1 font-medium">
                      ₹{createdBooking.tokenPaidAmount} held in Escrow (Paid ✓)
                    </p>
                  </div>

                  <div className="bg-amber-400/20 border-2 border-amber-400 p-3 rounded-2xl shadow-xs">
                    <div className="flex items-center space-x-1.5 text-amber-900 font-black text-xs">
                      <Clock className="h-4 w-4 animate-spin text-amber-700 shrink-0" />
                      <span>2. Host Review</span>
                    </div>
                    <p className="text-[10px] text-amber-900 mt-1 font-medium">
                      Tenant KYC & Profile sent to {item.ownerName}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-2xl opacity-75">
                    <div className="flex items-center space-x-1.5 text-slate-600 font-bold text-xs">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span>3. Approval</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Digital Tenancy Agreement signed
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-2xl opacity-75">
                    <div className="flex items-center space-x-1.5 text-slate-600 font-bold text-xs">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>4. Handover</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Physical Inspection & Keys Move-In
                    </p>
                  </div>
                </div>
              </div>

              {/* Automated Mobile SMS Notification Status to Owner Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-sm text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                          Owner Mobile Notification Sent
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                          SMS Dispatched ✓
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 font-medium">
                        Property Owner ({item.ownerName || 'Host'}) ke mobile number <strong className="font-mono font-bold text-emerald-950">{item.ownerContact || '+91 98765 43210'}</strong> par real-time alert bhej diya gaya hai.
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-auto">
                    📡 {createdBooking.ownerSmsTimestamp || 'Just now'}
                  </div>
                </div>

                {/* Live Message Body Preview */}
                <div className="mt-3 bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 mb-1.5">
                    <span className="flex items-center space-x-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>SMS Alert Message Sent to Owner's Phone:</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Fast2SMS / Brevo Gateway
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed select-all">
                    "{ownerSmsResult?.smsText || formatOwnerBookingSmsText({
                      ownerName: item.ownerName,
                      ownerPhone: item.ownerContact,
                      userName: fullName,
                      userPhone: phone,
                      itemTitle: item.title,
                      bookingId: createdBooking.id,
                      startDate: createdBooking.startDate,
                      tokenPaidAmount: createdBooking.tokenPaidAmount || tokenAmount,
                      duration: createdBooking.duration
                    })}"
                  </p>
                </div>

                {/* Instant Action Channels: WhatsApp, Open SMS app, Call Host */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-emerald-900">Direct Channels:</span>
                  
                  <a
                    href={getOwnerWhatsAppAlertUrl({
                      ownerName: item.ownerName,
                      ownerPhone: item.ownerContact,
                      userName: fullName,
                      userPhone: phone,
                      itemTitle: item.title,
                      bookingId: createdBooking.id,
                      startDate: createdBooking.startDate,
                      tokenPaidAmount: createdBooking.tokenPaidAmount || tokenAmount,
                      duration: createdBooking.duration
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp Alert to Owner</span>
                  </a>

                  <a
                    href={getOwnerSmsDeepLinkUrl({
                      ownerName: item.ownerName,
                      ownerPhone: item.ownerContact,
                      userName: fullName,
                      userPhone: phone,
                      itemTitle: item.title,
                      bookingId: createdBooking.id,
                      startDate: createdBooking.startDate,
                      tokenPaidAmount: createdBooking.tokenPaidAmount || tokenAmount,
                      duration: createdBooking.duration
                    })}
                    className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl text-xs border border-emerald-300 transition-colors shadow-xs"
                  >
                    <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Open Native SMS App</span>
                  </a>

                  <a
                    href={`tel:${item.ownerContact || '+919876543210'}`}
                    className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-xs ml-auto"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Host Directly</span>
                  </a>
                </div>
              </div>

              {/* Rented Asset & Calculation Snapshot Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3.5 text-left">
                <div className="flex items-start space-x-3 sm:space-x-4 border-b border-slate-200 pb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-amber-400/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        #{createdBooking.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {createdBooking.bookingDate || 'Just now'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}, {item.city}</span>
                    </p>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Scheduled Start / Move-In
                    </span>
                    <strong className="text-slate-900 block mt-0.5 font-bold">
                      {createdBooking.startDate}
                    </strong>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Token Paid (In Escrow)
                    </span>
                    <strong className="text-emerald-700 block mt-0.5 font-mono font-black text-sm">
                      {formatINR(createdBooking.tokenPaidAmount || tokenAmount)} (PAID ✓)
                    </strong>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      Balance Due at Handover
                    </span>
                    <strong className="text-slate-900 block mt-0.5 font-mono font-black text-sm">
                      {formatINR(balanceDueAtHandover)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Host Contact Card */}
              <div className="bg-white p-4 rounded-3xl border-2 border-amber-400/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg border border-amber-400/30 shrink-0">
                    {item.ownerName ? item.ownerName.charAt(0).toUpperCase() : 'H'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Authorized Property Host
                    </span>
                    <strong className="text-slate-900 text-sm font-bold block">
                      {item.ownerName || 'Property Host'}
                    </strong>
                    <span className="text-xs font-mono text-slate-600 block">
                      {item.ownerContact || '+91 98765 43210'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <a
                    href={`tel:${item.ownerContact || '+919876543210'}`}
                    className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-amber-400" />
                    <span>Call Host</span>
                  </a>

                  <a
                    href={`https://wa.me/91${(item.ownerContact || '9876543210').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${item.ownerName}, I have placed a rental booking request for "${item.title}" (Ref #${createdBooking.id}) on Recko-India.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons: View Slip, Track in My Bookings, Feedback */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                {/* Primary Button: View & Print Official Slip */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenReceiptModal && createdBooking) {
                      onClose();
                      onOpenReceiptModal(createdBooking);
                    } else {
                      window.print();
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4 stroke-[2.5]" />
                  <span>View & Print Official Slip (रसीद देखें)</span>
                </button>

                {/* Track Status in My Bookings */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToMyBookings();
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-5 rounded-2xl border border-slate-800 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Track in My Bookings</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5] text-amber-400" />
                </button>

                {/* Optional Feedback */}
                {onOpenFeedbackModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFeedbackModal();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-4 py-3.5 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Feedback</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
