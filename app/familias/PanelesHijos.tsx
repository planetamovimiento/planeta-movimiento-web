'use client'

import { useState } from 'react'
import { Avatar, BadgeEstadoGeneral, CirculosMeses } from './ui'
import type { AlumnoFamilia } from '@/lib/familias/tipos'

export default function PanelesHijos({ alumnos }: { alumnos: AlumnoFamilia[] }) {
  // Con un solo hijo, se abre directamente.
  const [abierto, setAbierto] = useState<string | null>(alumnos.length === 1 ? alumnos[0].id : null)

  return (
    <div className="space-y-4">
      {alumnos.map(a => {
        const open = abierto === a.id
        return (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Cabecera del panel (clic para desplegar) */}
            <button onClick={() => setAbierto(open ? null : a.id)}
              className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors">
              <Avatar foto={a.foto_url} nombre={a.nombre} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-pm-navy truncate">{a.nombre} {a.apellidos}</div>
                <div className="text-sm text-gray-500 truncate">{a.actividad || 'Club Deportivo Origen'}</div>
                {a.grupo && <div className="text-xs text-gray-400 truncate">{a.grupo}</div>}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-pm-red mr-1">{open ? 'Ocultar' : 'Ver más'}</span>
              <svg className={`w-5 h-5 text-pm-red shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Contenido desplegable */}
            {open && (
              <div className="border-t border-gray-100 p-4 sm:p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</span>
                  <BadgeEstadoGeneral estado={a.estado_general} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Dato label="Grupo" valor={a.grupo || '—'} />
                  <Dato label="Horario" valor={a.horario || '—'} />
                  <Dato label="Temporada" valor={a.temporada || '—'} />
                </div>

                <div>
                  <div className="font-black text-pm-navy text-sm mb-1">Temporada (Sep → Jun)</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Pagado / activo</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Pendiente</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Baja</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white border border-gray-300" /> Sin definir</span>
                  </div>
                  <CirculosMeses pagos={a.pagos} />
                </div>

                {a.observaciones_familia && (
                  <div className="bg-pm-red-light border border-pm-red/20 rounded-2xl p-4">
                    <div className="text-xs font-black text-pm-red uppercase tracking-wider mb-1.5">Información importante</div>
                    <p className="text-sm text-pm-navy leading-relaxed whitespace-pre-line">{a.observaciones_familia}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-pm-bg rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-pm-navy text-sm break-words">{valor}</div>
    </div>
  )
}
