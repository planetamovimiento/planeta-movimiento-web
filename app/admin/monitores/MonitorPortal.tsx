'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader, Metric } from '@/components/admin/ui'
import { resumenHoras, resumenHorasActividades, horasPorMes, fmtHoras, badgeEstadoMonitor, labelEstadoMonitor } from '@/lib/monitores/constants'
import { descargarICS } from '@/lib/monitores/ics'
import { ficharEntrada, ficharSalida, guardarMiFicha } from './actions'
import { DniPrivado } from './DniPrivado'
import { SubirImagen } from '@/components/admin/SubirImagen'
import Calendario from './Calendario'
import Recursos from './Recursos'
import type { Monitor, Actividad, Fichaje, Carpeta, Documento, HojaHoras } from '@/lib/monitores/tipos'
import { HojasHorasMonitor } from './HojasHoras'
import MisPagos from './MisPagos'
import type { Sueldo } from '@/lib/sueldos/data'

const horaCorta = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
const fechaLarga = (s: string) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(s + 'T12:00:00'))

/** Cronómetro en vivo: tiempo transcurrido desde la entrada, refresca cada segundo. */
function Cronometro({ desde }: { desde: string }) {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ms = Math.max(0, ahora - new Date(desde).getTime())
  const s = Math.floor(ms / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return <span className="font-mono tabular-nums">{hh}:{mm}:{ss}</span>
}

export default function MonitorPortal({ monitor, actividades, fichajes, abierto, carpetas, documentos, hojasHoras, sueldos }: {
  monitor: Monitor; actividades: Actividad[]; fichajes: Fichaje[]; abierto: Fichaje | null
  carpetas: Carpeta[]; documentos: Documento[]; hojasHoras: HojaHoras[]; sueldos: Sueldo[]
}) {
  const [tab, setTab] = useState<'inicio' | 'calendario' | 'pagos' | 'horas' | 'recursos' | 'perfil'>('inicio')
  const [error, setError] = useState('')
  const [loading, start] = useTransition()
  const router = useRouter()

  const horas = resumenHoras(fichajes)
  const horasNom = resumenHorasActividades(actividades)
  const mesesNom = horasPorMes(actividades)
  const hoy = new Date().toISOString().slice(0, 10)
  const mesActual = hoy.slice(0, 7)
  const proximas = actividades.filter(a => a.fecha >= hoy).slice(0, 6)

  function fichar(entrar: boolean) {
    setError('')
    start(async () => {
      const r = await (entrar ? ficharEntrada() : ficharSalida())
      if (!r.ok) setError(r.error)
      else router.refresh() // refresca el portal para mostrar el cronómetro / cierre
    })
  }

  return (
    <>
      <AdminHeader titulo={`Hola, ${monitor.nombre || 'monitor'} 👋`} subtitulo="Tu portal · horario, fichaje, horas y recursos" />
      <div className="p-4 lg:p-6 space-y-4">
        {/* Pestañas */}
        <div className="flex flex-wrap gap-1 bg-white rounded-xl border border-gray-100 p-1 w-fit">
          {([['inicio', 'Inicio'], ['calendario', 'Mi calendario'], ['pagos', 'Mis pagos'], ['horas', hojasHoras.some(h => !h.firmado_at) ? 'Hojas de horas ●' : 'Hojas de horas'], ['recursos', 'Recursos'], ['perfil', 'Mi perfil']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === id ? 'bg-pm-red text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>

        {tab === 'inicio' && (
          <div className="space-y-4">
            {/* Fichaje + cronómetro */}
            <div className={`rounded-2xl p-5 border shadow-sm flex flex-wrap items-center justify-between gap-4 ${abierto ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
              <div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Control horario</div>
                {abierto ? (
                  <div className="text-pm-navy font-bold flex items-center gap-3">
                    <span className="text-3xl text-green-700"><Cronometro desde={abierto.entrada} /></span>
                    <span className="text-sm font-normal text-gray-500">desde las {horaCorta(abierto.entrada)}</span>
                  </div>
                ) : <div className="text-gray-500 text-sm">No tienes ninguna jornada abierta. Pulsa «Entrar» al empezar tu turno.</div>}
              </div>
              {abierto
                ? <button onClick={() => fichar(false)} disabled={loading} className="bg-pm-navy hover:bg-pm-navy-md disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl">Salir</button>
                : <button onClick={() => fichar(true)} disabled={loading} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl">Entrar</button>}
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Horas fichadas (control real) */}
            <div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Horas fichadas (lo que registras con Entrar/Salir)</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Hoy" valor={fmtHoras(horas.dia)} tono="navy" />
                <Metric label="Esta semana" valor={fmtHoras(horas.semana)} tono="green" />
                <Metric label="Este mes" valor={fmtHoras(horas.mes)} tono="amber" />
                <Metric label="Acumulado" valor={fmtHoras(horas.total)} tono="purple" />
              </div>
            </div>

            {/* Horas en nómina (según el calendario) */}
            <div className="bg-white rounded-2xl border border-pm-red/20 shadow-sm p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-black text-pm-navy">💶 Horas en nómina</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Según las actividades programadas en tu calendario. Estas son las que cuentan para tu nómina.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-pm-red">{fmtHoras(horasNom.mes)}</div>
                  <div className="text-xs text-gray-400">este mes</div>
                </div>
              </div>
              {mesesNom.length ? (
                <div className="divide-y divide-gray-50">
                  {mesesNom.slice(0, 6).map(m => (
                    <div key={m.mes} className={`flex justify-between text-sm py-1.5 ${m.mes === mesActual ? 'font-bold text-pm-navy' : 'text-gray-600'}`}>
                      <span className="capitalize">{m.label}{m.mes === mesActual ? ' · en curso' : ''}</span>
                      <span>{fmtHoras(m.horas)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm py-2">Aún no tienes actividades con horario en el calendario.</p>}
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

        {tab === 'calendario' && (
          <Calendario actividades={actividades} onExportar={() => descargarICS(actividades, `calendario-${(monitor.nombre || 'monitor').toLowerCase()}.ics`)} />
        )}
        {tab === 'pagos' && <MisPagos sueldos={sueldos} />}

        {tab === 'horas' && <HojasHorasMonitor hojas={hojasHoras} />}

        {tab === 'recursos' && <Recursos carpetas={carpetas} documentos={documentos} admin={false} />}
        {tab === 'perfil' && <MiPerfil monitor={monitor} />}
      </div>
    </>
  )
}

/** Ficha personal del monitor. Él mismo mantiene sus datos y su DNI al día. */
function MiPerfil({ monitor }: { monitor: Monitor }) {
  const [f, setF] = useState({
    nombre: monitor.nombre ?? '', apellidos: monitor.apellidos ?? '', telefono: monitor.telefono ?? '',
    fecha_nacimiento: monitor.fecha_nacimiento ?? '', dni_numero: monitor.dni_numero ?? '',
    num_seguridad_social: monitor.num_seguridad_social ?? '', foto_url: monitor.foto_url ?? '',
  })
  const [pendiente, empezar] = useTransition()
  const [msg, setMsg] = useState('')
  const router = useRouter()
  const nombreCompleto = `${f.nombre} ${f.apellidos}`.trim() || monitor.email

  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }))
  const guardar = () => {
    setMsg('')
    empezar(async () => {
      const r = await guardarMiFicha(f)
      if (r.ok) { setMsg('Datos guardados ✓'); router.refresh() }
      else setMsg(r.error)
    })
  }

  const input = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
  const label = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-5">
      <div className="flex items-center gap-4">
        {f.foto_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={f.foto_url} alt="" className="w-20 h-20 rounded-full object-cover shrink-0" />
          : <div className="w-20 h-20 rounded-full bg-pm-navy/10 flex items-center justify-center text-pm-navy font-black text-2xl shrink-0">{(f.nombre || monitor.email)[0]?.toUpperCase()}</div>}
        <div className="min-w-0">
          <div className="text-xl font-black text-pm-navy">{nombreCompleto}</div>
          <div className="text-xs text-gray-400">{monitor.email}</div>
          <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeEstadoMonitor(monitor.estado)}`}>{labelEstadoMonitor(monitor.estado)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className={label}>Tu foto</div>
        <SubirImagen value={f.foto_url} carpeta="monitores" onChange={url => set('foto_url', url)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div><label className={label}>Nombre</label><input className={input} value={f.nombre} onChange={e => set('nombre', e.target.value)} /></div>
        <div><label className={label}>Apellidos</label><input className={input} value={f.apellidos} onChange={e => set('apellidos', e.target.value)} /></div>
        <div><label className={label}>Teléfono</label><input className={input} value={f.telefono} onChange={e => set('telefono', e.target.value)} /></div>
        <div><label className={label}>Fecha de nacimiento</label><input type="date" className={input} value={f.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} /></div>
        <div><label className={label}>DNI / NIE</label><input className={input} value={f.dni_numero} onChange={e => set('dni_numero', e.target.value)} /></div>
        <div><label className={label}>Nº Seguridad Social</label><input className={input} value={f.num_seguridad_social} onChange={e => set('num_seguridad_social', e.target.value)} /></div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={guardar} disabled={pendiente}
          className="bg-pm-red hover:bg-pm-red-dark text-white font-black text-sm px-5 py-2.5 rounded-xl disabled:opacity-50">
          {pendiente ? 'Guardando…' : 'Guardar mis datos'}
        </button>
        {msg && <span className="text-sm text-gray-500">{msg}</span>}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className={label}>Fotos de tu DNI</div>
        <p className="text-xs text-gray-400 mb-3">Solo las ve el club. Se guardan en un almacén privado.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DniPrivado monitorId={monitor.id} cara="frente" etiqueta="Anverso" tienePath={!!monitor.dni_frente_path} soloLectura={false} />
          <DniPrivado monitorId={monitor.id} cara="reverso" etiqueta="Reverso" tienePath={!!monitor.dni_reverso_path} soloLectura={false} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className={label}>Especialidades</div>
        {monitor.especialidades.length ? (
          <div className="flex flex-wrap gap-1.5">
            {monitor.especialidades.map(e => <span key={e} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pm-red-light text-pm-red">{e}</span>)}
          </div>
        ) : <p className="text-gray-400 text-sm">Sin especialidades asignadas.</p>}
        <p className="text-xs text-gray-400 mt-3">
          Tu correo, tus especialidades y tu fecha de alta ({monitor.fecha_alta ? fechaLarga(monitor.fecha_alta) : 'sin registrar'}) los lleva el club.
        </p>
      </div>
    </div>
  )
}
