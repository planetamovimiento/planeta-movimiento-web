'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-pm-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
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

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {['Club', 'Ocio', 'Educación', 'Empresas'].map((link) => (
              <Link key={link} href="#" className="text-white text-sm hover:text-pm-red transition-colors">
                {link}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/reservar"
              className="bg-pm-red hover:bg-pm-red-dark text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Reservar
            </Link>
            {/* Mobile menu btn */}
            <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-pm-navy-md px-4 pb-4 flex flex-col gap-3">
          {['Club', 'Ocio', 'Educación', 'Empresas'].map((link) => (
            <Link key={link} href="#" className="text-white py-2 border-b border-white/10 hover:text-pm-red transition-colors">
              {link}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
