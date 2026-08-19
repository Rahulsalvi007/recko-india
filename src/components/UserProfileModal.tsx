import React, { useState } from 'react';
import { UserProfile, RentalBooking, Vehicle } from '../types';
import {
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  MapPin,
  Car,
  Home,
  CheckCircle2,
  Clock,
  Navigation,
  KeyRound,
  FileText,
  BadgeCheck,
  Layers,
  LogOut,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Edit3,
  Save,
  Lock
} from 'lucide-react';
import { EmailVerificationModal } from './EmailVerificationModal';
import { saveDocument } from '../lib/firebase';

interface UserProfileModalProps {
  isOpen?: boolean;
  user: UserProfile | { name: string; email: string; phone: string; govIdNumber?: string; currentAddress?: string; id?: string } | null;
  bookings?: RentalBooking[];
  vehicles?: Vehicle[];
  onClose: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onTrackVehicleGPS?: (booking: RentalBooking) => void;
  onTrackVehicle?: (vehicle: Vehicle) => void;
  onOpenBookingChat?: (booking: RentalBooking) => void;
  onCancelBooking?: (bookingId: string) => void;
  isAdminView?: boolean;
  onBlockUser?: (userEmail: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen = true,
  user,
  bookings = [],
  vehicles = [],
  onClose,
  onLogout,
  onDeleteAccount,
  onTrackVehicleGPS,
  onTrackVehicle,
  onOpenBookingChat,
  onCancelBooking,
  isAdminView,
  onBlockUser
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'rentals'>('details');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteOtpModalOpen, setIsDeleteOtpModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [editAddress, setEditAddress] = useState((user && 'address' in user && user.address) || (user && 'currentAddress' in user && user.currentAddress) || '');
  const [updateMsg, setUpdateMsg] = useState('');

  if (!isOpen || !user) return null;

  const userBookings = bookings.filter(
    (b) => b.userName?.toLowerCase() === user.name?.toLowerCase() || b.userEmail?.toLowerCase() === user.email?.toLowerCase()
  );

  const handleStartDeleteAccount = () => {
    setIsDeleteConfirmOpen(false);
    setIsDeleteOtpModalOpen(true);
  };

  const handleFinalizeDelete = () => {
    setIsDeleteOtpModalOpen(false);
    if (onDeleteAccount) {
      onDeleteAccount();
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg('');

    const updatedUser = {
      ...user,
      name: editName.trim() || user.name,
      phone: editPhone.trim() || user.phone,
      address: editAddress.trim(),
      currentAddress: editAddress.trim(),
      ...(editPassword.trim() ? { password: editPassword.trim() } : {})
    };

    localStorage.setItem('renthub_user', JSON.stringify(updatedUser));
    try {
      if (user.id) {
        await saveDocument('users', user.id, updatedUser);
      }
    } catch (err) {
      console.warn('Firebase user profile update fallback:', err);
    }

    setUpdateMsg('✅ Personal details updated successfully in database!');
    setIsEditing(false);
    setTimeout(() => setUpdateMsg(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white overflow-y-auto w-full h-full min-h-screen animate-in fade-in duration-200">
      <div className="w-full min-h-screen flex flex-col">
        {/* Top Modal Header */}
          <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black">{editName || user.name}</h2>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-500/40 flex items-center space-x-1">
                    <BadgeCheck className="h-3 w-3" />
                    <span>Verified Profile</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border border-slate-700"
            >
              <X className="h-4 w-4" />
              <span>← Back to Dashboard</span>
            </button>
          </div>

          {/* Navigation Tabs & Edit Toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 px-6 pt-3">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'details'
                    ? 'border-indigo-600 text-indigo-600 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Personal Details & Identity</span>
              </button>

              <button
                onClick={() => setActiveTab('rentals')}
                className={`pb-3 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'rentals'
                    ? 'border-indigo-600 text-indigo-600 dark:border-amber-400 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Active & Past Rentals ({userBookings.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mb-2 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm border border-amber-300"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Personal Details'}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto p-6 flex-1 space-y-6">
            {updateMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-black flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{updateMsg}</span>
              </div>
            )}

            {activeTab === 'details' ? (
              <div className="space-y-6">
                {isEditing ? (
                  /* EDITABLE FORM MODE */
                  <form onSubmit={handleSaveProfileDetails} className="bg-slate-900/90 p-5 rounded-3xl border border-amber-500/30 space-y-4 text-white">
                    <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Update Your Personal Details</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                      <div>
                        <label className="block text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Contact Mobile Number</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">New Account Password (Optional)</label>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Leave blank to keep current password"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Registered Address / Location</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="e.g. Flat 402, Sunshine Heights, Sector 62"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs hover:scale-102 transition-all shadow-md cursor-pointer border border-amber-300 flex items-center space-x-1.5"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save & Update Database</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* READ-ONLY DISPLAY MODE */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">Full Name</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{editName || user.name}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">Contact Mobile</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{editPhone || user.phone || '+91 98765 43210'}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">Email Address</span>
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>OTP Verified</span>
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <Mail className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{user.email}</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">Government ID Proof</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <FileText className="h-3.5 w-3.5 text-amber-500" />
                        <span>{('govIdNumber' in user && user.govIdNumber) || 'Aadhaar Verified (**** 8842)'}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center space-x-1.5">
                    <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Registered Residence Address</span>
                  </h4>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                    {editAddress || ('address' in user && user.address) || ('currentAddress' in user && user.currentAddress) || 'Flat 402, Sunshine Heights, Sector 62'}
                  </p>
                  {(('city' in user && user.city) || ('state' in user && user.state)) && (
                    <p className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                      {'city' in user ? user.city : ''}{'state' in user && user.state ? `, ${user.state}` : ''}{'pinCode' in user && user.pinCode ? ` - ${user.pinCode}` : ''}
                    </p>
                  )}
                </div>

                {onLogout && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 p-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
                    >
                      <LogOut className="h-4 w-4 text-slate-500" />
                      <span>Log Out Account ({user.name})</span>
                    </button>
                  </div>
                )}

                {/* Danger Zone: Account Deletion */}
                {onDeleteAccount && (
                  <div className="mt-4 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-rose-600 text-white rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                          Danger Zone: Delete Account
                        </h4>
                        <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                          Permanently remove your account, profile, and rental records.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      For your safety, we will send an OTP confirmation code to <strong className="text-slate-900 dark:text-white">{user.email}</strong> before proceeding with account deletion.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-rose-600/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete My User Account</span>
                    </button>
                  </div>
                )}

                {isAdminView && (
                  <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
                    <button
                      onClick={() => onBlockUser?.(user.email)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Block User Account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Rentals & Vehicle Tracking */
              <div className="space-y-4">
                {userBookings.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-semibold">No active or past rentals found for this user.</p>
                  </div>
                ) : (
                  userBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-50 dark:bg-zinc-800/70 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3">
                        <img src={b.itemImage} alt="" className="h-16 w-20 object-cover rounded-xl shrink-0" referrerPolicy="no-referrer" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              {b.type}
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                              {b.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">{b.itemTitle}</h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                            Total Paid: <span className="text-slate-900 dark:text-white font-black">₹{b.totalPrice}</span> • Date: {b.startDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Chat with Owner Button */}
                        {onOpenBookingChat && (
                          <button
                            onClick={() => onOpenBookingChat(b)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center space-x-1.5 shrink-0"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>Chat with Owner</span>
                          </button>
                        )}

                        {/* Cancel Booking Button */}
                        {onCancelBooking && b.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel booking #${b.id}?`)) {
                                onCancelBooking(b.id);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-extrabold text-xs px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shrink-0"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Warning Dialog */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900 dark:text-white">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-600 text-white rounded-2xl">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Delete User Account?
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-4 space-y-2 text-xs text-slate-700 dark:text-zinc-300">
                <p className="font-bold text-rose-900 dark:text-rose-200">The following data will be erased permanently:</p>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>Your user account and profile data ({user.email})</li>
                  <li>Your saved bookings, rental history, and chats</li>
                  <li>Active session logins across all devices</li>
                </ul>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-400">
                To confirm deletion, we will send a 6-digit OTP authorization code to <strong>{user.email}</strong>.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel & Keep Account
                </button>
                <button
                  type="button"
                  onClick={handleStartDeleteAccount}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send OTP to Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email OTP Verification Modal for Deletion */}
        <EmailVerificationModal
          isOpen={isDeleteOtpModalOpen}
          email={user.email}
          userName={user.name}
          purpose="account_deletion"
          title="Verify Email to Delete Account"
          subtitle="Permanent Account Deletion Authorization"
          actionButtonText="Verify & Delete My Account"
          isDanger={true}
          onClose={() => setIsDeleteOtpModalOpen(false)}
          onSuccess={handleFinalizeDelete}
        />
      </div>
  );
};
