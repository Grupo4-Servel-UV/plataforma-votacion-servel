import { CreateVotacionForm } from '@/components/votaciones/CreateVotacionForm';

export default function CrearVotacionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Panel administrativo</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">Crear Nueva Votación</h1>
        </div>
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