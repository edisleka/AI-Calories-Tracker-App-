import { useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState } from "react-native";

/**
 * Dismiss the native splash as soon as JS is running, then again whenever the
 * app returns to the foreground (e.g. after the Google OAuth browser closes).
 */
export function SplashController() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    void SplashScreen.hideAsync();
  }, [isLoaded]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void SplashScreen.hideAsync();
      }
    });
    return () => sub.remove();
  }, []);

  return null;
}
