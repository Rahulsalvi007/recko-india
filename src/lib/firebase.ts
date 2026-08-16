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
  orderBy
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

// Firebase Auth & Firestore Instances
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

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
    callback(items);
  }, (error) => {
    console.warn(`Firestore subscription error for ${collectionName}:`, error);
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
  const docRef = doc(db, collectionName, docId);
  const sanitizedData = cleanUndefinedFields(data);
  try {
    await setDoc(docRef, sanitizedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(db, collectionName, docId);
  const sanitizedData = cleanUndefinedFields(data);
  try {
    await updateDoc(docRef, sanitizedData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
};

/**
 * Initial Database Seeding Helper
 * Fills Firestore collections with rich initial data if empty.
 */
export const seedDatabaseIfEmpty = async () => {
  try {
    // Check properties
    const propsSnap = await getDocs(collection(db, 'properties'));
    if (propsSnap.empty) {
      console.log('Seeding properties collection to Firebase...');
      for (const item of INITIAL_PROPERTIES) {
        await saveDocument('properties', item.id, item);
      }
    }

    // Check hotels
    const hotelsSnap = await getDocs(collection(db, 'hotels'));
    if (hotelsSnap.empty) {
      console.log('Seeding hotels collection to Firebase...');
      for (const item of INITIAL_HOTELS) {
        await saveDocument('hotels', item.id, item);
      }
    }

    // Check restaurants
    const restSnap = await getDocs(collection(db, 'restaurants'));
    if (restSnap.empty) {
      console.log('Seeding restaurants collection to Firebase...');
      for (const item of INITIAL_RESTAURANTS) {
        await saveDocument('restaurants', item.id, item);
      }
    }

    // Check libraries
    const libSnap = await getDocs(collection(db, 'libraries'));
    if (libSnap.empty) {
      console.log('Seeding libraries collection to Firebase...');
      for (const item of INITIAL_LIBRARIES) {
        await saveDocument('libraries', item.id, item);
      }
    }

    // Check vehicles
    const vehSnap = await getDocs(collection(db, 'vehicles'));
    if (vehSnap.empty) {
      console.log('Seeding vehicles collection to Firebase...');
      for (const item of INITIAL_VEHICLES) {
        await saveDocument('vehicles', item.id, item);
      }
    }

    // Check roommates
    const rmSnap = await getDocs(collection(db, 'roommates'));
    if (rmSnap.empty) {
      console.log('Seeding roommates collection to Firebase...');
      for (const item of INITIAL_ROOMMATES) {
        await saveDocument('roommates', item.id, item);
      }
    }

    // Check landlords
    const llSnap = await getDocs(collection(db, 'landlords'));
    if (llSnap.empty) {
      console.log('Seeding landlords collection to Firebase...');
      for (const item of INITIAL_LANDLORDS) {
        await saveDocument('landlords', item.id, item);
      }
    }

    // Check general items
    const genSnap = await getDocs(collection(db, 'general_items'));
    if (genSnap.empty) {
      console.log('Seeding general items collection to Firebase...');
      for (const item of INITIAL_GENERAL_ITEMS) {
        await saveDocument('general_items', item.id, item);
      }
    }

    // Check clothing
    const clothSnap = await getDocs(collection(db, 'clothing'));
    if (clothSnap.empty) {
      console.log('Seeding clothing collection to Firebase...');
      for (const item of MOCK_CLOTHING_ITEMS) {
        await saveDocument('clothing', item.id, item);
      }
    }

    // Check sports turfs
    const turfSnap = await getDocs(collection(db, 'sports_turfs'));
    if (turfSnap.empty) {
      console.log('Seeding sports turfs collection to Firebase...');
      for (const item of MOCK_SPORTS_TURFS) {
        await saveDocument('sports_turfs', item.id, item);
      }
    }
  } catch (err) {
    console.error('Error during Firebase seeding:', err);
  }
};
