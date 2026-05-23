"use client";
import { API_BASE_URL } from '@/lib/config';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [rut, setRut] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') ?? '');
    setRut(params.get('rut') ?? '');
  }, []);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessage(null);
    setError(null);
  }, [token, rut]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, token, newPassword: password }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        // response not JSON
      }

      if (!res.ok) {
        const msg = json?.message ?? text ?? res.statusText ?? 'Error al restablecer contraseña';
        throw new Error(msg);
      }

      setMessage('Contraseña restablecida correctamente. Ya puedes iniciar sesión.');
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <h1 className="text-2xl font-bold mb-2">Restablecer contraseña</h1>
      <p className="text-sm text-muted-foreground mb-6">RUT: {rut}</p>
      {message ? (
        <div className="rounded-md bg-green-50 border border-green-200 p-4">{message}</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
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
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center pr-1"
              >
                {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Procesando...' : 'Restablecer contraseña'}
          </button>
        </form>
      )}
    </div>
  );
}
