/** Canonical Expo Router paths used across auth navigation. */
export const ROUTES = {
  home: "/(app)/(tabs)" as const,
  onboarding: "/(app)/onboarding" as const,
  generatePlan: "/(app)/generate-plan" as const,
  analytics: "/(app)/(tabs)/analytics" as const,
  profile: "/(app)/(tabs)/profile" as const,
  signIn: "/(auth)/sign-in" as const,
  signUp: "/(auth)/sign-up" as const,
};
