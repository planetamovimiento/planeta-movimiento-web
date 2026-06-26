'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

// Capa antibots del lado del cliente: campo trampa (honeypot), marca de tiempo y
// (si hay clave) widget de Cloudflare Turnstile. Los valores se envían al servidor
// dentro de `seguridad` y allí se verifican.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export type SeguridadValores = { hp: string; renderedAt: number; turnstileToken: string }

/** Hook: provee la marca de tiempo, el ref del honeypot y el token de Turnstile. */
export function useProteccion() {
  const renderedAt = useRef(Date.now())
  const hpRef = useRef<HTMLInputElement>(null)
  const [token, setToken] = useState('')

  const valores = useCallback((): SeguridadValores => ({
    hp: hpRef.current?.value || '',
    renderedAt: renderedAt.current,
    turnstileToken: token,
  }), [token])

  return { valores, hpRef, onToken: setToken }
}

/** Campos ocultos a renderizar dentro del formulario. */
export function ProteccionCampos({ hpRef, onToken }: {
  hpRef: RefObject<HTMLInputElement | null>
  onToken: (t: string) => void
}) {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!SITE_KEY) return
    const render = () => {
      const w = widgetRef.current as (HTMLDivElement & { dataset: DOMStringMap }) | null
      const ts = (window as unknown as { turnstile?: { render: (el: HTMLElement, o: object) => void } }).turnstile
      if (ts && w && !w.dataset.rendered) {
        w.dataset.rendered = '1'
        ts.render(w, { sitekey: SITE_KEY, callback: (t: string) => onToken(t), 'expired-callback': () => onToken('') })
      }
    }
    if ((window as unknown as { turnstile?: unknown }).turnstile) { render(); return }
    const id = 'cf-turnstile-script'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.id = id
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true; s.defer = true
      s.onload = render
      document.head.appendChild(s)
    } else {
      const t = setTimeout(render, 400)
      return () => clearTimeout(t)
    }
  }, [onToken])

  return (
    <>
      {/* Honeypot: invisible para personas, los bots tienden a rellenarlo. */}
      <input
        ref={hpRef} type="text" name="empresa_web" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      {SITE_KEY && <div ref={widgetRef} className="cf-turnstile mt-2" />}
    </>
  )
}
