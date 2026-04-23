import { CreateVotacionForm } from '@/components/votaciones/CreateVotacionForm';

export default function CrearVotacionPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Crear Nueva Votación</h1>
        <CreateVotacionForm />
      </div>
    </main>
  );
}
