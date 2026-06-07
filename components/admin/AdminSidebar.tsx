'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { AdminRole } from '@/lib/admin/auth'

type Item = { href: string; label: string; icon: string; soloPrincipal?: boolean }
type Grupo = { titulo: string | null; items: Item[] }

const GRUPOS: Grupo[] = [
  {
    titulo: null,
    items: [{ href: '/admin', label: 'Dashboard', icon: '📊' }],
  },
  {
    titulo: 'Club Deportivo Origen',
    items: [
      { href: '/admin/club', label: 'Inscripciones Club', icon: '🏅' },
      { href: '/admin/talleres-intensivos', label: 'Talleres intensivos', icon: '🎯' },
    ],
  },
  {
    titulo: 'Empresa',
    items: [
      { href: '/admin/reservas',    label: 'Reservas',            icon: '📋' },
      { href: '/admin/manana-magica', label: 'Mañanas Mágicas',   icon: '✨' },
      { href: '/admin/pagos',       label: 'Pagos',               icon: '💳', soloPrincipal: true },
      { href: '/admin/productos',   label: 'Productos y pedidos', icon: '🛒' },
      { href: '/admin/formularios', label: 'Solicitudes',         icon: '✉️' },
      { href: '/admin/calendario',  label: 'Calendario',          icon: '🗓️' },
      { href: '/admin/servicios',   label: 'Servicios',           icon: '🎪' },
    ],
  },
  {
    titulo: 'General',
    items: [
      { href: '/admin/clientes',        label: 'Clientes',        icon: '👥' },
      { href: '/admin/administradores', label: 'Administradores', icon: '🔐', soloPrincipal: true },
      { href: '/admin/actividad',       label: 'Actividad',       icon: '📝' },
    ],
  },
]

export default function AdminSidebar({ role, email, nombre }: { role: AdminRole; email: string; nombre: string | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const roleLabel = role === 'principal' ? 'Administrador principal' : role === 'gestor' ? 'Gestor' : 'Solo lectura'

  return (
    <>
      {/* Botón móvil */}
      <button onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-pm-navy text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
        </svg>
      </button>

      {/* Overlay móvil */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-pm-navy text-white flex flex-col shrink-0 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="font-black text-xl tracking-tight"><span className="text-pm-red">PM</span> Admin</div>
          <div className="text-white/40 text-xs mt-1">Planeta Movimiento</div>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {GRUPOS.map((grupo, gi) => {
            const items = grupo.items.filter(i => !i.soloPrincipal || role === 'principal')
            if (items.length === 0) return null
            return (
              <div key={gi}>
                {grupo.titulo && (
                  <div className="px-4 pb-1.5 text-xs font-black text-white/30 uppercase tracking-wider">{grupo.titulo}</div>
                )}
                <div className="space-y-1">
                  {items.map(item => {
                    const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          active ? 'bg-pm-red text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}>
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-pm-red rounded-full flex items-center justify-center font-black text-sm shrink-0">
              {(nombre || email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{nombre || email.split('@')[0]}</div>
              <div className="text-white/40 text-xs">{roleLabel}</div>
            </div>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="w-full text-left text-white/60 hover:text-white text-sm flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
