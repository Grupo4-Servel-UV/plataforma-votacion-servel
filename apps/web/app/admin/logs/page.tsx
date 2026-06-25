'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { API_BASE_URL } from '@/lib/config'

type VotanteLog = {
  id: string
  tipo: string
  rutHash: string
  ipHash: string
  resultado: string | null
  zona: string | null
  votacionId: string | null
  cantidad: number | null
  bloqueado: boolean | null
  motivo: string | null
  createdAt: string
}

type AdminLog = {
  id: string
  tipo: string
  accion: string
  descripcion: string
  ip: string
  votacionId: string | null
  detalles: Record<string, unknown> | null
  createdAt: string
}

type SistemaLog = {
  id: string
  tipo: string
  modulo: string
  gravedad: string
  mensaje: string
  stack: string | null
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'medium' })
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
      No hay registros disponibles.
    </div>
  )
}

function LoadingState() {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">Cargando registros...</div>
  )
}

function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {msg}
    </div>
  )
}

function shortHash(hash: string | null) {
  if (!hash) return '—'
  return hash.slice(0, 8) + '…'
}

function VotantesTab() {
  const [logs, setLogs] = useState<VotanteLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE_URL}/logs/votantes`)
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => setError('No se pudo cargar el historial de votantes.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState msg={error} />
  if (!logs.length) return <EmptyState />

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Tipo</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">RUT (hash)</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">IP (hash)</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Resultado</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Zona</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Intentos</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Bloqueado</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Motivo</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-3 py-2 font-mono">{log.tipo}</td>
              <td className="px-3 py-2 font-mono text-muted-foreground" title={log.rutHash ?? ''}>{shortHash(log.rutHash)}</td>
              <td className="px-3 py-2 font-mono text-muted-foreground" title={log.ipHash ?? ''}>{shortHash(log.ipHash)}</td>
              <td className="px-3 py-2">
                {log.resultado === 'EXITOSO' ? (
                  <span className="text-success font-semibold">Exitoso</span>
                ) : log.resultado === 'FALLIDO' ? (
                  <span className="text-destructive font-semibold">Fallido</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-2">{log.zona ?? '—'}</td>
              <td className="px-3 py-2">{log.cantidad ?? '—'}</td>
              <td className="px-3 py-2">
                {log.bloqueado === null ? '—' : log.bloqueado ? (
                  <span className="text-destructive font-semibold">Sí</span>
                ) : 'No'}
              </td>
              <td className="px-3 py-2">{log.motivo ?? '—'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminsTab() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE_URL}/logs/admins`)
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => setError('No se pudo cargar el historial de administradores.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState msg={error} />
  if (!logs.length) return <EmptyState />

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Tipo</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Acción</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Descripción</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">IP</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Votación ID</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Detalles</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-3 py-2 font-mono">{log.tipo}</td>
              <td className="px-3 py-2 font-mono font-semibold">{log.accion}</td>
              <td className="px-3 py-2 max-w-[240px] truncate" title={log.descripcion}>{log.descripcion}</td>
              <td className="px-3 py-2 font-mono text-muted-foreground">{log.ip}</td>
              <td className="px-3 py-2 font-mono text-muted-foreground" title={log.votacionId ?? ''}>
                {log.votacionId ? log.votacionId.slice(0, 8) + '…' : '—'}
              </td>
              <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground" title={log.detalles ? JSON.stringify(log.detalles) : ''}>
                {log.detalles ? JSON.stringify(log.detalles) : '—'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const gravedadConfig: Record<string, string> = {
  INFO: 'text-muted-foreground',
  ADVERTENCIA: 'text-secondary',
  ERROR: 'text-destructive font-semibold',
  CRITICO: 'text-destructive font-bold',
}

function SistemaTab() {
  const [logs, setLogs] = useState<SistemaLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetch(`${API_BASE_URL}/logs/sistema`)
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => setError('No se pudo cargar el historial del sistema.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState msg={error} />
  if (!logs.length) return <EmptyState />

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Tipo</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Módulo</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Gravedad</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Mensaje</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Stack</th>
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-3 py-2 font-mono">{log.tipo}</td>
              <td className="px-3 py-2 font-mono">{log.modulo}</td>
              <td className={`px-3 py-2 font-mono ${gravedadConfig[log.gravedad] ?? ''}`}>{log.gravedad}</td>
              <td className="px-3 py-2 max-w-[260px] truncate" title={log.mensaje}>{log.mensaje}</td>
              <td className="px-3 py-2 max-w-[120px] truncate text-muted-foreground" title={log.stack ?? ''}>
                {log.stack ? log.stack.split('\n')[0] : '—'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatDate(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminLogsPage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="h-3 w-3" />
              Volver al panel
            </Link>
            <p className="text-[11px] uppercase tracking-[0.2em] text-secondary font-bold">Auditoría</p>
            <h1 className="mt-1 text-2xl font-black">Registros del sistema</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Historial de eventos de votantes, acciones administrativas y errores del sistema. Solo lectura.
            </p>
          </div>
        </div>

        <Tabs defaultValue="votantes">
          <TabsList className="mb-4">
            <TabsTrigger value="votantes">Votantes</TabsTrigger>
            <TabsTrigger value="admins">Administradores</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>
          <TabsContent value="votantes">
            <VotantesTab />
          </TabsContent>
          <TabsContent value="admins">
            <AdminsTab />
          </TabsContent>
          <TabsContent value="sistema">
            <SistemaTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
