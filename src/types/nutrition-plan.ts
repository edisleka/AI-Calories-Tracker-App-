export type NutritionPlan = {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
  stepsGoal: number;
  activeMinutesGoal: number;
  sleepHoursGoal: number;
  bmr: number;
  tdee: number;
  weeklyWeightChangeKg: number;
  sodiumMaxMg: number;
  sugarMaxG: number;
  summary: string;
};

export function isNutritionPlanComplete(
  plan: Partial<NutritionPlan> | null | undefined,
): plan is NutritionPlan {
  if (!plan) return false;

  const positiveKeys: (keyof NutritionPlan)[] = [
    "dailyCalories",
    "proteinG",
    "carbsG",
    "fatG",
    "fiberG",
    "waterMl",
    "stepsGoal",
    "activeMinutesGoal",
    "sleepHoursGoal",
    "bmr",
    "tdee",
    "sodiumMaxMg",
    "sugarMaxG",
  ];

  for (const key of positiveKeys) {
    const v = plan[key];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return false;
  }

  if (
    typeof plan.weeklyWeightChangeKg !== "number" ||
    !Number.isFinite(plan.weeklyWeightChangeKg) ||
    plan.weeklyWeightChangeKg < -2 ||
    plan.weeklyWeightChangeKg > 2
  ) {
    return false;
  }

  return typeof plan.summary === "string" && plan.summary.trim().length > 0;
}
