import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function ParticipationCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Código de Participación
      </p>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 20 }}
        className="mt-3 inline-flex items-center gap-3 rounded-md border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-4"
      >
        <span className="font-mono text-2xl sm:text-3xl font-black tabular-nums text-primary tracking-wider">
          {code}
        </span>
        <button
          onClick={onCopy}
          className="rounded-md border border-primary/30 bg-card p-2 text-primary hover:bg-primary/10 transition-colors"
          aria-label="Copiar código"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
      </motion.div>
      <p className="mt-3 text-xs text-muted-foreground">
        Guarda este código como comprobante.
      </p>
    </div>
  );
}
