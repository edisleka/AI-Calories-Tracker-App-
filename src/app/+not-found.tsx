import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { ROUTES } from "@/lib/routes";

/**
 * Catches OAuth callbacks and other unknown deep links. Auth routing is handled
 * in the root layout; this only waits for Clerk then enters the auth stack.
 */
export default function NotFoundScreen() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  return <Redirect href={ROUTES.signIn} />;
}
