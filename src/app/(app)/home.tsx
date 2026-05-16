import { isClerkAPIResponseError, useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSizes, Radius, Shadows, Spacing } from "@/constants/theme";
import { ROUTES } from "@/lib/routes";
import {
  clearCachedUser,
  getCachedUser,
  type CachedUser,
} from "@/lib/storage";

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [cached, setCached] = useState<CachedUser | null>(null);
  useEffect(() => {
    getCachedUser().then(setCached);
  }, []);

  // Prefer the live Clerk user; fall back to the AsyncStorage snapshot for
  // a flash-free cold start before Clerk finishes hydrating.
  const displayName = user?.firstName ?? cached?.firstName ?? "there";
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress ?? cached?.email ?? "user";
  const displayAvatar = user?.imageUrl ?? cached?.imageUrl ?? null;
  const displayInitial = (
    user?.firstName?.[0] ??
    cached?.firstName?.[0] ??
    "U"
  ).toUpperCase();

  const onSignOut = async () => {
    try {
      await clearCachedUser();
      await signOut();
      router.replace(ROUTES.signIn);
    } catch (err) {
      const message = isClerkAPIResponseError(err)
        ? err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message
        : "Sign out failed. Please try again.";
      Alert.alert("Sign out failed", message ?? "Unknown error");
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#DCFCE7", "#FFFFFF"]}
        style={styles.bgGradient}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hi, {displayName} 👋</Text>
              <Text style={styles.subGreeting}>
                Let&apos;s crush today&apos;s goals.
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarWrap} onPress={onSignOut}>
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>{displayInitial}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Ionicons name="flame" size={20} color={Colors.white} />
              </View>
              <Text style={styles.heroLabel}>Today</Text>
            </View>
            <Text style={styles.heroNumber}>0</Text>
            <Text style={styles.heroUnit}>kcal tracked</Text>
            <View style={styles.heroProgress}>
              <View style={styles.heroProgressFill} />
            </View>
            <Text style={styles.heroFooter}>0 / 2,000 kcal goal</Text>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Quick actions</Text>

          <View style={styles.quickRow}>
            <QuickAction icon="camera-outline" label="Scan meal" />
            <QuickAction icon="sparkles-outline" label="Ask AI" />
            <QuickAction icon="add-circle-outline" label="Log food" />
          </View>

          <View style={styles.signedInBanner}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={Colors.success}
            />
            <Text style={styles.signedInText}>
              Signed in as {displayEmail}
            </Text>
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.quickCard}>
      <View style={styles.quickIconWrap}>
        <Ionicons name={icon} size={22} color={Colors.primaryDark} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    height: 360,
  },
  scroll: {
    padding: Spacing.xxl,
    gap: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.sm,
  },
  avatar: { width: "100%", height: "100%" },
  avatarFallback: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    ...Shadows.primary,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSizes.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroNumber: {
    color: Colors.white,
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -2,
  },
  heroUnit: {
    color: "rgba(255,255,255,0.8)",
    fontSize: FontSizes.md,
    fontWeight: "600",
    marginTop: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  heroProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  heroProgressFill: {
    width: "0%",
    height: "100%",
    backgroundColor: Colors.white,
  },
  heroFooter: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSizes.sm,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: -Spacing.md,
  },
  quickRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  signedInBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  signedInText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: "600",
    flex: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.dangerSoft,
  },
  signOutText: {
    color: Colors.danger,
    fontWeight: "700",
    fontSize: FontSizes.md,
  },
});
