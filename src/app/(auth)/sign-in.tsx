import { isClerkAPIResponseError, useSignIn, useSSO } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthInput } from "@/components/AuthInput";
import { Divider } from "@/components/Divider";
import { GoogleButton } from "@/components/SocialButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  useWarmUpBrowser();

  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate() {
    let ok = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError("Email is required");
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      ok = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      ok = false;
    }

    return ok;
  }

  const onSignIn = useCallback(async () => {
    if (!isLoaded || !validate()) return;

    setSubmitting(true);
    try {
      const attempt = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(app)/home");
      } else {
        Alert.alert(
          "Almost there",
          "Additional steps are required to finish signing in.",
        );
      }
    } catch (err) {
      const message = isClerkAPIResponseError(err)
        ? err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message
        : "Something went wrong. Please try again.";
      Alert.alert("Sign in failed", message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  const onGoogle = useCallback(async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const result = await startSSOFlow({ strategy: "oauth_google" });

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        router.replace("/(app)/home");
      }
    } catch (err) {
      const message = isClerkAPIResponseError(err)
        ? err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message
        : "Google sign-in didn't complete.";
      Alert.alert("Google sign-in failed", message ?? "Unknown error");
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow, googleLoading, router]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#DCFCE7", "#FFFFFF"]}
        style={styles.bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoWrap}>
              <View style={styles.logoBadge}>
                <Image
                  source={require("@/assets/images/logo-glow.png")}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.heading}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to keep tracking your meals and reach your goals.
              </Text>
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                error={emailError}
              />

              <AuthInput
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
                textContentType="password"
                error={passwordError}
              />

              <TouchableOpacity
                style={styles.forgot}
                hitSlop={8}
                onPress={() =>
                  Alert.alert(
                    "Reset password",
                    "Password recovery is coming soon. For now, please contact support.",
                  )
                }
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <PrimaryButton
                label="Sign In"
                onPress={onSignIn}
                loading={submitting}
                disabled={!isLoaded}
              />

              <View style={{ marginTop: Spacing.xl }}>
                <Divider label="or continue with" />
              </View>

              <View style={{ marginTop: Spacing.lg }}>
                <GoogleButton
                  label="Continue with Google"
                  onPress={onGoogle}
                  loading={googleLoading}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <Link href="/(auth)/sign-up" replace asChild>
                <TouchableOpacity hitSlop={6}>
                  <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    height: 360,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  logoImg: {
    width: 56,
    height: 56,
  },
  heading: {
    marginBottom: Spacing.xxxl,
    alignItems: "center",
  },
  title: {
    fontSize: FontSizes.display,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  form: {
    gap: Spacing.lg,
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  forgotText: {
    color: Colors.primaryDark,
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xxxl,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  footerLink: {
    color: Colors.primaryDark,
    fontWeight: "700",
    fontSize: FontSizes.md,
  },
});
