import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendOtpEmail({
  to,
  code,
  ttlSeconds,
}: {
  to: string;
  code: string;
  ttlSeconds: number;
}) {
  const minutes = Math.floor(ttlSeconds / 60);
  const from = process.env.RESEND_FROM ?? "MSU Life <onboarding@resend.dev>";

  await getResend().emails.send({
    from,
    to,
    subject: "Your MSU Life login code",
    html: `<p>Your login code is: <strong>${code}</strong></p><p>This code expires in ${minutes} minute${minutes !== 1 ? "s" : ""}.</p>`,
  });
}
