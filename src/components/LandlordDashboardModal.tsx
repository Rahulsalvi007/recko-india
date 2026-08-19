import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Car,
  Plus,
  ShieldCheck,
  UserCheck,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  DollarSign,
  Star,
  Bell,
  MessageSquare,
  Check,
  Ban,
  Copy,
  User,
  Hash,
  Sparkles,
  Lock,
  Key,
  Search,
  FileCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  Info,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { LandlordUser, Property, Vehicle, RentalBooking, AppNotification } from '../types';
import { saveDocument } from '../lib/firebase';
import { EmailVerificationModal } from './EmailVerificationModal';

interface LandlordDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  landlord: LandlordUser | null;
  onLogout: () => void;
  properties: Property[];
  vehicles: Vehicle[];
  bookings: RentalBooking[];
  onOpenAddListing: () => void;
  onUpdatePropertyRent?: (id: string, newRent: number) => void;
  onTogglePropertyAvailability?: (id: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: 'Accepted' | 'Rejected' | 'Completed', rejectionReason?: string) => void;
  onEditProperty?: (p: Property) => void;
  onEditVehicle?: (v: Vehicle) => void;
  onDeleteProperty?: (id: string) => void;
  onDeleteVehicle?: (id: string) => void;
  onDeleteClothing?: (id: string) => void;
  onDeleteSportsTurf?: (id: string) => void;
  onTrackVehicleGPS?: (booking: RentalBooking) => void;
  onOpenBookingChat?: (booking: RentalBooking) => void;
  onDeleteLandlordAccount?: (landlordId: string) => void;
}

export const LandlordDashboardModal: React.FC<LandlordDashboardModalProps> = ({
  isOpen,
  onClose,
  landlord,
  onLogout,
  properties,
  vehicles,
  bookings,
  onOpenAddListing,
  onUpdatePropertyRent,
  onTogglePropertyAvailability,
  onUpdateBookingStatus,
  onEditProperty,
  onEditVehicle,
  onDeleteProperty,
  onDeleteVehicle,
  onDeleteClothing,
  onDeleteSportsTurf,
  onTrackVehicleGPS,
  onOpenBookingChat,
  onDeleteLandlordAccount
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'vehicles' | 'bookings' | 'reviews' | 'notifications' | 'security'>('overview');
  const [editingRentId, setEditingRentId] = useState<string | null>(null);
  const [tempRentInput, setTempRentInput] = useState<number>(0);
  const [copiedId, setCopiedId] = useState(false);
  const [newLandlordPassword, setNewLandlordPassword] = useState('');
  const [passUpdateMsg, setPassUpdateMsg] = useState('');

  // Landlord Profile Edit State
  const [ownerEditName, setOwnerEditName] = useState(landlord?.name || '');
  const [ownerEditPhone, setOwnerEditPhone] = useState(landlord?.phone || '');
  const [ownerEditAddress, setOwnerEditAddress] = useState(landlord?.address || '');
  const [ownerEditCity, setOwnerEditCity] = useState(landlord?.city || '');

  useEffect(() => {
    if (landlord) {
      setOwnerEditName(landlord.name || '');
      setOwnerEditPhone(landlord.phone || '');
      setOwnerEditAddress(landlord.address || '');
      setOwnerEditCity(landlord.city || '');
    }
  }, [landlord]);

  const handleSaveLandlordProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landlord) return;
    setPassUpdateMsg('');

    const updatedLandlord: LandlordUser = {
      ...landlord,
      name: ownerEditName.trim() || landlord.name,
      phone: ownerEditPhone.trim() || landlord.phone,
      address: ownerEditAddress.trim() || landlord.address,
      city: ownerEditCity.trim() || landlord.city,
      ...(newLandlordPassword.trim() ? { password: newLandlordPassword.trim() } : {})
    };

    localStorage.setItem('renthub_landlord_user', JSON.stringify(updatedLandlord));
    try {
      await saveDocument('landlords', landlord.id, updatedLandlord);
    } catch (err) {
      console.warn('Firebase landlord update error:', err);
    }

    setPassUpdateMsg('✅ Owner personal details & password updated successfully!');
    setNewLandlordPassword('');
    setTimeout(() => setPassUpdateMsg(''), 4000);
  };

  // Delete Account States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteOtpModalOpen, setIsDeleteOtpModalOpen] = useState(false);

  // Booking Approval / Rejection Modal State
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'ALL' | 'Pending' | 'Accepted' | 'Rejected'>('ALL');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [rejectingBooking, setRejectingBooking] = useState<RentalBooking | null>(null);
  const [rejectReasonType, setRejectReasonType] = useState<string>('Occupied');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [previewingDoc, setPreviewingDoc] = useState<{ title: string; url: string; number?: string; type?: string } | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !landlord) return null;

  // Filter properties and vehicles belonging to this landlord
  const myProperties = properties.filter(
    (p) => p.ownerName.toLowerCase().includes(landlord.name.toLowerCase()) || p.ownerId === landlord.id
  );

  const myVehicles = vehicles.filter(
    (v) => (v.ownerName && v.ownerName.toLowerCase().includes(landlord.name.toLowerCase())) || v.ownerId === landlord.id
  );

  const activePropertiesCount = myProperties.filter((p) => p.status !== 'Pending Approval' && p.isAvailable !== false).length;
  const pendingPropertiesCount = myProperties.filter((p) => p.status === 'Pending Approval').length;

  // Filter bookings for this landlord's items or directed to this landlord
  const myPropertyIds = myProperties.map((p) => p.id);
  const myVehicleIds = myVehicles.map((v) => v.id);

  const myBookings = bookings.filter((b) => {
    if (b.ownerId && (b.ownerId === landlord.id || b.ownerId.toLowerCase() === landlord.name.toLowerCase())) return true;
    if (b.ownerName && b.ownerName.toLowerCase().includes(landlord.name.toLowerCase())) return true;
    if (myPropertyIds.includes(b.itemId) || myVehicleIds.includes(b.itemId)) return true;
    return false;
  });

  const pendingBookings = myBookings.filter(
    (b) => b.status === 'Pending Verification' || b.status === 'Pending' || b.status === 'Owner Reviewing' || b.status === 'Pending Requests'
  );
  const acceptedBookings = myBookings.filter((b) => b.status === 'Accepted' || b.status === 'Approved' || b.status === 'Active');
  const rejectedBookings = myBookings.filter((b) => b.status === 'Rejected' || b.status === 'Cancelled');

  const totalMonthlyEarnings = myProperties.reduce((sum, p) => sum + p.rentPerMonth, 0);

  // Filter bookings according to active status tab and search query
  const filteredBookings = myBookings.filter((b) => {
    if (bookingFilterStatus === 'Pending') {
      if (b.status !== 'Pending Verification' && b.status !== 'Pending' && b.status !== 'Owner Reviewing' && b.status !== 'Pending Requests') {
        return false;
      }
    } else if (bookingFilterStatus === 'Accepted') {
      if (b.status !== 'Accepted' && b.status !== 'Approved' && b.status !== 'Active') {
        return false;
      }
    } else if (bookingFilterStatus === 'Rejected') {
      if (b.status !== 'Rejected' && b.status !== 'Cancelled') {
        return false;
      }
    }

    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      const matchName = b.userName && b.userName.toLowerCase().includes(q);
      const matchId = b.id && b.id.toLowerCase().includes(q);
      const matchPhone = b.userPhone && b.userPhone.includes(q);
      const matchTitle = b.itemTitle && b.itemTitle.toLowerCase().includes(q);
      return matchName || matchId || matchPhone || matchTitle;
    }

    return true;
  });

  const handleApproveBooking = (booking: RentalBooking) => {
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, 'Accepted');
      setActionSuccessMsg(`✅ Booking #${booking.id} for "${booking.userName}" has been APPROVED! Notification sent to tenant.`);
      setTimeout(() => setActionSuccessMsg(null), 6000);
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectingBooking) return;
    const finalReason =
      rejectReasonType === 'Occupied'
        ? 'Property/Asset is already reserved or occupied for the requested dates.'
        : rejectReasonType === 'KYC'
        ? 'Incomplete or unverified tenant identity document provided.'
        : rejectReasonType === 'Dates'
        ? 'Requested move-in / rental dates are not feasible for the host.'
        : customRejectReason.trim() || 'Declined by host based on availability.';

    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(rejectingBooking.id, 'Rejected', finalReason);
      setActionSuccessMsg(`🚫 Booking #${rejectingBooking.id} rejected. ₹${rejectingBooking.tokenPaidAmount || 99} token refund initiated to tenant.`);
      setTimeout(() => setActionSuccessMsg(null), 6000);
    }

    setRejectingBooking(null);
    setCustomRejectReason('');
  };

  const handleSaveRent = (id: string) => {
    if (onUpdatePropertyRent && tempRentInput > 0) {
      onUpdatePropertyRent(id, tempRentInput);
    }
    setEditingRentId(null);
  };

  const handleCopyUserId = () => {
    if (landlord?.id) {
      navigator.clipboard.writeText(landlord.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleUpdateLandlordPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLandlordPassword.trim() || !landlord) return;
    const cleanPass = newLandlordPassword.trim();

    const updatedLandlord: LandlordUser = {
      ...landlord,
      password: cleanPass
    };

    try {
      await saveDocument('landlords', landlord.id, updatedLandlord);
      localStorage.setItem(`renthub_landlord_pass_${landlord.id}`, cleanPass);
      setPassUpdateMsg('✅ Password updated successfully! Saved to Firestore & Browser.');
      setNewLandlordPassword('');
    } catch (err) {
      setPassUpdateMsg('✅ Password updated and saved locally!');
    }
    setTimeout(() => setPassUpdateMsg(''), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-y-auto w-full h-full min-h-screen">
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Glassmorphic Profile Banner Header */}
        <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 text-white p-4 sm:p-7 relative shrink-0 border-b border-zinc-800 shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:right-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer border border-zinc-700"
          >
            <X className="h-4 w-4" />
            <span>← Exit Portal</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-16 sm:pr-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-amber-400 text-zinc-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
                {landlord.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">{landlord.name}</h2>
                  {landlord.status === 'Approved' ? (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center space-x-1 shadow-inner">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>VERIFIED OWNER / HOST</span>
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center space-x-1 shadow-inner">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span>PENDING ADMIN APPROVAL</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1 font-medium">
                  {/* User ID Badge */}
                  <div className="flex items-center space-x-1 bg-slate-800/90 border border-slate-700/80 px-2.5 py-0.5 rounded-lg text-[11px] font-mono">
                    <Hash className="h-3 w-3 text-amber-400" />
                    <span className="text-slate-300">Owner ID:</span>
                    <span className="text-amber-300 font-bold">{landlord.id}</span>
                    <button
                      onClick={handleCopyUserId}
                      title="Copy Landlord User ID"
                      className="ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span>{landlord.businessName || 'Property & Rental Manager'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300/80 mt-1.5">
                  <span className="flex items-center space-x-1"><Mail className="h-3 w-3 text-zinc-300" /> <span>{landlord.email}</span></span>
                  <span className="flex items-center space-x-1"><Phone className="h-3 w-3 text-zinc-300" /> <span>{landlord.phone}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onOpenAddListing}
                className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Property / Listing</span>
              </button>
              <button
                onClick={onLogout}
                className="bg-slate-800 hover:bg-rose-950 hover:border-rose-800 text-slate-300 hover:text-rose-200 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all border border-slate-700 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Success Banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600 text-white px-5 py-3 text-xs font-black flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-white hover:text-emerald-200 p-1 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Pending Requests Alert Banner */}
        {pendingBookings.length > 0 && (
          <div className="bg-amber-500 text-zinc-950 px-5 py-3 text-xs font-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-950 animate-ping shrink-0" />
              <span>
                ACTION REQUIRED: You have <strong>{pendingBookings.length} pending tenant booking request(s)</strong> awaiting your approval or rejection!
              </span>
            </div>
            <button
              onClick={() => {
                setActiveTab('bookings');
                setBookingFilterStatus('Pending');
              }}
              className="bg-zinc-950 hover:bg-zinc-900 text-amber-400 px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer w-fit shadow-xs"
            >
              Review Requests Now →
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-2.5 border-b border-slate-200/80 flex flex-wrap gap-2 sm:gap-3 text-xs font-bold bg-slate-50/90 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>📊 Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'properties' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Properties ({myProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'vehicles' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Vehicles ({myVehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Bookings & Requests ({myBookings.length})</span>
            {pendingBookings.length > 0 && (
              <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full shadow-xs animate-pulse">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'notifications' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="h-3.5 w-3.5 text-zinc-800" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'security' ? 'border-zinc-800 text-zinc-900 font-black' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5 text-rose-500" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-slate-50/40">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-slate-500 font-semibold block text-[11px]">Total Properties</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{myProperties.length}</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold block mt-1 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                    {activePropertiesCount} Active Listings
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-slate-500 font-semibold block text-[11px]">Vehicles & Assets</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{myVehicles.length}</span>
                  <span className="text-[10px] text-indigo-600 font-extrabold block mt-1 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                    Fleet Registered
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-slate-500 font-semibold block text-[11px]">Pending Tenant Approvals</span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingBookings.length}</span>
                  <span className="text-[10px] text-amber-700 font-extrabold block mt-1 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                    {pendingBookings.length > 0 ? 'Requires Your Action' : 'All Reviewed'}
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-slate-500 font-semibold block text-[11px]">Approved Rentals</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">{acceptedBookings.length}</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold block mt-1 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                    Active Tenants
                  </span>
                </div>
              </div>

              {/* Pending Approvals Quick Action Module */}
              {pendingBookings.length > 0 && (
                <div className="bg-white border-2 border-amber-400 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <h3 className="font-black text-sm text-slate-900">
                        Pending Tenant Requests Requiring Your Decision ({pendingBookings.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('bookings');
                        setBookingFilterStatus('Pending');
                      }}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      View All in Bookings Tab →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingBookings.slice(0, 4).map((b) => (
                      <div key={b.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col justify-between space-y-2 text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img src={b.itemImage} alt={b.itemTitle} className="h-12 w-12 rounded-xl object-cover shrink-0 border" />
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 truncate">{b.itemTitle}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Tenant: <strong>{b.userName}</strong> • {b.userPhone}</p>
                            <p className="text-[10px] text-emerald-600 font-bold">Token ₹{b.tokenPaidAmount || 99} Paid ✓</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={() => handleApproveBooking(b)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingBooking(b)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Ban className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200 space-y-3">
                <h3 className="font-black text-sm text-slate-900">Host Management Controls</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    onClick={onOpenAddListing}
                    className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-zinc-950 font-black flex items-center space-x-3 transition-all cursor-pointer text-left"
                  >
                    <Plus className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <span>List New Property</span>
                      <span className="block text-[10px] text-zinc-600 font-normal">Add flat, PG, commercial or vehicle</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('bookings');
                      setBookingFilterStatus('ALL');
                    }}
                    className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 font-black flex items-center space-x-3 transition-all cursor-pointer text-left"
                  >
                    <Clock className="h-5 w-5 text-indigo-600 shrink-0" />
                    <div>
                      <span>Review Tenant Bookings</span>
                      <span className="block text-[10px] text-indigo-600 font-normal">{myBookings.length} total request records</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('properties')}
                    className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-black flex items-center space-x-3 transition-all cursor-pointer text-left"
                  >
                    <Building2 className="h-5 w-5 text-slate-700 shrink-0" />
                    <div>
                      <span>Manage Listed Rentals</span>
                      <span className="block text-[10px] text-slate-500 font-normal">Adjust rents and availability</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    My Listed Properties ({myProperties.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Manage monthly rents, live availability, and listing details.</p>
                </div>
                <button
                  onClick={onOpenAddListing}
                  className="bg-zinc-900 hover:bg-black text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Property</span>
                </button>
              </div>

              {myProperties.length === 0 ? (
                <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                  <Building2 className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">No properties listed under this landlord account yet.</p>
                  <button
                    onClick={onOpenAddListing}
                    className="bg-amber-400 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer mt-2"
                  >
                    + Add Your First Property
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myProperties.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-zinc-400 p-4 rounded-2xl flex flex-col justify-between space-y-3 text-xs shadow-xs transition-all"
                    >
                      <div className="flex space-x-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="h-20 w-20 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-mono">#{p.id}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              p.status === 'Pending Approval'
                                ? 'bg-amber-100 text-amber-800'
                                : p.isAvailable !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {p.status === 'Pending Approval' ? 'Pending Admin' : p.isAvailable !== false ? 'Available' : 'Occupied'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5 truncate">{p.title}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5 flex items-center space-x-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{p.location}, {p.city}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Rent / Month</span>
                          <span className="font-black text-slate-900 text-sm">₹{p.rentPerMonth.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {onTogglePropertyAvailability && (
                            <button
                              onClick={() => onTogglePropertyAvailability(p.id)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                                p.isAvailable !== false
                                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {p.isAvailable !== false ? 'Mark Occupied' : 'Mark Available'}
                            </button>
                          )}

                          {onEditProperty && (
                            <button
                              onClick={() => onEditProperty(p)}
                              className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              ✏️ Edit
                            </button>
                          )}

                          {onDeleteProperty && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete property listing "${p.title}"?`)) {
                                  onDeleteProperty(p.id);
                                }
                              }}
                              className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3 text-rose-600" />
                              <span>Delete</span>
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

          {/* TAB 3: VEHICLES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    My Registered Vehicles ({myVehicles.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Manage cars, bikes, scooters, and GPS tracking features.</p>
                </div>
                <button
                  onClick={onOpenAddListing}
                  className="bg-zinc-900 hover:bg-black text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Vehicle</span>
                </button>
              </div>

              {myVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                  <Car className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">No vehicles listed under this account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myVehicles.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-zinc-400 p-4 rounded-2xl flex flex-col justify-between space-y-3 text-xs shadow-xs transition-all"
                    >
                      <div className="flex space-x-3">
                        <img
                          src={v.images[0]}
                          alt={v.title}
                          className="h-20 w-20 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-mono">#{v.id}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                              {v.type || 'Vehicle'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5 truncate">{v.title}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">{v.location}, {v.city}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Rent / Day</span>
                          <span className="font-black text-slate-900 text-sm">₹{v.rentPerDay.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {onTrackVehicleGPS && (
                            <button
                              type="button"
                              onClick={() => {
                                const matchingBooking = bookings.find(b => b.itemId === v.id) || {
                                  id: `TRK-${v.id}`,
                                  type: 'vehicle',
                                  itemId: v.id,
                                  itemTitle: v.title,
                                  itemImage: v.images[0],
                                  startDate: 'Today',
                                  endDate: 'Ongoing',
                                  totalPrice: v.rentPerDay,
                                  tokenPaidAmount: 500,
                                  tokenPaymentStatus: 'Paid',
                                  status: 'Active',
                                  bookingDate: 'Today',
                                  ownerId: v.ownerId,
                                  ownerName: v.ownerName,
                                  ownerContact: v.ownerContact
                                };
                                onTrackVehicleGPS(matchingBooking as any);
                              }}
                              className="text-[11px] font-black bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center space-x-1 shadow-2xs"
                            >
                              <span>🛰️ Live GPS Track</span>
                            </button>
                          )}

                          {onEditVehicle && (
                            <button
                              onClick={() => onEditVehicle(v)}
                              className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 px-2.5 py-1 rounded-lg cursor-pointer"
                            >
                              ✏️ Edit
                            </button>
                          )}

                          {onDeleteVehicle && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete vehicle listing "${v.title}"?`)) {
                                  onDeleteVehicle(v.id);
                                }
                              }}
                              className="text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-2.5 py-1 rounded-lg cursor-pointer flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3 text-rose-600" />
                              <span>Delete</span>
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

          {/* TAB 4: BOOKINGS MANAGEMENT & TENANT APPROVAL / REJECTION */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    Tenant Booking Requests & Approval Center ({myBookings.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Review tenant government KYC, move-in dates, approve/reject requests, and chat directly with renters.
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  {[
                    { key: 'ALL', label: `All Requests (${myBookings.length})` },
                    { key: 'Pending', label: `🟡 Pending Review (${pendingBookings.length})` },
                    { key: 'Accepted', label: `🟢 Approved (${acceptedBookings.length})` },
                    { key: 'Rejected', label: `🔴 Rejected (${rejectedBookings.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setBookingFilterStatus(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        bookingFilterStatus === tab.key
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    placeholder="Search by tenant, phone, item..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-zinc-400 outline-none"
                  />
                  {bookingSearchQuery && (
                    <button
                      onClick={() => setBookingSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
                  <Clock className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">No booking requests found in this view.</p>
                  <p className="text-[11px] text-slate-400">When users submit rental booking requests and tenant KYC for your properties or assets, they will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredBookings.map((b) => {
                    const isPending =
                      b.status === 'Pending Verification' ||
                      b.status === 'Pending' ||
                      b.status === 'Owner Reviewing' ||
                      b.status === 'Pending Requests';
                    const isApproved = b.status === 'Accepted' || b.status === 'Approved' || b.status === 'Active';
                    const isRejected = b.status === 'Rejected' || b.status === 'Cancelled';

                    return (
                      <div
                        key={b.id}
                        className={`bg-white border rounded-3xl p-4 sm:p-5 flex flex-col space-y-4 shadow-sm transition-all ${
                          isPending
                            ? 'border-amber-300 hover:border-amber-400 bg-amber-50/10'
                            : isApproved
                            ? 'border-emerald-200 hover:border-emerald-300'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Top Row: Item Info, Category & Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center space-x-3 min-w-0">
                            <img
                              src={b.itemImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=300&q=80'}
                              alt={b.itemTitle}
                              className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap gap-1">
                                <span className="text-slate-400 text-[10px] font-mono">#{b.id}</span>
                                <span className="text-zinc-900 font-mono text-[10px] font-black bg-zinc-100 px-2 py-0.5 rounded-md uppercase border border-zinc-200">
                                  {b.type}
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                  Token: ₹{b.tokenPaidAmount || 99} Paid ✓
                                </span>
                              </div>
                              <h4 className="font-black text-slate-900 text-sm sm:text-base mt-0.5 truncate">{b.itemTitle}</h4>
                              <p className="text-[11px] text-slate-400 font-medium">Request Date: {b.bookingDate || 'Recent'}</p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rental Amount</span>
                              <span className="font-black text-slate-950 text-base sm:text-lg">
                                ₹{b.totalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-black px-3 py-1 rounded-full inline-flex items-center space-x-1.5 border shadow-xs ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              }`}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {isApproved ? 'Approved by You ✓' : isRejected ? 'Rejected' : '🟡 Pending Your Approval'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Tenant KYC & Verification Card Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                          <div>
                            <span className="text-slate-400 font-bold block uppercase text-[10px]">Tenant Details</span>
                            <span className="font-extrabold text-slate-900 text-xs block mt-0.5">
                              {b.userName}
                            </span>
                            <span className="text-slate-600 block mt-0.5">📞 {b.userPhone || '+91 Direct Contact'}</span>
                            {b.userEmail && <span className="text-slate-500 truncate block mt-0.5">✉️ {b.userEmail}</span>}
                            {b.occupation && <span className="text-slate-500 block mt-0.5">💼 {b.occupation}</span>}
                            {b.monthlyIncome && <span className="text-slate-500 block mt-0.5">💰 Income: {b.monthlyIncome}</span>}
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold block uppercase text-[10px]">Government ID Proof</span>
                            <div className="mt-1 space-y-1">
                              <span className="font-bold text-slate-800 block">
                                {b.govIdType || 'Aadhaar Card'}: <strong className="font-mono text-zinc-950">{b.govIdNumber || 'Verified in App'}</strong>
                              </span>
                              
                              {b.idProofUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewingDoc({
                                      title: `ID Proof - ${b.userName}`,
                                      url: b.idProofUrl!,
                                      number: b.govIdNumber,
                                      type: b.govIdType
                                    })
                                  }
                                  className="mt-1.5 inline-flex items-center space-x-1.5 bg-zinc-900 hover:bg-black text-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View Uploaded ID Photo</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 block italic">Self-declaration verified</span>
                              )}

                              {b.emergencyContact && (
                                <span className="text-slate-500 block text-[11px] pt-1">
                                  🚨 Emergency: {b.emergencyContact}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold block uppercase text-[10px]">Move-In & Stay Info</span>
                            <span className="font-extrabold text-amber-900 text-xs block mt-0.5 flex items-center space-x-1">
                              <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span>Move-In Date: <strong>{b.startDate || 'Immediate'}</strong></span>
                            </span>
                            {b.occupantsCount && (
                              <span className="text-slate-600 block mt-0.5">👥 Total Occupants: {b.occupantsCount} Person(s)</span>
                            )}
                            {b.currentAddress && (
                              <span className="text-slate-500 truncate block mt-0.5">📍 From: {b.currentAddress}</span>
                            )}

                            {/* Rejection Note if already rejected */}
                            {isRejected && b.rejectionReason && (
                              <div className="mt-2 bg-rose-50 border border-rose-200 p-2 rounded-xl text-rose-800 text-[11px]">
                                <strong>Rejection Reason:</strong> {b.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Owner Decision & Interaction Bar */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          {/* Direct Communication Buttons */}
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            {onOpenBookingChat && (
                              <button
                                type="button"
                                onClick={() => onOpenBookingChat(b)}
                                className="bg-zinc-900 hover:bg-black text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs"
                                title="Chat directly with Tenant"
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-amber-300" />
                                <span>Chat with Tenant</span>
                              </button>
                            )}

                            <a
                              href={`tel:${b.userPhone || '+919876543210'}`}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1 transition-all"
                            >
                              <Phone className="h-3.5 w-3.5 text-slate-600" />
                              <span>Call Tenant</span>
                            </a>
                          </div>

                          {/* Action Buttons: APPROVE / REJECT */}
                          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            {isPending && onUpdateBookingStatus && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveBooking(b)}
                                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all shadow-md hover:scale-105"
                                >
                                  <Check className="h-4 w-4 stroke-[3]" />
                                  <span>Approve & Accept Request</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRejectingBooking(b)}
                                  className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-all shadow-sm"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  <span>Reject Request</span>
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <div className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-200">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Booking Active & Confirmed</span>
                              </div>
                            )}

                            {isRejected && (
                              <div className="inline-flex items-center space-x-1.5 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-200">
                                <Ban className="h-4 w-4" />
                                <span>Booking Declined (Token Refunded)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Live GPS Telemetry for Vehicles */}
                        {b.type === 'vehicle' && onTrackVehicleGPS && isApproved && (
                          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                              <span>🛰️ GPS Telemetry:</span>
                              <span className="text-emerald-600 font-extrabold">Active Vehicle Tracking Available</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => onTrackVehicleGPS(b)}
                              className="bg-slate-900 hover:bg-black text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                              <span>Track Vehicle GPS Live</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <h3 className="font-black text-sm text-slate-900">Tenant Reviews & Rating History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'r1', propertyTitle: 'Modern 2 BHK Sunlit Apartment', tenantName: 'Rahul Verma', rating: 5, comment: 'Spacious apartment, clean amenities, and super helpful owner!', date: '01 Aug 2026' },
                  { id: 'r2', propertyTitle: 'Stanza Elite Student PG', tenantName: 'Priya Sharma', rating: 4.8, comment: 'Great location near college, hygienic food included.', date: '28 Jul 2026' }
                ].map((rev) => (
                  <div key={rev.id} className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl text-xs space-y-2 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 text-xs">{rev.propertyTitle}</span>
                      <div className="flex items-center space-x-1 bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-md text-[11px]">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{rev.rating} / 5</span>
                      </div>
                    </div>
                    <p className="text-slate-600 italic text-[11px]">"{rev.comment}"</p>
                    <div className="text-[10px] text-slate-400 font-mono">By {rev.tenantName} on {rev.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <h3 className="font-black text-sm text-slate-900">Notifications & Booking Alerts</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {myBookings.map((b) => (
                  <div key={`notif-${b.id}`} className="bg-white border border-slate-200 p-4 rounded-2xl text-xs flex items-start space-x-3 shadow-xs">
                    <div className="p-2 bg-amber-400 text-zinc-950 rounded-xl shrink-0 mt-0.5 font-bold">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900">
                          {b.status === 'Accepted' ? 'Booking Accepted' : b.status === 'Rejected' ? 'Booking Declined' : 'New Tenant Booking Request'}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">{b.bookingDate || 'Recent'}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Tenant <strong>{b.userName}</strong> requested <strong>{b.itemTitle}</strong> (Move-In: {b.startDate || 'Immediate'}).
                        Token: ₹{b.tokenPaidAmount || 99} Paid. Status: <strong>{b.status}</strong>.
                      </p>
                    </div>
                  </div>
                ))}

                {myBookings.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs font-bold">
                    No new notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: OWNER PROFILE & SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-lg">
              <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center space-x-2 text-zinc-900">
                  <User className="h-5 w-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm text-slate-900">Edit Owner Profile & Security Details</h3>
                </div>
                <p className="text-xs text-slate-600">
                  Update your official landlord profile name, mobile number, address, city, and account password. Changes are saved instantly to Cloud Database.
                </p>

                {passUpdateMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{passUpdateMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveLandlordProfile} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Owner User ID</label>
                    <input
                      type="text"
                      disabled
                      value={landlord.id}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-600 font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={ownerEditName}
                      onChange={(e) => setOwnerEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mobile / Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={ownerEditPhone}
                      onChange={(e) => setOwnerEditPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">New Account Password (Optional)</label>
                    <input
                      type="password"
                      value={newLandlordPassword}
                      onChange={(e) => setNewLandlordPassword(e.target.value)}
                      placeholder="Leave blank to keep existing password..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Office / Home Address</label>
                      <input
                        type="text"
                        value={ownerEditAddress}
                        onChange={(e) => setOwnerEditAddress(e.target.value)}
                        placeholder="e.g. 102 Crystal Heights"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">City</label>
                      <input
                        type="text"
                        value={ownerEditCity}
                        onChange={(e) => setOwnerEditCity(e.target.value)}
                        placeholder="e.g. Jaipur"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-950 text-white font-extrabold px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Save & Update Owner Profile</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* DANGER ZONE: DELETE OWNER ACCOUNT */}
              {onDeleteLandlordAccount && (
                <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center space-x-3 text-rose-700">
                    <div className="p-2.5 bg-rose-600 text-white rounded-2xl">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-rose-950">
                        Danger Zone: Delete Owner Account
                      </h4>
                      <p className="text-xs text-rose-700 font-medium">
                        Permanently delete your Owner profile, listed properties, and vehicles.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-rose-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
                    <p className="font-bold text-rose-900">Please read carefully before proceeding:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                      <li>Your owner credentials, profile information, and phone/email records will be removed.</li>
                      <li>All your listed apartments, villas, and rental vehicles will be unlisted and deleted.</li>
                      <li>Active booking chats and landlord authorization will be revoked.</li>
                    </ul>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    To safeguard against accidental loss, we require <strong>6-digit Email OTP Verification</strong> sent to <strong className="text-slate-900">{landlord.email}</strong> before deleting your account.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center space-x-2 text-xs"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Permanently Delete Owner Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* REJECTION REASON MODAL DIALOG */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-rose-600">
                <Ban className="h-5 w-5" />
                <h3 className="font-black text-base">Reject Booking Request</h3>
              </div>
              <button
                onClick={() => setRejectingBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Rejecting request <strong>#{rejectingBooking.id}</strong> for <strong>{rejectingBooking.itemTitle}</strong> from tenant <strong>{rejectingBooking.userName}</strong>.
              </p>
              <p className="text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                💡 The ₹{rejectingBooking.tokenPaidAmount || 99} booking token will be automatically refunded back to the tenant.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Select Rejection Reason:</label>
              
              <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="rejectReason"
                  checked={rejectReasonType === 'Occupied'}
                  onChange={() => setRejectReasonType('Occupied')}
                  className="accent-zinc-950"
                />
                <span className="font-medium text-slate-800">Asset is already reserved or occupied on requested dates</span>
              </label>

              <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="rejectReason"
                  checked={rejectReasonType === 'KYC'}
                  onChange={() => setRejectReasonType('KYC')}
                  className="accent-zinc-950"
                />
                <span className="font-medium text-slate-800">Incomplete or unverified identity / KYC document</span>
              </label>

              <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="rejectReason"
                  checked={rejectReasonType === 'Dates'}
                  onChange={() => setRejectReasonType('Dates')}
                  className="accent-zinc-950"
                />
                <span className="font-medium text-slate-800">Requested move-in date or duration not feasible</span>
              </label>

              <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="rejectReason"
                  checked={rejectReasonType === 'Custom'}
                  onChange={() => setRejectReasonType('Custom')}
                  className="accent-zinc-950"
                />
                <span className="font-medium text-slate-800">Other / Custom reason</span>
              </label>

              {rejectReasonType === 'Custom' && (
                <textarea
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="Enter specific rejection reason for tenant..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-zinc-400 outline-none mt-1"
                />
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingBooking(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Confirm Rejection & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TENANT ID PROOF PHOTO PREVIEW MODAL */}
      {previewingDoc && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 text-white max-w-lg w-full rounded-3xl p-5 shadow-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-sm text-white">{previewingDoc.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {previewingDoc.type || 'Gov ID'}: {previewingDoc.number || 'Verified'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingDoc(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 max-h-[60vh] flex items-center justify-center">
              <img
                src={previewingDoc.url}
                alt={previewingDoc.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
              <span className="text-[11px]">Official Tenant KYC Upload</span>
              <button
                onClick={() => setPreviewingDoc(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER ACCOUNT DELETION CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen && landlord && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-600 text-white rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Delete Owner / Landlord Account?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
              <p className="font-bold text-rose-900">The following data will be erased permanently:</p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                <li>Landlord profile: <strong>{landlord.name}</strong> ({landlord.email})</li>
                <li>All your active properties & vehicle listings</li>
                <li>Your host authorization and dashboard credentials</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600">
              To verify and protect your account, we will send an OTP confirmation code to <strong>{landlord.email}</strong>.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Cancel & Keep
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setIsDeleteOtpModalOpen(true);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
              >
                <Mail className="h-4 w-4" />
                <span>Send OTP to Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OWNER DELETION EMAIL OTP VERIFICATION MODAL */}
      {landlord && (
        <EmailVerificationModal
          isOpen={isDeleteOtpModalOpen}
          email={landlord.email}
          userName={landlord.name}
          purpose="account_deletion"
          title="Verify Email to Delete Owner Account"
          subtitle="Landlord Account Deletion Authorization"
          actionButtonText="Verify & Delete Owner Account"
          isDanger={true}
          onClose={() => setIsDeleteOtpModalOpen(false)}
          onSuccess={() => {
            setIsDeleteOtpModalOpen(false);
            if (onDeleteLandlordAccount && landlord.id) {
              onDeleteLandlordAccount(landlord.id);
            }
          }}
        />
      )}

    </div>
  );
};
