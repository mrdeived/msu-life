import { verifySession, COOKIE_NAME, type SessionPayload } from "@/lib/session";

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.split(";").find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  const value = match.split("=").slice(1).join("=").trim();
  if (!value) return null;

  return verifySession(value);
}
