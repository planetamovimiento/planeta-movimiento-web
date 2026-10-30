'use client'

import { useState } from 'react'

export type FilaAut = {
  id: string; fecha: string; menor: string; tutor: string; dni: string; relacion: string; email: string
  origen: 'portal' | 'enlace'; actividad: string
  web: boolean; redes: boolean; material: boolean; memorias: boolean; conformidad: boolean
}
export type Pendiente = { menor: string; familia: string; email: string }

const BASE = 'https://planetamovimiento.com/autorizacion'
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Marca({ si, label }: { si: boolean; label: string }) {
  return (
    <span title={`${label}: ${si ? 'autoriza' : 'no autoriza'}`}
      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${si ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600 line-through'}`}>
      {label}
    </span>
  )
}

export default function AutorizacionesClient({ filas, total, pendientes }: { filas: FilaAut[]; total: number; pendientes: Pendiente[] }) {
  const [q, setQ] = useState('')
  const [actividad, setActividad] = useState('')
  const [copiado, setCopiado] = useState(false)
  const enlace = actividad.trim() ? `${BASE}?actividad=${encodeURIComponent(actividad.trim())}` : BASE
  const visibles = q.trim() ? filas.filter(f => norm(`${f.menor} ${f.tutor} ${f.email} ${f.actividad}`).includes(norm(q.trim()))) : filas

  async function copiar() {
    try { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2000) } catch { /* sin portapapeles */ }
  }

  return (
    <div className="space-y-4">
      {/* Enlace para mandar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
        <div className="font-bold text-pm-navy text-sm">Enlace para mandar a las familias</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input value={actividad} onChange={e => setActividad(e.target.value)} placeholder="Actividad (opcional), p. ej. Campamento de Navidad"
            className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <code className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all">{enlace}</code>
          <button onClick={copiar} className="text-xs font-bold px-4 py-2 rounded-lg bg-pm-navy text-white">{copiado ? 'Copiado' : 'Copiar enlace'}</button>
        </div>
        <p className="text-xs text-gray-400">Las familias del Club también pueden firmarla desde su Portal de Familias.</p>
      </div>

      {/* Firmadas */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="font-bold text-pm-navy text-sm">
            Firmadas: {filas.length} {filas.length === 1 ? 'menor' : 'menores'}
            <span className="text-xs text-gray-400 font-normal"> · {total} firmas en total, contando cambios</span>
          </div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar menor, tutor, correo…" aria-label="Buscar"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        {visibles.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Todavía no hay autorizaciones firmadas{q ? ' con esa búsqueda' : ''}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3">Menor</th><th className="py-2 pr-3">Autoriza</th><th className="py-2 pr-3">Firmado por</th>
                  <th className="py-2 pr-3">Fecha</th><th className="py-2">Origen</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 align-top">
                    <td className="py-2 pr-3 font-semibold text-pm-navy">{f.menor}{f.conformidad && <div className="text-[11px] font-normal text-gray-400">Con conformidad del menor</div>}</td>
                    <td className="py-2 pr-3"><div className="flex flex-wrap gap-1">
                      <Marca si={f.web} label="Web" /><Marca si={f.redes} label="Redes" /><Marca si={f.material} label="Material" /><Marca si={f.memorias} label="Memorias" />
                    </div></td>
                    <td className="py-2 pr-3 text-xs text-gray-600">{f.tutor} ({f.relacion})<br />{f.dni} · {f.email}</td>
                    <td className="py-2 pr-3 text-xs text-gray-600 whitespace-nowrap">{new Date(f.fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="py-2 text-xs text-gray-600">{f.origen === 'portal' ? 'Portal de Familias' : 'Enlace'}{f.actividad && <div className="text-gray-400">{f.actividad}</div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pendientes del portal */}
      {pendientes.length > 0 && (
        <details className="bg-white rounded-xl border border-gray-100 p-4">
          <summary className="font-bold text-pm-navy text-sm cursor-pointer">Sin firmar en el Portal de Familias: {pendientes.length}</summary>
          <ul className="mt-3 text-sm divide-y divide-gray-50">
            {pendientes.map(p => (
              <li key={`${p.email}|${p.menor}`} className="py-1.5 flex flex-wrap justify-between gap-2">
                <span className="text-pm-navy">{p.menor}</span>
                <span className="text-xs text-gray-400">{p.familia || p.email} · {p.email}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
