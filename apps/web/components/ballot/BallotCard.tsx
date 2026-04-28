'use client'
import { Check } from "lucide-react";
import type { Candidate, Election } from "@/lib/mockData";
import { motion } from "framer-motion";

interface Props {
  election: Election;
  selected: string | null;
  onSelect: (id: string) => void;
}

interface RowItem {
  id: string;
  number: number | null;
  name: string;
  isBlank?: boolean;
}

function CandidateRow({
  item,
  selected,
  onSelect,
  isLast,
}: {
  item: RowItem;
  selected: boolean;
  onSelect: () => void;
  isLast: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-4 px-4 sm:px-6 py-3 text-left transition-colors ${
        !isLast ? "border-b border-[oklch(0.92_0.005_250)]" : ""
      } ${selected ? "bg-[oklch(0.94_0.04_255)]" : "hover:bg-muted/60"}`}
      style={{ minHeight: 52 }}
    >
      {/* Marking line — becomes a check when selected */}
      <div className="relative flex h-7 w-16 shrink-0 items-center">
        {!selected ? (
          <div className="h-[2px] w-full bg-foreground/35" />
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 450, damping: 16 }}
            className="flex w-full items-center justify-center"
          >
            <Check
              className="h-7 w-9 text-primary"
              strokeWidth={4}
              style={{ filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.12))" }}
            />
          </motion.div>
        )}
      </div>

      {item.number !== null && (
        <span className="w-5 shrink-0 text-center font-bold text-foreground/85">
          {item.number}
        </span>
      )}

      <span
        className={`flex-1 min-w-0 text-[0.95rem] uppercase tracking-wide ${
          item.isBlank
            ? "italic text-muted-foreground font-normal"
            : "font-medium text-foreground"
        }`}
      >
        {item.name}
      </span>
    </button>
  );
}

export function BallotCard({ election, selected, onSelect }: Props) {
  const items: RowItem[] = election.candidates.map((c: Candidate) => ({
    id: c.id,
    number: c.number,
    name: c.name,
  }));

  return (
    <div
      className="relative bg-card mx-auto"
      style={{
        boxShadow: "2px 4px 16px rgba(0,0,0,0.15)",
        border: "1px solid #CCCCCC",
        maxWidth: 760,
      }}
    >
      <div className="flex">
        {/* Main ballot area */}
        <div className="flex-1 min-w-0 py-7 sm:py-8">
          {/* Title block — right aligned like real Chilean ballot */}
          <div className="px-6 sm:px-8 mb-5 text-right">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-foreground">
              {election.title}
            </p>
            <p className="text-3xl sm:text-4xl font-black text-foreground leading-none mt-1">
              {election.year}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
              {election.type}
            </p>
          </div>

          <div className="border-t-2 border-foreground/80" />

          <div>
            {items.map((it, i) => (
              <CandidateRow
                key={it.id}
                item={it}
                selected={selected === it.id}
                onSelect={() => onSelect(it.id)}
                isLast={false}
              />
            ))}
            {/* Voto en blanco — separated */}
            <div className="h-3" />
            <CandidateRow
              item={{ id: "blanco", number: null, name: "VOTO EN BLANCO", isBlank: true }}
              selected={selected === "blanco"}
              onSelect={() => onSelect("blanco")}
              isLast
            />
          </div>

          <div className="px-6 sm:px-8 mt-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Servicio Electoral · República de Chile
            </p>
          </div>
        </div>

        {/* Right stub with vertical serial + signature notch */}
        <div className="relative w-[88px] shrink-0">
          {/* Dashed perforation line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{
              borderLeft: "2px dashed #999999",
            }}
          />
          <div
            className="ballot-stub-notch h-full bg-[oklch(0.97_0.005_250)] flex flex-col items-center justify-between py-6"
          >
            <div
              className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              SERIE NN
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-foreground/70">N°</span>
              <span className="vertical-serial text-sm font-bold text-foreground">
                {election.serialNumber}
              </span>
            </div>
            <div
              className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              SERVEL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
