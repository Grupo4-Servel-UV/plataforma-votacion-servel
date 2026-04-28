'use client'
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  target: string;
  compact?: boolean;
}

function diff(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function Cell({ value, label }: { value: number; label: string; mounted: boolean }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-9 w-11 overflow-hidden rounded-md bg-primary/5 border border-primary/15">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center text-base font-bold text-primary tabular-nums"
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ target, compact }: Props) {
  // CRITICAL: Start at zeros to match SSR, then update on client only.
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(diff(target));
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [target]);

  if (compact) {
    return (
      <span suppressHydrationWarning className="tabular-nums text-sm font-medium text-primary">
        {mounted
          ? `${t.days}d ${String(t.hours).padStart(2, "0")}:${String(t.minutes).padStart(2, "0")}:${String(t.seconds).padStart(2, "0")}`
          : "—"}
      </span>
    );
  }

  return (
    <div suppressHydrationWarning className="flex items-end gap-1.5">
      <Cell value={t.days} label="Días" mounted={mounted} />
      <Cell value={t.hours} label="Hrs" mounted={mounted} />
      <Cell value={t.minutes} label="Min" mounted={mounted} />
      <Cell value={t.seconds} label="Seg" mounted={mounted} />
    </div>
  );
}
