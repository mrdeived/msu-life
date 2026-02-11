import { createHmac } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "";
const SESSION_TTL = parseInt(process.env.SESSION_TTL_SECONDS ?? "2592000", 10);
const COOKIE_NAME = "msu_life_session";

export interface SessionPayload {
  uid: string;
  email: string;
  role: string;
  exp: number;
}

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, "base64url").toString();
}

function sign(data: string): string {
  return createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
}

export function signSession(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  };
  const encoded = base64urlEncode(JSON.stringify(full));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySession(cookieValue: string): SessionPayload | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expected = sign(encoded);
  if (signature !== expected) return null;

  try {
    const payload: SessionPayload = JSON.parse(base64urlDecode(encoded));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieHeader(value: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL}${secure}`;
}

export function clearSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export { COOKIE_NAME };
