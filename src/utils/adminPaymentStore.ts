import { saveDocument } from '../lib/firebase';

export interface AdminPaymentConfig {
  qrUrl: string;
  upiId: string;
  merchantName: string;
  updatedAt?: string;
}

export const DEFAULT_ADMIN_PAYMENT_CONFIG: AdminPaymentConfig = {
  qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=9876543210@paytm&pn=Recko%20India%20Admin&am=128.62&cu=INR',
  upiId: '9876543210@paytm',
  merchantName: 'Recko India Admin Escrow'
};

export function getAdminPaymentConfig(): AdminPaymentConfig {
  const savedQr = localStorage.getItem('recko_admin_payment_qr');
  const savedUpi = localStorage.getItem('recko_admin_upi_id');
  const savedName = localStorage.getItem('recko_admin_merchant_name');

  return {
    qrUrl: savedQr && savedQr.trim() ? savedQr.trim() : DEFAULT_ADMIN_PAYMENT_CONFIG.qrUrl,
    upiId: savedUpi && savedUpi.trim() ? savedUpi.trim() : DEFAULT_ADMIN_PAYMENT_CONFIG.upiId,
    merchantName: savedName && savedName.trim() ? savedName.trim() : DEFAULT_ADMIN_PAYMENT_CONFIG.merchantName
  };
}

export function saveAdminPaymentConfig(config: Partial<AdminPaymentConfig>): AdminPaymentConfig {
  const current = getAdminPaymentConfig();
  const updated: AdminPaymentConfig = {
    qrUrl: config.qrUrl !== undefined && config.qrUrl !== null ? config.qrUrl.trim() : current.qrUrl,
    upiId: config.upiId !== undefined && config.upiId !== null ? config.upiId.trim() : current.upiId,
    merchantName: config.merchantName !== undefined && config.merchantName !== null ? config.merchantName.trim() : current.merchantName,
    updatedAt: new Date().toISOString()
  };

  if (updated.qrUrl) {
    localStorage.setItem('recko_admin_payment_qr', updated.qrUrl);
  } else {
    localStorage.removeItem('recko_admin_payment_qr');
    updated.qrUrl = DEFAULT_ADMIN_PAYMENT_CONFIG.qrUrl;
  }

  if (updated.upiId) {
    localStorage.setItem('recko_admin_upi_id', updated.upiId);
  } else {
    localStorage.removeItem('recko_admin_upi_id');
    updated.upiId = DEFAULT_ADMIN_PAYMENT_CONFIG.upiId;
  }

  if (updated.merchantName) {
    localStorage.setItem('recko_admin_merchant_name', updated.merchantName);
  }

  try {
    saveDocument('settings', 'admin_payment_qr', updated);
  } catch (err) {
    console.warn('Firestore settings update note:', err);
  }

  return updated;
}

export function resetAdminPaymentConfig(): AdminPaymentConfig {
  localStorage.removeItem('recko_admin_payment_qr');
  localStorage.removeItem('recko_admin_upi_id');
  localStorage.removeItem('recko_admin_merchant_name');

  try {
    saveDocument('settings', 'admin_payment_qr', DEFAULT_ADMIN_PAYMENT_CONFIG);
  } catch (err) {
    console.warn('Firestore settings reset note:', err);
  }

  return DEFAULT_ADMIN_PAYMENT_CONFIG;
}
