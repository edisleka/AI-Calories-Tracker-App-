import { isClerkAPIResponseError, useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { useSetupStatus } from "@/hooks/useSetupStatus";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";
import { resetProfileStatusSession } from "@/lib/profile-status";
import { ROUTES } from "@/lib/routes";
import { clearAllLocalAppData } from "@/lib/storage";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { nutritionPlan } = useSetupStatus(user?.id);

  const displayName = user?.fullName ?? user?.firstName ?? "User";
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress ?? "No email on file";
  const displayAvatar = user?.imageUrl ?? null;
  const displayInitial = (user?.firstName?.[0] ?? "U").toUpperCase();

  const onSignOut = async () => {
    try {
      await signOut();
      await clearAllLocalAppData();
      resetProfileStatusSession();
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
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.profileCard}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{displayInitial}</Text>
              </View>
            )}
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{displayEmail}</Text>
          </View>

          {nutritionPlan && (
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Daily targets</Text>
              <Text style={styles.planRow}>
                Calories: {nutritionPlan.dailyCalories} kcal
              </Text>
              <Text style={styles.planRow}>
                Protein: {nutritionPlan.proteinG}g · Carbs: {nutritionPlan.carbsG}
                g · Fat: {nutritionPlan.fatG}g
              </Text>
              <Text style={styles.planRow}>
                Water: {nutritionPlan.waterMl} ml
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
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
  profileCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: FontSizes.xxl,
    fontWeight: "700",
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  email: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  planCard: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  planTitle: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  planRow: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.dangerSoft,
    marginTop: Spacing.md,
  },
  signOutText: {
    color: Colors.danger,
    fontWeight: "700",
    fontSize: FontSizes.md,
  },
});
