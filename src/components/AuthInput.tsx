import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  isPassword?: boolean;
};

export function AuthInput({
  label,
  icon,
  error,
  isPassword,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!isPassword);

  const borderColor = error
    ? Colors.danger
    : focused
    ? Colors.inputFocusBorder
    : Colors.inputBorder;

  const backgroundColor = focused ? Colors.inputFocusBg : Colors.inputBg;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.container, { borderColor, backgroundColor }]}>
        <Ionicons
          name={icon}
          size={20}
          color={focused ? Colors.primary : Colors.textMuted}
          style={styles.leftIcon}
        />
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword ? hidden : rest.secureTextEntry}
          autoCapitalize={rest.autoCapitalize ?? "none"}
          autoCorrect={rest.autoCorrect ?? false}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            style={styles.trailing}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  leftIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    paddingVertical: 0,
  },
  trailing: {
    paddingLeft: Spacing.sm,
  },
  error: {
    color: Colors.danger,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: 2,
  },
});
