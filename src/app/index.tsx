import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ROUTES } from "@/lib/routes";

/** Anchor route: sends users to the first available protected screen. */
export default function Index() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={ROUTES.home} />;
  }

  return <Redirect href={ROUTES.signIn} />;
}
