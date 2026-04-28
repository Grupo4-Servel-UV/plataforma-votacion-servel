import type { Votacion } from '@servel/contracts'

export function toElectionView(v: Votacion) {
  return {
    id: v.id,
    title: v.nombre.toUpperCase(),
    year: new Date(v.fechaApertura).getFullYear(),
    type: 'PRIMERA VUELTA' as const,
    status: v.estado as 'ACTIVA' | 'PENDIENTE' | 'CERRADA',
    closesAt: v.fechaCierre,
    serialNumber: v.id.slice(0, 8).toUpperCase(),
    zone: v.zonaRestriccionId ? `Zona ${v.zonaRestriccionId}` : undefined,
    alreadyVoted: false,
    candidates: (v.candidatos ?? []).map((c, i) => ({
      id: c.id,
      number: i + 1,
      name: `${c.nombres} ${c.apellidos}`.toUpperCase(),
    })),
  }
}