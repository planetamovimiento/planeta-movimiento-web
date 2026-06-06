'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_ITEMS = [
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
    label: '+Actividades',
    href: '/actividades',
    items: [
      { label: 'Actividades de 2 a 5 años', href: '/actividades/2-5-anos', desc: 'Psicomotricidad y circo para bebés y peques' },
      { label: 'Actividades de 6 a 15 años', href: '/actividades/6-15-anos', desc: 'Acrobacia, circo y artes marciales' },
      { label: 'Actividades para mayores de 16 años', href: '/actividades/adultos', desc: 'Club y disciplinas para jóvenes y adultos' },
      { label: 'Actividades para Ayuntamientos', href: '/actividades/ayuntamientos', desc: 'Programas municipales y comunitarios' },
      { label: 'Actividades para Empresas', href: '/actividades/empresas', desc: 'Team building y eventos corporativos' },
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
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

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
              style={{ mixBlendMode: 'screen' }}
            />
            <div className="leading-tight hidden sm:block">
              <span className="text-white font-bold text-sm">Planeta</span>
              <span className="text-pm-red font-bold text-sm ml-1">Movimiento</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((nav) => (
              <div key={nav.label} className="relative group">
                <Link
                  href={nav.href}
                  className="flex items-center gap-1 text-white text-sm hover:text-pm-red transition-colors px-3 py-5 whitespace-nowrap"
                >
                  {nav.label}
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
              className="md:hidden text-white p-1"
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
        <div className="md:hidden bg-pm-navy-md border-t border-white/10">
          {NAV_ITEMS.map((nav) => (
            <div key={nav.label} className="border-b border-white/10">
              {nav.items.length === 0 ? (
                /* Link directo sin acordeón */
                <Link
                  href={nav.href}
                  className="flex items-center px-4 py-3 text-white text-sm font-semibold hover:text-pm-red transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {nav.label}
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
