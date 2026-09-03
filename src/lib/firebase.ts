import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";
import { JournalEntry, ConversationTurn } from "../types";

// Firebase App Initialization
const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firestore with the provisioned named database ID
export const db: Firestore = getFirestore(
  app,
  firebaseConfigJson.firestoreDatabaseId || "(default)"
);

// Zero-crash payload hygiene for Firestore (strictly strips undefined)
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (value === undefined ? null : value))
  );
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google Auth error:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Firebase SignOut error:", error);
    throw error;
  }
}

// User-Isolated Firestore Persistence Operations
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error("Authentication required: userId is missing.");
  
  const sanitized = sanitizeForFirestore(entry);
  
  // 1. Save to /users/{userId}/reflections/{entryId}
  const reflectionRef = doc(db, "users", userId, "reflections", entry.id);
  await setDoc(reflectionRef, sanitized, { merge: true });

  // 2. Also save to /users/{userId}/interactions/{entryId} to support campaign verification rules
  const interactionRef = doc(db, "users", userId, "interactions", entry.id);
  await setDoc(interactionRef, sanitized, { merge: true });
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId) throw new Error("Authentication required: userId is missing.");
  
  const reflectionRef = doc(db, "users", userId, "reflections", entryId);
  const interactionRef = doc(db, "users", userId, "interactions", entryId);
  
  await Promise.all([
    deleteDoc(reflectionRef),
    deleteDoc(interactionRef),
  ]);
}

export async function appendTurnToEntry(
  userId: string,
  entryId: string,
  turn: ConversationTurn,
  existingTurns: ConversationTurn[]
): Promise<void> {
  if (!userId) throw new Error("Authentication required: userId is missing.");
  
  const updatedTurns = [...existingTurns, turn];
  const updatePayload = sanitizeForFirestore({
    turns: updatedTurns,
    updatedAt: new Date().toISOString(),
  });

  const reflectionRef = doc(db, "users", userId, "reflections", entryId);
  const interactionRef = doc(db, "users", userId, "interactions", entryId);

  await Promise.all([
    updateDoc(reflectionRef, updatePayload),
    updateDoc(interactionRef, updatePayload),
  ]);
}

export function subscribeToUserEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError: (error: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const reflectionsCol = collection(db, "users", userId, "reflections");
  // Query ordered by creation time descending
  const q = query(reflectionsCol, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as JournalEntry);
      });
      onUpdate(items);
    },
    (err) => {
      console.error("Firestore subscription error:", err);
      onError(err);
    }
  );
}
