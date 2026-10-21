'use client'

import { useState, useMemo, useEffect } from 'react'
import { iniciarPagoReserva, reservarEnInstalacion, type PagoReservaPayload } from '@/app/reservar/actions'
import { redirigirARedsys } from '@/components/reserva/redirigirARedsys'
import FormularioCampamento, { type PayloadCampamento, textoParticipantes } from './FormularioCampamento'
import { type CampamentosConfig } from '@/lib/campamentos/editable'

const DIAS_LABEL: Record<string, string> = { '0': 'Dom', '1': 'Lun', '2': 'Mar', '3': 'Mié', '4': 'Jue', '5': 'Vie', '6': 'Sáb' }

const TEMA = {
  blue: {
    color: 'color' as const,
    sel: 'bg-blue-600 border-blue-600 text-white',
    selHover: 'hover:border-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-700',
    soft: 'bg-blue-50 border-blue-200',
    softTitle: 'text-blue-800',
    softText: 'text-blue-700',
    accent: 'text-blue-600',
    accentBorder: 'border-blue-500',
    accentBg: 'bg-blue-50',
  },
  violet: {
    color: 'color' as const,
    sel: 'bg-violet-600 border-violet-600 text-white',
    selHover: 'hover:border-violet-400',
    btn: 'bg-violet-600 hover:bg-violet-700',
    soft: 'bg-violet-50 border-violet-200',
    softTitle: 'text-violet-800',
    softText: 'text-violet-700',
    accent: 'text-violet-600',
    accentBorder: 'border-violet-500',
    accentBg: 'bg-violet-50',
  },
}

type TipoDescuento = 'ninguno' | 'hermanos' | 'socio'

// ─── Cálculo de precio (por niño) ──────────────────────────────────────────────
// El descuento (hermanos o socio, nunca los dos) se aplica a los días, no al
// horario ampliado. Sin oferta de semana, cada día cuesta lo mismo.
function calcularPrecio(cfg: CampamentosConfig, fechas: string[], seleccionados: Set<string>, pctDescuento: number, matinal: boolean, vespertino: boolean, ofertaSemana: boolean) {
  const numDias = seleccionados.size
  const completa = ofertaSemana && fechas.length > 0 && numDias >= fechas.length
  const desglose: { label: string; precio: number }[] = []

  let base = 0
  if (numDias > 0) {
    if (completa) {
      base = cfg.precioSemana
      desglose.push({ label: `Semana completa (${numDias} días)`, precio: cfg.precioSemana })
    } else {
      base = numDias * cfg.precioDiaSuelto
      desglose.push({ label: `${numDias} día${numDias > 1 ? 's' : ''} suelto${numDias > 1 ? 's' : ''}`, precio: base })
    }
  }

  const descuento = pctDescuento > 0 ? Math.round(base * (pctDescuento / 100)) : 0
  const matinalCost = matinal ? cfg.precioMatinal * numDias : 0
  const vespertinoCost = vespertino ? cfg.precioVespertino * numDias : 0
  if (matinalCost) desglose.push({ label: `Matinal (9:00–10:00) · ${numDias} día${numDias > 1 ? 's' : ''}`, precio: matinalCost })
  if (vespertinoCost) desglose.push({ label: `Vespertino (14:00–15:00) · ${numDias} día${numDias > 1 ? 's' : ''}`, precio: vespertinoCost })

  const subtotal = base
  const total = base - descuento + matinalCost + vespertinoCost
  return { subtotal, descuento, total, desglose, numDias, completa }
}

// ─── Componente reutilizable (Navidad / Semana Santa) ───────────────────────────
export default function ReservaBloque({
  cfg, servicio, fechas, horario, color, nombreCorto, ocupacionDia = {}, onReservar, ofertaSemana = true,
}: {
  cfg: CampamentosConfig
  servicio: string
  fechas: string[]
  horario: string
  color: keyof typeof TEMA
  nombreCorto: string   // p.ej. "Navidad", "Semana Santa"
  ocupacionDia?: Record<string, number>
  onReservar?: (p: PagoReservaPayload) => void
  /** Precio especial si se cogen todos los días (false en Navidad: días sueltos siempre). */
  ofertaSemana?: boolean
}) {
  const t = TEMA[color]
  const aforoDia = cfg.aforoDia || 0
  const libresDia = (dia: string) => (aforoDia > 0 ? Math.max(0, aforoDia - (ocupacionDia[dia] ?? 0)) : Infinity)
  const diaLleno = (dia: string) => aforoDia > 0 && libresDia(dia) <= 0
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [matinal, setMatinal] = useState(false)
  const [vespertino, setVespertino] = useState(false)
  const [numNinos, setNumNinos] = useState(1)
  const [tipoDesc, setTipoDesc] = useState<TipoDescuento>('ninguno')
  const [numeroSocio, setNumeroSocio] = useState('')
  const [paso, setPaso] = useState<'seleccion' | 'datos' | 'confirmado'>('seleccion')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Hermanos solo vale si vienen 2 niños o más.
  const hermanosPosible = numNinos >= 2
  useEffect(() => { if (tipoDesc === 'hermanos' && !hermanosPosible) setTipoDesc('ninguno') }, [hermanosPosible]) // eslint-disable-line react-hooks/exhaustive-deps
  const pctDescuento = tipoDesc === 'hermanos' ? cfg.descuentoHermanos : tipoDesc === 'socio' ? (cfg.descuentoSocio ?? 15) : 0
  const textoDescuento = tipoDesc === 'hermanos'
    ? `Hermanos −${cfg.descuentoHermanos}%`
    : tipoDesc === 'socio' ? `Socio del club −${cfg.descuentoSocio ?? 15}%${numeroSocio.trim() ? ` · nº ${numeroSocio.trim()}` : ''}` : ''

  const { subtotal, descuento, total, desglose, completa } = useMemo(
    () => calcularPrecio(cfg, fechas, seleccionados, pctDescuento, matinal, vespertino, ofertaSemana),
    [cfg, fechas, seleccionados, pctDescuento, matinal, vespertino, ofertaSemana]
  )

  // Máximo de niños según las plazas libres del día más ajustado de la selección.
  const maxNinos = useMemo(() => {
    if (aforoDia <= 0) return Infinity
    const sel = Array.from(seleccionados)
    if (sel.length === 0) return Infinity
    return Math.min(...sel.map(d => Math.max(0, aforoDia - (ocupacionDia[d] ?? 0))))
  }, [aforoDia, ocupacionDia, seleccionados])
  useEffect(() => { setNumNinos(n => Math.max(1, Math.min(n, maxNinos))) }, [maxNinos])

  function toggle(dia: string) {
    if (diaLleno(dia) && !seleccionados.has(dia)) return
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(dia) ? next.delete(dia) : next.add(dia)
      return next
    })
  }

  function seleccionarTodo() {
    const libres = fechas.filter(d => !diaLleno(d))
    if (libres.every(d => seleccionados.has(d)) && seleccionados.size > 0) setSeleccionados(new Set())
    else setSeleccionados(new Set(libres))
  }

  function construirPayload(p: PayloadCampamento): PagoReservaPayload {
    const dias = Array.from(seleccionados).sort()
    const n = p.participantes.length
    return {
      servicioId: 'campamentos',
      servicioNombre: servicio,
      cliente: { nombre: p.contacto.nombre, email: p.contacto.email, telefono: p.contacto.telefono },
      fecha: dias[0],
      participantes: n,
      total: total * n,
      observaciones: p.notas,
      datos: {
        diasSeleccionados: dias.join(', '),
        numDias: dias.length,
        matinal: matinal ? 'Sí (9:00–10:00)' : 'No',
        vespertino: vespertino ? 'Sí (14:00–15:00)' : 'No',
        descuento: textoDescuento || 'Sin descuento',
        numeroSocio: tipoDesc === 'socio' ? numeroSocio.trim() : '',
        participantes: textoParticipantes(p.participantes),
        numNinos: n,
      },
    }
  }

  async function onEnviar(p: PayloadCampamento) {
    setError('')
    const payload = construirPayload(p)
    if (onReservar) { onReservar(payload); return }
    setEnviando(true)
    const r = await iniciarPagoReserva(payload)
    if (r.ok) { redirigirARedsys(r); return }
    setEnviando(false); setError(r.error)
  }

  async function onEnviarInstalacion(p: PayloadCampamento) {
    setError(''); setEnviando(true)
    const r = await reservarEnInstalacion(construirPayload(p))
    setEnviando(false)
    if (r.ok) setPaso('confirmado'); else setError(r.error)
  }

  // ── Confirmado ──
  if (paso === 'confirmado') return (
    <div className="text-center py-6">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="font-black text-pm-navy text-lg mb-2">¡Reserva registrada!</h3>
      <p className="text-sm text-gray-600 mb-4">Hemos guardado tu plaza del Campamento de {nombreCorto}. <strong>El pago se realiza en la instalación.</strong> Te enviaremos la confirmación por email.</p>
      <div className="bg-pm-bg rounded-xl p-4 text-sm text-left space-y-1 max-w-xs mx-auto mb-4">
        <div><span className="text-gray-500">Días reservados:</span> <strong>{seleccionados.size}</strong></div>
        <div><span className="text-gray-500">Niños:</span> <strong>{numNinos}</strong></div>
        <div><span className="text-gray-500">Total:</span> <strong>{total * numNinos} €</strong></div>
      </div>
      <button onClick={() => { setPaso('seleccion'); setSeleccionados(new Set()); setTipoDesc('ninguno'); setNumeroSocio('') }} className="text-pm-red underline text-sm">
        Hacer otra reserva
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Fechas disponibles */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="font-black text-pm-navy text-sm">Elige tus días</div>
          <button onClick={seleccionarTodo} className={`text-xs ${t.accent} underline font-semibold`}>
            {seleccionados.size === fechas.length ? 'Quitar todos' : ofertaSemana ? `Semana completa · ${cfg.precioSemana} €` : 'Elegir todos'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {ofertaSemana ? `${cfg.precioDiaSuelto} € día suelto · ${cfg.precioSemana} € la semana completa` : `${cfg.precioDiaSuelto} € por día · elige los días que quieras`}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {fechas.map(dia => {
            const d = new Date(dia + 'T12:00:00')
            const numDia = d.getDate()
            const diaSemana = DIAS_LABEL[d.getDay().toString()]
            const mes = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
            const selec = seleccionados.has(dia)
            const lleno = diaLleno(dia)
            return (
              <button key={dia} disabled={lleno && !selec} title={lleno ? 'Completo' : undefined} onClick={() => toggle(dia)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  selec ? t.sel : lleno ? 'bg-gray-50 border-gray-200 text-gray-300 line-through cursor-not-allowed' : `bg-pm-bg border-gray-200 text-gray-700 ${t.selHover}`
                }`}>
                <span className="text-xs opacity-70 mb-0.5">{diaSemana}</span>
                <span className="text-lg font-black">{numDia}</span>
                <span className="text-xs opacity-70">{mes}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Horario: {horario} · Escuela de Superhéroes</p>
      </div>

      {seleccionados.size > 0 && (
        <>
          {/* Horario ampliado */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-3">⏰ Horario ampliado (opcional)</div>
            <div className="text-xs text-gray-500 mb-3">Horario base: {horario}</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMatinal(!matinal)}
                className={`border-2 rounded-xl p-3 text-left transition-all ${matinal ? `${t.accentBorder} ${t.accentBg}` : 'border-gray-200 hover:border-gray-300'}`}>
                <div className={`font-bold text-sm ${matinal ? t.accent : 'text-pm-navy'}`}>Matinal</div>
                <div className="text-xs text-gray-500 mt-0.5">Entrada de 9:00 a 10:00</div>
                <div className={`text-xs font-bold ${t.accent} mt-1`}>+{cfg.precioMatinal} € por niño y día</div>
              </button>
              <button onClick={() => setVespertino(!vespertino)}
                className={`border-2 rounded-xl p-3 text-left transition-all ${vespertino ? `${t.accentBorder} ${t.accentBg}` : 'border-gray-200 hover:border-gray-300'}`}>
                <div className={`font-bold text-sm ${vespertino ? t.accent : 'text-pm-navy'}`}>Vespertino</div>
                <div className="text-xs text-gray-500 mt-0.5">Salida de 14:00 a 15:00</div>
                <div className={`text-xs font-bold ${t.accent} mt-1`}>+{cfg.precioVespertino} € por niño y día</div>
              </button>
            </div>
          </div>

          {/* Número de niños */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-3">👶 Número de niños</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setNumNinos(n => Math.max(1, n - 1))} className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">−</button>
              <div className="text-3xl font-black text-pm-navy flex-1 text-center">{numNinos}</div>
              <button onClick={() => setNumNinos(n => Math.min(maxNinos, n + 1))} disabled={numNinos >= maxNinos} className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed">+</button>
            </div>
            {Number.isFinite(maxNinos) && (
              <p className="text-xs text-gray-400 mt-2">Máximo {maxNinos} niño{maxNinos === 1 ? '' : 's'} según las plazas libres de los días elegidos.</p>
            )}
          </div>

          {/* Descuento: hermanos o socio, nunca los dos */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-1">🏷️ ¿Tienes descuento? (solo uno)</div>
            <div className="text-xs text-gray-500 mb-3">Los descuentos no se suman y se aplican a los días de campamento.</div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={!hermanosPosible}
                onClick={() => setTipoDesc(tipoDesc === 'hermanos' ? 'ninguno' : 'hermanos')}
                className={`border-2 rounded-xl p-3 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  tipoDesc === 'hermanos' ? `${t.accentBorder} ${t.accentBg}` : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`font-bold text-sm ${tipoDesc === 'hermanos' ? t.accent : 'text-pm-navy'}`}>Hermanos −{cfg.descuentoHermanos}%</div>
                <div className="text-xs text-gray-500 mt-0.5">{hermanosPosible ? 'Para 2 niños o más' : 'Añade 2 niños o más'}</div>
              </button>
              <button type="button"
                onClick={() => setTipoDesc(tipoDesc === 'socio' ? 'ninguno' : 'socio')}
                className={`border-2 rounded-xl p-3 text-left transition-all ${
                  tipoDesc === 'socio' ? `${t.accentBorder} ${t.accentBg}` : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`font-bold text-sm ${tipoDesc === 'socio' ? t.accent : 'text-pm-navy'}`}>Socio del club −{cfg.descuentoSocio ?? 15}%</div>
                <div className="text-xs text-gray-500 mt-0.5">Club Deportivo Origen</div>
              </button>
            </div>
            {tipoDesc === 'socio' && (
              <input type="text" value={numeroSocio} onChange={e => setNumeroSocio(e.target.value)} placeholder="Tu nº de socio *"
                className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-navy" />
            )}
            {tipoDesc === 'socio' && <p className="text-xs text-gray-400 mt-1">Comprobamos el nº de socio antes del campamento.</p>}
          </div>

          {/* Resumen de precio */}
          <div className="bg-pm-bg border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="font-black text-pm-navy text-xs uppercase tracking-wider mb-3">Resumen de precio</div>
            {desglose.map((d, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{d.label}</span>
                <span className="font-semibold">{d.precio} €</span>
              </div>
            ))}
            {completa && (
              <div className={`text-xs ${t.accent} font-semibold`}>✓ Precio semana completa (ahorro frente a días sueltos)</div>
            )}
            {numNinos > 1 && (
              <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-2">
                <span>× {numNinos} niños</span>
                <span className="font-semibold">{subtotal * numNinos} €</span>
              </div>
            )}
            {pctDescuento > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>Descuento {tipoDesc === 'socio' ? 'socio' : 'hermanos'} ({pctDescuento}%)</span>
                <span className="font-semibold">− {descuento * numNinos} €</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-pm-navy text-base">
              <span>Total</span>
              <span>{total * numNinos} €</span>
            </div>
          </div>

          {/* Botón continuar */}
          {paso === 'seleccion' && (
            <button onClick={() => setPaso('datos')} disabled={tipoDesc === 'socio' && !numeroSocio.trim()}
              className={`w-full ${t.btn} disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors`}>
              Continuar con mis datos →
            </button>
          )}

          {/* Datos de contacto + participantes */}
          {paso === 'datos' && (
            <>
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <FormularioCampamento
                numNinos={numNinos} setNumNinos={setNumNinos} total={total * numNinos}
                color={color} enviando={enviando} ctaLabel={onReservar ? 'Continuar al pago →' : undefined}
                onVolver={() => setPaso('seleccion')} onSubmit={onEnviar}
                onSubmitInstalacion={onReservar ? undefined : onEnviarInstalacion}
              />
            </>
          )}
        </>
      )}

      {seleccionados.size === 0 && (
        <p className="text-center text-sm text-gray-400 italic py-2">
          Selecciona los días para ver el precio y continuar con la reserva.
        </p>
      )}
    </div>
  )
}
