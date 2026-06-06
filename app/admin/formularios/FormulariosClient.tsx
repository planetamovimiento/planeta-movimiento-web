'use client'

import { useState, useMemo, useTransition } from 'react'
import { EstadoBadge, EmptyState } from '@/components/admin/ui'
import { cambiarEstadoFormulario } from './actions'
import { waCliente } from '@/lib/whatsapp'

type Row = {
  id: string; tipo: string | null; nombre: string | null; email: string | null
  telefono: string | null; asunto: string | null; mensaje: string | null
  datos: Record<string, unknown> | null; estado: string; created_at: string
}

const ESTADOS = ['nueva', 'leida', 'respondida', 'seguimiento', 'cerrada']
const TIPOS_LABEL: Record<string, string> = {
  informacion: 'Información', presupuesto: 'Presupuesto', colchonetas: 'Colchonetas',
  contacto: 'Contacto', inscripcion: 'Inscripción', inscripcion_club: 'Inscripción Club',
  colegio: 'Colegio', extraescolar: 'Extraescolar', ayuntamiento: 'Ayuntamiento', empresa: 'Empresa',
  'piea-residencias': 'PIEA · Residencias', 'piea-talleres': 'PIEA · Talleres mayores',
  licitaciones: 'Licitaciones / contratos',
}

/** Lee el nombre de la actividad de una solicitud (las inscripciones lo guardan en datos.actividad). */
function actividadDe(r: Row): string {
  const a = r.datos?.actividad
  return typeof a === 'string' ? a.trim() : ''
}

/** Mensaje de WhatsApp predeterminado para contactar con quien envió la solicitud. */
function mensajeWhatsApp(r: Row): string {
  const nombre = (r.nombre || '').trim().split(/\s+/)[0]
  const saludo = nombre ? `Hola ${nombre} 👋` : 'Hola 👋'
  const entidad = (r.tipo || '').includes('club')
    ? 'el Club Deportivo Origen (Planeta Movimiento)'
    : 'Planeta Movimiento'
  const actividad = actividadDe(r)
  if (actividad) {
    return `${saludo}, te escribimos desde ${entidad} sobre tu solicitud de inscripción en ${actividad}. ¿Te viene bien que hablemos para confirmar la plaza y resolver tus dudas? ¡Gracias!`
  }
  return `${saludo}, te escribimos desde ${entidad} sobre ${r.asunto || 'tu solicitud'}. ¿En qué podemos ayudarte? ¡Gracias!`
}

export default function FormulariosClient({ rows, puedeEditar }: { rows: Row[]; puedeEditar: boolean }) {
  const [fTipo, setFTipo] = useState('')
  const [fEstado, setFEstado] = useState('')
  const [fActividad, setFActividad] = useState('')
  const [detalle, setDetalle] = useState<Row | null>(null)
  const [pending, startTransition] = useTransition()

  const tipos = useMemo(() => Array.from(new Set(rows.map(r => r.tipo).filter(Boolean))) as string[], [rows])
  const actividades = useMemo(
    () => Array.from(new Set(rows.map(actividadDe).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
    [rows]
  )
  const filtradas = useMemo(() => rows.filter(r =>
    (!fTipo || r.tipo === fTipo) &&
    (!fEstado || r.estado === fEstado) &&
    (!fActividad || actividadDe(r) === fActividad)
  ), [rows, fTipo, fEstado, fActividad])

  const hayFiltros = !!(fTipo || fEstado || fActividad)
  function limpiar() { setFTipo(''); setFEstado(''); setFActividad('') }

  function setEstado(row: Row, estado: string) {
    startTransition(async () => { await cambiarEstadoFormulario(row.id, estado); setDetalle(d => d ? { ...d, estado } : d) })
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <select value={fTipo} onChange={e => setFTipo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Todos los tipos</option>
          {tipos.map(t => <option key={t} value={t}>{TIPOS_LABEL[t] || t}</option>)}
        </select>
        {actividades.length > 0 && (
          <select value={fActividad} onChange={e => setFActividad(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red max-w-[16rem]">
            <option value="">Todas las actividades</option>
            {actividades.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <select value={fEstado} onChange={e => setFEstado(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-pm-red">
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hayFiltros && (
          <button onClick={limpiar} className="text-xs font-semibold text-pm-red hover:underline px-2 py-1">
            Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 font-semibold">
          {filtradas.length} {filtradas.length === 1 ? 'solicitud' : 'solicitudes'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtradas.length === 0 ? (
          <EmptyState icon="✉️" titulo="Sin solicitudes" desc="Los formularios enviados desde la web aparecerán aquí." />
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtradas.map(r => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => setDetalle(r)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-pm-navy text-sm">{r.nombre || 'Sin nombre'}</span>
                    <span className="text-xs bg-pm-bg text-gray-500 px-2 py-0.5 rounded-full">{TIPOS_LABEL[r.tipo || ''] || r.tipo}</span>
                    {actividadDe(r) && (
                      <span className="text-xs bg-pm-red/10 text-pm-red font-semibold px-2 py-0.5 rounded-full">{actividadDe(r)}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{r.asunto || r.mensaje || r.email}</div>
                </div>
                <span className="text-xs text-gray-400 hidden sm:block">{r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : ''}</span>
                <EstadoBadge estado={r.estado} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
            <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0">
              <div className="font-black">{detalle.nombre || 'Solicitud'}</div>
              <button onClick={() => setDetalle(null)} className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="space-y-2">
                {[['Tipo', TIPOS_LABEL[detalle.tipo || ''] || detalle.tipo], ['Email', detalle.email], ['Teléfono', detalle.telefono], ['Asunto', detalle.asunto]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4 border-b border-gray-50 pb-1.5">
                    <span className="text-gray-400">{k}</span><span className="text-pm-navy font-semibold text-right">{v || '—'}</span>
                  </div>
                ))}
              </div>
              {detalle.mensaje && <div className="bg-pm-bg rounded-xl p-3"><div className="text-xs font-bold text-gray-400 uppercase mb-1">Mensaje</div><p className="text-gray-600 whitespace-pre-wrap">{detalle.mensaje}</p></div>}
              {detalle.datos && Object.keys(detalle.datos).length > 0 && (
                <div className="bg-pm-bg rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-400 uppercase mb-1">Datos adicionales</div>
                  {Object.entries(detalle.datos).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-xs py-0.5"><span className="text-gray-400">{k}</span><span className="text-pm-navy text-right">{String(v)}</span></div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 flex-wrap pt-2">
                {detalle.email && <a href={`mailto:${detalle.email}`} className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-xl">Responder por email</a>}
                {detalle.telefono && <a href={waCliente(detalle.telefono, mensajeWhatsApp(detalle))} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl">WhatsApp</a>}
              </div>

              {puedeEditar && (
                <div>
                  <label className="block text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Estado</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ESTADOS.map(s => (
                      <button key={s} disabled={pending} onClick={() => setEstado(detalle, s)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${detalle.estado === s ? 'bg-pm-red border-pm-red text-white' : 'border-gray-200 text-gray-600 hover:border-pm-red'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
