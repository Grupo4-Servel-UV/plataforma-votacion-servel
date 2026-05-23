import type { Votacion } from '@servel/contracts'

export function toResultsView(r: {
  id: string
  nombre: string
  estado: string
  fechaApertura: string
  fechaCierre: string
  totalVotos: number
  votosBlancos: number
  candidatos: { id: string; nombres: string; apellidos: string; votos: number }[]
}) {
  return {
    id: r.id,
    title: r.nombre.toUpperCase(),
    year: new Date(r.fechaApertura).getFullYear(),
    type: 'PRIMERA VUELTA' as const,
    status: r.estado as 'ACTIVA' | 'PENDIENTE' | 'CERRADA',
    closesAt: r.fechaCierre,
    serialNumber: r.id.slice(0, 8).toUpperCase(),
    totalVotos: r.totalVotos,
    blankVotes: r.votosBlancos,
    candidates: r.candidatos.map((c, i) => ({
      id: c.id,
      number: i + 1,
      name: `${c.nombres} ${c.apellidos}`.toUpperCase(),
      votes: c.votos,
    })),
  }
}

export function toElectionView(v: Votacion) {
  return {
    id: v.id,
    title: v.nombre.toUpperCase(),
    year: new Date(v.fechaApertura).getFullYear(),
    type: 'PRIMERA VUELTA' as const,
    status: v.estado as 'ACTIVA' | 'PENDIENTE' | 'CERRADA',
    closesAt: v.fechaCierre,
    serialNumber: v.id.slice(0, 8).toUpperCase(),
    zone: (v as any).zonaRestriccionId ? `Zona ${(v as any).zonaRestriccionId}` : undefined,
    alreadyVoted: false,
    candidates: (v.candidatos ?? []).map((c, i) => ({
      id: c.id,
      number: i + 1,
      name: `${c.nombres} ${c.apellidos}`.toUpperCase(),
    })),
  }
}