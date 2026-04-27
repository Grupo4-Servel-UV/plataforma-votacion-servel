'use client';

import { API_BASE_URL } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Candidato, CreateVotacionSchema } from '@servel/contracts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const CreateVotacionFormSchema = CreateVotacionSchema.extend({
  candidatosIds: z
    .array(z.uuid('ID de candidato inválido'))
    .min(1, 'Debe seleccionar al menos un candidato'),
});
type CreateVotacionFormInput = z.input<typeof CreateVotacionFormSchema>;

function localDateTimeToIso(value: string) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function CreateVotacionForm() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<CreateVotacionFormInput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateVotacionFormInput>({
    resolver: zodResolver(CreateVotacionFormSchema),
    defaultValues: {
      candidatosIds: [],
      restricciones: { comunidadIndigena: false },
    },
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidatos/disponibles`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCandidatos(data))
      .catch((err) => console.error('[CreateVotacionForm] Error cargando candidatos: ', err));
  }, []);

  const onSubmit = (data: CreateVotacionFormInput) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSaving(true);
    try {
      const { candidatosIds, ...votacionPayload } = pendingData;
      const createRes = await fetch(`${API_BASE_URL}/votaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(votacionPayload),
      });
      if (!createRes.ok) { setIsSaving(false); return; }
      const votacion = await createRes.json();
      await fetch(`${API_BASE_URL}/votaciones/${votacion.id}/candidatos`, {
        method: 'POST',
        body: JSON.stringify({ candidatosIds }),
        headers: { 'Content-Type': 'application/json' },
      });
      setPendingData(null);
      setShowConfirmModal(false);
      router.push('/votaciones');
      router.refresh();
    } catch (error) {
      console.error('[CreateVotacionForm] Excepción al crear votación:', error);
    } finally {
      setIsSaving(false);
      setShowConfirmModal(false);
    }
  };

  const onInvalid: SubmitErrorHandler<CreateVotacionFormInput> = (formErrors) => {
    console.error('[CreateVotacionForm] Errores de validación:', formErrors);
  };

  const formErrors = errors as Record<string, { message?: string }>;
  const errFechaApertura = errors.fechaApertura?.message || formErrors['fecha_apertura']?.message;
  const errFechaCierre = errors.fechaCierre?.message || formErrors['fecha_cierre']?.message;

  const inputClass = "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-sm";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">

        <Field label="Nombre de la Votación" error={errors.nombre?.message}>
          <input
            {...register('nombre')}
            className={inputClass}
            placeholder="Ej: Presidencial 2026"
          />
        </Field>

        <Field label="Fecha de Apertura" error={errFechaApertura as string}>
          <input
            type="datetime-local"
            {...register('fechaApertura', { setValueAs: localDateTimeToIso })}
            className={inputClass}
          />
        </Field>

        <Field label="Fecha de Cierre" error={errFechaCierre as string}>
          <input
            type="datetime-local"
            {...register('fechaCierre', { setValueAs: localDateTimeToIso })}
            className={inputClass}
          />
        </Field>

        {/* RESTRICCIONES */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Restricciones (Opcionales)
          </h3>
          <Field label="ID de Zona Restringida">
            <input
              type="number"
              {...register('restricciones.zonaId', {
                setValueAs: (v) => (v === '' ? undefined : parseInt(v, 10)),
              })}
              className={inputClass}
              placeholder="Ej: 10"
            />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('restricciones.comunidadIndigena')}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary/15"
            />
            <span className="text-sm text-foreground">Requisito de Comunidad Indígena</span>
          </label>
        </div>

        {/* CANDIDATOS */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Seleccionar Candidatos
          </label>
          {candidatos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
              No hay candidatos registrados disponibles.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-card divide-y divide-border">
              {candidatos.map((c) => (
                <label key={c.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input
                    type="checkbox"
                    value={c.id}
                    {...register('candidatosIds')}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/15"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {c.nombres} {c.apellidos}
                  </span>
                </label>
              ))}
            </div>
          )}
          {errors.candidatosIds && (
            <p className="text-xs text-destructive">{errors.candidatosIds.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          Crear Votación
        </button>
      </form>

      {/* MODAL DE CONFIRMACIÓN */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 25 }}
              className="relative w-full max-w-md rounded-md bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-primary text-primary-foreground px-6 py-4 flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70">
                    Confirmación
                  </p>
                  <h3 className="text-lg font-bold mt-0.5">¿Confirmar creación?</h3>
                </div>
                <button onClick={() => setShowConfirmModal(false)} className="rounded-full p-1 hover:bg-primary-foreground/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="border-2 border-primary/30 rounded-md bg-primary/5 px-5 py-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Votación</p>
                  <p className="mt-1 text-lg font-bold uppercase tracking-wide text-foreground">
                    {pendingData?.nombre}
                  </p>
                </div>
                <p className="mt-4 text-xs text-muted-foreground text-center">
                  Una vez creada, la votación quedará en estado pendiente.
                </p>
                <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSaving}
                    className="flex-1 rounded-md border border-primary bg-card px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSaving}
                    className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'CONFIRMAR'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}