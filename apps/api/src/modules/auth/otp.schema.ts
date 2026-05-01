import { z } from 'zod';

export const SendOtpSchema = z.object({
  rut: z.string().min(5),
});
export type SendOtpInput = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  rut: z.string().min(5),
  otp: z.string().length(6),
});
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
