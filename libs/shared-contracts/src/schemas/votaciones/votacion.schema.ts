import { z } from 'zod';
import { EstadoVotacion } from '../../types';
import { CandidatoSchema } from '../candidatos/candidato.schema';

export const VotacionSchema = z.object({
  id: z.uuid(),
  nombre: z.string(),
  fechaApertura: z.iso.datetime(),
  fechaCierre: z.iso.datetime(),
  estado: z.enum(EstadoVotacion),
  zonaRestriccionId: z.number().nullable(),
  comunidadIndigenaReq: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),

  candidatos: z.array(CandidatoSchema).optional(),
});

export type Votacion = z.infer<typeof VotacionSchema>;
