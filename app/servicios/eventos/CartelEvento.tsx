/**
 * Cartel/foto de un evento del centro. Se ve ENTERO, sin recortar: los carteles
 * suelen ser verticales y antes se recortaban a una franja. Si no hay imagen,
 * no pinta nada.
 */
export function CartelEvento({ src, alt, fondo = 'bg-black/20' }: { src?: string; alt: string; fondo?: string }) {
  if (!src) return null
  return (
    <div className={`-mx-8 -mt-8 mb-5 rounded-t-2xl overflow-hidden flex justify-center ${fondo}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-auto max-w-full max-h-[460px] object-contain" />
    </div>
  )
}
