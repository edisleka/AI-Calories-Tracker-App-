import { useEffect, useState } from "react";
import {
  consumeProfileCompleted,
  subscribeProfileStatus,
} from "@/lib/profile-status";
import { resolveUserProfile } from "@/lib/user-profile";

type ProfileStatus = {
  loading: boolean;
  isComplete: boolean;
  refresh: () => void;
};

export function useProfileStatus(uid: string | undefined): ProfileStatus {
  const [loading, setLoading] = useState(Boolean(uid));
  const [isComplete, setIsComplete] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setIsComplete(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    resolveUserProfile(uid)
      .then((profile) => {
        if (!cancelled) {
          setIsComplete(profile != null);
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
        if (uid && consumeProfileCompleted(uid)) {
          setIsComplete(true);
          setLoading(false);
          return;
        }
        setTick((n) => n + 1);
      }),
    [uid],
  );

  return {
    loading,
    isComplete,
    refresh: () => setTick((n) => n + 1),
  };
}
