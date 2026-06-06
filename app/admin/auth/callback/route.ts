import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/admin'

  // Respuesta a la que adjuntaremos las cookies de sesión
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let error = null
  if (code) {
    const r = await supabase.auth.exchangeCodeForSession(code)
    error = r.error
  } else if (tokenHash && type) {
    const r = await supabase.auth.verifyOtp({ type: type as never, token_hash: tokenHash })
    error = r.error
  }

  if (error) {
    return NextResponse.redirect(`${origin}/admin/login?error=auth`)
  }

  return response
}
