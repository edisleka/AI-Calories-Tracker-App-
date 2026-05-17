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

const VALID_GENDERS = new Set<Gender>([
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);
const VALID_GOALS = new Set<FitnessGoal>(["gain", "lose", "maintain"]);
const VALID_FREQUENCIES = new Set<WorkoutFrequency>(["2-3", "3-4", "5-6"]);

export function isValidBirthDate(
  day: number | undefined,
  month: number | undefined,
  year: number | undefined,
): boolean {
  if (day == null || month == null || year == null) return false;
  if (month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isProfileComplete(
  profile: UserProfileDraft | null | undefined,
): boolean {
  if (!profile) return false;

  return (
    profile.gender != null &&
    VALID_GENDERS.has(profile.gender) &&
    profile.goal != null &&
    VALID_GOALS.has(profile.goal) &&
    profile.workoutFrequency != null &&
    VALID_FREQUENCIES.has(profile.workoutFrequency) &&
    isValidBirthDate(profile.birthDay, profile.birthMonth, profile.birthYear) &&
    (profile.weightKg ?? 0) > 0 &&
    (profile.weightKg ?? 0) < 500 &&
    (profile.heightCm ?? 0) > 0 &&
    (profile.heightCm ?? 0) < 300
  );
}
