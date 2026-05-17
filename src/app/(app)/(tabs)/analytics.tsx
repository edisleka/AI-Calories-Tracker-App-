import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";

export default function AnalyticsScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#DCFCE7", "#FFFFFF"]}
        style={styles.bgGradient}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            Trends for calories, macros, and activity will show up here.
          </Text>

          <View style={styles.card}>
            <Ionicons name="stats-chart-outline" size={28} color={Colors.primary} />
            <Text style={styles.cardTitle}>Weekly overview</Text>
            <Text style={styles.cardBody}>Charts and insights coming soon.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    height: 280,
  },
  scroll: {
    padding: Spacing.xxl,
    gap: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  cardBody: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
