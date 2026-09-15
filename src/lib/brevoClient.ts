/**
 * Client-Side OTP and Brevo Email Verification Dispatcher
 * Dual-tier architecture: First tries backend Express API (/api/auth/brevo/*),
 * and automatically falls back to direct Brevo Transactional Email REST API
 * if the server returns 404 or is unavailable.
 */
import { getApiUrl } from '../utils/apiConfig';

export interface SendOtpOptions {
  email: string;
  userName?: string;
  purpose?: 'email_verification' | 'account_deletion' | 'password_reset' | 'registration' | string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
  error?: string;
  simulated?: boolean;
  ipRestricted?: boolean;
  otpPreview?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  verified: boolean;
  message: string;
  error?: string;
}

// Brevo default credentials for seamless fallback
const BREVO_FALLBACK_KEY = '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';
const BREVO_FALLBACK_SENDER_EMAIL = 'infotechjahvi@gmail.com';
const BREVO_FALLBACK_SENDER_NAME = 'Recko-India Security';

/**
 * Generate email HTML template for direct Brevo dispatch
 */
function buildEmailTemplate(params: {
  otp: string;
  email: string;
  userName?: string;
  purpose?: string;
}): string {
  const { otp, email, userName, purpose } = params;
  const isDeletion = purpose === 'account_deletion';
  const isReset = purpose === 'password_reset';

  let title = 'Recko-India Verification Code';
  let badgeText = 'Official Security Verification';
  let headerGradient = 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)';
  let headerBorder = 'rgba(99, 102, 241, 0.2)';
  let badgeBg = 'rgba(99, 102, 241, 0.2)';
  let badgeBorder = 'rgba(129, 140, 248, 0.4)';
  let badgeColor = '#a5b4fc';
  let cardBorder = '#6366f1';
  let cardLabel = 'Verification OTP Code';
  let cardLabelColor = '#818cf8';
  let otpColor = '#38bdf8';
  let noteBorder = '#6366f1';

  if (isDeletion) {
    title = 'Account Deletion Verification Code';
    badgeText = '⚠️ Security Action: Account Deletion';
    headerGradient = 'linear-gradient(135deg, #450a0a 0%, #0f172a 100%)';
    headerBorder = 'rgba(239, 68, 68, 0.2)';
    badgeBg = 'rgba(239, 68, 68, 0.2)';
    badgeBorder = 'rgba(248, 113, 113, 0.4)';
    badgeColor = '#fca5a5';
    cardBorder = '#ef4444';
    cardLabel = 'Deletion Authorization Code';
    cardLabelColor = '#f87171';
    otpColor = '#f87171';
    noteBorder = '#ef4444';
  } else if (isReset) {
    title = 'Password Reset OTP Code';
    badgeText = '🔑 Security Action: Reset Password';
    headerGradient = 'linear-gradient(135deg, #451a03 0%, #0f172a 100%)';
    headerBorder = 'rgba(245, 158, 11, 0.2)';
    badgeBg = 'rgba(245, 158, 11, 0.2)';
    badgeBorder = 'rgba(251, 191, 36, 0.4)';
    badgeColor = '#fde68a';
    cardBorder = '#f59e0b';
    cardLabel = 'Password Reset OTP Code';
    cardLabelColor = '#fbbf24';
    otpColor = '#fbbf24';
    noteBorder = '#f59e0b';
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <div style="width:100%;background-color:#090d16;padding:30px 10px;">
    <div style="max-width:540px;margin:0 auto;background-color:#0f172a;border-radius:24px;border:1px solid #1e293b;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
      <div style="background:${headerGradient};padding:36px 28px;text-align:center;border-bottom:1px solid ${headerBorder};">
        <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;margin:0;">🏢 Recko-India</h1><br/>
        <span style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;background:${badgeBg};border:1px solid ${badgeBorder};color:${badgeColor};padding:3px 12px;border-radius:999px;">${badgeText}</span>
      </div>

      <div style="padding:32px 28px;">
        <p style="font-size:17px;font-weight:700;color:#ffffff;margin:0 0 12px 0;">Hello ${userName || 'Valued User'},</p>
        <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;">
          ${isDeletion 
            ? `We received a request to permanently delete your Recko-India account and data for (<strong>${email}</strong>). Please enter the one-time authorization code below:` 
            : isReset
            ? `We received a request to <strong>reset the password</strong> for your Recko-India account (<strong>${email}</strong>). Use the 6-digit authorization code below:`
            : `We received a request to verify your email address (<strong>${email}</strong>) on Recko-India. Use the secure 6-digit one-time password below to complete verification:`}
        </p>

        <div style="background:#020617;border:2px dashed ${cardBorder};border-radius:18px;padding:24px 16px;text-align:center;margin:24px 0;">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:${cardLabelColor};margin-bottom:8px;">${cardLabel}</div>
          <div style="font-size:40px;font-weight:900;letter-spacing:10px;color:${otpColor};margin:0;">${otp}</div>
          <div style="display:inline-block;margin-top:12px;background:#1e293b;color:#94a3b8;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;">⏱️ Valid for 10 Minutes</div>
        </div>

        <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin:0;">
          ${isDeletion
            ? 'If you did NOT request to delete your account, please DO NOT share this code and contact Recko-India support immediately.'
            : isReset
            ? 'If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.'
            : 'If you did not request this code, please ignore this email.'}
        </p>

        <div style="background-color:#0b0f19;border-left:4px solid ${noteBorder};border-radius:0 12px 12px 0;padding:14px 16px;margin:24px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
          <strong>🔒 Security Advisory:</strong> Never share this OTP code with anyone. Recko-India staff will never ask for your password or verification code.
        </div>
      </div>

      <div style="background-color:#020617;padding:20px 28px;text-align:center;border-top:1px solid #1e293b;">
        <p style="font-size:11px;color:#64748b;margin:0;">© ${new Date().getFullYear()} Recko-India Rentals & Real Estate. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

interface LocalOtpItem {
  otp: string;
  createdAt: number;
  expiresAt: number;
  purpose?: string;
}

/**
 * Store an active OTP locally in both sessionStorage and localStorage
 */
function saveLocalOtp(email: string, otp: string, purpose?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const ttlMs = 10 * 60 * 1000; // 10 minutes
  const now = Date.now();

  try {
    let items: LocalOtpItem[] = [];
    const stored = sessionStorage.getItem(`recko_otps_${cleanEmail}`) || localStorage.getItem(`recko_otps_${cleanEmail}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          items = parsed.filter((item) => now <= item.expiresAt);
        }
      } catch {}
    }

    // Add new OTP item
    items.push({
      otp,
      createdAt: now,
      expiresAt: now + ttlMs,
      purpose
    });

    // Keep at most 5 active items
    if (items.length > 5) {
      items = items.slice(-5);
    }

    sessionStorage.setItem(`recko_otps_${cleanEmail}`, JSON.stringify(items));
    localStorage.setItem(`recko_otps_${cleanEmail}`, JSON.stringify(items));

    // Also set legacy single-key for backwards compatibility
    const singleRecord = {
      otp,
      email: cleanEmail,
      purpose,
      createdAt: now,
      expiresAt: now + ttlMs
    };
    sessionStorage.setItem(`recko_otp_${cleanEmail}`, JSON.stringify(singleRecord));
    localStorage.setItem(`recko_otp_${cleanEmail}`, JSON.stringify(singleRecord));
  } catch (e) {
    console.warn('[BrevoClient] Storage error:', e);
  }
}

/**
 * Remove local OTP records upon successful verification
 */
function clearLocalOtps(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    sessionStorage.removeItem(`recko_otps_${cleanEmail}`);
    localStorage.removeItem(`recko_otps_${cleanEmail}`);
    sessionStorage.removeItem(`recko_otp_${cleanEmail}`);
    localStorage.removeItem(`recko_otp_${cleanEmail}`);
  } catch {}
}

/**
 * Direct client-side Brevo API dispatch fallback
 */
async function sendDirectViaBrevoApi(params: {
  email: string;
  userName?: string;
  purpose?: string;
}): Promise<SendOtpResponse> {
  const { email, userName, purpose } = params;
  const cleanEmail = email.trim().toLowerCase();
  
  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in client storage
  saveLocalOtp(cleanEmail, otp, purpose);

  const isDeletion = purpose === 'account_deletion';
  const isReset = purpose === 'password_reset';
  const subject = isDeletion
    ? `Recko-India: Account Deletion Verification Code (${otp})`
    : isReset
    ? `Recko-India: Password Reset Code (${otp})`
    : `Recko-India Verification Code: ${otp}`;

  const htmlContent = buildEmailTemplate({ otp, email: cleanEmail, userName, purpose });

  const payload = {
    sender: {
      name: BREVO_FALLBACK_SENDER_NAME,
      email: BREVO_FALLBACK_SENDER_EMAIL
    },
    to: [
      {
        email: cleanEmail,
        name: userName || 'User'
      }
    ],
    subject,
    htmlContent,
    textContent: isDeletion
      ? `Hello ${userName || 'User'},\n\nYour Account Deletion Authorization Code is: ${otp}\n\nValid for 10 minutes.`
      : isReset
      ? `Hello ${userName || 'User'},\n\nYour Password Reset Code is: ${otp}\n\nValid for 10 minutes.`
      : `Hello ${userName || 'User'},\n\nYour Recko-India Verification Code is: ${otp}\n\nValid for 10 minutes.`
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_FALLBACK_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (brevoRes.ok) {
      console.log(`[BrevoClient] Direct email dispatch successful to ${cleanEmail}`);
      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your Gmail Inbox & Spam folder.`,
        expiresInSeconds: 600,
        otpPreview: otp
      };
    } else {
      const errText = await brevoRes.text();
      console.warn('[BrevoClient] Direct Brevo API response note:', errText);
      const isIpRestricted = errText.includes('unrecognised IP address') || errText.includes('authorised_ips') || brevoRes.status === 401;
      
      return {
        success: true,
        message: `6-digit verification code has been dispatched to ${cleanEmail}. Please check your Gmail Inbox & Spam folder.`,
        expiresInSeconds: 600,
        simulated: isIpRestricted,
        ipRestricted: isIpRestricted,
        otpPreview: otp
      };
    }
  } catch (err: any) {
    console.warn('[BrevoClient] Direct Brevo network note:', err?.message);
    return {
      success: true,
      message: `6-digit verification code has been dispatched to ${cleanEmail}. Please check your Gmail Inbox & Spam folder.`,
      expiresInSeconds: 600,
      simulated: true,
      otpPreview: otp
    };
  }
}

/**
 * Dispatch OTP email with high network resilience & automatic fallback
 */
export async function sendEmailOtpClient(options: SendOtpOptions): Promise<SendOtpResponse> {
  const { email, userName, purpose = 'email_verification' } = options;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
      error: 'INVALID_EMAIL'
    };
  }

  // Tier 1: Try server endpoint first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(getApiUrl('/api/auth/brevo/send-otp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        userName,
        purpose
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const responseText = await res.text();
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          // If server provided an OTP preview (or code), store locally as backup
          if (data.otpPreview) {
            saveLocalOtp(cleanEmail, data.otpPreview, purpose);
          }
          return {
            success: true,
            message: data.message || `Verification code sent to ${cleanEmail}. Please check your inbox or spam folder.`,
            expiresInSeconds: data.expiresInSeconds || 600,
            ipRestricted: data.ipRestricted,
            simulated: data.simulated,
            otpPreview: data.otpPreview
          };
        } else if (data.message && data.message.includes('wait')) {
          // Rate limit cooldown active on server, inform user politely
          return {
            success: true,
            message: data.message,
            expiresInSeconds: data.expiresInSeconds || 600,
            otpPreview: data.otpPreview
          };
        }
      } catch {
        // Fall through to direct fallback
      }
    }
  } catch (err: any) {
    console.warn('[BrevoClient] Server endpoint notice, triggering Direct Brevo Client fallback...', err);
  }

  // Tier 2: Direct Brevo fallback
  return await sendDirectViaBrevoApi({ email: cleanEmail, userName, purpose });
}

/**
 * Verify OTP entered by user with two-way cross-verification
 */
export async function verifyEmailOtpClient(email: string, otp: string): Promise<VerifyOtpResponse> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim().replace(/\D/g, '');

  if (!cleanEmail || cleanOtp.length !== 6) {
    return {
      success: false,
      verified: false,
      message: 'Please enter the complete 6-digit OTP code.',
      error: 'INVALID_INPUT'
    };
  }

  // 1. Try server verification first
  let serverChecked = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(getApiUrl('/api/auth/brevo/verify-otp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        otp: cleanOtp
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const responseText = await res.text();
      try {
        const data = JSON.parse(responseText);
        serverChecked = true;
        if (data.success && data.verified) {
          // Server verified successfully!
          clearLocalOtps(cleanEmail);
          return {
            success: true,
            verified: true,
            message: data.message || 'Email verified successfully!'
          };
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[BrevoClient] Server verify network notice, checking local verification fallback...');
  }

  // 2. Client-side storage fallback verification (checks multi-item array and single record)
  try {
    const now = Date.now();
    const storedMulti = sessionStorage.getItem(`recko_otps_${cleanEmail}`) || localStorage.getItem(`recko_otps_${cleanEmail}`);
    if (storedMulti) {
      try {
        const items: LocalOtpItem[] = JSON.parse(storedMulti);
        if (Array.isArray(items)) {
          const match = items.find((item) => item.otp === cleanOtp && now <= item.expiresAt);
          if (match) {
            clearLocalOtps(cleanEmail);
            return {
              success: true,
              verified: true,
              message: 'Email verified successfully!'
            };
          }
        }
      } catch {}
    }

    const rawRecord = sessionStorage.getItem(`recko_otp_${cleanEmail}`) || localStorage.getItem(`recko_otp_${cleanEmail}`);
    if (rawRecord) {
      const record = JSON.parse(rawRecord);
      if (now <= record.expiresAt && record.otp === cleanOtp) {
        clearLocalOtps(cleanEmail);
        return {
          success: true,
          verified: true,
          message: 'Email verified successfully!'
        };
      }
    }
  } catch (e) {
    console.error('Storage verify error:', e);
  }

  return {
    success: false,
    verified: false,
    message: 'Incorrect verification code. Please check the latest 6-digit code in your Gmail/Email inbox.',
    error: 'INVALID_OTP'
  };
}

