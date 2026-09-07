'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Metric, EmptyState } from '@/components/admin/ui'
import { marcarEquipacion, asignarNumeroSocio, quitarNumeroSocio, registrarPagoSocio, anularPagoSocio } from './actions'
import { eurosCuota, eurosACents, importeCuotaSugeridoCents } from '@/lib/club/cuota'
import { waCliente } from '@/lib/whatsapp'
import type { Socio, ParticipanteSocio } from '@/lib/club/socios'

const fechaCorta = (iso: string) => (iso ? new Date(iso).toLocaleDateString('es-ES') : '—')
const hoy = () => new Date().toISOString().slice(0, 10)

const PORTAL = 'https://planetamovimiento.com/familias'

/** Mensaje de bienvenida que se abre en WhatsApp con los datos de acceso. */
function mensajeBienvenida(s: Socio): string {
  const nombre = (s.tutor || '').split(' ')[0]
  return [
    `¡Hola${nombre ? ' ' + nombre : ''}! 👋 Bienvenid@ al Club Deportivo Origen.`,
    '',
    `Ya estáis dados de alta como socios. Vuestro número de socio es ${s.numeroSocio}.`,
    '',
    `Con él podéis entrar al Portal de Familias: ${PORTAL}`,
    `Se entra con vuestro correo (${s.email}) y el número de socio, sin contraseña.`,
    '',
    'Dentro veréis el grupo y el horario de cada participante, el calendario del club, los avisos y el estado de las cuotas.',
    '',
    'Cualquier duda, respondednos por aquí. ¡Nos vemos en el club! 🤸',
  ].join('\n')
}

export default function SociosClient({ socios, puedeEditar }: { socios: Socio[]; puedeEditar: boolean }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<'' | 'sin-numero' | 'sin-equipacion' | 'sin-pagar'>('')
  const [abierto, setAbierto] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const totales = useMemo(() => {
    const parts = socios.flatMap(s => s.participantes)
    return {
      socios: socios.length,
      participantes: parts.length,
      sinNumero: socios.filter(s => !s.numeroSocio).length,
      equipacionPendiente: parts.filter(p => !p.equipacionEntregada).length,
      cobrado: parts.filter(p => p.cuotaEstado === 'pagada').reduce((n, p) => n + p.cuotaImporteCents, 0),
      sinPagar: parts.filter(p => p.cuotaEstado !== 'pagada' && p.cuotaEstado !== 'exenta').length,
    }
  }, [socios])

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return socios.filter(s => {
      if (filtro === 'sin-numero' && s.numeroSocio) return false
      if (filtro === 'sin-equipacion' && !s.participantes.some(p => !p.equipacionEntregada)) return false
      if (filtro === 'sin-pagar' && !s.participantes.some(p => p.cuotaEstado !== 'pagada' && p.cuotaEstado !== 'exenta')) return false
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
        {([['', 'Todos'], ['sin-numero', 'Sin nº de socio'], ['sin-pagar', 'Cuota sin cobrar'], ['sin-equipacion', 'Equipación pendiente']] as const).map(([id, txt]) => (
          <button key={id} onClick={() => setFiltro(id)}
            className={`text-xs font-bold px-3 py-2 rounded-full border transition-colors ${filtro === id ? 'bg-pm-navy text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-pm-navy'}`}>
            {txt}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Metric label="Socios" valor={totales.socios} tono="navy" />
        <Metric label="Participantes" valor={totales.participantes} tono="navy" />
        <Metric label="Cuotas cobradas" valor={eurosCuota(totales.cobrado)} sub={`${totales.sinPagar} sin cobrar`} tono="green" />
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
  const pagadas = s.participantes.filter(p => p.cuotaEstado === 'pagada').length
  const completo = entregadas === s.participantes.length && s.participantes.length > 0
  const alDia = pagadas === s.participantes.length && s.participantes.length > 0
  const puedeAvisar = !!s.telefono && !!s.numeroSocio

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm ${s.numeroSocio ? 'border-gray-100' : 'border-amber-200'}`}>
      {/* Cabecera */}
      <div className="flex flex-wrap items-center gap-3 p-4">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-[200px] text-left">
          <div className="w-10 h-10 rounded-full bg-pm-navy/10 text-pm-navy font-black flex items-center justify-center shrink-0">
            {(s.tutor || s.email)[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-pm-navy truncate">{s.tutor || s.email}</div>
            <div className="text-xs text-gray-400 truncate">{s.email}{s.telefono ? ` · ${s.telefono}` : ''}</div>
          </div>
        </button>

        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${s.numeroSocio ? 'bg-pm-navy/5 text-pm-navy border border-pm-navy/15' : 'bg-amber-100 text-amber-700'}`}>
          {s.numeroSocio ? `⭐ ${s.numeroSocio}` : 'Sin nº de socio'}
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${alDia ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          Cuota {pagadas}/{s.participantes.length}
        </span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${completo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          Equipación {entregadas}/{s.participantes.length}
        </span>

        {puedeAvisar ? (
          <a href={waCliente(s.telefono, mensajeBienvenida(s))} target="_blank" rel="noopener noreferrer"
            title="Enviar por WhatsApp la bienvenida con su nº de socio y cómo entrar al portal"
            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Bienvenida
          </a>
        ) : (
          <span title={s.telefono ? 'Genera antes su nº de socio' : 'Este socio no tiene teléfono'}
            className="text-[11px] font-semibold text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 whitespace-nowrap">
            Bienvenida
          </span>
        )}

        <button onClick={onToggle} className="text-pm-red font-bold text-xs whitespace-nowrap">{abierto ? 'Cerrar' : 'Gestionar →'}</button>
      </div>

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

          {/* Participantes: cuota de socio + entrega de equipación */}
          <div>
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Participantes</div>
            <div className="space-y-2">
              {s.participantes.map(p => (
                <LineaParticipante key={p.id} p={p} puedeEditar={puedeEditar} pending={pending} correr={correr} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Un participante: su cuota de socio (cobro manual) y su equipación. */
function LineaParticipante({ p, puedeEditar, pending, correr }: {
  p: ParticipanteSocio; puedeEditar: boolean; pending: boolean
  correr: (fn: () => Promise<{ ok: boolean; error?: string }>) => void
}) {
  const pagada = p.cuotaEstado === 'pagada'
  const [cobrando, setCobrando] = useState(false)
  const [importe, setImporte] = useState(eurosCuota(p.cuotaImporteCents || importeCuotaSugeridoCents()).replace(' €', ''))
  const [fecha, setFecha] = useState(p.cuotaFechaPago || hoy())
  const [forma, setForma] = useState(p.cuotaFormaPago || 'efectivo')

  function cobrar() {
    correr(() => registrarPagoSocio({ submissionId: p.id, importeCents: eurosACents(importe), fecha, formaPago: forma }))
    setCobrando(false)
  }

  return (
    <div className="border border-gray-100 rounded-xl">
      <div className="flex flex-wrap items-center gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-pm-navy text-sm truncate">
            {p.nombre} {p.apellidos}
            {p.soloSocio && <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Solo socio</span>}
          </div>
          <div className="text-xs text-gray-400 truncate">{p.actividad || 'Sin actividad'}</div>
        </div>

        {/* Talla: la del formulario de socio o la que haya puesto la familia en el portal */}
        <span title="Talla de equipación"
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${p.talla ? 'bg-pm-navy/5 text-pm-navy border border-pm-navy/15' : 'bg-gray-100 text-gray-400'}`}>
          👕 {p.talla ? `Talla ${p.talla}` : 'Sin talla'}
        </span>

        {/* Cuota de socio */}
        {pagada ? (
          <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full whitespace-nowrap">
            ✓ Cuota {eurosCuota(p.cuotaImporteCents)} · {fechaCorta(p.cuotaFechaPago)}{p.cuotaFormaPago ? ` · ${p.cuotaFormaPago}` : ''}
          </span>
        ) : (
          <span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full whitespace-nowrap">Cuota sin cobrar</span>
        )}
        {puedeEditar && (pagada
          ? <button disabled={pending} onClick={() => correr(() => anularPagoSocio(p.id))}
              className="text-xs font-bold text-gray-400 hover:text-red-600 px-2 disabled:opacity-50">Anular cobro</button>
          : <button disabled={pending} onClick={() => setCobrando(v => !v)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-pm-navy/20 text-pm-navy hover:border-pm-navy disabled:opacity-50">
              {cobrando ? 'Cancelar' : 'Registrar pago'}
            </button>)}

        {/* Equipación */}
        {p.equipacionEntregada ? (
          <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full whitespace-nowrap">
            ✓ Equipación {fechaCorta(p.equipacionEntregada)}
          </span>
        ) : (
          <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full whitespace-nowrap">Sin equipación</span>
        )}
        {puedeEditar && (
          <button disabled={pending} onClick={() => correr(() => marcarEquipacion(p.id, !p.equipacionEntregada))}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-50 ${p.equipacionEntregada ? 'border-gray-200 text-gray-500 hover:border-gray-400' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}`}>
            {p.equipacionEntregada ? 'Deshacer' : 'Entregar equipación'}
          </button>
        )}
      </div>

      {/* Alta manual del cobro */}
      {cobrando && puedeEditar && (
        <div className="border-t border-gray-100 bg-pm-bg px-3 py-3 flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold text-gray-500">
            Importe (€)
            <input value={importe} onChange={e => setImporte(e.target.value)} inputMode="decimal"
              className="block mt-1 w-24 border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red" />
          </label>
          <label className="text-xs font-bold text-gray-500">
            Fecha de pago
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="block mt-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red" />
          </label>
          <label className="text-xs font-bold text-gray-500">
            Forma de pago
            <select value={forma} onChange={e => setForma(e.target.value)}
              className="block mt-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-pm-red">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="bizum">Bizum</option>
            </select>
          </label>
          <button disabled={pending} onClick={cobrar}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg disabled:opacity-50">Guardar cobro</button>
          <span className="text-[11px] text-gray-400">Cuota sugerida: {eurosCuota(importeCuotaSugeridoCents())}</span>
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
