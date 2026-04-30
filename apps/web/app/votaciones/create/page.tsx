import { CreateVotacionForm } from '@/components/votaciones/CreateVotacionForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CrearVotacionPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Link 
            href="/votaciones" 
            className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-secondary font-bold hover:opacity-80 transition-opacity w-fit group"
          >
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
            Panel administrativo
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Crear nueva votación
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-md border border-border bg-card overflow-hidden shadow-sm">
          <div className="h-1 w-full bg-primary" />
          <div className="p-6">
            <CreateVotacionForm />
          </div>
        </div>
      </div>
    </div>
  );
}