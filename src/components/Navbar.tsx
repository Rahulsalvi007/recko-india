import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Home,
  Briefcase,
  GraduationCap,
  Car,
  Hotel as HotelIcon,
  UtensilsCrossed,
  BookOpen,
  Sparkles,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  X,
  User,
  Store,
  FileText,
  Sun,
  Moon,
  ShieldAlert,
  PlusCircle,
  MessageSquare,
  Navigation,
  PackageCheck,
  LogOut,
  Shirt,
  Trophy,
  Bell,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Trash2,
  KeyRound,
  Database
} from 'lucide-react';
import { MainCategory, LandlordUser, UserProfile, AppNotification } from '../types';

interface NavbarProps {
  activeCategory: MainCategory;
  setActiveCategory: (cat: MainCategory) => void;
  activeMode?: 'rent' | 'bookings';
  setActiveMode?: (mode: 'rent' | 'bookings') => void;
  bookingsCount?: number;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: (theme: 'light' | 'dark') => void;
  onOpenAIModal: () => void;
  onOpenRadarModal?: () => void;
  onOpenLandlordModal: () => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenAdminModal: () => void;
  onOpenLandlordAuthModal: () => void;
  loggedInLandlord: LandlordUser | null;
  pendingLandlordCount: number;
  currentUser: UserProfile | null;
  onOpenUserAuthModal: () => void;
  onOpenUserProfileModal?: () => void;
  onOpenFeedbackModal?: () => void;
  onOpenFirebaseSync?: () => void;
  onUserLogout?: () => void;
  onLandlordLogout?: () => void;
  notifications?: AppNotification[];
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onMarkNotificationsRead?: () => void;
  onOpenSplitBillModal?: () => void;
  onOpenMaintenanceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  setActiveCategory,
  activeMode = 'rent',
  setActiveMode,
  bookingsCount = 0,
  currentTheme = 'dark',
  onToggleTheme,
  onOpenAIModal,
  onOpenRadarModal,
  onOpenLandlordModal,
  savedCount,
  onOpenSavedModal,
  onOpenAdminModal,
  onOpenLandlordAuthModal,
  loggedInLandlord,
  pendingLandlordCount,
  currentUser,
  onOpenUserAuthModal,
  onOpenUserProfileModal,
  onOpenFeedbackModal,
  onOpenFirebaseSync,
  onUserLogout,
  onLandlordLogout,
  notifications = [],
  onDeleteNotification,
  onClearAllNotifications,
  onMarkNotificationsRead,
  onOpenSplitBillModal,
  onOpenMaintenanceModal
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category Definitions
  const allCategories: { id: MainCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'all', label: '🌟 All Assets', icon: <Sparkles className="h-3.5 w-3.5" />, desc: 'Sabhi Rentals: Homes, Vehicles, Hotels, Clothes, Turfs & More' },
    { id: 'residential', label: 'Properties', icon: <Home className="h-3.5 w-3.5" />, desc: '1-4 BHK Flats, Villas, Homes' },
    { id: 'commercial', label: 'Commercial', icon: <Briefcase className="h-3.5 w-3.5" />, desc: 'Offices, Shops, Showrooms' },
    { id: 'student', label: 'Student PGs', icon: <GraduationCap className="h-3.5 w-3.5" />, desc: 'Girls/Boys PGs with Mess' },
    { id: 'vehicle', label: 'Vehicles', icon: <Car className="h-3.5 w-3.5" />, desc: 'Cars, Bikes, Scooters' },
    { id: 'hotel', label: 'Hotels & Stay', icon: <HotelIcon className="h-3.5 w-3.5" />, desc: 'Daily Hotel Rooms & Resorts' },
    { id: 'restaurant', label: 'Dining', icon: <UtensilsCrossed className="h-3.5 w-3.5" />, desc: 'Top Dining & Table Booking' },
    { id: 'library', label: 'Libraries', icon: <BookOpen className="h-3.5 w-3.5" />, desc: '24/7 Silent AC Study Halls' },
    { id: 'clothing', label: 'Outfits', icon: <Shirt className="h-3.5 w-3.5" />, desc: 'Wedding & Designer Dresses' },
    { id: 'sports_turf', label: 'Sports Turfs', icon: <Trophy className="h-3.5 w-3.5" />, desc: 'Box Cricket & Football Grounds' },
    { id: 'general', label: 'Appliances', icon: <PackageCheck className="h-3.5 w-3.5" />, desc: 'Furniture, Tools & Electronics' },
  ];

  const isUserOrHostLoggedIn = Boolean(currentUser || loggedInLandlord);
  const activeEmail = (currentUser?.email || loggedInLandlord?.email || '').toLowerCase().trim();
  const activeId = currentUser?.id || loggedInLandlord?.id || '';

  const myPrivateNotifications = (isUserOrHostLoggedIn && notifications)
    ? notifications.filter((n) => {
        const nUserEmail = (n.userEmail || '').toLowerCase().trim();
        const nOwnerEmail = (n.ownerEmail || '').toLowerCase().trim();

        if (nUserEmail && nUserEmail === activeEmail) return true;
        if (nOwnerEmail && nOwnerEmail === activeEmail) return true;
        if (n.userId && n.userId === activeId) return true;
        if (n.ownerId && n.ownerId === activeId) return true;
        if (n.recipientRole === 'all') return true;
        if (n.recipientRole === 'user' && currentUser) return true;
        if (n.recipientRole === 'landlord' && loggedInLandlord) return true;
        return false;
      })
    : [];

  const unreadNotifsCount = myPrivateNotifications.filter((n) => !n.read).length;

  const handleListPropertyClick = () => {
    if (loggedInLandlord) {
      onOpenLandlordModal();
    } else {
      onOpenLandlordAuthModal();
    }
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${
      currentTheme === 'light'
        ? 'bg-white/95 text-zinc-900 border-b border-zinc-200 shadow-sm backdrop-blur-md'
        : 'bg-[#09090b]/95 text-white border-b border-amber-500/20 shadow-2xl backdrop-blur-md'
    }`}>
      
      {/* Top Main Navigation Bar (White, Black & Gold Styling) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 max-w-full relative z-50">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4 max-w-full">
          
          {/* Left: Brand Logo & Title with Gold Shield Accent */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => {
                if (setActiveMode) setActiveMode('rent');
                if (setActiveCategory) setActiveCategory('residential');
              }}
              className="flex items-center space-x-2 sm:space-x-3 group text-left cursor-pointer transition-transform active:scale-98"
            >
              <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/25 group-hover:shadow-amber-400/40 group-hover:scale-105 transition-all shrink-0 border border-amber-300">
                <Home className="h-4 w-4 sm:h-6 sm:w-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className={`text-base sm:text-xl font-black tracking-tight leading-none ${
                    currentTheme === 'light' ? 'text-zinc-950' : 'text-white'
                  }`}>
                    Recko<span className="text-amber-400 font-black ml-0.5">India</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    PRO
                  </span>
                </div>
                <span className={`text-[10px] font-bold tracking-wide hidden sm:flex items-center space-x-1 mt-0.5 ${
                  currentTheme === 'light' ? 'text-zinc-500' : 'text-amber-300/70'
                }`}>
                  <span>India's Premium Escrow Rental Hub</span>
                </span>
              </div>
            </button>
          </div>

          {/* Center: Mode Capsule Switcher (Only visible on Large Screens 1024px+ to avoid navbar overflow) */}
          <div className={`hidden lg:flex items-center space-x-1 p-1 rounded-2xl border shrink-0 transition-all ${
            currentTheme === 'light'
              ? 'bg-zinc-100/90 border-zinc-200 shadow-inner'
              : 'bg-[#121215] border-amber-500/20 shadow-lg shadow-black/40'
          }`}>
            
            {/* 1. Explore Rentals Mode */}
            <button
              onClick={() => {
                if (setActiveMode) setActiveMode('rent');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeMode === 'rent'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-md shadow-amber-400/25 font-black scale-100'
                  : currentTheme === 'light'
                    ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/80'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              <Store className="h-3.5 w-3.5 shrink-0" />
              <span>Explore Rentals</span>
            </button>

            {/* 2. My Bookings Mode */}
            {currentUser && (
              <button
                onClick={() => {
                  if (setActiveMode) setActiveMode('bookings');
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer relative ${
                  activeMode === 'bookings'
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-md shadow-amber-400/25 font-black'
                    : currentTheme === 'light'
                      ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/80'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>My Bookings</span>
                {bookingsCount > 0 && (
                  <span className={`font-black text-[10px] h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    activeMode === 'bookings' ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'
                  }`}>
                    {bookingsCount}
                  </span>
                )}
              </button>
            )}

            {/* 3. 5-10km Radar Shortcut */}
            {onOpenRadarModal && (
              <button
                onClick={onOpenRadarModal}
                className={`hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currentTheme === 'light'
                    ? 'text-emerald-800 hover:bg-emerald-100/60'
                    : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                }`}
                title="5-10km Proximity Radar"
              >
                <Navigation className="h-3.5 w-3.5 text-emerald-400 animate-pulse shrink-0" />
                <span>Radar</span>
              </button>
            )}

            {/* 4. Smart AI Advisor Shortcut */}
            <button
              onClick={onOpenAIModal}
              className={`hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentTheme === 'light'
                  ? 'text-blue-950 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40'
                  : 'text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-400/60'
              }`}
              title="Recko AI Smart Advisor & 24/7 Matcher"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse shrink-0" />
              <span>AI Advisor</span>
            </button>

            {/* 5. ⚡ Smart Tools Dropdown Menu */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-blue-500/20 text-blue-400 border border-blue-500/40 hover:border-blue-400 shrink-0"
                title="Smart Rental Tools & Services"
              >
                <Zap className="h-3.5 w-3.5 text-blue-400 animate-pulse shrink-0" />
                <span>Smart Tools</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0C1017] text-white rounded-2xl shadow-2xl border border-blue-500/30 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="p-2 border-b border-zinc-800 text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
                    <span>⚡ RECKO SMART TOOLS ENGINE</span>
                    <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">PRO</span>
                  </div>

                  <button
                    onClick={() => { setIsToolsOpen(false); onOpenSplitBillModal?.(); }}
                    className="w-full p-2.5 rounded-xl text-left text-xs font-bold hover:bg-zinc-800 flex items-center space-x-2.5 transition-colors cursor-pointer text-slate-200 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                    <div>
                      <p className="font-extrabold text-white text-xs">Roommate Split-Bill Calculator</p>
                      <p className="text-[10px] text-slate-400 font-normal">Rent & utility sharing per person</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsToolsOpen(false); onOpenMaintenanceModal?.(); }}
                    className="w-full p-2.5 rounded-xl text-left text-xs font-bold hover:bg-zinc-800 flex items-center space-x-2.5 transition-colors cursor-pointer text-slate-200 hover:text-white"
                  >
                    <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                    <div>
                      <p className="font-extrabold text-white text-xs">Maintenance & Repair Tickets</p>
                      <p className="text-[10px] text-slate-400 font-normal">Log repairs directly to owner</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions, List Property, Wishlist, Notifications, Auth, Menu */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* List Property Blue CTA Button */}
            <button
              onClick={handleListPropertyClick}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-102 active:scale-98 shrink-0 border border-blue-400"
              title="List your property, vehicle or item on Recko"
            >
              <PlusCircle className="h-4 w-4 stroke-[2.5] shrink-0" />
              <span>List Property</span>
            </button>

            {/* AI Advisor Quick Button for md-screens */}
            <button
              onClick={onOpenAIModal}
              className={`hidden md:flex xl:hidden items-center space-x-1 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
                currentTheme === 'light'
                  ? 'bg-blue-500/20 text-blue-950 border-blue-400/40 hover:bg-blue-500/30'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25'
              }`}
              title="AI Assistant"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse shrink-0" />
              <span>AI Help</span>
            </button>

            {/* Notification Bell & Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (onMarkNotificationsRead) onMarkNotificationsRead();
                }}
                className={`relative p-2.5 rounded-xl transition-all cursor-pointer shrink-0 border ${
                  currentTheme === 'light'
                    ? 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border-zinc-200'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border-zinc-800 hover:border-amber-500/30'
                }`}
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-amber-400" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer (Black, White & Gold) */}
              {isNotifOpen && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-h-[78vh] overflow-y-auto no-scrollbar bg-[#0a0a0c] border border-amber-500/30 rounded-3xl shadow-2xl p-4 z-50 text-white space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-white block">
                          Notifications & Alerts
                        </span>
                        {isUserOrHostLoggedIn && (
                          <span className="text-[10px] text-amber-400 font-semibold block truncate max-w-[200px]">
                            {currentUser ? currentUser.name : loggedInLandlord?.name} ({currentUser ? currentUser.email : loggedInLandlord?.email})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {myPrivateNotifications && myPrivateNotifications.length > 0 && onClearAllNotifications && (
                        <button
                          onClick={() => onClearAllNotifications()}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-extrabold bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/30 cursor-pointer flex items-center space-x-1"
                          title="Clear and Delete All Notifications"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Clear All</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {!isUserOrHostLoggedIn ? (
                    /* NOT LOGGED IN STATE: STRICT PRIVACY */
                    <div className="py-6 px-3 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-sm text-white">Login Required for Notifications</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                          Please log in to your account. Your notifications, booking approvals, and private alerts are strictly confidential and only visible to you.
                        </p>
                      </div>
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotifOpen(false);
                            onOpenUserAuthModal();
                          }}
                          className="w-full bg-amber-400 hover:bg-yellow-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>Tenant / User Login</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotifOpen(false);
                            onOpenLandlordAuthModal();
                          }}
                          className="w-full bg-[#121215] hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <Building2 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Owner / Host Login</span>
                        </button>
                      </div>
                    </div>
                  ) : myPrivateNotifications && myPrivateNotifications.length > 0 ? (
                    <div className="space-y-2">
                      {myPrivateNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onDeleteNotification?.(n.id)}
                          className="p-3 rounded-2xl border text-xs transition-all bg-amber-400/10 hover:bg-amber-400/20 border-amber-500/40 text-amber-100 cursor-pointer relative group"
                          title="Click to view & delete notification"
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span className="text-amber-400 font-black flex items-center space-x-1 pr-2">
                              <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                              <span>{n.title}</span>
                            </span>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="text-[10px] text-zinc-400 font-mono">{n.timestamp}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification?.(n.id);
                                }}
                                className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-md transition-all cursor-pointer"
                                title="Delete Notification"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed pl-4">{n.message}</p>
                          <span className="text-[9px] text-amber-400/80 font-bold block text-right mt-1 opacity-70 group-hover:opacity-100">
                            Click to dismiss & delete
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-500 text-xs font-medium space-y-1">
                      <p className="text-zinc-400 font-bold">No new notifications right now.</p>
                      <p className="text-[11px] text-zinc-600">You're all caught up!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Login / Profile Pill Button */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                id="btn-user-auth"
                onClick={() => {
                  if (currentUser && onOpenUserProfileModal) {
                    onOpenUserProfileModal();
                  } else {
                    onOpenUserAuthModal();
                  }
                }}
                className={`font-black text-xs px-3 sm:px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer border flex items-center space-x-2 shrink-0 ${
                  currentUser
                    ? 'bg-[#121215] text-white border-amber-500/40 hover:border-amber-400 hover:bg-zinc-900'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700 hover:border-amber-400/50'
                }`}
              >
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  currentUser ? 'bg-amber-400 text-black font-black text-[10px]' : 'bg-zinc-800 text-amber-400'
                }`}>
                  <User className="h-3 w-3" />
                </div>
                <span className="max-w-[70px] sm:max-w-[120px] truncate font-extrabold">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
                </span>
              </button>

              {currentUser && onUserLogout && (
                <button
                  onClick={onUserLogout}
                  className="hidden xl:flex p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer shrink-0"
                  title="Log Out Account"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Menu Popover Toggle Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl text-xs font-black border transition-all cursor-pointer relative shrink-0 ${
                  currentTheme === 'light'
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200'
                    : 'bg-[#121215] hover:bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-amber-500/30'
                }`}
                title="Navigation Menu"
              >
                <SlidersHorizontal className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown className={`h-3 w-3 transition-transform text-zinc-400 ${isMenuOpen ? 'rotate-180' : ''}`} />

                {pendingLandlordCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-ping" />
                )}
              </button>

              {/* Menu Drawer Dropdown (White, Black & Golden Accents) */}
              {isMenuOpen && (
                <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-88 max-w-sm bg-[#0a0a0c] border border-amber-500/30 rounded-3xl shadow-2xl p-4 z-50 text-white space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[82vh] overflow-y-auto no-scrollbar">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black">
                        <SlidersHorizontal className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Platform Navigation & Portals
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 1. Fast Navigation & Support */}
                  {onOpenFeedbackModal && (
                    <div className="space-y-1.5 pb-3 border-b border-zinc-800">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block mb-1.5">
                        Support & Resources
                      </span>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenFeedbackModal();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#121215] border border-zinc-800 text-zinc-300 font-bold text-xs flex items-center space-x-2.5 hover:bg-zinc-800 transition-all cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4 text-amber-400" />
                        <span>Help & Support Center</span>
                      </button>
                    </div>
                  )}

                  {/* 2. Theme Toggle (Dark & Light Mode Switcher) */}
                  <div className="flex items-center justify-between p-3 bg-[#121215] rounded-2xl border border-zinc-800 text-xs font-bold">
                    <span className="text-zinc-300 font-medium flex items-center space-x-2">
                      {currentTheme === 'light' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-amber-400" />}
                      <span>Display Theme</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onToggleTheme?.('light')}
                        className={`px-3 py-1 rounded-xl transition-all text-xs font-black flex items-center space-x-1.5 cursor-pointer ${
                          currentTheme === 'light'
                            ? 'bg-amber-400 text-black shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Sun className="h-3.5 w-3.5" />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => onToggleTheme?.('dark')}
                        className={`px-3 py-1 rounded-xl transition-all text-xs font-black flex items-center space-x-1.5 cursor-pointer ${
                          currentTheme === 'dark'
                            ? 'bg-amber-400 text-black shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Moon className="h-3.5 w-3.5" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. My Saved Wishlist Direct Link */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSavedModal();
                    }}
                    className="w-full p-3 rounded-2xl border border-zinc-800 bg-[#121215] hover:bg-zinc-800 text-zinc-200 flex items-center justify-between text-xs font-bold transition-all cursor-pointer hover:border-amber-500/30"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Heart className="h-4 w-4 text-rose-500 shrink-0 fill-rose-500/20" />
                      <span className="font-extrabold text-white">My Saved Wishlist</span>
                    </div>
                    {savedCount > 0 ? (
                      <span className="bg-amber-400 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                        {savedCount} Saved
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-medium">Empty</span>
                    )}
                  </button>

                  {/* 3. Account Portals */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block mb-1">
                      Account & Specialized Portals
                    </span>
                    
                    {/* Renter Profile / Auth */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (currentUser && onOpenUserProfileModal) {
                          onOpenUserProfileModal();
                        } else {
                          onOpenUserAuthModal();
                        }
                      }}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        currentUser
                          ? 'bg-gradient-to-r from-amber-400/15 via-[#121215] to-[#121215] text-white border-amber-500/40 font-black'
                          : 'bg-[#121215] text-zinc-200 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate mr-2">
                        <User className={`h-4 w-4 shrink-0 ${currentUser ? 'text-amber-400' : 'text-zinc-400'}`} />
                        <span className="truncate">{currentUser ? `${currentUser.name} (Tenant Profile)` : 'Tenant Login / Sign Up'}</span>
                      </div>
                      {currentUser ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase shrink-0">
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase shrink-0">
                          Free
                        </span>
                      )}
                    </button>

                    {/* Host / Landlord Portal */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenLandlordAuthModal();
                      }}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        loggedInLandlord
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black border-amber-300 font-black shadow-md shadow-amber-400/20'
                          : 'bg-[#121215] text-zinc-200 border-zinc-800 hover:bg-zinc-800 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate mr-2">
                        <Building2 className={`h-4 w-4 shrink-0 ${loggedInLandlord ? 'text-black' : 'text-amber-400'}`} />
                        <span className="truncate">Property Owner / Host Portal</span>
                      </div>
                      {loggedInLandlord ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-black text-amber-400 shrink-0">
                          Host Active
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                          Hosts Only
                        </span>
                      )}
                    </button>

                    {/* Super Admin Center */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAdminModal();
                      }}
                      className="w-full p-3 rounded-2xl border border-zinc-800 bg-[#121215] hover:bg-zinc-800 text-zinc-200 flex items-center justify-between text-xs font-bold transition-all cursor-pointer hover:border-zinc-700"
                    >
                      <div className="flex items-center space-x-2.5 truncate mr-2">
                        <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                        <span className="truncate">Admin Control Center</span>
                      </div>
                      {pendingLandlordCount > 0 ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black shrink-0">
                          {pendingLandlordCount} PENDING
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 shrink-0">
                          Admin
                        </span>
                      )}
                    </button>

                    {/* Firebase Cloud Sync Portal */}
                    {onOpenFirebaseSync && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenFirebaseSync();
                        }}
                        className="w-full p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center space-x-2.5 truncate mr-2">
                          <Database className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                          <span className="truncate font-black">Firebase Cloud Sync</span>
                        </div>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black shrink-0">
                          CLOUD DB
                        </span>
                      </button>
                    )}

                    {/* Logout Buttons */}
                    {(currentUser || loggedInLandlord) && (
                      <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                        {currentUser && onUserLogout && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onUserLogout();
                            }}
                            className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center space-x-2 text-xs font-black transition-all cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout Tenant ({currentUser.name.split(' ')[0]})</span>
                          </button>
                        )}

                        {loggedInLandlord && onLandlordLogout && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onLandlordLogout();
                            }}
                            className="w-full p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center justify-center space-x-2 text-xs font-black transition-all cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout Host ({loggedInLandlord.name.split(' ')[0]})</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Category Scroll Strip (When in 'rent' mode) */}
      {activeMode === 'rent' && (
        <div className={`border-t px-3 sm:px-6 py-2 transition-colors relative z-30 ${
          currentTheme === 'light'
            ? 'bg-zinc-50/95 border-zinc-200'
            : 'bg-[#09090b]/98 border-amber-500/15'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
            
            {/* Scrollable Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 max-w-full flex-1">
              {allCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                    }}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer border whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/20 font-black'
                        : currentTheme === 'light'
                          ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950'
                          : 'bg-[#121215] text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-amber-500/30'
                    }`}
                  >
                    <span className="shrink-0">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* MOBILE & TABLET BOTTOM FLOATING DOCK (White, Black & Golden Theme) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-t border-amber-500/20 py-2 px-3 flex items-center justify-around text-white shadow-2xl">
        
        {/* 1. Explore */}
        <button
          onClick={() => {
            if (setActiveMode) setActiveMode('rent');
          }}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeMode === 'rent' ? 'text-amber-400 font-black scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Store className="h-5 w-5" />
          <span className="text-[10px] tracking-tight font-bold">Explore</span>
        </button>

        {/* 2. Bookings */}
        <button
          onClick={() => {
            if (currentUser) {
              if (setActiveMode) setActiveMode('bookings');
            } else {
              onOpenUserAuthModal();
            }
          }}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeMode === 'bookings' ? 'text-amber-400 font-black scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-[10px] tracking-tight font-bold">Bookings</span>
          {bookingsCount > 0 && (
            <span className="absolute -top-0.5 right-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
              {bookingsCount}
            </span>
          )}
        </button>

        {/* 3. 5-10km Radar */}
        {onOpenRadarModal && (
          <button
            onClick={onOpenRadarModal}
            className="flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-xl text-emerald-400 font-bold transition-all cursor-pointer"
          >
            <div className="relative">
              <Navigation className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-[10px] tracking-tight font-bold">Radar</span>
          </button>
        )}

        {/* 4. AI Help */}
        <button
          onClick={onOpenAIModal}
          className="flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-xl text-amber-400 font-bold transition-all cursor-pointer"
        >
          <Sparkles className="h-5 w-5 animate-bounce" />
          <span className="text-[10px] tracking-tight font-bold">AI Help</span>
        </button>

        {/* 5. Saved Wishlist */}
        <button
          onClick={onOpenSavedModal}
          className="flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer relative"
        >
          <Heart className="h-5 w-5 text-rose-500" />
          <span className="text-[10px] tracking-tight font-bold">Saved</span>
          {savedCount > 0 && (
            <span className="absolute -top-0.5 right-1 bg-amber-400 text-black font-black text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
              {savedCount}
            </span>
          )}
        </button>

        {/* 6. Profile / Login */}
        <button
          onClick={() => {
            if (currentUser && onOpenUserProfileModal) {
              onOpenUserProfileModal();
            } else {
              onOpenUserAuthModal();
            }
          }}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentUser ? 'text-amber-400 font-black' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] tracking-tight truncate max-w-[48px] font-bold">
            {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
          </span>
        </button>

      </nav>

    </header>
  );
};
