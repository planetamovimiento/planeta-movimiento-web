'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/admin/auth/callback` },
    })
    setEnviando(false)
    if (error) { setError('No se pudo enviar el enlace. Revisa el email e inténtalo de nuevo.'); return }
    setEnviado(true)
  }

  return (
    <main className="min-h-screen bg-pm-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-pm-red/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Planeta Movimiento" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-white font-black text-2xl">Panel de administración</h1>
          <p className="text-white/50 text-sm mt-1">Acceso restringido · Solo personal autorizado</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {enviado ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <h2 className="font-black text-pm-navy text-lg mb-2">Revisa tu correo</h2>
              <p className="text-gray-500 text-sm">
                Hemos enviado un enlace de acceso a <strong className="text-pm-navy">{email}</strong>.
                Haz clic en él para entrar al panel.
              </p>
              <button onClick={() => { setEnviado(false); setEmail('') }} className="mt-5 text-pm-red text-sm underline">
                Usar otro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pm-navy mb-1.5">Correo electrónico autorizado</label>
                <input
                  required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pm-red"
                />
              </div>
              {error && <p className="text-pm-red text-xs">{error}</p>}
              <button type="submit" disabled={enviando}
                className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
                {enviando ? 'Enviando enlace...' : 'Enviar enlace de acceso'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Recibirás un enlace mágico. No necesitas contraseña.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Planeta Movimiento · Acceso seguro
        </p>
      </div>
    </main>
  )
}
