'use client'

import { useState, useTransition } from 'react'
import { añadirAdmin, cambiarRol, eliminarAdmin } from './actions'
import type { AdminRole } from '@/lib/admin/auth'

type Row = { id: string; email: string; nombre: string | null; role: AdminRole; activo: boolean; created_at: string }

const ROLES: { id: AdminRole; label: string; desc: string }[] = [
  { id: 'principal', label: 'Administrador principal', desc: 'Acceso total: usuarios, pagos, servicios, reservas y configuración.' },
  { id: 'gestor', label: 'Gestor', desc: 'Ve reservas, edita servicios, gestiona fechas/plazas y responde solicitudes.' },
  { id: 'lectura', label: 'Solo lectura', desc: 'Puede ver datos pero no modificar nada.' },
]

export default function AdminsManager({ admins, miEmail }: { admins: Row[]; miEmail: string }) {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [role, setRole] = useState<AdminRole>('gestor')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function add() {
    setError('')
    startTransition(async () => {
      const r = await añadirAdmin(email, nombre, role)
      if (!r.ok) setError(r.error || 'Error'); else { setEmail(''); setNombre('') }
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
  const esYo = row.email === miEmail
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-10 h-10 bg-pm-navy rounded-full flex items-center justify-center text-white font-black shrink-0">
        {(row.nombre || row.email)[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-pm-navy text-sm truncate">
          {row.nombre || row.email.split('@')[0]} {esYo && <span className="text-xs text-gray-400">(tú)</span>}
        </div>
        <div className="text-xs text-gray-400 truncate">{row.email}</div>
      </div>
      <select
        value={row.role} disabled={esYo || pending}
        onChange={e => startTransition(() => cambiarRol(row.id, row.email, e.target.value as AdminRole).then(() => {}))}
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
  )
}
