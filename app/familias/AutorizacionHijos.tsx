'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormAutorizacion from '@/components/autorizaciones/FormAutorizacion'
import { CANALES, type DatosFirma } from '@/lib/autorizaciones/documento'
import { firmarAutorizacionHijo } from './autorizacion-actions'

export type EstadoAutorizacionHijo = {
  id: string
  nombre: string
  /** Última firma, o null si aún no hay. */
  firmada: null | { fecha: string; previa: Partial<DatosFirma> }
}

// Bloque del portal: estado de la autorización de imagen de cada hijo y
// formulario para firmarla (o cambiarla) sin imprimir nada.
export default function AutorizacionHijos({ hijos, tutorNombre }: { hijos: EstadoAutorizacionHijo[]; tutorNombre: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState<string | null>(null)
  const pendientes = hijos.filter(h => !h.firmada).length

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5" aria-labelledby="aut-img">
      <h2 id="aut-img" className="font-black text-pm-navy">Autorización de fotos y vídeos</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        {pendientes
          ? 'Indícanos dónde podemos usar las fotos y vídeos de las actividades. Se firma aquí mismo, en un minuto, sin imprimir nada.'
          : 'Ya tenemos tu autorización. Puedes cambiarla o retirarla cuando quieras.'}
      </p>

      <ul className="space-y-3">
        {hijos.map(h => {
          const p = h.firmada?.previa
          const si = p?.canales ? CANALES.filter(c => p.canales?.[c.id]).map(c => c.corto) : []
          const open = abierto === h.id
          return (
            <li key={h.id} className="rounded-xl border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-pm-navy text-sm">{h.nombre}</div>
                  {h.firmada ? (
                    <div className="text-xs text-gray-500">
                      Firmada el {new Date(h.firmada.fecha).toLocaleDateString('es-ES')} · {si.length ? `Autoriza: ${si.join(', ')}` : 'No autoriza ningún uso'}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-amber-600">Pendiente de firmar</div>
                  )}
                </div>
                <button type="button" onClick={() => setAbierto(open ? null : h.id)} aria-expanded={open}
                  className={`text-xs font-bold px-4 py-2 rounded-lg ${h.firmada ? 'border border-gray-300 text-gray-600' : 'bg-pm-red text-white'}`}>
                  {open ? 'Cerrar' : h.firmada ? 'Cambiar' : 'Leer y firmar'}
                </button>
              </div>
              {open && (
                <div className="border-t border-gray-100 p-3 sm:p-4">
                  <FormAutorizacion
                    menoresFijos={[h.nombre]}
                    emailFijo="portal"
                    inicial={{ tutorNombre, ...p }}
                    onFirmar={e => firmarAutorizacionHijo(h.id, e.firma)}
                    onHecho={() => setTimeout(() => { setAbierto(null); router.refresh() }, 2500)}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
