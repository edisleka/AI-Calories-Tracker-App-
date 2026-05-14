import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Warms up the in-app browser on Android to make the OAuth handoff feel snappy.
 * No-op on iOS / web.
 *
 * Pattern from Clerk's official Expo SSO custom-flow docs.
 */
export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}
