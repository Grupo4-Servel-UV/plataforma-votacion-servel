'use client'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/config'
import Link from 'next/link'

type Votante = {
  id: string
  nombres: string
  apellidos: string
  rut: string
  fechaNacimiento?: string | null
  region?: string | null
  comuna?: string | null
  habilitado?: boolean
  etnia?: string | null
  email?: string | null
}

export default function VotantesPage() {
  const [list, setList] = useState<Votante[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expandedEmails, setExpandedEmails] = useState<string[]>([])

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/votantes`)
      if (!res.ok) throw new Error('Error al obtener votantes')
      const data = await res.json()
      const body = data.body ?? data
      setList(body)
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  useEffect(() => { fetchList() }, [])

  const handleDelete = async (rut: string) => {
    if (!confirm(`Borrar votante ${rut}? Esta acción es irreversible en desarrollo.`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/admin/votantes/${encodeURIComponent(rut)}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message ?? 'Error al borrar')
      }
      await fetchList()
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  const setHabilitado = async (rut: string, habilitado: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/votantes/${encodeURIComponent(rut)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilitado }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message ?? 'Error al actualizar')
      }
      await fetchList()
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Votantes (Desarrollo)</h1>
          <Link href="/auth/register" className="text-sm text-primary">Crear votante</Link>
        </div>
        {error && <div className="mb-3 text-destructive">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-2 w-36">RUT</th>
              <th className="pb-2 w-48">Nombre</th>
              <th className="pb-2 w-24">Región</th>
              <th className="pb-2 w-24">Comuna</th>
              <th className="pb-2 w-80">Correo</th>
              <th className="pb-2 w-28">Habilitado</th>
              <th className="pb-2 w-40">Etnia</th>
              <th className="pb-2 w-24 pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="py-2 w-36">{v.rut}</td>
                <td className="py-2 w-48">{v.nombres} {v.apellidos}</td>
                <td className="py-2 w-24">{v.region}</td>
                <td className="py-2 w-24">{v.comuna}</td>
                <td className="py-2 max-w-[20rem]">
                  {(() => {
                    const email = v.email ?? ''
                    const expanded = expandedEmails.includes(v.id)
                    const short = email.length > 6 ? `${email.slice(0, 6)}...` : email
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpandedEmails((s) => s.includes(v.id) ? s.filter(x => x !== v.id) : [...s, v.id])}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedEmails((s) => s.includes(v.id) ? s.filter(x => x !== v.id) : [...s, v.id]) }}
                        className="inline-flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 hover:bg-muted/10 transition-colors"
                        aria-label={expanded ? `Contraer email ${email}` : `Ver email completo ${email}`}
                        title={expanded ? '' : email}
                      >
                        <span className="text-sm font-mono text-foreground">{expanded ? email : short}</span>
                        <span className={`text-xs text-muted-foreground transform transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>▸</span>
                      </div>
                    )
                  })()}
                </td>
                <td className="py-2 w-28">
                  <select
                    value={v.habilitado ? 'true' : 'false'}
                    onChange={(e) => setHabilitado(v.rut, e.target.value === 'true')}
                    className="rounded-md border px-2 py-1"
                    aria-label={`Habilitado ${v.rut}`}
                  >
                    <option value="true">SI</option>
                    <option value="false">NO</option>
                  </select>
                </td>
                <td className="py-2 w-40">
                  <select
                    value={v.etnia ?? 'Ninguna'}
                    onChange={(e) => {
                      fetch(`${API_BASE_URL}/admin/votantes/${encodeURIComponent(v.rut)}/etnia`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ etnia: e.target.value === 'Ninguna' ? null : e.target.value }),
                      }).then(() => fetchList())
                        .catch((err) => setError(err.message ?? 'Error'))
                    }}
                    className="rounded-md border px-2 py-1"
                    aria-label={`Etnia ${v.rut}`}
                  >
                    <option value="Ninguna">Ninguna</option>
                    <option value="Aimara">Aimara</option>
                    <option value="Atacameño">Atacameño</option>
                    <option value="Quechua">Quechua</option>
                    <option value="Diaguita">Diaguita</option>
                    <option value="Colla">Colla</option>
                    <option value="Chango">Chango</option>
                    <option value="Mapuche">Mapuche</option>
                    <option value="Rapa Nui">Rapa Nui</option>
                    <option value="Kawésqar">Kawésqar</option>
                    <option value="Yagán">Yagán</option>
                    <option value="Selk'nam">Selk'nam</option>
                  </select>
                </td>
                <td className="py-2 w-24 pr-4">
                  <button
                    onClick={() => handleDelete(v.rut)}
                    className="text-sm text-destructive hover:underline"
                    aria-label={`Eliminar votante ${v.rut}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
