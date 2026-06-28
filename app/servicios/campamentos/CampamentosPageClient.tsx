'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Galeria } from '@/components/ui/Galeria'
import ReservaBloque from './ReservaBloque'
import ReservaVerano from './ReservaVerano'
import { semanasResueltas, parseFechasLista, type CampamentosConfig } from '@/lib/campamentos/editable'

type Panel = 'navidad' | 'semanasanta' | 'verano'

const HABILIDADES = [
  { nombre: 'Agilidad',      img: '/insignias/agilidad.png',            desc: 'Parkour y movimiento libre' },
  { nombre: 'Fuerza',        img: '/insignias/fuerza.png',              desc: 'Gimnasia acrobática' },
  { nombre: 'Equilibrio',    img: '/insignias/equilibrio.png',          desc: 'Equilibrios y control del cuerpo' },
  { nombre: 'Coordinación',  img: '/insignias/coordinacion.png',        desc: 'Dinámicas y juegos grupales' },
  { nombre: 'Precisión',     img: '/insignias/precision.png',           desc: 'Puntería y control del movimiento' },
  { nombre: 'Vuelo',         img: '/insignias/vuelo.png',               desc: 'Telas aéreas y saltos' },
  { nombre: 'Concentración', img: '/insignias/concentracion.png',       desc: 'Foco y atención plena' },
  { nombre: 'Rastreo',       img: '/insignias/rastreo.png',             desc: 'Pistas, juegos y orientación' },
  { nombre: 'Exploración',   img: '/insignias/exploracion.png',         desc: 'Aventura y descubrimiento' },
  { nombre: 'Empatía',       img: '/insignias/empatia.png',             desc: 'Ponerse en el lugar del otro' },
  { nombre: 'Respeto',       img: '/insignias/respeto.png',             desc: 'Cuidar a los demás y al entorno' },
  { nombre: 'Equipo',        img: '/insignias/trabajo-equipo.png',      desc: 'Trabajo cooperativo' },
  { nombre: 'Naturaleza',    img: '/insignias/guardian-naturaleza.png', desc: 'Guardián del medio ambiente' },
]

const dcorta = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
function rangoCorto(dias: string[]): string {
  if (!dias.length) return 'Fechas por confirmar'
  return dias.length === 1 ? dcorta(dias[0]) : `${dcorta(dias[0])} – ${dcorta(dias[dias.length - 1])}`
}

type OcupacionCampamentos = { verano: Record<string, number>; navidad: Record<string, number>; ssanta: Record<string, number> }

export default function CampamentosPageClient({ cfg, ocupacion }: { cfg: CampamentosConfig; ocupacion: OcupacionCampamentos }) {
  const [panelActivo, setPanelActivo] = useState<Panel>('verano')

  const SEMANAS = semanasResueltas(cfg)
  const navDias = parseFechasLista(cfg.navidadFechas)
  const ssDias = parseFechasLista(cfg.ssantaFechas)

  const PANELS: { id: Panel; label: string; emoji: string; subtitulo: string }[] = [
    { id: 'navidad', label: 'Navidad', emoji: '⛄', subtitulo: `${rangoCorto(navDias)} · ${navDias.length} días` },
    { id: 'semanasanta', label: 'Semana Santa', emoji: '🌸', subtitulo: `${rangoCorto(ssDias)} · ${ssDias.length} días` },
    { id: 'verano', label: 'Verano', emoji: '☀️', subtitulo: SEMANAS.length ? `${dcorta(SEMANAS[0].inicio)} – ${dcorta(SEMANAS[SEMANAS.length - 1].fin)} · ${SEMANAS.length} semanas` : '8 semanas' },
  ]

  return (
    <main className="bg-pm-bg min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/ocio" className="hover:text-pm-red transition-colors">Ocio</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Campamentos</span>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section className="bg-pm-navy text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-3">🦸</div>
          <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            ⚡ Escuela de Superhéroes — Planeta Movimiento
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Campamentos<br/><span className="text-pm-red">que transforman</span></h1>
          <p className="text-white/65 text-base max-w-2xl mx-auto mb-8">
            Gimnasia acrobática, parkour, telas aéreas, circo, malabares y mucho más.
            Convertimos a los niños en auténticos superhéroes a través del movimiento.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {HABILIDADES.map(({ nombre, img, desc }) => (
              <div key={nombre} className="w-[78px] bg-white/5 border border-white/10 rounded-xl p-2 text-center hover:bg-white/10 transition-colors cursor-default" title={desc}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Insignia ${nombre}`} className="h-9 w-9 object-contain mx-auto mb-1" />
                <div className="text-white text-[11px] font-bold leading-tight">{nombre}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTOR */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {PANELS.map(p => (
              <button key={p.id} onClick={() => setPanelActivo(p.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 border-b-2 font-bold text-sm transition-all ${
                  panelActivo === p.id ? 'border-b-pm-red text-pm-red bg-pm-red-light' : 'border-b-transparent text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
                }`}>
                <span className="text-xl">{p.emoji}</span>
                <div className="text-center sm:text-left">
                  <div className="font-black text-xs sm:text-sm">{p.label}</div>
                  <div className="text-xs font-normal opacity-60 hidden sm:block">{p.subtitulo}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── NAVIDAD ── */}
        {panelActivo === 'navidad' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-white text-center">                <h2 className="text-3xl font-black mb-2">Campamento de Navidad</h2>
                <p className="text-blue-200 text-sm mb-4">Escuela de Superhéroes · Edición Invierno</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[`${navDias.length} días`, cfg.navidadHorario, rangoCorto(navDias), 'Desde 4 años'].map(b => (
                    <span key={b} className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
              {cfg.navidadImagen && (
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative aspect-[16/9]">
                  <img src={cfg.navidadImagen} alt="Campamento de Navidad" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-lg mb-3">¿Qué incluye?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-line">{cfg.navidadDescripcion}</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Gimnasia acrobática', 'Parkour', 'Telas aéreas', 'Equilibrios', 'Circo y malabares', 'Dinámicas lúdicas'].map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700"><span className="text-blue-600 font-bold">✓</span>{a}</div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-blue-800">{cfg.precioDiaSuelto} €</div>
                  <div className="text-blue-600 text-xs">día suelto</div>
                </div>
                <div className="bg-blue-600 border border-blue-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">{cfg.precioSemana} €</div>
                  <div className="text-blue-100 text-xs">semana completa</div>
                  <div className="text-xs text-blue-200 mt-0.5">vs {cfg.precioDiaSuelto * 5} € en días sueltos</div>
                </div>
              </div>
            </div>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 text-white px-5 py-4">
                  <div className="font-black text-base">⛄ Reservar Campamento de Navidad</div>
                  <div className="text-blue-200 text-xs mt-0.5">Elige los días y paga tu reserva</div>
                </div>
                <div className="p-5 max-h-[80vh] overflow-y-auto">
                  <ReservaBloque cfg={cfg} servicio="Campamento de Navidad" fechas={navDias} horario={cfg.navidadHorario} color="blue" nombreCorto="Navidad" ocupacionDia={ocupacion.navidad} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SEMANA SANTA ── */}
        {panelActivo === 'semanasanta' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-violet-700 to-violet-900 rounded-2xl p-8 text-white text-center">                <h2 className="text-3xl font-black mb-2">Campamento de Semana Santa</h2>
                <p className="text-violet-200 text-sm mb-4">Escuela de Superhéroes · Edición Primavera</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[`${ssDias.length} días`, cfg.ssantaHorario, rangoCorto(ssDias), 'Desde 4 años'].map(b => (
                    <span key={b} className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
              {cfg.ssantaImagen && (
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative aspect-[16/9]">
                  <img src={cfg.ssantaImagen} alt="Campamento de Semana Santa" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-lg mb-3">¿Qué incluye?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 whitespace-pre-line">{cfg.ssantaDescripcion}</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Gimnasia acrobática', 'Parkour', 'Telas aéreas', 'Equilibrios', 'Circo y malabares', 'Dinámicas lúdicas'].map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700"><span className="text-violet-600 font-bold">✓</span>{a}</div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-violet-800">{cfg.precioDiaSuelto} €</div>
                  <div className="text-violet-600 text-xs">día suelto</div>
                </div>
                <div className="bg-violet-600 border border-violet-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-white">{cfg.precioSemana} €</div>
                  <div className="text-violet-100 text-xs">semana completa</div>
                  <div className="text-xs text-violet-200 mt-0.5">vs {cfg.precioDiaSuelto * 5} € en días sueltos</div>
                </div>
              </div>
            </div>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-violet-600 text-white px-5 py-4">
                  <div className="font-black text-base">🌸 Reservar Semana Santa</div>
                  <div className="text-violet-200 text-xs mt-0.5">Elige los días y paga tu reserva</div>
                </div>
                <div className="p-5 max-h-[80vh] overflow-y-auto">
                  <ReservaBloque cfg={cfg} servicio="Campamento de Semana Santa" fechas={ssDias} horario={cfg.ssantaHorario} color="violet" nombreCorto="Semana Santa" ocupacionDia={ocupacion.ssanta} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VERANO ── */}
        {panelActivo === 'verano' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-pm-navy to-pm-navy-md rounded-2xl p-8 text-white">
                <div className="text-center mb-6">                  <h2 className="text-3xl font-black mb-2">Campamento de Verano</h2>
                  <p className="text-white/65 text-sm mb-4">Escuela de Superhéroes · {SEMANAS.length} semanas</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[SEMANAS.length ? `${dcorta(SEMANAS[0].inicio)} – ${dcorta(SEMANAS[SEMANAS.length - 1].fin)}` : '', 'L – V', cfg.veranoHorario, `${SEMANAS.length} semanas`, 'Desde 4 años'].filter(Boolean).map(b => (
                      <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black">{cfg.precioDiaSuelto} €</div>
                    <div className="text-white/70 text-xs">día suelto</div>
                  </div>
                  <div className="bg-pm-red/80 border border-pm-red rounded-xl p-4 text-center">
                    <div className="text-2xl font-black">{cfg.precioSemana} €</div>
                    <div className="text-white/80 text-xs">semana completa</div>
                    <div className="text-xs text-red-200 mt-0.5">vs {cfg.precioDiaSuelto * 5} € en días sueltos</div>
                  </div>
                </div>
              </div>

              {cfg.veranoImagen && (
                <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative aspect-[16/9]">
                  <img src={cfg.veranoImagen} alt="Campamento de Verano" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              {cfg.veranoDescripcion && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-black text-pm-navy text-lg mb-3">¿Qué incluye?</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{cfg.veranoDescripcion}</p>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-base mb-4">Calendario de semanas</h3>
                <div className="space-y-2">
                  {SEMANAS.map(semana => (
                    <div key={semana.id} className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 ${semana.colorLight} ${semana.colorBorder}`}>
                      <span className="text-xl">{semana.emoji}</span>
                      <div className="flex-1">
                        <div className={`font-black text-sm ${semana.colorText}`}>Semana {semana.id} — {semana.elemento}</div>
                        <div className="text-xs text-gray-500">Sentido protagonista: {semana.sentido}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-600">{dcorta(semana.inicio)} – {dcorta(semana.fin)}</div>
                        <div className={`text-xs font-black ${semana.colorText}`}>{cfg.precioSemana} € / sem</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-pm-red-light border border-pm-red/20 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <div>
                  <div className="font-black text-pm-navy text-sm">Descuento hermanos — {cfg.descuentoHermanos}%</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Si dos o más hermanos se apuntan, aplica un <strong>{cfg.descuentoHermanos}% de descuento</strong>.
                    Introduce el cupón <strong className="text-pm-red">{cfg.cuponHermanos}</strong> al reservar.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-pm-red text-white px-5 py-4">
                  <div className="font-black text-base">☀️ Reservar Campamento de Verano</div>
                  <div className="text-red-200 text-xs mt-0.5">Selecciona semanas o días sueltos</div>
                </div>
                <div className="p-5 max-h-[80vh] overflow-y-auto"><ReservaVerano cfg={cfg} ocupacionDia={ocupacion.verano} /></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Galeria slug="campamentos" titulo="Galería de campamentos" subtitulo="Navidad, Semana Santa y Verano · Escuela de Superhéroes" fondo="bg-white" />
    </main>
  )
}
