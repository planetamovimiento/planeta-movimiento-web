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

                {a.whatsapp_url && (
                  <a href={a.whatsapp_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Unirse al grupo de WhatsApp
                  </a>
                )}

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
