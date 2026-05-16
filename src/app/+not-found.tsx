import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { ROUTES } from "@/lib/routes";

/**
 * Catches OAuth callbacks and other unknown deep links, then sends the user
 * to the right place once Clerk has hydrated.
 */
export default function NotFoundScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={ROUTES.home} />;
  }

  return <Redirect href={ROUTES.signIn} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
