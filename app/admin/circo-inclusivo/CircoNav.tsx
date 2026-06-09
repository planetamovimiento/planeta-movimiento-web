'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const BASE = '/admin/circo-inclusivo'

const TABS: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: BASE,                  label: 'Participantes', match: p => p === BASE || p.startsWith(`${BASE}/participantes`) },
  { href: `${BASE}/grupos`,      label: 'Grupos',        match: p => p.startsWith(`${BASE}/grupos`) },
  { href: `${BASE}/actividades`, label: 'Actividades',   match: p => p.startsWith(`${BASE}/actividades`) },
  { href: `${BASE}/evaluaciones`,label: 'Evaluaciones',  match: p => p.startsWith(`${BASE}/evaluaciones`) },
  { href: `${BASE}/informes`,    label: 'Informes',      match: p => p.startsWith(`${BASE}/informes`) },
  { href: `${BASE}/exportar`,    label: 'Exportar',      match: p => p.startsWith(`${BASE}/exportar`) },
]

export default function CircoNav() {
  const pathname = usePathname()
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex gap-1 overflow-x-auto px-4 lg:px-8">
        {TABS.map(t => {
          const active = t.match(pathname)
          return (
            <Link key={t.href} href={t.href}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active ? 'border-pm-red text-pm-red' : 'border-transparent text-gray-500 hover:text-pm-navy'
              }`}>
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
