'use client'

import { useState, useMemo, useEffect } from 'react'
import { iniciarPagoReserva } from '@/app/reservar/actions'
import { redirigirARedsys } from '@/components/reserva/redirigirARedsys'
import FormularioCampamento, { type PayloadCampamento, textoParticipantes } from './FormularioCampamento'
import { formatDia, formatFechaLarga } from './config'
import { semanasResueltas, diasDeSemana, type CampamentosConfig, type SemanaVerano } from '@/lib/campamentos/editable'

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V']

// ─── Cálculo de precio (por niño) ──────────────────────────────────────────────
function calcularPrecio(cfg: CampamentosConfig, semanas: SemanaVerano[], diasSeleccionados: Set<string>, cuponAplicado: boolean, matinal: boolean, vespertino: boolean) {
  let base = 0
  let numDias = 0
  const desglose: { label: string; precio: number }[] = []

  for (const semana of semanas) {
    const dias = diasDeSemana(semana)
    const seleccionados = dias.filter(d => diasSeleccionados.has(d))
    if (seleccionados.length === 0) continue
    numDias += seleccionados.length
    if (seleccionados.length === 5) {
      base += cfg.precioSemana
      desglose.push({ label: `Semana ${semana.id} — ${semana.elemento} (semana completa)`, precio: cfg.precioSemana })
    } else {
      const precio = seleccionados.length * cfg.precioDiaSuelto
      base += precio
      desglose.push({ label: `Semana ${semana.id} — ${semana.elemento} (${seleccionados.length} día${seleccionados.length > 1 ? 's' : ''})`, precio })
    }
  }

  const descuento = cuponAplicado ? Math.round(base * (cfg.descuentoHermanos / 100)) : 0
  const matinalCost = matinal ? cfg.precioMatinal * numDias : 0
  const vespertinoCost = vespertino ? cfg.precioVespertino * numDias : 0
  if (matinalCost) desglose.push({ label: `Matinal (8:00–9:00) · ${numDias} día${numDias > 1 ? 's' : ''}`, precio: matinalCost })
  if (vespertinoCost) desglose.push({ label: `Vespertino (14:00–15:00) · ${numDias} día${numDias > 1 ? 's' : ''}`, precio: vespertinoCost })

  const subtotal = base
  const total = base - descuento + matinalCost + vespertinoCost
  return { subtotal, descuento, total, desglose, numDias }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ReservaVerano({ cfg, ocupacionDia = {} }: { cfg: CampamentosConfig; ocupacionDia?: Record<string, number> }) {
  const SEMANAS = useMemo(() => semanasResueltas(cfg), [cfg])
  const aforoDia = cfg.aforoDia || 0
  const libresDia = (dia: string) => (aforoDia > 0 ? Math.max(0, aforoDia - (ocupacionDia[dia] ?? 0)) : Infinity)
  const diaLleno = (dia: string) => aforoDia > 0 && libresDia(dia) <= 0
  const [diasSeleccionados, setDiasSeleccionados] = useState<Set<string>>(new Set())
  const [matinal, setMatinal]     = useState(false)   // entrada 8:00
  const [ampliacion, setAmpliacion] = useState(false) // salida 15:00
  const [numNinos, setNumNinos]   = useState(1)
  const [cupon, setCupon]         = useState('')
  const [cuponAplicado, setCuponAplicado] = useState(false)
  const [cuponError, setCuponError] = useState(false)
  const [paso, setPaso] = useState<'seleccion' | 'datos' | 'confirmado'>('seleccion')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const { subtotal, descuento, total, desglose } = useMemo(
    () => calcularPrecio(cfg, SEMANAS, diasSeleccionados, cuponAplicado, matinal, ampliacion),
    [cfg, SEMANAS, diasSeleccionados, cuponAplicado, matinal, ampliacion]
  )

  // Máximo de niños según las plazas libres del día más ajustado de la selección.
  const maxNinos = useMemo(() => {
    if (aforoDia <= 0) return Infinity
    const sel = Array.from(diasSeleccionados)
    if (sel.length === 0) return Infinity
    return Math.min(...sel.map(d => Math.max(0, aforoDia - (ocupacionDia[d] ?? 0))))
  }, [aforoDia, ocupacionDia, diasSeleccionados])
  useEffect(() => { setNumNinos(n => Math.max(1, Math.min(n, maxNinos))) }, [maxNinos])

  function toggleDia(dia: string) {
    if (diaLleno(dia) && !diasSeleccionados.has(dia)) return
    setDiasSeleccionados(prev => {
      const next = new Set(prev)
      next.has(dia) ? next.delete(dia) : next.add(dia)
      return next
    })
  }

  function toggleSemana(semana: SemanaVerano) {
    const dias = diasDeSemana(semana).filter(d => !diaLleno(d))
    if (dias.length === 0) return
    const todosSeleccionados = dias.every(d => diasSeleccionados.has(d))
    setDiasSeleccionados(prev => {
      const next = new Set(prev)
      if (todosSeleccionados) dias.forEach(d => next.delete(d))
      else dias.forEach(d => next.add(d))
      return next
    })
  }

  function aplicarCupon() {
    if (cupon.trim().toUpperCase() === cfg.cuponHermanos.toUpperCase()) {
      setCuponAplicado(true); setCuponError(false)
    } else {
      setCuponError(true); setCuponAplicado(false)
    }
  }

  async function onEnviar(p: PayloadCampamento) {
    setEnviando(true); setError('')
    const dias = Array.from(diasSeleccionados).sort()
    const n = p.participantes.length
    const r = await iniciarPagoReserva({
      servicioId: 'campamentos',
      servicioNombre: 'Campamento de Verano',
      cliente: { nombre: p.contacto.nombre, email: p.contacto.email, telefono: p.contacto.telefono },
      fecha: dias[0],
      participantes: n,
      total: total * n,
      observaciones: p.notas,
      datos: {
        diasSeleccionados: dias.join(', '),
        numDias: dias.length,
        matinal: matinal ? 'Sí (8:00–9:00)' : 'No',
        vespertino: ampliacion ? 'Sí (14:00–15:00)' : 'No',
        cuponHermanos: cuponAplicado ? `Aplicado (-${cfg.descuentoHermanos}%)` : 'No',
        participantes: textoParticipantes(p.participantes),
        numNinos: n,
      },
    })
    if (r.ok) { redirigirARedsys(r); return }
    setEnviando(false); setError(r.error)
  }

  // ── Confirmado ──
  if (paso === 'confirmado') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="text-xl font-black text-pm-navy mb-2">¡Solicitud enviada!</h3>
        <p className="text-sm text-gray-600 mb-4">
          Nos pondremos en contacto contigo para confirmar la reserva del campamento de verano.
        </p>
        <div className="bg-pm-bg rounded-xl p-4 text-sm text-left space-y-1 max-w-xs mx-auto mb-4">
          <div><span className="text-gray-500">Días reservados:</span> <strong>{diasSeleccionados.size}</strong></div>
          <div><span className="text-gray-500">Niños:</span> <strong>{numNinos}</strong></div>
          <div><span className="text-gray-500">Total:</span> <strong>{total * numNinos} €</strong></div>
        </div>
        <button onClick={() => { setPaso('seleccion'); setDiasSeleccionados(new Set()); setCuponAplicado(false); setCupon('') }}
          className="text-pm-red underline text-sm">Hacer otra reserva</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── SEMANAS y calendario ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-pm-navy text-sm">Elige tus semanas o días sueltos</h3>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pm-red rounded inline-block"/>Seleccionado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-pm-bg border border-gray-200 rounded inline-block"/>Disponible</span>
          </div>
        </div>

        {SEMANAS.map(semana => {
          const dias = diasDeSemana(semana)
          const seleccionados = dias.filter(d => diasSeleccionados.has(d))
          const todosSelec = seleccionados.length === 5
          const esSemanaCompleta = seleccionados.length === 5

          return (
            <div key={semana.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${todosSelec ? semana.colorBorder : 'border-gray-200'}`}>
              {/* Header semana */}
              <div className={`${todosSelec ? semana.color : 'bg-pm-bg'} px-4 py-2.5 flex items-center justify-between transition-colors`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{semana.emoji}</span>
                  <div>
                    <span className={`font-black text-sm ${todosSelec ? 'text-white' : 'text-pm-navy'}`}>
                      Semana {semana.id} — {semana.elemento}
                    </span>
                    <div className={`text-xs ${todosSelec ? 'text-white/70' : 'text-gray-500'}`}>
                      {formatFechaLarga(semana.inicio)} · {semana.lema}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {esSemanaCompleta && (
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${todosSelec ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                      {cfg.precioSemana} € ✓
                    </span>
                  )}
                  <button
                    onClick={() => toggleSemana(semana)}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                      todosSelec
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-white border border-gray-200 text-pm-navy hover:border-pm-red hover:text-pm-red'
                    }`}
                  >
                    {todosSelec ? '✓ Semana completa' : 'Semana completa'}
                  </button>
                </div>
              </div>

              {/* Días */}
              <div className="grid grid-cols-5 gap-1.5 p-3 bg-white">
                {dias.map((dia, i) => {
                  const selec = diasSeleccionados.has(dia)
                  const lleno = diaLleno(dia)
                  return (
                    <button
                      key={dia}
                      disabled={lleno && !selec}
                      title={lleno ? 'Completo' : undefined}
                      onClick={() => toggleDia(dia)}
                      className={`flex flex-col items-center py-2 rounded-xl border-2 transition-all text-xs font-semibold ${
                        selec
                          ? `${semana.color} text-white border-transparent`
                          : lleno
                            ? 'bg-gray-50 border-gray-200 text-gray-300 line-through cursor-not-allowed'
                            : `bg-pm-bg border-gray-200 text-gray-700 hover:border-pm-red/40`
                      }`}
                    >
                      <span className="text-xs opacity-70 mb-0.5">{DIAS_SEMANA[i]}</span>
                      <span className="font-black">{formatDia(dia).split(' ')[1]}</span>
                    </button>
                  )
                })}
              </div>

              {/* Precio de esta semana */}
              {seleccionados.length > 0 && (
                <div className={`${semana.colorLight} px-4 py-2 text-xs ${semana.colorText} font-semibold flex justify-between`}>
                  <span>{seleccionados.length === 5 ? '✓ Semana completa (ahorro incluido)' : `${seleccionados.length} día${seleccionados.length > 1 ? 's' : ''} suelto${seleccionados.length > 1 ? 's' : ''}`}</span>
                  <span className="font-black">{seleccionados.length === 5 ? cfg.precioSemana : seleccionados.length * cfg.precioDiaSuelto} €</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Solo mostrar resto si hay días seleccionados ── */}
      {diasSeleccionados.size > 0 && (
        <>
          {/* Horario ampliado */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-3">⏰ Horario ampliado (opcional)</div>
            <div className="text-xs text-gray-500 mb-3">Horario base: 9:00 – 14:00</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMatinal(!matinal)}
                className={`border-2 rounded-xl p-3 text-left transition-all ${matinal ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
                <div className={`font-bold text-sm ${matinal ? 'text-pm-red' : 'text-pm-navy'}`}>Matinal</div>
                <div className="text-xs text-gray-500 mt-0.5">Entrada de 8:00 a 9:00</div>
                <div className="text-xs font-bold text-pm-red mt-1">+{cfg.precioMatinal} € por niño y día</div>
              </button>
              <button onClick={() => setAmpliacion(!ampliacion)}
                className={`border-2 rounded-xl p-3 text-left transition-all ${ampliacion ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
                <div className={`font-bold text-sm ${ampliacion ? 'text-pm-red' : 'text-pm-navy'}`}>Vespertino</div>
                <div className="text-xs text-gray-500 mt-0.5">Salida de 14:00 a 15:00</div>
                <div className="text-xs font-bold text-pm-red mt-1">+{cfg.precioVespertino} € por niño y día</div>
              </button>
            </div>
          </div>

          {/* Número de niños */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-3">👶 Número de niños</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setNumNinos(n => Math.max(1, n - 1))}
                className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">−</button>
              <div className="text-3xl font-black text-pm-navy flex-1 text-center">{numNinos}</div>
              <button onClick={() => setNumNinos(n => Math.min(maxNinos, n + 1))} disabled={numNinos >= maxNinos}
                className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed">+</button>
            </div>
            {Number.isFinite(maxNinos) && (
              <p className="text-xs text-gray-400 mt-2">Máximo {maxNinos} niño{maxNinos === 1 ? '' : 's'} según las plazas libres de los días elegidos.</p>
            )}
          </div>

          {/* Cupón hermanos */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="font-black text-pm-navy text-sm mb-1">🏷️ Cupón de hermanos</div>
            <div className="text-xs text-gray-500 mb-3">Si tus hijos vienen juntos, aplica un {cfg.descuentoHermanos}% de descuento</div>
            {cuponAplicado ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                <span className="font-bold">Cupón {cfg.cuponHermanos} aplicado — {cfg.descuentoHermanos}% de descuento</span>
                <button onClick={() => { setCuponAplicado(false); setCupon('') }} className="ml-auto text-xs underline text-green-600">Quitar</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cupon}
                  onChange={e => { setCupon(e.target.value.toUpperCase()); setCuponError(false) }}
                  placeholder={`Ej. ${cfg.cuponHermanos}`}
                  className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none ${cuponError ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 focus:border-pm-red'}`}
                />
                <button onClick={aplicarCupon}
                  className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-pm-navy-md transition-colors">
                  Aplicar
                </button>
              </div>
            )}
            {cuponError && <p className="text-xs text-pm-red mt-1">Cupón no válido. Prueba con &quot;{cfg.cuponHermanos}&quot;.</p>}
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
            {numNinos > 1 && (
              <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-2">
                <span>× {numNinos} niños</span>
                <span className="font-semibold">{subtotal * numNinos} €</span>
              </div>
            )}
            {cuponAplicado && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>Descuento hermanos ({cfg.descuentoHermanos}%)</span>
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
            <button onClick={() => setPaso('datos')}
              className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3.5 rounded-xl transition-colors">
              Continuar con mis datos →
            </button>
          )}

          {/* Datos de contacto + participantes (hermanos) */}
          {paso === 'datos' && (
            <>
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <FormularioCampamento
                numNinos={numNinos} setNumNinos={setNumNinos} total={total * numNinos}
                color="red" enviando={enviando}
                onVolver={() => setPaso('seleccion')} onSubmit={onEnviar}
              />
            </>
          )}
        </>
      )}

      {diasSeleccionados.size === 0 && (
        <p className="text-center text-sm text-gray-400 italic py-4">
          Selecciona semanas o días sueltos para ver el precio y continuar con la reserva.
        </p>
      )}
    </div>
  )
}
