'use client';

import { API_BASE_URL } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Candidato, CreateVotacionSchema } from '@servel/contracts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

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

export function CreateVotacionForm() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<CreateVotacionFormInput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateVotacionFormInput>({
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
      if (!createRes.ok) {
        const errorBody = await createRes.text();
        console.error('[CreateVotacionForm] Error API (crear votación):', createRes, errorBody);
        setIsSaving(false);
        return;
      }

      const votacion = await createRes.json();

      const asignarRes = await fetch(`${API_BASE_URL}/votaciones/${votacion.id}/candidatos`, {
        method: 'POST',
        body: JSON.stringify({ candidatosIds }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!asignarRes.ok) {
        const errorBody = await asignarRes.text();

        console.error(
          '[CreateVotacionForm] Votación creada, pero fallo la asociación de candidatos:',
          asignarRes.status,
          errorBody,
        );
        return;
      }

      console.log('[CreateVotacionForm] Votación y candidatos registrados correctamente');

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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5 text-slate-900">
        <div className="space-y-1">
          <label htmlFor="nombre" className="block text-sm font-medium text-slate-800">
            Nombre de la Votación
          </label>
          <input
            id="nombre"
            {...register('nombre')}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Ej: Presidencial 2026"
          />
          {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="fechaApertura" className="block text-sm font-medium text-slate-800">
            Fecha de Apertura
          </label>
          <input
            id="fechaApertura"
            type="datetime-local"
            {...register('fechaApertura', {
              setValueAs: localDateTimeToIso,
            })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errFechaApertura && <p className="text-sm text-red-600">{errFechaApertura as string}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="fechaCierre" className="block text-sm font-medium text-slate-800">
            Fecha de Cierre
          </label>
          <input
            id="fechaCierre"
            type="datetime-local"
            {...register('fechaCierre', {
              setValueAs: localDateTimeToIso,
            })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {errFechaCierre && <p className="text-sm text-red-600">{errFechaCierre as string}</p>}
        </div>

        {/* RESTRICCIONES */}
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Restricciones (Opcionales)</h3>

          <div className="space-y-1">
            <label htmlFor="zonaId" className="block text-sm font-medium text-slate-700">
              ID de Zona Restringida
            </label>
            <input
              id="zonaId"
              type="number"
              {...register('restricciones.zonaId', {
                setValueAs: (v) => (v === '' ? undefined : parseInt(v, 10)),
              })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Ej: 10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="comunidadIndigena"
              type="checkbox"
              {...register('restricciones.comunidadIndigena')}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="comunidadIndigena" className="text-sm font-medium text-slate-700">
              Requisito de Comunidad Indígena
            </label>
          </div>
        </div>

        {/* SELECCIÓN DE CANDIDATOS */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-800">Seleccionar Candidatos</label>
          {candidatos.length === 0 ? (
            <p className="text-sm text-slate-500">No hay candidatos registrados disponibles.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-300 bg-white p-3">
              {candidatos.map((c) => (
                <div key={c.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={`candidato-${c.id}`}
                    value={c.id}
                    {...register('candidatosIds')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`candidato-${c.id}`} className="text-sm text-slate-700">
                    {c.nombres} {c.apellidos}
                  </label>
                </div>
              ))}
            </div>
          )}
          {errors.candidatosIds && (
            <p className="text-sm text-red-600">{errors.candidatosIds.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Crear Votación
        </button>
      </form>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Confirmar Creación</h2>
            <p className="mb-6 text-slate-700">
              ¿Está seguro que desea crear la votación &quot;{pendingData?.nombre}&quot; con la
              configuración proporcionada?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
