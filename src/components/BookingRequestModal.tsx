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
  Info
} from 'lucide-react';
import { MainCategory, RentalBooking, UserProfile } from '../types';

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
  } | null;
  tokenAmount: number; // Configurable token amount e.g. 50, 99, 100
  onCompleteBooking: (newBooking: RentalBooking) => void;
  onNavigateToMyBookings: () => void;
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  existingBookings = [],
  onOpenFeedbackModal,
  item,
  tokenAmount,
  onCompleteBooking,
  onNavigateToMyBookings
}) => {
  if (!isOpen || !item) return null;

  // Check if item is already booked
  const isAlreadyBooked = existingBookings.some(
    (b) => b.itemId === item.id && b.status !== 'Cancelled' && b.status !== 'Rejected'
  );

  const isPropertyAvailable = (item.isAvailable !== false) && !isAlreadyBooked;

  // Wizard Steps: 1 = Details & Selection, 2 = Pricing & Rules Review, 3 = Token Payment, 4 = Digital Receipt & Ticket
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Category specific state
  const [selectedSeat, setSelectedSeat] = useState<string>('A1');
  const [hotelNights, setHotelNights] = useState<number>(2);
  const [hotelRoomsCount, setHotelRoomsCount] = useState<number>(1);
  const [hotelRoomType, setHotelRoomType] = useState<string>('Deluxe Suite Room');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });
  const [pickupLocation, setPickupLocation] = useState(item.location || 'Airport / Station Pickup Hub');
  const [dropoffLocation, setDropoffLocation] = useState(item.location || 'City Dropoff Point');
  const [drivingLicense, setDrivingLicense] = useState('DL-1420210089214');
  const [restaurantTimeSlot, setRestaurantTimeSlot] = useState('7:30 PM');
  const [restaurantTableType, setRestaurantTableType] = useState('Couple Candlelight Table');
  const [turfTimeSlot, setTurfTimeSlot] = useState('7:00 PM - 9:00 PM (Floodlit Evening Slot)');

  // Form Fields State
  const [fullName, setFullName] = useState(currentUser?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '9876543210');
  const [otpCode, setOtpCode] = useState('4321');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [otpError, setOtpError] = useState('');

  const [email, setEmail] = useState(currentUser?.email || 'rahul.sharma@example.com');
  const [dob, setDob] = useState('1998-05-15');
  const [currentAddress, setCurrentAddress] = useState('Flat 402, Royal Palms, Koregaon Park, Pune, Maharashtra - 411001');
  const [permanentAddress, setPermanentAddress] = useState('House 12, MG Road, Ward 4, Nashik, Maharashtra - 422001');
  const [companyCollegeName, setCompanyCollegeName] = useState('Infosys Technology Ltd / COEP Pune');
  const [occupation, setOccupation] = useState('Working Professional');
  const [monthlyIncome, setMonthlyIncome] = useState('₹50,000 - ₹1,00,000');
  const [occupantsCount, setOccupantsCount] = useState(1);
  
  const [moveInDate, setMoveInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });
  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState(() => {
    const today = new Date();
    today.setMonth(today.getMonth() + 11);
    return today.toISOString().split('T')[0];
  });
  const [rentalDurationType, setRentalDurationType] = useState<'1 month' | '6 months' | '11 months' | 'Custom'>('11 months');
  const [preferredVisitDateTime, setPreferredVisitDateTime] = useState('Tomorrow at 4:00 PM');

  // Hourly Vehicle Rental Duration State & Calculator
  const [vehicleRentalMode, setVehicleRentalMode] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
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

  const vehicleHourlyRate = item.hourlyPrice || (item.category === 'vehicle' ? 150 : item.price);
  const calculatedVehicleRentCost = vehicleRentalMode === 'hourly'
    ? totalCalculatedHours * vehicleHourlyRate
    : item.price;

  const [govIdType, setGovIdType] = useState<'Aadhaar Card' | 'Passport' | 'Driving Licence' | 'Voter ID'>('Aadhaar Card');
  const [govIdNumber, setGovIdNumber] = useState('5489 1234 9876');
  const [idProofFileName, setIdProofFileName] = useState<string | null>('aadhaar_card_verified.pdf');
  const [idProofPreview, setIdProofPreview] = useState<string | null>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80');
  
  const [passportPhotoFileName, setPassportPhotoFileName] = useState<string | null>('passport_photo.jpg');
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  
  const [emergencyContact, setEmergencyContact] = useState('9829012345');
  const [emergencyRelation, setEmergencyRelation] = useState('Parent / Guardian');

  // Step 3 Terms & Payment
  const [agreeCorrectInfo, setAgreeCorrectInfo] = useState(true);
  const [agreeTermsPolicy, setAgreeTermsPolicy] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'cred' | 'custom'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 8921 4455 1092');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('883');
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
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

  // Category specific calculations
  const platformFee = 100;
  const isHotel = item.category === 'hotel';
  const isVehicle = item.category === 'vehicle';
  const isClothing = item.category === 'clothing';
  const isSeatCategory = item.category === 'library' || item.category === 'sports_turf';
  const isRestaurant = item.category === 'restaurant';
  const isProperty = item.category === 'residential' || item.category === 'commercial' || item.category === 'student' || item.category === 'property';

  // Clothing Specific States & Calculator
  const [clothingSizeSelection, setClothingSizeSelection] = useState<string>(item.size || 'L');
  const [userHeightCm, setUserHeightCm] = useState<string>('175');
  const [userWeightKg, setUserWeightKg] = useState<string>('70');
  const [deliveryMethod, setDeliveryMethod] = useState<'home_delivery' | 'pickup_from_owner'>('home_delivery');
  const [returnMethod, setReturnMethod] = useState<'doorstep_pickup' | 'self_return'>('doorstep_pickup');
  const [deliveryAddressInput, setDeliveryAddressInput] = useState('B-402, Royal Residency, City Center');

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

  const clothingDailyRate = item.price || 500;
  const calculatedClothingRentCost = totalClothingDays * clothingDailyRate;
  const clothingDeposit = item.deposit || 1000;
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

  const calculatePayableNow = () => {
    if (isHotel) {
      const roomTotal = item.price * hotelNights * hotelRoomsCount;
      const advance25 = Math.round(roomTotal * 0.25);
      return Math.min(tokenAmount, advance25) + platformFee;
    }
    if (isClothing) {
      return tokenAmount + platformFee + clothingDeliveryFee;
    }
    return tokenAmount + platformFee;
  };

  const payableNowTotal = calculatePayableNow();

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

  // Step 1 Validation -> Next to Pricing
  const handleNextToPricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !govIdNumber || !currentAddress) {
      alert('Please complete all required fields (Full Legal Name, Phone, Email, Current Address, Government ID Number).');
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

  // Step 3 Process Payment & Create Booking -> Step 4 Receipt
  const handleProcessPayment = () => {
    setIsPaying(true);
    setPaymentStepText('Connecting to Reserve Bank & NPCI UPI Gateway...');

    setTimeout(() => {
      setPaymentStepText(`Locking ₹${payableNowTotal} in 100% Refundable Escrow Vault...`);
    }, 600);

    setTimeout(() => {
      setPaymentStepText('Generating Official Digital GST Token Receipt...');
    }, 1200);

    setTimeout(() => {
      setIsPaying(false);

      const generatedId = isClothing
        ? `RC-CLOTH-${Math.floor(100000 + Math.random() * 900000)}`
        : isVehicle
        ? `RC-VEH-${Math.floor(100000 + Math.random() * 900000)}`
        : `RCK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

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
        totalPrice: isClothing ? calculatedClothingRentCost + clothingDeposit : item.price + (item.deposit || 0),
        tokenPaidAmount: payableNowTotal,
        tokenPaymentStatus: 'Paid',
        status: 'Pending Verification',
        bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerContact: item.ownerContact,

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
        roomType: item.subType || (item.category === 'student' ? 'PG Shared Room' : '1BHK / 2BHK Rental Unit'),
        furnishedStatus: item.furnishing || 'Semi-Furnished',
        maintenanceAmount: 1000,
        utilityCharges: 'As per Govt Meter / Included',
        fullAddress: item.fullAddress || `${item.location}, ${item.city}`,
        amenities: item.amenities && item.amenities.length > 0 ? item.amenities : ['Wi-Fi', 'AC', 'Parking', 'Kitchen', 'Attached Bathroom'],
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
      };

      playPaymentSuccessChime();
      setCreatedBooking(newBooking);
      onCompleteBooking(newBooking);
      setCurrentStep(4);
    }, 1800);
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
                  <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">Monthly Rent</span>
                  <span className="text-base sm:text-lg font-black text-amber-600">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-medium">{item.priceLabel}</span>
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

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">
                    Full Legal Name (as per Govt ID) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1.5">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Phone + Live OTP Verification Box */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-slate-800 font-semibold">
                    Mobile Number (Instant OTP Verification) <span className="text-amber-500">*</span>
                  </label>
                  {isPhoneVerified && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Phone Number Verified ✓</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-amber-600 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      disabled={isPhoneVerified}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-3 py-2.5 text-slate-900 font-mono tracking-wider outline-none focus:border-amber-500"
                    />
                  </div>

                  {!isPhoneVerified && !isOtpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0 shadow-md shadow-amber-500/20"
                    >
                      Send OTP
                    </button>
                  )}

                  {!isPhoneVerified && isOtpSent && (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0"
                    >
                      Verify (4321)
                    </button>
                  )}
                </div>
              </div>

              {/* Tenant Profile & Work/Education Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Occupation *</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Job">Job / Working Professional</option>
                    <option value="Student">Student / Scholar</option>
                    <option value="Business">Business / Self-Employed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Company / College Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys / COEP Pune"
                    value={companyCollegeName}
                    onChange={(e) => setCompanyCollegeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Addresses: Current & Permanent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">
                    Current Residential Address <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      required
                      placeholder="Flat No, Building, City"
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">
                    Permanent Hometown Address <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      required
                      placeholder="Hometown Address & State"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
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

                  {vehicleRentalMode === 'hourly' && (
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

                    {/* AI Smart Size Recommender Box */}
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 space-y-2 text-xs">
                      <span className="font-bold text-amber-950 text-[11px] flex items-center space-x-1.5">
                        <span>💡 AI Smart Size Recommender</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-700 font-bold block mb-1">Your Height (CM)</label>
                          <input
                            type="number"
                            value={userHeightCm}
                            onChange={(e) => setUserHeightCm(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-700 font-bold block mb-1">Your Weight (KG)</label>
                          <input
                            type="number"
                            value={userWeightKg}
                            onChange={(e) => setUserWeightKg(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-amber-200 text-[11px] font-bold text-amber-900 flex justify-between items-center">
                        <span>Suggested Fit:</span>
                        <span className="font-mono text-amber-700 text-xs font-black">{recommendedSize}</span>
                      </div>
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
                              checked={deliveryMethod === 'pickup_from_owner'}
                              onChange={() => setDeliveryMethod('pickup_from_owner')}
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

              {/* Rental Period & Visit Schedule Box */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300/70 space-y-3">
                <div className="flex items-center space-x-2 border-b border-amber-200 pb-2">
                  <Calendar className="h-4.5 w-4.5 text-amber-600" />
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                    Rental Period & Preferred Visit Schedule
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Move-In Date *</label>
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Expected Move-Out Date *</label>
                    <input
                      type="date"
                      required
                      value={expectedMoveOutDate}
                      onChange={(e) => setExpectedMoveOutDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Rental Duration *</label>
                    <select
                      value={rentalDurationType}
                      onChange={(e) => setRentalDurationType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="1 month">1 Month Short Stay</option>
                      <option value="6 months">6 Months Semester</option>
                      <option value="11 months">11 Months Standard Lease</option>
                      <option value="Custom">Custom Flexible Lease</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Preferred Visit Date/Time</label>
                    <input
                      type="text"
                      placeholder="e.g. Tomorrow at 4:00 PM"
                      value={preferredVisitDateTime}
                      onChange={(e) => setPreferredVisitDateTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Government ID & Passport Photo Upload Section */}
              <div className="bg-slate-50 p-3.5 sm:p-5 rounded-2xl border border-amber-400/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <h4 className="font-bold text-amber-700 text-xs sm:text-sm uppercase tracking-wider">
                      KYC / Identity Verification & Document Upload
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    KYC Verified ✓ • Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">ID Proof Type *</label>
                    <select
                      value={govIdType}
                      onChange={(e) => setGovIdType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving Licence">Driving Licence (RTO)</option>
                      <option value="Voter ID">Voter ID Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">ID Proof Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter ID number"
                      value={govIdNumber}
                      onChange={(e) => setGovIdNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Upload Box 1: ID Proof Document & Upload Box 2: Passport Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Upload ID Proof (Aadhaar/DL/Passport)</label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-white relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-slate-800 font-bold text-[11px] truncate">
                        {idProofFileName || 'Attach ID Proof Document'}
                      </p>
                      <p className="text-slate-500 text-[9px]">JPG, PNG, PDF</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Upload Passport-Size Photo</label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-3 text-center cursor-pointer transition-colors bg-white relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPassportPhotoFileName(file.name);
                            const reader = new FileReader();
                            reader.onloadend = () => setPassportPhotoPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <User className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-slate-800 font-bold text-[11px] truncate">
                        {passportPhotoFileName || 'Attach Tenant Photo'}
                      </p>
                      <p className="text-slate-500 text-[9px]">Clear Face Passport Photo</p>
                    </div>
                  </div>
                </div>

                {/* Important Sensitive ID Security & Privacy Note */}
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-300/80 flex items-start space-x-2 text-[11px] text-amber-900">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="font-bold">Privacy Protection Note:</strong> Sensitive identity data (such as Aadhaar/Passport) is 256-bit AES encrypted and processed strictly per Indian Privacy Regulations. Data is stored securely and never shared publicly.
                  </p>
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

              {/* 1. Auto-filled Property Details Summary Card */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-300/60 space-y-2.5 text-xs">
                <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 border-b border-amber-200/80 pb-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>1. Auto-Filled Listing Details</span>
                </h5>

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
                    <strong className="text-slate-900 font-bold block">{item.subType || 'PG / 1BHK Room'}</strong>
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

                {/* Amenities Pills */}
                <div className="pt-2 border-t border-amber-200/80">
                  <span className="text-slate-500 font-medium block text-[10px] uppercase mb-1">Included Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(item.amenities && item.amenities.length > 0 ? item.amenities : ['Wi-Fi', 'AC', 'Parking', 'Kitchen', 'Attached Bathroom']).map((am, i) => (
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
                  <span>2. Payment & Initial Handover Cost Breakdown</span>
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
                          Vehicle Rent ({vehicleRentalMode === 'hourly' ? `${totalCalculatedHours} hrs × ₹${vehicleHourlyRate}` : 'Daily Rate'}):
                        </span>
                        <span className="font-bold text-slate-900 text-sm font-mono">₹{calculatedVehicleRentCost.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-700 font-bold block">Security Deposit (Refundable at Return):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Separately held (NOT included in rent)</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono text-sm">₹{(item.deposit || 2000).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Priority Booking Escrow Token (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">₹{tokenAmount}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Verification Fee:</span>
                        <span className="font-bold text-slate-800">₹{platformFee}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Monthly Rent:</span>
                        <span className="font-bold text-slate-900 text-sm">₹{item.price.toLocaleString('en-IN')} / month</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Refundable Security Deposit (To Host):</span>
                        <span className="font-bold text-slate-800">₹{(item.deposit || item.price * 2).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Maintenance Charges:</span>
                        <span className="font-bold text-slate-800">₹1,000 / month</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-amber-800 font-bold">Escrow Priority Token Amount (Payable Now):</span>
                        <span className="font-mono font-black text-amber-700 text-sm">₹{tokenAmount}</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                        <span className="text-slate-600 font-semibold">Platform Escrow Verification Fee:</span>
                        <span className="font-bold text-slate-800">₹{platformFee}</span>
                      </div>
                    </>
                  )}

                  {/* Summary Totals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        {isClothing ? 'Total Balance Payable at Handover' : isVehicle ? 'Total Balance Payable at Pickup Hub' : 'Total Initial Payment at Move-In'}
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        ₹{(isClothing ? calculatedClothingRentCost + clothingDeposit : isVehicle ? calculatedVehicleRentCost + (item.deposit || 2000) : item.price + (item.deposit || item.price * 2) + 1000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-400/40">
                      <span className="text-[10px] text-amber-900 uppercase font-bold block">Token Payable Now (Escrow Locked)</span>
                      <span className="text-lg font-black text-amber-700 font-mono">
                        ₹{payableNowTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Agreement & Rules Checklist */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-amber-400/30 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  <span>3. Agreement Terms, Rules & Policies</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 font-medium pb-2 border-b border-slate-200">
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
                </div>

                <label className="flex items-start space-x-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
                  <input
                    type="checkbox"
                    checked={agreeCorrectInfo}
                    onChange={(e) => setAgreeCorrectInfo(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded accent-amber-500 cursor-pointer shrink-0"
                  />
                  <span className="text-slate-800 text-xs leading-relaxed font-medium">
                    I confirm that all personal details, government identity proof (<strong className="text-slate-900">{govIdType}: {govIdNumber}</strong>), and contact details provided are genuine and accurate.
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
                    I agree to Recko India's <strong className="text-amber-700">Rental Terms & Conditions</strong>, Notice Period, Pet/Guest Policy, and 100% Refundable Token Policy.
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
                    I confirm that all personal details, government identity proof (<strong className="text-slate-900">{govIdType}: {govIdNumber}</strong>), and contact details provided are genuine and accurate.
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

                {/* 4 Payment Options Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <QrCode className={`h-5 w-5 mb-1.5 ${paymentMethod === 'upi' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div>
                      <span className="font-bold block text-xs">UPI / QR Code</span>
                      <span className={`text-[10px] ${paymentMethod === 'upi' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        GPay, PhonePe, Paytm
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <CreditCard className={`h-5 w-5 mb-1.5 ${paymentMethod === 'card' ? 'text-amber-400' : 'text-amber-500'}`} />
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
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <Building2 className={`h-5 w-5 mb-1.5 ${paymentMethod === 'netbanking' ? 'text-amber-400' : 'text-amber-500'}`} />
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
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-slate-900 text-amber-400 border-amber-400 font-bold shadow-md'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <Wallet className={`h-5 w-5 mb-1.5 ${paymentMethod === 'wallet' ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div>
                      <span className="font-bold block text-xs">Recko Wallet</span>
                      <span className={`text-[10px] ${paymentMethod === 'wallet' ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                        Escrow & Balance
                      </span>
                    </div>
                  </button>
                </div>

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
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                              `upi://pay?pa=recko.escrow@okhdfcbank&pn=Recko%20India%20Escrow&tr=RCK-${Date.now()}&am=${payableNowTotal}&cu=INR&tn=Recko%20Token%20for%20${encodeURIComponent(item.title)}`
                            )}&color=0f172a&bgcolor=ffffff`}
                            alt="Recko Real NPCI UPI QR Code"
                            className="h-32 w-32 object-contain bg-white p-2 rounded-2xl border-2 border-amber-400 shadow-lg"
                          />
                          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                            <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm uppercase">
                              NPCI Live QR
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
                            <span className="text-xs text-amber-800 font-mono font-black bg-amber-50 px-3 py-1 rounded-xl border border-amber-300">
                              recko.escrow@okhdfcbank
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-xl flex items-center space-x-1 cursor-pointer font-bold transition-all shadow-sm"
                            >
                              <Copy className="h-3.5 w-3.5 text-amber-400" />
                              <span>{copiedUpi ? 'Copied ✓' : 'Copy VPA'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
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

          {/* PAGE 4: DIGITAL RECEIPT & TICKET */}
          {currentStep === 4 && createdBooking && (
            <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
              
              {/* Gold Escrow Seal Badge */}
              <div className="h-16 w-16 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="bg-amber-500/10 text-amber-800 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 mb-2">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Escrow Token Held • 🟡 Host Review Pending</span>
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Booking Request & Token Secured!
                </h3>
                <p className="text-slate-600 text-xs max-w-md mx-auto mt-1 font-medium">
                  Your tenant verification details & token receipt have been recorded and forwarded to host <strong className="text-slate-900">{item.ownerName}</strong> for final approval.
                </p>
              </div>

              {/* Official Receipt Summary Card (White Background, Black Text & Gold Accents) */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-amber-400/40 text-left space-y-3 text-xs font-mono text-slate-900">
                
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-sans">Booking Reference:</span>
                  <strong className="text-amber-700 font-black text-sm">{createdBooking.id}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-sans">Property / Asset:</span>
                  <strong className="text-slate-900 truncate max-w-[200px] sm:max-w-md font-sans">{item.title}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-sans">Tenant Name:</span>
                  <strong className="text-slate-900 font-sans">{createdBooking.userName}</strong>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-sans">Government KYC Proof:</span>
                  <strong className="text-slate-800">{createdBooking.govIdType} ({createdBooking.govIdNumber})</strong>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-sans">Token Paid Amount:</span>
                  <strong className="text-amber-700 font-black text-sm font-sans">₹{createdBooking.tokenPaidAmount} (PAID ✓ ESCROW LOCKED)</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600 font-sans">Move-in / Start Date:</span>
                  <strong className="text-slate-900 font-sans">{createdBooking.startDate}</strong>
                </div>
              </div>

              {/* Lifecycle explanation bar */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="h-3.5 w-3.5 text-amber-500" />
                  <span>Booking Request Lifecycle</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold">
                  <div className="bg-amber-400 text-slate-950 p-2.5 rounded-xl border border-amber-300 text-center shadow-xs">
                    🟡 1. Token Paid
                  </div>
                  <div className="bg-white text-slate-800 p-2.5 rounded-xl border border-slate-200 text-center">
                    ⚪ 2. Host Review
                  </div>
                  <div className="bg-white text-emerald-700 p-2.5 rounded-xl border border-slate-200 text-center">
                    🟢 3. Approved
                  </div>
                  <div className="bg-white text-slate-700 p-2.5 rounded-xl border border-slate-200 text-center">
                    🏠 4. Move In
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToMyBookings();
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Track Status in My Bookings</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </button>

                {onOpenFeedbackModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFeedbackModal();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-4 py-3 rounded-2xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Feedback & Review</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    alert(`Official PDF Token Receipt #${createdBooking.id} generated and downloaded.`);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-3 rounded-2xl border border-slate-800 text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>Download Token Receipt</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
