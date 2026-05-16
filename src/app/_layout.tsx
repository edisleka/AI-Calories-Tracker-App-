import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file " +
      "before signing in. Get one at https://dashboard.clerk.com.",
  );
}

function SplashController() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  return null;
}

export default function RootLayout() {
  if (!publishableKey) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <SplashController />
        <Slot />
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
