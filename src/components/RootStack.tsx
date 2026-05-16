import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";

export function RootStack() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Screen name="index" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
