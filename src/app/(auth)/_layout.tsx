import { Stack } from "expo-router";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { useOAuthInProgress } from "@/lib/oauth-session";

export default function AuthLayout() {
  const oauthInProgress = useOAuthInProgress();

  if (oauthInProgress) {
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
