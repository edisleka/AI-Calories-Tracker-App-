import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { ROUTES } from "@/lib/routes";

/**
 * Catches OAuth callbacks and other unknown deep links, then sends users to the
 * correct stack once Clerk has hydrated.
 */
export default function NotFoundScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  return <Redirect href={isSignedIn ? ROUTES.home : ROUTES.signIn} />;
}
