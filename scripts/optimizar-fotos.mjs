// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZADOR DE FOTOS · Planeta Movimiento
// Lee las fotos originales de /Imagenes_web, las redimensiona y convierte a
// WebP ligero, y las guarda en /public/fotos/<slug>/N.webp por servicio.
//
//   node scripts/optimizar-fotos.mjs
// ─────────────────────────────────────────────────────────────────────────────

import sharp from 'sharp'
import convert from 'heic-convert'
import { readdirSync, statSync, mkdirSync, existsSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const ORIGEN = 'Imagenes_web'
const DESTINO = 'public/fotos'
const ANCHO_MAX = 1600
const CALIDAD = 80

// Mapa carpeta original → slug de servicio
const MAP = {
  'Club/Gimnasia acrobatica': 'gimnasia-acrobatica',
  'Club/Telas Aéreas': 'telas-aereas',
  'Club/Escuela de bienestar': 'escuela-bienestar',
  'Club/Escuela Infantil': 'escuela-infantil',
  'Club/JiuJitsu Brasileño': 'jiu-jitsu',
  'Club/Circo inclusivo': 'circo-inclusivo',
  'Club/Talleres intensivos': 'talleres-intensivos',
  'Ocio/Campamentos': 'campamentos',
  'Ocio/Campamentos/Campamento Navidad': 'campamento-navidad',
  'Ocio/Campamentos/Campamento Semana Santa': 'campamento-semana-santa',
  'Ocio/Campamentos/Campamento Verano': 'campamento-verano',
  'Ocio/Cumpleaños': 'cumpleanos',
  'Ocio/Eventos y Celebraciones': 'eventos',
  'Ocio/Talleres Participativos': 'talleres',
  'Educacion/Actividades extraescolares en colegios': 'extraescolares',
  'Educacion/Curso de Monitor de Actividades Juveniles': 'monitor-juvenil',
  'Educacion/Excursiones a nuestra instalacion': 'excursiones',
  'Colchonetas': 'colchonetas',
}

const esImagen = f => /\.(jpe?g|png|webp|heic|heif)$/i.test(f)

// Las portadas (fichero cuyo nombre empieza por "portada") van primero; el resto
// en orden natural por ruta. Así "portada X.jpg" se convierte en la foto 1 del
// servicio (la que usan fotoPrincipal() y las portadas de los campamentos).
const esPortada = f => /^portada/i.test(basename(f))
function ordenar(a, b) {
  const pa = esPortada(a), pb = esPortada(b)
  if (pa !== pb) return pa ? -1 : 1
  return a.localeCompare(b, 'es', { numeric: true })
}

// Lee imágenes recursivamente (incluye subcarpetas). Devuelve rutas completas.
function ficherosDe(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const e of readdirSync(dir)) {
    const full = join(dir, e)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...ficherosDe(full))
    else if (esImagen(e) && st.isFile()) out.push(full)
  }
  return out.sort(ordenar)
}

const resumen = {}

for (const [carpeta, slug] of Object.entries(MAP)) {
  const dirOrigen = join(ORIGEN, carpeta)
  const ficheros = ficherosDe(dirOrigen)
  if (ficheros.length === 0) continue

  const dirDestino = join(DESTINO, slug)
  if (existsSync(dirDestino)) rmSync(dirDestino, { recursive: true, force: true })
  mkdirSync(dirDestino, { recursive: true })

  let n = 0
  for (const f of ficheros) {
    n++
    const salida = join(dirDestino, `${n}.webp`)
    const rutaEntrada = f // ruta completa (lector recursivo)
    // HEIC/HEIF: decodificar primero a JPEG (sharp no trae el códec HEVC)
    let entrada = rutaEntrada
    if (/\.(heic|heif)$/i.test(f)) {
      const jpeg = await convert({ buffer: readFileSync(rutaEntrada), format: 'JPEG', quality: 0.92 })
      entrada = Buffer.from(jpeg)
    }
    await sharp(entrada)
      .rotate() // respeta orientación EXIF
      .resize({ width: ANCHO_MAX, withoutEnlargement: true })
      .webp({ quality: CALIDAD })
      .toFile(salida)
    process.stdout.write('.')
  }
  resumen[slug] = n
  console.log(` ${slug} (${n})`)
}

console.log('\n✅ Optimización completada:\n')
for (const [slug, n] of Object.entries(resumen)) {
  console.log(`  /fotos/${slug}/  →  ${n} foto(s)`)
}
console.log('')

// ── Regenerar lib/fotos.ts con el índice de fotos por servicio ────────────────
const entradas = Object.entries(resumen)
  .filter(([, n]) => n > 0)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([slug, n]) => {
    const rutas = Array.from({ length: n }, (_, i) => `'/fotos/${slug}/${i + 1}.webp'`).join(', ')
    return `  '${slug}': [${rutas}],`
  })
  .join('\n')

const contenido = `// ─────────────────────────────────────────────────────────────────────────────
// Índice de fotos por servicio. GENERADO por scripts/optimizar-fotos.mjs.
// No editar a mano: vuelve a ejecutar \`node scripts/optimizar-fotos.mjs\`.
// ─────────────────────────────────────────────────────────────────────────────

export const FOTOS: Record<string, string[]> = {
${entradas}
}

/** Primera foto (principal) de un servicio, o '' si no hay. */
export function fotoPrincipal(slug: string): string {
  return FOTOS[slug]?.[0] ?? ''
}

/** Todas las fotos de un servicio. */
export function fotosDe(slug: string): string[] {
  return FOTOS[slug] ?? []
}
`
writeFileSync('lib/fotos.ts', contenido)
console.log('📝 lib/fotos.ts regenerado.\n')
