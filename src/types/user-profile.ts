export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type FitnessGoal = "gain" | "lose" | "maintain";

export type WorkoutFrequency = "2-3" | "3-4" | "5-6";

export type UserProfile = {
  gender: Gender;
  goal: FitnessGoal;
  workoutFrequency: WorkoutFrequency;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  weightKg: number;
  heightCm: number;
};

export type UserProfileDraft = Partial<UserProfile>;

export function isProfileComplete(
  profile: UserProfileDraft | null | undefined,
): boolean {
  if (!profile) return false;

  const year = profile.birthYear ?? 0;
  const currentYear = new Date().getFullYear();

  return (
    profile.gender != null &&
    profile.goal != null &&
    profile.workoutFrequency != null &&
    (profile.birthDay ?? 0) >= 1 &&
    (profile.birthDay ?? 0) <= 31 &&
    (profile.birthMonth ?? 0) >= 1 &&
    (profile.birthMonth ?? 0) <= 12 &&
    year >= 1900 &&
    year <= currentYear &&
    (profile.weightKg ?? 0) > 0 &&
    (profile.weightKg ?? 0) < 500 &&
    (profile.heightCm ?? 0) > 0 &&
    (profile.heightCm ?? 0) < 300
  );
}
