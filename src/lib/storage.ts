import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@aict/user";
const SIGNED_IN_HINT_KEY = "@aict/isSignedIn";

export type CachedUser = {
  uid: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  cachedAt: number;
};

/**
 * Persist the user profile to AsyncStorage so the next cold start can render
 * the home screen instantly while Clerk hydrates its session in the background.
 *
 * Clerk's `tokenCache` (expo-secure-store) is the source of truth for the
 * actual auth session — this is a UX optimization, not an auth bypass.
 */
export async function saveCachedUser(user: CachedUser): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [USER_KEY, JSON.stringify(user)],
      [SIGNED_IN_HINT_KEY, "1"],
    ]);
  } catch (e) {
    console.warn("[storage] saveCachedUser failed:", e);
  }
}

export async function getCachedUser(): Promise<CachedUser | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedUser;
  } catch (e) {
    console.warn("[storage] getCachedUser failed:", e);
    return null;
  }
}

export async function getSignedInHint(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(SIGNED_IN_HINT_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

export async function clearCachedUser(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([USER_KEY, SIGNED_IN_HINT_KEY]);
  } catch (e) {
    console.warn("[storage] clearCachedUser failed:", e);
  }
}
