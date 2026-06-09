'use client'

import { useState, useTransition } from 'react'
import { añadirAdmin, cambiarRol, cambiarSecciones, eliminarAdmin } from './actions'
import type { AdminRole } from '@/lib/admin/auth'
import { SECCIONES_ASIGNABLES } from '@/lib/admin/secciones'

type Row = {
  id: string; email: string; nombre: string | null; role: AdminRole
  activo: boolean; secciones: string[] | null; created_at: string
}

const ROLES: { id: AdminRole; label: string; desc: string }[] = [
  { id: 'principal', label: 'Administrador principal', desc: 'Acceso total a todos los apartados. Puede gestionar administradores.' },
  { id: 'gestor', label: 'Gestor', desc: 'Ve y edita solo los apartados que marques abajo.' },
  { id: 'lectura', label: 'Solo lectura', desc: 'Ve los apartados que marques, pero no puede modificar nada.' },
]

const TODAS = SECCIONES_ASIGNABLES.map(s => s.id)
// Preselección sensata al añadir: todo menos lo económico (Pagos y Balance).
const PRESET = TODAS.filter(id => id !== 'pagos' && id !== 'balance')

export default function AdminsManager({ admins, miEmail }: { admins: Row[]; miEmail: string }) {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [role, setRole] = useState<AdminRole>('gestor')
  const [secs, setSecs] = useState<string[]>(PRESET)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const toggle = (id: string) => setSecs(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  function add() {
    setError('')
    startTransition(async () => {
      const r = await añadirAdmin(email, nombre, role, role === 'principal' ? [] : secs)
      if (!r.ok) setError(r.error || 'Error')
      else { setEmail(''); setNombre(''); setSecs(PRESET); setRole('gestor') }
    })
  }

  return (
    <div className="space-y-6">
      {/* Añadir */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-pm-navy mb-4">Añadir administrador o gestor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email autorizado *"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (opcional)"
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)}
              className={`text-left border-2 rounded-xl p-3 transition-colors ${role === r.id ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
              <div className={`font-bold text-sm ${role === r.id ? 'text-pm-red' : 'text-pm-navy'}`}>{r.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Selección de apartados (solo gestor / lectura) */}
        {role !== 'principal' && (
          <div className="bg-pm-bg border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-pm-navy uppercase tracking-wider">Apartados que podrá ver</p>
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={() => setSecs(TODAS)} className="text-pm-red font-semibold hover:underline">Todos</button>
                <span className="text-gray-300">·</span>
                <button type="button" onClick={() => setSecs([])} className="text-gray-500 font-semibold hover:underline">Ninguno</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SECCIONES_ASIGNABLES.map(s => (
                <label key={s.id} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${secs.includes(s.id) ? 'border-pm-red bg-pm-red-light text-pm-navy' : 'border-gray-200 text-gray-600 hover:border-pm-red/40'}`}>
                  <input type="checkbox" checked={secs.includes(s.id)} onChange={() => toggle(s.id)} className="accent-pm-red" />
                  <span>{s.icon} {s.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">El Dashboard siempre es visible. «Administradores» es exclusivo del principal.</p>
          </div>
        )}

        {error && <p className="text-pm-red text-sm mb-3">{error}</p>}
        <button onClick={add} disabled={!email || pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          {pending ? 'Guardando...' : '+ Añadir acceso'}
        </button>
        <p className="text-xs text-gray-400 mt-2">El usuario podrá entrar con enlace mágico usando ese email.</p>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-black text-pm-navy">{admins.length} con acceso</div>
        <div className="divide-y divide-gray-50">
          {admins.map(a => (
            <AdminRow key={a.id} row={a} miEmail={miEmail} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminRow({ row, miEmail }: { row: Row; miEmail: string }) {
  const [pending, startTransition] = useTransition()
  const [role, setRole] = useState<AdminRole>(row.role)
  const [abierto, setAbierto] = useState(false)
  const [secs, setSecs] = useState<string[]>(row.secciones ?? TODAS)
  const [guardado, setGuardado] = useState(false)
  const esYo = row.email === miEmail

  const toggle = (id: string) => { setGuardado(false); setSecs(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }

  function onRol(nuevo: AdminRole) {
    setRole(nuevo)
    startTransition(() => cambiarRol(row.id, row.email, nuevo).then(() => {}))
  }
  function guardarSecs() {
    startTransition(() => cambiarSecciones(row.id, row.email, secs).then(() => setGuardado(true)))
  }

  const resumen = role === 'principal'
    ? 'Acceso total'
    : `${secs.length} de ${TODAS.length} apartados`

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-pm-navy rounded-full flex items-center justify-center text-white font-black shrink-0">
          {(row.nombre || row.email)[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-pm-navy text-sm truncate">
            {row.nombre || row.email.split('@')[0]} {esYo && <span className="text-xs text-gray-400">(tú)</span>}
          </div>
          <div className="text-xs text-gray-400 truncate">{row.email} · {resumen}</div>
        </div>

        {role !== 'principal' && !esYo && (
          <button onClick={() => setAbierto(o => !o)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${abierto ? 'border-pm-red text-pm-red bg-pm-red-light' : 'border-gray-200 text-gray-500 hover:border-pm-red/40'}`}>
            Apartados
          </button>
        )}

        <select
          value={role} disabled={esYo || pending}
          onChange={e => onRol(e.target.value as AdminRole)}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white disabled:opacity-50 focus:outline-none focus:border-pm-red">
          <option value="principal">Principal</option>
          <option value="gestor">Gestor</option>
          <option value="lectura">Solo lectura</option>
        </select>

        {!esYo && (
          <button disabled={pending}
            onClick={() => { if (confirm(`¿Eliminar acceso de ${row.email}?`)) startTransition(() => eliminarAdmin(row.id, row.email).then(() => {})) }}
            className="text-gray-400 hover:text-pm-red text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        )}
      </div>

      {/* Editor de apartados (gestor / lectura) */}
      {abierto && role !== 'principal' && !esYo && (
        <div className="mt-3 bg-pm-bg border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-pm-navy uppercase tracking-wider">Apartados visibles para {row.nombre || row.email.split('@')[0]}</p>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => { setGuardado(false); setSecs(TODAS) }} className="text-pm-red font-semibold hover:underline">Todos</button>
              <span className="text-gray-300">·</span>
              <button type="button" onClick={() => { setGuardado(false); setSecs([]) }} className="text-gray-500 font-semibold hover:underline">Ninguno</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SECCIONES_ASIGNABLES.map(s => (
              <label key={s.id} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${secs.includes(s.id) ? 'border-pm-red bg-pm-red-light text-pm-navy' : 'border-gray-200 text-gray-600 hover:border-pm-red/40'}`}>
                <input type="checkbox" checked={secs.includes(s.id)} onChange={() => toggle(s.id)} className="accent-pm-red" />
                <span>{s.icon} {s.label}</span>
              </label>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={guardarSecs} disabled={pending}
              className="bg-pm-navy hover:bg-pm-navy-md disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg text-xs">
              {pending ? 'Guardando...' : 'Guardar apartados'}
            </button>
            {guardado && <span className="text-green-600 text-xs font-semibold">✓ Guardado</span>}
          </div>
        </div>
      )}
    </div>
  )
}
