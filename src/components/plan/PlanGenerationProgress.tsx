import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";

export type PlanStepStatus = "pending" | "loading" | "done";

export type PlanStep = {
  label: string;
  status: PlanStepStatus;
};

type Props = {
  title: string;
  message: string;
  progress: number;
  steps: PlanStep[];
};

function StepIcon({ status }: { status: PlanStepStatus }) {
  if (status === "done") {
    return (
      <Ionicons
        name="checkmark-circle"
        size={22}
        color={Colors.primary}
        accessibilityLabel="Completed"
      />
    );
  }

  if (status === "loading") {
    return (
      <ActivityIndicator
        size="small"
        color={Colors.primary}
        accessibilityLabel="In progress"
      />
    );
  }

  return <View style={styles.pendingIcon} accessibilityLabel="Pending" />;
}

export function PlanGenerationProgress({
  title,
  message,
  progress,
  steps,
}: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
      >
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
      <Text style={styles.percent}>{Math.round(clamped)}%</Text>

      <View style={styles.steps}>
        {steps.map((step) => (
          <View key={step.label} style={styles.stepRow}>
            <View style={styles.iconSlot}>
              <StepIcon status={step.status} />
            </View>
            <Text
              style={[
                styles.stepLabel,
                step.status === "loading" && styles.stepLabelActive,
                step.status === "done" && styles.stepLabelDone,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  track: {
    width: "100%",
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.inputBg,
    overflow: "hidden",
    marginTop: Spacing.sm,
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
  },
  percent: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  steps: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconSlot: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  stepLabel: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  stepLabelActive: {
    color: Colors.text,
    fontWeight: "600",
  },
  stepLabelDone: {
    color: Colors.textSecondary,
  },
});
