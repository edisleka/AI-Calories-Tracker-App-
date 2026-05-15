import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, FontSizes, Radius, Shadows, Spacing } from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const GOOGLE_ICON_URI =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/48px-Google_%22G%22_logo.svg.png";

export function GoogleButton({ label, onPress, loading, disabled }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, (disabled || loading) && { opacity: 0.6 }]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <View style={styles.row}>
          <Image
            source={{ uri: GOOGLE_ICON_URI }}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  icon: {
    width: 22,
    height: 22,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
  },
});
