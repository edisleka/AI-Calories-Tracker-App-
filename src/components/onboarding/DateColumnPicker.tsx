import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";

type Props = {
  label: string;
  value: number;
  options: { label: string; value: number }[];
  onChange: (value: number) => void;
};

export function DateColumnPicker({ label, value, options, onChange }: Props) {
  return (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.listWrap}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <TouchableOpacity
                key={`${label}-${option.value}`}
                onPress={() => onChange(option.value)}
                style={[styles.item, selected && styles.itemSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${label} ${option.label}${selected ? ", selected" : ""}`}
              >
                <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  listWrap: {
    height: 220,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  list: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  item: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: Colors.primary,
  },
  itemText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
  },
  itemTextSelected: {
    color: Colors.white,
  },
});
