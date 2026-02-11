import { createHash, randomInt } from "crypto";

const OTP_PEPPER = process.env.OTP_PEPPER ?? "";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(email: string, otp: string): string {
  return createHash("sha256")
    .update(`${email}:${otp}:${OTP_PEPPER}`)
    .digest("hex");
}
