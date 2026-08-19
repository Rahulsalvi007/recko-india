import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Ensure both .env and .env.example are loaded
dotenv.config();
try {
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const exampleConfig = dotenv.parse(fs.readFileSync(envExamplePath));
    for (const k in exampleConfig) {
      if (!process.env[k] || process.env[k] === '') {
        process.env[k] = exampleConfig[k];
      }
    }
  }
} catch (e) {
  // Ignore
}

/**
 * Transactional Email OTP Service
 * Handles secure 6-digit OTP generation, Brevo REST API / Nodemailer dispatch, and verification lifecycle.
 */

interface StoredOtpItem {
  otp: string;
  createdAt: number;
  expiresAt: number;
  purpose?: string;
}

interface StoredOtpRecord {
  otps: StoredOtpItem[];
  email: string;
  userName?: string;
  lastRequestedAt: number;
  attempts: number;
}

// In-memory OTP storage cache with 10-minute TTL
const otpStore = new Map<string, StoredOtpRecord>();

// Clean up expired OTPs every 3 minutes
setInterval(() => {
  const now = Date.now();
  for (const [emailKey, record] of otpStore.entries()) {
    record.otps = record.otps.filter((item) => now <= item.expiresAt);
    if (record.otps.length === 0) {
      otpStore.delete(emailKey);
    }
  }
}, 3 * 60 * 1000);

export interface SendOtpResult {
  success: boolean;
  message: string;
  email: string;
  expiresInSeconds: number;
  error?: string;
  simulated?: boolean;
  otpPreview?: string;
  ipRestricted?: boolean;
}

export interface VerifyOtpResult {
  success: boolean;
  verified: boolean;
  message: string;
  error?: string;
}

/**
 * Helper to get active Brevo credentials
 */
function getBrevoConfig() {
  let apiKey = (process.env.BREVO_API_KEY || '').trim();
  let senderEmail = (process.env.BREVO_SENDER_EMAIL || '').trim();
  let senderName = (process.env.BREVO_SENDER_NAME || '').trim() || 'Recko-India Security';

  // If not found in process.env, check .env.example
  if (!apiKey) {
    try {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(envExamplePath)) {
        const content = fs.readFileSync(envExamplePath, 'utf8');
        const keyMatch = content.match(/BREVO_API_KEY=["']?([^"'\r\n]+)["']?/);
        const emailMatch = content.match(/BREVO_SENDER_EMAIL=["']?([^"'\r\n]+)["']?/);
        const nameMatch = content.match(/BREVO_SENDER_NAME=["']?([^"'\r\n]+)["']?/);
        if (keyMatch && keyMatch[1]) apiKey = keyMatch[1].trim();
        if (emailMatch && emailMatch[1]) senderEmail = emailMatch[1].trim();
        if (nameMatch && nameMatch[1]) senderName = nameMatch[1].trim();
      }
    } catch (e) {
      // Ignore
    }
  }

  return {
    apiKey,
    senderEmail: senderEmail || 'infotechjahvi@gmail.com',
    senderName: senderName || 'Recko-India Security'
  };
}

/**
 * Check Configuration Status
 */
export function getBrevoStatus() {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();
  const isConfigured = !!(apiKey && apiKey.length > 10);

  return {
    isConfigured,
    senderEmail,
    senderName,
    maskedApiKey: isConfigured ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : 'None'
  };
}

/**
 * Generate HTML template for Transactional Email
 */
function generateEmailHtml(params: {
  otp: string;
  email: string;
  userName?: string;
  purpose?: string;
}): string {
  const { otp, email, userName, purpose } = params;
  const currentYear = new Date().getFullYear();
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
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #f1f5f9;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #090d16;
      padding: 30px 10px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #0f172a;
      border-radius: 24px;
      border: 1px solid #1e293b;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: ${headerGradient};
      padding: 36px 28px;
      text-align: center;
      border-bottom: 1px solid ${headerBorder};
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin: 0;
      display: inline-block;
    }
    .brand-badge {
      display: inline-block;
      margin-top: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: ${badgeBg};
      border: 1px solid ${badgeBorder};
      color: ${badgeColor};
      padding: 3px 12px;
      border-radius: 999px;
    }
    .body-content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }
    .desc-text {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 24px 0;
    }
    .otp-card {
      background: #020617;
      border: 2px dashed ${cardBorder};
      border-radius: 18px;
      padding: 24px 16px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-header-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: ${cardLabelColor};
      margin-bottom: 8px;
    }
    .otp-number {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 10px;
      color: ${otpColor};
      margin: 0;
      text-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
    }
    .expiry-tag {
      display: inline-block;
      margin-top: 12px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 999px;
    }
    .security-note {
      background-color: #0b0f19;
      border-left: 4px solid ${noteBorder};
      border-radius: 0 12px 12px 0;
      padding: 14px 16px;
      margin: 24px 0 0 0;
      font-size: 12px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    .security-note strong {
      color: #f87171;
    }
    .footer {
      background-color: #090d16;
      border-top: 1px solid #1e293b;
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">🏢 Recko-India</h1><br/>
        <span class="brand-badge">${badgeText}</span>
      </div>

      <div class="body-content">
        <p class="greeting">Namaste ${userName || 'User'},</p>
        <p class="desc-text">
          ${isDeletion 
            ? `We received a request to permanently delete your Recko-India account and data for (<strong>${email}</strong>). Please enter the one-time authorization code below to confirm this action:` 
            : isReset
            ? `We received a request to <strong>reset the password</strong> for your Recko-India account (<strong>${email}</strong>). Use the 6-digit authorization code below to set a new password:`
            : `We received a request to verify your email address (<strong>${email}</strong>) on Recko-India. Use the secure 6-digit one-time password below to complete your verification:`}
        </p>

        <div class="otp-card">
          <div class="otp-header-label">${cardLabel}</div>
          <div class="otp-number">${otp}</div>
          <div class="expiry-tag">⏱️ Valid for 10 Minutes</div>
        </div>

        <p class="desc-text" style="font-size: 12px; margin-bottom: 0;">
          ${isDeletion
            ? 'If you did NOT request to delete your account, please DO NOT share this code and immediately contact Recko-India support.'
            : isReset
            ? 'If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.'
            : 'If you did not request this code, please ignore this email or reach out to Recko-India Security.'}
        </p>

        <div class="security-note">
          <strong>🔒 Security Advisory:</strong> Never share this OTP code with anyone. Recko-India staff will never ask for your password or verification code.
        </div>
      </div>

      <div class="footer">
        <p>&copy; ${currentYear} Recko-India Marketplace. All rights reserved.</p>
        <p>100% Direct • Verified Listings</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send Transactional Email OTP using Nodemailer or Brevo REST API
 */
export async function sendBrevoEmailOtp(params: {
  email: string;
  userName?: string;
  purpose?: string;
}): Promise<SendOtpResult> {
  const { email, userName, purpose = 'registration' } = params;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Invalid email address provided.',
      email: cleanEmail,
      expiresInSeconds: 0,
      error: 'Invalid email format'
    };
  }

  // Check existing active record
  const existing = otpStore.get(cleanEmail);
  const now = Date.now();

  // Rate Limiting Check: Prevent rapid button clicks (min 5 seconds cooldown)
  if (existing && now - existing.lastRequestedAt < 5 * 1000) {
    const waitSeconds = Math.ceil((5000 - (now - existing.lastRequestedAt)) / 1000);
    return {
      success: true,
      message: `Verification code was recently sent to ${cleanEmail}. Please check your Gmail Inbox & Spam folder.`,
      email: cleanEmail,
      expiresInSeconds: 600
    };
  }

  // Generate fresh 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const ttlMs = 1 * 60 * 1000; // 10 minutes expiry

  // Clean existing expired items and append new OTP
  const unexpiredOtps: StoredOtpItem[] = (existing?.otps || []).filter((item) => now <= item.expiresAt);
  unexpiredOtps.push({
    otp,
    createdAt: now,
    expiresAt: now + ttlMs,
    purpose
  });

  // Keep at most 5 recent active OTPs
  if (unexpiredOtps.length > 5) {
    unexpiredOtps.shift();
  }

  // Store in memory
  otpStore.set(cleanEmail, {
    otps: unexpiredOtps,
    email: cleanEmail,
    userName,
    lastRequestedAt: now,
    attempts: 0
  });

  console.log(`\n======================================================`);
  console.log(`🔑 [SERVER OTP GENERATED] Email: ${cleanEmail} | OTP Code: ${otp}`);
  console.log(`======================================================\n`);

  const { apiKey: brevoApiKey, senderEmail, senderName } = getBrevoConfig();
  const emailHtml = generateEmailHtml({
    otp,
    email: cleanEmail,
    userName,
    purpose
  });

  const isDeletion = purpose === 'account_deletion';
  const isReset = purpose === 'password_reset';
  const subject = isDeletion
    ? `Recko-India: Account Deletion Verification Code (${otp})`
    : isReset
    ? `Recko-India: Password Reset Code (${otp})`
    : `Recko-India Verification Code: ${otp}`;

  // Method 1: Nodemailer Transporter (If Gmail / Custom SMTP credentials exist in .env)
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim();

  if (gmailUser && gmailPass) {
    try {
      console.log(`[Nodemailer Dispatch] Attempting direct Gmail SMTP email dispatch to ${cleanEmail}...`);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const info = await transporter.sendMail({
        from: `"${senderName}" <${gmailUser}>`,
        to: cleanEmail,
        subject,
        html: emailHtml,
        text: isDeletion
          ? `Hello ${userName || 'User'},\n\nYour Account Deletion Authorization Code is: ${otp}\n\nValid for 1 minutes.`
          : isReset
          ? `Hello ${userName || 'User'},\n\nYour Password Reset Code is: ${otp}\n\nValid for 10 minutes.`
          : `Hello ${userName || 'User'},\n\nYour Recko-India Verification Code is: ${otp}\n\nValid for 10 minutes.`
      });

      console.log(`[Nodemailer Success] OTP email delivered to ${cleanEmail}. MessageId:`, info.messageId);
      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your Gmail Inbox and Spam folder.`,
        email: cleanEmail,
        expiresInSeconds: 600
      };
    } catch (nmErr: any) {
      console.warn('[Nodemailer Notice] Gmail SMTP dispatch error:', nmErr?.message || nmErr);
    }
  }

  // Method 2: Brevo REST API Dispatch
  if (brevoApiKey && brevoApiKey.length > 5) {
    try {
      const payload = {
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          {
            email: cleanEmail,
            name: userName || 'User'
          }
        ],
        subject,
        htmlContent: emailHtml,
        textContent: isDeletion
          ? `Hello ${userName || 'User'},\n\nWe received a request to permanently delete your Recko-India account (${cleanEmail}).\n\nYour Account Deletion Authorization Code is: ${otp}\n\nThis OTP is valid for 10 minutes.`
          : isReset
          ? `Hello ${userName || 'User'},\n\nWe received a request to reset your Recko-India password for (${cleanEmail}).\n\nYour Password Reset Code is: ${otp}\n\nThis OTP is valid for 10 minutes.`
          : `Hello ${userName || 'User'},\n\nYour Recko-India Verification Code is: ${otp}\n\nThis OTP is valid for 10 minutes.`
      };

      console.log(`[Brevo Dispatch] Sending OTP to ${cleanEmail} via sender: ${senderEmail}...`);

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log(`[Brevo Success] OTP email delivered to ${cleanEmail}. MessageId:`, responseData?.messageId);
        return {
          success: true,
          message: `Verification code has been sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
          email: cleanEmail,
          expiresInSeconds: 600
        };
      } else {
        console.warn(`[Brevo API Notice] HTTP ${response.status}:`, responseData);
        let errMsg = responseData?.message || 'Failed to dispatch email.';
        const isIpRestricted = typeof errMsg === 'string' && (errMsg.includes('unrecognised IP address') || errMsg.includes('authorised_ips') || response.status === 401);

        if (isIpRestricted) {
          console.warn(`\n⚠️ Brevo IP Restriction Blocked Email Dispatch!`);
          console.warn(`To enable Brevo email delivery to Gmail:`);
          console.warn(`1. Open https://app.brevo.com/security/authorised_ips in your browser.`);
          console.warn(`2. Remove IP restrictions or add your IP address.`);
          console.warn(`3. Alternatively, set GMAIL_APP_PASSWORD in your .env file.\n`);
        }
      }
    } catch (err: any) {
      console.warn('[Brevo Notice] Network request issue:', err?.message || err);
    }
  }

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}. Please check your Gmail Inbox & Spam folder.`,
    email: cleanEmail,
    expiresInSeconds: 600
  };
}

/**
 * Verify OTP entered by user with in-memory validation
 */
export function verifyBrevoEmailOtp(params: {
  email: string;
  otp: string;
}): VerifyOtpResult {
  const { email, otp } = params;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim().replace(/\D/g, '');

  if (!cleanEmail || cleanOtp.length !== 6) {
    return {
      success: false,
      verified: false,
      message: 'Please enter the complete 6-digit OTP code.',
      error: 'Invalid input'
    };
  }

  const record = otpStore.get(cleanEmail);
  if (!record || !record.otps || record.otps.length === 0) {
    return {
      success: false,
      verified: false,
      message: 'No active OTP found or code expired. Please click Resend OTP Code.',
      error: 'OTP expired or not found'
    };
  }

  const now = Date.now();
  const activeUnexpired = record.otps.filter((item) => now <= item.expiresAt);

  if (activeUnexpired.length === 0) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      verified: false,
      message: 'Authorization code has expired. Please click Resend OTP Code.',
      error: 'OTP expired'
    };
  }

  // Match OTP against active unexpired codes
  const matchingItem = activeUnexpired.find((item) => item.otp === cleanOtp);

  if (matchingItem) {
    // Clear record on successful verification
    otpStore.delete(cleanEmail);
    return {
      success: true,
      verified: true,
      message: 'Email authorization confirmed successfully!'
    };
  }

  // Increment attempts counter
  record.attempts = (record.attempts || 0) + 1;
  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      verified: false,
      message: 'Too many incorrect attempts. Please click Resend OTP Code to get a fresh code.',
      error: 'Max attempts exceeded'
    };
  }

  return {
    success: false,
    verified: false,
    message: 'Incorrect verification code. Please check the code in your Gmail inbox or spam folder.',
    error: 'Incorrect OTP'
  };
}
