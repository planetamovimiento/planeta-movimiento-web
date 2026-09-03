// ─────────────────────────────────────────────────────────────────────────────
// Enruta una imagen REMOTA (Supabase Storage) por el optimizador de Vercel
// (/_next/image): la descarga una vez, la sirve en WebP al tamaño pedido y la
// cachea en su CDN → Supabase deja de servirla en cada visita (menos egress).
// Las imágenes locales (/fotos/…) ya las sirve Vercel: se devuelven tal cual.
//
// `w` debe ser uno de los tamaños permitidos por Next (deviceSizes/imageSizes):
// 640, 750, 828, 1080, 1200, 1920… o 16-384 para miniaturas.
// ponytail: usamos la URL del optimizador directamente en <img> en vez de migrar
// 40 <img> a next/image; mismo ahorro de egress, sin tocar layouts.
// ─────────────────────────────────────────────────────────────────────────────

export function optImg(src?: string | null, w = 1080): string {
  if (!src) return ''
  if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`
}
