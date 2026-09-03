import sharp from 'sharp'

// ─────────────────────────────────────────────────────────────────────────────
// Comprime las imágenes ANTES de subirlas a Supabase Storage: redimensiona a
// 1600 px máx y convierte a WebP (~80 %). Un JPG de varios MB baja a ~100-200 KB,
// lo que reduce drásticamente el egress del CDN de Storage (cada carga pesa mucho
// menos). Si sharp no puede procesar el archivo, devuelve null y el que llama
// sube el original: nunca rompe la subida.
// ─────────────────────────────────────────────────────────────────────────────

export async function comprimirImagen(buffer: Buffer): Promise<{ buffer: Buffer; contentType: string; ext: string } | null> {
  try {
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
