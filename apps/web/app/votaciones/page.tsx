import { API_BASE_URL } from '@/lib/config';
import { Votacion } from '@servel/contracts';
import Link from 'next/link';
import { Plus, Inbox } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getVotaciones(): Promise<Votacion[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/votaciones`, { cache: 'no-store' });
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

const statusStyles = {
  ACTIVA: { dot: 'bg-success animate-pulse-dot', text: 'text-success', border: 'border-success/30 bg-success/10' },
  PENDIENTE: { dot: 'bg-secondary', text: 'text-secondary', border: 'border-secondary/30 bg-secondary/10' },
  CERRADA: { dot: 'bg-destructive', text: 'text-destructive', border: 'border-destructive/30 bg-destructive/10' },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function VotacionesPage() {
  const votaciones = await getVotaciones();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Panel administrativo</p>
            <h1 className="mt-1 text-2xl font-bold uppercase tracking-tight text-foreground">Listado de Votaciones</h1>
          </div>
          <Link
            href="/votaciones/create"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Crear Nueva Votación
          </Link>
        </div>

        <div className="mt-8">
          {votaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border bg-card px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Sin votaciones registradas</h3>
              <p className="max-w-sm text-xs text-muted-foreground">
                Aún no se ha creado ningún proceso electoral. Comienza creando la primera votación.
              </p>
              <Link
                href="/votaciones/create"
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Crear Nueva Votación
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <div className="h-1 w-full bg-primary" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nombre</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Apertura</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cierre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votaciones.map((v) => {
                      const s = statusStyles[v.estado as keyof typeof statusStyles] ?? statusStyles.PENDIENTE
                      return (
                        <tr key={v.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40">
                          <td className="px-5 py-4 font-semibold text-foreground">{v.nombre}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.border} ${s.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {v.estado}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(v.fechaApertura)}</td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(v.fechaCierre)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}