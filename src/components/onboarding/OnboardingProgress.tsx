import { StyleSheet, Text, View } from "react-native";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";

type Props = {
  step: number;
  total: number;
};

export function OnboardingProgress({ step, total }: Props) {
  const safeTotal = Math.max(total, 1);
  const progress = Math.min(1, Math.max(0, (step + 1) / safeTotal));

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        Step {step + 1} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.inputBg,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
