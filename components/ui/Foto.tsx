// Componente de imagen con respaldo limpio (sin emojis).
// - Si `src` apunta a una foto existente en /public, la muestra.
// - Si no hay foto todavía, muestra un degradado sobrio listo para sustituir.
//
// Cuando tengas las fotos, déjalas en /public/fotos/ y pasa el src
// (p. ej. src="/fotos/cumpleanos.jpg"). No hace falta tocar el diseño.

export function Foto({
  src,
  alt,
  className = '',
  gradient = 'from-pm-navy to-pm-navy-md',
  rounded = '',
}: {
  src?: string | null
  alt: string
  className?: string
  gradient?: string
  rounded?: string
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={`object-cover w-full h-full ${rounded} ${className}`} />
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-gradient-to-br ${gradient} ${rounded} ${className} relative overflow-hidden`}
    >
      {/* Brillo decorativo sutil */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </div>
  )
}
