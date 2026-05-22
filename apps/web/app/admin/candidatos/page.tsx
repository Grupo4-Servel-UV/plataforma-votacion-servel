'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/config'
import { Candidato } from '@servel/contracts'
import { useEffect, useState } from 'react'

export default function CandidatosAdminPage() {
  const [list, setList] = useState<Candidato[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Candidato | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/candidatos`)
      if (!res.ok) throw new Error('Error cargando candidatos')
      const data = await res.json()
      setList(data)
    } catch (err: any) {
      setError(err.message ?? 'Error')
    }
  }

  useEffect(() => { fetchList() }, [])

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit = (c: Candidato) => { setEditing(c); setShowForm(true) }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar eliminación del candidato?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/candidatos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message ?? 'Error al eliminar')
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
          <h1 className="text-xl font-bold">Candidatos (Admin)</h1>
          <Button onClick={openCreate}>Crear candidato</Button>
        </div>
        {error && <div className="mb-3 text-destructive">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="pb-2 w-36">Nombre</th>
                <th className="pb-2 w-36">RUT</th>
                <th className="pb-2">Partido</th>
                <th className="pb-2">Lista</th>
                <th className="pb-2">Descripción</th>
                <th className="pb-2 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.nombres} {c.apellidos}</td>
                  <td className="py-2">{c.rut}</td>
                  <td className="py-2">{c.partidoPolitico ?? '-'}</td>
                  <td className="py-2">{c.lista ?? '-'}</td>
                  <td className="py-2 max-w-xl truncate">{c.descripcion ?? '-'}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openEdit(c)}>Editar</Button>
                      { !c.votacionId && (
                        <Button variant="destructive" onClick={() => handleDelete(c.id)}>Eliminar</Button>
                      ) }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <CandidateForm
            initial={editing}
            onClose={() => { setShowForm(false); setEditing(null); fetchList(); }}
          />
        )}
      </div>
    </div>
  )
}

function CandidateForm({ initial, onClose }: { initial: Candidato | null; onClose: () => void }) {
  const [nombres, setNombres] = useState(initial?.nombres ?? '')
  const [apellidos, setApellidos] = useState(initial?.apellidos ?? '')
  const [rut, setRut] = useState(initial?.rut ?? '')
  const [partido, setPartido] = useState(initial?.partidoPolitico ?? '')
  const [lista, setLista] = useState(initial?.lista ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [imagenUrl, setImagenUrl] = useState(initial?.imagenUrl ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { nombres, apellidos, rut, partidoPolitico: partido || null, lista: lista || null, descripcion: descripcion || null, imagenUrl: imagenUrl || null }
      const method = initial ? 'PUT' : 'POST'
      const url = initial ? `${API_BASE_URL}/candidatos/${initial.id}` : `${API_BASE_URL}/candidatos`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message ?? 'Error al guardar')
      }
      onClose()
    } catch (err: any) {
      alert(err.message ?? 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <h3 className="text-lg font-bold mb-4">{initial ? 'Editar candidato' : 'Crear candidato'}</h3>
        <div className="grid grid-cols-1 gap-3">
          <Input placeholder="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} />
          <Input placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
          <Input placeholder="RUT" value={rut} onChange={(e) => setRut(e.target.value)} />
          <Input placeholder="Partido político" value={partido} onChange={(e) => setPartido(e.target.value)} />
          <Input placeholder="Lista" value={lista} onChange={(e) => setLista(e.target.value)} />
          <Input placeholder="Imagen URL (opcional)" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
          <textarea className="w-full rounded-md border px-3 py-2" placeholder="Descripción" value={descripcion ?? ''} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </div>
    </div>
  )
}
