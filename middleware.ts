import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Protege /admin/** (sesión de Supabase) y /familias/** (sesión propia del
 * Portal de Familias: cookie pm_fam). La AUTORIZACIÓN real se valida en cada
 * layout. Diseñado para NO devolver nunca un 500: ante cualquier fallo, al login.
 */
export async function middleware(request: NextRequest) {
  // Bypass de login SOLO en desarrollo local (ADMIN_DEV_BYPASS=true). Nunca en producción.
  if (process.env.NODE_ENV !== 'production' && process.env.ADMIN_DEV_BYPASS === 'true') {
    return NextResponse.next({ request })
  }

  const path = request.nextUrl.pathname

  // ── Portal de Familias: sesión propia por cookie opaca (pm_fam). ──
  // El middleware solo comprueba la PRESENCIA de la cookie (barato, sin BD);
  // la validez real (caducidad, familia activa) la comprueba el layout.
  if (path.startsWith('/familias')) {
    const esPublica = path.startsWith('/familias/login') || path.startsWith('/familias/auth')
    const tiene = request.cookies.has('pm_fam')
    if (!esPublica && !tiene) {
      const u = request.nextUrl.clone(); u.pathname = '/familias/login'; return NextResponse.redirect(u)
    }
    if (path.startsWith('/familias/login') && tiene) {
      const u = request.nextUrl.clone(); u.pathname = '/familias'; return NextResponse.redirect(u)
    }
    return NextResponse.next({ request })
  }

  // ── Admin: sesión de Supabase. ──
  const loginPath = '/admin/login'
  const esPublica = path.startsWith('/admin/login') || path.startsWith('/admin/auth')
  const toLogin = () => {
    const u = request.nextUrl.clone(); u.pathname = loginPath; return NextResponse.redirect(u)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return esPublica ? NextResponse.next({ request }) : toLogin()

  try {
    let response = NextResponse.next({ request })
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })
    const { data: { user } } = await supabase.auth.getUser()
    if (!esPublica && !user) return toLogin()
    if (path.startsWith(loginPath) && user) {
      const u = request.nextUrl.clone(); u.pathname = '/admin'; return NextResponse.redirect(u)
    }
    return response
  } catch {
    return esPublica ? NextResponse.next({ request }) : toLogin()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/familias/:path*'],
}
