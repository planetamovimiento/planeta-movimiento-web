'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Compartir el reto.
//
// OJO: solo WhatsApp y Facebook tienen URL de compartir web real. Instagram,
// TikTok y YouTube NO permiten compartir por enlace: para esos solo se ofrece
// el perfil oficial si está configurado en el panel (nunca un enlace inventado)
// y, en su defecto, "copiar enlace" con navigator.clipboard.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

const TITULO = '50 días, 50 provincias'

const hrefWhatsApp = (texto: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`

const hrefFacebook = (url: string) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    /* el navegador lo ha bloqueado */
  }
  return false
}

// ── Iconos (SVG inline: en la web pública no se usan emoticonos) ─────────────

const IconoWhatsApp = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const IconoFacebook = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.675 0h-21.35C.595 0 0 .593 0 1.325v21.351C0 23.407.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.405 0 22.675 0z" />
  </svg>
)

const IconoInstagram = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.76 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const IconoTikTok = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const IconoYouTube = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const IconoEnlace = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
  </svg>
)

const IconoCompartir = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316M18 8a3 3 0 100-6 3 3 0 000 6zm0 14a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Botón único de compartir. Usa la hoja nativa del sistema si el navegador la
 * ofrece (móvil) y, si no, copia el enlace al portapapeles.
 */
export function BotonCompartir({ texto, url, className = '', avisoClassName = 'text-white/60' }: {
  texto: string
  url: string
  className?: string
  /** El aviso se pinta sobre fondos distintos: en claro hay que cambiarle el color. */
  avisoClassName?: string
}) {
  const [aviso, setAviso] = useState('')

  async function compartir() {
    const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> }
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: TITULO, text: texto, url })
      } catch {
        /* el usuario ha cancelado: no hacemos nada */
      }
      return
    }
    const ok = await copiarAlPortapapeles(`${texto} ${url}`)
    setAviso(ok ? 'Enlace copiado' : 'Copia el enlace de la barra del navegador')
    setTimeout(() => setAviso(''), 3000)
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={compartir} className={className}>
        <IconoCompartir />
        Compartir
      </button>
      <span aria-live="polite" className={`text-xs ${avisoClassName} ${aviso ? 'min-h-[1rem]' : ''}`}>{aviso}</span>
    </span>
  )
}

/** Fila completa de compartir y seguir para el cierre de la página. */
export function BloqueCompartir({ url, texto, instagram = '', tiktok = '', youtube = '', facebook = '' }: {
  url: string
  texto: string
  instagram?: string
  tiktok?: string
  youtube?: string
  facebook?: string
}) {
  const [aviso, setAviso] = useState('')

  async function copiar() {
    const ok = await copiarAlPortapapeles(url)
    setAviso(ok ? 'Enlace copiado al portapapeles' : 'No se ha podido copiar. Copia el enlace de la barra del navegador.')
    setTimeout(() => setAviso(''), 3000)
  }

  const perfiles = [
    { url: instagram, label: 'Instagram', Icono: IconoInstagram },
    { url: tiktok, label: 'TikTok', Icono: IconoTikTok },
    { url: youtube, label: 'YouTube', Icono: IconoYouTube },
    { url: facebook, label: 'Facebook', Icono: IconoFacebook },
  ].filter(p => !!p.url)

  const btn = 'inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-colors'

  return (
    <div className="space-y-8">
      {/* Compartir de verdad: solo WhatsApp y Facebook tienen enlace de compartir web */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Comparte el reto</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={hrefWhatsApp(texto, url)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} bg-white text-pm-navy hover:bg-white/90`}
          >
            <IconoWhatsApp />
            WhatsApp
          </a>
          <a
            href={hrefFacebook(url)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn} border-2 border-white/30 text-white hover:bg-white/10`}
          >
            <IconoFacebook />
            Facebook
          </a>
          <button type="button" onClick={copiar} className={`${btn} border-2 border-white/30 text-white hover:bg-white/10`}>
            <IconoEnlace />
            Copiar enlace
          </button>
        </div>
        <p aria-live="polite" className="text-xs text-white/60 mt-3 min-h-[1rem]">{aviso}</p>
        <p className="text-xs text-white/40 mt-1 max-w-md mx-auto leading-relaxed">
          Instagram, TikTok y YouTube no permiten compartir un enlace desde la web: copia el enlace y pégalo en tu
          publicación o en tu historia.
        </p>
      </div>

      {/* Perfiles oficiales: solo los que están configurados. Nunca inventados. */}
      {perfiles.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-3">Sigue el reto</p>
          <div className="flex flex-wrap justify-center gap-3">
            {perfiles.map(({ url: href, label, Icono }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white/90 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Icono />
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
