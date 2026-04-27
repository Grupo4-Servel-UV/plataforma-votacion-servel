'use client'
import { motion } from "framer-motion";
import type { Election } from "@/lib/mockData";

export function ResultsChart({ election }: { election: Election }) {
  const total =
    election.candidates.reduce((s, c) => s + (c.votes ?? 0), 0) +
    (election.blankVotes ?? 0);
  const max = Math.max(...election.candidates.map((c) => c.votes ?? 0), 1);
  const participation = election.totalEligible
    ? ((total / election.totalEligible) * 100).toFixed(1)
    : "—";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="grid grid-cols-3 gap-4 pb-6 border-b border-border">
        <Stat label="Votos válidos" value={(total - (election.blankVotes ?? 0)).toLocaleString("es-CL")} />
        <Stat label="Votos en blanco" value={(election.blankVotes ?? 0).toLocaleString("es-CL")} />
        <Stat label="Participación" value={`${participation}%`} />
      </div>

      <div className="mt-6 space-y-5">
        {election.candidates.map((c, i) => {
          const pct = total ? ((c.votes ?? 0) / total) * 100 : 0;
          const winner = (c.votes ?? 0) === max;
          return (
            <div key={c.id}>
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground/80">{c.number}.</span>
                  <span className={`font-semibold ${winner ? "text-primary" : "text-foreground"}`}>
                    {c.name}
                  </span>
                  {winner && (
                    <span className="ml-2 rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Ganador
                    </span>
                  )}
                </div>
                <div className="tabular-nums text-sm">
                  <span className="font-bold text-foreground">{pct.toFixed(2)}%</span>
                  <span className="text-muted-foreground ml-2">
                    {(c.votes ?? 0).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full rounded-full ${winner ? "bg-primary" : "bg-primary/50"}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}
