'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileBarChart, Calendar, MapPin, Users, Pencil, Trash2 } from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'
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

const MIN_DIAS_ANTICIPACION = 14

type Votacion = {
  id: string
  nombre: string
  estado: 'ACTIVA' | 'PENDIENTE' | 'CERRADA'
  fechaApertura: string
  fechaCierre: string
  region?: string | null
  comuna?: string | null
  candidatos: { id: string; nombres: string; apellidos: string; rut: string; partidoPolitico?: string | null; lista?: string | null }[]
  comunidades: { id: string; comunidad: string }[]
}

const statusConfig = {
  ACTIVA: { label: 'ACTIVA', badge: 'border-success/30 bg-success/10 text-success', dot: 'bg-success animate-pulse-dot' },
  PENDIENTE: { label: 'PENDIENTE', badge: 'border-secondary/30 bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  CERRADA: { label: 'CERRADA', badge: 'border-destructive/30 bg-destructive/10 text-destructive', dot: 'bg-destructive' },
} as const

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { dateStyle: 'long' }) +
    ' · ' +
    new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isEditable(votacion: Votacion) {
  if (votacion.estado !== 'PENDIENTE') return false
  const msToOpen = new Date(votacion.fechaApertura).getTime() - Date.now()
  return msToOpen >= MIN_DIAS_ANTICIPACION * 24 * 60 * 60 * 1000
}

export default function AdminVotacionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [votacion, setVotacion] = useState<Votacion | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editApertura, setEditApertura] = useState('')
  const [editCierre, setEditCierre] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete state
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/votaciones/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        const v = data.body ?? data
        setVotacion(v)
        setEditNombre(v.nombre)
        setEditApertura(toDatetimeLocal(v.fechaApertura))
        setEditCierre(toDatetimeLocal(v.fechaCierre))
      })
      .catch(() => router.push('/admin'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleSave() {
    if (!votacion) return
    setSaving(true)
    setEditError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/votaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          fechaApertura: new Date(editApertura).toISOString(),
          fechaCierre: new Date(editCierre).toISOString(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message.join('; ') : (data?.message ?? 'Error al guardar')
        setEditError(msg)
        return
      }
      setVotacion({ ...votacion, nombre: editNombre, fechaApertura: new Date(editApertura).toISOString(), fechaCierre: new Date(editCierre).toISOString() })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/votaciones/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin')
      }
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!votacion) return null

  const s = statusConfig[votacion.estado]
  const canEdit = isEditable(votacion)

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-secondary font-bold">Detalle de votación</p>
            <h1 className="mt-1 text-2xl font-black text-foreground">{votacion.nombre.toUpperCase()}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${s.badge}`}>
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted/60 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            )}
            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar esta votación?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. La votación <strong>{votacion.nombre}</strong> y todos sus datos asociados serán eliminados permanentemente del sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && canEdit && (
          <div className="rounded-md border border-primary/30 bg-card p-5 space-y-4">
            <h2 className="text-sm font-bold">Editar votación</h2>
            {editError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {editError}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Nombre</label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Fecha de apertura</label>
                <input
                  type="datetime-local"
                  value={editApertura}
                  onChange={(e) => setEditApertura(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Fecha de cierre</label>
                <input
                  type="datetime-local"
                  value={editCierre}
                  onChange={(e) => setEditCierre(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              La nueva fecha de apertura debe mantenerse con al menos {MIN_DIAS_ANTICIPACION} días de anticipación desde hoy.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setEditError(null) }}
                disabled={saving}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted/60 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {/* Lock period notice */}
        {votacion.estado === 'PENDIENTE' && !canEdit && (
          <div className="rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            Esta votación se encuentra dentro del periodo de bloqueo ({MIN_DIAS_ANTICIPACION} días antes de su apertura). No se puede editar ni eliminar.
          </div>
        )}

        {/* Metadata */}
        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-foreground mb-1">Información del proceso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Apertura</p>
                <p className="font-medium">{fmt(votacion.fechaApertura)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cierre</p>
                <p className="font-medium">{fmt(votacion.fechaCierre)}</p>
              </div>
            </div>
            {(votacion.region || votacion.comuna) && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Restricción geográfica</p>
                  <p className="font-medium">
                    {[votacion.region, votacion.comuna].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            )}
            {votacion.comunidades.length > 0 && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Comunidades habilitadas</p>
                  <p className="font-medium">{votacion.comunidades.map((c) => c.comunidad).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidates — read-only */}
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold">Opciones de la papeleta</h2>
            <span className="text-xs text-muted-foreground">{votacion.candidatos.length} candidato(s)</span>
          </div>
          {votacion.candidatos.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Sin candidatos asignados a esta votación.
            </div>
          ) : (
            <ul>
              {votacion.candidatos.map((c, i) => (
                <li
                  key={c.id}
                  className={`flex items-center gap-4 px-5 py-3 text-sm ${i < votacion.candidatos.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className="w-6 shrink-0 font-bold text-muted-foreground text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold uppercase">{c.nombres} {c.apellidos}</p>
                    {(c.partidoPolitico || c.lista) && (
                      <p className="text-xs text-muted-foreground">
                        {[c.partidoPolitico, c.lista].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.rut}</span>
                </li>
              ))}
              <li className="flex items-center gap-4 px-5 py-3 border-t-2 border-dashed border-border">
                <span className="w-6 shrink-0" />
                <p className="text-sm italic text-muted-foreground">Voto en blanco</p>
              </li>
            </ul>
          )}
        </div>

        {votacion.estado === 'CERRADA' && (
          <div className="flex justify-end">
            <Link
              href={`/resultados/${votacion.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <FileBarChart className="h-4 w-4" />
              Ver resultados oficiales
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
