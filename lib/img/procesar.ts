// ─────────────────────────────────────────────────────────────────────────────
// Comprime las imágenes ANTES de subirlas a Supabase Storage: redimensiona a
// 1600 px máx y convierte a WebP (~80 %). Un JPG de varios MB baja a ~100-200 KB,
// lo que reduce drásticamente el egress del CDN de Storage.
//
// IMPORTANTE: sharp se importa de forma PEREZOSA dentro del try. Es un módulo
// nativo; si su binario no está disponible en el entorno (p. ej. Vercel sin el
// binario linux), un import estático arriba haría fallar la CARGA del módulo y
// tumbaría CUALQUIER server action de la ruta que lo incluya (la ficha del CRM
// usa SubirImagen → subirImagen → esto). Con el import perezoso + catch, si sharp
// no puede cargar/procesar, se devuelve null y el que llama sube el original:
// nunca rompe la subida ni el resto de acciones.
// ─────────────────────────────────────────────────────────────────────────────

export async function comprimirImagen(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string; ext: string } | null> {
  try {
    const sharp = (await import('sharp')).default
    const out = await sharp(buffer, { failOn: 'none' })
      .rotate()                                                          // respeta la orientación EXIF
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    return { buffer: out, contentType: 'image/webp', ext: 'webp' }
  } catch {
    return null
  }
}
