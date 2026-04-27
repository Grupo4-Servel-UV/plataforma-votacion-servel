'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileBarChart } from 'lucide-react'
import Link from 'next/link'
import { ServelHeader, ServelFooter } from '@/components/layout/ServelHeader'
import { ResultsChart } from '@/components/elections/ResultsChart'
import { API_BASE_URL } from '@/lib/config'
import { toElectionView } from '@/lib/adapters'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [election, setElection] = useState<ReturnType<typeof toElectionView> | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/votaciones/${id}`)
      .then((r) => r.json())
      .then((data) => setElection(toElectionView(data.body ?? data)))
      .catch(() => router.push('/'))
  }, [id, router])

  if (!election) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Cargando resultados...</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <ServelHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {election.type} · {election.year}
            </p>
            <h1 className="mt-1 text-3xl font-black text-foreground">{election.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cierre oficial: {new Date(election.closesAt).toLocaleDateString('es-CL', { dateStyle: 'long' })}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            <FileBarChart className="h-3.5 w-3.5" />
            CERRADA
          </span>
        </div>

        <ResultsChart election={election} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Resultados oficiales certificados por el Servicio Electoral de Chile.
        </p>
      </main>
      <ServelFooter />
    </div>
  )
}