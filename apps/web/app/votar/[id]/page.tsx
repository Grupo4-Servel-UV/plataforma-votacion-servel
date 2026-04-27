'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { ServelHeader, ServelFooter } from '@/components/layout/ServelHeader'
import { BallotCard } from '@/components/ballot/BallotCard'
import { VoteConfirmModal } from '@/components/ballot/VoteConfirmModal'
import { BallotFoldAnimation } from '@/components/ballot/BallotFoldAnimation'
import { ParticipationCode } from '@/components/ballot/ParticipationCode'
import { toElectionView } from '@/lib/adapters'
import { generateParticipationCode } from '@/lib/mockData'

type Phase = 'select' | 'confirm' | 'fold' | 'success'

export default function VotePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [election, setElection] = useState<ReturnType<typeof toElectionView> | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('select')
  const [code, setCode] = useState('')

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/votaciones/${id}`)
      .then((r) => r.json())
      .then((data) => setElection(toElectionView(data.body ?? data)))
      .catch(() => router.push('/'))
  }, [id, router])

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando papeleta...</p>
      </div>
    )
  }

  const candidate = election.candidates.find((c) => c.id === selected) ?? null
  const isBlank = selected === 'blanco'
  const selectedName = isBlank ? 'VOTO EN BLANCO' : candidate?.name ?? ''

  const onComplete = () => {
    setCode(generateParticipationCode())
    setPhase('success')
    setTimeout(() => {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#003F8A', '#0068B4', '#C8151B', '#FFFFFF'],
      })
    }, 250)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ServelHeader />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 pb-32">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
        >
          <ArrowLeft className="h-4 w-4" /> Salir sin votar
        </Link>
        <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Marca tu preferencia · Solo una elección permitida
        </p>
        <BallotCard election={election} selected={selected} onSelect={setSelected} />
      </main>

      <AnimatePresence>
        {selected && phase === 'select' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
          >
            <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tu selección
                </p>
                <p className={`text-sm font-bold uppercase tracking-wide truncate ${isBlank ? 'italic text-muted-foreground' : ''}`}>
                  {selectedName}
                </p>
              </div>
              <button
                onClick={() => setPhase('confirm')}
                className="shrink-0 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                EMITIR VOTO →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoteConfirmModal
        open={phase === 'confirm'}
        candidate={isBlank ? null : candidate}
        isBlank={isBlank}
        onCancel={() => setPhase('select')}
        onConfirm={() => setPhase('fold')}
      />

      {phase === 'fold' && <BallotFoldAnimation onComplete={onComplete} />}

      {phase === 'success' && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col">
          <ServelHeader />
          <div className="flex-1 flex items-center justify-center px-4 py-10">
            <div className="max-w-lg w-full text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-green-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-black">Tu voto ha sido emitido</h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {election.title} {election.year}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Tu voto es secreto y anónimo. Nadie puede asociar tu identidad con tu elección.
              </p>
              <div className="mt-8">
                <ParticipationCode code={code} />
              </div>
              <Link
                href="/"
                className="mt-8 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                VOLVER AL INICIO
              </Link>
              <p className="mt-10 text-[11px] text-muted-foreground">
                Servicio Electoral de Chile · servel.cl
              </p>
            </div>
          </div>
        </div>
      )}

      {phase !== 'success' && phase !== 'fold' && <ServelFooter />}
    </div>
  )
}