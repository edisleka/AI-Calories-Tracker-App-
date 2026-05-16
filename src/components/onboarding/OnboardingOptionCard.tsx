import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { HugeIcon } from "@/components/HugeIcon";
import { Colors, FontSizes, Radius, Shadows, Spacing } from "@/constants/theme";
import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";

type Icon = ComponentProps<typeof HugeiconsIcon>["icon"];

type Props = {
  label: string;
  description?: string;
  icon: Icon;
  selected: boolean;
  onPress: () => void;
};

export function OnboardingOptionCard({
  label,
  description,
  icon,
  selected,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <HugeIcon
          icon={icon}
          size={26}
          color={selected ? Colors.white : Colors.primaryDark}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
        {description ? (
          <Text
            style={[styles.description, selected && styles.descriptionSelected]}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    ...Shadows.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },
  iconWrapSelected: {
    backgroundColor: Colors.primary,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.primaryDark,
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  descriptionSelected: {
    color: Colors.text,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
