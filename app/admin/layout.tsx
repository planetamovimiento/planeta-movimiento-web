import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Panel de administración · Planeta Movimiento',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión → es la página de login (se renderiza sola, sin chrome)
  if (!user) {
    return <>{children}</>
  }

  const admin = await getAdminUser()

  // Con sesión pero sin autorización → pantalla de acceso denegado
  if (!admin) {
    return (
      <main className="min-h-screen bg-pm-navy flex items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-black text-pm-navy mb-2">Acceso no autorizado</h1>
          <p className="text-gray-500 text-sm mb-6">
            La cuenta <strong>{user.email}</strong> no tiene permisos para acceder al panel.
            Pide a un administrador principal que te añada.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="border border-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:border-pm-red">Ir al inicio</Link>
            <a href="/admin/logout" className="bg-pm-red text-white font-bold px-5 py-2.5 rounded-xl text-sm">Cerrar sesión</a>
          </div>
        </div>
      </main>
    )
  }

  // Autorizado → panel completo
  return (
    <div className="min-h-screen flex bg-pm-bg">
      <AdminSidebar role={admin.role} email={admin.email} nombre={admin.nombre} />
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  )
}
