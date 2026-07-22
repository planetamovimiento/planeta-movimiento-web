// ─────────────────────────────────────────────────────────────────────────────
// Imagen de portada: el fondo del hero.
//
// Antes esta imagen solo salía cuando NO había panel de colaborar, así que en
// cuanto se subía un QR desaparecía sin avisar. Ahora es lo que dice ser: la
// portada, detrás del título y los paneles.
//
// Sin imagen no se pinta nada y el hero se queda con su fondo de siempre (los
// orbes y la retícula), que ya funciona bien.
//
// Encima va siempre una capa oscura: sobre una foto clara el texto blanco no se
// leería. Se regula desde el panel.
// ─────────────────────────────────────────────────────────────────────────────

import { OSCURIDAD_FONDO_DEFECTO } from '@/lib/reto50/constants'
import type { ConfigReto } from '@/lib/reto50/tipos'

export default function FondoHero({ config }: { config: ConfigReto }) {
  const imagen = config.hero_imagen || ''
  if (!imagen || config.hero_fondo_activo === 'no') return null

  const imagenMovil = config.hero_fondo_movil || ''
  const posicion = config.hero_fondo_posicion || 'center'
  const oscuridadNum = Number(config.hero_fondo_oscuridad)
  const oscuridad = Number.isFinite(oscuridadNum)
    ? Math.min(95, Math.max(0, oscuridadNum))
    : OSCURIDAD_FONDO_DEFECTO

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <picture>
        {/* Imagen distinta para móvil si se ha subido: pesa menos y encuadra mejor */}
        {imagenMovil && <source media="(max-width: 639px)" srcSet={imagenMovil} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagen}
          alt=""
          // Es lo primero que se ve al entrar: se carga cuanto antes.
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: posicion }}
        />
      </picture>

      {/* Capa de contraste: sin ella el texto sobre la foto no se leería */}
      <div className="absolute inset-0 bg-pm-navy" style={{ opacity: oscuridad / 100 }} />
      {/* Funde con el menú de arriba y con la sección siguiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-pm-navy/80 via-transparent to-pm-navy" />
    </div>
  )
}
