import { z } from 'zod';
import { EstadoCandidato } from '../../types';

export const CandidatoSchema = z.object({
  id: z.uuid(),
  votacionId: z.uuid().nullable(),
  nombres: z.string(),
  apellidos: z.string(),
  rut: z.string(),
  partidoPolitico: z.string().nullable(),
  lista: z.string().nullable(),
  descripcion: z.string().nullable(),
  estado: z.enum(EstadoCandidato),
  creadoEn: z.iso.datetime(),
  actualizadoEn: z.iso.datetime(),
});

export type Candidato = z.infer<typeof CandidatoSchema>;
