'use client'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/config'
import { ElectionCard } from '@/components/elections/ElectionCard'
import { toElectionView } from '@/lib/adapters'
import type { Votacion } from '@servel/contracts'
import type { Election } from '@/lib/mockData'
import { ShieldCheck, Lock, FileCheck } from 'lucide-react'

export default function Home() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/votaciones`)
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        const votaciones: Votacion[] = data.body ?? data ?? []
        const mapped = votaciones.map(toElectionView)

        if (cancelled) return

        // Check participation for ACTIVA elections if RUT is stored in session
        const rut = typeof window !== 'undefined' ? sessionStorage.getItem('votante_rut') : null
        if (rut) {
          const active = mapped.filter((e) => e.status === 'ACTIVA')
          const checks = await Promise.allSettled(
            active.map((e) =>
              fetch(`${API_BASE_URL}/votaciones/${e.id}/eligibility?rut=${encodeURIComponent(rut)}`)
                .then((r) => r.json())
                .then((d) => ({ id: e.id, data: d }))
                .catch(() => ({ id: e.id, data: null }))
            )
          )
          const votedIds = new Set<string>()
          for (const result of checks) {
            if (result.status === 'fulfilled') {
              const { id, data } = result.value
              if (data && !data.eligible && Array.isArray(data.reasons) && data.reasons.includes('Ya ejerciste tu voto')) {
                votedIds.add(id)
              }
            }
          }
          if (cancelled) return
          setElections(mapped.map((e) => ({ ...e, alreadyVoted: votedIds.has(e.id) })))
        } else {
          setElections(mapped)
        }
      } catch {
        // silently fail — show empty
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const active = elections.filter((e) => e.status === 'ACTIVA')
  const pending = elections.filter((e) => e.status === 'PENDIENTE')
  const closed = elections.filter((e) => e.status === 'CERRADA')

  return (
    <>
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary font-bold">
            Procesos Electorales
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
            Votaciones disponibles
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Selecciona un proceso electoral para ejercer tu derecho a voto.
            Tu participación es secreta, anónima y verificable.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-3xl">
            {[
              { icon: <Lock className="h-4 w-4" />, label: 'Voto cifrado' },
              { icon: <ShieldCheck className="h-4 w-4" />, label: 'Anonimato garantizado' },
              { icon: <FileCheck className="h-4 w-4" />, label: 'Auditable' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                <span className="text-primary">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 space-y-10">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Cargando procesos electorales...</div>
        ) : (
          <>
            <Section title="Elecciones activas" subtitle={`${active.length} proceso(s) disponible(s)`}>
              {active.length === 0
                ? <Empty text="No hay procesos activos en este momento." />
                : <Grid>{active.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}</Grid>
              }
            </Section>

            {pending.length > 0 && (
              <Section title="Próximamente" subtitle="Procesos pendientes de inicio">
                <Grid>{pending.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}</Grid>
              </Section>
            )}

            {closed.length > 0 && (
              <Section title="Resultados oficiales" subtitle="Elecciones cerradas">
                <Grid>{closed.map((e, i) => <ElectionCard key={e.id} election={e} index={i} />)}</Grid>
              </Section>
            )}
          </>
        )}
      </main>
    </>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 pb-3 border-b border-border">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
