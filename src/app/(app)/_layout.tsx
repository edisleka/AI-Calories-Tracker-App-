import { useUser } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { anonymizeUserId } from "@/lib/anonymize";
import { setSignedInHint } from "@/lib/storage";
import { upsertUser } from "@/lib/users";

export default function AppLayout() {
  const { user } = useUser();
  const lastSyncedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (lastSyncedUid.current === user.id) return;
    lastSyncedUid.current = user.id;

    setSignedInHint().catch((e) =>
      console.warn("[storage] setSignedInHint failed:", e),
    );

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
        console.log(
          `[firestore] sync outcome for ${anonymizeUserId(user.id)}: ${outcome}`,
        );
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
            `[firestore] PERMISSION DENIED writing users/${anonymizeUserId(user.id)}. ` +
              "Update your Firestore security rules. See README.",
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
