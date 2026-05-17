const listeners = new Set<() => void>();

let profileJustCompletedUid: string | null = null;

export function subscribeProfileStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyProfileStatusChanged(): void {
  listeners.forEach((listener) => listener());
}

/** Call after a successful onboarding save so the app layout stops redirecting back. */
export function markProfileCompleted(uid: string): void {
  profileJustCompletedUid = uid;
  notifyProfileStatusChanged();
}

export function consumeProfileCompleted(uid: string): boolean {
  if (profileJustCompletedUid !== uid) return false;
  profileJustCompletedUid = null;
  return true;
}
