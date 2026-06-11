import Link from 'next/link'
import { estadoFamilia } from '@/lib/familias/auth'

export const metadata = {
  title: 'Área de Familias · Club Deportivo Origen',
  robots: { index: false, follow: false },
}

export default async function FamiliasLayout({ children }: { children: React.ReactNode }) {
  const e = await estadoFamilia()

  // Sin sesión → dejamos pasar (la página de login se renderiza; las páginas
  // protegidas redirigen a /familias/login mediante requireFamilia).
  if (e.tipo === 'sin-sesion') return <>{children}</>

  // Con sesión pero sin cuenta activa → pantalla informativa.
  if (e.tipo !== 'ok') {
    const titulo =
      e.tipo === 'sin-cuenta' ? 'Este correo no tiene acceso'
      : e.estado === 'pendiente' ? 'Tu acceso está pendiente de activar'
      : e.estado === 'bloqueado' ? 'Tu acceso está bloqueado'
      : 'Tu acceso está desactivado'
    const msg =
      e.tipo === 'sin-cuenta'
        ? 'Este correo no está registrado como familia del Club Deportivo Origen. Si crees que es un error, contacta con el Club.'
        : 'Tu cuenta familiar existe pero no está disponible ahora mismo. Contacta con el Club Deportivo Origen para activarla.'
    return (
      <main className="min-h-screen bg-pm-navy flex items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-black text-pm-navy mb-2">{titulo}</h1>
          <p className="text-gray-500 text-sm mb-2">{msg}</p>
          <p className="text-gray-400 text-xs mb-6">Sesión: {e.email}</p>
          <a href="/familias/logout" className="bg-pm-red text-white font-bold px-5 py-2.5 rounded-xl text-sm">Cerrar sesión</a>
        </div>
      </main>
    )
  }

  // Familia activa → portal con cabecera.
  const { familia } = e
  return (
    <div className="min-h-screen bg-pm-bg flex flex-col">
      <header className="bg-pm-navy text-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/familias" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-origen.png" alt="Club Deportivo Origen" className="h-9 w-auto bg-white rounded-lg p-1" />
            <div className="leading-tight">
              <div className="font-black text-sm">Área de Familias</div>
              <div className="text-white/50 text-[11px]">Club Deportivo Origen</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs hidden sm:block">{familia.nombre || familia.email}</span>
            <form action="/familias/logout" method="post">
              <button className="text-white/70 hover:text-white text-sm font-semibold border border-white/20 rounded-lg px-3 py-1.5">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-6">Club Deportivo Origen · Planeta Movimiento</footer>
    </div>
  )
}
