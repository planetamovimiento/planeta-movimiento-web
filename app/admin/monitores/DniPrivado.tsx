'use client'

import { useRef, useState, useTransition } from 'react'
import { subirDniMonitor, urlDniMonitor, eliminarDniMonitor, type CaraDni } from './actions'

/**
 * Anverso o reverso del DNI de un monitor.
 *
 * El archivo vive en un bucket PRIVADO: aquí solo se guarda la ruta. Para verlo
 * o descargarlo se pide al servidor un enlace firmado que caduca en 60 segundos,
 * así que nunca queda una URL pública del documento circulando por la web.
 */
export function DniPrivado({ monitorId, cara, tienePath, etiqueta, soloLectura }: {
  monitorId: string
  cara: CaraDni
  tienePath: boolean
  etiqueta: string
  soloLectura: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [guardado, setGuardado] = useState(tienePath)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  function subir(file: File) {
    setError('')
    const fd = new FormData()
    fd.append('monitorId', monitorId)
    fd.append('cara', cara)
    fd.append('file', file)
    start(async () => {
      const r = await subirDniMonitor(fd)
      if (r.ok) setGuardado(true); else setError(r.error)
    })
  }

  function abrir(descargar: boolean) {
    setError('')
    start(async () => {
      const r = await urlDniMonitor(monitorId, cara, descargar)
      if (!r.ok) { setError(r.error); return }
      window.open(r.url, '_blank', 'noopener,noreferrer')
    })
  }

  function borrar() {
    if (!window.confirm(`¿Eliminar ${etiqueta.toLowerCase()} del DNI? Se borra el archivo definitivamente.`)) return
    setError('')
    start(async () => {
      const r = await eliminarDniMonitor(monitorId, cara)
      if (r.ok) setGuardado(false); else setError(r.error)
    })
  }

  return (
    <div className="border border-gray-200 rounded-xl p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{etiqueta}</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${guardado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {guardado ? 'Guardado' : 'Sin archivo'}
        </span>
      </div>

      {guardado ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => abrir(false)} disabled={pending} className="text-xs font-bold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-lg px-2.5 py-1.5 disabled:opacity-50">Ver</button>
          <button type="button" onClick={() => abrir(true)} disabled={pending} className="text-xs font-bold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-lg px-2.5 py-1.5 disabled:opacity-50">Descargar</button>
          {!soloLectura && <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="text-xs font-bold text-pm-red hover:underline px-1">Cambiar</button>}
          {!soloLectura && <button type="button" onClick={borrar} disabled={pending} className="text-xs font-bold text-gray-400 hover:text-red-600 px-1">Eliminar</button>}
        </div>
      ) : soloLectura ? (
        <p className="text-xs text-gray-400">No hay archivo subido.</p>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={pending}
          className="w-full border-2 border-dashed border-gray-300 hover:border-pm-red rounded-lg py-3 text-xs font-semibold text-gray-400 hover:text-pm-red disabled:opacity-50">
          {pending ? 'Subiendo…' : 'Subir imagen o PDF'}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) subir(f); e.target.value = '' }} />

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  )
}
