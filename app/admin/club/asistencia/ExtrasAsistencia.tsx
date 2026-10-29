'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ExtraAsistencia } from '@/lib/club/asistencia-extras'
import { anadirExtraAsistencia, quitarExtraAsistencia } from './actions'

// Panel (no se imprime) para añadir a mano niños que no están en el grupo en el
// CRM: vienen de otro grupo, recuperan una clase… Salen al final de la hoja.
export default function ExtrasAsistencia({ actividad, grupo, temporada, desde, hasta, extras }: {
  actividad: string; grupo: string; temporada: string; desde: string; hasta: string
  extras: ExtraAsistencia[]
}) {
  const router = useRouter()
  const [pendiente, startTransition] = useTransition()
  const [f, setF] = useState({ nombre: '', apellidos: '', nota: '', fecha: '' })
  const [error, setError] = useState('')

  if (!actividad || !grupo) return null

  function anadir(e: React.FormEvent) {
    e.preventDefault(); setError('')
    startTransition(async () => {
      const r = await anadirExtraAsistencia({ ...f, actividad, grupo, temporada })
      if (!r.ok) { setError(r.error); return }
      setF({ nombre: '', apellidos: '', nota: '', fecha: '' })
      router.refresh()
    })
  }

  function quitar(id: string) {
    startTransition(async () => {
      const r = await quitarExtraAsistencia(id)
      if (!r.ok) setError(r.error)
      router.refresh()
    })
  }

  const input = 'border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-pm-navy'

  return (
    <div className="no-print pm-no-print max-w-5xl mx-auto px-4 mb-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="font-bold text-pm-navy text-sm">Añadir alumno a esta lista</div>
        <p className="text-xs text-gray-500 mb-3">
          Para excepciones: niños de otro grupo o que vienen un día. No se inscriben en el CRM; solo salen al final de la lista de {grupo}.
          Si pones fecha, solo aparece en las listas que incluyan ese día.
        </p>
        <form onSubmit={anadir} className="flex flex-wrap gap-2 items-end">
          <label className="text-xs text-gray-500 flex flex-col gap-1">Nombre
            <input required value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} className={input} />
          </label>
          <label className="text-xs text-gray-500 flex flex-col gap-1">Apellidos
            <input value={f.apellidos} onChange={e => setF({ ...f, apellidos: e.target.value })} className={input} />
          </label>
          <label className="text-xs text-gray-500 flex flex-col gap-1">Nota (opcional)
            <input value={f.nota} onChange={e => setF({ ...f, nota: e.target.value })} placeholder="Viene de Medio 1" className={input} />
          </label>
          <label className="text-xs text-gray-500 flex flex-col gap-1">Solo el día (opcional)
            <input type="date" value={f.fecha} min={desde || undefined} max={hasta || undefined}
              onChange={e => setF({ ...f, fecha: e.target.value })} className={input} />
          </label>
          <button type="submit" disabled={pendiente}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-pm-navy text-white disabled:opacity-50">
            {pendiente ? 'Guardando…' : 'Añadir a la lista'}
          </button>
        </form>
        {error && <p role="alert" className="text-xs text-red-600 mt-2">{error}</p>}

        {extras.length > 0 && (
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {extras.map(x => (
              <li key={x.id} className="flex items-center justify-between gap-3 py-1.5">
                <span className="text-pm-navy">
                  <span className="font-semibold">{x.apellidos}</span>{x.apellidos ? ', ' : ''}{x.nombre}
                  <span className="text-xs text-gray-400">
                    {x.fecha ? ` · solo el ${x.fecha.split('-').reverse().join('/')}` : ' · todas las listas'}{x.nota ? ` · ${x.nota}` : ''}
                  </span>
                </span>
                <button type="button" onClick={() => quitar(x.id)} disabled={pendiente}
                  className="text-xs text-gray-400 hover:text-red-600" aria-label={`Quitar a ${x.nombre} de la lista`}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
