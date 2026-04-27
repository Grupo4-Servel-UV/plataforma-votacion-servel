'use client'
import Link from 'next/link'
import { Check, MapPin, ArrowRight } from "lucide-react"
import { CountdownTimer } from "./CountdownTimer"
import type { Election } from "@/lib/mockData"
import { motion } from "framer-motion"

const statusStyles = {
  ACTIVA: { dot: "bg-success animate-pulse-dot", text: "text-success", border: "border-success/30 bg-success/10" },
  PENDIENTE: { dot: "bg-secondary", text: "text-secondary", border: "border-secondary/30 bg-secondary/10" },
  CERRADA: { dot: "bg-destructive", text: "text-destructive", border: "border-destructive/30 bg-destructive/10" },
} as const

export function ElectionCard({ election, index }: { election: Election; index: number }) {
  const { status, alreadyVoted } = election
  const disabled = alreadyVoted || status === "PENDIENTE"
  const s = statusStyles[status]
  const href = status === "CERRADA" ? `/resultados/${election.id}` : `/votar/${election.id}`

  const inner = (
    <>
      <div className="h-1 w-full bg-primary" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-block rounded-sm bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              {election.type}
            </span>
            <h3 className="mt-2 text-base font-bold uppercase leading-tight text-foreground">
              {election.title} {election.year}
            </h3>
            {election.zone && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {election.zone}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.border} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {status}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            {status === "ACTIVA" && (
              <>
                <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Cierra en</p>
                <CountdownTimer target={election.closesAt} />
              </>
            )}
            {status === "PENDIENTE" && (
              <p className="text-xs text-muted-foreground">
                Inicia el <span className="font-semibold text-foreground">{new Date(election.closesAt).toLocaleDateString("es-CL")}</span>
              </p>
            )}
            {status === "CERRADA" && (
              <p className="text-xs text-muted-foreground">
                Cerrada el <span className="font-semibold text-foreground">{new Date(election.closesAt).toLocaleDateString("es-CL")}</span>
              </p>
            )}
          </div>

          {alreadyVoted ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-success/10 text-success px-2.5 py-1.5 text-xs font-bold">
              <Check className="h-3.5 w-3.5" />
              Ya participaste
            </span>
          ) : !disabled ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-transform group-hover:translate-x-0.5">
              {status === "CERRADA" ? "Ver resultados" : "Votar"}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
      </div>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      {disabled ? (
        <div className="group relative block rounded-md border border-border bg-card overflow-hidden opacity-60 cursor-not-allowed">
          {inner}
        </div>
      ) : (
        <Link href={href} className="group relative block rounded-md border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5">
          {inner}
        </Link>
      )}
    </motion.div>
  )
}