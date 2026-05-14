import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, FontSizes, Radius, Shadows, Spacing } from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, loading, disabled, style }: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.touchable, style]}
    >
      <View style={[styles.shadow, isDisabled && styles.shadowDisabled]}>
        <LinearGradient
          colors={
            isDisabled
              ? [Colors.textMuted, Colors.textMuted]
              : [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.label}>{label}</Text>
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
  },
  shadow: {
    borderRadius: Radius.xl,
    ...Shadows.primary,
  },
  shadowDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    height: 58,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  label: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
