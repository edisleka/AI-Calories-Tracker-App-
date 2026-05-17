import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { NutritionPlan } from "@/types/nutrition-plan";
import { isNutritionPlanComplete } from "@/types/nutrition-plan";
import { getDb } from "./firebase";

function parseNutritionPlan(data: unknown): NutritionPlan | null {
  if (!data || typeof data !== "object") return null;
  return isNutritionPlanComplete(data as Partial<NutritionPlan>)
    ? (data as NutritionPlan)
    : null;
}

export async function getNutritionPlanFromDb(
  uid: string,
): Promise<NutritionPlan | null> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) return null;

  try {
    const snapshot = await getDoc(doc(getDb(), "users", uid));
    if (!snapshot.exists()) return null;
    return parseNutritionPlan(snapshot.data().nutritionPlan);
  } catch (e) {
    console.warn("[firestore] getNutritionPlanFromDb failed:", e);
    return null;
  }
}

export async function saveNutritionPlanToDb(
  uid: string,
  plan: NutritionPlan,
): Promise<void> {
  if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error("Firebase is not configured.");
  }

  await setDoc(
    doc(getDb(), "users", uid),
    {
      nutritionPlan: plan,
      nutritionPlanGeneratedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
