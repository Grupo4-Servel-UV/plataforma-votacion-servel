'use client';

import { API_BASE_URL } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Candidato, 
  CreateVotacionSchema, 
  DIVISION_TERRITORIAL, 
  COMUNIDADES_INDIGENAS 
} from '@servel/contracts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ShieldAlert } from 'lucide-react';

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
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

export function CreateVotacionForm() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<CreateVotacionFormInput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // States para controlar la visibilidad de los requisitos
  const [hasRegionReq, setHasRegionReq] = useState(false);
  const [hasComunaReq, setHasComunaReq] = useState(false);
  const [hasIndigenaReq, setHasIndigenaReq] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateVotacionFormInput>({
    resolver: zodResolver(CreateVotacionFormSchema),
    defaultValues: {
      candidatosIds: [],
      restricciones: {
        region: '',
        comuna: '',
        comunidadesIndigenas: [],
      },
    },
  });

  const selectedRegion = watch('restricciones.region');
  const comunidadesSeleccionadas = watch('restricciones.comunidadesIndigenas') || [];

  // Reset de valores cuando se desmarcan los requisitos
  useEffect(() => {
    if (!hasRegionReq) {
      setValue('restricciones.region', '');
      setValue('restricciones.comuna', '');
      setHasComunaReq(false);
    }
  }, [hasRegionReq, setValue]);

  useEffect(() => {
    if (!hasComunaReq) {
      setValue('restricciones.comuna', '');
    }
  }, [hasComunaReq, setValue]);

  useEffect(() => {
    if (!hasIndigenaReq) {
      setValue('restricciones.comunidadesIndigenas', []);
    } else if (comunidadesSeleccionadas.length === 0) {
      setValue('restricciones.comunidadesIndigenas', ['']);
    }
  }, [hasIndigenaReq, setValue, comunidadesSeleccionadas.length]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidatos/disponibles`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCandidatos(data))
      .catch((err) => console.error('[CreateVotacionForm] Error cargando candidatos: ', err));
  }, []);

  const onSubmit = (data: CreateVotacionFormInput) => {
    const finalData = JSON.parse(JSON.stringify(data)); // Clonado profundo simple
    if (!hasRegionReq) delete finalData.restricciones.region;
    if (!hasComunaReq) delete finalData.restricciones.comuna;
    if (!hasIndigenaReq) delete finalData.restricciones.comunidadesIndigenas;

    setPendingData(finalData);
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

  const inputClass = "w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-sm disabled:opacity-50 disabled:bg-muted";
  const checkboxClass = "h-4 w-4 rounded border-input text-primary focus:ring-primary/15 cursor-pointer";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        
        <div className="space-y-4">
          <Field label="Nombre de la Votación" error={errors.nombre?.message}>
            <input {...register('nombre')} className={inputClass} placeholder="Ej: Presidencial 2026" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fecha de Apertura" error={errors.fechaApertura?.message}>
              <input type="datetime-local" {...register('fechaApertura', { setValueAs: localDateTimeToIso })} className={inputClass} />
            </Field>
            <Field label="Fecha de Cierre" error={errors.fechaCierre?.message}>
              <input type="datetime-local" {...register('fechaCierre', { setValueAs: localDateTimeToIso })} className={inputClass} />
            </Field>
          </div>
        </div>

        {/* SECCIÓN DE RESTRICCIONES */}
        <div className="rounded-xl border border-border bg-muted/10 p-5 space-y-5">
          <div className="flex items-center gap-2 text-primary">
            <ShieldAlert className="h-4 w-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">Restricciones (Opcionales)</h3>
          </div>

          <div className="space-y-6">
            {/* REGIÓN */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={hasRegionReq} 
                  onChange={(e) => setHasRegionReq(e.target.checked)} 
                  className={checkboxClass} 
                />
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Requisito de Región</span>
              </label>

              {hasRegionReq && (
                <div className="space-y-4 pl-7 animate-in fade-in slide-in-from-left-2 duration-200">
                  <select {...register('restricciones.region')} className={inputClass}>
                    <option value="">Seleccione una región...</option>
                    {Object.keys(DIVISION_TERRITORIAL || {}).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={hasComunaReq} 
                        onChange={(e) => setHasComunaReq(e.target.checked)} 
                        className={checkboxClass} 
                      />
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Requisito de Comuna</span>
                    </label>

                    {hasComunaReq && (
                      <div className="pl-7 animate-in fade-in slide-in-from-left-2 duration-200">
                        <select 
                          {...register('restricciones.comuna')} 
                          disabled={!selectedRegion} 
                          className={inputClass}
                        >
                          <option value="">{!selectedRegion ? 'Primero seleccione región...' : 'Seleccione una comuna...'}</option>
                          {selectedRegion && (DIVISION_TERRITORIAL?.[selectedRegion] || []).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-border/50" />

            {/* COMUNIDAD INDÍGENA */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={hasIndigenaReq} 
                  onChange={(e) => setHasIndigenaReq(e.target.checked)} 
                  className={checkboxClass} 
                />
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Requisito de Comunidad Indígena</span>
              </label>

              {hasIndigenaReq && (
                <div className="space-y-3 pl-7 animate-in fade-in slide-in-from-left-2 duration-200">
                  {comunidadesSeleccionadas.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <select 
                        value={comunidadesSeleccionadas[index]}
                        onChange={(e) => {
                          const newComs = [...comunidadesSeleccionadas];
                          newComs[index] = e.target.value;
                          setValue('restricciones.comunidadesIndigenas', newComs);
                        }}
                        className={inputClass}
                      >
                        <option value="">Seleccione comunidad...</option>
                        {comunidadesSeleccionadas.length === 1 && <option value="Cualquiera">Cualquiera</option>}
                        {(COMUNIDADES_INDIGENAS || []).map(c => (
                          <option 
                            key={c} 
                            value={c} 
                            disabled={comunidadesSeleccionadas.includes(c) && comunidadesSeleccionadas[index] !== c}
                          >
                            {c}
                          </option>
                        ))}
                      </select>
                      {index > 0 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newComs = comunidadesSeleccionadas.filter((__, i) => i !== index);
                            setValue('restricciones.comunidadesIndigenas', newComs);
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {!comunidadesSeleccionadas.includes('Cualquiera') && comunidadesSeleccionadas.length < (COMUNIDADES_INDIGENAS || []).length && (
                    <button 
                      type="button"
                      onClick={() => setValue('restricciones.comunidadesIndigenas', [...comunidadesSeleccionadas, ''])}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-md transition-colors w-fit"
                    >
                      <Plus className="h-3 w-3" /> AÑADIR COMUNIDAD
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">
            Seleccionar Candidatos
          </label>
          {candidatos.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-muted/5">
              No hay candidatos disponibles.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 pr-2 custom-scrollbar">
              {candidatos.map((c) => (
                <label key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                  <input type="checkbox" value={c.id} {...register('candidatosIds')} className={checkboxClass} />
                  <span className="text-sm font-semibold">{c.nombres} {c.apellidos}</span>
                </label>
              ))}
            </div>
          )}
          {errors.candidatosIds && <p className="text-xs text-destructive font-medium">{errors.candidatosIds.message as string}</p>}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl bg-primary px-6 py-4 text-sm font-black text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
        >
          {isSaving ? 'PROCESANDO...' : 'CREAR VOTACIÓN'}
        </button>
      </form>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black tracking-tight text-foreground">¿Confirmar Creación?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Se creará la votación <span className="font-bold text-foreground">"{pendingData?.nombre}"</span>.
              </p>
              
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-muted transition-colors">CANCELAR</button>
                <button onClick={handleConfirm} disabled={isSaving} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  {isSaving ? 'GUARDANDO...' : 'CONFIRMAR'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}