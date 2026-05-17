import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "@/types/user-profile";
import { isProfileComplete } from "@/types/user-profile";

function profileKey(uid: string) {
  return `@aict/profile/${uid}`;
}

export async function getLocalProfile(
  uid: string,
): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(profileKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return isProfileComplete(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveLocalProfile(
  uid: string,
  profile: UserProfile,
): Promise<void> {
  try {
    await AsyncStorage.setItem(profileKey(uid), JSON.stringify(profile));
  } catch (e) {
    console.warn("[storage] saveLocalProfile failed:", e);
  }
}
