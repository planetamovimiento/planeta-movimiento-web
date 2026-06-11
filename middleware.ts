import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Protege /admin/** y /familias/** exigiendo sesión iniciada.
 * La AUTORIZACIÓN (admin_users / club_familias) se valida en cada layout.
 * Diseñado para NO devolver nunca un 500: ante cualquier fallo redirige al login.
 */
export async function middleware(request: NextRequest) {
  // Bypass de login SOLO en desarrollo local (ADMIN_DEV_BYPASS=true). Nunca en producción.
  if (process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_BYPASS === 'true') {
    return NextResponse.next({ request })
  }

  const path = request.nextUrl.pathname
  const esFamilias = path.startsWith('/familias')
  const loginPath = esFamilias ? '/familias/login' : '/admin/login'
  const home = esFamilias ? '/familias' : '/admin'
  const esPublica = esFamilias
    ? (path.startsWith('/familias/login') || path.startsWith('/familias/auth'))
    : (path.startsWith('/admin/login') || path.startsWith('/admin/auth'))

  const toLogin = () => {
    const u = request.nextUrl.clone()
    u.pathname = loginPath
    return NextResponse.redirect(u)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin claves de Supabase no podemos validar la sesión: no tumbamos el panel.
  if (!url || !anonKey) return esPublica ? NextResponse.next({ request }) : toLogin()

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

    // Ruta protegida sin sesión → al login del área.
    if (!esPublica && !user) return toLogin()

    // Sesión activa visitando la página de login → al inicio del área.
    if (path.startsWith(loginPath) && user) {
      const u = request.nextUrl.clone()
      u.pathname = home
      return NextResponse.redirect(u)
    }

    return response
  } catch {
    // Ante cualquier error (config, red…) nunca devolvemos 500.
    return esPublica ? NextResponse.next({ request }) : toLogin()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/familias/:path*'],
}
