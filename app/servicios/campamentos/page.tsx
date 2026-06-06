'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReservaNavidad from './ReservaNavidad'
import ReservaSemanaSanta from './ReservaSemanaSanta'
import ReservaVerano from './ReservaVerano'
import { SEMANAS_VERANO } from './config'

type Panel = 'navidad' | 'semanasanta' | 'verano'

const HABILIDADES = [
  { nombre: 'Agilidad', icon: '⚡', desc: 'Parkour y movimiento libre' },
  { nombre: 'Vuelo', icon: '🦅', desc: 'Telas aéreas y saltos' },
  { nombre: 'Destreza', icon: '🤹', desc: 'Malabares y circo' },
  { nombre: 'Fuerza', icon: '💪', desc: 'Gimnasia acrobática' },
  { nombre: 'Resistencia', icon: '🔋', desc: 'Circuitos y retos' },
  { nombre: 'Equilibrio', icon: '⚖️', desc: 'Equilibrios y precisión' },
  { nombre: 'Coordinación', icon: '🎯', desc: 'Dinámicas grupales' },
  { nombre: 'Equipo', icon: '🤝', desc: 'Trabajo cooperativo' },
]

const PANELS: { id: Panel; label: string; emoji: string; color: string; colorLight: string; colorText: string; subtitulo: string }[] = [
  { id: 'navidad', label: 'Navidad', emoji: '⛄', color: 'bg-blue-600', colorLight: 'bg-blue-50', colorText: 'text-blue-700', subtitulo: '26 – 30 dic · 5 días' },
  { id: 'semanasanta', label: 'Semana Santa', emoji: '🌸', color: 'bg-violet-600', colorLight: 'bg-violet-50', colorText: 'text-violet-700', subtitulo: 'Semana Santa 2026' },
  { id: 'verano', label: 'Verano', emoji: '☀️', color: 'bg-pm-red', colorLight: 'bg-pm-red-light', colorText: 'text-pm-red', subtitulo: '22 jun – 14 ago · 8 semanas' },
]

export default function CampamentosPage() {
  const [panelActivo, setPanelActivo] = useState<Panel>('verano')
  const panel = PANELS.find(p => p.id === panelActivo)!

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

      {/* HERO — Escuela de Superhéroes */}
      <section className="bg-pm-navy text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-3">🦸</div>
          <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            ⚡ Escuela de Superhéroes — Planeta Movimiento
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Campamentos<br/>
            <span className="text-pm-red">que transforman</span>
          </h1>
          <p className="text-white/65 text-base max-w-2xl mx-auto mb-8">
            Gimnasia acrobática, parkour, telas aéreas, circo, malabares y mucho más.
            Convertimos a los niños en auténticos superhéroes a través del movimiento.
          </p>

          {/* Habilidades de superhéroe */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-3xl mx-auto">
            {HABILIDADES.map(({ nombre, icon, desc }) => (
              <div key={nombre} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center hover:bg-white/10 transition-colors cursor-default" title={desc}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-white text-xs font-bold leading-tight">{nombre}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTOR DE CAMPAMENTO */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {PANELS.map(p => (
              <button
                key={p.id}
                onClick={() => setPanelActivo(p.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 border-b-3 border-b-2 font-bold text-sm transition-all ${
                  panelActivo === p.id
                    ? `border-b-pm-red text-pm-red bg-pm-red-light`
                    : 'border-b-transparent text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
                }`}
              >
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
              {/* Hero Navidad */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-white text-center">
                <div className="text-5xl mb-3">⛄🦸❄️</div>
                <h2 className="text-3xl font-black mb-2">Campamento de Navidad</h2>
                <p className="text-blue-200 text-sm mb-4">Escuela de Superhéroes · Edición Invierno</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['5 días', '9:00 – 14:00', '26 – 30 dic', 'Desde 4 años'].map(b => (
                    <span key={b} className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-lg mb-3">¿Qué incluye?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Durante 5 días los niños vivirán una aventura única en nuestra <strong className="text-pm-navy">Escuela de Superhéroes</strong>.
                  Cada jornada está llena de retos, actividades y dinámicas lúdicas que desarrollan sus habilidades motrices
                  mientras se lo pasan en grande.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['Gimnasia acrobática', 'Parkour', 'Telas aéreas', 'Equilibrios', 'Circo y malabares', 'Dinámicas lúdicas'].map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 font-bold">✓</span>{a}
                    </div>
                  ))}
                </div>
              </div>

              {/* Horario */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-sm mb-3">⏰ Horario</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-blue-700">9:00</div>
                    <div className="text-xs text-blue-500">Llegada</div>
                  </div>
                  <div className="text-gray-400 font-bold">→</div>
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-blue-700">14:00</div>
                    <div className="text-xs text-blue-500">Recogida</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget reserva */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 text-white px-5 py-4">
                  <div className="font-black text-base">⛄ Reservar Campamento de Navidad</div>
                  <div className="text-blue-200 text-xs mt-0.5">Elige los días y completa la solicitud</div>
                </div>
                <div className="p-5"><ReservaNavidad /></div>
              </div>
            </div>
          </div>
        )}

        {/* ── SEMANA SANTA ── */}
        {panelActivo === 'semanasanta' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-violet-700 to-violet-900 rounded-2xl p-8 text-white text-center">
                <div className="text-5xl mb-3">🌸🦸🌺</div>
                <h2 className="text-3xl font-black mb-2">Campamento de Semana Santa</h2>
                <p className="text-violet-200 text-sm mb-4">Escuela de Superhéroes · Edición Primavera</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['5 días', '9:00 – 14:00', 'Semana Santa 2026', 'Desde 4 años'].map(b => (
                    <span key={b} className="bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-lg mb-3">¿Qué incluye?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  El campamento de Semana Santa sigue el mismo formato de <strong className="text-pm-navy">Escuela de Superhéroes</strong>.
                  5 jornadas de movimiento, creatividad y juego en equipo con todas las disciplinas del club.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['Gimnasia acrobática', 'Parkour', 'Telas aéreas', 'Equilibrios', 'Circo y malabares', 'Dinámicas lúdicas'].map(a => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-violet-600 font-bold">✓</span>{a}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-sm mb-3">⏰ Horario</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-violet-700">9:00</div>
                    <div className="text-xs text-violet-500">Llegada</div>
                  </div>
                  <div className="text-gray-400 font-bold">→</div>
                  <div className="flex-1 bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-violet-700">14:00</div>
                    <div className="text-xs text-violet-500">Recogida</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-violet-600 text-white px-5 py-4">
                  <div className="font-black text-base">🌸 Reservar Semana Santa</div>
                  <div className="text-violet-200 text-xs mt-0.5">Elige los días y completa la solicitud</div>
                </div>
                <div className="p-5"><ReservaSemanaSanta /></div>
              </div>
            </div>
          </div>
        )}

        {/* ── VERANO ── */}
        {panelActivo === 'verano' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10">
            <div className="space-y-6">
              {/* Hero verano */}
              <div className="bg-gradient-to-br from-pm-navy to-pm-navy-md rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">☀️🦸🌊</div>
                  <h2 className="text-3xl font-black mb-2">Campamento de Verano</h2>
                  <p className="text-white/65 text-sm mb-4">Escuela de Superhéroes · 8 semanas · 22 jun – 14 ago 2026</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['22 jun – 14 ago', 'L – V', '9:00 – 14:00', '8 semanas', 'Desde 4 años'].map(b => (
                      <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                    ))}
                  </div>
                </div>

                {/* Precios */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black">25 €</div>
                    <div className="text-white/70 text-xs">día suelto</div>
                  </div>
                  <div className="bg-pm-red/80 border border-pm-red rounded-xl p-4 text-center">
                    <div className="text-2xl font-black">95 €</div>
                    <div className="text-white/80 text-xs">semana completa</div>
                    <div className="text-xs text-red-200 mt-0.5">vs 125 € en días sueltos</div>
                  </div>
                </div>
              </div>

              {/* Calendario semanal visual */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-base mb-4">Calendario de semanas</h3>
                <div className="space-y-2">
                  {SEMANAS_VERANO.map(semana => (
                    <div key={semana.id} className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 ${semana.colorLight} ${semana.colorBorder}`}>
                      <span className="text-xl">{semana.emoji}</span>
                      <div className="flex-1">
                        <div className={`font-black text-sm ${semana.colorText}`}>Semana {semana.id} — {semana.elemento}</div>
                        <div className="text-xs text-gray-500">Sentido protagonista: {semana.sentido}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-600">
                          {new Date(semana.inicio + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} –{' '}
                          {new Date(semana.fin + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className={`text-xs font-black ${semana.colorText}`}>95 € / sem</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-black text-pm-navy text-sm mb-3">⏰ Horarios disponibles</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Matinal (opcional)', horario: '8:00 – 9:00', color: 'bg-amber-50 border-amber-200 text-amber-700', extra: true },
                    { label: 'Horario base', horario: '9:00 – 14:00', color: 'bg-green-50 border-green-200 text-green-700', extra: false },
                    { label: 'Ampliación (opcional)', horario: '14:00 – 15:00', color: 'bg-blue-50 border-blue-200 text-blue-700', extra: true },
                  ].map(h => (
                    <div key={h.label} className={`flex justify-between items-center border rounded-xl px-4 py-2.5 ${h.color}`}>
                      <span className="text-sm font-semibold">{h.label}</span>
                      <span className="font-black">{h.horario}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">El horario base incluye de 9:00 a 14:00, de lunes a viernes. Sábados y domingos no hay campamento.</p>
              </div>

              {/* Cupón hermanos info */}
              <div className="bg-pm-red-light border border-pm-red/20 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <div>
                  <div className="font-black text-pm-navy text-sm">Descuento hermanos — 15%</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Si dos o más hermanos se apuntan al campamento, aplica un <strong>15% de descuento</strong>.
                    Introduce el cupón <strong className="text-pm-red">HERMANOS</strong> al hacer la reserva.
                  </p>
                </div>
              </div>
            </div>

            {/* Widget de reserva verano */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-pm-red text-white px-5 py-4">
                  <div className="font-black text-base">☀️ Reservar Campamento de Verano</div>
                  <div className="text-red-200 text-xs mt-0.5">Selecciona semanas o días sueltos</div>
                </div>
                <div className="p-5 max-h-[80vh] overflow-y-auto">
                  <ReservaVerano />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
