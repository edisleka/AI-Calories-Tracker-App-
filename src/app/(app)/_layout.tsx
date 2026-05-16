import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ROUTES } from "@/lib/routes";
import { saveCachedUser } from "@/lib/storage";
import { upsertUser } from "@/lib/users";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const lastSyncedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    if (segments[0] === "(app)") {
      router.replace(ROUTES.signIn);
    }
  }, [isLoaded, isSignedIn, segments, router]);

  useEffect(() => {
    if (!user) return;
    if (lastSyncedUid.current === user.id) return;
    lastSyncedUid.current = user.id;

    const email = user.primaryEmailAddress?.emailAddress ?? null;

    saveCachedUser({
      uid: user.id,
      email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      fullName: user.fullName ?? null,
      imageUrl: user.imageUrl ?? null,
      cachedAt: Date.now(),
    }).catch((e) => console.warn("[storage] cache failed:", e));

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
      user.externalAccounts.some((a) => a.provider === "google")
        ? "google"
        : "password",
    )
      .then((outcome) => {
        console.log(`[firestore] sync outcome for ${user.id}: ${outcome}`);
      })
      .catch((err: unknown) => {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: unknown }).code)
            : "";
        const message =
          err instanceof Error ? err.message : "unknown error";

        if (code === "permission-denied") {
          console.error(
            "[firestore] PERMISSION DENIED writing users/" +
              user.id +
              ". Update your Firestore security rules. See README.",
          );
        } else {
          console.warn(
            `[firestore] upsert failed (${code || "no-code"}): ${message}`,
          );
        }
        lastSyncedUid.current = null;
      });
  }, [user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
