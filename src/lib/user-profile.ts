import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/types/user-profile";
import { isProfileComplete } from "@/types/user-profile";
import { getDb } from "./firebase";
import { getLocalProfile, saveLocalProfile } from "./profile-storage";

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

export async function resolveUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const local = await getLocalProfile(uid);
  if (local) return local;

  const remote = await getUserProfileFromDb(uid);
  if (remote) {
    await saveLocalProfile(uid, remote);
  }
  return remote;
}
