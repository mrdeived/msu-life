import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/),
});
