import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
  writeBatch
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import {
  INITIAL_PROPERTIES,
  INITIAL_HOTELS,
  INITIAL_RESTAURANTS,
  INITIAL_LIBRARIES,
  INITIAL_VEHICLES,
  INITIAL_ROOMMATES,
  INITIAL_LANDLORDS,
  INITIAL_GENERAL_ITEMS,
  MOCK_CLOTHING_ITEMS,
  MOCK_SPORTS_TURFS
} from '../data/mockData';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore Instances (Binds directly to custom databaseId or default)
export const auth = getAuth(app);

const targetDbId = firebaseConfig.firestoreDatabaseId;
export const db = (targetDbId && targetDbId !== 'default')
  ? getFirestore(app, targetDbId)
  : getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Authentication Helper Functions
 */

export const loginWithEmailPassword = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const registerWithEmailPassword = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (userCredential.user) {
    try {
      await sendEmailVerification(userCredential.user);
    } catch (e) {
      console.warn('Firebase Email Verification send error:', e);
    }
  }
  return userCredential;
};

export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const subscribeToAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Live Firestore Connectivity Tester
 */
export const testFirestoreConnection = async (): Promise<{ success: boolean; message: string; databaseId: string }> => {
  const databaseId = firebaseConfig.firestoreDatabaseId || 'default';
  try {
    const pingRef = doc(db, 'system_config', 'connection_ping');
    await setDoc(pingRef, {
      lastPing: new Date().toISOString(),
      status: 'active',
      clientVersion: '2.0.0'
    }, { merge: true });
    
    const snap = await getDoc(pingRef);
    if (snap.exists()) {
      return {
        success: true,
        message: `Connected successfully to Firestore database: ${databaseId}`,
        databaseId
      };
    }
    return {
      success: true,
      message: `Write succeeded to Firestore database: ${databaseId}`,
      databaseId
    };
  } catch (error: any) {
    console.error('Firestore connection test failed:', error);
    return {
      success: false,
      message: error?.message || 'Failed to connect to Firestore. Check permissions or network.',
      databaseId
    };
  }
};

/**
 * Real-time Firestore Sync Helpers
 */

export const subscribeCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void
) => {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    console.log(`🔥 [Firestore Real-Time Fetch] Loaded ${items.length} records from '${collectionName}'`);
    callback(items);
  }, (error) => {
    console.warn(`Firestore subscription notice for ${collectionName}:`, error);
    try {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    } catch (e) {
      // Log for diagnosis
    }
  });
};

export const cleanUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedFields).filter((item) => item !== undefined);
  }
  const cleanObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleanObj[key] = cleanUndefinedFields(value);
    }
  }
  return cleanObj;
};

export const saveDocument = async (collectionName: string, docId: string, data: any) => {
  const safeId = docId || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const docRef = doc(db, collectionName, safeId);
  const sanitizedData = cleanUndefinedFields(data);
  try {
    await setDoc(docRef, sanitizedData, { merge: true });
    console.log(`🔥 [Firestore Save Success] Saved document to ${collectionName}/${safeId}`);
    return { success: true, id: safeId };
  } catch (error) {
    console.warn(`⚠️ [Firestore Save Fallback Notice] ${collectionName}/${safeId}:`, error);
    const errInfo = handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${safeId}`);
    return { success: false, error: errInfo.error, id: safeId };
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(db, collectionName, docId);
  const sanitizedData = cleanUndefinedFields(data);
  try {
    await updateDoc(docRef, sanitizedData);
    console.log(`🔥 [Firestore Update Success] Updated document ${collectionName}/${docId}`);
    return { success: true };
  } catch (error) {
    console.warn(`⚠️ [Firestore Update Fallback Notice] ${collectionName}/${docId}:`, error);
    const errInfo = handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
    return { success: false, error: errInfo.error };
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  try {
    await deleteDoc(docRef);
    console.log(`🔥 [Firestore Delete Success] Deleted document ${collectionName}/${docId}`);
    return { success: true };
  } catch (error) {
    console.warn(`⚠️ [Firestore Delete Fallback Notice] ${collectionName}/${docId}:`, error);
    const errInfo = handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    return { success: false, error: errInfo.error };
  }
};

/**
 * Save array of documents using concurrent chunks for maximum speed & reliability
 */
export const saveCollectionBatch = async (
  collectionName: string,
  items: any[],
  onItemProgress?: (uploadedCount: number) => void
): Promise<{ successCount: number; failCount: number }> => {
  if (!items || items.length === 0) return { successCount: 0, failCount: 0 };

  let successCount = 0;
  let failCount = 0;
  const chunkSize = 10;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (item) => {
        const docId = item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        try {
          const res = await saveDocument(collectionName, docId, item);
          if (res.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          failCount++;
        }
        if (onItemProgress) {
          onItemProgress(successCount);
        }
      })
    );
  }

  return { successCount, failCount };
};

export interface SyncAllDataPayload {
  properties?: any[];
  vehicles?: any[];
  hotels?: any[];
  restaurants?: any[];
  libraries?: any[];
  roommates?: any[];
  landlords?: any[];
  users?: any[];
  bookings?: any[];
  generalItems?: any[];
  clothing?: any[];
  sportsTurfs?: any[];
  wishlist?: any[];
  notifications?: any[];
  juniorAdmins?: any[];
  reports?: any[];
  systemConfig?: any;
}

export interface SyncStatsResult {
  totalUploaded: number;
  totalFailed: number;
  collections: Record<string, number>;
  databaseId: string;
  timestamp: string;
  success: boolean;
}

/**
 * Master Sync: Uploads all collections to Firebase Firestore in high-speed parallel batches
 */
export const uploadAllDataToFirestore = async (
  payload: SyncAllDataPayload,
  onProgress?: (progressPercent: number, currentCollection: string) => void
): Promise<SyncStatsResult> => {
  const collectionsToUpload: { name: string; items: any[] }[] = [
    { name: 'properties', items: payload.properties || INITIAL_PROPERTIES },
    { name: 'vehicles', items: payload.vehicles || INITIAL_VEHICLES },
    { name: 'hotels', items: payload.hotels || INITIAL_HOTELS },
    { name: 'restaurants', items: payload.restaurants || INITIAL_RESTAURANTS },
    { name: 'libraries', items: payload.libraries || INITIAL_LIBRARIES },
    { name: 'roommates', items: payload.roommates || INITIAL_ROOMMATES },
    { name: 'landlords', items: payload.landlords || INITIAL_LANDLORDS },
    { name: 'general_items', items: payload.generalItems || INITIAL_GENERAL_ITEMS },
    { name: 'clothing', items: payload.clothing || MOCK_CLOTHING_ITEMS },
    { name: 'sports_turfs', items: payload.sportsTurfs || MOCK_SPORTS_TURFS },
    { name: 'bookings', items: payload.bookings || [] },
    { name: 'saved_items', items: payload.wishlist || [] },
    { name: 'notifications', items: payload.notifications || [] },
    { name: 'users', items: payload.users || [] },
    { name: 'junior_admins', items: payload.juniorAdmins || [] },
    { name: 'reports', items: payload.reports || [] }
  ];

  let totalItemsCount = collectionsToUpload.reduce((acc, curr) => acc + curr.items.length, 0);
  if (payload.systemConfig) totalItemsCount += 1;

  let uploadedSoFar = 0;
  let totalUploaded = 0;
  let totalFailed = 0;
  const collectionStats: Record<string, number> = {};

  for (let idx = 0; idx < collectionsToUpload.length; idx++) {
    const col = collectionsToUpload[idx];
    if (col.items.length > 0) {
      if (onProgress) {
        const percent = totalItemsCount > 0 ? Math.round((uploadedSoFar / totalItemsCount) * 100) : 0;
        onProgress(percent, col.name);
      }

      const result = await saveCollectionBatch(col.name, col.items, () => {
        uploadedSoFar++;
        if (onProgress && totalItemsCount > 0) {
          const percent = Math.min(99, Math.round((uploadedSoFar / totalItemsCount) * 100));
          onProgress(percent, col.name);
        }
      });

      totalUploaded += result.successCount;
      totalFailed += result.failCount;
      collectionStats[col.name] = result.successCount;
    }
  }

  // Upload system config if available
  if (payload.systemConfig) {
    try {
      await saveDocument('system_config', 'admin_credentials', payload.systemConfig);
      totalUploaded += 1;
      collectionStats['system_config'] = 1;
    } catch (e) {
      totalFailed += 1;
    }
  }

  if (onProgress) {
    onProgress(100, 'Complete');
  }

  return {
    totalUploaded,
    totalFailed,
    collections: collectionStats,
    databaseId: firebaseConfig.firestoreDatabaseId || 'default',
    timestamp: new Date().toLocaleString('en-IN'),
    success: totalUploaded > 0
  };
};

/**
 * Fully Automatic Database Seeding and Cloud Auto-Sync
 * Ensures all 15+ collections are saved to Firebase Firestore automatically without manual intervention.
 */
export const autoUploadAllCollectionsSilently = async (payload?: Partial<SyncAllDataPayload>) => {
  try {
    const storedAdminId = typeof window !== 'undefined' ? localStorage.getItem('renthub_admin_id') : null;
    const storedAdminPass = typeof window !== 'undefined' ? localStorage.getItem('renthub_admin_pass') : null;
    const storedUsers = typeof window !== 'undefined' ? localStorage.getItem('renthub_users_list') : null;
    const storedLandlords = typeof window !== 'undefined' ? localStorage.getItem('renthub_landlords_list') : null;
    const storedJuniorAdmins = typeof window !== 'undefined' ? localStorage.getItem('renthub_junior_admins') : null;

    const fullPayload: SyncAllDataPayload = {
      properties: payload?.properties || INITIAL_PROPERTIES,
      vehicles: payload?.vehicles || INITIAL_VEHICLES,
      hotels: payload?.hotels || INITIAL_HOTELS,
      restaurants: payload?.restaurants || INITIAL_RESTAURANTS,
      libraries: payload?.libraries || INITIAL_LIBRARIES,
      roommates: payload?.roommates || INITIAL_ROOMMATES,
      landlords: payload?.landlords || (storedLandlords ? JSON.parse(storedLandlords) : INITIAL_LANDLORDS),
      generalItems: payload?.generalItems || INITIAL_GENERAL_ITEMS,
      clothing: payload?.clothing || MOCK_CLOTHING_ITEMS,
      sportsTurfs: payload?.sportsTurfs || MOCK_SPORTS_TURFS,
      bookings: payload?.bookings || [],
      wishlist: payload?.wishlist || [],
      notifications: payload?.notifications || [],
      users: payload?.users || (storedUsers ? JSON.parse(storedUsers) : []),
      juniorAdmins: payload?.juniorAdmins || (storedJuniorAdmins ? JSON.parse(storedJuniorAdmins) : []),
      systemConfig: payload?.systemConfig || {
        id: 'admin_credentials',
        adminId: storedAdminId || 'admin@1234',
        adminPass: storedAdminPass || 'Admin12345',
        updatedAt: new Date().toISOString()
      }
    };

    const result = await uploadAllDataToFirestore(fullPayload);
    console.log('✅ Automatic Firebase Background Sync Completed:', result);
    return result;
  } catch (err) {
    console.warn('Background auto-sync note:', err);
    return null;
  }
};

/**
 * Initial Database Seeding Helper
 * Fills Firestore collections with rich initial data if empty.
 */
export const seedDatabaseIfEmpty = async () => {
  try {
    const credRef = doc(db, 'system_config', 'admin_credentials');
    const snap = await getDoc(credRef);
    if (!snap.exists()) {
      await autoUploadAllCollectionsSilently();
    }
  } catch (err) {
    console.warn('Error during Firebase seeding check:', err);
  }
};
