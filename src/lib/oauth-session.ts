import * as SplashScreen from "expo-splash-screen";
import { useSyncExternalStore } from "react";

/**
 * Survives screen remounts when the app returns from the Google OAuth browser.
 * Cleared when Clerk reports a signed-in session or the flow errors/cancels.
 */
let oauthInProgress = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return oauthInProgress;
}

export function setOAuthInProgress(value: boolean): void {
  if (oauthInProgress === value) return;
  oauthInProgress = value;
  if (value) {
    void SplashScreen.hideAsync();
  }
  notify();
}

export function useOAuthInProgress(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
