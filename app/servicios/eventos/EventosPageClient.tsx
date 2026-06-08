'use client'

import Link from 'next/link'
import { Galeria } from '@/components/ui/Galeria'
import { useState } from 'react'
import CalculadoraEventos from './CalculadoraEventos'
import { ReservaDiasSinCole, ReservaDomingos, ReservaHalloween, ReservaMananaMagica } from './EventosInstalaciones'
import type { MananaMagica } from '@/lib/eventos/manana-magica'
import type { EventoCentroCfg } from '@/lib/eventos/centro'

// ─── Datos ────────────────────────────────────────────────────────────────────
const TIPOS_EVENTO = [
  { label: 'Bodas',              icon: '💍' },
  { label: 'Comuniones',         icon: '✝️' },
  { label: 'Bautizos',           icon: '👶' },
  { label: 'Fiestas privadas',   icon: '🎉' },
  { label: 'Eventos familiares', icon: '👨‍👩‍👧‍👦' },
  { label: 'Celebraciones esp.', icon: '🎊' },
]

const INCLUYE_BASE = [
  'Taller de manualidades', 'Taller de circo', 'Juegos dinámicos',
  'Juegos tradicionales', 'Balón fútbol y baloncesto', 'Raquetas bádminton',
  'Juegos cooperativos y de habilidad', 'Todo el material incluido',
]

const FAQ = [
  { q: '¿Dónde se celebra?', a: 'Nos desplazamos a tu lugar: finca, hotel, restaurante, casa o cualquier espacio.' },
  { q: '¿Qué necesitamos preparar?', a: 'Nada. Llevamos todo el material. Solo un espacio de unos 20-30 m².' },
  { q: '¿Edad mínima?', a: 'Desde 3-4 años. Las actividades se adaptan al rango de edades del grupo.' },
  { q: '¿Si hay más niños de los previstos?', a: 'Sin problema. Al superar 12 participantes se aplica el Pack Grande automáticamente.' },
  { q: '¿Con cuánta antelación reservar?', a: 'Mínimo 2-3 semanas. En primavera-verano recomendamos más tiempo.' },
  { q: '¿El desplazamiento está incluido?', a: 'Sí, dentro de la provincia de Cuenca. Fuera de provincia, consúltanos.' },
]

// ─── Tabs principales ─────────────────────────────────────────────────────────
type TabPrincipal = 'externo' | 'centro'
type TabCentro    = 'diassinc' | 'domingos' | 'halloween' | 'manana'

const TABS_CENTRO = [
  { id: 'diassinc'  as TabCentro, label: 'Días Sin Cole',       emoji: '⚡', sub: 'Festivos escolares · 9:00-14:00' },
  { id: 'domingos'  as TabCentro, label: 'Domingos en Familia', emoji: '👨‍👩‍👧‍👦', sub: 'Todos los domingos · 11:00-13:00' },
  { id: 'manana'    as TabCentro, label: 'Mañanas Mágicas',     emoji: '✨', sub: 'Jornada temática · personaje del mes' },
  { id: 'halloween' as TabCentro, label: 'Noche de Halloween',  emoji: '🧟', sub: '31 oct · 22:00 – 09:00' },
]

// ─── Panel Externo ────────────────────────────────────────────────────────────
function PanelExterno() {
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Intro + tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-black text-pm-navy mb-3">Animación en tu evento</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            Nos desplazamos al lugar donde celebras el evento con todos los monitores y el material.
            Los niños disfrutan, los adultos descansan. Desde bodas hasta fiestas privadas.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_EVENTO.map(({ label, icon }) => (
              <div key={label} className="bg-pm-bg border border-gray-200 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs font-semibold text-pm-navy leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Packs resumen */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-gray-200 rounded-2xl p-5">
            <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Pack Básico</div>
            <div className="text-3xl font-black text-pm-navy mb-1">150 €</div>
            <div className="text-xs text-gray-400 mb-3">+ IVA · hasta 12 niños</div>
            <div className="text-xs text-pm-navy font-bold mb-2">👨‍🏫 1 monitor · 2 horas</div>
            <div className="space-y-1">
              {INCLUYE_BASE.slice(0, 4).map(i => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>{i}
                </div>
              ))}
              <div className="text-xs text-gray-400">+ 4 más incluidos</div>
            </div>
          </div>

          <div className="border-2 border-pm-red rounded-2xl p-5 bg-pm-red-light relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pm-red text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
              Obligatorio +12
            </div>
            <div className="text-xs font-black text-pm-red/70 uppercase tracking-wider mb-2">Pack Grande</div>
            <div className="text-3xl font-black text-pm-red mb-1">250 €</div>
            <div className="text-xs text-gray-400 mb-3">+ IVA · sin límite</div>
            <div className="text-xs text-pm-navy font-bold mb-2">👨‍🏫👨‍🏫 2 monitores · 2 horas</div>
            <div className="space-y-1">
              {INCLUYE_BASE.slice(0, 4).map(i => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="text-pm-red font-bold">✓</span>{i}
                </div>
              ))}
              <div className="text-xs text-gray-400">+ 4 más incluidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Extras + horas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-black text-pm-navy text-sm mb-4">✨ Extras disponibles</h3>
          <div className="space-y-3">
            {[
              { icon: '🎨', nombre: 'Pintacaras + tatuajes', precio: 50  },
              { icon: '🤸', nombre: 'AirTrack',               precio: 250 },
              { icon: '🎪', nombre: 'Pórtico aéreo',          precio: 300 },
            ].map(({ icon, nombre, precio }) => (
              <div key={nombre} className="flex items-center justify-between bg-pm-bg rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-semibold text-pm-navy">{nombre}</span>
                </div>
                <span className="font-black text-pm-navy">+{precio} €</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-black text-pm-navy text-sm mb-4">⏱ Horas adicionales</h3>
          <p className="text-xs text-gray-500 mb-4">40 € por hora y por monitor contratado</p>
          <div className="space-y-2">
            <div className="bg-pm-bg rounded-xl p-3">
              <div className="text-xs font-bold text-pm-navy mb-1">Pack Básico (1 monitor)</div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">1h extra</span><strong>40 €</strong></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">2h extra</span><strong>80 €</strong></div>
            </div>
            <div className="bg-pm-red-light border border-pm-red/20 rounded-xl p-3">
              <div className="text-xs font-bold text-pm-navy mb-1">Pack Grande (2 monitores)</div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">1h extra</span><strong>80 €</strong></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">2h extra</span><strong>160 €</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculadora + formulario */}
      <div className="bg-pm-bg rounded-2xl p-6 border border-gray-200">
        <h3 className="font-black text-pm-navy text-lg mb-6 text-center">Calculadora y solicitud de presupuesto</h3>
        <CalculadoraEventos />
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-black text-pm-navy text-base mb-4">Preguntas frecuentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAQ.map(({ q, a }, i) => (
            <button key={i} onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
              className="text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-pm-red/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-pm-navy text-sm">{q}</span>
                <svg className={`w-4 h-4 text-pm-red shrink-0 mt-0.5 transition-transform ${faqAbierto === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              {faqAbierto === i && <p className="text-xs text-gray-600 mt-2 leading-relaxed border-t border-gray-100 pt-2">{a}</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Panel Días Sin Cole ──────────────────────────────────────────────────────
function PanelDiasSinCole({ cfg }: { cfg: EventoCentroCfg }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 text-white">
            <div className="text-5xl mb-3">⚡🦸</div>
            <h2 className="text-3xl font-black mb-2">Días Sin Cole</h2>
            <p className="text-amber-100 text-sm leading-relaxed mb-4">
              En los festivos escolares abrimos nuestras instalaciones para que los niños vivan una mañana épica de la Escuela de Superhéroes mientras las familias concilian.
            </p>
            <div className="flex flex-wrap gap-2">
              {['9:00 – 14:00', '30 € + IVA / niño', 'Desde 4 años', 'Festivos escolares'].map(b => (
                <span key={b} className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-black text-pm-navy text-sm mb-3">🦸 Habilidades de superhéroe</h3>
              <div className="flex flex-wrap gap-2">
                {['⚡ Agilidad','💪 Fuerza','🎯 Coordinación','⚖️ Equilibrio','🔋 Resistencia','🤹 Destreza','🤝 Equipo'].map(h => (
                  <span key={h} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">{h}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-black text-pm-navy text-sm mb-3">🏃 Actividades incluidas</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {['Gimnasia acrobática','Parkour','Telas aéreas','Equilibrios','Circuitos','Juegos cooperativos','Retos físicos','Práctica libre'].map(a => (
                  <div key={a} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <span className="text-amber-500 font-bold">✓</span>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-amber-500 text-white px-5 py-4">
              <div className="font-black text-base">⚡ Reservar plaza</div>
              <div className="text-amber-100 text-xs mt-0.5">Elige el día y completa la solicitud</div>
            </div>
            <div className="p-5"><ReservaDiasSinCole cfg={cfg} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Panel Domingos ───────────────────────────────────────────────────────────
function PanelDomingos({ cfg }: { cfg: EventoCentroCfg }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
            <div className="text-5xl mb-3">👨‍👩‍👧‍👦🎉</div>
            <h2 className="text-3xl font-black mb-2">Domingos en Familia</h2>
            <p className="text-emerald-100 text-sm leading-relaxed mb-4">
              Práctica libre dentro de nuestras instalaciones. Sin clases, sin presión — solo movimiento, juego y tiempo de calidad en familia.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Todos los domingos','11:00 – 13:00','15 € / niño','Adultos gratis'].map(b => (
                <span key={b} className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-black text-pm-navy text-sm mb-3">🌿 El ambiente</h3>
              <div className="space-y-2">
                {['🎵 Música de fondo','🤸 Todo el material disponible','🛡 Supervisión de monitores','💬 Monitores resuelven dudas','🏆 Espacios de juego libre'].map(i => (
                  <div key={i} className="text-sm text-gray-700">{i}</div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-black text-pm-navy text-sm mb-3">👶 Edades</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                  <div className="font-bold text-green-700">Desde 2 años</div>
                  <div className="text-xs text-green-600">15 € por niño</div>
                </div>
                <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 text-sm">
                  <div className="font-bold text-pm-navy">Menores de 2 años</div>
                  <div className="text-xs text-gray-500">Entrada gratuita acompañados</div>
                </div>
                <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 text-sm">
                  <div className="font-bold text-pm-navy">Adultos</div>
                  <div className="text-xs text-gray-500">Siempre gratis · Deben permanecer</div>
                </div>
              </div>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-700">
                ⚠ No es servicio de guardería. Los padres permanecen en la instalación.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-emerald-600 text-white px-5 py-4">
              <div className="font-black text-base">🗓 Reservar domingo</div>
              <div className="text-emerald-100 text-xs mt-0.5">Elige la semana y completa la solicitud</div>
            </div>
            <div className="p-5"><ReservaDomingos cfg={cfg} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Panel Mañanas Mágicas ────────────────────────────────────────────────────
function PanelMananaMagica({ cfg }: { cfg: MananaMagica }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-2xl p-8 text-white">
            <div className="text-5xl mb-3">{cfg.emoji}🎉</div>
            <div className="text-white/70 font-black text-xs uppercase tracking-widest mb-1">Mañanas Mágicas · Personaje del mes</div>
            <h2 className="text-3xl font-black mb-1">Mañanas Mágicas</h2>
            <div className="text-white font-black text-lg mb-3">«{cfg.personaje}»</div>
            <p className="text-fuchsia-100 text-sm leading-relaxed mb-4">{cfg.descripcion}</p>
            <div className="flex flex-wrap gap-2">
              {[cfg.fechaTexto, cfg.horario, `${cfg.precio} € / niño`, `Hermanos −${cfg.descuentoHermanos}%`, cfg.edades].filter(Boolean).map(b => (
                <span key={b} className="bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-pm-navy text-sm uppercase tracking-wider mb-4">✨ Qué incluye la jornada</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cfg.actividades.map(a => (
                <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-fuchsia-500 font-bold">✓</span>{a}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-fuchsia-600 text-white px-5 py-4">
              <div className="font-black text-base">✨ Reservar — Mañana Mágica</div>
              <div className="text-fuchsia-100 text-xs mt-0.5">{cfg.personaje} · {cfg.fechaTexto}</div>
            </div>
            <div className="p-5"><ReservaMananaMagica cfg={cfg} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Panel Halloween ──────────────────────────────────────────────────────────
function PanelHalloween({ cfg }: { cfg: EventoCentroCfg }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-orange-950 rounded-2xl p-8 text-white border border-orange-500/30">
            <div className="text-5xl mb-3">🧟🎃👻</div>
            <div className="text-orange-400 font-black text-xs uppercase tracking-widest mb-1">Evento anual especial</div>
            <h2 className="text-3xl font-black mb-1">Noche de Halloween</h2>
            <div className="text-orange-400 font-black text-lg mb-3">«Apocalipsis Zombie»</div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Una noche épica e inolvidable. Fiesta de pijamas temática, gymkana zombie, actividades nocturnas, película de terror y desayuno con churros al amanecer.
            </p>
            <div className="flex flex-wrap gap-2">
              {['31 oct → 1 nov','22:00 – 09:00','Mín. 10 años','20 plazas'].map(b => (
                <span key={b} className="bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-6">
            <h3 className="font-black text-orange-400 text-sm uppercase tracking-wider mb-5">Programa de la noche</h3>
            <div className="space-y-3">
              {[
                { hora: '22:00',          evento: '🧟 Inicio del apocalipsis', highlight: true },
                { hora: '22:00 – 23:00',  evento: 'Gymkana temática zombie' },
                { hora: '23:00 – 00:00',  evento: 'Actividades y retos especiales' },
                { hora: '00:00+',         evento: 'Práctica libre' },
                { hora: 'Madrugada',      evento: '🎬 Película de terror (apta +10 años)' },
                { hora: '08:00 – 09:00',  evento: '🍫 Desayuno: churros con chocolate', highlight: true },
                { hora: '09:00',          evento: '🏠 Recogida por las familias' },
              ].map(({ hora, evento, highlight }) => (
                <div key={hora} className={`flex items-center gap-4 text-sm ${highlight ? 'text-orange-400 font-bold' : 'text-gray-400'}`}>
                  <span className="text-orange-500 font-black text-xs w-28 shrink-0">{hora}</span>
                  <span>{evento}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-gray-900 border border-orange-500/30 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-orange-900/60 border-b border-orange-500/30 text-white px-5 py-4">
              <div className="font-black text-base text-orange-400">🧟 Reservar plaza — 2026</div>
              <div className="text-orange-300/60 text-xs mt-0.5">Plazas muy limitadas · Respuesta en 24h</div>
            </div>
            <div className="p-5"><ReservaHalloween cfg={cfg} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal (cliente) ───────────────────────────────────────────────
export default function EventosPageClient({ mananaMagica, diasSinCole, domingos, halloween }: {
  mananaMagica: MananaMagica; diasSinCole: EventoCentroCfg; domingos: EventoCentroCfg; halloween: EventoCentroCfg
}) {
  const [tabPrincipal, setTabPrincipal] = useState<TabPrincipal>('externo')
  const [tabCentro, setTabCentro]       = useState<TabCentro>('diassinc')

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
            <span className="text-pm-navy font-semibold">Eventos y celebraciones</span>
          </nav>
        </div>
      </div>

      {/* Hero compacto */}
      <section className="bg-pm-navy text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-3">🎪</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            Eventos y celebraciones
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Animación profesional a domicilio para tus eventos, y experiencias especiales en nuestro centro.
          </p>
        </div>
      </section>

      {/* ── SELECTOR PRINCIPAL ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <button onClick={() => setTabPrincipal('externo')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-all ${
                tabPrincipal === 'externo'
                  ? 'border-pm-red text-pm-red bg-pm-red-light'
                  : 'border-transparent text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
              }`}>
              <span className="text-xl">🏡</span>
              <div className="text-center sm:text-left">
                <div className="font-black text-xs sm:text-sm">Animación en tu evento</div>
                <div className="text-xs font-normal opacity-60 hidden sm:block">Bodas · Comuniones · Bautizos · Fiestas</div>
              </div>
            </button>
            <button onClick={() => setTabPrincipal('centro')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-4 border-b-2 font-bold text-sm transition-all ${
                tabPrincipal === 'centro'
                  ? 'border-pm-red text-pm-red bg-pm-red-light'
                  : 'border-transparent text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
              }`}>
              <span className="text-xl">🏟️</span>
              <div className="text-center sm:text-left">
                <div className="font-black text-xs sm:text-sm">Eventos en el centro</div>
                <div className="text-xs font-normal opacity-60 hidden sm:block">Días Sin Cole · Domingos · Mañanas Mágicas · Halloween</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── PANEL EXTERNO ── */}
      {tabPrincipal === 'externo' && <PanelExterno />}

      {/* ── PANEL CENTRO ── */}
      {tabPrincipal === 'centro' && (
        <>
          {/* Sub-selector eventos en centro */}
          <div className="bg-pm-bg border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-1 overflow-x-auto">
                {TABS_CENTRO.map(t => (
                  <button key={t.id} onClick={() => setTabCentro(t.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                      tabCentro === t.id
                        ? 'border-pm-red text-pm-red'
                        : 'border-transparent text-gray-500 hover:text-pm-navy'
                    }`}>
                    <span>{t.emoji}</span>
                    <div>
                      <div>{t.label}</div>
                      <div className="text-xs font-normal opacity-60">{t.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {tabCentro === 'diassinc'  && <PanelDiasSinCole cfg={diasSinCole} />}
          {tabCentro === 'domingos'  && <PanelDomingos cfg={domingos} />}
          {tabCentro === 'manana'    && <PanelMananaMagica cfg={mananaMagica} />}
          {tabCentro === 'halloween' && <PanelHalloween cfg={halloween} />}
        </>
      )}

      <Galeria slug="eventos" titulo="Galería" subtitulo="Animación y espectáculos en tus eventos" fondo="bg-pm-bg" />
    </main>
  )
}
