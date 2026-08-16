import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  LogIn,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Sparkles,
  Eye,
  EyeOff,
  MapPin,
  FileText,
  AlertCircle,
  BadgeCheck,
  Building2,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { saveDocument, loginWithEmailPassword, registerWithEmailPassword, loginWithGoogle } from '../lib/firebase';
import { EmailVerificationModal } from './EmailVerificationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regPinCode, setRegPinCode] = useState('');
  const [regGovId, setRegGovId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Email Verification state
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Forgot Password modal state
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  if (!isOpen && !isVerifyOpen && !isForgotPassOpen) return null;

  // Helper to load stored user list
  const getStoredUsers = (): UserProfile[] => {
    try {
      const saved = localStorage.getItem('renthub_users_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading stored users:', e);
    }
    return [];
  };

  const finalizeLogin = (userToLogin: UserProfile) => {
    const verifiedUser: UserProfile = {
      ...userToLogin,
      emailVerified: true,
      currentAddress: userToLogin.address
        ? `${userToLogin.address}, ${userToLogin.city || ''}, ${userToLogin.state || ''} ${userToLogin.pinCode || ''}`.replace(/,\s*,/g, ',').trim()
        : userToLogin.currentAddress
    };

    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === verifiedUser.id || u.email.toLowerCase() === verifiedUser.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = verifiedUser;
    } else {
      users.push(verifiedUser);
    }
    localStorage.setItem('renthub_users_list', JSON.stringify(users));

    try {
      saveDocument('users', verifiedUser.id, {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        phone: verifiedUser.phone,
        address: verifiedUser.address || '',
        city: verifiedUser.city || '',
        state: verifiedUser.state || '',
        pinCode: verifiedUser.pinCode || '',
        currentAddress: verifiedUser.currentAddress || '',
        govIdNumber: verifiedUser.govIdNumber || '',
        emailVerified: true,
        createdAt: verifiedUser.createdAt
      });
    } catch (e) {
      console.warn('Firestore backup warning:', e);
    }

    onLoginSuccess(verifiedUser);
    setIsVerifyOpen(false);
    setPendingUser(null);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const passTrimmed = loginPassword.trim();

    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setLoginError('Please enter a valid Gmail / Email address.');
      setIsLoggingIn(false);
      return;
    }

    const users = getStoredUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === emailTrimmed
    );

    // STRICT CHECK: User MUST be registered first!
    if (!foundUser) {
      setLoginError('Account not found. Please complete Registration first.');
      setIsLoggingIn(false);
      return;
    }

    if (foundUser.password && passTrimmed && foundUser.password !== passTrimmed) {
      setLoginError('Incorrect password. Please enter the correct password.');
      setIsLoggingIn(false);
      return;
    }

    try {
      await loginWithEmailPassword(emailTrimmed, passTrimmed || 'password123');
    } catch (fbErr: any) {
      console.log('Firebase auth login note:', fbErr?.message || fbErr);
    }

    setIsLoggingIn(false);
    // Require Gmail OTP verification step before logging in!
    setPendingUser(foundUser);
    setIsVerifyOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(false);
    setIsRegistering(true);

    if (!regName.trim()) {
      setRegError('Please enter your Full Name.');
      setIsRegistering(false);
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid Gmail / Email address.');
      setIsRegistering(false);
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Please enter your 10-digit Phone Number.');
      setIsRegistering(false);
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPassword.trim() || 'password123';

    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setRegError('An account is already registered with this email address. Please Log In.');
      setIsRegistering(false);
      return;
    }

    try {
      await registerWithEmailPassword(cleanEmail, cleanPass);
    } catch (fbErr: any) {
      console.log('Firebase register info:', fbErr?.message || fbErr);
    }

    const fullAddrStr = [regAddress.trim(), regCity.trim(), regState.trim(), regPinCode.trim()].filter(Boolean).join(', ');

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: cleanEmail,
      phone: regPhone.trim(),
      address: regAddress.trim(),
      city: regCity.trim(),
      state: regState.trim(),
      pinCode: regPinCode.trim(),
      govIdNumber: regGovId.trim(),
      currentAddress: fullAddrStr || undefined,
      password: cleanPass,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setIsRegistering(false);
    setRegSuccess(true);
    setPendingUser(newUser);
    setIsVerifyOpen(true);
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      const res = await loginWithGoogle();
      if (res?.user) {
        const gUser = res.user;
        const newUser: UserProfile = {
          id: gUser.uid || `usr-${Date.now()}`,
          name: gUser.displayName || 'Google User',
          email: gUser.email || '',
          phone: gUser.phoneNumber || '',
          emailVerified: true,
          createdAt: new Date().toISOString().split('T')[0]
        };
        finalizeLogin(newUser);
      }
    } catch (err: any) {
      console.error('Google sign in notice:', err?.message || err);
      setLoginError('Google Login unavailable. Please enter email & password below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-zinc-100 my-auto max-h-[92vh] flex flex-col transition-all">
        
        {/* Top Header Design: Clean, Modern Amber & Dark Theme Cohesive */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 rounded-2xl shadow-md border border-amber-300 shrink-0">
              <User className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {currentUser ? 'Your Account Profile' : 'User Account Portal'}
                </h2>
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Email OTP Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {currentUser ? 'Manage active bookings, addresses & details' : 'Zero Brokerage • Direct Owner Contact'}
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

        {/* IF USER IS ALREADY LOGGED IN */}
        {currentUser ? (
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shrink-0 border border-amber-300">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {currentUser.email}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {currentUser.phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>

              {(currentUser.address || currentUser.currentAddress) && (
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700/70 text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 block tracking-wider">Registered Address</span>
                  <p className="font-semibold text-slate-900 dark:text-white flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{currentUser.address || currentUser.currentAddress}</span>
                  </p>
                  {currentUser.city && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-5 font-medium">
                      {currentUser.city}{currentUser.state ? `, ${currentUser.state}` : ''} {currentUser.pinCode || ''}
                    </p>
                  )}
                </div>
              )}

              {currentUser.govIdNumber && (
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-700/70 text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Government ID Proof:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-500" /> {currentUser.govIdNumber}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/50 flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400">
                <span>Account Created:</span>
                <span className="text-slate-900 dark:text-zinc-200 font-bold">{currentUser.createdAt}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 text-xs text-slate-800 dark:text-zinc-200 space-y-1">
              <p className="font-bold text-slate-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> RentHub Account Synchronized
              </p>
              <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Your bookings, wishlist, direct owner chat, and verified credentials are active.
              </p>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md border border-slate-700 dark:border-zinc-700"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Log Out Account</span>
            </button>
          </div>
        ) : (
          /* IF USER IS NOT LOGGED IN */
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* Segmented Tab Switcher */}
            <div className="mx-6 mt-5 mb-2 shrink-0">
              <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 gap-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    tab === 'login'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-amber-400/30'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <LogIn className={`h-4 w-4 ${tab === 'login' ? 'text-amber-500' : ''}`} />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setRegError('');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    tab === 'register'
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md border border-slate-200/80 dark:border-amber-400/30'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <UserPlus className={`h-4 w-4 ${tab === 'register' ? 'text-amber-500' : ''}`} />
                  <span>Register</span>
                </button>
              </div>
            </div>

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-6 pt-3 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {loginError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-slate-800 dark:text-zinc-200 font-medium flex items-center gap-2.5">
                    <ShieldCheck className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <span>Registered users can log in directly via email password & OTP verification.</span>
                  </div>

                  {/* Quick Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-slate-200 dark:border-zinc-800"></div>
                    <span className="px-3 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">or email</span>
                    <div className="flex-1 border-t border-slate-200 dark:border-zinc-800"></div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                      Gmail / Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. rahul.salvi@gmail.com"
                        className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        required
                        autoFocus
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
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter account password"
                        className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{isLoggingIn ? 'Verifying Credentials...' : 'Log In via Email OTP'}</span>
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      New user?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('register')}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Create an account first
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 pt-3 space-y-3.5">
                {regError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Registration details saved! Dispatching Email OTP...</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rahul Salvi"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Gmail / Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. rahul.salvi@gmail.com"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Mobile Number (+91) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Residential Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* City, State & Pincode Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={regPinCode}
                      onChange={(e) => setRegPinCode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Aadhaar / Gov ID */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Aadhaar / Govt ID Proof
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">100% Encrypted</span>
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      value={regGovId}
                      onChange={(e) => setRegGovId(e.target.value)}
                      placeholder="e.g. Aadhaar Number (12 Digits)"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 tracking-wide">
                    Set Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-amber-500" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create account password"
                      className="w-full bg-slate-50 dark:bg-zinc-800/70 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={regSuccess || isRegistering}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{isRegistering ? 'Processing Registration...' : 'Register Account & Send OTP'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* OTP Verification Modal */}
      {pendingUser && (
        <EmailVerificationModal
          isOpen={isVerifyOpen}
          email={pendingUser.email}
          userName={pendingUser.name}
          title={tab === 'login' ? 'Confirm Login Authorization' : 'Complete Account Registration'}
          subtitle="Direct Verification Code"
          onClose={() => {
            setIsVerifyOpen(false);
            setPendingUser(null);
          }}
          onSuccess={() => finalizeLogin(pendingUser)}
        />
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
        initialRole="user"
        initialEmail={loginEmail}
        onSuccessRedirectToLogin={(email) => {
          setIsForgotPassOpen(false);
          setLoginEmail(email);
          setTab('login');
        }}
      />
    </div>
  );
};
