'use client'
import Link from 'next/link'

export function ServelHeader() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <svg viewBox="0 0 40 48" className="h-10 w-auto" fill="none">
            <rect width="40" height="48" rx="4" fill="white" fillOpacity="0.15" />
            <path d="M20 6L8 14v10c0 8 5.5 15.5 12 18 6.5-2.5 12-10 12-18V14L20 6z" fill="white" fillOpacity="0.9" />
            <path d="M20 12l-8 5.5v7c0 5.5 3.5 10.5 8 12.5 4.5-2 8-7 8-12.5v-7L20 12z" fill="#C8151B" />
          </svg>
          <div>
            <p className="text-lg font-black tracking-tight leading-none">SERVEL</p>
            <p className="text-[10px] font-medium tracking-widest opacity-80 leading-none mt-0.5">
              SERVICIO ELECTORAL DE CHILE
            </p>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Inicio</Link>
          <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Procesos electorales</Link>
          <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">Resultados</Link>
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