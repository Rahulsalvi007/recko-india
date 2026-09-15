import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  KeyRound,
  Sparkles,
  Upload,
  Camera,
  FileText,
  Image as ImageIcon,
  Trash2,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';
import { LandlordUser } from '../types';
import { EmailVerificationModal } from './EmailVerificationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { loginWithEmailPassword, registerWithEmailPassword, loginWithGoogle, saveDocument } from '../lib/firebase';

interface LandlordAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  landlords: LandlordUser[];
  onRequestRegister: (newUser: LandlordUser) => void;
  onLoginSuccess: (user: LandlordUser) => void;
}

export const LandlordAuthModal: React.FC<LandlordAuthModalProps> = ({
  isOpen,
  onClose,
  landlords,
  onRequestRegister,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login fields
  const [loginEmailOrId, setLoginEmailOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register fields
  const [regUserId, setRegUserId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regState, setRegState] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regIdProofNumber, setRegIdProofNumber] = useState('');
  const [regDocType, setRegDocType] = useState('Aadhaar Card & Property Ownership Proof');
  const [regDocPhoto, setRegDocPhoto] = useState<string>('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const [createdOwnerId, setCreatedOwnerId] = useState('');

  // Email Verification OTP state
  const [pendingLandlord, setPendingLandlord] = useState<LandlordUser | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyMode, setVerifyMode] = useState<'login' | 'register'>('login');

  // Forgot Password modal state
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  if (!isOpen && !isVerifyOpen && !isForgotPassOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegDocPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const finalizeLandlordVerify = () => {
    if (!pendingLandlord) return;
    const verifiedLandlord: LandlordUser = {
      ...pendingLandlord,
      emailVerified: true
    };

    if (verifyMode === 'register') {
      onRequestRegister(verifiedLandlord);
      setRegSuccess(true);
    } else {
      onLoginSuccess(verifiedLandlord);
      onClose();
    }
    setIsVerifyOpen(false);
    setPendingLandlord(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const target = loginEmailOrId.trim().toLowerCase();
    const cleanTargetPhone = target.replace(/[^0-9]/g, '');

    // Check prop landlords and local storage landlords list
    let allLandlords = [...landlords];
    try {
      const stored = localStorage.getItem('renthub_landlords_list');
      if (stored) {
        const parsed: LandlordUser[] = JSON.parse(stored);
        parsed.forEach((pl) => {
          if (!allLandlords.some((l) => l.id.toLowerCase() === pl.id.toLowerCase() || (pl.email && l.email?.toLowerCase() === pl.email.toLowerCase()))) {
            allLandlords.push(pl);
          }
        });
      }
    } catch (e) {
      console.error('Error reading stored landlords:', e);
    }

    const found = allLandlords.find((l) => {
      const matchId = l.id.toLowerCase() === target;
      const matchEmail = l.email?.toLowerCase() === target;
      const cleanLandlordPhone = l.phone?.replace(/[^0-9]/g, '') || '';
      const matchPhone = cleanTargetPhone.length >= 8 && cleanLandlordPhone.includes(cleanTargetPhone);
      return matchId || matchEmail || matchPhone;
    });

    if (!found) {
      setLoginError('Owner / Landlord account not found. Please complete Registration first.');
      setIsLoggingIn(false);
      return;
    }

    if (found.password && loginPassword && found.password !== loginPassword) {
      setLoginError('Invalid password. Please enter the correct account password.');
      setIsLoggingIn(false);
      return;
    }

    if (found.status === 'Rejected') {
      setLoginError('Your landlord application was rejected by the System Administrator.');
      setIsLoggingIn(false);
      return;
    }

    setIsLoggingIn(false);
    // Require Email OTP verification on login
    setPendingLandlord(found);
    setVerifyMode('login');
    setIsVerifyOpen(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regName.trim()) {
      alert('⚠️ Required Field Missing:\n\nPlease enter your Full Name.');
      return;
    }
    if (!regPhone.trim() || !/^[6-9]\d{9}$/.test(regPhone.trim())) {
      alert('⚠️ Invalid Phone Number:\n\nPlease enter a valid 10-digit Indian Mobile Number (starting with 6, 7, 8, or 9).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      alert('⚠️ Required Field Missing:\n\nPlease enter a valid Email address.');
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 4) {
      alert('⚠️ Required Field Missing:\n\nPlease enter a Password (minimum 4 characters).');
      return;
    }
    if (!regCity.trim()) {
      alert('⚠️ Required Field Missing:\n\nPlease enter your City / Location.');
      return;
    }
    if (!regAddress.trim()) {
      alert('⚠️ Required Field Missing:\n\nPlease enter your Full Address.');
      return;
    }
    if (!regIdProofNumber.trim()) {
      alert('⚠️ Required Field Missing:\n\nPlease enter your Government ID Number (Aadhaar / PAN / License).');
      return;
    }

    const requestedId = regUserId.trim();
    if (requestedId) {
      const exists = landlords.some((l) => l.id.toLowerCase() === requestedId.toLowerCase());
      if (exists) {
        alert('This Landlord User ID is already taken. Please enter a unique ID or leave blank to auto-generate.');
        return;
      }
    }

    const finalId = requestedId || `OWN-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOwnerId(finalId);

    if (regEmail.trim()) {
      try {
        await registerWithEmailPassword(regEmail.trim().toLowerCase(), regPassword.trim());
      } catch (fbErr: any) {
        console.log('Firebase landlord registration note:', fbErr);
      }
    }

    const newUser: LandlordUser = {
      id: finalId,
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      businessName: regBusiness.trim() || `${regName.trim()} Rentals`,
      state: regState.trim(),
      district: regDistrict.trim(),
      city: regCity.trim(),
      address: regAddress.trim(),
      idProofNumber: regIdProofNumber.trim(),
      documentType: regDocType,
      documentPhotoUrl: regDocPhoto || undefined,
      password: regPassword.trim(),
      status: 'Pending',
      requestedAt: new Date().toISOString().split('T')[0]
    };

    // Save Landlord / Owner registration application to Firebase Cloud Firestore
    try {
      await saveDocument('landlords', newUser.id, newUser);
    } catch (fbErr) {
      console.warn('Firebase landlord registration save note:', fbErr);
    }

    setPendingLandlord(newUser);
    setVerifyMode('register');
    setIsVerifyOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 w-full max-w-md sm:max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all">
        
        {/* Header: Cohesive Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 border border-amber-300 rounded-2xl shadow-md shrink-0">
              <Building2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Owner & Landlord Portal</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                Register & manage property & rental listings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-2xl transition-all cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Auth Tab Switcher */}
        <div className="mx-6 mt-5 mb-2 shrink-0">
          <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 gap-1.5 shadow-inner">
            <button
              onClick={() => {
                setTab('login');
                setRegSuccess(false);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                tab === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-amber-400/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Building2 className={`h-4 w-4 ${tab === 'login' ? 'text-amber-500' : ''}`} />
              <span>Owner Log In</span>
            </button>

            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                tab === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-amber-400/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <Sparkles className={`h-4 w-4 ${tab === 'register' ? 'text-amber-500' : ''}`} />
              <span>Registration</span>
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 pt-3 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {loginError && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{loginError}</p>
                </div>
              )}

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-slate-800 dark:text-zinc-200 font-medium flex items-center gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span>Enter your registered Landlord ID or Email address to log in.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                  Landlord ID or Registered Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter registered email or Owner ID"
                    value={loginEmailOrId}
                    onChange={(e) => setLoginEmailOrId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 tracking-wide">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassOpen(true)}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <Building2 className="h-4 w-4" />
                  <span>{isLoggingIn ? 'Verifying Credentials...' : 'Log In to Owner Portal'}</span>
                </button>
              </div>
            </form>
          ) : regSuccess ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="mx-auto w-14 h-14 bg-amber-400/10 border-2 border-amber-400 text-amber-500 rounded-2xl flex items-center justify-center shadow-md">
                <ShieldCheck className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <span className="bg-amber-400/20 text-amber-600 dark:text-amber-400 font-bold text-xs px-3 py-1 rounded-full border border-amber-400/40 inline-flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>STATUS: PENDING ADMIN APPROVAL</span>
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">Registration Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Your Owner Registration has been received. Before you can upload properties or rental assets, the Administrator will verify your details.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 p-3.5 rounded-2xl text-left text-xs space-y-1.5 font-mono">
                <p><span className="text-slate-500 dark:text-zinc-400">Owner Name:</span> {regName}</p>
                <p><span className="text-slate-500 dark:text-zinc-400">Owner ID:</span> <span className="text-amber-600 dark:text-amber-400 font-extrabold">{createdOwnerId || regUserId.trim()}</span></p>
                <p><span className="text-slate-500 dark:text-zinc-400">Email:</span> {regEmail}</p>
                <p><span className="text-slate-500 dark:text-zinc-400">Status:</span> <span className="text-amber-600 dark:text-amber-400 font-bold">Pending Admin Approval</span></p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    const newOwnerObj: LandlordUser = {
                      id: createdOwnerId || regUserId.trim() || `OWN-${Math.floor(1000 + Math.random() * 9000)}`,
                      name: regName,
                      email: regEmail,
                      phone: regPhone,
                      businessName: regBusiness || `${regName} Rentals`,
                      state: regState,
                      district: regDistrict,
                      city: regCity,
                      address: regAddress,
                      idProofNumber: regIdProofNumber,
                      documentType: regDocType,
                      documentPhotoUrl: regDocPhoto || undefined,
                      password: regPassword || 'owner123',
                      status: 'Pending',
                      requestedAt: new Date().toISOString().split('T')[0]
                    };
                    onLoginSuccess(newOwnerObj);
                    onClose();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Log In to Owner Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setLoginEmailOrId(createdOwnerId || regEmail);
                    setTab('login');
                    setRegSuccess(false);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-semibold py-2.5 rounded-xl text-xs transition-all cursor-pointer border border-slate-300 dark:border-zinc-700"
                >
                  Go to Login Form
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              <div className="bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-zinc-200 p-3 rounded-2xl text-xs font-medium">
                <p className="flex items-center space-x-1.5 font-bold mb-0.5 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Verified Owner & Host Registration</span>
                </p>
                Fill your details below to create your Owner Account. Only registered Owners can list Properties, Vehicles, Clothing & Sports Turfs!
              </div>

              {/* Landlord User ID Option */}
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 p-3 rounded-2xl">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Preferred Landlord User ID</span>
                    <span className="text-slate-400 dark:text-zinc-500 font-normal text-[11px]">(Optional)</span>
                  </span>
                  <span className="text-[10px] text-amber-500 font-mono font-bold">e.g. OWN-7788</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter custom Landlord User ID (or leave blank to auto-generate)"
                  value={regUserId}
                  onChange={(e) => setRegUserId(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh PGs & Flats"
                    value={regBusiness}
                    onChange={(e) => setRegBusiness(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Operating City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Udaipur, Mumbai..."
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Govt ID / License Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AADH-9876-XXXX"
                    value={regIdProofNumber}
                    onChange={(e) => setRegIdProofNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Document Type
                  </label>
                  <select
                    value={regDocType}
                    onChange={(e) => setRegDocType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Aadhaar Card & Property Ownership Proof">Aadhaar Card & Property Deed</option>
                    <option value="Electricity Bill & PAN Card">Electricity Bill & PAN Card</option>
                    <option value="Commercial Business License">Commercial Business License</option>
                    <option value="Vehicle Registration Certificate (RC)">Vehicle Registration Certificate (RC)</option>
                  </select>
                </div>
              </div>

              {/* Document Photo Upload Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between tracking-wide">
                  <span>Document / ID Proof Photo</span>
                  <span className="text-[10px] text-amber-500 font-bold uppercase">Required</span>
                </label>

                {regDocPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/30 bg-zinc-900 p-2 group">
                    <img
                      src={regDocPhoto}
                      alt="Uploaded Verification Document"
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setRegDocPhoto('')}
                        className="bg-rose-600 text-white p-2 rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-amber-500 rounded-2xl p-4 text-center bg-slate-50 dark:bg-zinc-800/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      id="doc-photo-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="doc-photo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-1.5"
                    >
                      <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl border border-amber-300 shadow-sm">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                          Upload ID / Document Photo
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          PNG, JPG, WEBP up to 10MB (Aadhaar, PAN, RC, Deed)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-[0.99]"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Submit Landlord Application for Verification</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* FREE EMAIL VERIFICATION OTP MODAL */}
      {isVerifyOpen && pendingLandlord && (
        <EmailVerificationModal
          isOpen={isVerifyOpen}
          email={pendingLandlord.email}
          userName={pendingLandlord.name}
          onClose={() => setIsVerifyOpen(false)}
          onSuccess={finalizeLandlordVerify}
          title="Verify Owner Email Address"
        />
      )}

      {/* FORGOT PASSWORD RESET MODAL */}
      {isForgotPassOpen && (
        <ForgotPasswordModal
          isOpen={isForgotPassOpen}
          initialRole="landlord"
          initialEmail={loginEmailOrId}
          onClose={() => setIsForgotPassOpen(false)}
          onSuccessRedirectToLogin={(email) => {
            setIsForgotPassOpen(false);
            setLoginEmailOrId(email);
            setTab('login');
            setLoginPassword('');
            setLoginError('');
          }}
        />
      )}
    </div>
  );
};
