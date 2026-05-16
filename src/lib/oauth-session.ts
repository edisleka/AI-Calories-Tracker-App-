import * as SplashScreen from "expo-splash-screen";

/**
 * Survives screen remounts when the app returns from the Google OAuth browser.
 * Cleared when Clerk reports a signed-in session or the flow errors/cancels.
 */
let oauthInProgress = false;

export function setOAuthInProgress(value: boolean): void {
  oauthInProgress = value;
  if (value) {
    void SplashScreen.hideAsync();
  }
}

export function isOAuthInProgress(): boolean {
  return oauthInProgress;
}
