import { useEffect, useState } from "react";
import {
  consumeProfileCompleted,
  subscribeProfileStatus,
} from "@/lib/profile-status";
import { getNutritionPlanFromDb } from "@/lib/nutrition-plan";
import { resolveUserProfile } from "@/lib/user-profile";
import type { NutritionPlan } from "@/types/nutrition-plan";
import type { UserProfile } from "@/types/user-profile";

type SetupStatus = {
  loading: boolean;
  profile: UserProfile | null;
  nutritionPlan: NutritionPlan | null;
  profileComplete: boolean;
  nutritionPlanComplete: boolean;
  setupComplete: boolean;
  refresh: () => void;
};

export function useSetupStatus(uid: string | undefined): SetupStatus {
  const [loading, setLoading] = useState(Boolean(uid));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setProfile(null);
      setNutritionPlan(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([resolveUserProfile(uid), getNutritionPlanFromDb(uid)])
      .then(([resolvedProfile, resolvedPlan]) => {
        if (!cancelled) {
          setProfile(resolvedProfile);
          setNutritionPlan(resolvedPlan);
        }
      })
      .catch((err) => {
        console.warn("[useSetupStatus] failed to load setup state:", err);
        if (!cancelled) {
          setProfile(null);
          setNutritionPlan(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid, tick]);

  useEffect(
    () =>
      subscribeProfileStatus(() => {
        if (uid) consumeProfileCompleted(uid);
        setTick((n) => n + 1);
      }),
    [uid],
  );

  const profileComplete = profile != null;
  const nutritionPlanComplete = nutritionPlan != null;
  const setupComplete = profileComplete && nutritionPlanComplete;

  return {
    loading,
    profile,
    nutritionPlan,
    profileComplete,
    nutritionPlanComplete,
    setupComplete,
    refresh: () => setTick((n) => n + 1),
  };
}
