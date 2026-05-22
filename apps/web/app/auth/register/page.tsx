'use client'
import { API_BASE_URL } from '@/lib/config'
import { DIVISION_TERRITORIAL } from '@servel/contracts'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    rut: '',
    email: '',
    fechaNacimiento: '',
    region: '',
    comuna: '',
    etnia: '',
    clave: '',
  })
  const [err, setErr] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const ETNIAS = ['Ninguna','Aimara','Atacameño','Quechua','Diaguita','Colla','Chango','Mapuche','Rapa Nui','Kawésqar','Yagán',"Selk'nam"]

  const validate = () => {
    const errs: Record<string,string> = {}
    const rutClean = form.rut.replace(/\s+/g, '')
    if (rutClean.length === 0) errs.rut = 'RUT es requerido'
    else if (rutClean.length > 10) errs.rut = 'RUT no puede ser mayor a 10 caracteres'

    if (form.fechaNacimiento && form.fechaNacimiento.length > 8) errs.fechaNacimiento = 'Fecha de nacimiento debe tener como máximo 8 caracteres (YYYYMMDD)'

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido'

    // validar region/comuna si están presentes
    if (form.region && !Object.keys(DIVISION_TERRITORIAL).includes(form.region)) errs.region = 'Región inválida'
    if (form.comuna && form.region && !((DIVISION_TERRITORIAL[form.region] || []).includes(form.comuna))) errs.comuna = 'Comuna inválida para la región seleccionada'

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
      setForm({ nombres: '', apellidos: '', rut: '', email: '', fechaNacimiento: '', region: '', comuna: '', etnia: '', clave: '' })
      setFieldErrors({})
    } catch (err) {
      setErr('Error de conexión')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
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
              <div>
                <input list="regions" placeholder="Región" value={form.region} onChange={(e) => { handleChange('region', e.target.value); handleChange('comuna', '') }} className="w-full rounded-lg border border-input px-3 py-2.5" />
                <datalist id="regions">
                  {Object.keys(DIVISION_TERRITORIAL).map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
                {fieldErrors.region && <div className="text-xs text-destructive mt-1">{fieldErrors.region}</div>}
              </div>

              <div>
                <input list="comunas" placeholder="Comuna" value={form.comuna} onChange={(e) => handleChange('comuna', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5" disabled={!form.region} />
                <datalist id="comunas">
                  {(DIVISION_TERRITORIAL[form.region] || []).map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {fieldErrors.comuna && <div className="text-xs text-destructive mt-1">{fieldErrors.comuna}</div>}
              </div>
              <select value={form.etnia ?? 'Ninguna'} onChange={(e) => handleChange('etnia', e.target.value)} className="w-full rounded-lg border border-input px-3 py-2.5">
                {ETNIAS.map((x) => <option key={x} value={x === 'Ninguna' ? 'Ninguna' : x}>{x}</option>)}
              </select>
              <div className="relative">
                <input
                  placeholder="Clave"
                  type={showPassword ? 'text' : 'password'}
                  value={form.clave}
                  onChange={(e) => handleChange('clave', e.target.value)}
                  className="w-full rounded-lg border border-input px-3 py-2.5"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center pr-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
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
