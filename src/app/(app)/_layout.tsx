import { useUser } from "@clerk/clerk-expo";
import { type Href, Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { AuthLoadingScreen } from "@/components/AuthLoadingScreen";
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { anonymizeUserId } from "@/lib/anonymize";
import { ROUTES } from "@/lib/routes";
import { setSignedInHint } from "@/lib/storage";
import { upsertUser } from "@/lib/users";

export default function AppLayout() {
  const { user } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const lastSyncedUid = useRef<string | null>(null);
  const {
    loading: setupLoading,
    profileComplete,
    nutritionPlanComplete,
    setupComplete,
  } = useSetupStatus(user?.id);

  const segmentList = segments as string[];
  const onOnboarding = segmentList.includes("onboarding");
  const onGeneratePlan = segmentList.includes("generate-plan");

  useEffect(() => {
    if (!user || setupLoading) return;

    if (!profileComplete && !onOnboarding) {
      router.replace(ROUTES.onboarding as Href);
      return;
    }

    if (profileComplete && !nutritionPlanComplete && !onGeneratePlan) {
      router.replace(ROUTES.generatePlan as Href);
      return;
    }

    if (setupComplete && (onOnboarding || onGeneratePlan)) {
      router.replace(ROUTES.home as Href);
    }
  }, [
    user,
    setupLoading,
    profileComplete,
    nutritionPlanComplete,
    setupComplete,
    onOnboarding,
    onGeneratePlan,
    router,
  ]);

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

  if (user && setupLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
