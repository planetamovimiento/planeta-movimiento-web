// ─────────────────────────────────────────────────────────────────────────────
// Paisaje de fondo de la sección de la ruta.
//
// Si el panel tiene una imagen subida, se usa esa (con su encuadre y su capa de
// oscurecimiento). Si no, se pinta un paisaje de montaña generado en SVG: pesa
// unos pocos KB, no necesita descargar nada y ya transmite viaje y naturaleza,
// así que la sección nunca se queda con el fondo blanco de antes.
//
// Encima va siempre una capa oscura para que el texto y las tarjetas se lean.
// ─────────────────────────────────────────────────────────────────────────────

import { OSCURIDAD_FONDO_DEFECTO } from '@/lib/reto50/constants'
import type { ConfigReto } from '@/lib/reto50/tipos'

/** Paisaje por defecto: cielo al atardecer y sierras en capas. Sin imágenes. */
function PaisajeSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pmCielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1836" />
          <stop offset="45%" stopColor="#1f2f5e" />
          <stop offset="75%" stopColor="#7c4a3f" />
          <stop offset="100%" stopColor="#b86a45" />
        </linearGradient>
        <linearGradient id="pmSierraLejos" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b3a63" />
          <stop offset="100%" stopColor="#1b2748" />
        </linearGradient>
        <linearGradient id="pmSierraMedia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243257" />
          <stop offset="100%" stopColor="#151f3c" />
        </linearGradient>
        <linearGradient id="pmTierra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141c33" />
          <stop offset="100%" stopColor="#0d1426" />
        </linearGradient>
      </defs>

      {/* Cielo */}
      <rect width="1440" height="900" fill="url(#pmCielo)" />
      {/* Sol bajo, cerca del horizonte */}
      <circle cx="1080" cy="470" r="70" fill="#e8a06a" opacity="0.35" />
      <circle cx="1080" cy="470" r="34" fill="#f3c08a" opacity="0.5" />

      {/* Sierra lejana */}
      <path
        d="M0 470 L150 380 L260 440 L380 330 L520 450 L640 370 L780 460 L900 390 L1040 470 L1180 400 L1300 465 L1440 410 L1440 900 L0 900 Z"
        fill="url(#pmSierraLejos)"
      />
      {/* Sierra media */}
      <path
        d="M0 560 L120 500 L250 570 L400 480 L540 575 L700 505 L860 585 L1010 515 L1160 590 L1320 520 L1440 575 L1440 900 L0 900 Z"
        fill="url(#pmSierraMedia)"
      />
      {/* Tierra en primer plano */}
      <path
        d="M0 660 L180 630 L360 665 L560 625 L760 670 L980 630 L1200 668 L1440 635 L1440 900 L0 900 Z"
        fill="url(#pmTierra)"
      />
    </svg>
  )
}

export default function FondoRuta({ config }: { config: ConfigReto }) {
  // El fondo se puede apagar desde el panel: entonces se queda el navy liso.
  if (config.ruta_fondo_activo === 'no') return null

  const imagen = config.ruta_fondo_imagen || ''
  const imagenMovil = config.ruta_fondo_movil || ''
  const posicion = config.ruta_fondo_posicion || 'center'
  const oscuridadNum = Number(config.ruta_fondo_oscuridad)
  const oscuridad = Number.isFinite(oscuridadNum)
    ? Math.min(95, Math.max(0, oscuridadNum))
    : OSCURIDAD_FONDO_DEFECTO

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={imagen ? undefined : 'true'}>
      {imagen ? (
        <picture>
          {/* Imagen distinta para móvil si se ha subido: pesa menos y encuadra mejor */}
          {imagenMovil && <source media="(max-width: 639px)" srcSet={imagenMovil} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagen}
            alt={config.ruta_fondo_alt || ''}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: posicion }}
          />
        </picture>
      ) : (
        <PaisajeSVG />
      )}

      {/* Capa de contraste: sin ella el texto sobre la foto no se leería */}
      <div className="absolute inset-0 bg-pm-navy" style={{ opacity: oscuridad / 100 }} />
      {/* Degradado extra arriba y abajo para fundir con las secciones vecinas */}
      <div className="absolute inset-0 bg-gradient-to-b from-pm-navy via-transparent to-pm-navy opacity-70" />
    </div>
  )
}
