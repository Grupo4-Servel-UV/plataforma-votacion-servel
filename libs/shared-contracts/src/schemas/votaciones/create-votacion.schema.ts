import { z } from 'zod';
import { REGLAS_NEGOCIO } from '../../constants/reglas-negocio';

export const CreateVotacionSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
    fechaApertura: z.iso.datetime({ message: 'Formato de fecha de apertura inválido' }),
    fechaCierre: z.iso.datetime({ message: 'Formato de fecha de cierre inválido' }),
    restricciones: z
      .object({
        region: z.string().optional(),
        comuna: z.string().optional(),
        comunidadesIndigenas: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const apertura = new Date(data.fechaApertura);
    const cierre = new Date(data.fechaCierre);
    const hoy = new Date();

    const minAnticipacionMs = REGLAS_NEGOCIO.MIN_DIAS_ANTICIPACION * REGLAS_NEGOCIO.MS_POR_DIA;
    if (apertura.getTime() - hoy.getTime() < minAnticipacionMs) {
      ctx.addIssue({
        code: 'custom',
        message: `La fecha de apertura debe tener al menos ${REGLAS_NEGOCIO.MIN_DIAS_ANTICIPACION} días de anticipación`,
        path: ['fecha_apertura'],
      });
    }

    if (cierre <= apertura) {
      ctx.addIssue({
        code: 'custom',
        message: 'La fecha de cierre debe se mayor que la fecha de apertura',
        path: ['fecha_cierre'],
      });
    }
  });

export type CreateVotacionInput = z.input<typeof CreateVotacionSchema>;

export const AsignarCandidatosSchema = z.object({
  candidatosIds: z
    .array(z.uuid({ error: 'ID de candidato inválido' }))
    .min(1, 'Debe seleccionar al menos un candidato'),
});

export type AsignarCandidatosInput = z.input<typeof AsignarCandidatosSchema>;

export const UpdateVotacionSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').optional(),
    fechaApertura: z.iso.datetime({ message: 'Formato de fecha de apertura inválido' }).optional(),
    fechaCierre: z.iso.datetime({ message: 'Formato de fecha de cierre inválido' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fechaApertura) {
      const apertura = new Date(data.fechaApertura);
      const hoy = new Date();
      const minAnticipacionMs = REGLAS_NEGOCIO.MIN_DIAS_ANTICIPACION * REGLAS_NEGOCIO.MS_POR_DIA;
      if (apertura.getTime() - hoy.getTime() < minAnticipacionMs) {
        ctx.addIssue({
          code: 'custom',
          message: `La fecha de apertura debe tener al menos ${REGLAS_NEGOCIO.MIN_DIAS_ANTICIPACION} días de anticipación`,
          path: ['fechaApertura'],
        });
      }
    }
    if (data.fechaApertura && data.fechaCierre) {
      if (new Date(data.fechaCierre) <= new Date(data.fechaApertura)) {
        ctx.addIssue({
          code: 'custom',
          message: 'La fecha de cierre debe ser mayor que la fecha de apertura',
          path: ['fechaCierre'],
        });
      }
    }
  });

export type UpdateVotacionInput = z.input<typeof UpdateVotacionSchema>;
