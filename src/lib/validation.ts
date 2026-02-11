import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
});
