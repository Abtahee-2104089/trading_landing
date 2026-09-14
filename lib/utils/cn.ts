/** Minimal classnames joiner — no dependency, handles false/undefined. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
