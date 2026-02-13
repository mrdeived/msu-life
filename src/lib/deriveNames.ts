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
 * Priority: @username > First Last > First > email local-part > "Student"
 */
export function computeDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
  username?: string | null,
): string {
  if (username) return `@${username}`;
  const first = firstName?.trim();
  const last = lastName?.trim();
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  const localPart = email.split("@")[0];
  return localPart || "Student";
}

/**
 * Derive a username from an ndus.edu email local-part.
 * Lowercase, replace invalid chars with _, trim underscores, 3–20 chars.
 */
export function deriveUsernameFromEmail(email: string): string | null {
  const localPart = email.split("@")[0]?.toLowerCase() ?? "";
  const cleaned = localPart
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
  if (cleaned.length < 3) return null;
  return cleaned.slice(0, 20);
}

/**
 * Normalize a user-provided username.
 * Lowercase, allow only a-z 0-9 _, 3–20 chars. Returns null if invalid.
 */
export function normalizeUsername(input: string): string | null {
  const normalized = input.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (normalized.length < 3 || normalized.length > 20) return null;
  return normalized;
}
