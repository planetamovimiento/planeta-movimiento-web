'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Metric, EmptyState } from '@/components/admin/ui'
import { marcarEquipacion, asignarNumeroSocio, quitarNumeroSocio } from './actions'
import type { Socio } from '@/lib/club/socios'

const fechaCorta = (iso: string) => (iso ? new Date(iso).toLocaleDateString('es-ES') : '—')

export default function SociosClient({ socios, puedeEditar }: { socios: Socio[]; puedeEditar: boolean }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<'' | 'sin-numero' | 'sin-equipacion'>('')
  const [abierto, setAbierto] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const totales = useMemo(() => ({
    socios: socios.length,
    participantes: socios.reduce((n, s) => n + s.participantes.length, 0),
    sinNumero: socios.filter(s => !s.numeroSocio).length,
    equipacionPendiente: socios.reduce((n, s) => n + s.participantes.filter(p => !p.equipacionEntregada).length, 0),
  }), [socios])

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return socios.filter(s => {
      if (filtro === 'sin-numero' && s.numeroSocio) return false
      if (filtro === 'sin-equipacion' && !s.participantes.some(p => !p.equipacionEntregada)) return false
      if (!t) return true
      return `${s.tutor} ${s.email} ${s.numeroSocio} ${s.participantes.map(p => `${p.nombre} ${p.apellidos}`).join(' ')}`
        .toLowerCase().includes(t)
    })
  }, [socios, q, filtro])

  const correr = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError('')
    start(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error || 'No se pudo guardar')
      else router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por tutor, correo, nº de socio o participante…"
          className="flex-1 min-w-[220px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
        {([['', 'Todos'], ['sin-numero', 'Sin nº de socio'], ['sin-equipacion', 'Equipación pendiente']] as const).map(([id, txt]) => (
          <button key={id} onClick={() => setFiltro(id)}
            className={`text-xs font-bold px-3 py-2 rounded-full border transition-colors ${filtro === id ? 'bg-pm-navy text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-pm-navy'}`}>
            {txt}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Socios" valor={totales.socios} tono="navy" />
        <Metric label="Participantes" valor={totales.participantes} tono="navy" />
        <Metric label="Sin nº de socio" valor={totales.sinNumero} sub="No pueden entrar al portal" tono="red" />
        <Metric label="Equipación pendiente" valor={totales.equipacionPendiente} sub="Participantes por entregar" tono="amber" />
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <EmptyState icon="⭐" titulo="Sin socios" desc="Las altas del formulario «Hazte socio» aparecerán aquí." />
      ) : (
        <div className="space-y-3">
          {lista.map(s => (
            <FichaSocio key={s.email} socio={s} abierto={abierto === s.email}
              onToggle={() => setAbierto(abierto === s.email ? null : s.email)}
              puedeEditar={puedeEditar} pending={pending} correr={correr} />
          ))}
        </div>
      )}
    </div>
  )
}

function FichaSocio({ socio: s, abierto, onToggle, puedeEditar, pending, correr }: {
  socio: Socio; abierto: boolean; onToggle: () => void; puedeEditar: boolean
  pending: boolean; correr: (fn: () => Promise<{ ok: boolean; error?: string }>) => void
}) {
  const [numManual, setNumManual] = useState(s.numeroSocio)
  const entregadas = s.participantes.filter(p => p.equipacionEntregada).length
  const completo = entregadas === s.participantes.length && s.participantes.length > 0

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm ${s.numeroSocio ? 'border-gray-100' : 'border-amber-200'}`}>
      {/* Cabecera: clic para gestionar */}
      <button onClick={onToggle} className="w-full flex flex-wrap items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-2xl transition-colors">
        <div className="w-10 h-10 rounded-full bg-pm-navy/10 text-pm-navy font-black flex items-center justify-center shrink-0">
          {(s.tutor || s.email)[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-pm-navy truncate">{s.tutor || s.email}</div>
          <div className="text-xs text-gray-400 truncate">{s.email}{s.telefono ? ` · ${s.telefono}` : ''}</div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${s.numeroSocio ? 'bg-pm-navy/5 text-pm-navy border border-pm-navy/15' : 'bg-amber-100 text-amber-700'}`}>
          {s.numeroSocio || 'Sin nº de socio'}
        </span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
          {s.participantes.length} {s.participantes.length === 1 ? 'participante' : 'participantes'}
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${completo ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          Equipación {entregadas}/{s.participantes.length}
        </span>
        <span className="text-pm-red font-bold text-xs">{abierto ? 'Cerrar' : 'Gestionar →'}</span>
      </button>

      {abierto && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Datos del socio */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Dato k="Alta" v={fechaCorta(s.fechaAlta)} />
            <Dato k="DNI / NIE" v={s.dni || '—'} />
            <Dato k="Teléfono" v={s.telefono || '—'} />
            <Dato k="Dirección" v={s.direccion || '—'} />
          </div>

          {/* Nº de socio (credencial del Portal de Familias) */}
          <div className="bg-pm-bg border border-gray-100 rounded-xl p-3">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Nº de socio</div>
            <div className="flex flex-wrap items-center gap-2">
              <input value={numManual} disabled={!puedeEditar} onChange={e => setNumManual(e.target.value)} placeholder="CDO-00001"
                className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red w-40 disabled:opacity-60" />
              {puedeEditar && numManual.trim().toUpperCase() !== s.numeroSocio && (
                <button disabled={pending} onClick={() => correr(() => asignarNumeroSocio(s.email, numManual))}
                  className="bg-pm-navy text-white font-bold text-xs px-3 py-2 rounded-lg disabled:opacity-50">Guardar</button>
              )}
              {puedeEditar && !s.numeroSocio && (
                <button disabled={pending} onClick={() => correr(() => asignarNumeroSocio(s.email))}
                  className="bg-pm-red hover:bg-pm-red-dark text-white font-bold text-xs px-3 py-2 rounded-lg disabled:opacity-50">Generar número</button>
              )}
              {puedeEditar && s.numeroSocio && (
                <button disabled={pending} onClick={() => correr(() => quitarNumeroSocio(s.email))}
                  className="text-xs font-bold text-gray-400 hover:text-red-600 px-2">Quitar</button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              La familia entra al Portal de Familias con <strong>{s.email}</strong> y este número.
              {s.familiaId ? '' : ' Al asignarlo se crea su cuenta del portal.'}
            </p>
          </div>

          {/* Participantes + entrega de equipación */}
          <div>
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Participantes</div>
            <ul className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
              {s.participantes.map(p => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-pm-navy text-sm truncate">
                      {p.nombre} {p.apellidos}
                      {p.soloSocio && <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Solo socio</span>}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {[p.actividad || 'Sin actividad', p.talla ? `Talla ${p.talla}` : 'Sin talla'].join(' · ')}
                    </div>
                  </div>
                  {p.equipacionEntregada ? (
                    <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                      ✓ Entregada {fechaCorta(p.equipacionEntregada)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full whitespace-nowrap">Sin entregar</span>
                  )}
                  {puedeEditar && (
                    <button disabled={pending} onClick={() => correr(() => marcarEquipacion(p.id, !p.equipacionEntregada))}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-50 ${p.equipacionEntregada ? 'border-gray-200 text-gray-500 hover:border-gray-400' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}`}>
                      {p.equipacionEntregada ? 'Deshacer' : 'Entregar equipación'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-pm-bg rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-400">{k}</div>
      <div className="font-semibold text-pm-navy text-sm break-words">{v}</div>
    </div>
  )
}
