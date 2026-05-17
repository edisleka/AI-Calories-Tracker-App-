import { isClerkAPIResponseError, useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
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
import { PrimaryButton } from "@/components/PrimaryButton";
import { GoogleButton } from "@/components/SocialButton";
import { Colors, FontSizes, Radius, Spacing } from "@/constants/theme";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { setOAuthInProgress } from "@/lib/oauth-session";
import { ROUTES } from "@/lib/routes";

WebBrowser.maybeCompleteAuthSession();

type FieldErrors = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  password?: string | null;
  code?: string | null;
};

export default function SignUpScreen() {
  useWarmUpBrowser();

  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Use at least 8 characters";
    }

    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  const onSubmit = useCallback(async () => {
    if (!isLoaded || !validate()) return;

    setSubmitting(true);
    try {
      await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const first = err.errors?.[0];
        if (first?.code === "form_identifier_exists") {
          Alert.alert(
            "Account already exists",
            "This email is already registered. Please sign in to continue. If you forgot your password, use Forgot password on the sign-in screen. Contact support if you still need help.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign in",
                onPress: () => router.replace(ROUTES.signIn),
              },
            ],
          );
          return;
        }
      }

      const message = isClerkAPIResponseError(err)
        ? err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message
        : "Something went wrong. Please try again.";
      Alert.alert("Sign up failed", message ?? "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }, [isLoaded, firstName, lastName, email, password, signUp, router]);

  const onVerify = useCallback(async () => {
    if (!isLoaded) return;

    if (!/^\d{6}$/.test(code.trim())) {
      setErrors((e) => ({ ...e, code: "Enter the 6-digit code we emailed you" }));
      return;
    }
    setErrors((e) => ({ ...e, code: null }));

    setVerifying(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace(ROUTES.home);
      } else {
        Alert.alert(
          "Verification incomplete",
          "Please make sure the code is correct and try again.",
        );
      }
    } catch (err) {
      const message = isClerkAPIResponseError(err)
        ? err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message
        : "We couldn't verify the code.";
      Alert.alert("Verification failed", message ?? "Unknown error");
    } finally {
      setVerifying(false);
    }
  }, [isLoaded, code, signUp, setActive, router]);

  const onGoogle = useCallback(async () => {
    if (googleLoading) return;
    setOAuthInProgress(true);
    setGoogleLoading(true);
    try {
      const result = await startSSOFlow({ strategy: "oauth_google" });

      const authType = result.authSessionResult?.type;
      if (authType === "cancel" || authType === "dismiss") {
        setOAuthInProgress(false);
        return;
      }

      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
        setOAuthInProgress(false);
        router.replace(ROUTES.home);
        return;
      }

      if (result.signUp?.status === "missing_requirements") {
        setOAuthInProgress(false);
        const missing = result.signUp.missingFields ?? [];
        const detail =
          missing.length > 0
            ? `We still need: ${missing.join(", ")}. Please complete the form manually.`
            : "Some required information is missing. Please complete the form manually.";
        Alert.alert("Almost there", detail);
        return;
      }

      setOAuthInProgress(false);
      Alert.alert(
        "Google sign-up didn't complete",
        "We couldn't finish signing you up. Please try again.",
      );
    } catch (err) {
      setOAuthInProgress(false);
      const message = isClerkAPIResponseError(err)
        ? err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message
        : "Google sign-up didn't complete.";
      Alert.alert("Google sign-up failed", message ?? "Unknown error");
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
                  source={require("@/assets/images/logo-leaf-flame.png")}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
            </View>

            {pendingVerification ? (
              <>
                <View style={styles.heading}>
                  <Text style={styles.title}>Check your inbox</Text>
                  <Text style={styles.subtitle}>
                    We sent a verification code to{"\n"}
                    <Text style={styles.emailHighlight}>{email}</Text>
                  </Text>
                </View>

                <View style={styles.form}>
                  <AuthInput
                    label="Verification code"
                    icon="key-outline"
                    placeholder="6-digit code"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    error={errors.code}
                    maxLength={6}
                  />

                  <PrimaryButton
                    label="Verify & continue"
                    onPress={onVerify}
                    loading={verifying}
                    disabled={!isLoaded}
                  />

                  <TouchableOpacity
                    style={styles.changeEmail}
                    onPress={() => setPendingVerification(false)}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.changeEmailText}>
                      Wrong email? Go back
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.heading}>
                  <Text style={styles.title}>Create account</Text>
                  <Text style={styles.subtitle}>
                    Track calories, plan meals, and reach your goals with AI.
                  </Text>
                </View>

                <View style={styles.form}>
                  <View style={styles.nameRow}>
                    <View style={{ flex: 1 }}>
                      <AuthInput
                        label="First name"
                        icon="person-outline"
                        placeholder="Jane"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        textContentType="givenName"
                        error={errors.firstName}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AuthInput
                        label="Last name"
                        icon="person-outline"
                        placeholder="Doe"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        textContentType="familyName"
                        error={errors.lastName}
                      />
                    </View>
                  </View>

                  <AuthInput
                    label="Email"
                    icon="mail-outline"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    error={errors.email}
                  />

                  <AuthInput
                    label="Password"
                    icon="lock-closed-outline"
                    placeholder="At least 8 characters"
                    value={password}
                    onChangeText={setPassword}
                    isPassword
                    textContentType="newPassword"
                    error={errors.password}
                  />

                  <Text style={styles.terms}>
                    By creating an account you agree to our{" "}
                    <Text
                      style={styles.termsLink}
                      accessibilityRole="link"
                      testID="signup-terms-link"
                      onPress={() =>
                        Linking.openURL("https://your-domain.com/terms")
                      }
                    >
                      Terms
                    </Text>{" "}
                    and{" "}
                    <Text
                      style={styles.termsLink}
                      accessibilityRole="link"
                      testID="signup-privacy-link"
                      onPress={() =>
                        Linking.openURL("https://your-domain.com/privacy")
                      }
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>

                  <PrimaryButton
                    label="Create account"
                    onPress={onSubmit}
                    loading={submitting}
                    disabled={!isLoaded}
                  />

                  <View style={{ marginTop: Spacing.xl }}>
                    <Divider label="or sign up with" />
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
                  <Text style={styles.footerText}>Already have an account?</Text>
                  <Link href="/(auth)/sign-in" replace asChild>
                    <TouchableOpacity hitSlop={6}>
                      <Text style={styles.footerLink}>Sign in</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            )}
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
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logoImg: {
    width: 48,
    height: 48,
  },
  heading: {
    marginBottom: Spacing.xxl,
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
  emailHighlight: {
    fontWeight: "700",
    color: Colors.text,
  },
  form: {
    gap: Spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  terms: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  termsLink: {
    color: Colors.primaryDark,
    fontWeight: "600",
  },
  changeEmail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  changeEmailText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xxl,
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
