import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/validation";
import { hashOtp } from "@/lib/otp";
import { signSession, sessionCookieHeader } from "@/lib/session";
import { deriveNamesFromEmail, deriveUsernameFromEmail } from "@/lib/deriveNames";

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN ?? "ndus.edu").toLowerCase();

/** Try derived username, then with numeric suffixes, then give up. */
async function findAvailableUsername(base: string | null): Promise<string | null> {
  if (!base) return null;
  const existing = await prisma.user.findUnique({ where: { username: base }, select: { id: true } });
  if (!existing) return base;
  for (let i = 2; i <= 9; i++) {
    const candidate = `${base.slice(0, 18)}_${i}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return null;
}

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
    const derivedUsername = await findAvailableUsername(deriveUsernameFromEmail(email));
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role: "STUDENT",
        isActive: true,
        isBanned: false,
        firstName: derived.firstName,
        lastName: derived.lastName,
        username: derivedUsername,
      },
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
    // Note: findAvailableUsername uses prisma (not tx) but that's fine for username derivation
    const derivedUsername = await findAvailableUsername(deriveUsernameFromEmail(email));
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
        username: derivedUsername,
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
