'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginFamilia, recuperarNumeroSocio } from '../actions'

export default function FamiliasLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [numero, setNumero] = useState('')
  const [hp, setHp] = useState('')
  const [renderedAt] = useState(() => Date.now())
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [modo, setModo] = useState<'login' | 'recuperar'>('login')
  const [recEnviado, setRecEnviado] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true); setError('')
    let r: { ok: boolean; error?: string }
    try {
      r = await loginFamilia({ email, numeroSocio: numero, seguridad: { hp, renderedAt } })
    } catch {
      r = { ok: false, error: 'No se ha podido conectar. Inténtalo de nuevo.' }
    }
    if (!r.ok) { setCargando(false); setError(r.error || 'No se han podido validar los datos de acceso.'); return }
    router.push('/familias')
    router.refresh()
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    try { await recuperarNumeroSocio(email) } catch { /* respuesta genérica */ }
    setCargando(false); setRecEnviado(true)
  }

  return (
    <main className="min-h-screen bg-pm-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-pm-red/20 blur-[120px]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-origen.png" alt="Club Deportivo Origen" className="h-16 w-auto mx-auto mb-4 bg-white rounded-2xl p-2" />
          <h1 className="text-white font-black text-2xl">Portal de Familias</h1>
          <p className="text-white/50 text-sm mt-1">Club Deportivo Origen · Acceso para socios</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {modo === 'recuperar' ? (
            recEnviado ? (
              <div className="text-center py-6">
                <h2 className="font-black text-pm-navy text-lg mb-2">Revisa tu correo</h2>
                <p className="text-gray-500 text-sm">Si ese correo corresponde a un socio activo, te hemos enviado tu número de socio.</p>
                <button onClick={() => { setModo('login'); setRecEnviado(false) }} className="mt-5 text-pm-red text-sm underline">Volver</button>
              </div>
            ) : (
              <form onSubmit={handleRecuperar} className="space-y-4">
                <p className="text-gray-500 text-sm">Introduce tu correo y, si eres socio activo, te enviaremos tu número de socio por email.</p>
                <div>
                  <label className="block text-xs font-bold text-pm-navy mb-1.5">Correo electrónico</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pm-red" />
                </div>
                <button type="submit" disabled={cargando} className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
                  {cargando ? 'Enviando…' : 'Enviar instrucciones'}
                </button>
                <button type="button" onClick={() => setModo('login')} className="w-full text-center text-gray-400 text-sm">Volver al acceso</button>
              </form>
            )
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
              <p className="text-gray-500 text-sm">Acceso exclusivo para familias socias del Club. Introduce tu correo y tu número de socio.</p>
              <div>
                <label className="block text-xs font-bold text-pm-navy mb-1.5">Correo electrónico</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pm-red" />
              </div>
              <div>
                <label className="block text-xs font-bold text-pm-navy mb-1.5">Número de socio</label>
                <input required value={numero} onChange={e => setNumero(e.target.value)} placeholder="CDO-00231"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pm-red" />
              </div>
              {error && <p className="text-pm-red text-xs" role="alert">{error}</p>}
              <button type="submit" disabled={cargando} className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
                {cargando ? 'Accediendo…' : 'Acceder'}
              </button>
              <button type="button" onClick={() => { setModo('recuperar'); setError('') }} className="w-full text-center text-gray-400 text-sm hover:text-pm-red">¿No recuerdas tu número de socio?</button>
            </form>
          )}
        </div>
        <p className="text-center text-white/30 text-xs mt-6">¿Aún no eres socio? Hazte socio desde la página del Club.</p>
      </div>
    </main>
  )
}
