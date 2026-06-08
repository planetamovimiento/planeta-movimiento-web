'use client'

import { useState, useMemo } from 'react'
import { submitBooking } from '@/lib/forms/actions'
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

// ─── Cálculo de precio (por niño) ──────────────────────────────────────────────
function calcularPrecio(cfg: CampamentosConfig, fechas: string[], seleccionados: Set<string>, cuponAplicado: boolean, matinal: boolean, vespertino: boolean) {
  const numDias = seleccionados.size
  const completa = fechas.length > 0 && numDias >= fechas.length
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

  const descuento = cuponAplicado ? Math.round(base * (cfg.descuentoHermanos / 100)) : 0
  const matinalCost = matinal ? cfg.precioMatinal * numDias : 0
  const vespertinoCost = vespertino ? cfg.precioVespertino * numDias : 0
  if (matinalCost) desglose.push({ label: `Matinal (8:00–9:00) · ${numDias} día${numDias > 1 ? 's' : ''}`, precio: matinalCost })
  if (vespertinoCost) desglose.push({ label: `Vespertino (14:00–15:00) · ${numDias} día${numDias > 1 ? 's' : ''}`, precio: vespertinoCost })

  const subtotal = base
  const total = base - descuento + matinalCost + vespertinoCost
  return { subtotal, descuento, total, desglose, numDias, completa }
}

// ─── Componente reutilizable (Navidad / Semana Santa) ───────────────────────────
export default function ReservaBloque({
  cfg, servicio, fechas, horario, color, nombreCorto,
}: {
  cfg: CampamentosConfig
  servicio: string
  fechas: string[]
  horario: string
  color: keyof typeof TEMA
  nombreCorto: string   // p.ej. "Navidad", "Semana Santa"
}) {
  const t = TEMA[color]
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [matinal, setMatinal] = useState(false)
  const [vespertino, setVespertino] = useState(false)
  const [numNinos, setNumNinos] = useState(1)
  const [cupon, setCupon] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState(false)
  const [cuponError, setCuponError] = useState(false)
  const [paso, setPaso] = useState<'seleccion' | 'datos' | 'confirmado'>('seleccion')
  const [enviando, setEnviando] = useState(false)

  const { subtotal, descuento, total, desglose, completa } = useMemo(
    () => calcularPrecio(cfg, fechas, seleccionados, cuponAplicado, matinal, vespertino),
    [cfg, fechas, seleccionados, cuponAplicado, matinal, vespertino]
  )

  function toggle(dia: string) {
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(dia) ? next.delete(dia) : next.add(dia)
      return next
    })
  }

  function seleccionarTodo() {
    if (seleccionados.size === fechas.length) setSeleccionados(new Set())
    else setSeleccionados(new Set(fechas))
  }

  function aplicarCupon() {
    if (cupon.trim().toUpperCase() === cfg.cuponHermanos.toUpperCase()) { setCuponAplicado(true); setCuponError(false) }
    else { setCuponError(true); setCuponAplicado(false) }
  }

  async function onEnviar(p: PayloadCampamento) {
    setEnviando(true)
    const dias = Array.from(seleccionados).sort()
    const n = p.participantes.length
    await submitBooking({
      servicio,
      cliente_nombre: p.contacto.nombre,
      cliente_email: p.contacto.email,
      cliente_telefono: p.contacto.telefono,
      fecha: dias[0],
      participantes: n,
      precio: total * n,
      observaciones: p.notas,
      datos: {
        diasSeleccionados: dias.join(', '),
        numDias: dias.length,
        matinal: matinal ? 'Sí (8:00–9:00)' : 'No',
        vespertino: vespertino ? 'Sí (14:00–15:00)' : 'No',
        cuponHermanos: cuponAplicado ? `Aplicado (-${cfg.descuentoHermanos}%)` : 'No',
        participantes: textoParticipantes(p.participantes),
        numNinos: n,
      },
    })
    setEnviando(false)
    setPaso('confirmado')
  }

  // ── Confirmado ──
  if (paso === 'confirmado') return (
    <div className="text-center py-6">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h3 className="font-black text-pm-navy text-lg mb-2">¡Reserva enviada!</h3>
      <p className="text-sm text-gray-600 mb-4">Nos pondremos en contacto contigo para confirmar el pago y la plaza del Campamento de {nombreCorto}.</p>
      <div className="bg-pm-bg rounded-xl p-4 text-sm text-left space-y-1 max-w-xs mx-auto mb-4">
        <div><span className="text-gray-500">Días reservados:</span> <strong>{seleccionados.size}</strong></div>
        <div><span className="text-gray-500">Niños:</span> <strong>{numNinos}</strong></div>
        <div><span className="text-gray-500">Total:</span> <strong>{total * numNinos} €</strong></div>
      </div>
      <button onClick={() => { setPaso('seleccion'); setSeleccionados(new Set()); setCuponAplicado(false); setCupon('') }} className="text-pm-red underline text-sm">
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
            {seleccionados.size === fechas.length ? 'Quitar todos' : `Semana completa · ${cfg.precioSemana} €`}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">{cfg.precioDiaSuelto} € día suelto · {cfg.precioSemana} € la semana completa</p>
        <div className="grid grid-cols-5 gap-2">
          {fechas.map(dia => {
            const d = new Date(dia + 'T12:00:00')
            const numDia = d.getDate()
            const diaSemana = DIAS_LABEL[d.getDay().toString()]
            const mes = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
            const selec = seleccionados.has(dia)
            return (
              <button key={dia} onClick={() => toggle(dia)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${selec ? t.sel : `bg-pm-bg border-gray-200 text-gray-700 ${t.selHover}`}`}>
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
                <div className="text-xs text-gray-500 mt-0.5">Entrada de 8:00 a 9:00</div>
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
              <button onClick={() => setNumNinos(n => n + 1)} className="w-9 h-9 bg-pm-bg border border-gray-200 rounded-xl text-lg font-bold hover:border-pm-red transition-colors">+</button>
            </div>
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
                <span className="font-bold">Cupón {cfg.cuponHermanos} aplicado — {cfg.descuentoHermanos}%</span>
                <button onClick={() => { setCuponAplicado(false); setCupon('') }} className="ml-auto text-xs underline text-green-600">Quitar</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={cupon} onChange={e => { setCupon(e.target.value.toUpperCase()); setCuponError(false) }} placeholder={`Ej. ${cfg.cuponHermanos}`}
                  className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none ${cuponError ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 focus:border-pm-navy'}`} />
                <button onClick={aplicarCupon} className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-pm-navy-md transition-colors">Aplicar</button>
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
            {completa && (
              <div className={`text-xs ${t.accent} font-semibold`}>✓ Precio semana completa (ahorro frente a días sueltos)</div>
            )}
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
            <button onClick={() => setPaso('datos')} className={`w-full ${t.btn} text-white font-black py-3.5 rounded-xl transition-colors`}>
              Continuar con mis datos →
            </button>
          )}

          {/* Datos de contacto + participantes */}
          {paso === 'datos' && (
            <FormularioCampamento
              numNinos={numNinos} setNumNinos={setNumNinos} total={total * numNinos}
              color={color} enviando={enviando}
              onVolver={() => setPaso('seleccion')} onSubmit={onEnviar}
            />
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
