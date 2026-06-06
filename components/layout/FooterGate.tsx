'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Oculta el pie público en las rutas del panel de administración */
export default function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <>{children}</>
}
