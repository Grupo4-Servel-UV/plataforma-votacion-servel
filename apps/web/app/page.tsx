import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-3xl font-bold text-slate-800">Administración Electoral</h1>
        <p className="mb-8 text-slate-600">Bienvenido al sistema de administración del Servel.</p>

        <Link
          href="/votaciones"
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
        >
          Ir a Votaciones
        </Link>
      </div>
    </main>
  );
}
