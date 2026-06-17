'use client'
import Image from 'next/image'
import Link from 'next/link'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { API_BASE_URL } from '@/lib/config'

const VOTER_TIMEOUT_MS = 10 * 60 * 1000      // 10 minutes
const ADMIN_TIMEOUT_MS = 3 * 60 * 60 * 1000  // 3 hours
const ACTIVITY_EVENTS = ['mousemove', 'click', 'keydown', 'scroll', 'touchstart'] as const

export function ServelHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [rut, setRut] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isAdminPath = pathname?.startsWith('/admin') ?? false
  const timeoutMs = isAdminPath ? ADMIN_TIMEOUT_MS : VOTER_TIMEOUT_MS

  const doLogout = useCallback(
    async (motivo: string) => {
      const currentRut = sessionStorage.getItem('votante_rut') ?? (isAdminPath ? 'ADMIN' : '')
      sessionStorage.removeItem('votante_rut')
      setRut(null)
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rut: currentRut, motivo }),
        })
      } catch {}
      router.push('/')
    },
    [isAdminPath, router],
  )

  useEffect(() => {
    const stored = sessionStorage.getItem('votante_rut')
    startTransition(() => setRut(stored))

    // Track inactivity when voter is logged in OR when on admin pages
    const shouldTrack = !!stored || isAdminPath
    if (!shouldTrack) return

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(
        () => doLogout('Expiración por inactividad'),
        timeoutMs,
      )
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }))
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, resetTimer))
    }
  }, [pathname, isAdminPath, timeoutMs, doLogout])

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
          <Link href="/admin" className="opacity-80 hover:opacity-100 transition-opacity">Admin</Link>

          {rut && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-semibold opacity-90 hover:opacity-100 hover:bg-white/10 transition-colors">
                  Cerrar sesión
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tu sesión será cerrada de inmediato. El evento quedará registrado en los logs del sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => doLogout('Cierre manual')}>
                    Sí, cerrar sesión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
