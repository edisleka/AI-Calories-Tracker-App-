import { Stack } from "expo-router";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { isOAuthInProgress } from "@/lib/oauth-session";

export default function AuthLayout() {
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
