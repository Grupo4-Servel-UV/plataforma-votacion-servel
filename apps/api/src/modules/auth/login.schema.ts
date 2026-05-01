import { z } from 'zod';

export const LoginSchema = z.object({
  rut: z.string().min(4).max(12),
  clave: z.string().min(1).max(255),
});

export type LoginInput = z.infer<typeof LoginSchema>;
