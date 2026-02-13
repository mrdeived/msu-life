/**
 * Derive firstName / lastName from an ndus.edu email local-part.
 * Rules:
 *   - Split local-part by `.`, `_`, `-`
 *   - Strip trailing digits from each token
 *   - If ≥2 tokens → first = token[0], last = token[1]
 *   - If 1 token  → first = token[0], last = null
 *   - Title-case each part
 *   - If nothing remains after stripping → both null
 */
export function deriveNamesFromEmail(email: string): {
  firstName: string | null;
  lastName: string | null;
} {
  const localPart = email.split("@")[0];
  const tokens = localPart
    .split(/[._-]/)
    .map((t) => t.replace(/\d+/g, "").trim())
    .filter(Boolean);

  if (tokens.length === 0) return { firstName: null, lastName: null };

  const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return {
    firstName: titleCase(tokens[0]),
    lastName: tokens.length >= 2 ? titleCase(tokens[1]) : null,
  };
}

/**
 * Compute a display name from user fields, with email fallback.
 */
export function computeDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const first = firstName?.trim();
  const last = lastName?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  const localPart = email.split("@")[0];
  return localPart || "Student";
}
