'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ServelHeader } from '@/components/layout/ServelHeader'
import { API_BASE_URL } from '@/lib/config'

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    fechaNacimiento: '',
    region: '',
    comuna: '',
    clave: '',
  })
  const [err, setErr] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const ETNIAS = ['Ninguna','Aimara','Atacameño','Quechua','Diaguita','Colla','Chango','Mapuche','Rapa Nui','Kawésqar','Yagán',"Selk'nam"]

  const validate = () => {
    const errs: Record<string,string> = {}
    const rutClean = form.rut.replace(/\s+/g, '')
    if (rutClean.length === 0) errs.rut = 'RUT es requerido'
    else if (rutClean.length > 10) errs.rut = 'RUT no puede ser mayor a 10 caracteres'

    if (form.fechaNacimiento && form.fechaNacimiento.length > 8) errs.fechaNacimiento = 'Fecha de nacimiento debe tener como máximo 8 caracteres (YYYYMMDD)'

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido'

    if (!form.clave || form.clave.length <= 6) errs.clave = 'La clave debe tener más de 6 caracteres'

    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setSuccess(null)
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        // if server returns structured validation issues, map to fields
        if (j?.issues && Array.isArray(j.issues)) {
          const map: Record<string,string> = {}
          for (const it of j.issues) {
            if (it.path && it.path[0]) map[String(it.path[0])] = it.message
          }
          setFieldErrors(map)
          return
        }
        setErr(j?.message ?? 'Error al registrar')
        return
      }
      setSuccess('Registrado correctamente. Ahora puedes iniciar sesión con tu RUT y clave.')
      setForm({ nombres: '', apellidos: '', rut: '', email: '', fechaNacimiento: '', region: '', comuna: '', clave: '' })
      setFieldErrors({})
    } catch (err) {
      setErr('Error de conexión')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ServelHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">Volver</Link>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h1 className="text-lg font-bold text-foreground mb-4">Registro de votante (simulado)</h1>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Nombres" value={form.nombres} onChange={(e) => handleChange('nombres', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              <input placeholder="Apellidos" value={form.apellidos} onChange={(e) => handleChange('apellidos', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              <input placeholder="RUT (ej. 12345678-9)" value={form.rut} onChange={(e) => handleChange('rut', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              {fieldErrors.rut && <div className="text-xs text-destructive mt-1">{fieldErrors.rut}</div>}
              <input placeholder="Correo electrónico" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              {fieldErrors.email && <div className="text-xs text-destructive mt-1">{fieldErrors.email}</div>}
              <input placeholder="Fecha nacimiento (YYYYMMDD)" value={form.fechaNacimiento} onChange={(e) => handleChange('fechaNacimiento', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              {fieldErrors.fechaNacimiento && <div className="text-xs text-destructive mt-1">{fieldErrors.fechaNacimiento}</div>}
              <input placeholder="Región" value={form.region} onChange={(e) => handleChange('region', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              <input placeholder="Comuna" value={form.comuna} onChange={(e) => handleChange('comuna', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              <select value={form.etnia ?? 'Ninguna'} onChange={(e) => handleChange('etnia', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5">
                {ETNIAS.map((x) => <option key={x} value={x === 'Ninguna' ? 'Ninguna' : x}>{x}</option>)}
              </select>
              <input placeholder="Clave" type="password" value={form.clave} onChange={(e) => handleChange('clave', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" />
              {fieldErrors.clave && <div className="text-xs text-destructive mt-1">{fieldErrors.clave}</div>}

              {err && <div className="text-sm text-destructive">{err}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}

              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Registrar</button>
                <Link href="/auth/111" className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-center">Ir a login</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
