import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldAlert,
  Check
} from 'lucide-react';
import { sendEmailOtpClient, verifyEmailOtpClient } from '../lib/brevoClient';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  userName?: string;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  purpose?: string;
  actionButtonText?: string;
  isDanger?: boolean;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  userName,
  onClose,
  onSuccess,
  title = 'Email Authorization Code',
  subtitle = 'Security Verification Step',
  purpose = 'email_verification',
  actionButtonText,
  isDanger = false
}) => {
  const [otpInput, setOtpInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(false);

  // Send OTP to user's real email when modal opens
  const triggerSendOtp = async (isResend = false) => {
    if (!email) return;
    setIsSending(true);
    setError('');
    setStatusMessage('');

    try {
      const result = await sendEmailOtpClient({
        email: email.trim().toLowerCase(),
        userName,
        purpose
      });

      if (result.success) {
        setStatusMessage(result.message || `Verification code sent to ${email.trim()}. Please check your inbox or spam folder.`);
        setResendTimer(30);
      } else {
        setError(result.message || 'Unable to send verification code. Please check your email and click retry.');
      }
    } catch (err: any) {
      console.error('Send OTP unexpected error:', err);
      setError('Unable to reach verification service. Please verify your internet connection and click retry.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (isOpen && email) {
      setOtpInput('');
      setError('');
      setShowTroubleshoot(false);
      setIsVerified(false);
      triggerSendOtp(false);
    }
  }, [isOpen, email]);

  // Resend timer countdown
  useEffect(() => {
    if (!isOpen || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const handleResendOtp = () => {
    if (resendTimer > 0 || isSending) return;
    triggerSendOtp(true);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const cleanOtp = otpInput.trim().replace(/[^0-9]/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyEmailOtpClient(email.trim().toLowerCase(), cleanOtp);

      if (result.success && result.verified) {
        setIsVerified(true);
        setTimeout(() => {
          onSuccess();
        }, 700);
      } else {
        setError(result.message || 'Incorrect verification code. Please check the code in your Gmail/Email inbox.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError('Error verifying code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-zinc-100 my-auto flex flex-col transition-all">
        
        {/* Modal Header: Clean Amber & Slate Cohesive Design */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between shrink-0 ${
          isDanger 
            ? 'bg-rose-950/30 dark:bg-rose-950/50 border-rose-800/40 text-white' 
            : 'bg-slate-50/80 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-2xl shadow-md border shrink-0 ${
              isDanger 
                ? 'bg-rose-600 text-white border-rose-500' 
                : 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 border-amber-300'
            }`}>
              {isDanger ? <ShieldAlert className="h-5 w-5 stroke-[2.5]" /> : <Mail className="h-5 w-5 stroke-[2.5]" />}
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-bold tracking-tight ${
                isDanger ? 'text-rose-200' : 'text-slate-900 dark:text-white'
              }`}>{title}</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">{subtitle}</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {isVerified ? (
            <div className="text-center py-6 space-y-3">
              <div className={`h-16 w-16 rounded-2xl mx-auto flex items-center justify-center border-2 animate-in zoom-in duration-300 ${
                isDanger 
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-700' 
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-400'
              }`}>
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Email Verified Successfully!</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Redirecting in a moment...</p>
            </div>
          ) : (
            <>
              {/* Email Address Banner */}
              <div className="bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-4 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> OTP Code Sent To:
                  </span>
                  <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Live Security
                  </span>
                </div>
                <p className="text-sm font-bold font-mono break-all text-slate-900 dark:text-white mt-1">{email}</p>
                {userName && (
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    Hello <strong className="text-slate-900 dark:text-white">{userName}</strong>, enter the 6-digit authorization code sent to your email inbox.
                  </p>
                )}
                {statusMessage && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{statusMessage}</span>
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-start space-x-2.5 leading-relaxed">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 tracking-wide mb-2">
                    Enter 6-Digit Authorization Code *
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                        setError('');
                      }}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      placeholder="• • • • • •"
                      className={`w-full bg-slate-50 dark:bg-zinc-800/80 border rounded-2xl pl-11 pr-4 py-3.5 text-center text-2xl font-mono font-bold tracking-[10px] text-slate-900 dark:text-white focus:outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                        isDanger 
                          ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                          : 'border-slate-300 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                      }`}
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 text-center font-medium">
                    Please check your Gmail Inbox or Spam folder for the OTP code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otpInput.length < 6}
                  className={`w-full font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 active:scale-[0.99] ${
                    otpInput.length === 6
                      ? isDanger
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isVerifying ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      {isDanger ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      <span>{actionButtonText || (isDanger ? 'Confirm Permanent Deletion' : 'Verify Code & Log In')}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isSending}
                    className={`font-semibold flex items-center space-x-1.5 cursor-pointer ${
                      resendTimer > 0 || isSending
                        ? 'text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                        : 'text-amber-600 dark:text-amber-400 hover:underline'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resendTimer > 0 || isSending ? 'animate-spin' : 'text-amber-500'}`} />
                    <span>
                      {isSending
                        ? 'Sending...'
                        : resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : 'Resend OTP Code'}
                    </span>
                  </button>
                </div>

                {/* Email Delivery Help Toggle */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                    className="text-xs text-slate-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
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
                      <li>Apna email address double check karein: <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{email}</span></li>
                      <li>Agar OTP resend karna ho toh 30 sec timer khatam hone ke baad <strong>Resend OTP Code</strong> button par click karein.</li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/90 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium px-5 shrink-0">
          <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span>Secure 256-Bit Encryption</span>
          </div>
          <span className="text-slate-400 dark:text-zinc-500 font-mono">10-Min OTP TTL</span>
        </div>

      </div>
    </div>
  );
};
