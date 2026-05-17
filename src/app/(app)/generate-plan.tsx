import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PlanGenerationProgress,
  type PlanStep,
  type PlanStepStatus,
} from "@/components/plan/PlanGenerationProgress";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";
import { generateNutritionPlanWithGemini } from "@/lib/gemini-nutrition";
import { saveNutritionPlanToDb } from "@/lib/nutrition-plan";
import {
  markProfileCompleted,
  notifyProfileStatusChanged,
} from "@/lib/profile-status";
import { saveLocalProfile } from "@/lib/profile-storage";
import { ROUTES } from "@/lib/routes";
import { resolveUserProfile, saveUserProfileToDb } from "@/lib/user-profile";
import type { NutritionPlan } from "@/types/nutrition-plan";
import type { UserProfile } from "@/types/user-profile";
import { isProfileComplete } from "@/types/user-profile";

type Phase = "loading" | "success" | "error";

const LOADING_STEP_LABELS = [
  "Saving your profile",
  "Analyzing your goals",
  "Preparing your targets",
  "Generating your nutrition plan with AI",
] as const;

const DUMMY_STEP_MS = 1400;

function initialStepStatuses(): PlanStepStatus[] {
  return LOADING_STEP_LABELS.map((_, index) =>
    index === 0 ? "loading" : "pending",
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseProfileParam(raw: string | string[] | undefined): UserProfile | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as UserProfile;
    return isProfileComplete(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function MacroCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroValue}>
        {Math.round(value)}
        <Text style={styles.macroUnit}> {unit}</Text>
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export default function GeneratePlanScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { profileJson } = useLocalSearchParams<{ profileJson?: string }>();
  const paramProfile = useMemo(
    () => parseProfileParam(profileJson),
    [profileJson],
  );
  const [profile, setProfile] = useState<UserProfile | null>(paramProfile);
  const [resolvingProfile, setResolvingProfile] = useState(!paramProfile);

  const [phase, setPhase] = useState<Phase>("loading");
  const [stepStatuses, setStepStatuses] =
    useState<PlanStepStatus[]>(initialStepStatuses);
  const [progress, setProgress] = useState(8);
  const [message, setMessage] = useState("Getting things ready…");
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const started = useRef(false);

  const completeStep = useCallback((index: number) => {
    setStepStatuses((prev) => {
      const next = [...prev];
      next[index] = "done";
      if (index + 1 < next.length) {
        next[index + 1] = "loading";
      }
      return next;
    });
  }, []);

  const runGeneration = useCallback(async () => {
    if (!user?.id || !profile) return;

    const lastStepIndex = LOADING_STEP_LABELS.length - 1;

    setPhase("loading");
    setErrorMessage(null);
    setStepStatuses(initialStepStatuses());
    setProgress(10);
    setMessage("Saving your answers securely…");

    try {
      try {
        await saveUserProfileToDb(user.id, profile);
        await saveLocalProfile(user.id, profile);
      } catch (cloudErr) {
        console.warn("[generate-plan] profile cloud save failed:", cloudErr);
        await saveLocalProfile(user.id, profile);
      }

      await wait(DUMMY_STEP_MS);
      completeStep(0);
      setProgress(25);
      setMessage("Reviewing your age, weight, height, and fitness goal…");
      await wait(DUMMY_STEP_MS);

      completeStep(1);
      setProgress(45);
      setMessage("Estimating energy needs from your workout schedule…");
      await wait(DUMMY_STEP_MS);

      completeStep(2);
      setProgress(62);
      setMessage("Asking Gemini to calculate calories, macros, and hydration…");

      const generated = await generateNutritionPlanWithGemini(profile);

      completeStep(lastStepIndex);
      setProgress(85);
      setMessage("Saving your personalized plan to your account…");

      await saveNutritionPlanToDb(user.id, generated);

      setProgress(100);
      setMessage("Your plan is ready!");
      setPlan(generated);
      markProfileCompleted(user.id);
      notifyProfileStatusChanged();
      setPhase("success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not generate your plan.";
      console.warn("[generate-plan] failed:", err);
      setErrorMessage(msg);
      setPhase("error");
    }
  }, [profile, user?.id, completeStep]);

  useEffect(() => {
    if (paramProfile) {
      setProfile(paramProfile);
      setResolvingProfile(false);
      return;
    }
    if (!user?.id) return;

    let cancelled = false;
    setResolvingProfile(true);
    resolveUserProfile(user.id)
      .then((resolved) => {
        if (!cancelled) setProfile(resolved);
      })
      .finally(() => {
        if (!cancelled) setResolvingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [paramProfile, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      Alert.alert("Session expired", "Please sign in again.", [
        { text: "OK", onPress: () => router.replace(ROUTES.signIn as Href) },
      ]);
      return;
    }

    if (resolvingProfile) return;

    if (!profile) {
      Alert.alert("Missing profile", "Please complete onboarding first.", [
        {
          text: "OK",
          onPress: () => router.replace(ROUTES.onboarding as Href),
        },
      ]);
      return;
    }

    if (started.current) return;
    started.current = true;
    void runGeneration();
  }, [user?.id, profile, resolvingProfile, router, runGeneration]);

  const steps: PlanStep[] = LOADING_STEP_LABELS.map((label, index) => ({
    label,
    status: stepStatuses[index] ?? "pending",
  }));

  const onContinueHome = () => {
    router.replace(ROUTES.home as Href);
  };

  const onRetry = () => {
    started.current = false;
    void runGeneration();
    started.current = true;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#DCFCE7", "#FFFFFF", "#FFFFFF"]}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {phase === "loading" && (
          <PlanGenerationProgress
            title="Building your plan"
            message={message}
            progress={progress}
            steps={steps}
          />
        )}

        {phase === "error" && (
          <View style={styles.centered}>
            <Text style={styles.errorTitle}>Could not generate plan</Text>
            <Text style={styles.errorBody}>
              {errorMessage ??
                "Something went wrong. Check your connection and API keys, then try again."}
            </Text>
            <PrimaryButton label="Try again" onPress={onRetry} />
            <PrimaryButton
              label="Back to onboarding"
              onPress={() => router.replace(ROUTES.onboarding as Href)}
            />
          </View>
        )}

        {phase === "success" && plan && (
          <ScrollView contentContainerStyle={styles.successScroll}>
            <Text style={styles.successTitle}>Your daily targets</Text>
            <Text style={styles.summary}>{plan.summary}</Text>

            <View style={styles.calorieHero}>
              <Text style={styles.calorieValue}>{plan.dailyCalories}</Text>
              <Text style={styles.calorieLabel}>kcal / day</Text>
            </View>

            <View style={styles.macroGrid}>
              <MacroCard label="Protein" value={plan.proteinG} unit="g" />
              <MacroCard label="Carbs" value={plan.carbsG} unit="g" />
              <MacroCard label="Fat" value={plan.fatG} unit="g" />
              <MacroCard label="Fiber" value={plan.fiberG} unit="g" />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoRow}>
                Water: <Text style={styles.infoValue}>{plan.waterMl} ml</Text>
              </Text>
              <Text style={styles.infoRow}>
                Steps: <Text style={styles.infoValue}>{plan.stepsGoal}</Text>
              </Text>
              <Text style={styles.infoRow}>
                Active minutes:{" "}
                <Text style={styles.infoValue}>{plan.activeMinutesGoal} min</Text>
              </Text>
              <Text style={styles.infoRow}>
                Sleep: <Text style={styles.infoValue}>{plan.sleepHoursGoal} h</Text>
              </Text>
              <Text style={styles.infoRow}>
                BMR / TDEE:{" "}
                <Text style={styles.infoValue}>
                  {plan.bmr} / {plan.tdee} kcal
                </Text>
              </Text>
            </View>

            <PrimaryButton label="Continue to home" onPress={onContinueHome} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  gradient: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  errorTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  errorBody: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  successScroll: {
    padding: Spacing.xxl,
    gap: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: Colors.text,
  },
  summary: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  calorieHero: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxl,
  },
  calorieValue: {
    fontSize: FontSizes.hero,
    fontWeight: "800",
    color: Colors.primaryDark,
  },
  calorieLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  macroCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  macroValue: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  macroUnit: {
    fontSize: FontSizes.sm,
    fontWeight: "500",
    color: Colors.textMuted,
  },
  macroLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontWeight: "600",
    color: Colors.text,
  },
});
