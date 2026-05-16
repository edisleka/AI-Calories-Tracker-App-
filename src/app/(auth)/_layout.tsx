import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { isOAuthInProgress, setOAuthInProgress } from "@/lib/oauth-session";
import { ROUTES } from "@/lib/routes";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;
    setOAuthInProgress(false);
    router.replace(ROUTES.home);
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  // Signed-in users must leave auth immediately (even if oauth flag is still set).
  if (isSignedIn) {
    return <Redirect href={ROUTES.home} />;
  }

  if (isOAuthInProgress()) {
    return <AuthLoadingScreen />;
  }

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
