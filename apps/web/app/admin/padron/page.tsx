'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/config'
import React, { useState } from 'react'

type ValidationError = { row: number; field?: string; message: string; details?: any }
type UploadResult = { ok: boolean; total: number; added: number; updated: number }

export default function PadronUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[] | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors(null)
    setError(null)
    setResult(null)
    const f = e.target.files?.[0] ?? null
    setFile(f)
  }

  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setValidationErrors(null)
    setResult(null)
    if (!file) return setError('Selecciona un archivo CSV o JSON')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`${API_BASE_URL}/admin/padron/upload`, {
        method: 'POST',
        body: form,
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        // Nest sometimes returns { message: { errors: [...] } }
        if (json?.message && typeof json.message === 'object' && Array.isArray(json.message.errors)) {
          setValidationErrors(json.message.errors)
        } else if (json?.errors && Array.isArray(json.errors)) {
          setValidationErrors(json.errors)
        } else if (json?.body && json.body.errors) {
          setValidationErrors(json.body.errors)
        } else if (json?.message && typeof json.message === 'string') {
          setError(json.message)
        } else {
          setError(json?.error ?? 'Error al subir archivo')
        }
        return
      }

      const body = (json?.body ?? json) ?? {}
      setResult(body as UploadResult)
    } catch (err: any) {
      setError(err?.message ?? 'Error de red')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Cargar padrón (Admin)</h1>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {error && <div className="text-destructive">{error}</div>}

          <div>
            <label className="text-sm mb-1 block">Archivo (CSV o JSON)</label>
            <Input type="file" accept=".csv,application/json,text/csv,application/csv" onChange={handleFile} />
            <p className="text-xs text-muted-foreground mt-1">El archivo debe incluir columnas: rut, region, comuna, estado_habilitacion, email</p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={uploading} variant="default">{uploading ? 'Subiendo...' : 'Subir padrón'}</Button>
            <Button type="button" variant="outline" onClick={() => { setFile(null); setError(null); setValidationErrors(null); setResult(null); }} disabled={uploading}>Limpiar</Button>
          </div>
        </form>

        {validationErrors && (
          <div className="mt-6">
            <h2 className="font-medium">Errores de validación ({validationErrors.length})</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-2 w-20">Fila</th>
                    <th className="pb-2 w-48">Campo</th>
                    <th className="pb-2">Mensaje</th>
                    <th className="pb-2 w-48">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {validationErrors.map((err, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2">{err.row}</td>
                      <td className="py-2">{err.field ?? '-'}</td>
                      <td className="py-2">{err.message}</td>
                      <td className="py-2"><pre className="text-xs">{JSON.stringify(err.details ?? '-', null, 2)}</pre></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h2 className="font-medium">Resultado</h2>
            <ul className="mt-2 list-disc list-inside">
              <li>Total filas procesadas: <strong>{result.total}</strong></li>
              <li>Agregados: <strong>{result.added}</strong></li>
              <li>Actualizados: <strong>{result.updated}</strong></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
