import AsyncStorage from "@react-native-async-storage/async-storage";

const SIGNED_IN_HINT_KEY = "@aict/isSignedIn";
/** Legacy key that stored PII in plain text — removed on sign-out and when re-saving hint. */
const LEGACY_USER_KEY = "@aict/user";

/**
 * Non-sensitive session hint only. Profile fields (email, name, avatar) must
 * come from the Clerk session via `useUser()`, not from local storage.
 */
export async function setSignedInHint(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([LEGACY_USER_KEY]);
    await AsyncStorage.setItem(SIGNED_IN_HINT_KEY, "1");
  } catch (e) {
    console.warn("[storage] setSignedInHint failed:", e);
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

export async function clearSignedInHint(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([SIGNED_IN_HINT_KEY, LEGACY_USER_KEY]);
  } catch (e) {
    console.warn("[storage] clearSignedInHint failed:", e);
  }
}
