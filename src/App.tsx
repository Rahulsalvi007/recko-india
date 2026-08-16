import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CategoryHeader } from './components/CategoryHeader';
import { PropertyCard } from './components/PropertyCard';
import { RoommateCard } from './components/RoommateCard';
import { VehicleCard } from './components/VehicleCard';
import { HotelCard } from './components/HotelCard';
import { HotelDetailModal } from './components/HotelDetailModal';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { LibraryCard } from './components/LibraryCard';
import { LibraryDetailModal } from './components/LibraryDetailModal';
import { DirectionsMapModal } from './components/DirectionsMapModal';
import { WishlistModal } from './components/WishlistModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { VehicleTrackingModal } from './components/VehicleTrackingModal';
import { LandlordListingModal } from './components/LandlordListingModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BookingReceiptModal } from './components/BookingReceiptModal';
import { BookingRequestModal } from './components/BookingRequestModal';
import { LandlordAuthModal } from './components/LandlordAuthModal';
import { LandlordDashboardModal } from './components/LandlordDashboardModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { EditListingModal } from './components/EditListingModal';
import { MyBookingsSection } from './components/MyBookingsSection';
import { UserAuthModal } from './components/UserAuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { GeneralItemCard } from './components/GeneralItemCard';
import { GeneralItemDetailModal } from './components/GeneralItemDetailModal';
import { ClothingCard } from './components/ClothingCard';
import { SportsTurfCard } from './components/SportsTurfCard';
import { AIRecommendedSection } from './components/AIRecommendedSection';
import { AllAssetsShowcase } from './components/AllAssetsShowcase';
import { FeedbackModal } from './components/FeedbackModal';
import { NearbyRadarModal } from './components/NearbyRadarModal';
import { RoommateChatModal } from './components/RoommateChatModal';
import { PostRoommateModal } from './components/PostRoommateModal';
import { BookingChatModal, ChatItemContext } from './components/BookingChatModal';
import { Footer } from './components/Footer';

import {
  MainCategory,
  Property,
  Vehicle,
  GeneralItem,
  ClothingItem,
  SportsTurfItem,
  RoommateProfile,
  RentalBooking,
  LandlordUser,
  UserProfile,
  Hotel,
  HotelRoom,
  Restaurant,
  Library,
  WishlistItem,
  AppNotification
} from './types';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMMATES,
  INITIAL_VEHICLES,
  INITIAL_GENERAL_ITEMS,
  INITIAL_LANDLORDS,
  INITIAL_HOTELS,
  INITIAL_RESTAURANTS,
  INITIAL_LIBRARIES,
  MOCK_CLOTHING_ITEMS,
  MOCK_SPORTS_TURFS
} from './data/mockData';
import {
  subscribeCollection,
  saveDocument,
  updateDocument,
  deleteDocument,
  seedDatabaseIfEmpty
} from './lib/firebase';

export default function App() {
  // Theme State: 'light' | 'dark'
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('renthub_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('renthub_theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  // Navigation & Mode & Category States
  const [activeMode, setActiveMode] = useState<'rent' | 'bookings'>('rent');
  const [activeCategory, setActiveCategory] = useState<MainCategory>('all');
  const [selectedSubType, setSelectedSubType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<number>(250000);

  // Helper for flexible user-entered city matching
  const isCityMatch = (itemCity: string) => {
    if (!selectedCity || selectedCity.trim() === '' || selectedCity === 'All Cities') return true;
    return itemCity.toLowerCase().includes(selectedCity.trim().toLowerCase());
  };
  const [furnishingFilter, setFurnishingFilter] = useState<string>('ALL');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [studentViewTab, setStudentViewTab] = useState<'properties' | 'roommates'>('properties');
  const [driverFilter, setDriverFilter] = useState<boolean>(false);

  // Data State with LocalStorage Persistence
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('renthub_properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('renthub_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [hotels, setHotels] = useState<Hotel[]>(() => {
    const saved = localStorage.getItem('renthub_hotels');
    return saved ? JSON.parse(saved) : INITIAL_HOTELS;
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('renthub_restaurants');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [libraries, setLibraries] = useState<Library[]>(() => {
    const saved = localStorage.getItem('renthub_libraries');
    return saved ? JSON.parse(saved) : INITIAL_LIBRARIES;
  });

  const [generalItems, setGeneralItems] = useState<GeneralItem[]>(() => {
    const saved = localStorage.getItem('renthub_general_items');
    return saved ? JSON.parse(saved) : INITIAL_GENERAL_ITEMS;
  });

  const [clothingItems, setClothingItems] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem('renthub_clothing');
    return saved ? JSON.parse(saved) : MOCK_CLOTHING_ITEMS;
  });

  const [sportsTurfItems, setSportsTurfItems] = useState<SportsTurfItem[]>(() => {
    const saved = localStorage.getItem('renthub_sports');
    return saved ? JSON.parse(saved) : MOCK_SPORTS_TURFS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('renthub_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-1',
        title: 'Welcome to Recko India!',
        message: 'Explore zero brokerage homes, luxury hotels, wedding clothes, and sports turfs.',
        type: 'system',
        timestamp: 'Just now',
        read: false
      },
      {
        id: 'notif-2',
        title: 'AI Smart Recommendation',
        message: 'Top 3 rentals matched for your budget and city are now displayed.',
        type: 'ai_alert',
        timestamp: '2 mins ago',
        read: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('renthub_general_items', JSON.stringify(generalItems));
  }, [generalItems]);

  useEffect(() => {
    localStorage.setItem('renthub_clothing', JSON.stringify(clothingItems));
  }, [clothingItems]);

  useEffect(() => {
    localStorage.setItem('renthub_sports', JSON.stringify(sportsTurfItems));
  }, [sportsTurfItems]);

  useEffect(() => {
    localStorage.setItem('renthub_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [landlords, setLandlords] = useState<LandlordUser[]>(() => {
    const saved = localStorage.getItem('renthub_landlords');
    return saved ? JSON.parse(saved) : INITIAL_LANDLORDS;
  });

  const [loggedInLandlord, setLoggedInLandlord] = useState<LandlordUser | null>(() => {
    const saved = localStorage.getItem('renthub_logged_landlord');
    return saved ? JSON.parse(saved) : null;
  });

  // User Profile State (Free Renter Account)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('renthub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleUserLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('renthub_user', JSON.stringify(user));

    // Personalized private notification for this specific logged-in user
    const welcomeNotif: AppNotification = {
      id: `notif-welcome-${Date.now()}`,
      title: `Welcome back, ${user.name.split(' ')[0]}!`,
      message: `You are logged in as ${user.email}. Check your verified bookings, student benefits & active rentals anytime.`,
      timestamp: 'Just now',
      read: false,
      type: 'system',
      userEmail: user.email,
      userId: (user as any).id || user.email,
      recipientRole: 'user'
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('renthub_user');
  };

  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [selectedGeneralItem, setSelectedGeneralItem] = useState<GeneralItem | null>(null);

  const [bookings, setBookings] = useState<RentalBooking[]>(() => {
    const saved = localStorage.getItem('renthub_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Filter bookings strictly for the currently logged-in user's email
  const userBookings = useMemo(() => {
    if (!currentUser || !currentUser.email) return [];
    const lowerUserEmail = currentUser.email.toLowerCase().trim();

    return bookings.filter((b) => {
      return Boolean(b.userEmail && b.userEmail.toLowerCase().trim() === lowerUserEmail);
    });
  }, [bookings, currentUser]);

  // Filter notifications strictly for the active logged-in user or landlord (Zero leak to unauthenticated or other users)
  const activeUserNotifications = useMemo(() => {
    if (!currentUser && !loggedInLandlord) {
      return []; // Do not display notifications if not logged in
    }

    return notifications.filter((n) => {
      // 1. If Tenant / User is logged in
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase().trim();
        const userId = (currentUser as any).id;

        // Explicit user match
        if (n.userEmail || n.userId) {
          const emailMatch = Boolean(n.userEmail && n.userEmail.toLowerCase().trim() === userEmail);
          const idMatch = Boolean(n.userId && n.userId === userId);
          return emailMatch || idMatch;
        }

        // Exclude landlord-only alerts
        if (n.ownerId || n.ownerEmail || n.recipientRole === 'landlord') {
          return false;
        }

        // Allow general user broadcast notifications
        return n.recipientRole === 'user' || n.recipientRole === 'all' || (!n.ownerId && !n.ownerEmail && !n.userEmail && !n.userId);
      }

      // 2. If Owner / Landlord is logged in
      if (loggedInLandlord) {
        const ownerId = loggedInLandlord.id;
        const ownerEmail = loggedInLandlord.email?.toLowerCase().trim();

        // Explicit landlord match
        if (n.ownerId || n.ownerEmail) {
          const idMatch = Boolean(n.ownerId && n.ownerId === ownerId);
          const emailMatch = Boolean(n.ownerEmail && n.ownerEmail.toLowerCase().trim() === ownerEmail);
          return idMatch || emailMatch;
        }

        // Exclude tenant-only alerts
        if (n.userEmail || n.userId || n.recipientRole === 'user') {
          return false;
        }

        // Allow general landlord broadcast notifications
        return n.recipientRole === 'landlord' || n.recipientRole === 'all';
      }

      return false;
    });
  }, [notifications, currentUser, loggedInLandlord]);

  const [roommates, setRoommates] = useState<RoommateProfile[]>(INITIAL_ROOMMATES);
  const [activeChatRoommate, setActiveChatRoommate] = useState<RoommateProfile | null>(null);
  const [activeBookingChat, setActiveBookingChat] = useState<{ booking: RentalBooking; role: 'owner' | 'renter' } | null>(null);
  const [activeDirectChatContext, setActiveDirectChatContext] = useState<ChatItemContext | null>(null);
  const [isPostRoommateModalOpen, setIsPostRoommateModalOpen] = useState(false);
  const [roommateDistanceFilter, setRoommateDistanceFilter] = useState<number>(10);
  const [roommateGenderFilter, setRoommateGenderFilter] = useState<string>('ALL');
  const [roommateDietFilter, setRoommateDietFilter] = useState<string>('ALL');

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('renthub_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('renthub_saved');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal Control States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isLandlordModalOpen, setIsLandlordModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // New Admin & Landlord Portals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLandlordAuthModalOpen, setIsLandlordAuthModalOpen] = useState(false);
  const [isLandlordDashboardOpen, setIsLandlordDashboardOpen] = useState(false);

  // Edit Web Listing State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Property | Vehicle | Hotel | Restaurant | Library | null>(null);
  const [itemToEditType, setItemToEditType] = useState<'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library'>('property');

  const handleOpenEdit = (item: Property | Vehicle | Hotel | Restaurant | Library, type: 'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library') => {
    setItemToEdit(item);
    setItemToEditType(type);
    setIsEditModalOpen(true);
  };

  const handleSavePropertyUpdate = async (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await saveDocument('properties', updated.id, updated);
  };

  const handleSaveVehicleUpdate = async (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    await saveDocument('vehicles', updated.id, updated);
  };

  const handleSaveHotelUpdate = async (updated: Hotel) => {
    setHotels((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    await saveDocument('hotels', updated.id, updated);
  };

  const handleSaveRestaurantUpdate = async (updated: Restaurant) => {
    setRestaurants((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    await saveDocument('restaurants', updated.id, updated);
  };

  const handleSaveLibraryUpdate = async (updated: Library) => {
    setLibraries((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    await saveDocument('libraries', updated.id, updated);
  };

  const handleUploadAllDataToFirebase = async () => {
    for (const p of properties) {
      await saveDocument('properties', p.id, p);
    }
    for (const v of vehicles) {
      await saveDocument('vehicles', v.id, v);
    }
    for (const h of hotels) {
      await saveDocument('hotels', h.id, h);
    }
    for (const r of restaurants) {
      await saveDocument('restaurants', r.id, r);
    }
    for (const l of libraries) {
      await saveDocument('libraries', l.id, l);
    }
    for (const land of landlords) {
      await saveDocument('landlords', land.id, land);
    }
    for (const b of bookings) {
      await saveDocument('bookings', b.id, b);
    }
    for (const g of generalItems) {
      await saveDocument('general_items', g.id, g);
    }
    for (const c of clothingItems) {
      await saveDocument('clothing', c.id, c);
    }
    for (const s of sportsTurfItems) {
      await saveDocument('sports_turfs', s.id, s);
    }
  };

  // Active Detail / Interactive Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [mapItem, setMapItem] = useState<{ id: string; title: string; location: string; city: string; distances?: any } | null>(null);

  const [trackingVehicle, setTrackingVehicle] = useState<Vehicle | null>(null);
  const [activeBookingReceipt, setActiveBookingReceipt] = useState<RentalBooking | null>(null);
  const [roommateChatNotice, setRoommateChatNotice] = useState<RoommateProfile | null>(null);

  // Booking Request Modal Flow State
  const [bookingRequestItem, setBookingRequestItem] = useState<{
    id: string;
    title: string;
    category: MainCategory | 'property' | 'vehicle' | 'hotel' | 'restaurant' | 'library';
    image: string;
    location: string;
    city: string;
    price: number;
    priceLabel: string;
    ownerName: string;
    ownerContact?: string;
    ownerId?: string;
    deposit?: number;
  } | null>(null);

  const [tokenAmount, setTokenAmount] = useState<number>(() => {
    const saved = localStorage.getItem('renthub_booking_token_amount');
    return saved ? Number(saved) : 99;
  });

  const handleUpdateTokenAmount = (newAmount: number) => {
    setTokenAmount(newAmount);
    localStorage.setItem('renthub_booking_token_amount', newAmount.toString());
  };

  const handleUpdateBookingStatus = (id: string, newStatus: any, rejectionReason?: string) => {
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: newStatus,
              ...(rejectionReason ? { rejectionReason, tokenPaymentStatus: 'Refunded' as const } : {}),
              decisionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            }
          : b
      );
      localStorage.setItem('renthub_bookings', JSON.stringify(updated));
      return updated;
    });

    const target = bookings.find((b) => b.id === id);
    const updatedTarget: any = target
      ? {
          ...target,
          status: newStatus,
          ...(rejectionReason ? { rejectionReason, tokenPaymentStatus: 'Refunded' } : {}),
          decisionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }
      : { status: newStatus };

    saveDocument('bookings', id, updatedTarget);

    const isApproved = newStatus === 'Accepted' || newStatus === 'Approved';
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: isApproved
        ? `Booking Approved: ${target?.itemTitle || 'Rental Asset'}`
        : `Booking Request Declined: ${target?.itemTitle || 'Rental Asset'}`,
      message: isApproved
        ? `Great news! The host ${target?.ownerName || ''} has APPROVED your booking request for ${target?.itemTitle || 'your rental'}. Move-In / Start: ${target?.startDate || 'Confirmed'}.`
        : `Your booking request for ${target?.itemTitle || 'your rental'} was declined by the host.${rejectionReason ? ` Reason: "${rejectionReason}".` : ''} Your ₹${target?.tokenPaidAmount || 99} token refund has been initiated.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking',
      userEmail: target?.userEmail,
      targetPhone: target?.userPhone,
      recipientRole: 'user'
    };
    setNotifications((prev) => [notif, ...prev]);
    saveDocument('notifications', notif.id, notif);
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem('renthub_bookings', JSON.stringify(updated));
      return updated;
    });
    deleteDocument('bookings', id);
  };

  // Save to LocalStorage & Firebase Sync
  useEffect(() => {
    // Seed default data into Firestore if empty
    seedDatabaseIfEmpty();

    // Subscribe to Firestore collections in real time
    const unsubProp = subscribeCollection<Property>('properties', (data) => {
      if (data.length > 0) setProperties(data);
    });
    const unsubVeh = subscribeCollection<Vehicle>('vehicles', (data) => {
      if (data.length > 0) setVehicles(data);
    });
    const unsubHot = subscribeCollection<Hotel>('hotels', (data) => {
      if (data.length > 0) setHotels(data);
    });
    const unsubRest = subscribeCollection<Restaurant>('restaurants', (data) => {
      if (data.length > 0) setRestaurants(data);
    });
    const unsubLib = subscribeCollection<Library>('libraries', (data) => {
      if (data.length > 0) setLibraries(data);
    });
    const unsubLand = subscribeCollection<LandlordUser>('landlords', (data) => {
      if (data.length > 0) setLandlords(data);
    });
    const unsubBook = subscribeCollection<RentalBooking>('bookings', (data) => {
      if (data.length > 0) setBookings(data);
    });
    const unsubSaved = subscribeCollection<WishlistItem>('saved_items', (data) => {
      if (data.length > 0) {
        setWishlist(data);
        setSavedIds(data.map((item) => item.id));
      }
    });
    const unsubRm = subscribeCollection<RoommateProfile>('roommates', (data) => {
      if (data.length > 0) setRoommates(data);
    });
    const unsubGen = subscribeCollection<GeneralItem>('general_items', (data) => {
      if (data.length > 0) setGeneralItems(data);
    });
    const unsubCloth = subscribeCollection<ClothingItem>('clothing', (data) => {
      if (data.length > 0) setClothingItems(data);
    });
    const unsubTurf = subscribeCollection<SportsTurfItem>('sports_turfs', (data) => {
      if (data.length > 0) setSportsTurfItems(data);
    });
    const unsubNotif = subscribeCollection<AppNotification>('notifications', (data) => {
      if (data.length > 0) setNotifications(data);
    });

    return () => {
      unsubProp();
      unsubVeh();
      unsubHot();
      unsubRest();
      unsubLib();
      unsubLand();
      unsubBook();
      unsubSaved();
      unsubRm();
      unsubGen();
      unsubCloth();
      unsubTurf();
      unsubNotif();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('renthub_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('renthub_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('renthub_hotels', JSON.stringify(hotels));
  }, [hotels]);

  useEffect(() => {
    localStorage.setItem('renthub_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('renthub_libraries', JSON.stringify(libraries));
  }, [libraries]);

  useEffect(() => {
    localStorage.setItem('renthub_landlords', JSON.stringify(landlords));
  }, [landlords]);

  useEffect(() => {
    if (loggedInLandlord) {
      localStorage.setItem('renthub_logged_landlord', JSON.stringify(loggedInLandlord));
    } else {
      localStorage.removeItem('renthub_logged_landlord');
    }
  }, [loggedInLandlord]);

  useEffect(() => {
    localStorage.setItem('renthub_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('renthub_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('renthub_saved', JSON.stringify(savedIds));
  }, [savedIds]);

  // Wishlist toggle for any category item
  const toggleWishlist = (item: { id: string; title: string; category: string; location: string; city: string; image: string; priceDisplay: string }) => {
    const exists = wishlist.some((w) => w.id === item.id);
    if (exists) {
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      deleteDocument('saved_items', item.id);
    } else {
      const newItem: WishlistItem = {
        id: item.id,
        itemId: item.id,
        category: item.category as MainCategory,
        title: item.title,
        image: item.image,
        location: item.location,
        city: item.city,
        priceDisplay: item.priceDisplay,
        rating: 4.8,
        savedAt: new Date().toISOString()
      };
      setWishlist((prev) => [newItem, ...prev]);
      saveDocument('saved_items', newItem.id, newItem);
    }
    toggleSave(item.id);
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Landlord Add Property Handler
  const handleAddProperty = (newProp: Property) => {
    const taggedProp = {
      ...newProp,
      ownerId: loggedInLandlord ? loggedInLandlord.id : (newProp.ownerId || 'owner-verified'),
      ownerName: loggedInLandlord ? loggedInLandlord.name : (newProp.ownerName || 'Property Owner'),
      status: 'Approved' as const
    };
    setProperties((prev) => [taggedProp, ...prev]);
    saveDocument('properties', taggedProp.id, taggedProp);
  };

  // Landlord Add Vehicle Handler
  const handleAddVehicle = (newVeh: Vehicle) => {
    const taggedVeh = {
      ...newVeh,
      ownerId: loggedInLandlord ? loggedInLandlord.id : (newVeh.ownerId || 'owner-verified'),
      ownerName: loggedInLandlord ? loggedInLandlord.name : (newVeh.ownerName || 'Vehicle Owner'),
      status: 'Approved' as const
    };
    setVehicles((prev) => [taggedVeh, ...prev]);
    saveDocument('vehicles', taggedVeh.id, taggedVeh);
  };

  // Landlord Add Clothing Handler
  const handleAddClothing = (newCloth: ClothingItem) => {
    const taggedCloth = {
      ...newCloth,
      ownerId: loggedInLandlord ? loggedInLandlord.id : (newCloth.ownerId || 'owner-verified'),
      ownerName: loggedInLandlord ? loggedInLandlord.name : (newCloth.ownerName || 'Boutique Owner'),
      status: 'Approved' as const
    };
    setClothingItems((prev) => [taggedCloth, ...prev]);
    saveDocument('clothing', taggedCloth.id, taggedCloth);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: '👔 New Wedding Attire Listed!',
      message: `${newCloth.clothingType} (${newCloth.gender}) is now live for rental booking.`,
      type: 'system',
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Landlord Add Sports Turf Handler
  const handleAddSportsTurf = (newTurf: SportsTurfItem) => {
    const taggedTurf = {
      ...newTurf,
      ownerId: loggedInLandlord ? loggedInLandlord.id : (newTurf.ownerId || 'owner-verified'),
      ownerName: loggedInLandlord ? loggedInLandlord.name : (newTurf.ownerName || 'Turf Owner'),
      status: 'Approved' as const
    };
    setSportsTurfItems((prev) => [taggedTurf, ...prev]);
    saveDocument('sports_turfs', taggedTurf.id, taggedTurf);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: '🏆 New Sports Turf / Ground Listed!',
      message: `${newTurf.turfType} in ${newTurf.location} is now available for hourly booking.`,
      type: 'system',
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Admin approval / rejection handlers
  const handleApproveLandlord = (id: string) => {
    setLandlords((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Approved' } : l))
    );
    if (loggedInLandlord && loggedInLandlord.id === id) {
      setLoggedInLandlord((prev) => prev ? { ...prev, status: 'Approved' } : null);
    }
    updateDocument('landlords', id, { status: 'Approved' });
  };

  const handleRejectLandlord = (id: string) => {
    setLandlords((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Rejected' } : l))
    );
    if (loggedInLandlord && loggedInLandlord.id === id) {
      setLoggedInLandlord((prev) => prev ? { ...prev, status: 'Rejected' } : null);
    }
    updateDocument('landlords', id, { status: 'Rejected' });
  };

  const handleRequestRegisterLandlord = (newUser: LandlordUser) => {
    setLandlords((prev) => [newUser, ...prev]);
    saveDocument('landlords', newUser.id, newUser);
  };

  const handleOpenLandlordListingModal = () => {
    if (!loggedInLandlord) {
      alert('Owner Registration or Login Required!\n\nOnly verified Owners can upload properties and rental listings. Please Register or Log In as an Owner first.');
      setIsLandlordAuthModalOpen(true);
    } else if (loggedInLandlord.status === 'Pending') {
      alert(`Account Pending Admin Approval!\n\nYour Owner ID (${loggedInLandlord.id}) is currently PENDING Admin Approval. Once System Admin verifies your registration, you will be able to upload properties and listings.`);
      setIsLandlordDashboardOpen(true);
    } else if (loggedInLandlord.status === 'Rejected') {
      alert('Your Owner account application was rejected by Admin. You cannot upload properties.');
    } else if (loggedInLandlord.status === 'Approved') {
      setIsLandlordModalOpen(true);
    } else {
      setIsLandlordAuthModalOpen(true);
    }
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    deleteDocument('properties', id);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    deleteDocument('vehicles', id);
  };

  // User Account Deletion Handler (with Email OTP Verification)
  const handleDeleteUserAccount = async () => {
    if (!currentUser) return;
    const userEmail = currentUser.email;
    const userId = (currentUser as any).id || userEmail;

    // Remove from Firestore
    await deleteDocument('users', userId);

    // Remove from users list in localStorage
    try {
      const saved = localStorage.getItem('renthub_users_list');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          const filtered = list.filter((u: any) => u.email?.toLowerCase() !== userEmail.toLowerCase() && u.id !== userId);
          localStorage.setItem('renthub_users_list', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Clear active user session
    setCurrentUser(null);
    localStorage.removeItem('renthub_user');
    setIsUserProfileModalOpen(false);
    setIsUserAuthModalOpen(false);

    // Add system notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'User Account Permanently Deleted',
      message: `Your user account (${userEmail}) and preferences have been deleted.`,
      timestamp: 'Just now',
      read: false,
      type: 'system'
    };
    setNotifications((prev) => [notif, ...prev]);

    alert('Your user account has been successfully deleted.');
  };

  // Landlord / Owner Account Deletion Handler (with Email OTP Verification)
  const handleDeleteLandlordAccount = async (landlordId: string) => {
    const targetLandlord = landlords.find((l) => l.id === landlordId) || loggedInLandlord;
    const landlordName = targetLandlord?.name || 'Owner';
    const landlordEmail = targetLandlord?.email || '';

    // 1. Remove from state & Firestore
    setLandlords((prev) => prev.filter((l) => l.id !== landlordId));
    await deleteDocument('landlords', landlordId);

    // 2. Remove landlord's listed properties and vehicles
    setProperties((prev) => {
      const filtered = prev.filter((p) => p.ownerId !== landlordId);
      localStorage.setItem('renthub_properties', JSON.stringify(filtered));
      return filtered;
    });

    setVehicles((prev) => {
      const filtered = prev.filter((v) => v.ownerId !== landlordId);
      localStorage.setItem('renthub_vehicles', JSON.stringify(filtered));
      return filtered;
    });

    // 3. Clear loggedInLandlord session if deleting current session
    if (loggedInLandlord?.id === landlordId) {
      setLoggedInLandlord(null);
      localStorage.removeItem('renthub_logged_landlord');
    }

    setIsLandlordDashboardOpen(false);

    // 4. Add system notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Owner Account Deleted',
      message: `Owner account ${landlordName} (${landlordEmail}) and all associated listings have been deleted.`,
      timestamp: 'Just now',
      read: false,
      type: 'system'
    };
    setNotifications((prev) => [notif, ...prev]);

    alert('Owner / Landlord account and all associated listings have been permanently deleted.');
  };

  // AI Fake & Duplicate Image Removal & Owner Notification Dispatcher
  const handleRemoveDuplicateImage = (
    assetId: string,
    assetType: string,
    imageUrl: string,
    ownerName: string,
    ownerContact: string,
    reason: string
  ) => {
    // 1. Remove duplicate image from the appropriate collection
    if (assetType === 'Property') {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id === assetId) {
            const currentImgs = p.images && p.images.length > 0 ? p.images : [p.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
            const updated = {
              ...p,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('properties', p.id, updated);
            return updated;
          }
          return p;
        })
      );
    } else if (assetType === 'Vehicle') {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === assetId) {
            const currentImgs = v.images && v.images.length > 0 ? v.images : [v.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80';
            const updated = {
              ...v,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('vehicles', v.id, updated);
            return updated;
          }
          return v;
        })
      );
    } else if (assetType === 'Hotel') {
      setHotels((prev) =>
        prev.map((h) => {
          if (h.id === assetId) {
            const currentImgs = h.images && h.images.length > 0 ? h.images : [h.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
            const updated = {
              ...h,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('hotels', h.id, updated);
            return updated;
          }
          return h;
        })
      );
    } else if (assetType === 'Restaurant') {
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id === assetId) {
            const currentImgs = r.images && r.images.length > 0 ? r.images : [r.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
            const updated = {
              ...r,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('restaurants', r.id, updated);
            return updated;
          }
          return r;
        })
      );
    } else if (assetType === 'Library') {
      setLibraries((prev) =>
        prev.map((l) => {
          if (l.id === assetId) {
            const currentImgs = l.images && l.images.length > 0 ? l.images : [l.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80';
            const updated = {
              ...l,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('libraries', l.id, updated);
            return updated;
          }
          return l;
        })
      );
    } else if (assetType === 'Clothing') {
      setClothingItems((prev) =>
        prev.map((c) => {
          if (c.id === assetId) {
            const currentImgs = c.images && c.images.length > 0 ? c.images : [c.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80';
            const updated = {
              ...c,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('clothing', c.id, updated);
            return updated;
          }
          return c;
        })
      );
    } else if (assetType === 'SportsTurf') {
      setSportsTurfItems((prev) =>
        prev.map((s) => {
          if (s.id === assetId) {
            const currentImgs = s.images && s.images.length > 0 ? s.images : [s.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1529900245534-47fbf8204bca?w=800&q=80';
            const updated = {
              ...s,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('sports_turfs', s.id, updated);
            return updated;
          }
          return s;
        })
      );
    } else if (assetType === 'GeneralItem') {
      setGeneralItems((prev) =>
        prev.map((g) => {
          if (g.id === assetId) {
            const currentImgs = g.images && g.images.length > 0 ? g.images : [g.imageUrl];
            const filtered = currentImgs.filter((img) => img !== imageUrl);
            const fallback = filtered[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80';
            const updated = {
              ...g,
              imageUrl: fallback,
              images: filtered.length > 0 ? filtered : [fallback]
            };
            saveDocument('general_items', g.id, updated);
            return updated;
          }
          return g;
        })
      );
    }

    // 2. Dispatch persistent system notification to the owner
    const newNotif: AppNotification = {
      id: `notif-dup-${Date.now()}`,
      title: `⚠️ Duplicate Photo Removed: Listing ID ${assetId}`,
      message: `Recko India AI Anti-Fraud Engine detected an unverified/duplicate image on your listing. The duplicate photo was removed to protect platform authenticity. Reason: ${reason}. Please upload fresh authentic photos taken by you.`,
      timestamp: 'Just now',
      read: false,
      type: 'image_removed',
      assetId,
      recipientRole: 'landlord'
    };
    setNotifications((prev) => [newNotif, ...prev]);
    saveDocument('notifications', newNotif.id, newNotif);
  };

  // Confirm Hotel Room Booking
  const handleConfirmHotelBooking = (details: {
    hotel: Hotel;
    selectedRoom: HotelRoom;
    checkInDate: string;
    checkOutDate: string;
    guestsCount: number;
    totalPrice: number;
    nightsCount: number;
  }) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    const newBooking: RentalBooking = {
      id: `RH-HOT-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'hotel',
      itemId: details.hotel.id,
      itemTitle: `${details.hotel.title} (${details.selectedRoom.roomType})`,
      itemImage: details.hotel.images[0],
      startDate: details.checkInDate,
      endDate: details.checkOutDate,
      daysCount: details.nightsCount,
      totalPrice: details.totalPrice,
      tokenPaidAmount: 99,
      tokenPaymentStatus: 'Paid',
      status: 'Pending Verification',
      bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      userName: currentUser.name || 'Valued Guest',
      userEmail: currentUser.email,
      userPhone: currentUser.phone || '+91 98765 43210',
      ownerId: details.hotel.ownerId || 'owner-hotel-1',
      ownerName: details.hotel.ownerName || 'Grand Heritage Hotel Manager',
      ownerContact: details.hotel.ownerContact || '+91 98765 43210',
      hotelRoomType: details.selectedRoom.roomType,
      guestsCount: details.guestsCount
    };

    setBookings((prev) => [newBooking, ...prev]);
    saveDocument('bookings', newBooking.id, newBooking);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Hotel Booking Request Dispatched: ${details.hotel.title}`,
      message: `Your booking request for ${details.hotel.title} (${details.selectedRoom.roomType}) has been sent to the hotel manager. Awaiting confirmation.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking',
      userEmail: currentUser.email,
      userId: (currentUser as any).id || currentUser.email,
      recipientRole: 'user'
    };
    setNotifications((prev) => [notif, ...prev]);
    saveDocument('notifications', notif.id, notif);

    setSelectedHotel(null);
    setActiveBookingReceipt(newBooking);
  };

  // Confirm Restaurant Table Reservation
  const handleConfirmRestaurantReservation = (details: {
    restaurant: Restaurant;
    tableType: string;
    reservationDate: string;
    reservationTime: string;
    guestsCount: number;
    specialRequest?: string;
  }) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    const newBooking: RentalBooking = {
      id: `RH-REST-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'restaurant',
      itemId: details.restaurant.id,
      itemTitle: `${details.restaurant.title} - ${details.tableType}`,
      itemImage: details.restaurant.images[0],
      startDate: `${details.reservationDate} at ${details.reservationTime}`,
      daysCount: 1,
      totalPrice: details.restaurant.averageCostForTwo,
      tokenPaidAmount: 99,
      tokenPaymentStatus: 'Paid',
      status: 'Pending Verification',
      bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      userName: currentUser.name || 'Valued Diner',
      userEmail: currentUser.email,
      userPhone: currentUser.phone || '+91 98765 43210',
      ownerId: details.restaurant.ownerId || 'owner-rest-1',
      ownerName: details.restaurant.ownerName || 'Restaurant Host Manager',
      ownerContact: details.restaurant.ownerContact || '+91 98765 43210',
      restaurantTime: details.reservationTime,
      restaurantTableType: details.tableType,
      guestsCount: details.guestsCount
    };

    setBookings((prev) => [newBooking, ...prev]);
    saveDocument('bookings', newBooking.id, newBooking);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Table Reservation Request Sent: ${details.restaurant.title}`,
      message: `Your table reservation for ${details.restaurant.title} has been sent to the restaurant host.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking',
      userEmail: currentUser.email,
      userId: (currentUser as any).id || currentUser.email,
      recipientRole: 'user'
    };
    setNotifications((prev) => [notif, ...prev]);
    saveDocument('notifications', notif.id, notif);

    setSelectedRestaurant(null);
    setActiveBookingReceipt(newBooking);
  };

  // Confirm Library Pass Booking
  const handleConfirmLibraryPassBooking = (details: {
    library: Library;
    passType: 'Daily Pass' | 'Weekly Pass' | 'Monthly Pass';
    allocatedSeatNumber: string;
    startDate: string;
    totalPrice: number;
    qrCodePass: string;
  }) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    const newBooking: RentalBooking = {
      id: `RH-LIB-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'library',
      itemId: details.library.id,
      itemTitle: `${details.library.title} (${details.passType} - ${details.allocatedSeatNumber})`,
      itemImage: details.library.images[0],
      startDate: details.startDate,
      daysCount: details.passType === 'Daily Pass' ? 1 : details.passType === 'Weekly Pass' ? 7 : 30,
      totalPrice: details.totalPrice,
      tokenPaidAmount: 99,
      tokenPaymentStatus: 'Paid',
      status: 'Pending Verification',
      bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      userName: currentUser.name || 'Valued Scholar',
      userEmail: currentUser.email,
      userPhone: currentUser.phone || '+91 98765 43210',
      ownerId: details.library.ownerId || 'owner-lib-1',
      ownerName: details.library.ownerName || 'Study Hub Administrator',
      ownerContact: details.library.ownerContact || '+91 98765 43210',
      libraryPassType: details.passType,
      allocatedSeatNumber: details.allocatedSeatNumber,
      qrCodePass: details.qrCodePass
    };

    setBookings((prev) => [newBooking, ...prev]);
    saveDocument('bookings', newBooking.id, newBooking);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Library Pass Requested: ${details.library.title}`,
      message: `Your library pass request (${details.passType}) has been sent to the administrator.`,
      timestamp: 'Just now',
      read: false,
      type: 'booking',
      userEmail: currentUser.email,
      userId: (currentUser as any).id || currentUser.email,
      recipientRole: 'user'
    };
    setNotifications((prev) => [notif, ...prev]);
    saveDocument('notifications', notif.id, notif);

    setSelectedLibrary(null);
    setActiveBookingReceipt(newBooking);
  };

  // Confirm Property Booking Request
  const handleConfirmPropertyBooking = (prop: Property, studentVerified: boolean = false) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    const rent = studentVerified ? Math.round(prop.rentPerMonth * 0.9) : prop.rentPerMonth;
    setBookingRequestItem({
      id: prop.id,
      title: prop.title,
      category: prop.category || 'residential',
      image: prop.images[0],
      location: prop.location,
      city: prop.city,
      price: rent,
      priceLabel: '/month',
      ownerName: prop.ownerName,
      ownerContact: prop.ownerContact,
      ownerId: prop.ownerId || 'owner-1',
      deposit: prop.deposit
    });
  };

  const handleConfirmVehicleBooking = (veh: Vehicle) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    setBookingRequestItem({
      id: veh.id,
      title: veh.title,
      category: 'vehicle',
      image: veh.images[0],
      location: veh.location,
      city: veh.city,
      price: veh.rentPerDay,
      priceLabel: '/day',
      ownerName: veh.ownerName || 'Vikram Sharma',
      ownerContact: veh.ownerContact || '+91 98765 43210',
      ownerId: veh.ownerId || 'owner-1',
      deposit: veh.deposit
    });
  };

  const handleConfirmGeneralItemBooking = (item: GeneralItem) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    setBookingRequestItem({
      id: item.id,
      title: item.title,
      category: 'general',
      image: item.images[0],
      location: item.location,
      city: item.city,
      price: item.rentPerDay,
      priceLabel: '/day',
      ownerName: item.ownerName || 'Sharma Properties & Appliance Vault',
      ownerContact: item.ownerContact || '+91 98765 43210',
      ownerId: item.ownerId || 'owner-1',
      deposit: item.deposit
    });
  };

  const handleConfirmClothingBooking = (clothing: ClothingItem) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    setBookingRequestItem({
      id: clothing.id,
      title: clothing.title,
      category: 'clothing',
      image: clothing.images[0],
      location: clothing.location,
      city: clothing.city,
      price: clothing.rentPerDay,
      priceLabel: '/day',
      ownerName: clothing.ownerName || 'Ananya Reddy',
      ownerContact: clothing.ownerContact || '+91 98123 76543',
      ownerId: clothing.ownerId || 'owner-2',
      deposit: clothing.deposit
    });
  };

  const handleConfirmSportsTurfBooking = (turf: SportsTurfItem) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }
    setBookingRequestItem({
      id: turf.id,
      title: turf.title,
      category: 'sports_turf',
      image: turf.images[0],
      location: turf.location,
      city: turf.city,
      price: turf.rentPerHour,
      priceLabel: '/hour',
      ownerName: turf.ownerName || 'Turf Arena Host (Vikram Sharma)',
      ownerContact: turf.ownerContact || '+91 98765 43210',
      ownerId: turf.ownerId || 'owner-1'
    });
  };

  // Helper for flexible subType filtering
  const isSubTypeMatch = (itemSubType: string | undefined, selected: string) => {
    if (!selected || selected === 'ALL' || selected === 'All') return true;
    if (!itemSubType) return false;
    const item = itemSubType.toLowerCase();
    const sel = selected.toLowerCase();

    if (sel === 'flat' || sel === 'apartment') return item.includes('apartment') || item.includes('flat');
    if (sel === 'house' || sel === 'independent house') return item.includes('house') || item.includes('independent');
    if (sel === 'pg' || sel === 'hostel') return item.includes('pg') || item.includes('hostel');
    if (sel === 'room') return item.includes('room') || item.includes('single') || item.includes('shared');
    if (sel === 'villa') return item.includes('villa');
    if (sel === 'shop') return item.includes('shop') || item.includes('retail') || item.includes('showroom');
    if (sel === 'office') return item.includes('office') || item.includes('co-working');
    if (sel === 'bike' || sel === 'bicycle') return item.includes('bike') || item.includes('scooty') || item.includes('bicycle');
    if (sel === 'scooter' || sel === 'scooty') return item.includes('scooty') || item.includes('scooter');
    if (sel === 'car') return item.includes('car');

    return item === sel || item.includes(sel) || sel.includes(item);
  };

  // Filtered Properties Logic for Specific Selected View
  const filteredProperties = properties.filter((p) => {
    if (activeCategory !== 'student' && p.category !== activeCategory && !(activeCategory === 'residential' && (!p.category || p.category === 'residential'))) return false;
    if (activeCategory === 'student' && p.category !== 'student') return false;
    if (!isSubTypeMatch(p.subType, selectedSubType)) return false;
    if (!isCityMatch(p.city)) return false;
    if (p.rentPerMonth > maxBudget) return false;
    if (furnishingFilter !== 'ALL' && p.furnishing !== furnishingFilter) return false;

    if (activeCategory === 'student' && selectedCollege && selectedCollege !== 'ALL' && selectedCollege.trim() !== '') {
      if (!p.nearbyCollege || !p.nearbyCollege.toLowerCase().includes(selectedCollege.trim().toLowerCase())) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      const matchCollege = p.nearbyCollege?.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchCity && !matchCollege) return false;
    }

    return true;
  });

  // Showcase Filtered Lists for "All Assets (Sabhi Assets)" View
  const residentialPropertiesShowcase = properties.filter((p) => {
    if (p.category && p.category !== 'residential') return false;
    if (!isCityMatch(p.city)) return false;
    if (p.rentPerMonth > maxBudget) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchCity) return false;
    }
    return true;
  });

  const commercialPropertiesShowcase = properties.filter((p) => {
    if (p.category !== 'commercial') return false;
    if (!isCityMatch(p.city)) return false;
    if (p.rentPerMonth > maxBudget) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchCity) return false;
    }
    return true;
  });

  const studentPropertiesShowcase = properties.filter((p) => {
    if (p.category !== 'student') return false;
    if (!isCityMatch(p.city)) return false;
    if (p.rentPerMonth > maxBudget) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchCity) return false;
    }
    return true;
  });

  // Filtered Hotels
  const filteredHotels = hotels.filter((h) => {
    if (!isCityMatch(h.city)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title.toLowerCase().includes(q);
      const matchLoc = h.location.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchCity) return false;
    }
    return true;
  });

  // Filtered Restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    if (!isCityMatch(r.city)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchLoc = r.location.toLowerCase().includes(q);
      const matchCuisine = r.cuisine.some((c) => c.toLowerCase().includes(q));
      if (!matchTitle && !matchLoc && !matchCuisine) return false;
    }
    return true;
  });

  // Filtered Libraries
  const filteredLibraries = libraries.filter((l) => {
    if (!isCityMatch(l.city)) return false;
    if (selectedCollege !== 'ALL' && l.nearbyCollege && !l.nearbyCollege.toLowerCase().includes(selectedCollege.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchLoc = l.location.toLowerCase().includes(q);
      const matchCollege = l.nearbyCollege?.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchCollege) return false;
    }
    return true;
  });

  // Filtered Vehicles Logic
  const filteredVehicles = vehicles.filter((v) => {
    if (!v) return false;
    if (!isSubTypeMatch(v.vehicleType, selectedSubType)) return false;
    if (!isCityMatch(v.city)) return false;
    if ((v.rentPerDay || 0) > maxBudget) return false;
    if (driverFilter && !v.driverAvailable) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title?.toLowerCase().includes(q);
      const matchBrand = v.brand?.toLowerCase().includes(q);
      const matchModel = v.modelName?.toLowerCase().includes(q);
      const matchLoc = v.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchModel && !matchLoc) return false;
    }

    return true;
  });

  // Filtered General Rentable Items Logic
  const filteredGeneralItems = generalItems.filter((item) => {
    if (!item) return false;
    if (!isCityMatch(item.city)) return false;
    if ((item.rentPerDay || 0) > maxBudget) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchCategory = item.itemCategory?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchLoc) return false;
    }

    return true;
  });

  // Filtered Clothing Items
  const filteredClothingItems = clothingItems.filter((item) => {
    if (!item) return false;
    if (!isCityMatch(item.city)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchType = item.clothingType?.toLowerCase().includes(q);
      const matchGender = item.gender?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchType && !matchGender && !matchLoc) return false;
    }
    return true;
  });

  // Filtered Sports Turfs
  const filteredSportsTurfs = sportsTurfItems.filter((turf) => {
    if (!turf) return false;
    if (!isCityMatch(turf.city)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = turf.title?.toLowerCase().includes(q);
      const matchType = turf.turfType?.toLowerCase().includes(q);
      const matchLoc = turf.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchType && !matchLoc) return false;
    }
    return true;
  });
  const filteredRoommates = roommates.filter((rm) => {
    if (rm.city && rm.city.toLowerCase() !== selectedCity.toLowerCase() && !isCityMatch(rm.preferredLocation)) return false;
    if (rm.budgetPerMonth > maxBudget) return false;
    if (selectedCollege !== 'ALL' && !rm.college.toLowerCase().includes(selectedCollege.toLowerCase())) return false;
    if (roommateDistanceFilter !== 10 && rm.distanceKm !== undefined && rm.distanceKm > roommateDistanceFilter) return false;
    if (roommateGenderFilter !== 'ALL' && rm.gender.toLowerCase() !== roommateGenderFilter.toLowerCase()) return false;
    if (roommateDietFilter !== 'ALL' && rm.diet.toLowerCase() !== roommateDietFilter.toLowerCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rm.name.toLowerCase().includes(q);
      const matchCollege = rm.college.toLowerCase().includes(q);
      const matchLoc = rm.preferredLocation.toLowerCase().includes(q);
      if (!matchName && !matchCollege && !matchLoc) return false;
    }

    return true;
  });

  return (
    <div
      className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-300 pb-16 lg:pb-0 ${
        currentTheme === 'dark'
          ? 'bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950'
          : 'bg-zinc-50 text-zinc-950 selection:bg-zinc-900 selection:text-white'
      }`}
    >
      
      {/* Top Navbar */}
      <Navbar
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedSubType('ALL');
        }}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        bookingsCount={userBookings.length}
        currentTheme={currentTheme}
        onToggleTheme={(t) => setCurrentTheme(t)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenLandlordModal={handleOpenLandlordListingModal}
        savedCount={wishlist.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenLandlordAuthModal={() => {
          if (loggedInLandlord) {
            setIsLandlordDashboardOpen(true);
          } else {
            setIsLandlordAuthModalOpen(true);
          }
        }}
        loggedInLandlord={loggedInLandlord}
        pendingLandlordCount={landlords.filter((l) => l.status === 'Pending').length}
        currentUser={currentUser}
        onOpenUserAuthModal={() => setIsUserAuthModalOpen(true)}
        onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
        onOpenRadarModal={() => setIsRadarModalOpen(true)}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        notifications={activeUserNotifications}
        onMarkNotificationsRead={() => {
          if (!currentUser && !loggedInLandlord) return;
          const activeIds = new Set(activeUserNotifications.map((n) => n.id));
          setNotifications((prev) =>
            prev.map((n) => (activeIds.has(n.id) ? { ...n, read: true } : n))
          );
        }}
      />

      {/* Mode-based Content View */}
      {activeMode === 'bookings' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyBookingsSection
            bookings={userBookings}
            currentUser={currentUser}
            onOpenUserAuthModal={() => setIsUserAuthModalOpen(true)}
            onOpenReceipt={(b) => setActiveBookingReceipt(b)}
            onOpenTracking={(b) => {
              const veh = vehicles.find((v) => v.id === b.itemId);
              if (veh) setTrackingVehicle(veh);
            }}
            onOpenChat={(b) => setActiveBookingChat({ booking: b, role: 'renter' })}
            onCancelBooking={handleCancelBooking}
            onDeleteBooking={handleCancelBooking}
            onNavigateToRentStore={() => setActiveMode('rent')}
          />
        </main>
      ) : (
        <>
          {/* Category Banner & Filters */}
          <CategoryHeader
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedSubType={selectedSubType}
            setSelectedSubType={setSelectedSubType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            maxBudget={maxBudget}
            setMaxBudget={setMaxBudget}
            furnishingFilter={furnishingFilter}
            setFurnishingFilter={setFurnishingFilter}
            selectedCollege={selectedCollege}
            setSelectedCollege={setSelectedCollege}
            studentViewTab={studentViewTab}
            setStudentViewTab={setStudentViewTab}
            driverFilter={driverFilter}
            setDriverFilter={setDriverFilter}
            onOpenRadar={() => setIsRadarModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Sleek Trust Highlights Bar */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-[#E5E0D8] dark:border-zinc-800 shadow-xs text-xs font-bold text-slate-800 dark:text-zinc-200 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-zinc-800/80 border border-[#E5E0D8] dark:border-zinc-700/80">
            <div className="h-8 w-8 rounded-xl bg-slate-950 text-[#FAF7F2] flex items-center justify-center shrink-0 font-black">✓</div>
            <div>
              <p className="font-extrabold text-slate-950 dark:text-white text-[11px] sm:text-xs">Zero Brokerage</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Verified listings & stays</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-zinc-800/80 border border-[#E5E0D8] dark:border-zinc-700/80">
            <div className="h-8 w-8 rounded-xl bg-slate-950 text-[#FAF7F2] flex items-center justify-center shrink-0 font-black text-[11px]">AI</div>
            <div>
              <p className="font-extrabold text-slate-950 dark:text-white text-[11px] sm:text-xs">AI Smart Search</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Natural language matching</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-zinc-800/80 border border-[#E5E0D8] dark:border-zinc-700/80">
            <div className="h-8 w-8 rounded-xl bg-slate-950 text-[#FAF7F2] flex items-center justify-center shrink-0 font-black">🗺️</div>
            <div>
              <p className="font-extrabold text-slate-950 dark:text-white text-[11px] sm:text-xs">Google Maps Matrix</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Distances to metro/station</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4EE] dark:bg-zinc-800/80 border border-[#E5E0D8] dark:border-zinc-700/80">
            <div className="h-8 w-8 rounded-xl bg-slate-950 text-[#FAF7F2] flex items-center justify-center shrink-0 font-black">⚡</div>
            <div>
              <p className="font-extrabold text-slate-950 dark:text-white text-[11px] sm:text-xs">Unified Ecosystem</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Hotels, Dining & Libraries</p>
            </div>
          </div>
        </div>
        
        {/* AI Recommended Section */}
        <AIRecommendedSection
          selectedCity={selectedCity}
          maxBudget={maxBudget}
          properties={properties}
          vehicles={vehicles}
          clothingItems={clothingItems}
          sportsTurfs={sportsTurfItems}
          generalItems={generalItems}
          hotels={hotels}
          restaurants={restaurants}
          libraries={libraries}
          onSelectProperty={(p) => setSelectedProperty(p)}
          onSelectVehicle={(v) => handleConfirmVehicleBooking(v)}
          onSelectClothing={(c) => handleConfirmClothingBooking(c)}
          onSelectSportsTurf={(t) => handleConfirmSportsTurfBooking(t)}
          onSelectGeneralItem={(g) => setSelectedGeneralItem(g)}
          onSelectHotel={(h) => setSelectedHotel(h)}
          onSelectRestaurant={(r) => setSelectedRestaurant(r)}
          onSelectLibrary={(l) => setSelectedLibrary(l)}
          onBookProperty={(p) => handleConfirmPropertyBooking(p)}
          onBookVehicle={(v) => handleConfirmVehicleBooking(v)}
          onBookClothing={(c) => handleConfirmClothingBooking(c)}
          onBookSportsTurf={(t) => handleConfirmSportsTurfBooking(t)}
          onOpenChatWithOwner={(item) => setActiveDirectChatContext(item)}
        />

        {/* Render Active Category View */}
        <div
          key={activeCategory + (activeCategory === 'student' ? studentViewTab : '')}
          className="animate-in fade-in duration-300"
        >
          {activeCategory === 'all' ? (
            /* Unified Showcase for All Asset Categories */
            <AllAssetsShowcase
              residentialProperties={residentialPropertiesShowcase}
              commercialProperties={commercialPropertiesShowcase}
              studentProperties={studentPropertiesShowcase}
              vehicles={filteredVehicles}
              hotels={filteredHotels}
              restaurants={filteredRestaurants}
              libraries={filteredLibraries}
              clothingItems={filteredClothingItems}
              sportsTurfs={filteredSportsTurfs}
              generalItems={filteredGeneralItems}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setSelectedSubType('ALL');
              }}
              onSelectProperty={(p) => setSelectedProperty(p)}
              onBookProperty={(p) => handleConfirmPropertyBooking(p)}
              onSelectVehicle={(v) => handleConfirmVehicleBooking(v)}
              onBookVehicle={(v) => handleConfirmVehicleBooking(v)}
              onSelectHotel={(h) => setSelectedHotel(h)}
              onSelectRestaurant={(r) => setSelectedRestaurant(r)}
              onSelectLibrary={(l) => setSelectedLibrary(l)}
              onSelectClothing={(c) => handleConfirmClothingBooking(c)}
              onBookClothing={(c) => handleConfirmClothingBooking(c)}
              onSelectSportsTurf={(t) => handleConfirmSportsTurfBooking(t)}
              onBookSportsTurf={(t) => handleConfirmSportsTurfBooking(t)}
              onSelectGeneralItem={(g) => setSelectedGeneralItem(g)}
              onBookGeneralItem={(g) => setSelectedGeneralItem(g)}
              onOpenDirections={(item) => setMapItem(item)}
              onOpenChat={(item) => setActiveDirectChatContext(item)}
              savedIds={savedIds}
              wishlist={wishlist}
              toggleSave={toggleSave}
              toggleWishlist={toggleWishlist}
              loggedInLandlord={loggedInLandlord}
              onTrackGPS={(v) => setTrackingVehicle(v)}
            />
          ) : activeCategory === 'clothing' ? (
              /* Clothing & Wedding Attire Grid */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Designer Wedding Clothes & Outfits for Rent ({filteredClothingItems.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Dry cleaned & fitted • Bridal Lehengas, Tuxedos, Sherwanis
                  </span>
                </div>

                {filteredClothingItems.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      No rental outfits found matching your search.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border border-zinc-700"
                    >
                      Reset Outfit Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClothingItems.map((clothing, idx) => (
                      <ClothingCard
                        key={clothing.id}
                        clothing={clothing}
                        index={idx}
                        onSelect={(c) => handleConfirmClothingBooking(c)}
                        onBook={(c) => handleConfirmClothingBooking(c)}
                        isSaved={savedIds.includes(clothing.id)}
                        onToggleSave={toggleSave}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeCategory === 'sports_turf' ? (
              /* Sports, Turfs & Arena Booking Grid */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Sports Arenas, Turfs & Outdoor Equipment ({filteredSportsTurfs.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Hourly slots • Floodlit Turfs, Cricket Box & Badminton Courts
                  </span>
                </div>

                {filteredSportsTurfs.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      No sports turfs or arenas match your current location filter.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border border-zinc-700"
                    >
                      Reset Turf Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSportsTurfs.map((turf, idx) => (
                      <SportsTurfCard
                        key={turf.id}
                        turf={turf}
                        index={idx}
                        onSelect={(t) => handleConfirmSportsTurfBooking(t)}
                        onBook={(t) => handleConfirmSportsTurfBooking(t)}
                        isSaved={savedIds.includes(turf.id)}
                        onToggleSave={toggleSave}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeCategory === 'hotel' ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Verified Hotels & Suites ({filteredHotels.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Instant room selection • FSSAI & Hotel Licensed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel, idx) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      index={idx}
                      onSelect={(h) => setSelectedHotel(h)}
                      onBook={(h) => setSelectedHotel(h)}
                      onOpenDirections={(h) => setMapItem(h)}
                      isWishlisted={wishlist.some((w) => w.id === hotel.id)}
                      onToggleWishlist={(h) =>
                        toggleWishlist({
                          id: h.id,
                          category: 'Hotel',
                          title: h.title,
                          location: h.location,
                          city: h.city,
                          image: h.images[0],
                          priceDisplay: `₹${Math.min(...h.rooms.map((r) => r.pricePerNight))}/night`,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : activeCategory === 'restaurant' ? (
              /* Render Restaurant Module */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Gourmet Dining & Table Reservation ({filteredRestaurants.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Full menus • Table availability • Instant booking
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.map((restaurant, idx) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      index={idx}
                      onSelect={(r) => setSelectedRestaurant(r)}
                      onReserve={(r) => setSelectedRestaurant(r)}
                      onOpenDirections={(r) => setMapItem(r)}
                      isWishlisted={wishlist.some((w) => w.id === restaurant.id)}
                      onToggleWishlist={(r) =>
                        toggleWishlist({
                          id: r.id,
                          category: 'Restaurant',
                          title: r.title,
                          location: r.location,
                          city: r.city,
                          image: r.images[0],
                          priceDisplay: `₹${r.averageCostForTwo} for two`,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : activeCategory === 'library' ? (
              /* Render Library Module */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Smart Digital Libraries & Study Cabins ({filteredLibraries.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    24/7 Access • Soundproof Cabins • QR Pass Entry
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLibraries.map((library, idx) => (
                    <LibraryCard
                      key={library.id}
                      library={library}
                      index={idx}
                      onSelect={(l) => setSelectedLibrary(l)}
                      onBook={(l) => setSelectedLibrary(l)}
                      onOpenDirections={(l) => setMapItem(l)}
                      isWishlisted={wishlist.some((w) => w.id === library.id)}
                      onToggleWishlist={(l) =>
                        toggleWishlist({
                          id: l.id,
                          category: 'Library',
                          title: l.title,
                          location: l.location,
                          city: l.city,
                          image: l.images[0],
                          priceDisplay: `₹${l.monthlyPassPrice}/month`,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : activeCategory === 'vehicle' ? (
              /* Vehicles Grid */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Available Vehicles for Rent ({filteredVehicles.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Showing hourly & daily self-drive / chauffeur rentals
                  </span>
                </div>

                {filteredVehicles.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      No vehicles found matching your current filter criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSubType('ALL');
                        setSearchQuery('');
                        setMaxBudget(15000);
                      }}
                      className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border border-zinc-700"
                    >
                      Reset Vehicle Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, idx) => {
                      const isOwner = loggedInLandlord ? (loggedInLandlord.id === vehicle.ownerId || vehicle.ownerId === 'owner-verified') : false;
                      return (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          index={idx}
                          isOwner={isOwner}
                          onBook={(v) => handleConfirmVehicleBooking(v)}
                          onTrackGPS={(v) => {
                            if (loggedInLandlord && (loggedInLandlord.id === v.ownerId || v.ownerId === 'owner-verified')) {
                              setTrackingVehicle(v);
                            } else {
                              alert('🔒 GPS Live Tracking is strictly restricted to the registered owner of this vehicle.');
                            }
                          }}
                          isSaved={savedIds.includes(vehicle.id)}
                          onToggleSave={toggleSave}
                          onOpenChat={(item) => setActiveDirectChatContext(item)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeCategory === 'general' ? (
              /* General Rentable Items Grid (Cameras, Appliances, Tools, Furniture, Gadgets) */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    General Items & Equipment for Rent ({filteredGeneralItems.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Cameras • Appliances • Tools • Sound Systems • Furniture
                  </span>
                </div>

                {filteredGeneralItems.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      No rentable items found matching your current search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setMaxBudget(250000);
                      }}
                      className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border border-zinc-700"
                    >
                      Reset Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGeneralItems.map((item, idx) => (
                      <GeneralItemCard
                        key={item.id}
                        item={item}
                        index={idx}
                        onSelect={(i) => setSelectedGeneralItem(i)}
                        onBook={(i) => handleConfirmGeneralItemBooking(i)}
                        isSaved={savedIds.includes(item.id)}
                        onToggleSave={toggleSave}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : activeCategory === 'student' && studentViewTab === 'roommates' ? (
              /* Student Roommate Finder View with Nearby Filter & Real-Time Chat */
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Nearby Roommate Profiles ({filteredRoommates.length})
                      </h2>
                      <span className="bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                        <span>RADAR ACTIVE</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      Connect live with student flatmates near {selectedCity}. Message history is ephemeral & transparent.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPostRoommateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer shrink-0"
                  >
                    <span>+ Post Roommate Profile</span>
                  </button>
                </div>

                {/* Nearby Distance & Preference Filter Pills */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs mb-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                    {/* Distance Filter */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-bold">📍 Distance:</span>
                      {[
                        { label: 'All Nearby', value: 10 },
                        { label: '< 1 km', value: 1.0 },
                        { label: '< 2 km', value: 2.0 },
                        { label: '< 5 km', value: 5.0 }
                      ].map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setRoommateDistanceFilter(d.value)}
                          className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                            roommateDistanceFilter === d.value
                              ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {/* Gender Filter */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-bold">👥 Gender:</span>
                      {['ALL', 'Male', 'Female'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setRoommateGenderFilter(g)}
                          className={`px-2.5 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                            roommateGenderFilter === g
                              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                          }`}
                        >
                          {g === 'ALL' ? 'All' : g}
                        </button>
                      ))}
                    </div>

                    {/* Diet Filter */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-bold">🥗 Diet:</span>
                      {['ALL', 'Vegetarian', 'Non-Vegetarian'].map((dt) => (
                        <button
                          key={dt}
                          onClick={() => setRoommateDietFilter(dt)}
                          className={`px-2.5 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                            roommateDietFilter === dt
                              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                          }`}
                        >
                          {dt === 'ALL' ? 'All' : dt === 'Vegetarian' ? 'Veg' : 'Non-Veg'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {filteredRoommates.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      No roommate profiles match your distance or preference filter in {selectedCity}.
                    </p>
                    <button
                      onClick={() => {
                        setRoommateDistanceFilter(10);
                        setRoommateGenderFilter('ALL');
                        setRoommateDietFilter('ALL');
                      }}
                      className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoommates.map((rm, idx) => (
                      <RoommateCard
                        key={rm.id}
                        profile={rm}
                        index={idx}
                        onConnect={(p) => setActiveChatRoommate(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Property Listings Grid (Residential, Commercial, Student Housing) */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Verified Rental Properties ({filteredProperties.length})
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Zero brokerage • Owner verified
                  </span>
                </div>

                {filteredProperties.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">
                      No rental properties match your search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSubType('ALL');
                        setSearchQuery('');
                        setFurnishingFilter('ALL');
                        setMaxBudget(250000);
                      }}
                      className="bg-zinc-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border border-zinc-700"
                    >
                      Reset Property Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property, idx) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        index={idx}
                        onSelect={(p) => setSelectedProperty(p)}
                        isSaved={savedIds.includes(property.id)}
                        onToggleSave={toggleSave}
                        onQuickBook={(p) => handleConfirmPropertyBooking(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

      </main>
        </>
      )}

      {/* Footer */}
      <Footer
        setActiveCategory={setActiveCategory}
        onOpenLandlordAuthModal={() => setIsLandlordAuthModalOpen(true)}
        onOpenLandlordModal={handleOpenLandlordListingModal}
      />

      {/* AI Assistant & Smart Match Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        availableProperties={properties}
        availableVehicles={vehicles}
        availableClothing={clothingItems}
        availableSportsTurfs={sportsTurfItems}
        availableGeneralItems={generalItems}
        availableHotels={hotels}
        availableRestaurants={restaurants}
        availableLibraries={libraries}
        onSelectProperty={(p) => setSelectedProperty(p)}
        onSelectVehicle={(v) => handleConfirmVehicleBooking(v)}
        onSelectClothing={(c) => handleConfirmClothingBooking(c)}
        onSelectSportsTurf={(s) => handleConfirmSportsTurfBooking(s)}
        onSelectGeneralItem={(g) => setSelectedGeneralItem(g)}
        onSelectHotel={(h) => setSelectedHotel(h)}
        onSelectRestaurant={(r) => setSelectedRestaurant(r)}
        onSelectLibrary={(l) => setSelectedLibrary(l)}
      />

      <VehicleTrackingModal
        vehicle={trackingVehicle}
        onClose={() => setTrackingVehicle(null)}
      />

      <LandlordListingModal
        isOpen={isLandlordModalOpen}
        onClose={() => setIsLandlordModalOpen(false)}
        onAddProperty={handleAddProperty}
        onAddVehicle={handleAddVehicle}
        onAddClothing={handleAddClothing}
        onAddSportsTurf={handleAddSportsTurf}
        loggedInLandlord={loggedInLandlord}
      />

      <PropertyDetailModal
        property={selectedProperty}
        allProperties={properties}
        onClose={() => setSelectedProperty(null)}
        onConfirmBooking={handleConfirmPropertyBooking}
        isSaved={selectedProperty ? savedIds.includes(selectedProperty.id) : false}
        onToggleSave={toggleSave}
        onSelectSimilarProperty={(p) => setSelectedProperty(p)}
        onOpenChat={(p) => {
          setActiveDirectChatContext({
            id: p.id,
            title: p.title,
            image: p.images[0],
            priceDisplay: `₹${p.rentPerMonth.toLocaleString('en-IN')}/mo`,
            ownerName: p.ownerName,
            ownerContact: p.ownerContact,
            category: p.subType,
            location: p.location,
            city: p.city
          });
        }}
      />

      {/* Hotel Detail Modal */}
      {selectedHotel && (
        <HotelDetailModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onConfirmBooking={handleConfirmHotelBooking}
          onOpenMap={(h) => setMapItem(h)}
          onOpenChat={(item) => setActiveDirectChatContext(item)}
        />
      )}

      {/* Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantDetailModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onConfirmReservation={handleConfirmRestaurantReservation}
          onOpenMap={(r) => setMapItem(r)}
        />
      )}

      {/* Library Detail Modal */}
      {selectedLibrary && (
        <LibraryDetailModal
          library={selectedLibrary}
          onClose={() => setSelectedLibrary(null)}
          onConfirmPassBooking={handleConfirmLibraryPassBooking}
          onOpenMap={(l) => setMapItem(l)}
        />
      )}

      {/* Directions & Distance Matrix Map Modal */}
      {mapItem && (
        <DirectionsMapModal
          item={mapItem}
          onClose={() => setMapItem(null)}
        />
      )}

      {/* Wishlist Modal */}
      {isSavedModalOpen && (
        <WishlistModal
          wishlist={wishlist}
          onClose={() => setIsSavedModalOpen(false)}
          onRemoveItem={(id) => {
            setWishlist((prev) => prev.filter((w) => w.id !== id));
            setSavedIds((prev) => prev.filter((i) => i !== id));
          }}
          onViewItem={(item) => {
            setIsSavedModalOpen(false);
            if (item.category === 'Hotel') {
              const h = hotels.find((x) => x.id === item.id);
              if (h) setSelectedHotel(h);
            } else if (item.category === 'Restaurant') {
              const r = restaurants.find((x) => x.id === item.id);
              if (r) setSelectedRestaurant(r);
            } else if (item.category === 'Library') {
              const l = libraries.find((x) => x.id === item.id);
              if (l) setSelectedLibrary(l);
            } else {
              const p = properties.find((x) => x.id === item.id);
              if (p) setSelectedProperty(p);
            }
          }}
        />
      )}

      <BookingReceiptModal
        booking={activeBookingReceipt}
        onClose={() => setActiveBookingReceipt(null)}
      />

      {/* Landlord Authentication (Request ID / Login) */}
      <LandlordAuthModal
        isOpen={isLandlordAuthModalOpen}
        onClose={() => setIsLandlordAuthModalOpen(false)}
        landlords={landlords}
        onRequestRegister={handleRequestRegisterLandlord}
        onLoginSuccess={(user) => {
          setLoggedInLandlord(user);
          setIsLandlordDashboardOpen(true);
        }}
      />

      {/* Logged-In Landlord Dashboard */}
      <LandlordDashboardModal
        isOpen={isLandlordDashboardOpen}
        onClose={() => setIsLandlordDashboardOpen(false)}
        landlord={loggedInLandlord}
        onLogout={() => {
          setLoggedInLandlord(null);
          setIsLandlordDashboardOpen(false);
        }}
        properties={properties}
        vehicles={vehicles}
        bookings={bookings}
        onOpenAddListing={() => {
          if (loggedInLandlord && loggedInLandlord.status === 'Approved') {
            setIsLandlordDashboardOpen(false);
            setIsLandlordModalOpen(true);
          } else {
            alert(`Account Pending Admin Approval!\n\nYour Owner ID (${loggedInLandlord?.id || 'Pending'}) is currently PENDING Admin Approval. Once System Admin verifies and approves your account, you will be able to upload properties and rental assets.`);
          }
        }}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onEditProperty={(p) => handleOpenEdit(p, 'property')}
        onEditVehicle={(v) => handleOpenEdit(v, 'vehicle')}
        onTrackVehicleGPS={(b) => {
          const veh = vehicles.find((v) => v.id === b.itemId);
          if (veh) {
            if (loggedInLandlord && (loggedInLandlord.id === veh.ownerId || veh.ownerId === 'owner-verified')) {
              setTrackingVehicle(veh);
            } else {
              alert('🔒 GPS Live Tracking is strictly restricted to the registered owner of this vehicle.');
            }
          }
        }}
        onOpenBookingChat={(booking) => setActiveBookingChat({ booking, role: 'owner' })}
        onDeleteLandlordAccount={handleDeleteLandlordAccount}
      />

      {/* 5-Step Booking Request & Verification Modal */}
      <BookingRequestModal
        isOpen={Boolean(bookingRequestItem)}
        onClose={() => setBookingRequestItem(null)}
        currentUser={currentUser}
        existingBookings={bookings}
        onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        item={bookingRequestItem}
        tokenAmount={tokenAmount}
        onCompleteBooking={(newBooking) => {
          setBookings((prev) => [newBooking, ...prev]);
          saveDocument('bookings', newBooking.id, newBooking);

          // 1. Add dispatched notification for tenant (only visible to this tenant)
          const renterNotif: AppNotification = {
            id: `notif-renter-${Date.now()}`,
            title: `Booking Request Dispatched: ${newBooking.itemTitle}`,
            message: `Your booking request & tenant KYC have been sent to owner ${newBooking.ownerName || 'host'}. Awaiting owner approval!`,
            timestamp: 'Just now',
            read: false,
            type: 'booking',
            userEmail: newBooking.userEmail,
            userId: currentUser?.id || newBooking.userEmail,
            recipientRole: 'user'
          };
          setNotifications((prev) => [renterNotif, ...prev]);
          saveDocument('notifications', renterNotif.id, renterNotif);

          // 2. Add owner notification (only visible to that owner)
          if (newBooking.ownerId) {
            const hostNotif: AppNotification = {
              id: `notif-host-${Date.now()}`,
              title: `New Tenant Booking: ${newBooking.itemTitle}`,
              message: `New booking request received from ${newBooking.userName} (${newBooking.userEmail || newBooking.userPhone}). Move-In: ${newBooking.startDate || 'Immediate'}. Action required in Owner Dashboard.`,
              timestamp: 'Just now',
              read: false,
              type: 'booking',
              ownerId: newBooking.ownerId,
              recipientRole: 'landlord'
            };
            setNotifications((prev) => [hostNotif, ...prev]);
            saveDocument('notifications', hostNotif.id, hostNotif);
          }
        }}
        onNavigateToMyBookings={() => {
          setActiveMode('bookings');
        }}
      />

      {/* User Post-Rental Review & Platform Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsUserAuthModalOpen(true)}
      />

      {/* 5-10km Proximity Property Radar Modal */}
      <NearbyRadarModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        availableProperties={properties}
        availableVehicles={vehicles}
        availableClothing={clothingItems}
        availableSportsTurfs={sportsTurfItems}
        availableGeneralItems={generalItems}
        availableHotels={hotels}
        availableRestaurants={restaurants}
        availableLibraries={libraries}
        onSelectProperty={(p) => setSelectedProperty(p)}
        onSelectVehicle={(v) => handleConfirmVehicleBooking(v)}
        onSelectClothing={(c) => handleConfirmClothingBooking(c)}
        onSelectSportsTurf={(s) => handleConfirmSportsTurfBooking(s)}
        onSelectGeneralItem={(g) => setSelectedGeneralItem(g)}
        onSelectHotel={(h) => setSelectedHotel(h)}
        onSelectRestaurant={(r) => setSelectedRestaurant(r)}
        onSelectLibrary={(l) => setSelectedLibrary(l)}
      />

      {/* Free User Authentication / Account Modal */}
      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleUserLoginSuccess}
        onLogout={handleUserLogout}
      />

      {/* User Full Profile & Vehicle GPS Tracking View Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={currentUser}
        onLogout={handleUserLogout}
        onDeleteAccount={handleDeleteUserAccount}
        bookings={bookings}
        vehicles={vehicles}
        onOpenBookingChat={(booking) => setActiveBookingChat({ booking, role: 'renter' })}
        onCancelBooking={handleCancelBooking}
      />

      {/* General Item Detail Modal */}
      <GeneralItemDetailModal
        item={selectedGeneralItem}
        onClose={() => setSelectedGeneralItem(null)}
        onBook={(item) => handleConfirmGeneralItemBooking(item)}
        isSaved={selectedGeneralItem ? savedIds.includes(selectedGeneralItem.id) : false}
        onToggleSave={toggleSave}
      />

      {/* Super Admin Control Center Portal */}
      <AdminPortalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        landlords={landlords}
        onApproveLandlord={handleApproveLandlord}
        onRejectLandlord={handleRejectLandlord}
        properties={properties}
        vehicles={vehicles}
        hotels={hotels}
        restaurants={restaurants}
        libraries={libraries}
        clothing={clothingItems}
        sportsTurfs={sportsTurfItems}
        generalItems={generalItems}
        onDeleteProperty={handleDeleteProperty}
        onDeleteVehicle={handleDeleteVehicle}
        bookings={bookings}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        tokenAmount={tokenAmount}
        onUpdateTokenAmount={handleUpdateTokenAmount}
        onUploadAllDataToFirebase={handleUploadAllDataToFirebase}
        onEditProperty={(p) => handleOpenEdit(p, 'property')}
        onEditVehicle={(v) => handleOpenEdit(v, 'vehicle')}
        onRemoveDuplicateImage={handleRemoveDuplicateImage}
        onSendNotificationToOwner={(notif) => {
          setNotifications((prev) => [notif, ...prev]);
          saveDocument('notifications', notif.id, notif);
        }}
      />

      {/* Global Web Listing Editor Modal */}
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        itemToEdit={itemToEdit}
        itemType={itemToEditType}
        onSaveProperty={handleSavePropertyUpdate}
        onSaveVehicle={handleSaveVehicleUpdate}
        onSaveHotel={handleSaveHotelUpdate}
        onSaveRestaurant={handleSaveRestaurantUpdate}
        onSaveLibrary={handleSaveLibraryUpdate}
      />

      {/* Roommate Real-Time Ephemeral Chat Modal */}
      <RoommateChatModal
        isOpen={!!activeChatRoommate}
        onClose={() => setActiveChatRoommate(null)}
        roommate={activeChatRoommate}
        currentUser={currentUser}
      />

      {/* Post Roommate Profile Modal */}
      <PostRoommateModal
        isOpen={isPostRoommateModalOpen}
        onClose={() => setIsPostRoommateModalOpen(false)}
        selectedCity={selectedCity}
        onAddRoommate={(newRm) => {
          setRoommates((prev) => [newRm, ...prev]);
          saveDocument('roommates', newRm.id, newRm);
        }}
      />

      {/* Renter & Owner Direct Booking Chat Modal */}
      <BookingChatModal
        isOpen={!!activeBookingChat || !!activeDirectChatContext}
        onClose={() => {
          setActiveBookingChat(null);
          setActiveDirectChatContext(null);
        }}
        booking={activeBookingChat?.booking || null}
        itemContext={activeDirectChatContext}
        currentRole={activeBookingChat?.role || 'renter'}
        userName={currentUser?.name || 'Renter'}
      />

    </div>
  );
}
