import { z } from 'zod';

export const RegisterSchema = z.object({
  nombres: z.string().min(1).max(255),
  apellidos: z.string().min(1).max(255),
  rut: z.string().min(4).max(12),
  fechaNacimiento: z.string().length(8).optional(),
  comunidadIndigena: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  comuna: z.string().optional().nullable(),
  email: z.string().email().max(255),
  etnia: z.enum([
    'Aimara', 'Atacameño', 'Quechua', 'Diaguita', 'Colla', 'Chango', 'Mapuche', 'Rapa Nui', 'Kawésqar', 'Yagán', "Selk'nam", 'Ninguna',
  ]).optional().nullable(),
  clave: z.string().min(6).max(255),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
