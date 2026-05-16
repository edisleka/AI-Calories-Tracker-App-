/** Pseudonym for dev logs only — not a security control. */
export function anonymizeUserId(id: string): string {
  if (id.length <= 8) return "user_****";
  return `user_${id.slice(0, 4)}…${id.slice(-4)}`;
}
