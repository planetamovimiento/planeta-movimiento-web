'use client'

import { useState, useMemo, useTransition } from 'react'
import { Metric } from '@/components/admin/ui'
import { editarCliente, eliminarCliente } from './actions'
import type { Cliente } from '@/lib/clientes/data'

const ORIGEN: Record<string, { label: string; badge: string }> = {
  club: { label: 'Club', badge: 'bg-pm-red-light text-pm-red' },
  reserva: { label: 'Reserva', badge: 'bg-blue-100 text-blue-700' },
  form: { label: 'Solicitud', badge: 'bg-gray-100 text-gray-600' },
}
const fechaCorta = (iso: string) => { const d = new Date(iso); return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES') }

export default function ClientesClient({ clientes, puedeEditar }: { clientes: Cliente[]; puedeEditar: boolean }) {
  const [lista, setLista] = useState<Cliente[]>(clientes)
  const [q, setQ] = useState('')
  const [fServicio, setFServicio] = useState('')
  const [fOrigen, setFOrigen] = useState('')
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [, startTransition] = useTransition()
  const [error, setError] = useState('')

  const key = (c: Cliente) => `${c.origen}|${c.id}`

  const servicios = useMemo(() => Array.from(new Set(lista.map(c => c.servicio).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')), [lista])
  const porServicio = useMemo(() => {
    const m = new Map<string, number>()
    lista.forEach(c => m.set(c.servicio || '—', (m.get(c.servicio || '—') || 0) + 1))
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1])
  }, [lista])

  const conteoOrigen = useMemo(() => ({
    club: lista.filter(c => c.origen === 'club').length,
    reserva: lista.filter(c => c.origen === 'reserva').length,
    form: lista.filter(c => c.origen === 'form').length,
  }), [lista])

  const filtradas = useMemo(() => lista.filter(c => {
    if (q.trim()) { const t = q.trim().toLowerCase(); if (!`${c.participante} ${c.tutor} ${c.email} ${c.telefono} ${c.servicio}`.toLowerCase().includes(t)) return false }
    if (fServicio && c.servicio !== fServicio) return false
    if (fOrigen && c.origen !== fOrigen) return false
    return true
  }), [lista, q, fServicio, fOrigen])

  const hayFiltros = !!(q || fServicio || fOrigen)
  const limpiar = () => { setQ(''); setFServicio(''); setFOrigen('') }

  function guardar(patch: { participante: string; tutor: string; email: string; telefono: string }) {
    if (!editando) return
    const c = editando
    setLista(prev => prev.map(x => (key(x) === key(c) ? { ...x, ...patch } : x)))
    setEditando(null)
    startTransition(async () => { const r = await editarCliente(c.origen, c.id, patch); if (!r.ok) setError(r.error || 'No se pudo guardar') })
  }

  function eliminar(c: Cliente) {
    if (!confirm(`¿Eliminar a «${c.participante}»? Esta acción no se puede deshacer.`)) return
    setLista(prev => prev.filter(x => key(x) !== key(c)))
    startTransition(async () => { const r = await eliminarCliente(c.origen, c.id); if (!r.ok) setError(r.error || 'No se pudo eliminar') })
  }

  function exportarCSV() {
    const cols = ['Participante', 'Tutor', 'Email', 'Teléfono', 'Servicio', 'Origen', 'Alta']
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const filas = filtradas.map(c => [c.participante, c.tutor, c.email, c.telefono, c.servicio, ORIGEN[c.origen]?.label, fechaCorta(c.fecha)].map(esc).join(';'))
    const csv = '﻿' + [cols.map(esc).join(';'), ...filas].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex justify-between"><span>{error}</span><button onClick={() => setError('')} className="font-bold">✕</button></div>}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Clientes totales" valor={lista.length} tono="navy" />
        <Metric label="Inscripciones Club" valor={conteoOrigen.club} tono="red" />
        <Metric label="Reservas" valor={conteoOrigen.reserva} tono="green" />
        <Metric label="Solicitudes" valor={conteoOrigen.form} tono="amber" />
      </div>

      {/* Clientes por servicio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Clientes por servicio</div>
        <div className="flex flex-wrap gap-2">
          {porServicio.map(([s, n]) => {
            const activo = fServicio === s
            return (
              <button key={s} onClick={() => setFServicio(activo ? '' : s)}
                className={`text-xs rounded-full border px-3 py-1.5 transition-colors ${activo ? 'bg-pm-red border-pm-red text-white' : 'bg-white border-gray-200 text-pm-navy hover:border-pm-red'}`}>
                <span className="font-semibold">{s}</span>
                <span className={`ml-1.5 font-black ${activo ? '' : 'text-pm-red'}`}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2.5">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, tutor, email o teléfono…"
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm flex-1 min-w-[220px] focus:outline-none focus:border-pm-red" />
        <select value={fServicio} onChange={e => setFServicio(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red max-w-[16rem]">
          <option value="">Todos los servicios</option>
          {servicios.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={fOrigen} onChange={e => setFOrigen(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Cualquier origen</option>
          <option value="club">Club</option>
          <option value="reserva">Reserva</option>
          <option value="form">Solicitud</option>
        </select>
        {hayFiltros && <button onClick={limpiar} className="text-xs font-semibold text-pm-red hover:underline px-2 py-1">Limpiar</button>}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">{filtradas.length} {filtradas.length === 1 ? 'cliente' : 'clientes'}</span>
          <button onClick={exportarCSV} className="text-sm font-bold text-white bg-pm-navy hover:bg-pm-navy-md rounded-xl px-3 py-2 transition-colors">⬇ CSV</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtradas.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-3">👥</div><p className="font-bold text-pm-navy">Sin clientes</p><p className="text-gray-400 text-sm mt-1">No hay clientes que coincidan con los filtros.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pm-bg text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left font-bold px-4 py-3">Participante</th>
                  <th className="text-left font-bold px-3 py-3">Tutor</th>
                  <th className="text-left font-bold px-3 py-3">Email</th>
                  <th className="text-left font-bold px-3 py-3">Teléfono</th>
                  <th className="text-left font-bold px-3 py-3">Servicio</th>
                  <th className="text-left font-bold px-3 py-3">Origen</th>
                  <th className="text-left font-bold px-3 py-3">Alta</th>
                  {puedeEditar && <th className="text-right font-bold px-4 py-3">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtradas.map(c => (
                  <tr key={key(c)} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-pm-navy whitespace-nowrap">{c.participante}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{c.tutor || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-500 max-w-[200px] truncate">{c.email || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{c.telefono || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{c.servicio || '—'}</td>
                    <td className="px-3 py-2.5"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ORIGEN[c.origen]?.badge}`}>{ORIGEN[c.origen]?.label}</span></td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap">{fechaCorta(c.fecha)}</td>
                    {puedeEditar && (
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button onClick={() => setEditando(c)} className="text-pm-navy font-bold text-xs hover:underline mr-3">Editar</button>
                        <button onClick={() => eliminar(c)} className="text-red-500 font-bold text-xs hover:underline">Eliminar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editando && <ModalEditar cliente={editando} onClose={() => setEditando(null)} onGuardar={guardar} />}
    </div>
  )
}

function ModalEditar({ cliente, onClose, onGuardar }: { cliente: Cliente; onClose: () => void; onGuardar: (p: { participante: string; tutor: string; email: string; telefono: string }) => void }) {
  const [participante, setParticipante] = useState(cliente.participante)
  const [tutor, setTutor] = useState(cliente.tutor)
  const [email, setEmail] = useState(cliente.email)
  const [telefono, setTelefono] = useState(cliente.telefono)
  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="font-black">Editar cliente</div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className={label}>Participante / Nombre</label><input value={participante} onChange={e => setParticipante(e.target.value)} className={input} /></div>
          <div><label className={label}>Tutor (si aplica)</label><input value={tutor} onChange={e => setTutor(e.target.value)} className={input} /></div>
          <div><label className={label}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={input} /></div>
          <div><label className={label}>Teléfono</label><input value={telefono} onChange={e => setTelefono(e.target.value)} className={input} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2.5">Cancelar</button>
            <button onClick={() => onGuardar({ participante, tutor, email, telefono })} className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-5 py-2.5 rounded-xl text-sm">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
