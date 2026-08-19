import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Building2,
  User,
  Check
} from 'lucide-react';
import { UserProfile, LandlordUser } from '../types';
import { INITIAL_LANDLORDS } from '../data/mockData';
import { sendEmailOtpClient, verifyEmailOtpClient } from '../lib/brevoClient';
import { saveDocument } from '../lib/firebase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirectToLogin?: (email: string, role: 'user' | 'landlord') => void;
  initialRole?: 'user' | 'landlord';
  initialEmail?: string;
}

type ResetStep = 'enter_email' | 'verify_otp' | 'set_new_password' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessRedirectToLogin,
  initialRole = 'user',
  initialEmail = ''
}) => {
  const [role, setRole] = useState<'user' | 'landlord'>(initialRole);
  const [step, setStep] = useState<ResetStep>('enter_email');
  
  // Step 1: Email / Identifier
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [matchedAccountName, setMatchedAccountName] = useState('');
  
  // Step 2: OTP
  const [otpInput, setOtpInput] = useState('');
  const [activeOtp, setActiveOtp] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [showEmergencyCode, setShowEmergencyCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setEmailInput(initialEmail);
      setStep('enter_email');
      setOtpInput('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setStatusMessage('');
      setMatchedAccountName('');
      setResendTimer(30);
    }
  }, [isOpen, initialRole, initialEmail]);

  // Resend timer countdown
  useEffect(() => {
    if (!isOpen || step !== 'verify_otp' || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step, resendTimer]);

  if (!isOpen) return null;

  // Comprehensive Account Role Validation & Verification Engine
  const verifyAccountRole = (identifier: string, expectedRole: 'user' | 'landlord'): {
    valid: boolean;
    errorMsg?: string;
    account?: any;
    detectedRole?: 'user' | 'landlord' | 'admin';
  } => {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');

    // 1. Check if Email belongs to Super Admin or Junior Admin Staff
    const superAdminEmail = 'salvirahul7038@gmail.com';
    let juniorAdmins: any[] = [];
    try {
      const stored = localStorage.getItem('renthub_junior_admins_list');
      if (stored) juniorAdmins = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const isAdmin = clean === superAdminEmail || juniorAdmins.some((a) => (a.email && a.email.toLowerCase() === clean));
    if (isAdmin) {
      return {
        valid: false,
        detectedRole: 'admin',
        errorMsg: '🚫 Admin Account Protection: This email belongs to a Super Admin / Staff account. Admin password resets must be done inside Super Admin Control Center.'
      };
    }

    // 2. Load all registered Landlords / Owners
    let landlordsList: LandlordUser[] = [...INITIAL_LANDLORDS];
    try {
      const storedLandlords = localStorage.getItem('renthub_landlords_list');
      if (storedLandlords) {
        const parsed = JSON.parse(storedLandlords);
        landlordsList = [...parsed, ...landlordsList];
      }
      const singleLandlord = localStorage.getItem('renthub_landlord_user');
      if (singleLandlord) {
        landlordsList.unshift(JSON.parse(singleLandlord));
      }
    } catch (e) {
      console.error(e);
    }

    const foundLandlord = landlordsList.find(
      (l) =>
        (l.id && l.id.toLowerCase() === clean) ||
        (l.email && l.email.toLowerCase() === clean) ||
        (l.phone && cleanDigits.length >= 8 && l.phone.replace(/[^0-9]/g, '').includes(cleanDigits))
    );

    // 3. Load all registered Tenant Users
    let usersList: UserProfile[] = [];
    try {
      const storedUsers = localStorage.getItem('renthub_users_list');
      if (storedUsers) {
        usersList = JSON.parse(storedUsers);
      }
      const singleUser = localStorage.getItem('renthub_user');
      if (singleUser) {
        usersList.unshift(JSON.parse(singleUser));
      }
    } catch (e) {
      console.error(e);
    }

    const foundUser = usersList.find(
      (u) =>
        (u.email && u.email.toLowerCase() === clean) ||
        (u.phone && cleanDigits.length >= 8 && u.phone.replace(/[^0-9]/g, '').includes(cleanDigits))
    );

    // 4. Role Match Enforcement
    if (expectedRole === 'user') {
      if (foundLandlord && !foundUser) {
        return {
          valid: false,
          detectedRole: 'landlord',
          errorMsg: `⚠️ Owner / Landlord Account Detected: "${identifier}" is registered as an Owner / Host account (${foundLandlord.name}). Please click "Owner / Host Login" to reset your password.`
        };
      }
      if (foundUser) {
        return { valid: true, account: foundUser, detectedRole: 'user' };
      }
    } else {
      if (foundUser && !foundLandlord) {
        return {
          valid: false,
          detectedRole: 'user',
          errorMsg: `⚠️ Tenant User Account Detected: "${identifier}" is registered as a Tenant User account (${foundUser.name}). Please click "User Login" to reset your password.`
        };
      }
      if (foundLandlord) {
        return { valid: true, account: foundLandlord, detectedRole: 'landlord' };
      }
    }

    // 5. Account fallback for standard emails
    if (clean.includes('@')) {
      return { valid: true, account: { name: clean.split('@')[0], email: clean } };
    }

    return {
      valid: false,
      errorMsg: `❌ Account Not Found: No registered ${expectedRole === 'user' ? 'Tenant User' : 'Owner / Landlord'} account found for "${identifier}". Please check your email or Register.`
    };
  };

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    const targetEmailOrId = emailInput.trim();
    if (!targetEmailOrId) {
      setError('Please enter your registered Email address.');
      return;
    }

    // Enforce Strict Account Role Check
    const roleCheck = verifyAccountRole(targetEmailOrId, role);
    if (!roleCheck.valid) {
      setError(roleCheck.errorMsg || 'Role verification failed.');
      return;
    }

    const found = roleCheck.account;
    let destinationEmail = targetEmailOrId;
    let recipientName = 'User';

    if (found && found.email) {
      destinationEmail = found.email;
      recipientName = found.name || 'User';
      setMatchedAccountName(found.name || 'User');
    } else if (targetEmailOrId.includes('@')) {
      destinationEmail = targetEmailOrId;
      setMatchedAccountName(targetEmailOrId.split('@')[0]);
    } else {
      setError(`No ${role === 'user' ? 'Tenant / User' : 'Owner / Landlord'} account found with this ID.`);
      return;
    }

    if (!destinationEmail || !destinationEmail.includes('@')) {
      setError('Please enter a valid Gmail / Email address to receive the password reset code.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendEmailOtpClient({
        email: destinationEmail.trim().toLowerCase(),
        userName: recipientName,
        purpose: 'password_reset'
      });

      if (res.success) {
        setStep('verify_otp');
        setStatusMessage(res.message || `6-digit Password Reset OTP has been sent to ${destinationEmail.trim()}. Please check your Gmail Inbox & Spam folder.`);
        if (res.otpPreview) {
          setActiveOtp(res.otpPreview);
        }
        setResendTimer(30);
      } else {
        setError(res.message || 'Unable to dispatch reset code. Please check your internet or retry.');
      }
    } catch (err: any) {
      console.error('Request OTP error:', err);
      setError('Network connection error. Please verify your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setError('');
    setIsLoading(true);

    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      const res = await sendEmailOtpClient({
        email: cleanEmail,
        userName: matchedAccountName || 'User',
        purpose: 'password_reset'
      });

      if (res.success) {
        setStatusMessage(res.message || `Fresh OTP code sent to ${cleanEmail}.`);
        if (res.otpPreview) {
          setActiveOtp(res.otpPreview);
        }
        setResendTimer(30);
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setError('Network error resending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otpInput.trim().replace(/[^0-9]/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit authorization code received on your email.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyEmailOtpClient(emailInput.trim().toLowerCase(), cleanOtp);

      if (res.success && res.verified) {
        setStep('set_new_password');
        setError('');
        setStatusMessage('OTP verified successfully! Now please create your new password.');
      } else {
        setError(res.message || 'Incorrect OTP code. Please check your email inbox.');
      }
    } catch (err: any) {
      setError('Network error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Save New Password
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (cleanNewPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setError('New passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();

      if (role === 'user') {
        // Update user password in local storage
        const saved = localStorage.getItem('renthub_users_list');
        let users: UserProfile[] = saved ? JSON.parse(saved) : [];
        const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

        if (idx >= 0) {
          users[idx].password = cleanNewPass;
          localStorage.setItem('renthub_users_list', JSON.stringify(users));

          // Save to Firestore
          try {
            saveDocument('users', users[idx].id, {
              ...users[idx],
              password: cleanNewPass,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Firestore user pass update note:', e);
          }
        } else {
          // If not found in list, create/update record
          const newUser: UserProfile = {
            id: `usr-${Date.now()}`,
            name: matchedAccountName || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: '+91 98765 43210',
            password: cleanNewPass,
            emailVerified: true,
            createdAt: new Date().toISOString().split('T')[0]
          };
          users.push(newUser);
          localStorage.setItem('renthub_users_list', JSON.stringify(users));
          saveDocument('users', newUser.id, newUser);
        }
      } else {
        // Landlord password update
        const saved = localStorage.getItem('renthub_landlords_list');
        let landlords: LandlordUser[] = saved ? JSON.parse(saved) : [];
        const idx = landlords.findIndex(
          (l) => l.email?.toLowerCase() === cleanEmail || l.id.toLowerCase() === cleanEmail
        );

        if (idx >= 0) {
          landlords[idx].password = cleanNewPass;
          localStorage.setItem('renthub_landlords_list', JSON.stringify(landlords));
          localStorage.setItem('renthub_landlords', JSON.stringify(landlords));

          // Save to Firestore
          try {
            saveDocument('landlords', landlords[idx].id, {
              ...landlords[idx],
              password: cleanNewPass,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Firestore landlord pass update note:', e);
          }
        }
      }

      setStep('success');
    } catch (err: any) {
      console.error('Save password error:', err);
      setError('Unable to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Strength Calculation
  const getPasswordStrength = () => {
    if (!newPassword) return { label: '', percent: 0, color: 'bg-zinc-200 dark:bg-zinc-700' };
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 8) score += 25;
    if (/[0-9]/.test(newPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(newPassword) || /[A-Z]/.test(newPassword)) score += 25;

    if (score <= 25) return { label: 'Weak', percent: 25, color: 'bg-rose-500 text-rose-600' };
    if (score <= 50) return { label: 'Fair', percent: 50, color: 'bg-amber-500 text-amber-600' };
    if (score <= 75) return { label: 'Good', percent: 75, color: 'bg-yellow-400 text-yellow-600' };
    return { label: 'Strong', percent: 100, color: 'bg-amber-400 text-amber-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-zinc-100 my-auto flex flex-col">
        
        {/* Header: Luxury Black and Gold */}
        <div className="p-5 border-b border-amber-400/20 bg-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 text-black rounded-2xl shadow-lg border border-amber-300 font-black">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Reset Account Password</span>
              </h3>
              <p className="text-[11px] text-amber-400/90 font-medium">
                {role === 'user' ? 'Tenant / User Account' : 'Owner / Landlord Account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Account Role Selector (Only if on step 1) */}
        {step === 'enter_email' && (
          <div className="bg-zinc-100 dark:bg-zinc-900 p-2 grid grid-cols-2 gap-2 border-b border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setRole('user');
                setError('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                role === 'user'
                  ? 'bg-black text-amber-400 shadow-md border border-amber-400/40'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Tenant / User</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('landlord');
                setError('');
              }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                role === 'landlord'
                  ? 'bg-black text-amber-400 shadow-md border border-amber-400/40'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Owner / Host</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-bold leading-relaxed flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* STEP 1: ENTER REGISTERED EMAIL */}
          {step === 'enter_email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-amber-400/20 rounded-2xl text-xs text-zinc-900 dark:text-zinc-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  <span>Secure Email Password Reset</span>
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Enter your registered Gmail address. We will dispatch a 6-digit authorization code directly to your email inbox to verify account ownership.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-300 mb-1.5 tracking-wider">
                  Registered Gmail / Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. rahul.salvi@gmail.com"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailInput.trim()}
                className={`w-full font-black py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 ${
                  emailInput.trim() && !isLoading
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-amber-500/25'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Send Password Reset OTP Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'verify_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="border border-amber-400/20 bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">OTP Sent To:</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Code Sent
                  </span>
                </div>
                <p className="text-sm font-black font-mono text-amber-600 dark:text-amber-400 break-all">{emailInput}</p>
                {matchedAccountName && (
                  <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                    Account Name: <strong className="text-slate-900 dark:text-white">{matchedAccountName}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-300 mb-1.5 tracking-wider">
                  Enter 6-Digit Password Reset Code *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-center text-xl font-mono font-black tracking-[8px] text-slate-900 dark:text-white placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 text-center">
                  Check your Gmail Inbox or Spam folder for the OTP code.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpInput.trim().length !== 6}
                className={`w-full font-black py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 ${
                  otpInput.trim().length === 6 && !isLoading
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-amber-500/25'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify Code & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-zinc-400">Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    className={`font-bold flex items-center space-x-1 cursor-pointer ${
                      resendTimer > 0 || isLoading
                        ? 'text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                        : 'text-amber-600 dark:text-amber-400 hover:underline'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resendTimer > 0 || isLoading ? 'animate-spin' : 'text-amber-500'}`} />
                    <span>
                      {isLoading
                        ? 'Sending...'
                        : resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : 'Resend OTP Code'}
                    </span>
                  </button>
                </div>

                {/* Email Delivery Help & Emergency Access Toggle */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                    className="text-[11px] text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {showTroubleshoot ? 'Hide Email Help ▲' : 'Email OTP nahi mila? Click for Help ▼'}
                  </button>
                </div>

                {showTroubleshoot && (
                  <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/70 rounded-2xl p-4 space-y-2 text-xs text-left animate-in fade-in duration-200">
                    <p className="font-bold text-slate-900 dark:text-zinc-200 text-xs">
                      🔍 OTP Email check karne ke tips:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                      <li>Gmail me <strong>Spam / Junk</strong> aur <strong>Promotions</strong> folder zarur check karein.</li>
                      <li>Apna email address double check karein: <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{emailInput}</span></li>
                      <li>30 seconds ka timer poora hone par <strong>Resend OTP Code</strong> button par click karein.</li>
                    </ul>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 'set_new_password' && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-[11px] text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Identity verified! Enter your new password below.</span>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-300 mb-1.5 tracking-wider">
                  New Password * (Min 6 Characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-500 dark:text-zinc-400">Password Strength:</span>
                      <span className={strength.color.split(' ')[1]}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color.split(' ')[0]}`}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-300 mb-1.5 tracking-wider">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                className={`w-full font-black py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 ${
                  newPassword.length >= 6 && newPassword === confirmPassword && !isLoading
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-amber-500/25'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Save & Update New Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 bg-amber-400/10 border-2 border-amber-400 text-amber-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-amber-400" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Password Updated Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Your new password is now active for <strong className="text-slate-900 dark:text-white">{emailInput}</strong>. You can now log in to your account.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccessRedirectToLogin) {
                      onSuccessRedirectToLogin(emailInput, role);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-4 w-4 text-black" />
                  <span>Log In With New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-black border-t border-amber-400/20 flex items-center justify-between text-[11px] text-zinc-400 font-medium px-5">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Secure 256-Bit SSL</span>
          </div>
          <span className="text-zinc-500">Instant Email OTP Reset</span>
        </div>

      </div>
    </div>
  );
};
