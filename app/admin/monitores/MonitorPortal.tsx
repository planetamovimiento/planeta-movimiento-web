'use client'

import { useState, useTransition } from 'react'
import { AdminHeader, Metric } from '@/components/admin/ui'
import { resumenHoras, fmtHoras } from '@/lib/monitores/constants'
import { ficharEntrada, ficharSalida } from './actions'
import Calendario from './Calendario'
import Recursos from './Recursos'
import type { Monitor, Actividad, Fichaje, Carpeta, Documento } from '@/lib/monitores/tipos'

const horaCorta = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
const fechaLarga = (s: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(s + 'T12:00:00'))

export default function MonitorPortal({ monitor, actividades, fichajes, abierto, carpetas, documentos }: {
  monitor: Monitor; actividades: Actividad[]; fichajes: Fichaje[]; abierto: Fichaje | null
  carpetas: Carpeta[]; documentos: Documento[]
}) {
  const [tab, setTab] = useState<'inicio' | 'calendario' | 'recursos'>('inicio')
  const [error, setError] = useState('')
  const [loading, start] = useTransition()

  const horas = resumenHoras(fichajes)
  const hoy = new Date().toISOString().slice(0, 10)
  const proximas = actividades.filter(a => a.fecha >= hoy).slice(0, 6)

  function fichar(entrar: boolean) {
    setError('')
    start(async () => { const r = await (entrar ? ficharEntrada() : ficharSalida()); if (!r.ok) setError(r.error) })
  }

  return (
    <>
      <AdminHeader titulo={`Hola, ${monitor.nombre || 'monitor'} 👋`} subtitulo="Tu portal · horario, fichaje, horas y recursos" />
      <div className="p-4 lg:p-6 space-y-4">
        {/* Pestañas */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {([['inicio', 'Inicio'], ['calendario', 'Mi calendario'], ['recursos', 'Recursos']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === id ? 'bg-pm-red text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>

        {tab === 'inicio' && (
          <div className="space-y-4">
            {/* Fichaje */}
            <div className={`rounded-2xl p-5 border shadow-sm flex flex-wrap items-center justify-between gap-4 ${abierto ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
              <div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Control horario</div>
                {abierto
                  ? <div className="text-pm-navy font-bold">🟢 Jornada abierta desde las <strong>{horaCorta(abierto.entrada)}</strong></div>
                  : <div className="text-gray-500 text-sm">No tienes ninguna jornada abierta.</div>}
              </div>
              {abierto
                ? <button onClick={() => fichar(false)} disabled={loading} className="bg-pm-navy hover:bg-pm-navy-md disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl">Salir</button>
                : <button onClick={() => fichar(true)} disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl">Entrar</button>}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Horas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric label="Horas hoy" valor={fmtHoras(horas.dia)} tono="navy" />
              <Metric label="Esta semana" valor={fmtHoras(horas.semana)} tono="green" />
              <Metric label="Este mes" valor={fmtHoras(horas.mes)} tono="amber" />
              <Metric label="Acumulado" valor={fmtHoras(horas.total)} tono="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Próximas actividades */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-pm-navy mb-3">Próximas actividades</h3>
                {proximas.length ? (
                  <div className="space-y-2">
                    {proximas.map(a => (
                      <div key={a.id} className="flex items-start gap-3 border-b border-gray-50 pb-2">
                        <div className="text-pm-red font-bold text-xs w-24 shrink-0 capitalize">{fechaLarga(a.fecha)}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-pm-navy">{a.actividad} {a.hora_inicio && <span className="text-gray-400 font-normal">· {a.hora_inicio}{a.hora_fin ? `–${a.hora_fin}` : ''}</span>}</div>
                          <div className="text-xs text-gray-500">{[a.lugar, a.grupo].filter(Boolean).join(' · ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm py-6 text-center">No tienes actividades próximas asignadas.</p>}
              </div>

              {/* Últimas jornadas */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-black text-pm-navy mb-3">Últimas jornadas</h3>
                {fichajes.length ? (
                  <div className="space-y-1.5">
                    {fichajes.slice(0, 6).map(f => (
                      <div key={f.id} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                        <span className="text-gray-600 capitalize">{fechaLarga(f.fecha)}</span>
                        <span className="text-pm-navy font-semibold">{horaCorta(f.entrada)}{f.salida ? ` – ${horaCorta(f.salida)}` : ' · abierta'}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm py-6 text-center">Aún no has fichado ninguna jornada.</p>}
              </div>
            </div>

            {/* Acceso rápido recursos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-pm-navy">Recursos</h3>
                <button onClick={() => setTab('recursos')} className="text-pm-red text-sm font-bold hover:underline">Ver todo →</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {carpetas.slice(0, 10).map(c => (
                  <button key={c.id} onClick={() => setTab('recursos')} className="bg-pm-bg border border-gray-200 rounded-xl px-3 py-2 text-sm text-pm-navy hover:border-pm-red">
                    📁 {c.nombre} <span className="text-gray-400 text-xs">{c.numDocs}</span>
                  </button>
                ))}
                {carpetas.length === 0 && <p className="text-gray-400 text-sm">Aún no hay recursos publicados.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'calendario' && <Calendario actividades={actividades} />}
        {tab === 'recursos' && <Recursos carpetas={carpetas} documentos={documentos} admin={false} />}
      </div>
    </>
  )
}
