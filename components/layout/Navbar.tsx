'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    label: 'Club',
    href: '/club',
    items: [
      { label: 'Acrobacia', href: '/servicios/acrobacia', desc: 'Volteretas, equilibrios y pirámides' },
      { label: 'Malabares', href: '/servicios/malabares', desc: 'Pelotas, clavas y aros' },
      { label: 'Trapecio', href: '/servicios/trapecio', desc: 'Disciplinas aéreas' },
      { label: 'Equilibrio', href: '/servicios/equilibrio', desc: 'Contorsión y equilibrio' },
    ],
  },
  {
    label: 'Ocio',
    href: '/ocio',
    items: [
      { label: 'Cumpleaños', href: '/servicios/cumpleanos', desc: 'Fiestas circenses únicas' },
      { label: 'Talleres', href: '/servicios/talleres', desc: 'Sesiones puntuales abiertas' },
      { label: 'Eventos', href: '/servicios/eventos', desc: 'Animación para todo tipo de eventos' },
      { label: 'Campamentos', href: '/servicios/campamentos', desc: 'Aventura de verano en circo' },
    ],
  },
  {
    label: 'Educación',
    href: '/educacion',
    items: [
      { label: 'Colegios', href: '/servicios/colegios', desc: 'Visitas y programas escolares' },
      { label: 'Campamentos escolares', href: '/servicios/campamentos-escolares', desc: 'Campamentos con grupo clase' },
      { label: 'Extraescolares', href: '/servicios/extraescolares', desc: 'Actividad semanal en tu colegio' },
    ],
  },
  {
    label: 'Empresas',
    href: '/empresas',
    items: [
      { label: 'Team Building', href: '/servicios/team-building', desc: 'Cohesión y confianza en equipo' },
      { label: 'Eventos corporativos', href: '/servicios/eventos-corporativos', desc: 'Animación para tu empresa' },
      { label: 'Formación', href: '/servicios/formacion', desc: 'Talleres formativos especializados' },
    ],
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
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L4 10V22C4 30.8 11.2 39.1 20 41C28.8 39.1 36 30.8 36 22V10L20 2Z" fill="#1A2A5E"/>
              <path d="M20 2L4 10V22C4 30.8 11.2 39.1 20 41C28.8 39.1 36 30.8 36 22V10L20 2Z" stroke="#D42B2B" strokeWidth="1.5"/>
              <text x="20" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontStyle="italic">PM</text>
              <ellipse cx="20" cy="20" rx="14" ry="5" stroke="#D42B2B" strokeWidth="1.2" fill="none" transform="rotate(-20 20 20)"/>
            </svg>
            <div className="leading-tight">
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
                  className="flex items-center gap-1 text-white text-sm hover:text-pm-red transition-colors px-3 py-5"
                >
                  {nav.label}
                  <svg className="w-3 h-3 mt-0.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </Link>
                {/* Dropdown */}
                <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
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
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
