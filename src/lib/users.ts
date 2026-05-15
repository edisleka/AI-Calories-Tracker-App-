import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";

export type AuthProvider = "password" | "google" | "other";

export type AppUser = {
  uid: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  provider: AuthProvider;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
};

type ClerkUserLike = {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  imageUrl?: string | null;
};

function pickEmail(user: ClerkUserLike): string | null {
  if (user.primaryEmailAddress?.emailAddress) {
    return user.primaryEmailAddress.emailAddress;
  }
  if (user.emailAddresses && user.emailAddresses.length > 0) {
    return user.emailAddresses[0]?.emailAddress ?? null;
  }
  return null;
}

/**
 * Persists a user to Firestore (collection `users`, doc id = Clerk user id).
 * Creates the doc with `createdAt` on first sign-in/up, and always refreshes
 * `lastLoginAt`. Safe to call on every authenticated app launch.
 */
export async function upsertUser(
  user: ClerkUserLike,
  provider: AuthProvider,
): Promise<void> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn("[users] Firebase project id missing; skipping Firestore upsert.");
    return;
  }

  const db = getDb();
  const ref = doc(db, "users", user.id);
  const snapshot = await getDoc(ref);

  const email = pickEmail(user);
  const firstName = user.firstName ?? null;
  const lastName = user.lastName ?? null;
  const joined = [firstName, lastName].filter(Boolean).join(" ");
  const fullName = user.fullName ?? (joined.length > 0 ? joined : null);

  const base: Omit<AppUser, "createdAt"> = {
    uid: user.id,
    email,
    firstName,
    lastName,
    fullName,
    imageUrl: user.imageUrl ?? null,
    provider,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (snapshot.exists()) {
    await setDoc(ref, base, { merge: true });
  } else {
    await setDoc(ref, { ...base, createdAt: serverTimestamp() });
  }
}
