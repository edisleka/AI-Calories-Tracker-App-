import {
  BalanceScaleIcon,
  BodyWeightIcon,
  ChartDecreaseIcon,
  ChartIncreaseIcon,
  Dumbbell01Icon,
  Dumbbell02Icon,
  EquipmentGym03Icon,
  FemaleSymbolIcon,
  MaleSymbolIcon,
  NeutralIcon,
  RulerIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeIcon } from "@/components/HugeIcon";
import { DateColumnPicker } from "@/components/onboarding/DateColumnPicker";
import { OnboardingOptionCard } from "@/components/onboarding/OnboardingOptionCard";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";
import { ROUTES } from "@/lib/routes";
import type {
  FitnessGoal,
  Gender,
  UserProfile,
  UserProfileDraft,
  WorkoutFrequency,
} from "@/types/user-profile";
import { isProfileComplete, isValidBirthDate } from "@/types/user-profile";

const TOTAL_STEPS = 5;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
].map((label, index) => ({ label, value: index + 1 }));

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
}));

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => {
  const year = CURRENT_YEAR - 16 - i;
  return { label: String(year), value: year };
});

const STEP_META = [
  {
    title: "Select your gender",
    subtitle: "This helps us personalize your calorie and fitness plan.",
  },
  {
    title: "What is your goal?",
    subtitle: "We will tailor recommendations to match your target.",
  },
  {
    title: "Workout frequency",
    subtitle: "How many days per week do you usually train?",
  },
  {
    title: "When were you born?",
    subtitle: "Your age helps us estimate daily energy needs accurately.",
  },
  {
    title: "Body measurements",
    subtitle: "Enter your current weight and height.",
  },
] as const;

export default function OnboardingScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<UserProfileDraft>({
    birthDay: 15,
    birthMonth: 6,
    birthYear: CURRENT_YEAR - 25,
  });
  const [weightText, setWeightText] = useState("");
  const [heightText, setHeightText] = useState("");

  const meta = STEP_META[step];

  const patch = (partial: UserProfileDraft) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return draft.gender != null;
      case 1:
        return draft.goal != null;
      case 2:
        return draft.workoutFrequency != null;
      case 3:
        return isValidBirthDate(
          draft.birthDay,
          draft.birthMonth,
          draft.birthYear,
        );
      case 4: {
        const weight = parseFloat(weightText.replace(",", "."));
        const height = parseFloat(heightText.replace(",", "."));
        return weight > 0 && height > 0;
      }
      default:
        return false;
    }
  }, [step, draft, weightText, heightText]);

  const onBack = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
  };

  const onContinue = async () => {
    if (!canContinue) return;

    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }

    if (!user?.id) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    const weightKg = parseFloat(weightText.replace(",", "."));
    const heightCm = parseFloat(heightText.replace(",", "."));

    const profile: UserProfile = {
      gender: draft.gender!,
      goal: draft.goal!,
      workoutFrequency: draft.workoutFrequency!,
      birthDay: draft.birthDay!,
      birthMonth: draft.birthMonth!,
      birthYear: draft.birthYear!,
      weightKg,
      heightCm,
    };

    if (!isProfileComplete(profile)) {
      Alert.alert("Invalid profile", "Please review your answers and try again.");
      return;
    }

    setSaving(true);
    try {
      router.push({
        pathname: ROUTES.generatePlan,
        params: { profileJson: JSON.stringify(profile) },
      } as Href);
    } catch {
      setSaving(false);
      Alert.alert("Navigation failed", "Please try again.");
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#DCFCE7", "#FFFFFF", "#FFFFFF"]}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <OnboardingProgress step={step} total={TOTAL_STEPS} />
            {step > 0 ? (
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{meta.title}</Text>
            <Text style={styles.subtitle}>{meta.subtitle}</Text>

            {step === 0 ? (
              <View style={styles.options}>
                <OnboardingOptionCard
                  label="Male"
                  icon={MaleSymbolIcon}
                  selected={draft.gender === "male"}
                  onPress={() => patch({ gender: "male" as Gender })}
                />
                <OnboardingOptionCard
                  label="Female"
                  icon={FemaleSymbolIcon}
                  selected={draft.gender === "female"}
                  onPress={() => patch({ gender: "female" as Gender })}
                />
                <OnboardingOptionCard
                  label="Other"
                  icon={NeutralIcon}
                  selected={draft.gender === "other"}
                  onPress={() => patch({ gender: "other" as Gender })}
                />
                <OnboardingOptionCard
                  label="Prefer not to say"
                  icon={UserCircleIcon}
                  selected={draft.gender === "prefer_not_to_say"}
                  onPress={() => patch({ gender: "prefer_not_to_say" as Gender })}
                />
              </View>
            ) : null}

            {step === 1 ? (
              <View style={styles.options}>
                <OnboardingOptionCard
                  label="Gain weight"
                  description="Build mass with a calorie surplus"
                  icon={ChartIncreaseIcon}
                  selected={draft.goal === "gain"}
                  onPress={() => patch({ goal: "gain" as FitnessGoal })}
                />
                <OnboardingOptionCard
                  label="Lose weight"
                  description="Burn fat with a controlled deficit"
                  icon={ChartDecreaseIcon}
                  selected={draft.goal === "lose"}
                  onPress={() => patch({ goal: "lose" as FitnessGoal })}
                />
                <OnboardingOptionCard
                  label="Maintain"
                  description="Stay steady at your current weight"
                  icon={BalanceScaleIcon}
                  selected={draft.goal === "maintain"}
                  onPress={() => patch({ goal: "maintain" as FitnessGoal })}
                />
              </View>
            ) : null}

            {step === 2 ? (
              <View style={styles.options}>
                <OnboardingOptionCard
                  label="2–3 days"
                  description="Light activity / beginner rhythm"
                  icon={Dumbbell01Icon}
                  selected={draft.workoutFrequency === "2-3"}
                  onPress={() =>
                    patch({ workoutFrequency: "2-3" as WorkoutFrequency })
                  }
                />
                <OnboardingOptionCard
                  label="3–4 days"
                  description="Balanced training schedule"
                  icon={Dumbbell02Icon}
                  selected={draft.workoutFrequency === "3-4"}
                  onPress={() =>
                    patch({ workoutFrequency: "3-4" as WorkoutFrequency })
                  }
                />
                <OnboardingOptionCard
                  label="5–6 days"
                  description="High-frequency training"
                  icon={EquipmentGym03Icon}
                  selected={draft.workoutFrequency === "5-6"}
                  onPress={() =>
                    patch({ workoutFrequency: "5-6" as WorkoutFrequency })
                  }
                />
              </View>
            ) : null}

            {step === 3 ? (
              <View style={styles.dateRow}>
                <DateColumnPicker
                  label="Month"
                  value={draft.birthMonth ?? 1}
                  options={MONTHS}
                  onChange={(birthMonth) => patch({ birthMonth })}
                />
                <DateColumnPicker
                  label="Day"
                  value={draft.birthDay ?? 1}
                  options={DAYS}
                  onChange={(birthDay) => patch({ birthDay })}
                />
                <DateColumnPicker
                  label="Year"
                  value={draft.birthYear ?? CURRENT_YEAR - 25}
                  options={YEARS}
                  onChange={(birthYear) => patch({ birthYear })}
                />
              </View>
            ) : null}

            {step === 4 ? (
              <View style={styles.metrics}>
                <View style={styles.metricCard}>
                  <View style={styles.metricLabelRow}>
                    <View style={styles.metricIcon}>
                      <HugeIcon
                        icon={BodyWeightIcon}
                        size={22}
                        color={Colors.primaryDark}
                      />
                    </View>
                    <View>
                      <Text style={styles.metricLabel}>Weight</Text>
                      <Text style={styles.metricUnit}>kg</Text>
                    </View>
                  </View>
                  <TextInput
                    style={styles.metricInput}
                    value={weightText}
                    onChangeText={setWeightText}
                    placeholder="e.g. 72"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    maxLength={6}
                  />
                </View>
                <View style={styles.metricCard}>
                  <View style={styles.metricLabelRow}>
                    <View style={styles.metricIcon}>
                      <HugeIcon
                        icon={RulerIcon}
                        size={22}
                        color={Colors.primaryDark}
                      />
                    </View>
                    <View>
                      <Text style={styles.metricLabel}>Height</Text>
                      <Text style={styles.metricUnit}>cm</Text>
                    </View>
                  </View>
                  <TextInput
                    style={styles.metricInput}
                    value={heightText}
                    onChangeText={setHeightText}
                    placeholder="e.g. 175"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    maxLength={6}
                  />
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label={step === TOTAL_STEPS - 1 ? "Finish setup" : "Continue"}
              onPress={onContinue}
              loading={saving}
              disabled={!canContinue}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: 320,
  },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
  },
  backText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  backPlaceholder: {
    height: 24,
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.display,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: -Spacing.md,
  },
  options: {
    gap: Spacing.md,
  },
  dateRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  metrics: {
    gap: Spacing.lg,
  },
  metricCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  metricUnit: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  metricInput: {
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
