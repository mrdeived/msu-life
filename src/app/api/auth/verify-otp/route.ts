import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/validation";
import { hashOtp } from "@/lib/otp";
import { signSession, sessionCookieHeader } from "@/lib/session";
import { deriveNamesFromEmail } from "@/lib/deriveNames";

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN ?? "ndus.edu").toLowerCase();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, code } = parsed.data;
  const domain = email.split("@")[1];

  if (domain !== ALLOWED_DOMAIN) {
    return Response.json({ error: "Email domain not allowed" }, { status: 403 });
  }

  const demoBypassEnabled = process.env.OTP_DEMO_BYPASS === "true";

  if (demoBypassEnabled && code === "000000") {
    const derived = deriveNamesFromEmail(email);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, role: "STUDENT", isActive: true, isBanned: false, firstName: derived.firstName, lastName: derived.lastName },
      select: { id: true, email: true, role: true },
    });

    const cookieValue = signSession({ uid: user.id, email: user.email, role: user.role });

    return Response.json({ ok: true, user }, {
      headers: { "Set-Cookie": sessionCookieHeader(cookieValue) },
    });
  }

  const codeHash = hashOtp(email, code);

  const otpRecord = await prisma.emailOtp.findFirst({
    where: {
      email,
      codeHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return Response.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.emailOtp.updateMany({
      where: { id: otpRecord.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    if (updated.count === 0) {
      return null;
    }

    const names = deriveNamesFromEmail(email);
    return tx.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role: "STUDENT",
        isActive: true,
        isBanned: false,
        firstName: names.firstName,
        lastName: names.lastName,
      },
      select: { id: true, email: true, role: true },
    });
  });

  if (!user) {
    return Response.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  const cookieValue = signSession({ uid: user.id, email: user.email, role: user.role });

  return Response.json({ ok: true, user }, {
    headers: { "Set-Cookie": sessionCookieHeader(cookieValue) },
  });
}
