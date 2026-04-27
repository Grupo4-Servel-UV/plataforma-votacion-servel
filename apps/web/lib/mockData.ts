export type ElectionStatus = "ACTIVA" | "PENDIENTE" | "CERRADA";
export type ElectionType = "PRIMERA VUELTA" | "SEGUNDA VUELTA" | "PLEBISCITO" | "MUNICIPAL";

export interface Candidate {
  id: string;
  number: number;
  name: string;
  votes?: number;
}

export interface Election {
  id: string;
  title: string;
  year: number;
  type: ElectionType;
  status: ElectionStatus;
  closesAt: string; // ISO
  serialNumber: string;
  zone?: string;
  alreadyVoted?: boolean;
  candidates: Candidate[];
  blankVotes?: number;
  totalEligible?: number;
}

// Use FIXED ISO dates (not relative to now) to avoid SSR hydration mismatches.
export const elections: Election[] = [
  {
    id: "presidencial-2025",
    title: "ELECCIÓN PRESIDENCIAL",
    year: 2025,
    type: "PRIMERA VUELTA",
    status: "ACTIVA",
    closesAt: "2026-04-26T18:00:00",
    serialNumber: "00847291",
    candidates: [
      { id: "c1", number: 1, name: "CAROLINA FUENTES HERRERA" },
      { id: "c2", number: 2, name: "RODRIGO MENDOZA VALLEJOS" },
      { id: "c3", number: 3, name: "VALENTINA SOTO ARAYA" },
      { id: "c4", number: 4, name: "ALEJANDRO BRAVO CISTERNAS" },
      { id: "c5", number: 5, name: "PATRICIA LAGOS MUÑOZ" },
      { id: "c6", number: 6, name: "CRISTÓBAL VEGA RÍOS" },
      { id: "c7", number: 7, name: "ANDREA MORALES PINTO" },
      { id: "c8", number: 8, name: "SERGIO CONTRERAS IBÁÑEZ" },
    ],
  },
  {
    id: "alcalde-providencia-2025",
    title: "ELECCIÓN DE ALCALDE",
    year: 2025,
    type: "MUNICIPAL",
    status: "ACTIVA",
    closesAt: "2026-04-30T18:00:00",
    serialNumber: "00004521",
    zone: "Solo Comuna de Providencia",
    alreadyVoted: true,
    candidates: [
      { id: "a1", number: 1, name: "JAIME BELLOLIO AVARIA" },
      { id: "a2", number: 2, name: "ISABEL ALLENDE BUSSI" },
      { id: "a3", number: 3, name: "TOMÁS VODANOVIC LAGOS" },
    ],
  },
  {
    id: "presidencial-2025-2v",
    title: "ELECCIÓN PRESIDENCIAL",
    year: 2025,
    type: "SEGUNDA VUELTA",
    status: "PENDIENTE",
    closesAt: "2026-05-15T18:00:00",
    serialNumber: "00900200",
    candidates: [
      { id: "s1", number: 1, name: "CANDIDATO/A POR DEFINIR" },
      { id: "s2", number: 2, name: "CANDIDATO/A POR DEFINIR" },
    ],
  },
  {
    id: "plebiscito-2024",
    title: "PLEBISCITO CONSTITUCIONAL",
    year: 2024,
    type: "PLEBISCITO",
    status: "CERRADA",
    closesAt: "2024-12-17T18:00:00",
    serialNumber: "00088121",
    totalEligible: 15400000,
    blankVotes: 234120,
    candidates: [
      { id: "p1", number: 1, name: "APRUEBO", votes: 4521003 },
      { id: "p2", number: 2, name: "RECHAZO", votes: 6098221 },
    ],
  },
];

export const getElection = (id: string) => elections.find((e) => e.id === id);

export function generateParticipationCode() {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = (n: number) =>
    Array.from({ length: n }, () => charset[Math.floor(Math.random() * charset.length)]).join("");
  return `${rand(4)}-${new Date().getFullYear()}-${rand(4)}`;
}

export function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length === 0) return "";
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return body ? `${withDots}-${dv}` : dv;
}
