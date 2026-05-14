import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { upsertUser } from "@/lib/users";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    upsertUser(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        primaryEmailAddress: user.primaryEmailAddress
          ? { emailAddress: user.primaryEmailAddress.emailAddress }
          : null,
        emailAddresses: user.emailAddresses.map((e) => ({
          emailAddress: e.emailAddress,
        })),
      },
      // Best-effort: provider for Google sign-ins, password for email/password.
      user.externalAccounts.some((a) => a.provider === "google")
        ? "google"
        : "password",
    ).catch((e) => console.warn("[firestore] background upsert failed:", e));
  }, [user]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
