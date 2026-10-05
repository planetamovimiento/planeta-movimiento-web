'use client'

import { useMemo, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Calendario del mes en la portada. Se alimenta solo del Calendario del Club
// (lo mismo que ven las familias en su portal): lo que allí sea público sale
// aquí. Si el evento tiene enlace, el día y la fila se pueden pinchar.
// ─────────────────────────────────────────────────────────────────────────────

export type EventoHome = {
  fecha: string        // YYYY-MM-DD
  titulo: string
  hora: string         // "" si es de todo el día
  tipo: string
  color: string        // clave de la paleta (azul, rojo…)
  url: string          // "" si no lleva a ningún sitio
}

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/** Paleta sobre fondo oscuro (clases estáticas: Tailwind las necesita escritas). */
const PUNTO: Record<string, string> = {
  azul: 'bg-sky-400', rojo: 'bg-pm-red', gris: 'bg-gray-400', naranja: 'bg-orange-400',
  morado: 'bg-purple-400', verde: 'bg-emerald-400', amarillo: 'bg-amber-400',
  negro: 'bg-gray-200', teal: 'bg-teal-400', rosa: 'bg-pink-400',
}
const punto = (c: string) => PUNTO[c] ?? 'bg-sky-400'

const ymd = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export default function CalendarioMes({ eventos, mesInicial }: { eventos: EventoHome[]; mesInicial: string }) {
  const [y0, m0] = mesInicial.split('-').map(Number)
  const [vista, setVista] = useState({ y: y0, m: (m0 || 1) - 1 })

  const porDia = useMemo(() => {
    const m = new Map<string, EventoHome[]>()
    for (const e of eventos) {
      const a = m.get(e.fecha) ?? []
      a.push(e)
      m.set(e.fecha, a)
    }
    return m
  }, [eventos])

  const { y, m } = vista
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const dias = new Date(y, m + 1, 0).getDate()
  const celdas: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dias }, (_, i) => i + 1)]
  while (celdas.length % 7 !== 0) celdas.push(null)

  const hoy = new Date()
  const hoyISO = ymd(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const delMes = useMemo(
    () => eventos
      .filter(e => e.fecha.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`))
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)),
    [eventos, y, m],
  )

  const mover = (d: -1 | 1) => setVista(v => {
    const n = v.m + d
    if (n < 0) return { y: v.y - 1, m: 11 }
    if (n > 11) return { y: v.y + 1, m: 0 }
    return { y: v.y, m: n }
  })

  return (
    <section className="bg-pm-navy border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            🗓️ Agenda del mes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Qué pasa en Planeta Movimiento</h2>
          <p className="text-white/60 text-sm mt-2">Eventos, días sin cole, festivos y actividades especiales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Rejilla del mes */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior"
                className="w-9 h-9 rounded-xl border border-white/20 text-white hover:border-pm-red hover:text-pm-red transition-colors">‹</button>
              <span className="font-black text-white tracking-wide">{MESES[m]} {y}</span>
              <button type="button" onClick={() => mover(1)} aria-label="Mes siguiente"
                className="w-9 h-9 rounded-xl border border-white/20 text-white hover:border-pm-red hover:text-pm-red transition-colors">›</button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DIAS.map(d => <div key={d} className="text-center text-[11px] font-black text-white/40 py-1">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {celdas.map((dia, i) => {
                if (dia === null) return <div key={`b${i}`} className="aspect-square rounded-xl bg-white/[0.02]" />
                const iso = ymd(y, m, dia)
                const evs = porDia.get(iso) ?? []
                const esHoy = iso === hoyISO
                const conUrl = evs.find(e => e.url)
                const contenido = (
                  <>
                    <span className={`text-xs font-bold ${esHoy ? 'text-pm-red' : evs.length ? 'text-white' : 'text-white/35'}`}>{dia}</span>
                    <span className="flex gap-0.5 mt-1 h-1.5">
                      {evs.slice(0, 3).map((e, k) => <span key={k} className={`w-1.5 h-1.5 rounded-full ${punto(e.color)}`} />)}
                    </span>
                  </>
                )
                const clase = `aspect-square rounded-xl flex flex-col items-center justify-center transition-colors ${
                  esHoy ? 'border-2 border-pm-red bg-pm-red/10' : evs.length ? 'bg-white/10 border border-white/10' : 'bg-white/[0.03]'
                }`
                return conUrl ? (
                  <a key={iso} href={conUrl.url} target="_blank" rel="noopener noreferrer"
                    title={evs.map(e => `${e.hora ? `${e.hora} ` : ''}${e.titulo}`).join(' · ')}
                    className={`${clase} hover:border-pm-red hover:bg-pm-red/15`}>{contenido}</a>
                ) : (
                  <div key={iso} className={clase} title={evs.map(e => e.titulo).join(' · ') || undefined}>{contenido}</div>
                )
              })}
            </div>
          </div>

          {/* Lista del mes */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 max-h-[420px] overflow-y-auto">
            <div className="text-xs font-black text-white/40 uppercase tracking-wider mb-3">
              {MESES[m]} · {delMes.length} actividad{delMes.length === 1 ? '' : 'es'}
            </div>
            {delMes.length === 0 ? (
              <p className="text-white/50 text-sm">Todavía no hay nada publicado para este mes.</p>
            ) : (
              <ul className="space-y-2">
                {delMes.map((e, i) => {
                  const dia = Number(e.fecha.slice(8, 10))
                  return (
                    <li key={`${e.fecha}-${i}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors">
                      <span className={`w-1.5 h-10 rounded-full shrink-0 ${punto(e.color)}`} />
                      <span className="w-9 shrink-0 text-center">
                        <span className="block text-lg font-black text-white leading-none">{dia}</span>
                        <span className="block text-[10px] text-white/40 uppercase">{DIAS[(new Date(e.fecha + 'T12:00:00').getDay() + 6) % 7]}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white truncate">{e.titulo}</span>
                        <span className="block text-[11px] text-white/50">{e.hora || 'Todo el día'}</span>
                      </span>
                      {/* Botón de apuntarse: solo si ese evento lleva a algún sitio. */}
                      {e.url && (
                        <a href={e.url} target={e.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                          className="shrink-0 bg-pm-red hover:bg-pm-red-dark text-white text-[11px] font-black px-3 py-2 rounded-xl transition-colors whitespace-nowrap">
                          Apúntate →
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
