import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Protege /admin/** exigiendo sesión iniciada.
 * La AUTORIZACIÓN por rol (admin_users) se valida en app/admin/layout.tsx.
 * Diseñado para NO devolver nunca un 500: ante cualquier fallo redirige al login.
 */
export async function middleware(request: NextRequest) {
  // Bypass de login SOLO en desarrollo local (variable ADMIN_DEV_BYPASS=true).
  // Nunca se activa en producción (NODE_ENV === 'production').
  if (process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_BYPASS === 'true') {
    return NextResponse.next({ request })
  }

  const path = request.nextUrl.pathname
  const isPublicAdminRoute = path.startsWith('/admin/login') || path.startsWith('/admin/auth')
  const toLogin = () => {
    const u = request.nextUrl.clone()
    u.pathname = '/admin/login'
    return NextResponse.redirect(u)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin claves de Supabase no podemos validar la sesión: no tumbamos el panel.
  if (!url || !anonKey) {
    return isPublicAdminRoute ? NextResponse.next({ request }) : toLogin()
  }

  try {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (path.startsWith('/admin') && !isPublicAdminRoute && !user) return toLogin()

    // Si ya hay sesión y va a /admin/login, llévalo al panel
    if (path.startsWith('/admin/login') && user) {
      const u = request.nextUrl.clone()
      u.pathname = '/admin'
      return NextResponse.redirect(u)
    }

    return response
  } catch {
    // Ante cualquier error (config, red…) nunca devolvemos 500.
    return isPublicAdminRoute ? NextResponse.next({ request }) : toLogin()
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
