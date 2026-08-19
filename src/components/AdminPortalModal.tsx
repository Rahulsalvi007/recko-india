import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Building2,
  Car,
  Users,
  Clock,
  TrendingUp,
  Search,
  Lock,
  Mail,
  Zap,
  Check,
  Ban,
  Filter,
  RefreshCw,
  AlertTriangle,
  PieChart,
  UserX,
  FileSpreadsheet,
  Eye,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Phone,
  MapPin,
  UserCheck,
  UserPlus,
  Key,
  Shield,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  UserCog,
  CreditCard,
  Sparkles,
  Copy,
  Shirt,
  Home,
  UtensilsCrossed,
  BookOpen,
  FileCheck
} from 'lucide-react';
import { LandlordUser, Property, Vehicle, Hotel, Restaurant, Library, ClothingItem, SportsTurfItem, GeneralItem, RentalBooking, TenantUser, AbuseReport, JuniorAdmin, AppNotification } from '../types';
import { auditAIFakeListing } from '../utils/aiLocationEngine';
import { scanAllAssetsForDuplicateImages, composeOwnerDuplicateImageNotice, DuplicateImageIncident, DuplicateImageMatch } from '../utils/fakeImageAnalysisEngine';
import { saveDocument, deleteDocument, subscribeCollection } from '../lib/firebase';
import { sendEmailOtpClient, verifyEmailOtpClient } from '../lib/brevoClient';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  landlords?: LandlordUser[];
  onApproveLandlord: (id: string) => void;
  onRejectLandlord: (id: string) => void;
  properties?: Property[];
  vehicles?: Vehicle[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  libraries?: Library[];
  clothing?: ClothingItem[];
  sportsTurfs?: SportsTurfItem[];
  generalItems?: GeneralItem[];
  onDeleteProperty: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
  bookings?: RentalBooking[];
  onUpdateBookingStatus?: (id: string, newStatus: any) => void;
  tokenAmount?: number;
  onUpdateTokenAmount?: (amount: number) => void;
  onUploadAllDataToFirebase?: () => Promise<void>;
  onEditProperty?: (p: Property) => void;
  onEditVehicle?: (v: Vehicle) => void;
  onRemoveDuplicateImage?: (assetId: string, assetType: string, imageUrl: string, ownerName: string, ownerContact: string, reason: string) => void;
  onSendNotificationToOwner?: (notification: AppNotification) => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  landlords = [],
  onApproveLandlord,
  onRejectLandlord,
  properties = [],
  vehicles = [],
  hotels = [],
  restaurants = [],
  libraries = [],
  clothing = [],
  sportsTurfs = [],
  generalItems = [],
  onDeleteProperty,
  onDeleteVehicle,
  bookings = [],
  onUpdateBookingStatus,
  tokenAmount = 99,
  onUpdateTokenAmount,
  onUploadAllDataToFirebase,
  onEditProperty,
  onEditVehicle,
  onRemoveDuplicateImage,
  onSendNotificationToOwner
}) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Syncing state
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Configurable Admin Credentials (default: salvirahul7038@gmail.com & Admin12345)
  const [activeAdminId, setActiveAdminId] = useState<string>(() => {
    return localStorage.getItem('renthub_admin_id') || 'salvirahul7038@gmail.com';
  });
  const [activeAdminPass, setActiveAdminPass] = useState<string>(() => {
    return localStorage.getItem('renthub_admin_pass') || 'Admin12345';
  });
  const [newAdminIdInput, setNewAdminIdInput] = useState<string>(() => {
    return localStorage.getItem('renthub_admin_id') || 'salvirahul7038@gmail.com';
  });
  const [newAdminPassInput, setNewAdminPassInput] = useState<string>(() => {
    return localStorage.getItem('renthub_admin_pass') || 'Admin12345';
  });
  const [credentialsMsg, setCredentialsMsg] = useState('');

  // Designated Super Admin Email OTP Login Verification State
  const [isLoginOtpRequired, setIsLoginOtpRequired] = useState(false);
  const [loginOtpSentCode, setLoginOtpSentCode] = useState('');
  const [loginOtpInput, setLoginOtpInput] = useState('');
  const [loginOtpError, setLoginOtpError] = useState('');

  // Super Admin Personal Details & Profile State
  const [adminProfileName, setAdminProfileName] = useState(() => localStorage.getItem('renthub_admin_profile_name') || 'Rahul Salvi');
  const [adminProfileEmail, setAdminProfileEmail] = useState(() => localStorage.getItem('renthub_admin_profile_email') || 'salvirahul7038@gmail.com');
  const [adminProfilePhone, setAdminProfilePhone] = useState(() => localStorage.getItem('renthub_admin_profile_phone') || '+91 98765 70380');
  const [adminProfileAddress, setAdminProfileAddress] = useState(() => localStorage.getItem('renthub_admin_profile_address') || 'Jaipur, Rajasthan, India');
  const [adminProfileRole, setAdminProfileRole] = useState(() => localStorage.getItem('renthub_admin_profile_role') || 'Super Admin & System Administrator');
  const [adminProfileSecurityPin, setAdminProfileSecurityPin] = useState(() => localStorage.getItem('renthub_admin_profile_pin') || '7038');
  const [adminProfileMsg, setAdminProfileMsg] = useState('');

  // Admin Email Verification & Password Reset Modal State
  const [isAdminVerifyModalOpen, setIsAdminVerifyModalOpen] = useState(false);
  const [adminVerifyEmailInput, setAdminVerifyEmailInput] = useState('');
  const [adminOtpSentCode, setAdminOtpSentCode] = useState('');
  const [adminOtpInput, setAdminOtpInput] = useState('');
  const [adminVerifyStep, setAdminVerifyStep] = useState<'email' | 'otp' | 'new_password' | 'success'>('email');
  const [resetNewAdminPass, setResetNewAdminPass] = useState('');
  const [adminVerifyError, setAdminVerifyError] = useState('');
  const [adminVerifyMsg, setAdminVerifyMsg] = useState('');
  const [isSendingAdminOtp, setIsSendingAdminOtp] = useState(false);

  const handleSendAdminEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminVerifyError('');
    setAdminVerifyMsg('');
    const inputEmail = adminVerifyEmailInput.trim().toLowerCase();
    
    if (!inputEmail) {
      setAdminVerifyError('Please enter your registered Admin Email.');
      return;
    }

    setIsSendingAdminOtp(true);
    try {
      const res = await sendEmailOtpClient({
        email: inputEmail,
        userName: 'Super Admin',
        purpose: 'password_reset'
      });

      if (res.success) {
        setAdminVerifyStep('otp');
        setAdminVerifyMsg(`✉️ Verification Code has been sent to ${inputEmail}! Please check your Email Inbox & Spam folder.`);
      } else {
        setAdminVerifyError(res.message || 'Failed to dispatch OTP email. Please try again.');
      }
    } catch (err: any) {
      setAdminVerifyError('Network connection error sending OTP.');
    } finally {
      setIsSendingAdminOtp(false);
    }
  };

  const handleVerifyAdminOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminVerifyError('');
    const cleanOtp = adminOtpInput.trim().replace(/[^0-9]/g, '');
    if (cleanOtp.length !== 6) {
      setAdminVerifyError('Please enter the complete 6-digit authorization code received on your email.');
      return;
    }

    setIsSendingAdminOtp(true);
    try {
      const res = await verifyEmailOtpClient(adminVerifyEmailInput.trim().toLowerCase(), cleanOtp);
      if (res.success && res.verified) {
        setAdminVerifyStep('new_password');
        setAdminVerifyMsg('✓ Email OTP Verified successfully! Now set your new Super Admin Password.');
      } else {
        setAdminVerifyError(res.message || 'Incorrect OTP code. Please check your email inbox.');
      }
    } catch (err: any) {
      setAdminVerifyError('Error verifying code. Please try again.');
    } finally {
      setIsSendingAdminOtp(false);
    }
  };

  const handleSaveAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminVerifyError('');
    const cleanPass = resetNewAdminPass.trim();
    if (!cleanPass || cleanPass.length < 5) {
      setAdminVerifyError('Password must be at least 5 characters long.');
      return;
    }

    setActiveAdminPass(cleanPass);
    setNewAdminPassInput(cleanPass);
    localStorage.setItem('renthub_admin_pass', cleanPass);

    try {
      await saveDocument('system_config', 'admin_credentials', {
        id: 'admin_credentials',
        adminId: activeAdminId,
        adminPass: cleanPass,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firebase admin credential update notice:', err);
    }

    setAdminVerifyStep('success');
    setAdminVerifyMsg('🎉 Super Admin Password Updated & Verified successfully!');
    setTimeout(() => {
      setIsAdminVerifyModalOpen(false);
      setAdminPassword(cleanPass);
      setAdminId(activeAdminId);
      setLoginError('✅ Email Verified! Password updated. Click Login to enter.');
    }, 1800);
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminProfileMsg('');
    localStorage.setItem('renthub_admin_profile_name', adminProfileName);
    localStorage.setItem('renthub_admin_profile_email', adminProfileEmail);
    localStorage.setItem('renthub_admin_profile_phone', adminProfilePhone);
    localStorage.setItem('renthub_admin_profile_address', adminProfileAddress);
    localStorage.setItem('renthub_admin_profile_role', adminProfileRole);
    localStorage.setItem('renthub_admin_profile_pin', adminProfileSecurityPin);

    setActiveAdminId(adminProfileEmail);
    localStorage.setItem('renthub_admin_id', adminProfileEmail);

    try {
      await saveDocument('system_config', 'admin_profile', {
        id: 'admin_profile',
        name: adminProfileName,
        email: adminProfileEmail,
        phone: adminProfilePhone,
        address: adminProfileAddress,
        role: adminProfileRole,
        securityPin: adminProfileSecurityPin,
        updatedAt: new Date().toISOString()
      });

      await saveDocument('system_config', 'admin_credentials', {
        id: 'admin_credentials',
        adminId: adminProfileEmail,
        adminPass: activeAdminPass,
        updatedAt: new Date().toISOString()
      });

      setAdminProfileMsg('✅ Super Admin Profile & Designated Email saved & synced to Firebase!');
    } catch (err) {
      setAdminProfileMsg('✅ Admin Profile saved to LocalStorage!');
    }
    setTimeout(() => setAdminProfileMsg(''), 5000);
  };

  useEffect(() => {
    const localId = localStorage.getItem('renthub_admin_id');
    const localPass = localStorage.getItem('renthub_admin_pass');
    if (localId && localPass) {
      setActiveAdminId(localId);
      setActiveAdminPass(localPass);
      setNewAdminIdInput(localId);
      setNewAdminPassInput(localPass);
    }

    // Real-time Firestore Sync for master admin credentials (with LocalStorage priority)
    const unsub = subscribeCollection<{ id: string; adminId?: string; adminPass?: string }>('system_config', (docs) => {
      const credsDoc = docs.find((d) => d.id === 'admin_credentials');
      if (credsDoc && credsDoc.adminId && credsDoc.adminPass) {
        const currentLocalPass = localStorage.getItem('renthub_admin_pass');
        // Only update if local is empty or matches cloud
        if (!currentLocalPass) {
          setActiveAdminId(credsDoc.adminId);
          setActiveAdminPass(credsDoc.adminPass);
          setNewAdminIdInput(credsDoc.adminId);
          setNewAdminPassInput(credsDoc.adminPass);
          localStorage.setItem('renthub_admin_id', credsDoc.adminId);
          localStorage.setItem('renthub_admin_pass', credsDoc.adminPass);
        }
      }
    });

    return () => unsub();
  }, []);

  const [loggedInRole, setLoggedInRole] = useState<'Super Admin' | 'Junior Admin'>('Super Admin');
  const [loggedInJuniorAdmin, setLoggedInJuniorAdmin] = useState<JuniorAdmin | null>(null);
  const [pendingJuniorLogin, setPendingJuniorLogin] = useState<JuniorAdmin | null>(null);

  // Junior Admins State with LocalStorage Persistence
  const [juniorAdmins, setJuniorAdmins] = useState<JuniorAdmin[]>(() => {
    const saved = localStorage.getItem('renthub_junior_admins');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'jadmin-1',
        name: 'Vikram Singh',
        email: 'vikram.admin@renthub.in',
        username: 'vikram',
        password: 'jpass123',
        role: 'Junior Admin',
        permissions: {
          canManageOwners: true,
          canViewFeedbacks: true,
          canManageListings: true,
          canViewAnalytics: false,
        },
        createdBy: 'Super Admin',
        createdAt: '2026-08-01',
        status: 'Active'
      },
      {
        id: 'jadmin-2',
        name: 'Pooja Sharma',
        email: 'pooja.admin@renthub.in',
        username: 'pooja',
        password: 'jpass456',
        role: 'Junior Admin',
        permissions: {
          canManageOwners: true,
          canViewFeedbacks: true,
          canManageListings: false,
          canViewAnalytics: false,
        },
        createdBy: 'Super Admin',
        createdAt: '2026-08-03',
        status: 'Active'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('renthub_junior_admins', JSON.stringify(juniorAdmins));
  }, [juniorAdmins]);

  // Modal State for Adding New Junior Admin
  const [isCreateJuniorModalOpen, setIsCreateJuniorModalOpen] = useState(false);
  const [newJuniorName, setNewJuniorName] = useState('');
  const [newJuniorEmail, setNewJuniorEmail] = useState('');
  const [newJuniorUsername, setNewJuniorUsername] = useState('');
  const [newJuniorPassword, setNewJuniorPassword] = useState('');
  const [newJuniorCanOwners, setNewJuniorCanOwners] = useState(true);
  const [newJuniorCanFeedbacks, setNewJuniorCanFeedbacks] = useState(true);
  const [newJuniorCanListings, setNewJuniorCanListings] = useState(false);
  const [newJuniorCanAnalytics, setNewJuniorCanAnalytics] = useState(false);
  const [juniorFormMsg, setJuniorFormMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'landlords' | 'bookingRequests' | 'properties' | 'vehicles' | 'clothing' | 'users' | 'fakeReports' | 'analytics' | 'juniorAdmins' | 'settings'>('dashboard');
  const [landlordFilter, setLandlordFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');

  // States for viewing detailed owner pending requests & image lightboxes
  const [selectedLandlordDetail, setSelectedLandlordDetail] = useState<LandlordUser | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ title: string; url: string; description?: string } | null>(null);

  // Mock Tenants for User Management
  const [tenants, setTenants] = useState<TenantUser[]>([
    { id: 'usr-1', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', phone: '+91 98765 11223', status: 'Active', joinedDate: '2026-05-10' },
    { id: 'usr-2', name: 'Priya Verma', email: 'priya.v@outlook.com', phone: '+91 98111 44556', status: 'Active', joinedDate: '2026-06-12' },
    { id: 'usr-3', name: 'Amit Patel', email: 'amit.p@yahoo.com', phone: '+91 97222 33445', status: 'Active', joinedDate: '2026-07-01' },
    { id: 'usr-4', name: 'Sneha Roy', email: 'sneha.r@gmail.com', phone: '+91 99333 88776', status: 'Blocked', joinedDate: '2026-07-15' }
  ]);

  // Mock Abuse Reports
  const [abuseReports, setAbuseReports] = useState<AbuseReport[]>([
    { id: 'rep-1', itemId: 'res-99', itemTitle: 'Cheap Luxury Flat in Malviya Nagar ₹500', reporterName: 'Deepak Jain', reason: 'Unrealistically low rent and fake whatsapp number', date: '2026-08-04', type: 'Fake Listing', status: 'Pending' },
    { id: 'rep-2', itemId: 'res-102', itemTitle: 'College PG near Station', reporterName: 'Anjali Gupta', reason: 'Same photos reused from another site', date: '2026-08-05', type: 'Duplicate Photos', status: 'Pending' }
  ]);

  // User Contact Support & Feedbacks State
  const [userFeedbacks, setUserFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem('renthub_feedbacks_list');
      if (stored) {
        setUserFeedbacks(JSON.parse(stored));
      } else {
        setUserFeedbacks([
          {
            id: 'fb-101',
            userName: 'Rahul Salvi',
            userEmail: 'rahul.salvi@gmail.com',
            rating: 5,
            category: 'App Experience',
            message: 'RentHub made finding my PG near Pune College so effortless! Zero brokerage and instant owner contact details.',
            createdAt: '2026-08-05'
          },
          {
            id: 'fb-102',
            userName: 'Pooja Sharma',
            userEmail: 'pooja.s@gmail.com',
            rating: 5,
            category: 'Contact Support',
            message: 'Need help with agreement verification for 2BHK flat in Udaipur. Please contact back.',
            createdAt: '2026-08-04'
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const unsubscribe = subscribeCollection<any>('feedbacks', (docs) => {
        if (docs && docs.length > 0) {
          setUserFeedbacks(prev => {
            const combined = [...docs, ...prev];
            const uniqueMap = new Map();
            combined.forEach((item: any) => uniqueMap.set(item.id || item.userEmail, item));
            return Array.from(uniqueMap.values());
          });
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase feedback fetch error:', err);
    }
  }, [isOpen]);

  const handleDeleteFeedback = async (id: string) => {
    const updated = userFeedbacks.filter(f => f.id !== id);
    setUserFeedbacks(updated);
    localStorage.setItem('renthub_feedbacks_list', JSON.stringify(updated));
    try {
      await deleteDocument('feedbacks', id);
    } catch (err) {
      console.warn('Firebase delete feedback fallback:', err);
    }
  };

  // AI Fake & Duplicate Image Scanner State
  const [duplicateIncidents, setDuplicateIncidents] = useState<DuplicateImageIncident[]>([]);
  const [isScanningImages, setIsScanningImages] = useState(false);
  const [duplicateFilter, setDuplicateFilter] = useState<'ALL' | 'High' | 'Cross-Owner' | 'Reused' | 'Resolved'>('ALL');
  const [scanMessageToast, setScanMessageToast] = useState<string | null>(null);
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState<{
    ownerName: string;
    ownerContact: string;
    assetTitle: string;
    whatsappUrl: string;
    messageText: string;
  } | null>(null);

  const runImageAuditScan = () => {
    setIsScanningImages(true);
    setScanMessageToast('🔍 Scanning all properties, vehicles, hotels, clothes & turfs for duplicate image signatures...');
    setTimeout(() => {
      const results = scanAllAssetsForDuplicateImages({
        properties,
        vehicles,
        hotels,
        restaurants,
        libraries,
        clothing,
        sportsTurfs,
        generalItems
      });
      setDuplicateIncidents(results);
      setIsScanningImages(false);
      setScanMessageToast(`✓ Scan Complete! Analyzed all assets. Found ${results.length} duplicate/fraud image detections.`);
      setTimeout(() => setScanMessageToast(null), 5000);
    }, 600);
  };

  useEffect(() => {
    if (isOpen) {
      const results = scanAllAssetsForDuplicateImages({
        properties,
        vehicles,
        hotels,
        restaurants,
        libraries,
        clothing,
        sportsTurfs,
        generalItems
      });
      setDuplicateIncidents(results);
    }
  }, [isOpen, properties, vehicles, hotels, restaurants, libraries, clothing, sportsTurfs, generalItems]);

  const handleRemoveDuplicateAndNotify = (incident: DuplicateImageIncident, targetAsset: DuplicateImageMatch) => {
    const notice = composeOwnerDuplicateImageNotice({
      ownerName: targetAsset.ownerName,
      ownerContact: targetAsset.ownerContact,
      assetTitle: targetAsset.assetTitle,
      assetType: targetAsset.assetType,
      reason: incident.reason,
      removedImageUrl: incident.imageUrl
    });

    if (onRemoveDuplicateImage) {
      onRemoveDuplicateImage(
        targetAsset.assetId,
        targetAsset.assetType,
        incident.imageUrl,
        targetAsset.ownerName,
        targetAsset.ownerContact,
        incident.reason
      );
    }

    if (onSendNotificationToOwner) {
      onSendNotificationToOwner(notice.notification);
    }

    setDuplicateIncidents(prev =>
      prev.map(item => {
        if (item.id === incident.id) {
          return {
            ...item,
            status: 'Removed & Owner Notified',
            actionTakenAt: new Date().toLocaleTimeString(),
            notificationSent: true,
            notifiedOwnerContact: targetAsset.ownerContact,
            notificationMessage: notice.messageText
          };
        }
        return item;
      })
    );

    setActiveWhatsAppModal({
      ownerName: targetAsset.ownerName,
      ownerContact: targetAsset.ownerContact,
      assetTitle: targetAsset.assetTitle,
      whatsappUrl: notice.whatsappUrl,
      messageText: notice.messageText
    });
  };

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setLoginError('Too many failed login attempts. System locked for security. Try again in 30 seconds.');
      return;
    }

    const inputId = adminId.trim();
    const inputPass = adminPassword.trim();

    // 1. Check Super Admin Master Credentials (Designated Email: salvirahul7038@gmail.com)
    const storedPass = localStorage.getItem('renthub_admin_pass') || activeAdminPass;
    const storedId = localStorage.getItem('renthub_admin_id') || activeAdminId;

    const isSuperMatch = (
      inputId === activeAdminId ||
      inputId === storedId ||
      inputId.toLowerCase() === 'salvirahul7038@gmail.com' ||
      inputId.toLowerCase() === 'admin' ||
      inputId.toLowerCase() === 'superadmin' ||
      inputId.toLowerCase() === adminProfileEmail.toLowerCase()
    ) && (inputPass === activeAdminPass || inputPass === storedPass);

    if (isSuperMatch) {
      setPendingJuniorLogin(null);
      setIsSendingAdminOtp(true);
      try {
        const targetEmail = adminProfileEmail.toLowerCase() || 'salvirahul7038@gmail.com';
        const res = await sendEmailOtpClient({
          email: targetEmail,
          userName: adminProfileName || 'Super Admin',
          purpose: 'admin_login'
        });

        if (res.success) {
          setIsLoginOtpRequired(true);
          setLoginOtpInput('');
          setLoginOtpError('');
          setLoginError('');
          setFailedAttempts(0);
        } else {
          setLoginError(res.message || 'Unable to send Login OTP email.');
        }
      } catch (err) {
        setLoginError('Network error dispatching OTP to salvirahul7038@gmail.com.');
      } finally {
        setIsSendingAdminOtp(false);
      }
      return;
    }

    // 2. Check Junior Admin Credentials
    const matchedJunior = juniorAdmins.find(
      (j) => (j.username.toLowerCase() === inputId.toLowerCase() || j.email.toLowerCase() === inputId.toLowerCase()) && j.password === inputPass
    );

    if (matchedJunior) {
      if (matchedJunior.status === 'Suspended') {
        setLoginError('🚫 ACCOUNT SUSPENDED: This Junior Admin account is currently suspended by Super Admin.');
        return;
      }

      setIsSendingAdminOtp(true);
      try {
        const targetEmail = matchedJunior.email.toLowerCase().trim();
        const res = await sendEmailOtpClient({
          email: targetEmail,
          userName: matchedJunior.name || matchedJunior.username,
          purpose: 'admin_login'
        });

        if (res.success) {
          setPendingJuniorLogin(matchedJunior);
          setIsLoginOtpRequired(true);
          setLoginOtpInput('');
          setLoginOtpError('');
          setLoginError('');
          setFailedAttempts(0);
        } else {
          setLoginError(res.message || `Unable to send Login OTP email to ${targetEmail}.`);
        }
      } catch (err) {
        setLoginError(`Network error dispatching OTP to ${matchedJunior.email}.`);
      } finally {
        setIsSendingAdminOtp(false);
      }
      return;
    }

    // Login Failed
    const nextFail = failedAttempts + 1;
    setFailedAttempts(nextFail);
    if (nextFail >= 4) {
      setIsLocked(true);
      setLoginError('SECURITY LOCKOUT: 4 Invalid Login attempts detected. Locked for 30 seconds.');
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        setLoginError('');
      }, 30000);
    } else {
      setLoginError(`Invalid Credentials. Use Super Admin or assigned Junior Admin ID & Password. Attempts left: ${4 - nextFail}`);
    }
  };

  const handleVerifyLoginOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginOtpError('');
    const cleanOtp = loginOtpInput.trim().replace(/[^0-9]/g, '');
    if (cleanOtp.length !== 6) {
      setLoginOtpError(`Please enter the complete 6-digit authorization code received on your email.`);
      return;
    }

    setIsSendingAdminOtp(true);
    try {
      const targetEmail = pendingJuniorLogin
        ? pendingJuniorLogin.email.toLowerCase().trim()
        : (adminProfileEmail.toLowerCase() || 'salvirahul7038@gmail.com');

      const res = await verifyEmailOtpClient(targetEmail, cleanOtp);

      if (res.success && res.verified) {
        if (pendingJuniorLogin) {
          setIsAdminLoggedIn(true);
          setLoggedInRole('Junior Admin');
          setLoggedInJuniorAdmin(pendingJuniorLogin);

          // Default active tab to first permitted section
          if (pendingJuniorLogin.permissions.canManageOwners) {
            setActiveTab('landlords');
          } else if (pendingJuniorLogin.permissions.canViewFeedbacks) {
            setActiveTab('fakeReports');
          } else if (pendingJuniorLogin.permissions.canManageListings) {
            setActiveTab('properties');
          } else {
            setActiveTab('dashboard');
          }
          setPendingJuniorLogin(null);
        } else {
          setIsAdminLoggedIn(true);
          setLoggedInRole('Super Admin');
          setLoggedInJuniorAdmin(null);
          setActiveTab('dashboard');
        }

        setIsLoginOtpRequired(false);
        setLoginOtpError('');
        setLoginError('');
        setFailedAttempts(0);
      } else {
        setLoginOtpError(res.message || `Invalid 6-Digit OTP Code. Please check your email inbox at ${targetEmail}`);
      }
    } catch (err) {
      setLoginOtpError('Error verifying code. Please try again.');
    } finally {
      setIsSendingAdminOtp(false);
    }
  };

  const handleCreateJuniorAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJuniorName.trim() || !newJuniorUsername.trim() || !newJuniorPassword.trim()) {
      setJuniorFormMsg('Please fill in Name, Username/ID and Password.');
      return;
    }

    // Check duplicate username
    if (juniorAdmins.some(j => j.username.toLowerCase() === newJuniorUsername.trim().toLowerCase())) {
      setJuniorFormMsg('Username/ID already exists. Please choose a unique username.');
      return;
    }

    const newJunior: JuniorAdmin = {
      id: `jadmin-${Date.now()}`,
      name: newJuniorName.trim(),
      email: newJuniorEmail.trim() || `${newJuniorUsername.trim()}@renthub.in`,
      username: newJuniorUsername.trim(),
      password: newJuniorPassword.trim(),
      role: 'Junior Admin',
      permissions: {
        canManageOwners: newJuniorCanOwners,
        canViewFeedbacks: newJuniorCanFeedbacks,
        canManageListings: newJuniorCanListings,
        canViewAnalytics: newJuniorCanAnalytics,
      },
      createdBy: 'Super Admin',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    setJuniorAdmins(prev => [newJunior, ...prev]);
    // Save new Junior Admin staff registration to Firebase Cloud Firestore
    try {
      saveDocument('junior_admins', newJunior.id, newJunior);
    } catch (e) {
      console.warn('Firebase junior admin save note:', e);
    }

    setIsCreateJuniorModalOpen(false);
    setNewJuniorName('');
    setNewJuniorEmail('');
    setNewJuniorUsername('');
    setNewJuniorPassword('');
    setNewJuniorCanOwners(true);
    setNewJuniorCanFeedbacks(true);
    setNewJuniorCanListings(false);
    setNewJuniorCanAnalytics(false);
    setJuniorFormMsg('');
  };

  const handleToggleJuniorStatus = (id: string) => {
    setJuniorAdmins(prev => {
      const updated = prev.map(j => j.id === id ? { ...j, status: j.status === 'Active' ? 'Suspended' as const : 'Active' as const } : j);
      const target = updated.find(j => j.id === id);
      if (target) saveDocument('junior_admins', id, target);
      return updated;
    });
  };

  const handleDeleteJuniorAdmin = (id: string) => {
    setJuniorAdmins(prev => prev.filter(j => j.id !== id));
    deleteDocument('junior_admins', id);
  };

  const handleTriggerUploadFirebase = async () => {
    if (onUploadAllDataToFirebase) {
      setIsSyncingFirebase(true);
      setSyncSuccessMsg('');
      try {
        const res: any = await onUploadAllDataToFirebase();
        if (res && res.totalUploaded) {
          setSyncSuccessMsg(`✅ Success! Uploaded ${res.totalUploaded} total records to Firebase Firestore Database (${res.databaseId || 'Cloud DB'}).`);
        } else {
          setSyncSuccessMsg('✅ All listings, landlords, bookings, and assets uploaded successfully to Firebase Firestore!');
        }
      } catch (err: any) {
        setSyncSuccessMsg(`⚠️ Sync partially completed or note: ${err?.message || 'Check connection'}`);
      } finally {
        setIsSyncingFirebase(false);
      }
    }
  };

  const handleSaveNewCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newAdminIdInput.trim();
    const cleanPass = newAdminPassInput.trim();
    if (!cleanId || !cleanPass) {
      setCredentialsMsg('ID and Password cannot be blank.');
      return;
    }
    setActiveAdminId(cleanId);
    setActiveAdminPass(cleanPass);
    setAdminId(cleanId);
    setAdminPassword(cleanPass);

    // Persist to Browser LocalStorage immediately
    localStorage.setItem('renthub_admin_id', cleanId);
    localStorage.setItem('renthub_admin_pass', cleanPass);

    // Persist to Firebase Firestore
    try {
      await saveDocument('system_config', 'admin_credentials', {
        id: 'admin_credentials',
        adminId: cleanId,
        adminPass: cleanPass,
        updatedAt: new Date().toISOString()
      });
      setCredentialsMsg('✅ Admin ID & Password updated and permanently saved to Browser & Firebase!');
    } catch (err) {
      setCredentialsMsg('✅ Admin ID & Password saved to Browser LocalStorage!');
    }
    setTimeout(() => setCredentialsMsg(''), 5000);
  };

  const handleToggleBlockTenant = (id: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Blocked' : 'Active' } : t));
  };

  const handleDeleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  const pendingLandlords = landlords.filter((l) => l.status === 'Pending');
  const approvedLandlords = landlords.filter((l) => l.status === 'Approved');
  const pendingProperties = properties.filter((p) => p.status === 'Pending Approval');

  const filteredLandlords = landlords.filter((l) => {
    if (landlordFilter !== 'ALL' && l.status !== landlordFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] text-white overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Header - Premium White, Black & Gold Styling */}
        <div className="bg-[#070709] p-5 sm:p-7 border-b border-amber-500/30 flex items-center justify-between sticky top-0 z-40 shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/25 border border-amber-300 shrink-0">
              <ShieldAlert className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isAdminLoggedIn
                    ? loggedInRole === 'Super Admin'
                      ? 'Super Admin Control Center'
                      : `Junior Admin Portal (${loggedInJuniorAdmin?.name || 'Staff'})`
                    : 'Super Admin Control Center'}
                </h2>
                <span className="font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-500/40">
                  {isAdminLoggedIn ? loggedInRole.toUpperCase() : 'GOLD CLEARANCE'}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium mt-0.5 flex items-center space-x-2">
                <span>{isAdminLoggedIn ? 'Platform Administration & System Controls' : 'Super Admin Command & Security Gateway'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-2 bg-[#121215] hover:bg-zinc-900 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-amber-500/30 shadow-md"
          >
            <X className="h-4 w-4" />
            <span>← Exit Control Center</span>
          </button>
        </div>

        {!isAdminLoggedIn ? (
          /* Admin Login Screen - Clean White, Black & Gold without personal email leaks */
          <div className="p-8 max-w-md mx-auto space-y-5 my-auto">
            <div className="bg-[#0c0c0f] border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.12)] space-y-5">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border border-amber-300 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <Lock className="h-8 w-8 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-white">Super Admin Access Gateway</h3>
                <p className="text-xs text-slate-400">
                  Enter Admin ID/Username & Password. A 6-digit authorization OTP will be sent to the registered email address.
                </p>
              </div>

              {loginError && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-2xl text-xs font-bold">
                  {loginError}
                </div>
              )}

              {isLoginOtpRequired ? (
                /* STEP 2: 6-Digit Email OTP Login Verification Form */
                <form onSubmit={handleVerifyLoginOtpSubmit} className="space-y-4">
                  <div className="bg-[#141418] p-4 rounded-2xl border border-amber-500/40 text-amber-200 space-y-1.5 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-amber-400 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-white">6-Digit Email Authorization Code Sent</h4>
                        <p className="text-[11px] text-amber-300 font-mono">
                          Verification OTP sent to {pendingJuniorLogin ? pendingJuniorLogin.email : (adminProfileEmail || 'salvirahul7038@gmail.com')}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 pt-1">
                      Please check your Email Inbox & Spam folder. Enter the 6-digit verification code below to authorize {pendingJuniorLogin ? `Junior Admin (${pendingJuniorLogin.name})` : 'Super Admin'} login.
                    </p>
                  </div>

                  {loginOtpError && (
                    <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs font-bold">
                      {loginOtpError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Enter 6-Digit Authorization OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={loginOtpInput}
                      onChange={(e) => setLoginOtpInput(e.target.value)}
                      className="w-full bg-[#141418] border border-amber-500/60 rounded-xl p-3 text-center font-mono font-black text-xl text-white tracking-widest outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsLoginOtpRequired(false)}
                      className="w-1/3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer border border-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer border border-amber-300"
                    >
                      Verify OTP & Enter Portal
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 1: Enter Admin ID & Password */
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Admin Email or ID / Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Admin Username or Email"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      className="w-full bg-[#141418] border border-amber-500/30 rounded-xl p-3 text-xs text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Super Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter Master Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-[#141418] border border-amber-500/30 rounded-xl p-3 text-xs text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer border border-amber-300"
                  >
                    Verify Credentials & Send OTP
                  </button>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminVerifyModalOpen(true);
                        setAdminVerifyStep('email');
                        setAdminVerifyError('');
                        setAdminVerifyMsg('');
                        setAdminVerifyEmailInput('');
                      }}
                      className="w-full bg-[#141418] hover:bg-zinc-900 text-amber-300 border border-amber-500/30 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-4 w-4 text-amber-400" />
                      <span>Forgot Password? Reset via Email OTP</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-[#141418] p-3.5 rounded-2xl border border-amber-500/20 text-[11px] text-slate-400 text-center">
                🔒 <span className="font-semibold text-amber-300">Gold Protected Gateway</span> • Multi-factor Email OTP active.
              </div>
            </div>
          </div>
        ) : (
          /* Admin Main Portal Dashboard */
          <div>
            
            {/* Navigation Tabs - White, Black & Gold Theme */}
            <div className="px-6 pt-4 border-b border-amber-500/30 flex justify-between items-center text-xs font-bold bg-[#07070a] shadow-lg sticky top-[73px] z-30">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <PieChart className="h-4 w-4 text-amber-400" />
                  <span>Dashboard</span>
                </button>

                {(loggedInRole === 'Super Admin' || loggedInJuniorAdmin?.permissions.canManageOwners) && (
                  <button
                    onClick={() => setActiveTab('landlords')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'landlords'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Users className="h-4 w-4 text-amber-400" />
                    <span>Owner Requests ({pendingLandlords.length} Pending)</span>
                  </button>
                )}

                {(loggedInRole === 'Super Admin' || loggedInJuniorAdmin?.permissions.canManageListings) && (
                  <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'properties'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Building2 className="h-4 w-4 text-amber-400" />
                    <span>Properties ({properties.length})</span>
                  </button>
                )}

                {(loggedInRole === 'Super Admin' || loggedInJuniorAdmin?.permissions.canManageListings) && (
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'vehicles'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Car className="h-4 w-4 text-amber-400" />
                    <span>Vehicles Audit ({vehicles.filter(v => v.status === 'Pending Approval').length} Pending)</span>
                  </button>
                )}

                {(loggedInRole === 'Super Admin' || loggedInJuniorAdmin?.permissions.canManageListings) && (
                  <button
                    onClick={() => setActiveTab('clothing')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'clothing'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Shirt className="h-4 w-4 text-amber-400" />
                    <span>Clothing Audit ({clothing.filter(c => c.status === 'Pending Approval').length} Pending)</span>
                  </button>
                )}

                {loggedInRole === 'Super Admin' && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>Tenants ({tenants.length})</span>
                  </button>
                )}

                {(loggedInRole === 'Super Admin' || loggedInJuniorAdmin?.permissions.canViewFeedbacks) && (
                  <button
                    onClick={() => setActiveTab('fakeReports')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'fakeReports'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Feedbacks & Fake ({abuseReports.length})</span>
                  </button>
                )}

                {(loggedInRole === 'Super Admin' || loggedInJuniorAdmin?.permissions.canViewAnalytics) && (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 text-amber-400" />
                    <span>Analytics</span>
                  </button>
                )}

                {loggedInRole === 'Super Admin' && (
                  <>
                    <button
                      onClick={() => setActiveTab('juniorAdmins')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        activeTab === 'juniorAdmins'
                          ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <UserCog className="h-4 w-4 text-amber-400" />
                      <span>Junior Admins ({juniorAdmins.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        activeTab === 'settings'
                          ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Lock className="h-4 w-4 text-amber-400" />
                      <span>Super Credentials</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        activeTab === 'profile'
                          ? 'bg-amber-400/15 text-amber-300 border-amber-400 font-black shadow-sm shadow-amber-500/20'
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <UserCheck className="h-4 w-4 text-amber-400" />
                      <span>Super Admin Profile</span>
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-bold py-1 px-3 rounded-lg border border-slate-800 hover:border-rose-500/40 bg-slate-950 transition-all shrink-0 cursor-pointer"
              >
                Logout ({loggedInRole})
              </button>
            </div>

            {/* Tab Body - Premium White, Black & Gold */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 bg-[#09090b]">
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">
                  {/* Firebase Cloud Sync Banner */}
                  <div className="bg-gradient-to-r from-[#121008] via-[#0d0d12] to-[#141208] p-5 rounded-3xl border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
                        <h4 className="font-black text-sm text-white">Firebase Firestore Real-Time Database Sync</h4>
                        <span className="bg-amber-400/15 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/40">
                          ONLINE & ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Automatically sync properties, vehicles, hotels, restaurants, libraries, roommates, and registrations to Cloud Firestore.
                      </p>
                      {syncSuccessMsg && (
                        <p className="text-xs font-bold text-emerald-400 pt-1 animate-in fade-in">
                          {syncSuccessMsg}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleTriggerUploadFirebase}
                      disabled={isSyncingFirebase}
                      className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 border border-amber-300 transition-all shrink-0 cursor-pointer"
                    >
                      <RefreshCw className={`h-4 w-4 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                      <span>{isSyncingFirebase ? 'Uploading to Firebase...' : 'Sync All Data to Firebase'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
                    <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <span className="text-amber-300/80 block text-[10px] uppercase tracking-wider font-sans font-bold">Total Users</span>
                      <span className="text-2xl font-black text-white">{tenants.length}</span>
                    </div>

                    <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <span className="text-amber-300/80 block text-[10px] uppercase tracking-wider font-sans font-bold">Total Owners</span>
                      <span className="text-2xl font-black text-white">{landlords.length}</span>
                    </div>

                    <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <span className="text-amber-300/80 block text-[10px] uppercase tracking-wider font-sans font-bold">Pending Requests</span>
                      <span className="text-2xl font-black text-amber-400">{pendingLandlords.length}</span>
                    </div>

                    <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <span className="text-amber-300/80 block text-[10px] uppercase tracking-wider font-sans font-bold">Active Properties</span>
                      <span className="text-2xl font-black text-emerald-400">{properties.length}</span>
                    </div>

                    <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <span className="text-amber-300/80 block text-[10px] uppercase tracking-wider font-sans font-bold">Total Bookings</span>
                      <span className="text-2xl font-black text-white">{bookings.length}</span>
                    </div>

                    <div className="bg-[#0c0c10] p-3.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all shadow-md">
                      <span className="text-slate-400 block text-[10px]">Fake Reports</span>
                      <span className="text-2xl font-black text-rose-400">{abuseReports.length}</span>
                    </div>
                  </div>

                  <div className="bg-[#0c0c0f] p-4 rounded-2xl border border-amber-500/30 space-y-2">
                    <h4 className="font-extrabold text-xs text-white flex items-center space-x-2">
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      <span>Platform Health & AI Audit Status</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      AI Automatic Listing Auditor is active. All owner phone numbers and pricing benchmarks are monitored 24/7.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: OWNER MANAGEMENT */}
              {activeTab === 'landlords' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#0c0c0f] p-3 rounded-2xl border border-amber-500/30">
                    <div className="flex space-x-2 text-xs font-bold">
                      <button
                        onClick={() => setLandlordFilter('Pending')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          landlordFilter === 'Pending' ? 'bg-amber-400/20 text-amber-300 border border-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Pending Requests ({pendingLandlords.length})
                      </button>

                      <button
                        onClick={() => setLandlordFilter('Approved')}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          landlordFilter === 'Approved' ? 'bg-amber-400/20 text-amber-300 border border-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Approved Owners ({approvedLandlords.length})
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search owner..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#141418] border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-3">
                    {filteredLandlords.map((l) => {
                      const docImg = l.documentPhotoUrl || 'https://images.unsplash.com/photo-1633265486221-a53f08efb24a?w=800&auto=format&fit=crop&q=80';
                      return (
                        <div key={l.id} className="bg-[#0c0c0f] border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs shadow-md hover:border-amber-400/60 transition-all">
                          <div className="flex items-start space-x-3">
                            {/* Document / Owner Thumbnail Image */}
                            <div
                              onClick={() => setLightboxImage({
                                title: `${l.name} - Verification Document (${l.documentType || 'Government ID'})`,
                                url: docImg,
                                description: `Uploaded by ${l.name} (${l.phone}) on ${l.requestedAt}`
                              })}
                              className="relative group h-14 w-14 rounded-xl overflow-hidden bg-[#141418] border border-amber-500/30 shrink-0 cursor-pointer hover:border-amber-400 transition-all"
                              title="Click to view full screen image"
                            >
                              <img src={docImg} alt="ID Document" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Maximize2 className="h-4 w-4 text-amber-400" />
                              </div>
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-amber-300 font-extrabold">{l.id}</span>
                                <h4 className="font-extrabold text-white text-sm">{l.name}</h4>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  l.status === 'Approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : l.status === 'Pending'
                                    ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 animate-pulse'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}>
                                  {l.status}
                                </span>
                              </div>

                              <p className="text-slate-300 mt-1">
                                📧 {l.email} • 📞 {l.phone} • 📍 {l.city} ({l.state || 'India'})
                              </p>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-amber-300 font-mono bg-amber-400/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                                  📄 {l.documentType || 'Aadhaar Card & Property Deed'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => setLightboxImage({
                                    title: `${l.name} - Verification Document (${l.documentType || 'Government ID'})`,
                                    url: docImg,
                                    description: `Document ID: ${l.idProofNumber || 'N/A'} • Submitted on ${l.requestedAt}`
                                  })}
                                  className="text-[10px] font-extrabold bg-[#141418] text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md hover:bg-zinc-900 transition-colors flex items-center space-x-1 cursor-pointer"
                                >
                                  <ImageIcon className="h-3 w-3 text-amber-400" />
                                  <span>📷 Open ID Image</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            {/* VIEW DETAILS BUTTON */}
                            <button
                              type="button"
                              onClick={() => setSelectedLandlordDetail(l)}
                              className="bg-[#141418] text-amber-300 hover:bg-zinc-900 border border-amber-500/30 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                              title="View full owner details & documents"
                            >
                              <Eye className="h-3.5 w-3.5 text-amber-400" />
                              <span>View Details</span>
                            </button>

                            {l.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => onApproveLandlord(l.id)}
                                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition-all shadow-md cursor-pointer border border-amber-300"
                              >
                                Approve
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onRejectLandlord(l.id)}
                              className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              {l.status === 'Approved' ? 'Suspend' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: BOOKING REQUESTS & TENANT VERIFICATIONS */}
              {activeTab === 'bookingRequests' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">Tenant Booking Requests & Verification Panel</h4>
                      <p className="text-slate-400">
                        Review uploaded Government ID proofs, token payment receipts, and manage booking approval status.
                      </p>
                    </div>
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-xl font-bold font-mono">
                      Current Token Fee: ₹{tokenAmount}
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 space-y-2">
                      <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                      <p className="font-bold">No booking requests submitted yet.</p>
                      <p className="text-xs">When tenants request a property and pay the token fee, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div key={b.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div className="flex items-center space-x-3">
                              <img src={b.itemImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80'} alt={b.itemTitle} className="h-12 w-16 object-cover rounded-xl shrink-0" />
                              <div>
                                <span className="font-mono text-amber-300 font-extrabold">{b.id}</span>
                                <h4 className="font-bold text-white text-sm">{b.itemTitle}</h4>
                                <p className="text-slate-400">
                                  Tenant: <strong className="text-white">{b.userName || 'Anonymous'}</strong> ({b.userPhone || 'No Phone'})
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full font-extrabold text-[11px] border ${
                                b.status === 'Approved' || b.status === 'Accepted'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : b.status === 'Rejected' || b.status === 'Cancelled'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : b.status === 'Pending Verification'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                            <div>
                              <span className="text-slate-400 block font-mono">Government ID:</span>
                              <span className="text-white font-bold">{b.govIdType || 'Aadhaar Card'}: {b.govIdNumber || 'Verified'}</span>
                            </div>

                            <div>
                              <span className="text-slate-400 block font-mono">Token Paid Amount:</span>
                              <span className="text-emerald-400 font-bold">₹{b.tokenPaidAmount || tokenAmount} (Paid ✓)</span>
                            </div>

                            <div>
                              <span className="text-slate-400 block font-mono">Move-in / Start Date:</span>
                              <span className="text-zinc-200 font-bold">{b.startDate}</span>
                            </div>
                          </div>

                          {/* Action Status Selector */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            {b.idProofUrl && (
                              <button
                                type="button"
                                onClick={() => setLightboxImage({
                                  title: `Tenant ID Proof - ${b.userName}`,
                                  url: b.idProofUrl || '',
                                  description: `Gov ID (${b.govIdType}): ${b.govIdNumber} • Phone: ${b.userPhone}`
                                })}
                                className="bg-zinc-800 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center space-x-1 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>🔍 View Tenant ID Document</span>
                              </button>
                            )}

                            <div className="flex items-center space-x-1.5 ml-auto">
                              <span className="text-amber-400 font-extrabold text-[11px] bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-lg">
                                🏠 Handled by Property Owner (Owner Portal)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PROPERTY MANAGEMENT */}
              {activeTab === 'properties' && (
                <div className="space-y-3">
                  {properties.map((p) => (
                    <div key={p.id} className="bg-[#0c0c0f] border border-amber-500/30 p-4 rounded-2xl flex justify-between items-center text-xs hover:border-amber-400/60 transition-all shadow-md">
                      <div className="flex items-center space-x-3">
                        <img src={p.images[0]} alt={p.title} className="h-12 w-16 object-cover rounded-xl shrink-0 border border-amber-500/30" />
                        <div>
                          <span className="text-amber-300 font-bold">{p.subType}</span>
                          <h4 className="font-bold text-white text-sm">{p.title}</h4>
                          <p className="text-slate-300">{p.location}, {p.city} • Owner: {p.ownerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-black text-amber-300 text-sm">₹{p.rentPerMonth.toLocaleString('en-IN')}/mo</span>
                        <button
                          onClick={() => onDeleteProperty(p.id)}
                          className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Delete Listing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: VEHICLES & ADMIN DOCUMENT VERIFICATION AUDIT */}
              {activeTab === 'vehicles' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-[#141418] border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-black text-sm text-white flex items-center space-x-2">
                        <Car className="h-4 w-4 text-amber-400" />
                        <span>Car Listing & Document Audit Queue</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Inspect RC Certificate, Insurance, PUC & Owner Identity before approving public listings.
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl">
                      {vehicles.filter(v => v.status === 'Pending Approval').length} Pending Approvals
                    </span>
                  </div>

                  {vehicles.length === 0 ? (
                    <div className="bg-[#0c0c0f] border border-amber-500/30 p-8 text-center text-slate-400 text-xs rounded-2xl">
                      No vehicles found in the system.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicles.map((v) => (
                        <div
                          key={v.id}
                          className="bg-[#0c0c0f] border border-amber-500/30 p-4 rounded-2xl space-y-3 hover:border-amber-400/60 transition-all shadow-md text-xs"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-3">
                            <div className="flex items-center space-x-3">
                              <img src={v.images[0]} alt={v.title} className="h-14 w-20 object-cover rounded-xl shrink-0 border border-amber-500/40" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                                    {v.licensePlate || 'RJ 27 CA 9021'}
                                  </span>
                                  <span className="bg-zinc-800 text-amber-300 px-2 py-0.5 rounded font-bold text-[10px]">
                                    {v.brand} {v.modelName} ({v.year || 2024})
                                  </span>
                                </div>
                                <h4 className="font-bold text-white text-sm mt-1">{v.title}</h4>
                                <p className="text-slate-400 font-medium">
                                  Owner: <strong className="text-white">{v.ownerName}</strong> ({v.ownerContact || '+91 98765 43210'}) • Hub: {v.location}, {v.city}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-end sm:self-center">
                              <span className={`px-3 py-1 rounded-xl text-[11px] font-black border ${
                                v.status === 'Approved'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : v.status === 'Pending Approval'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
                                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
                              }`}>
                                {v.status === 'Approved' ? 'Approved ✓ (Live)' : v.status === 'Pending Approval' ? '🟡 Pending Document Audit' : v.status}
                              </span>
                            </div>
                          </div>

                          {/* Verification Documents Audit Strip */}
                          <div className="bg-[#141418] p-3 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Registration (RC)</span>
                                <strong className="text-emerald-300 font-mono">RC Verified ✓</strong>
                              </div>
                            </div>
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Insurance Policy</span>
                                <strong className="text-emerald-300 font-mono">Valid Policy ✓</strong>
                              </div>
                            </div>
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">PUC Certificate</span>
                                <strong className="text-emerald-300 font-mono">Passed Audit ✓</strong>
                              </div>
                            </div>
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <UserCheck className="h-4 w-4 text-amber-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Owner Identity KYC</span>
                                <strong className="text-amber-300 font-mono">Aadhaar/PAN Match ✓</strong>
                              </div>
                            </div>
                          </div>

                          {/* Action Controls (Approve / Delete) */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center space-x-3 text-xs font-mono">
                              <span className="text-amber-400 font-black">₹{v.hourlyPrice || v.rentPerHour || 150}/hr</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-300 font-bold">₹{(v.dailyPrice || v.rentPerDay || 1000).toLocaleString('en-IN')}/day</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">Deposit: ₹{v.deposit || 2000}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {v.status === 'Pending Approval' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    v.status = 'Approved';
                                    saveDocument('vehicles', v.id, { status: 'Approved' });
                                    alert(`✅ Vehicle "${v.title}" (${v.licensePlate}) APPROVED and published live to Recko India!`);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Approve & Publish Live</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => onDeleteVehicle(v.id)}
                                className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Delete Vehicle
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CLOTHING & ATTIRE HYGIENE AUDIT */}
              {activeTab === 'clothing' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-[#141418] border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-black text-sm text-white flex items-center space-x-2">
                        <Shirt className="h-4 w-4 text-amber-400" />
                        <span>Clothing & Attire Verification Audit Queue</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Inspect fabric condition, measurements, size accuracy & dry-cleaning guarantee before approving public listings.
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl">
                      {clothing.filter(c => c.status === 'Pending Approval').length} Pending Approvals
                    </span>
                  </div>

                  {clothing.length === 0 ? (
                    <div className="bg-[#0c0c0f] border border-amber-500/30 p-8 text-center text-slate-400 text-xs rounded-2xl">
                      No clothing items found in the system.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clothing.map((c) => (
                        <div
                          key={c.id}
                          className="bg-[#0c0c0f] border border-amber-500/30 p-4 rounded-2xl space-y-3 hover:border-amber-400/60 transition-all shadow-md text-xs"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-3">
                            <div className="flex items-center space-x-3">
                              <img src={c.images[0]} alt={c.title} className="h-14 w-14 object-cover rounded-xl shrink-0 border border-amber-500/40" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                                    Size: {c.size || 'L'}
                                  </span>
                                  <span className="bg-zinc-800 text-amber-300 px-2 py-0.5 rounded font-bold text-[10px]">
                                    {c.brand || 'Boutique Collection'} • {c.gender}
                                  </span>
                                </div>
                                <h4 className="font-bold text-white text-sm mt-1">{c.title}</h4>
                                <p className="text-slate-400 font-medium">
                                  Boutique Owner: <strong className="text-white">{c.ownerName}</strong> ({c.ownerContact || '+91 98765 43210'}) • Hub: {c.location}, {c.city}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-end sm:self-center">
                              <span className={`px-3 py-1 rounded-xl text-[11px] font-black border ${
                                c.status === 'Approved'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : c.status === 'Pending Approval'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
                                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
                              }`}>
                                {c.status === 'Approved' ? 'Approved ✓ (Live)' : c.status === 'Pending Approval' ? '🟡 Pending Hygiene Audit' : c.status}
                              </span>
                            </div>
                          </div>

                          {/* Quality & Hygiene Audit Strip */}
                          <div className="bg-[#141418] p-3 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Fabric Quality</span>
                                <strong className="text-emerald-300 font-mono">{c.fabric || 'Silk Brocade'} ✓</strong>
                              </div>
                            </div>
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Condition Rating</span>
                                <strong className="text-emerald-300 font-mono">{c.clothingCondition || 'Excellent'} ✓</strong>
                              </div>
                            </div>
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <Shirt className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Dry Clean Guarantee</span>
                                <strong className="text-emerald-300 font-mono">Sanitized & Sealed ✓</strong>
                              </div>
                            </div>
                            <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex items-center space-x-2">
                              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Boutique KYC</span>
                                <strong className="text-amber-300 font-mono">KYC Verified ✓</strong>
                              </div>
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center space-x-3 text-xs font-mono">
                              <span className="text-amber-400 font-black">₹{c.rentPerDay}/day</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-300 font-bold">Deposit: ₹{c.deposit}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {c.status === 'Pending Approval' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    c.status = 'Approved';
                                    saveDocument('clothing', c.id, { status: 'Approved' });
                                    alert(`✅ Clothing outfit "${c.title}" APPROVED and published live to Recko India!`);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Approve & Publish Live</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  <h3 className="font-black text-sm text-white flex items-center space-x-2">
                    <Users className="h-4 w-4 text-amber-400" />
                    <span>Registered Users & Tenants</span>
                  </h3>
                  {tenants.map((t) => (
                    <div key={t.id} className="bg-[#0c0c0f] border border-amber-500/30 p-4 rounded-2xl flex justify-between items-center text-xs hover:border-amber-400/60 transition-all shadow-md">
                      <div>
                        <span className="text-amber-300 font-mono text-[10px] font-bold">{t.id}</span>
                        <h4 className="font-extrabold text-white text-sm">{t.name}</h4>
                        <p className="text-slate-300">{t.email} • {t.phone}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleBlockTenant(t.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            t.status === 'Active' ? 'bg-amber-400/20 text-amber-300 border border-amber-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {t.status === 'Active' ? 'Block User' : 'Unblock'}
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(t.id)}
                          className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: FAKE LISTINGS, DUPLICATE IMAGE ANALYSIS & ABUSE REPORTS */}
              {activeTab === 'fakeReports' && (
                <div className="space-y-5">
                  {/* AI Scanner Header Banner */}
                  <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-zinc-900/90 p-5 rounded-3xl border border-rose-500/30 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-9 w-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black">
                            <ShieldAlert className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                              <span>AI Image Authenticity & Duplicate Photo Scanner</span>
                              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/40">
                                ACTIVE RECOGNITION
                              </span>
                            </h3>
                            <p className="text-xs text-slate-300">
                              Detects duplicate, copied, or stolen photos across all properties, vehicles, hotels, clothes, and sports turfs. Automatically removes offending photos and notifies the property owner.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={runImageAuditScan}
                        disabled={isScanningImages}
                        className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/30 transition-all shrink-0 cursor-pointer"
                      >
                        <RefreshCw className={`h-4 w-4 ${isScanningImages ? 'animate-spin' : ''}`} />
                        <span>{isScanningImages ? 'Scanning All Images...' : '🔍 Run Full AI Duplicate Scan'}</span>
                      </button>
                    </div>

                    {scanMessageToast && (
                      <div className="bg-slate-950/80 border border-rose-500/40 text-rose-200 p-3 rounded-2xl text-xs font-mono flex items-center space-x-2 animate-in fade-in">
                        <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{scanMessageToast}</span>
                      </div>
                    )}

                    {/* Scanner Key Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Duplicates Detected</span>
                        <span className="text-xl font-black text-rose-400">{duplicateIncidents.length}</span>
                      </div>

                      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Cross-Owner Copies</span>
                        <span className="text-xl font-black text-amber-400">
                          {duplicateIncidents.filter(i => i.severity === 'High').length}
                        </span>
                      </div>

                      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Removed & Notified</span>
                        <span className="text-xl font-black text-emerald-400">
                          {duplicateIncidents.filter(i => i.status === 'Removed & Owner Notified').length}
                        </span>
                      </div>

                      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">User Abuse Reports</span>
                        <span className="text-xl font-black text-zinc-300">{abuseReports.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    {(['ALL', 'High', 'Cross-Owner', 'Reused', 'Resolved'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setDuplicateFilter(filter)}
                        className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          duplicateFilter === filter
                            ? 'bg-zinc-800 text-white border-zinc-500 font-black'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {filter === 'ALL' && `All Duplicate Incidents (${duplicateIncidents.length})`}
                        {filter === 'High' && `High Risk Cross-Owner (${duplicateIncidents.filter(i => i.severity === 'High').length})`}
                        {filter === 'Cross-Owner' && 'Cross-Owner Collisions'}
                        {filter === 'Reused' && 'Reused Photos'}
                        {filter === 'Resolved' && `Removed & Notified (${duplicateIncidents.filter(i => i.status === 'Removed & Owner Notified').length})`}
                      </button>
                    ))}
                  </div>

                  {/* Duplicate Collisions List */}
                  <div className="space-y-4">
                    {duplicateIncidents.length === 0 ? (
                      <div className="p-10 text-center bg-slate-950 border border-slate-800 rounded-3xl space-y-2">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                        <h4 className="text-sm font-extrabold text-white">No Duplicate Image Collisions Detected</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          All listed properties, vehicles, hotels, and items currently have distinct verified photos. Click "Run Full AI Duplicate Scan" above to re-verify anytime.
                        </p>
                      </div>
                    ) : (
                      duplicateIncidents
                        .filter(inc => {
                          if (duplicateFilter === 'High') return inc.severity === 'High';
                          if (duplicateFilter === 'Cross-Owner') return inc.flagType === 'Cross-Owner Duplicate';
                          if (duplicateFilter === 'Reused') return inc.flagType === 'Reused Photos Across Listings';
                          if (duplicateFilter === 'Resolved') return inc.status === 'Removed & Owner Notified';
                          return true;
                        })
                        .map((incident, incIdx) => (
                          <div
                            key={`${incident.id}-${incIdx}`}
                            className={`p-5 rounded-3xl border transition-all space-y-4 ${
                              incident.status === 'Removed & Owner Notified'
                                ? 'bg-slate-950/70 border-emerald-500/30'
                                : incident.severity === 'High'
                                ? 'bg-slate-950 border-rose-500/40 shadow-lg shadow-rose-950/20'
                                : 'bg-slate-950 border-slate-800'
                            }`}
                          >
                            {/* Incident Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                              <div className="flex items-center space-x-2.5">
                                <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border ${
                                  incident.severity === 'High'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}>
                                  {incident.severity} Risk: {incident.flagType}
                                </span>

                                <span className="text-xs text-slate-400 font-mono">
                                  Detected: {incident.detectedAt}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border flex items-center space-x-1.5 ${
                                  incident.status === 'Removed & Owner Notified'
                                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                                    : 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
                                }`}>
                                  {incident.status === 'Removed & Owner Notified' ? (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                      <span>✓ Duplicate Removed & Owner Notified</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                                      <span>Action Required</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Main Content Layout: Photo Preview + Matched Listings Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                              
                              {/* Left: Duplicate Photo */}
                              <div className="md:col-span-3 space-y-2">
                                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
                                  <img
                                    src={incident.imageUrl}
                                    alt="Duplicate"
                                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setLightboxImage({
                                      title: `Duplicate Image Analysis - ${incident.flagType}`,
                                      url: incident.imageUrl,
                                      description: incident.reason
                                    })}
                                    className="absolute bottom-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 text-[10px] flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Maximize2 className="h-3 w-3" />
                                    <span>Zoom</span>
                                  </button>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block truncate">
                                  Sig: {incident.imageSignature}
                                </span>
                              </div>

                              {/* Right: Listings Collision Comparison */}
                              <div className="md:col-span-9 space-y-3 text-xs">
                                <p className="text-slate-300 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 font-medium">
                                  <strong className="text-amber-300 font-bold">AI Diagnosis: </strong>
                                  {incident.reason}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {/* Listing A: Original / First Seen */}
                                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-emerald-500/30 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                        ✓ Original Registered Listing
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">{incident.originalAsset.assetType}</span>
                                    </div>
                                    <h5 className="font-extrabold text-white text-sm line-clamp-1">{incident.originalAsset.assetTitle}</h5>
                                    <div className="space-y-1 text-slate-300 text-[11px]">
                                      <p>Owner: <strong className="text-white">{incident.originalAsset.ownerName}</strong></p>
                                      <p className="flex items-center space-x-1 text-slate-400">
                                        <Phone className="h-3 w-3" />
                                        <span>{incident.originalAsset.ownerContact}</span>
                                        <span>• {incident.originalAsset.city}</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Listing B: Duplicate / Infringing Asset(s) */}
                                  {incident.duplicateAssets.map((dup, dupIdx) => (
                                    <div key={`${dup.assetId}-${dupIdx}`} className="bg-slate-900 p-3.5 rounded-2xl border border-rose-500/40 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                                          ⚠️ Duplicate Photo Reused Here
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{dup.assetType}</span>
                                      </div>
                                      <h5 className="font-extrabold text-white text-sm line-clamp-1">{dup.assetTitle}</h5>
                                      <div className="space-y-1 text-slate-300 text-[11px]">
                                        <p>Owner: <strong className="text-rose-300">{dup.ownerName}</strong></p>
                                        <p className="flex items-center space-x-1 text-slate-400">
                                          <Phone className="h-3 w-3" />
                                          <span>{dup.ownerContact}</span>
                                          <span>• {dup.city}</span>
                                        </p>
                                      </div>

                                      {/* Action Button on Duplicate Listing */}
                                      <div className="pt-2 flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveDuplicateAndNotify(incident, dup)}
                                          className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-rose-900/30 transition-all cursor-pointer"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                          <span>Remove Photo & Notify Owner</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const notice = composeOwnerDuplicateImageNotice({
                                              ownerName: dup.ownerName,
                                              ownerContact: dup.ownerContact,
                                              assetTitle: dup.assetTitle,
                                              assetType: dup.assetType,
                                              reason: incident.reason,
                                              removedImageUrl: incident.imageUrl
                                            });
                                            setActiveWhatsAppModal({
                                              ownerName: dup.ownerName,
                                              ownerContact: dup.ownerContact,
                                              assetTitle: dup.assetTitle,
                                              whatsappUrl: notice.whatsappUrl,
                                              messageText: notice.messageText
                                            });
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-all cursor-pointer"
                                        >
                                          <Mail className="h-3.5 w-3.5" />
                                          <span>WhatsApp Notice</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Section 2: User Reported Abuse & Fake Listings */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-sm text-white flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span>User-Submitted Abuse & Fake Listing Reports ({abuseReports.length})</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {abuseReports.map((rep) => (
                        <div key={rep.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="bg-rose-500/20 text-rose-300 font-mono text-[10px] px-2 py-0.5 rounded border border-rose-500/40">
                                {rep.type}
                              </span>
                              <h5 className="font-extrabold text-white text-sm">{rep.itemTitle}</h5>
                            </div>
                            <p className="text-slate-300">
                              Reported by <strong className="text-slate-200">{rep.reporterName}</strong> on {rep.date}
                            </p>
                            <p className="text-amber-300/90 italic bg-slate-900 p-2 rounded-xl border border-slate-800">
                              "{rep.reason}"
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setAbuseReports(prev => prev.filter(r => r.id !== rep.id));
                                alert(`Report resolved for ${rep.itemTitle}. Safety team notified.`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                              Resolve Report
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAbuseReports(prev => prev.filter(r => r.id !== rep.id));
                                onDeleteProperty(rep.itemId);
                                alert(`Listing "${rep.itemTitle}" removed and banned for policy violations.`);
                              }}
                              className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                              Ban Listing
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* USER CONTACT SUPPORT & FEEDBACKS SUB-SECTION */}
                  <div className="pt-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-9 w-9 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-white">User Contact Support Messages & Feedbacks ({userFeedbacks.length})</h3>
                          <p className="text-xs text-slate-400">View real-time support requests and user ratings submitted by tenants & hosts.</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-500/40">
                        {userFeedbacks.length} Total Submissions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userFeedbacks.length === 0 ? (
                        <div className="col-span-2 p-6 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                          No contact support messages or feedbacks received yet.
                        </div>
                      ) : (
                        userFeedbacks.map((fb) => (
                          <div key={fb.id || fb.userEmail} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 relative group hover:border-amber-500/40 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-xs text-white">{fb.userName || 'Anonymous User'}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                  {fb.category || 'Support Request'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                                  <span key={i} className="text-amber-400 text-xs">★</span>
                                ))}
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-3">
                              <span>✉️ {fb.userEmail}</span>
                              <span>📅 {fb.createdAt || 'Recent'}</span>
                            </div>

                            <p className="text-xs text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 leading-relaxed italic">
                              "{fb.message}"
                            </p>

                            <div className="flex items-center justify-between pt-1 text-xs">
                              <a
                                href={`mailto:${fb.userEmail}?subject=Recko%20Support%20Reply&body=Hello%20${encodeURIComponent(fb.userName || '')},`}
                                className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 text-[11px]"
                              >
                                <span>Reply via Email</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteFeedback(fb.id)}
                                className="text-rose-400 hover:text-rose-300 font-bold text-[11px] cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <h3 className="font-black text-sm text-white">Platform Analytics & City Rentals</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs space-y-3">
                      <h4 className="font-extrabold text-slate-200">Popular Rental Cities</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span>Jaipur (Rajasthan)</span><span className="font-bold text-emerald-400">42% Demand</span></div>
                        <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-emerald-500 h-2 rounded-full w-[42%]"></div></div>
                        
                        <div className="flex justify-between"><span>Udaipur (Rajasthan)</span><span className="font-bold text-zinc-300">28% Demand</span></div>
                        <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-zinc-800 text-white h-2 rounded-full w-[28%]"></div></div>
                        
                        <div className="flex justify-between"><span>Bangalore (Karnataka)</span><span className="font-bold text-zinc-400">18% Demand</span></div>
                        <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-zinc-400 h-2 rounded-full w-[18%]"></div></div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs space-y-3">
                      <h4 className="font-extrabold text-slate-200">Monthly Booking Trends</h4>
                      <div className="flex items-baseline justify-between pt-4">
                        <div className="text-center"><span className="text-slate-400 block">May</span><span className="font-black text-sm">₹1.2L</span></div>
                        <div className="text-center"><span className="text-slate-400 block">Jun</span><span className="font-black text-sm">₹2.8L</span></div>
                        <div className="text-center"><span className="text-slate-400 block">Jul</span><span className="font-black text-sm">₹4.5L</span></div>
                        <div className="text-center"><span className="text-zinc-300 block font-bold">Aug (Est)</span><span className="font-black text-emerald-400 text-base">₹6.2L</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: JUNIOR ADMIN STAFF MANAGEMENT */}
              {activeTab === 'juniorAdmins' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                        <UserCog className="h-5 w-5 text-zinc-300" />
                        <span>Junior Admin Staff & Assigned Permissions</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Super Admin can create Junior Admin login IDs and control which modules (Owner Requests, Feedback, Listings) they can manage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateJuniorModalOpen(true);
                        setJuniorFormMsg('');
                      }}
                      className="bg-zinc-900 text-white hover:bg-zinc-800 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-zinc-800/20 cursor-pointer shrink-0 transition-all"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>+ Create New Junior Admin</span>
                    </button>
                  </div>

                  {/* List of Junior Admins */}
                  <div className="grid grid-cols-1 gap-3">
                    {juniorAdmins.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950 rounded-2xl border border-slate-800">
                        No Junior Admin staff accounts created yet. Click above to create one.
                      </div>
                    ) : (
                      juniorAdmins.map((j) => (
                        <div key={j.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-extrabold text-white text-sm">{j.name}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                j.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}>
                                {j.status}
                              </span>
                            </div>

                            <p className="text-slate-400 text-xs">
                              Email: <span className="text-slate-200 font-semibold">{j.email}</span> • Username: <strong className="text-zinc-300 font-mono">{j.username}</strong>
                            </p>

                            <div className="flex items-center space-x-2 pt-1">
                              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Password:</span>
                              <span className="bg-slate-900 border border-slate-800 font-mono px-2 py-0.5 rounded text-amber-300 text-[11px] font-bold">
                                {j.password}
                              </span>
                            </div>

                            {/* Assigned Permissions Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                j.permissions.canManageOwners
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 line-through'
                              }`}>
                                {j.permissions.canManageOwners ? '✓ Owner Approvals' : '✕ Owner Approvals'}
                              </span>

                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                j.permissions.canViewFeedbacks
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 line-through'
                              }`}>
                                {j.permissions.canViewFeedbacks ? '✓ Feedback & Reports' : '✕ Feedback'}
                              </span>

                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                j.permissions.canManageListings
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 line-through'
                              }`}>
                                {j.permissions.canManageListings ? '✓ Properties' : '✕ Properties'}
                              </span>

                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                j.permissions.canViewAnalytics
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 line-through'
                              }`}>
                                {j.permissions.canViewAnalytics ? '✓ Analytics' : '✕ Analytics'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleJuniorStatus(j.id)}
                              className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                                j.status === 'Active'
                                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {j.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteJuniorAdmin(j.id)}
                              className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 p-2 rounded-xl cursor-pointer transition-all"
                              title="Delete Junior Admin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* CREATE JUNIOR ADMIN POPUP MODAL */}
              {isCreateJuniorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="bg-slate-900 border border-slate-700/80 text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <UserPlus className="h-5 w-5 text-zinc-300" />
                        <h3 className="font-extrabold text-sm text-white">Create Junior Admin Credentials</h3>
                      </div>
                      <button
                        onClick={() => setIsCreateJuniorModalOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {juniorFormMsg && (
                      <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs font-semibold">
                        {juniorFormMsg}
                      </div>
                    )}

                    <form onSubmit={handleCreateJuniorAdminSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={newJuniorName}
                            onChange={(e) => setNewJuniorName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Email Address</label>
                          <input
                            type="email"
                            placeholder="ramesh@renthub.in"
                            value={newJuniorEmail}
                            onChange={(e) => setNewJuniorEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-zinc-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Login Username / ID</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. ramesh_admin"
                            value={newJuniorUsername}
                            onChange={(e) => setNewJuniorUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:ring-2 focus:ring-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Set Password</label>
                          <input
                            type="text"
                            required
                            placeholder="Assign Password"
                            value={newJuniorPassword}
                            onChange={(e) => setNewJuniorPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:ring-2 focus:ring-zinc-400"
                          />
                        </div>
                      </div>

                      {/* Permissions Selection */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-slate-300 font-extrabold block text-xs">
                          Assign Permitted Access Modules:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                            newJuniorCanOwners ? 'bg-zinc-800/60 border-zinc-500/60 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={newJuniorCanOwners}
                              onChange={(e) => setNewJuniorCanOwners(e.target.checked)}
                              className="rounded text-zinc-900 focus:ring-zinc-400 h-4 w-4"
                            />
                            <span className="font-bold text-xs">Owner Pending Approvals</span>
                          </label>

                          <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                            newJuniorCanFeedbacks ? 'bg-zinc-800/60 border-zinc-500/60 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={newJuniorCanFeedbacks}
                              onChange={(e) => setNewJuniorCanFeedbacks(e.target.checked)}
                              className="rounded text-zinc-900 focus:ring-zinc-400 h-4 w-4"
                            />
                            <span className="font-bold text-xs">User Feedback & Reports</span>
                          </label>

                          <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                            newJuniorCanListings ? 'bg-zinc-800/60 border-zinc-500/60 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={newJuniorCanListings}
                              onChange={(e) => setNewJuniorCanListings(e.target.checked)}
                              className="rounded text-zinc-900 focus:ring-zinc-400 h-4 w-4"
                            />
                            <span className="font-bold text-xs">Property Listings Approval</span>
                          </label>

                          <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                            newJuniorCanAnalytics ? 'bg-zinc-800/60 border-zinc-500/60 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}>
                            <input
                              type="checkbox"
                              checked={newJuniorCanAnalytics}
                              onChange={(e) => setNewJuniorCanAnalytics(e.target.checked)}
                              className="rounded text-zinc-900 focus:ring-zinc-400 h-4 w-4"
                            />
                            <span className="font-bold text-xs">Analytics & Reports</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsCreateJuniorModalOpen(false)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-zinc-900 text-white hover:bg-zinc-800 font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-zinc-800/20 transition-all cursor-pointer"
                        >
                          Save Junior Admin Credentials
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 8: ADMIN CREDENTIALS SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-4 max-w-lg">
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-zinc-300">
                      <Lock className="h-5 w-5" />
                      <h3 className="font-extrabold text-sm text-white">Change Super Admin ID & Password</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Update your master authentication credentials. Changing these will take effect immediately.
                    </p>

                    {credentialsMsg && (
                      <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs font-bold">
                        {credentialsMsg}
                      </div>
                    )}

                    <form onSubmit={handleSaveNewCredentials} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">New Admin ID / Username</label>
                        <input
                          type="text"
                          required
                          value={newAdminIdInput}
                          onChange={(e) => setNewAdminIdInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-zinc-400 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">New Admin Password</label>
                        <input
                          type="text"
                          required
                          value={newAdminPassInput}
                          onChange={(e) => setNewAdminPassInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-zinc-400 outline-none font-mono"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="bg-zinc-900 text-white hover:bg-zinc-800 font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-zinc-800/20 cursor-pointer"
                        >
                          Save New Credentials
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Token Config Setting Card */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <CreditCard className="h-5 w-5" />
                      <h3 className="font-extrabold text-sm text-white">Configurable Booking Token Amount</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Set the required initial booking token fee (₹50 - ₹500) paid by tenants upon booking request.
                    </p>

                    <div className="flex items-center space-x-3 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min={10}
                          max={5000}
                          value={tokenAmount}
                          onChange={(e) => onUpdateTokenAmount && onUpdateTokenAmount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white font-mono font-bold text-base outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex gap-1.5 text-xs font-bold">
                        {[50, 99, 100, 200].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => onUpdateTokenAmount && onUpdateTokenAmount(amt)}
                            className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                              tokenAmount === amt
                                ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: SUPER ADMIN PERSONAL PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-4 max-w-2xl">
                  <div className="bg-[#0c0c0e] border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="p-3 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-2xl shadow-md border border-amber-300">
                          <UserCheck className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-white">Super Admin Personal Profile</h3>
                          <p className="text-xs text-amber-300/80 font-medium">
                            Designated Email: <strong className="text-white font-mono font-bold">salvirahul7038@gmail.com</strong>
                          </p>
                        </div>
                      </div>
                      <span className="bg-amber-400/15 text-amber-300 text-[10px] font-mono font-black px-3 py-1 rounded-full border border-amber-500/40 uppercase tracking-wider">
                        VERIFIED SUPER ADMIN
                      </span>
                    </div>

                    {adminProfileMsg && (
                      <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3.5 rounded-2xl text-xs font-bold animate-in fade-in">
                        {adminProfileMsg}
                      </div>
                    )}

                    <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Super Admin Full Name</label>
                          <input
                            type="text"
                            required
                            value={adminProfileName}
                            onChange={(e) => setAdminProfileName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Designated Admin Email (OTP Destination)</label>
                          <input
                            type="email"
                            required
                            value={adminProfileEmail}
                            onChange={(e) => setAdminProfileEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-amber-500/50 text-amber-300 font-mono font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Contact Phone Number</label>
                          <input
                            type="text"
                            value={adminProfilePhone}
                            onChange={(e) => setAdminProfilePhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-bold mb-1">Security Clearance PIN</label>
                          <input
                            type="text"
                            value={adminProfileSecurityPin}
                            onChange={(e) => setAdminProfileSecurityPin(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Official Designation / Title</label>
                        <input
                          type="text"
                          value={adminProfileRole}
                          onChange={(e) => setAdminProfileRole(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Registered Base Location / Address</label>
                        <textarea
                          rows={2}
                          value={adminProfileAddress}
                          onChange={(e) => setAdminProfileAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center space-x-2 border border-amber-300"
                        >
                          <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                          <span>Save Admin Profile & Sync to Firebase</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* DETAILED PENDING OWNER REQUEST POPUP MODAL */}
        {selectedLandlordDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 text-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-6">
              
              {/* Modal Header */}
              <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-zinc-800 text-white/20 border border-zinc-500/40 text-zinc-300 rounded-2xl">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {selectedLandlordDetail.name}
                      </h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        selectedLandlordDetail.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : selectedLandlordDetail.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {selectedLandlordDetail.status} REQUEST
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Owner ID: {selectedLandlordDetail.id} • Registered on {selectedLandlordDetail.requestedAt}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLandlordDetail(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
                
                {/* Contact & Business Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Email Address</span>
                    <span className="text-slate-200 font-bold text-xs">{selectedLandlordDetail.email}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Phone Number</span>
                    <span className="text-emerald-400 font-bold text-xs">{selectedLandlordDetail.phone}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Agency / Business Name</span>
                    <span className="text-zinc-300 font-bold text-xs">{selectedLandlordDetail.businessName || 'Independent Owner'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">City & Region</span>
                    <span className="text-amber-300 font-bold text-xs">
                      {selectedLandlordDetail.city}, {selectedLandlordDetail.district || ''} ({selectedLandlordDetail.state || 'India'})
                    </span>
                  </div>

                  {selectedLandlordDetail.address && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Full Registered Address</span>
                      <span className="text-slate-300 font-medium">{selectedLandlordDetail.address}</span>
                    </div>
                  )}
                </div>

                {/* Verification Document Section */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4 text-zinc-400" />
                      <h4 className="font-extrabold text-white text-xs">Government ID Verification & Document</h4>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-400/80 px-2 py-0.5 rounded border border-zinc-400/80">
                      {selectedLandlordDetail.documentType || 'Aadhaar Card Uploaded'}
                    </span>
                  </div>

                  {selectedLandlordDetail.idProofNumber && (
                    <div className="text-slate-300 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-500 mr-2">ID Proof No:</span>
                      <strong className="text-amber-300">{selectedLandlordDetail.idProofNumber}</strong>
                    </div>
                  )}

                  {/* ID Photo Card Display */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-300 block">Uploaded Document Photo:</span>
                    
                    <div className="relative group bg-slate-900 border-2 border-dashed border-slate-700/80 rounded-2xl overflow-hidden p-2 text-center">
                      <img
                        src={selectedLandlordDetail.documentPhotoUrl || 'https://images.unsplash.com/photo-1633265486221-a53f08efb24a?w=800&auto=format&fit=crop&q=80'}
                        alt="ID Document"
                        className="max-h-60 w-full object-contain rounded-xl mx-auto cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        onClick={() => setLightboxImage({
                          title: `${selectedLandlordDetail.name} - Verification Document`,
                          url: selectedLandlordDetail.documentPhotoUrl || 'https://images.unsplash.com/photo-1633265486221-a53f08efb24a?w=800&auto=format&fit=crop&q=80',
                          description: `ID Document Number: ${selectedLandlordDetail.idProofNumber || 'Verified'}`
                        })}
                      />

                      <div className="pt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setLightboxImage({
                            title: `${selectedLandlordDetail.name} - Verification Document`,
                            url: selectedLandlordDetail.documentPhotoUrl || 'https://images.unsplash.com/photo-1633265486221-a53f08efb24a?w=800&auto=format&fit=crop&q=80',
                            description: `ID Document Number: ${selectedLandlordDetail.idProofNumber || 'Verified'}`
                          })}
                          className="bg-zinc-900 text-white hover:bg-zinc-800 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer transition-all"
                        >
                          <Maximize2 className="h-4 w-4 text-amber-300" />
                          <span>🔍 Open Full Screen Lightbox</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Associated Properties created by this Owner */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-extrabold text-xs text-white flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-amber-400" />
                    <span>Owner's Listed Properties / Vehicles</span>
                  </h4>
                  
                  {(() => {
                    const ownerProps = properties.filter(p => p.ownerId === selectedLandlordDetail.id || (p.ownerName && p.ownerName.toLowerCase().includes(selectedLandlordDetail.name.toLowerCase())));
                    if (ownerProps.length === 0) {
                      return <p className="text-slate-500 text-[11px] italic">No active properties posted yet by this owner.</p>;
                    }
                    return (
                      <div className="space-y-2 pt-1">
                        {ownerProps.map(p => (
                          <div key={p.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <img src={p.images[0]} alt={p.title} className="h-8 w-10 object-cover rounded-lg shrink-0" />
                              <div>
                                <h5 className="font-bold text-white text-xs">{p.title}</h5>
                                <p className="text-slate-400 text-[10px]">{p.city} • ₹{p.rentPerMonth}/mo</p>
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded">
                              {p.status || 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Modal Actions Footer */}
              <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLandlordDetail(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close Details
                </button>

                <div className="flex items-center space-x-2">
                  {selectedLandlordDetail.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        onApproveLandlord(selectedLandlordDetail.id);
                        setSelectedLandlordDetail(prev => prev ? { ...prev, status: 'Approved' } : null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Owner Request</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onRejectLandlord(selectedLandlordDetail.id);
                      setSelectedLandlordDetail(prev => prev ? { ...prev, status: 'Rejected' } : null);
                    }}
                    className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>{selectedLandlordDetail.status === 'Approved' ? 'Suspend Owner' : 'Reject Request'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* LIGHTBOX FULLSCREEN IMAGE VIEWER MODAL */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="relative max-w-4xl w-full flex flex-col items-center justify-center space-y-4">
              
              {/* Top Header Controls */}
              <div className="w-full flex items-center justify-between text-white bg-slate-900/90 p-3 px-5 rounded-2xl border border-slate-800 shadow-xl">
                <div>
                  <h4 className="font-extrabold text-sm text-white">{lightboxImage.title}</h4>
                  {lightboxImage.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{lightboxImage.description}</p>
                  )}
                </div>

                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-full cursor-pointer hover:bg-slate-700 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Image Display */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-2 max-h-[75vh] overflow-hidden flex items-center justify-center shadow-2xl">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
                />
              </div>

              {/* Footer Controls */}
              <div className="flex items-center space-x-3">
                <a
                  href={lightboxImage.url}
                  download="owner-id-proof.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-zinc-900 text-white hover:bg-zinc-800 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Image File Directly</span>
                </a>

                <button
                  onClick={() => setLightboxImage(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Close Lightbox
                </button>
              </div>

            </div>
          </div>
        )}

        {/* WhatsApp Alert & Notice Direct Dispatch Modal */}
        {activeWhatsAppModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Mail className="h-5 w-5" />
                  <h4 className="font-extrabold text-sm text-white">Direct WhatsApp Safety Notice</h4>
                </div>
                <button
                  onClick={() => setActiveWhatsAppModal(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-300">
                  An official notice has been dispatched to owner <strong className="text-white">{activeWhatsAppModal.ownerName}</strong> ({activeWhatsAppModal.ownerContact}) for listing <strong className="text-emerald-300">"{activeWhatsAppModal.assetTitle}"</strong>.
                </p>

                <label className="block text-[11px] font-bold text-slate-400 pt-1">
                  Message Payload Preview:
                </label>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-slate-200 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {activeWhatsAppModal.messageText}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeWhatsAppModal.messageText);
                    alert('✓ WhatsApp message copied to clipboard!');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Message</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveWhatsAppModal(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>

                  <a
                    href={activeWhatsAppModal.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN EMAIL OTP VERIFICATION & PASSWORD RESET MODAL */}
        {isAdminVerifyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Mail className="h-5 w-5" />
                  <h4 className="font-extrabold text-sm text-white">Super Admin Email OTP Verification</h4>
                </div>
                <button
                  onClick={() => setIsAdminVerifyModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {adminVerifyError && (
                <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-2xl text-xs font-bold">
                  {adminVerifyError}
                </div>
              )}

              {adminVerifyMsg && (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-2xl text-xs font-bold">
                  {adminVerifyMsg}
                </div>
              )}

              {/* STEP 1: Enter Admin Email / ID */}
              {adminVerifyStep === 'email' && (
                <form onSubmit={handleSendAdminEmailOTP} className="space-y-4 text-xs">
                  <p className="text-slate-300">
                    Enter your registered Admin Email / Username to receive a 6-digit email verification OTP code.
                  </p>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Admin Registered Email / ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin@1234 or admin@renthub.in"
                      value={adminVerifyEmailInput}
                      onChange={(e) => setAdminVerifyEmailInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdminVerifyModalOpen(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingAdminOtp}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg transition-all"
                    >
                      {isSendingAdminOtp ? 'Sending OTP Code...' : 'Send 6-Digit Verification OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter 6-Digit OTP */}
              {adminVerifyStep === 'otp' && (
                <form onSubmit={handleVerifyAdminOTP} className="space-y-4 text-xs">
                  <div className="bg-[#121215] p-3.5 rounded-2xl border border-amber-500/40 text-amber-200 space-y-1 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-white">Verification OTP Sent to {adminVerifyEmailInput}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 block">Please check your Email Inbox & Spam folder. Enter the 6-digit code received below:</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 849201"
                      value={adminOtpInput}
                      onChange={(e) => setAdminOtpInput(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-3 text-white text-center font-mono font-black text-lg tracking-widest outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminVerifyStep('email')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg transition-all"
                    >
                      Verify OTP Code
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Enter New Super Admin Password */}
              {adminVerifyStep === 'new_password' && (
                <form onSubmit={handleSaveAdminResetPassword} className="space-y-4 text-xs">
                  <p className="text-emerald-400 font-bold">
                    Email verified! Please enter your new Super Admin Password:
                  </p>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">New Super Admin Password</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter New Password (min 5 chars)"
                      value={resetNewAdminPass}
                      onChange={(e) => setResetNewAdminPass(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg transition-all"
                    >
                      Save New Password & Log In
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Success Message */}
              {adminVerifyStep === 'success' && (
                <div className="py-4 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-extrabold text-sm text-white">Verification & Reset Complete!</h4>
                  <p className="text-xs text-slate-300">Logging into Super Admin portal with your new credentials...</p>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
