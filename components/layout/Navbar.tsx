'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

type NavItem = {
  label: string
  /** Segunda línea del rótulo. Si existe, el enlace se pinta en dos líneas. */
  label2?: string
  /** Resalta el enlace sobre el resto del menú (campaña en marcha). */
  destacado?: boolean
  href: string
  items: { label: string; href: string; desc: string }[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Club',
    href: '/club',
    items: [
      { label: 'Gimnasia acrobática y trampolín', href: '/servicios/gimnasia-acrobatica', desc: 'Acrobacias, saltos y trampolín' },
      { label: 'Telas Aéreas', href: '/servicios/telas-aereas', desc: 'Disciplina aérea en telas de circo' },
      { label: 'Jiu-Jitsu Brasileño', href: '/servicios/jiu-jitsu', desc: 'Arte marcial de agarre y suelo' },
      { label: 'Escuela Infantil', href: '/servicios/escuela-infantil', desc: 'Movimiento y circo para los más pequeños' },
      { label: 'Escuela de bienestar', href: '/servicios/escuela-bienestar', desc: 'Actividad física para adultos' },
      { label: 'Circo inclusivo', href: '/servicios/circo-inclusivo', desc: 'Circo adaptado para todos' },
      { label: 'Talleres Intensivos', href: '/club/talleres-intensivos', desc: 'Formación específica de fin de semana' },
      { label: 'Portal de Familias', href: '/familias', desc: 'Acceso privado para familias socias' },
    ],
  },
  {
    label: 'Ocio',
    href: '/ocio',
    items: [
      { label: 'Cumpleaños', href: '/servicios/cumpleanos', desc: 'Fiestas circenses únicas e inolvidables' },
      { label: 'Campamentos', href: '/servicios/campamentos', desc: 'Campamentos de verano llenos de movimiento' },
      { label: 'Eventos y celebraciones', href: '/servicios/eventos', desc: 'Animación para todo tipo de eventos' },
      { label: 'Talleres participativos', href: '/servicios/talleres', desc: 'Talleres puntuales para grupos y familias' },
      { label: 'PIEA · Envejecimiento activo', href: '/servicios/piea', desc: 'Programas para mayores, residencias y ayuntamientos' },
      { label: 'Licitaciones', href: '/servicios/licitaciones', desc: 'Programas y contratos públicos para administraciones' },
    ],
  },
  {
    label: 'Educación',
    href: '/educacion',
    items: [
      { label: 'Excursiones a nuestra instalación', href: '/servicios/excursiones', desc: 'Visita guiada con actividades para grupos' },
      { label: 'Actividades Extraescolares en colegios', href: '/servicios/extraescolares', desc: 'Programa semanal en tu propio colegio' },
      { label: 'Curso de Monitor de Actividades Juveniles', href: '/servicios/monitor-juvenil', desc: 'Formación oficial para monitores' },
    ],
  },
  {
    label: 'Más Actividades',
    href: '/actividades',
    items: [
      { label: 'Actividades de 2 a 5 años', href: '/actividades/2-5-anos', desc: 'Psicomotricidad y circo para bebés y peques' },
      { label: 'Actividades de 6 a 15 años', href: '/actividades/6-15-anos', desc: 'Acrobacia, circo y artes marciales' },
      { label: 'Actividades para mayores de 16 años', href: '/actividades/adultos', desc: 'Club y disciplinas para jóvenes y adultos' },
      { label: 'Actividades para Entidades Públicas', href: '/actividades/ayuntamientos', desc: 'Ayuntamientos, AMPAS y residencias' },
      { label: 'Actividades para Entidades Privadas', href: '/actividades/empresas', desc: 'Empresas, Clubes y asociaciones' },
    ],
  },
  {
    label: 'Colchonetas',
    href: '/colchonetas',
    items: [],
  },
  {
    label: 'Planeta TDAH',
    href: '/planeta-tdah',
    items: [],
  },
  {
    label: '50 días en',
    label2: '50 provincias',
    destacado: true,
    href: '/50dias50provincias',
    items: [],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const pathname = usePathname()

  // El panel de administración tiene su propia interfaz, sin la web pública
  if (pathname?.startsWith('/admin')) return null

  return (
    <nav className="bg-pm-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Planeta Movimiento"
              className="h-11 w-auto object-contain"
            />
            {/* El rótulo se oculta mientras el menú de escritorio necesite el ancho. */}
            <div className="leading-tight hidden xl:block">
              <span className="text-white font-bold text-sm">Planeta</span>
              <span className="text-pm-red font-bold text-sm ml-1">Movimiento</span>
            </div>
          </Link>

          {/* Desktop nav — a partir de lg: por debajo, los 7 enlaces no caben y se cortarían */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((nav) => (
              <div key={nav.label} className="relative group">
                <Link
                  href={nav.href}
                  // El py-5 mantiene vivo el hover del desplegable mientras el ratón baja hacia él.
                  // El enlace de dos líneas no tiene desplegable, así que ahí se reduce para caber en el h-16.
                  className={`flex items-center gap-1 text-white text-sm transition-colors px-3 whitespace-nowrap ${
                    nav.label2 ? 'py-2' : 'py-5'
                  } ${nav.destacado ? '' : 'hover:text-pm-red'}`}
                >
                  {nav.label2 ? (
                    // Las dos líneas van dentro de un único bloque: el hover ilumina el conjunto.
                    <span
                      className={`flex flex-col leading-tight text-center ${
                        nav.destacado ? 'pm-destacado px-2.5 py-1' : ''
                      }`}
                    >
                      <span className={nav.destacado ? 'font-semibold group-hover:text-white transition-colors' : ''}>
                        {nav.label}
                      </span>
                      <span
                        className={`text-xs transition-colors ${
                          nav.destacado ? 'text-pm-red group-hover:text-white' : 'text-white/70 group-hover:text-pm-red'
                        }`}
                      >
                        {nav.label2}
                      </span>
                    </span>
                  ) : (
                    nav.label
                  )}
                  {nav.items.length > 0 && (
                    <svg className="w-3 h-3 mt-0.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  )}
                </Link>
                {/* Dropdown */}
                {nav.items.length > 0 && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    {nav.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-pm-bg transition-colors"
                      >
                        <svg className="w-4 h-4 text-pm-red shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                        <div>
                          <div className="text-pm-navy font-semibold text-sm">{item.label}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/reservar"
              className="bg-pm-red hover:bg-pm-red-dark text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Reservar
            </Link>
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-pm-navy-md border-t border-white/10">
          {NAV_ITEMS.map((nav) => (
            <div key={nav.label} className="border-b border-white/10">
              {nav.items.length === 0 ? (
                /* Link directo sin acordeón */
                <Link
                  href={nav.href}
                  className={`group flex items-center px-4 py-3 text-white text-sm font-semibold transition-colors ${
                    nav.destacado ? '' : 'hover:text-pm-red'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {nav.label2 ? (
                    <span className={`flex flex-col leading-tight ${nav.destacado ? 'pm-destacado px-3 py-1.5' : ''}`}>
                      <span>{nav.label}</span>
                      <span
                        className={`text-xs font-normal transition-colors ${
                          nav.destacado ? 'text-pm-red group-hover:text-white' : 'text-white/70'
                        }`}
                      >
                        {nav.label2}
                      </span>
                    </span>
                  ) : (
                    nav.label
                  )}
                </Link>
              ) : (
                <>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-white text-sm font-semibold hover:text-pm-red transition-colors"
                    onClick={() => setOpenSection(openSection === nav.label ? null : nav.label)}
                  >
                    <Link href={nav.href} className="flex-1 text-left" onClick={() => setMobileOpen(false)}>
                      {nav.label}
                    </Link>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${openSection === nav.label ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openSection === nav.label && (
                    <div className="bg-pm-navy/50 pb-2">
                      {nav.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 px-8 py-2.5 text-gray-300 hover:text-white text-sm transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          <svg className="w-3 h-3 text-pm-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
