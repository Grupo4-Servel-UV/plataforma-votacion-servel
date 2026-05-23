'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileBarChart, Users, Upload, UserCog, ClipboardList } from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'
import { toElectionView } from '@/lib/adapters'
import type { Votacion } from '@servel/contracts'

type ElectionView = ReturnType<typeof toElectionView>

const statusConfig = {
  ACTIVA: {
    label: 'ACTIVA',
    dot: 'bg-success animate-pulse-dot',
    badge: 'border-success/30 bg-success/10 text-success',
  },
  PENDIENTE: {
    label: 'PENDIENTE',
    dot: 'bg-secondary',
    badge: 'border-secondary/30 bg-secondary/10 text-secondary',
  },
  CERRADA: {
    label: 'CERRADA',
    dot: 'bg-destructive',
    badge: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
} as const

function MonitorCard({ election }: { election: ElectionView }) {
  const s = statusConfig[election.status]
  const isClosed = election.status === 'CERRADA'
  const href = isClosed ? `/resultados/${election.id}` : `/admin/votaciones/${election.id}`

  return (
    <Link
      href={href}
      className="group block rounded-md border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
    >
      <div className="h-1 w-full bg-primary" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold uppercase leading-tight text-foreground line-clamp-2">
            {election.title} {election.year}
          </h3>
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>
            <span className="font-medium text-foreground">Cierre:</span>{' '}
            {new Date(election.closesAt).toLocaleDateString('es-CL', { dateStyle: 'medium' })}{' '}
            {new Date(election.closesAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p>
            <span className="font-medium text-foreground">ID:</span> {election.serialNumber}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-primary">
          {isClosed ? (
            <>
              <FileBarChart className="h-3.5 w-3.5" />
              Ver resultados
            </>
          ) : (
            <>
              Ver detalle
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 pb-2 border-b border-border flex items-baseline gap-2">
        <h2 className="text-base font-bold">{title}</h2>
        <span className="text-xs text-muted-foreground">{count} proceso(s)</span>
      </div>
      {count === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          No hay procesos en este estado.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {children}
        </div>
      )}
    </section>
  )
}

export default function AdminIndexPage() {
  const [elections, setElections] = useState<ElectionView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/votaciones`)
      .then((r) => r.json())
      .then((data) => {
        const list: Votacion[] = data.body ?? data ?? []
        setElections(list.map(toElectionView))
      })
      .catch(() => setError('No se pudo cargar la lista de votaciones.'))
      .finally(() => setLoading(false))
  }, [])

  const active = elections.filter((e) => e.status === 'ACTIVA')
  const pending = elections.filter((e) => e.status === 'PENDIENTE')
  const closed = elections.filter((e) => e.status === 'CERRADA')

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary font-bold">Administración</p>
          <h1 className="mt-1 text-2xl font-black">Panel de monitoreo electoral</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualiza y monitorea todos los procesos electorales activos, pendientes y cerrados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/votantes', icon: <Users className="h-4 w-4" />, label: 'Gestionar votantes' },
            { href: '/admin/padron', icon: <Upload className="h-4 w-4" />, label: 'Subir padrón' },
            { href: '/admin/candidatos', icon: <UserCog className="h-4 w-4" />, label: 'Gestionar candidatos' },
            { href: '/admin/logs', icon: <ClipboardList className="h-4 w-4" />, label: 'Ver registros de auditoría' },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted/60 transition-colors"
            >
              <span className="text-primary">{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {loading && (
          <div className="text-center py-10 text-sm text-muted-foreground">Cargando votaciones...</div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <Section title="Votaciones activas" count={active.length}>
              {active.map((e) => <MonitorCard key={e.id} election={e} />)}
            </Section>
            <Section title="Votaciones pendientes" count={pending.length}>
              {pending.map((e) => <MonitorCard key={e.id} election={e} />)}
            </Section>
            <Section title="Votaciones cerradas" count={closed.length}>
              {closed.map((e) => <MonitorCard key={e.id} election={e} />)}
            </Section>
          </>
        )}
      </main>
    </div>
  )
}
