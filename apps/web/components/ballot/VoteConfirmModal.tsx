import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Candidate } from "@/lib/mockData";

interface Props {
  open: boolean;
  candidate: Candidate | null;
  isBlank: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function VoteConfirmModal({ open, candidate, isBlank, onCancel, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/45 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
            className="relative w-full max-w-md rounded-md bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-primary text-primary-foreground px-6 py-4 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70">
                  Confirmación de voto
                </p>
                <h3 className="text-lg font-bold mt-0.5">¿Confirma su voto?</h3>
              </div>
              <button onClick={onCancel} className="rounded-full p-1 hover:bg-primary-foreground/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {isBlank ? (
                <div className="text-center py-3 border-2 border-dashed border-primary/30 rounded-md bg-primary/5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Su elección</p>
                  <p className="mt-1 text-xl font-bold italic text-foreground">VOTO EN BLANCO</p>
                </div>
              ) : candidate ? (
                <div className="border-2 border-primary/30 rounded-md bg-primary/5 px-5 py-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Candidato N° {candidate.number}
                  </p>
                  <p className="mt-1 text-lg font-bold uppercase tracking-wide text-foreground leading-tight">
                    {candidate.name}
                  </p>
                </div>
              ) : null}

              <p className="mt-4 text-xs text-muted-foreground text-center">
                Una vez emitido, su voto no podrá ser modificado ni anulado.
              </p>

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-md border border-primary bg-card px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                >
                  VOLVER A LA PAPELETA
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
