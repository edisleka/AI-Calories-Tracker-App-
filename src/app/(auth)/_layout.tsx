import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ROUTES } from "@/lib/routes";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (segments[0] === "(auth)") {
      router.replace(ROUTES.home);
    }
  }, [isLoaded, isSignedIn, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
