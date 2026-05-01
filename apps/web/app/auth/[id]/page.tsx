'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { ServelHeader } from '@/components/layout/ServelHeader'
import { OTPInput } from '@/components/auth/OTPInput'
import { API_BASE_URL } from '@/lib/config'
import { toElectionView } from '@/lib/adapters'
import { formatRut } from '@/lib/mockData'

export default function AuthPage() {
  const params = useParams()
  const id = String(params.id)
  const router = useRouter()
  const [election, setElection] = useState<ReturnType<typeof toElectionView> | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [rut, setRut] = useState('')
  const [pwd, setPwd] = useState('')
  const [err1, setErr1] = useState<string | null>(null)
  const [notEligibleReasons, setNotEligibleReasons] = useState<string[] | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(300)
  const [attempts, setAttempts] = useState(3)
  const [otpError, setOtpError] = useState(false)
  const [otpMessage, setOtpMessage] = useState<string | null>(null)
  const [contactEmail, setContactEmail] = useState<string | null>(null)
  const MAX_ATTEMPTS = 3
  const OTP_TTL = 300

  useEffect(() => {
    fetch(`${API_BASE_URL}/votaciones/${id}`)
      .then((r) => r.json())
      .then((data) => setElection(toElectionView(data.body ?? data)))
      .catch(() => router.push('/'))
  }, [id, router])

  useEffect(() => {
    if (step !== 2) return
    const i = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(i)
  }, [step])

  if (!election) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Cargando...</p>
    </div>
  )

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (rut.replace(/[^0-9kK]/g, '').length < 8) {
      setErr1('RUT inválido. Verifica el formato.')
      return
    }
    if (pwd.length < 4) {
      setErr1('Clave Única incorrecta.')
      return
    }
    setErr1(null)

    // Verificar credenciales en la API y comprobar habilitación en el padrón
    ;(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rut, clave: pwd }),
        })

        if (res.status === 401) {
          setErr1('RUT o clave inválidos')
          return
        }

        if (!res.ok) {
          setErr1('Error al verificar credenciales')
          return
        }

        const data = await res.json()
        const payload = data.body ?? data

        if (!payload.habilitado) {
          setErr1('No estás habilitado en el padrón. Contacta a la autoridad.')
          return
        }

        // If the server reports the user already voted, notify and redirect
        if (
          payload.alreadyVoted ||
          payload.votado ||
          payload.yaVoto ||
          payload.ya_voto ||
          payload.already_voted
        ) {
          setErr1('Ya ejerciste tu voto en esta votación. Redirigiendo...')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        // capture email to show masked contact in OTP step
        setContactEmail(payload.email ?? null)

        // move to OTP step and request code
        setStep(2)
        setSecondsLeft(OTP_TTL)
        setAttempts(MAX_ATTEMPTS)
        setOtpMessage(null)
        try {
          const send = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rut, votacionId: id }),
          })
          if (!send.ok) {
            const body = await send.json().catch(() => ({}))
            if (send.status === 403) {
              setNotEligibleReasons(body.reasons ?? [body.message ?? 'No elegible'])
              return
            }
            setErr1(body.message ?? 'Error al enviar el código de verificación')
            setStep(1)
            return
          }
        } catch (err) {
          setErr1('Error al enviar el código de verificación')
          setStep(1)
          return
        }
      } catch (err) {
        setErr1('Error de conexión con el servidor')
      }
    })()
  }

  const handleOtp = (code: string) => {
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rut, otp: code }),
        })
        const data = await res.json().catch(() => ({}))
        const body = data.body ?? data
        if (res.ok && body.ok) {
          try {
            // persist normalized rut for this voting session (ephemeral)
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('votante_rut', rut)
            }
          } catch (e) {}
          router.push(`/votar/${id}`)
          return
        }

        if (body.locked) {
          setOtpMessage('Has sido bloqueado por demasiados intentos. Redirigiendo...')
          setOtpError(true)
          setTimeout(() => router.push('/'), 3000)
          return
        }

        // body.attempts = failed attempts so far
        if (typeof body.attempts === 'number') {
          setAttempts(Math.max(0, MAX_ATTEMPTS - body.attempts))
        } else {
          setAttempts((a) => Math.max(0, a - 1))
        }
        setOtpError(true)
        setOtpMessage('Código incorrecto. Intenta de nuevo.')
        setTimeout(() => setOtpError(false), 600)
      } catch (err) {
        setOtpMessage('Error de conexión al verificar el código')
      }
    })()
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col">
      <ServelHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            {notEligibleReasons ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">No estás habilitado para esta votación</h2>
                <p className="text-sm text-muted-foreground">Motivos:</p>
                <ul className="list-disc list-inside text-sm text-foreground">
                  {notEligibleReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Link href="/" className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm">Volver</Link>
                </div>
              </div>
            ) : (
            <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                {step === 1 ? <KeyRound className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Paso {step} de 2</p>
                <h1 className="text-lg font-bold text-foreground">
                  {step === 1 ? 'Ingresa con Clave Única' : 'Verificación de identidad'}
                </h1>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Estás autenticando para votar en{' '}
              <span className="font-medium text-foreground">{election.title}</span>
            </p>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="s1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onSubmit={handleStep1}
                  className="space-y-4"
                >
                  <Field label="RUT">
                    <input
                      value={rut}
                      onChange={(e) => setRut(formatRut(e.target.value))}
                      placeholder="12.345.678-9"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-foreground tabular-nums outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                      maxLength={12}
                    />
                  </Field>
                  <Field label="Clave Única">
                    <input
                      type="password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    />
                  </Field>

                  {err1 && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      {err1}
                    </div>
                  )}

                  <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Continuar
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Tus credenciales son verificadas con el sistema oficial de Clave Única del Estado.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="space-y-5"
                >
                  <p className="text-sm text-foreground/80 text-center">
                    Ingresa el código de 6 dígitos enviado a tu correo {maskEmail(contactEmail)}.
                  </p>
                  {otpMessage && (
                    <div className="rounded-md px-3 py-2 text-sm text-destructive">{otpMessage}</div>
                  )}

                  <OTPInput onComplete={handleOtp} error={otpError} />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Expira en <span className="font-semibold text-foreground tabular-nums">{mm}:{ss}</span></span>
                    <span>Intentos restantes: <span className="font-semibold text-foreground">{attempts}</span></span>
                  </div>

                  <button
                    disabled={secondsLeft > 0}
                    onClick={async () => {
                      try {
                        const r = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ rut, votacionId: id }),
                        })
                        if (!r.ok) {
                          const b = await r.json().catch(() => ({}))
                          if (r.status === 403) {
                            setNotEligibleReasons(b.reasons ?? [b.message ?? 'No elegible'])
                            return
                          }
                          setOtpMessage(b.message ?? 'Error al reenviar código')
                          return
                        }
                        setSecondsLeft(OTP_TTL)
                        setOtpMessage('Código reenviado')
                      } catch (e) {
                        setOtpMessage('Error al reenviar código')
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                  >
                    Reenviar código
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function maskEmail(email: string | null) {
  if (!email) return 'registrado'
  const [local, domain] = email.split('@')
  if (!domain) return email
  if (local.length <= 3) return `${local}@${domain}`
  const masked = local.slice(0, 3) + 'X'.repeat(Math.max(3, local.length - 3))
  return `${masked}@${domain}`
}