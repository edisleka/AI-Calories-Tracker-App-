import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/types/user-profile";
import { isProfileComplete } from "@/types/user-profile";
import { getDb } from "./firebase";
import {
  clearLocalProfile,
  getLocalProfile,
  saveLocalProfile,
} from "./profile-storage";

function parseProfile(data: Record<string, unknown>): UserProfile | null {
  const profile: UserProfile = {
    gender: data.gender as UserProfile["gender"],
    goal: data.goal as UserProfile["goal"],
    workoutFrequency: data.workoutFrequency as UserProfile["workoutFrequency"],
    birthDay: Number(data.birthDay),
    birthMonth: Number(data.birthMonth),
    birthYear: Number(data.birthYear),
    weightKg: Number(data.weightKg),
    heightCm: Number(data.heightCm),
  };

  return isProfileComplete(profile) ? profile : null;
}

export async function getUserProfileFromDb(
  uid: string,
): Promise<UserProfile | null> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) return null;

  try {
    const snapshot = await getDoc(doc(getDb(), "users", uid));
    if (!snapshot.exists()) return null;
    return parseProfile(snapshot.data());
  } catch (e) {
    console.warn("[firestore] getUserProfileFromDb failed:", e);
    return null;
  }
}

export async function saveUserProfileToDb(
  uid: string,
  profile: UserProfile,
): Promise<void> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error("Firebase is not configured.");
  }

  await setDoc(
    doc(getDb(), "users", uid),
    {
      ...profile,
      onboardingCompletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Loads profile from Firestore first; local cache only when the remote request fails. */
export async function resolveUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    return getLocalProfile(uid);
  }

  try {
    const snapshot = await getDoc(doc(getDb(), "users", uid));
    if (!snapshot.exists()) {
      await clearLocalProfile(uid);
      return null;
    }

    const profile = parseProfile(snapshot.data());
    if (profile) {
      try {
        await saveLocalProfile(uid, profile);
      } catch (e) {
        console.warn("[profile] failed to cache remote profile:", e);
      }
      return profile;
    }

    await clearLocalProfile(uid);
    return null;
  } catch (e) {
    console.warn("[firestore] resolveUserProfile remote failed:", e);
    return getLocalProfile(uid);
  }
}
