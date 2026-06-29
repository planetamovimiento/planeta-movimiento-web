'use client'

import { useState } from 'react'
import Link from 'next/link'
import { waNegocio } from '@/lib/whatsapp'

// ─── Catálogo de servicios existentes ────────────────────────────────────────
// Solo editamos aquí — las tarjetas se generan automáticamente

type Servicio = {
  id: string
  nombre: string
  desc: string
  edad: string
  href: string          // ruta existente en la web
  icon: string
  grad: string          // gradiente Tailwind
  tags: string[]
  destacado?: boolean
}

const SERVICIOS: Servicio[] = [
  // ── Ocio / Club ──────────────────────────────────────────────────────────
  {
    id: 'cumpleanos',
    nombre: 'Celebración de Cumpleaños',
    desc: '2 horas de actividad guiada, juegos en grupo y merienda incluida en nuestras instalaciones.',
    edad: 'Todas las edades',
    href: '/servicios/cumpleanos',
    icon: '🎂',
    grad: 'from-pm-red to-pm-red-dark',
    tags: ['2-5', '6-15', 'ocio'],
    destacado: true,
  },
  {
    id: 'domingos',
    nombre: 'Domingos en Familia',
    desc: 'Práctica libre en nuestras instalaciones todos los domingos. Los adultos entran gratis.',
    edad: 'Desde 2 años · Adultos gratis',
    href: '/servicios/eventos',
    icon: '👨‍👩‍👧‍👦',
    grad: 'from-emerald-600 to-emerald-800',
    tags: ['2-5', 'ocio'],
  },
  {
    id: 'manana-magica',
    nombre: 'Mañanas Mágicas',
    desc: 'Jornada temática con un personaje invitado distinto cada mes: show, manualidades, deportes y photocall.',
    edad: 'Infantil y primaria',
    href: '/servicios/eventos',
    icon: '✨',
    grad: 'from-fuchsia-600 to-violet-600',
    tags: ['2-5'],
  },
  {
    id: 'diassinc',
    nombre: 'Días Sin Cole',
    desc: 'Escuela de Superhéroes en días festivos escolares. Mañana completa de actividades de 9:00 a 14:00.',
    edad: 'Desde 4 años',
    href: '/servicios/eventos',
    icon: '⚡',
    grad: 'from-amber-500 to-orange-600',
    tags: ['2-5', '6-15', 'ocio'],
  },
  {
    id: 'halloween',
    nombre: 'Noche de Halloween',
    desc: 'Fiesta de pijamas temática «Apocalipsis Zombie». Gymkana, actividades nocturnas y churros al amanecer.',
    edad: 'Desde 10 años',
    href: '/servicios/eventos',
    icon: '🧟',
    grad: 'from-gray-900 to-orange-950',
    tags: ['6-15'],
    destacado: true,
  },
  {
    id: 'campamentos',
    nombre: 'Campamentos',
    desc: 'Escuela de Superhéroes en Navidad, Semana Santa y 8 semanas de verano. Circo, parkour, telas aéreas y más.',
    edad: 'Desde 4 años',
    href: '/servicios/campamentos',
    icon: '🏕️',
    grad: 'from-pm-navy to-pm-navy-md',
    tags: ['2-5', '6-15'],
    destacado: true,
  },
  // ── Club (clases regulares) ───────────────────────────────────────────────
  {
    id: 'gimnasia-acrobatica',
    nombre: 'Gimnasia Acrobática y Trampolín',
    desc: 'Acrobacias, saltos y trampolín. Disciplina de suelo con progresión por niveles.',
    edad: 'Desde 6 años',
    href: '/servicios/gimnasia-acrobatica',
    icon: '🤸',
    grad: 'from-pm-red to-pm-red-dark',
    tags: ['6-15'],
  },
  {
    id: 'telas-aereas',
    nombre: 'Telas Aéreas',
    desc: 'Disciplina aérea en telas de circo: figuras, fuerza y trabajo en altura con seguridad.',
    edad: 'Desde 6 años',
    href: '/servicios/telas-aereas',
    icon: '🎪',
    grad: 'from-purple-600 to-indigo-800',
    tags: ['6-15', '+16'],
  },
  {
    id: 'escuela-infantil',
    nombre: 'Escuela Infantil',
    desc: 'Movimiento, psicomotricidad y primeras habilidades circenses para los más pequeños.',
    edad: '3 a 5 años',
    href: '/servicios/escuela-infantil',
    icon: '🧸',
    grad: 'from-amber-400 to-orange-500',
    tags: ['2-5'],
  },
  {
    id: 'bienestar',
    nombre: 'Escuela de Bienestar',
    desc: 'Pilates, Yoga y Baile para adultos. Lunes, miércoles y viernes de 09:30 a 10:30.',
    edad: 'Adultos',
    href: '/servicios/escuela-bienestar',
    icon: '🧘',
    grad: 'from-teal-600 to-cyan-700',
    tags: ['+16'],
  },
  {
    id: 'jiujitsu',
    nombre: 'Jiu-Jitsu Brasileño',
    desc: 'Arte marcial de agarre y suelo. Todos los sábados 11:30-13:30 con instructores de Academia Adamas (Madrid).',
    edad: 'Mayores de 16 años',
    href: '/servicios/jiu-jitsu',
    icon: '🥋',
    grad: 'from-slate-800 to-pm-navy',
    tags: ['+16'],
  },
  {
    id: 'circo-inclusivo',
    nombre: 'Circo Inclusivo',
    desc: 'Psicomotricidad adaptada para personas con discapacidad intelectual. En colaboración con CADIG Crisol.',
    edad: 'Adultos con discapacidad intelectual',
    href: '/servicios/circo-inclusivo',
    icon: '♿',
    grad: 'from-indigo-700 to-purple-800',
    tags: ['ayto', 'empresa'],
  },
  // ── Educativo ────────────────────────────────────────────────────────────
  {
    id: 'extraescolares',
    nombre: 'Multideporte Extraescolar',
    desc: 'Nos desplazamos al colegio. Actividad de 1 hora, 1-2 días/semana. Coordinación, equilibrio y equipo.',
    edad: 'Infantil (3-5) · Primaria (6-12)',
    href: '/servicios/extraescolares',
    icon: '🏃',
    grad: 'from-blue-600 to-pm-navy',
    tags: ['2-5', '6-15', 'ayto'],
    destacado: true,
  },
  {
    id: 'excursiones',
    nombre: 'Excursiones Escolares',
    desc: '4 horas de circo, acrobacia, aéreos y expresión corporal por rotaciones. 09:00-13:00 en nuestras instalaciones.',
    edad: 'Infantil y Primaria · Secundaria',
    href: '/servicios/excursiones',
    icon: '🎒',
    grad: 'from-pm-red to-orange-600',
    tags: ['6-15', 'ayto'],
    destacado: true,
  },
  {
    id: 'monitor',
    nombre: 'Curso Monitor Juvenil',
    desc: 'Titulación homologada Junta CLM. Julio 2026 en Cuenca, Tarancón y Motilla. En colaboración con ARKHE.',
    edad: 'Desde 16 años',
    href: '/servicios/monitor-juvenil',
    icon: '🎓',
    grad: 'from-emerald-700 to-pm-navy',
    tags: ['+16', 'ayto'],
    destacado: true,
  },
  // ── Eventos / Talleres ────────────────────────────────────────────────────
  {
    id: 'talleres',
    nombre: 'Talleres de Circo',
    desc: 'Configurador a medida: AirTrack, pórtico aéreo, malabares, pintacaras y más. Presupuesto en tiempo real.',
    edad: 'Todas las edades',
    href: '/servicios/talleres',
    icon: '🎪',
    grad: 'from-pm-red to-pm-navy',
    tags: ['ayto', 'empresa'],
    destacado: true,
  },
  {
    id: 'licitaciones',
    nombre: 'Licitaciones y contratos públicos',
    desc: 'Diseño, gestión y ejecución de programas deportivos, educativos y sociales para administraciones mediante contratos y licitaciones.',
    edad: 'Administraciones y entidades',
    href: '/servicios/licitaciones',
    icon: '🏛️',
    grad: 'from-emerald-700 to-pm-navy',
    tags: ['ayto'],
  },
  {
    id: 'eventos-ext',
    nombre: 'Animación en tu Evento',
    desc: 'Nos desplazamos a bodas, comuniones, bautizos y fiestas privadas. Pack Básico (150€) y Pack Grande (250€).',
    edad: 'Todas las edades',
    href: '/servicios/eventos',
    icon: '🎉',
    grad: 'from-purple-700 to-pm-navy',
    tags: ['empresa', 'ayto'],
  },
]

// ─── Categorías / Perfiles ────────────────────────────────────────────────────
export type CatId = '2-5' | '6-15' | '+16' | 'ayto' | 'empresa'

const CATEGORIAS: {
  id: CatId
  label: string
  sublabel: string
  emoji: string
  color: string
  colorText: string
  colorBg: string
  colorBorder: string
  intro: string
}[] = [
  {
    id: '2-5',
    label: '2 – 5 años',
    sublabel: 'Educación Infantil',
    emoji: '🧒',
    color: 'bg-amber-500',
    colorText: 'text-amber-700',
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-300',
    intro: 'Actividades seguras, divertidas y adaptadas para los más pequeños. Desde práctica libre en familia hasta campamentos y cumpleaños.',
  },
  {
    id: '6-15',
    label: '6 – 15 años',
    sublabel: 'Primaria y Secundaria',
    emoji: '🏃',
    color: 'bg-pm-red',
    colorText: 'text-pm-red',
    colorBg: 'bg-pm-red-light',
    colorBorder: 'border-pm-red/30',
    intro: 'Toda la oferta infantil y juvenil en un solo lugar. Campamentos, excursiones escolares, extraescolares, Halloween y mucho más.',
  },
  {
    id: '+16',
    label: '+16 años',
    sublabel: 'Jóvenes y adultos',
    emoji: '🎓',
    color: 'bg-indigo-600',
    colorText: 'text-indigo-700',
    colorBg: 'bg-indigo-50',
    colorBorder: 'border-indigo-300',
    intro: 'Formación, deporte y participación para jóvenes y adultos. Desde artes marciales hasta el Curso de Monitor Juvenil.',
  },
  {
    id: 'ayto',
    label: 'Entidades Públicas',
    sublabel: 'Ayuntamientos, AMPAS y residencias',
    emoji: '🏛️',
    color: 'bg-emerald-700',
    colorText: 'text-emerald-700',
    colorBg: 'bg-emerald-50',
    colorBorder: 'border-emerald-300',
    intro: 'Todo lo que Planeta Movimiento puede ofrecer a nivel institucional: talleres, excursiones, extraescolares, campamentos y formación.',
  },
  {
    id: 'empresa',
    label: 'Entidades Privadas',
    sublabel: 'Empresas, Clubes y asociaciones',
    emoji: '💼',
    color: 'bg-slate-700',
    colorText: 'text-slate-700',
    colorBg: 'bg-slate-50',
    colorBorder: 'border-slate-300',
    intro: 'Servicios contratables para empresas, asociaciones y organizadores de eventos. Animación, talleres y programas a medida.',
  },
]

// ─── Foto coherente por servicio (de /public/fotos, optimizadas desde Imagenes_web) ──
const FOTO_SERVICIO: Record<string, string> = {
  'cumpleanos':          '/fotos/cumpleanos/1.webp',
  'domingos':            '/fotos/eventos-centro/domingos.webp',
  'diassinc':            '/fotos/eventos-centro/dias-sin-cole.webp',
  'halloween':           '/fotos/eventos-centro/halloween.webp',
  'campamentos':         '/fotos/campamentos/1.webp',
  'gimnasia-acrobatica': '/fotos/gimnasia-acrobatica/1.webp',
  'telas-aereas':        '/fotos/telas-aereas/1.webp',
  'escuela-infantil':    '/fotos/escuela-infantil/1.webp',
  'bienestar':           '/fotos/escuela-bienestar/1.webp',
  'jiujitsu':            '/fotos/jiu-jitsu/1.webp',
  'circo-inclusivo':     '/fotos/circo-inclusivo/1.webp',
  'extraescolares':      '/fotos/extraescolares/1.webp',
  'excursiones':         '/fotos/excursiones/1.webp',
  'monitor':             '/fotos/monitor-juvenil/1.webp',
  'talleres':            '/fotos/talleres/1.webp',
  'eventos-ext':         '/fotos/eventos/2.webp',
}

// ─── Tarjeta de servicio ──────────────────────────────────────────────────────
function TarjetaServicio({ s, cat }: { s: Servicio; cat: typeof CATEGORIAS[0] }) {
  const [imgError, setImgError] = useState(false)
  const foto = FOTO_SERVICIO[s.id]
  return (
    <Link href={s.href}
      className="group flex flex-col bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5">

      {/* Visual */}
      <div className={`relative bg-gradient-to-br ${s.grad} h-28 flex items-center justify-center overflow-hidden`}>
        {foto && !imgError ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt={s.nombre} onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          </>
        ) : (
          <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        )}
        {s.destacado && (
          <span className="absolute top-3 right-3 bg-black/45 backdrop-blur-sm text-white text-xs font-black px-2.5 py-0.5 rounded-full">
            Destacado
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-black text-pm-navy text-sm leading-tight group-hover:text-pm-red transition-colors">
          {s.nombre}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1">
          {s.desc}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className={`text-xs font-semibold ${cat.colorText} ${cat.colorBg} px-2 py-0.5 rounded-full border ${cat.colorBorder}`}>
            {s.edad}
          </span>
          <span className="text-xs font-black text-pm-red group-hover:gap-2 flex items-center gap-1 transition-all">
            Ver más
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ActividadesUI({ initialCat = '6-15' }: { initialCat?: CatId }) {
  const [catActiva, setCatActiva] = useState<CatId>(initialCat)

  const cat = CATEGORIAS.find(c => c.id === catActiva)!
  const serviciosFiltrados = SERVICIOS.filter(s => s.tags.includes(catActiva))

  return (
    <main className="bg-pm-bg min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-pm-red/20 border border-pm-red/30 text-pm-red text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            Descubre todo lo que ofrecemos
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Encuentra tu actividad
          </h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Selecciona tu perfil y te mostramos todas las actividades pensadas para ti. Sin buscar, sin perderte nada.
          </p>
        </div>
      </section>

      {/* ── SELECTOR DE PERFIL — sticky ── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {CATEGORIAS.map(c => (
              <button
                key={c.id}
                onClick={() => setCatActiva(c.id)}
                className={`flex-none flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 sm:px-6 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                  catActiva === c.id
                    ? `border-pm-red ${c.colorText} ${c.colorBg}`
                    : 'border-transparent text-gray-500 hover:text-pm-navy hover:bg-pm-bg'
                }`}
              >
                <div className="text-center sm:text-left">
                  <div className="font-black text-xs sm:text-sm leading-tight">{c.label}</div>
                  <div className="text-xs font-normal opacity-60 hidden sm:block">{c.sublabel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANEL DE ACTIVIDADES ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Intro de la categoría */}
        <div className={`${cat.colorBg} border ${cat.colorBorder} rounded-2xl px-6 py-5 mb-8 flex items-start gap-4`}>
          <span aria-hidden="true" className={`w-11 h-11 rounded-xl shrink-0 ${cat.color}`} />
          <div>
            <h2 className={`font-black text-lg ${cat.colorText} mb-1`}>
              {cat.label} — {cat.sublabel}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{cat.intro}</p>
          </div>
        </div>

        {/* Grid de tarjetas */}
        {serviciosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {serviciosFiltrados.map(s => (
              <TarjetaServicio key={s.id} s={s} cat={cat} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"/></svg>
            <p className="font-semibold">No hay actividades configuradas para este perfil.</p>
          </div>
        )}

        {/* Enlace a ver todos los servicios */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-3">¿No encuentras lo que buscas?</p>
          <Link href="/club"
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-pm-navy hover:border-pm-red hover:text-pm-red font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            Ver todos los servicios del club →
          </Link>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className="bg-pm-navy py-12 text-white text-center mt-4">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-xl font-black mb-2">¿Tienes dudas sobre qué actividad elegir?</h2>
          <p className="text-white/60 text-sm mb-6">Cuéntanos tu situación y te ayudamos a encontrar la opción perfecta.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+34657604665"
              className="inline-flex items-center justify-center gap-2 bg-pm-red hover:bg-pm-red-dark text-white font-black px-6 py-3 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Llamar ahora
            </a>
            <a href={waNegocio('Hola 👋, me gustaría recibir información sobre las actividades de Planeta Movimiento.')} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
