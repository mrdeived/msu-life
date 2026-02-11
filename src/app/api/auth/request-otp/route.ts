import { prisma } from "@/lib/prisma";
import { requestOtpSchema } from "@/lib/validation";
import { generateOtp, hashOtp } from "@/lib/otp";

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN ?? "ndus.edu").toLowerCase();
const OTP_TTL = parseInt(process.env.OTP_TTL_SECONDS ?? "600", 10);
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const domain = email.split("@")[1];

  if (domain !== ALLOWED_DOMAIN) {
    return Response.json({ error: "Email domain not allowed" }, { status: 403 });
  }

  // Rate limit: max 5 OTPs per email in last 10 minutes
  const recentCount = await prisma.emailOtp.count({
    where: {
      email,
      createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
    },
  });

  if (recentCount >= RATE_LIMIT_MAX) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const otp = generateOtp();
  const codeHash = hashOtp(email, otp);
  const expiresAt = new Date(Date.now() + OTP_TTL * 1000);

  await prisma.emailOtp.create({
    data: { email, codeHash, expiresAt },
  });

  const isNonProd = process.env.NODE_ENV !== "production";

  if (isNonProd) {
    console.log(`OTP for ${email}: ${otp}`);
  }

  const debugEnabled = isNonProd || process.env.OTP_DEBUG_RETURN_CODE === "true";

  if (debugEnabled) {
    return Response.json({ ok: true, debug: { code: otp, expiresInSeconds: OTP_TTL } });
  }

  return Response.json({ ok: true });
}
