import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";

export function AuthLoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
        accessibilityState={{ busy: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
