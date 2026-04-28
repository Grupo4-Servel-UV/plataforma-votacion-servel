'use client'
import Link from 'next/link'
import Image from 'next/image'

export function ServelHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/servel-logo.jpg"
            alt="SERVEL"
            width={60}
            height={75}
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Inicio</Link>
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Procesos electorales</Link>
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Resultados</Link>
        <Link href="/votaciones" className="opacity-80 hover:opacity-100 transition-opacity">Administración</Link>
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Ayuda</Link>
      </nav>
      </div>
      <div className="h-1 w-full bg-destructive" />
    </header>
  )
}

export function ServelFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="font-bold text-sm">Servicio Electoral de Chile</p>
          <p className="text-xs opacity-70 mt-1">servel.cl · Av. Esmeralda 611, Santiago</p>
          <p className="text-xs opacity-70">Mesa de ayuda: 600 600 3000</p>
        </div>
        <div className="text-xs opacity-70 sm:text-right">
          <p>Esta plataforma es propiedad del Estado de Chile.</p>
          <p className="mt-1">El uso indebido será sancionado conforme a la Ley N° 18.700.</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-center text-[11px] opacity-50">
        © {new Date().getFullYear()} Servicio Electoral de Chile · Todos los derechos reservados
      </div>
    </footer>
  )
}