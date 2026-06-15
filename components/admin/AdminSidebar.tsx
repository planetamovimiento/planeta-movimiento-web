'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SECCIONES, puedeVerSeccion, type AdminRole, type SeccionMeta } from '@/lib/admin/secciones'

export default function AdminSidebar(
  { role, secciones, email, nombre }:
  { role: AdminRole; secciones: string[] | null; email: string; nombre: string | null },
) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const roleLabel = role === 'principal' ? 'Administrador principal' : role === 'gestor' ? 'Gestor' : role === 'monitor' ? 'Monitor' : 'Solo lectura'

  // Secciones visibles para este usuario, agrupadas conservando el orden de SECCIONES.
  const visibles = SECCIONES.filter(s => puedeVerSeccion(role, secciones, s.id))
  const grupos: { titulo: string | null; items: SeccionMeta[] }[] = []
  for (const s of visibles) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.titulo === s.grupo) ultimo.items.push(s)
    else grupos.push({ titulo: s.grupo, items: [s] })
  }

  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
    return `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      active ? 'bg-pm-red text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`
  }

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
          {/* Dashboard — siempre disponible */}
          <div className="space-y-1">
            <Link href="/admin" onClick={() => setOpen(false)} className={linkClass('/admin', true)}>
              <span className="text-base">📊</span>
              Dashboard
            </Link>
          </div>

          {grupos.map((grupo, gi) => (
            <div key={gi}>
              {grupo.titulo && (
                <div className="px-4 pb-1.5 text-xs font-black text-white/30 uppercase tracking-wider">{grupo.titulo}</div>
              )}
              <div className="space-y-1">
                {grupo.items.map(item => (
                  <Link key={item.id} href={item.href} onClick={() => setOpen(false)} className={linkClass(item.href)}>
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
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
