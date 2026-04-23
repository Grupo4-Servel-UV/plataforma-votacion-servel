import { API_BASE_URL } from '@/lib/config';
import { Votacion } from '@servel/contracts';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getVotaciones(): Promise<Votacion[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/votaciones`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Error fetching votaciones:', res.status);
      return [];
    }

    const data = await res.json();
    return data.body || data || [];
  } catch (error) {
    console.error('Error de red al cargar votaciones:', error);
    return [];
  }
}

export default async function VotacionesPage() {
  const votaciones = await getVotaciones();

  return (
    <div className="mx-auto max-w-5xl p-6 text-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Listado de Votaciones</h1>
        <Link
          href="/votaciones/crear"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Crear Nueva Votación
        </Link>
      </div>

      {votaciones.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No hay votaciones registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Apertura</th>
                <th className="px-4 py-3 font-semibold">Cierre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {votaciones.map((votacion) => (
                <tr key={votacion.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{votacion.nombre}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        votacion.estado === 'PENDIENTE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : votacion.estado === 'ACTIVA'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {votacion.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(votacion.fechaApertura).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(votacion.fechaCierre).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
