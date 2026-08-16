import React, { useState } from 'react';
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

  // Wizard Steps: 1 = KYC Details, 2 = Terms & Token Payment, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
  const [occupation, setOccupation] = useState('Working Professional');
  const [monthlyIncome, setMonthlyIncome] = useState('₹50,000 - ₹1,00,000');
  const [occupantsCount, setOccupantsCount] = useState(1);
  const [moveInDate, setMoveInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });

  const [govIdType, setGovIdType] = useState<'Aadhaar Card' | 'PAN Card' | 'Driving License' | 'Passport'>('Aadhaar Card');
  const [govIdNumber, setGovIdNumber] = useState('5489 1234 9876');
  const [idProofFileName, setIdProofFileName] = useState<string | null>('aadhaar_card_verified.pdf');
  const [idProofPreview, setIdProofPreview] = useState<string | null>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80');
  const [emergencyContact, setEmergencyContact] = useState('9829012345');
  const [emergencyRelation, setEmergencyRelation] = useState('Parent / Guardian');

  // Step 2 Terms & Payment
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

  // Step 3 Result State
  const [createdBooking, setCreatedBooking] = useState<RentalBooking | null>(null);

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

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('recko.escrow@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Step 1 Validation
  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !govIdNumber || !currentAddress) {
      alert('Please complete all required fields (Full Legal Name, Phone, Email, Current Address, Government ID Number).');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Process Payment & Create Booking
  const handleProcessPayment = () => {
    if (!agreeCorrectInfo || !agreeTermsPolicy) {
      alert('Please check both agreement boxes to proceed with token payment.');
      return;
    }

    setIsPaying(true);
    setPaymentStepText('Connecting to Reserve Bank & NPCI UPI Gateway...');

    setTimeout(() => {
      setPaymentStepText(`Locking ₹${tokenAmount} in 100% Refundable Escrow Vault...`);
    }, 600);

    setTimeout(() => {
      setPaymentStepText('Generating Official Digital GST Token Receipt...');
    }, 1200);

    setTimeout(() => {
      setIsPaying(false);

      const generatedId = `RCK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const newBooking: RentalBooking = {
        id: generatedId,
        type: (item.category as any) || 'property',
        itemId: item.id,
        itemTitle: item.title,
        itemImage: item.image,
        startDate: moveInDate,
        totalPrice: item.price + (item.deposit || 0),
        tokenPaidAmount: tokenAmount,
        tokenPaymentStatus: 'Paid',
        status: 'Pending Verification',
        bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerContact: item.ownerContact,

        // Tenant Verification Details
        userName: fullName,
        userPhone: phone,
        userEmail: email,
        dob,
        currentAddress,
        occupation,
        monthlyIncome,
        occupantsCount,
        moveInDate,
        govIdType,
        govIdNumber,
        idProofUrl: idProofPreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
        emergencyContact: emergencyContact ? `${emergencyContact} (${emergencyRelation})` : undefined
      };

      setCreatedBooking(newBooking);
      onCompleteBooking(newBooking);
      setCurrentStep(3);
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
                  {currentStep === 1 && 'Tenant Verification & KYC Details'}
                  {currentStep === 2 && `Token Pay (₹${tokenAmount}) - Secure Escrow`}
                  {currentStep === 3 && 'Receipt & Confirmation'}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-300 font-medium flex items-center space-x-1.5 truncate mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>100% Refundable Escrow • Official Digital Booking Slip</span>
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

        {/* Step Wizard Progress Bar (White Background, Black Text & Gold Accents) */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 shrink-0">
          <div className="hidden sm:flex items-center justify-between text-xs font-bold">
            
            {/* Step 1 */}
            <div className={`flex items-center space-x-2.5 ${currentStep >= 1 ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep >= 1 ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className={currentStep === 1 ? 'text-slate-900 font-bold' : ''}>1. Tenant Verification</span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-slate-200">
              <div className={`h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 ${currentStep >= 2 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 2 */}
            <div className={`flex items-center space-x-2.5 ${currentStep >= 2 ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep >= 2 ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className={currentStep === 2 ? 'text-slate-900 font-bold' : ''}>2. Token Pay (₹{tokenAmount})</span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-slate-200">
              <div className={`h-full bg-gradient-to-r from-yellow-400 to-emerald-500 transition-all duration-300 ${currentStep === 3 ? 'w-full' : 'w-0'}`} />
            </div>

            {/* Step 3 */}
            <div className={`flex items-center space-x-2.5 ${currentStep === 3 ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
              <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                currentStep === 3 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
              }`}>
                3
              </span>
              <span className={currentStep === 3 ? 'text-slate-900 font-bold' : ''}>3. Receipt & Confirmation</span>
            </div>
          </div>

          {/* Mobile Step Indicator */}
          <div className="sm:hidden flex items-center justify-between text-xs">
            <span className="font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-3 py-1 rounded-lg shadow-xs">
              Step {currentStep} of 3
            </span>
            <span className="text-slate-900 font-bold text-xs">
              {currentStep === 1 && '1. Tenant Verification'}
              {currentStep === 2 && `2. Token Pay (₹${tokenAmount})`}
              {currentStep === 3 && '3. Receipt & Confirmation'}
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

          {/* PAGE 1: TENANT VERIFICATION */}
          {currentStep === 1 && (
            <form onSubmit={handleNextToPayment} className="space-y-4 sm:space-y-5">
              
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <BadgeCheck className="h-4.5 w-4.5 text-amber-500" />
                    <span>Tenant Verification & KYC Details</span>
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Official verified background check details forwarded to host upon token payment.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Verified Escrow Lock
                </span>
              </div>

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

                {isOtpSent && !isPhoneVerified && (
                  <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-600 font-medium">
                      An OTP has been sent to +91 {phone}. Enter demo code <strong className="text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">4321</strong> below:
                    </p>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="4321"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-slate-900 font-mono text-base tracking-widest w-32 outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
                      >
                        Verify OTP Code
                      </button>
                    </div>
                  </div>
                )}

                {otpError && <p className="text-rose-600 text-[11px] font-bold">{otpError}</p>}
              </div>

              {/* Occupation, Income, Occupants, Move-In Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Working Professional">Working Professional</option>
                    <option value="Student / Scholar">Student / College Student</option>
                    <option value="Business Owner">Business / Self-Employed</option>
                    <option value="Government Employee">Government Employee</option>
                    <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Monthly Income</label>
                  <select
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Under ₹25,000">Under ₹25,000 / Allowance</option>
                    <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="₹1,00,000+">₹1,00,000+ per month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Occupants Count</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={occupantsCount}
                    onChange={(e) => setOccupantsCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none font-bold focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-semibold mb-1">
                    Move-In Date <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none font-medium focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Current Address */}
              <div>
                <label className="block text-slate-800 font-semibold mb-1">
                  Current Permanent Residential Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                  <input
                    type="text"
                    required
                    placeholder="House/Flat No, Street, City, State & Pincode"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-slate-900 font-medium outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Government ID Verification Section */}
              <div className="bg-slate-50 p-3.5 sm:p-5 rounded-2xl border border-amber-400/30 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2.5">
                  <FileCheck className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  <h4 className="font-bold text-amber-700 text-xs sm:text-sm uppercase tracking-wider">
                    Government ID & Identity Proof
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Govt ID Type *</label>
                    <select
                      value={govIdType}
                      onChange={(e) => setGovIdType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                      <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                      <option value="Driving License">Driving License (RTO)</option>
                      <option value="Passport">Indian Passport</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Govt ID Number *</label>
                    <input
                      type="text"
                      required
                      placeholder={
                        govIdType === 'Aadhaar Card' ? 'e.g. 5489 1234 9876' :
                        govIdType === 'PAN Card' ? 'e.g. ABCDE1234F' : 'Enter ID number'
                      }
                      value={govIdNumber}
                      onChange={(e) => setGovIdNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <label className="block text-slate-800 font-semibold mb-1">Upload ID Proof Photo / Document</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-colors bg-white relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-6 w-6 text-amber-500 mx-auto mb-1.5" />
                    {idProofFileName ? (
                      <div className="space-y-1">
                        <p className="text-emerald-700 font-bold text-xs flex items-center justify-center space-x-1">
                          <Check className="h-3.5 w-3.5" />
                          <span>File Attached: {idProofFileName}</span>
                        </p>
                        <p className="text-[11px] text-amber-700 font-medium">Click to replace or re-upload</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-slate-800 font-bold text-xs">
                          Click or drag photo / PDF document here
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Supported: JPG, PNG, PDF (Government Verified Format)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Emergency Contact Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9829012345"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 font-semibold mb-1">Emergency Contact Relation</label>
                    <select
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Colleague / Friend">Colleague / Friend</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.99]"
                >
                  <span>Proceed to Token Pay (₹{tokenAmount})</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </form>
          )}

          {/* PAGE 2: TOKEN PAY (₹99) */}
          {currentStep === 2 && (
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
                          onClick={() => setSelectedUpiApp('gpay')}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'gpay'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span className="text-blue-500 font-black">G</span>
                          <span className="text-red-500 font-black">P</span>
                          <span className="text-yellow-500 font-black">a</span>
                          <span className="text-green-500 font-black">y</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('phonepe')}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'phonepe'
                              ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>PhonePe</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('paytm')}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'paytm'
                              ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>Paytm UPI</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedUpiApp('cred')}
                          className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            selectedUpiApp === 'cred'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>CRED UPI</span>
                        </button>
                      </div>
                    </div>

                    {/* QR Code & VPA ID Display */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="h-24 w-24 bg-white p-2 rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-amber-400">
                        <QrCode className="h-20 w-20 text-slate-950" />
                      </div>
                      
                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <p className="font-bold text-slate-900 text-xs flex items-center justify-center sm:justify-start space-x-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span>Scan QR via Any UPI App (GPay / PhonePe / BHIM)</span>
                        </p>
                        
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <span className="text-xs text-amber-700 font-mono font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
                            recko.escrow@okhdfcbank
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer font-bold transition-colors"
                          >
                            <Copy className="h-3 w-3 text-amber-400" />
                            <span>{copiedUpi ? 'Copied ✓' : 'Copy'}</span>
                          </button>
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

          {/* PAGE 3: RECEIPT & CONFIRMATION */}
          {currentStep === 3 && createdBooking && (
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
