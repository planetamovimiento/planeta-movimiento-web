// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZADOR DE FOTOS · Planeta Movimiento
// Lee las fotos originales de /Imagenes_web, las redimensiona y convierte a
// WebP ligero, y las guarda en /public/fotos/<slug>/N.webp por servicio.
//
//   node scripts/optimizar-fotos.mjs
// ─────────────────────────────────────────────────────────────────────────────

import sharp from 'sharp'
import { readdirSync, statSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

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
  'Ocio/Cumpleaños': 'cumpleanos',
  'Ocio/Eventos y Celebraciones': 'eventos',
  'Ocio/Talleres Participativos': 'talleres',
  'Educacion/Actividades extraescolares en colegios': 'extraescolares',
  'Educacion/Curso de Monitor de Actividades Juveniles': 'monitor-juvenil',
  'Educacion/Excursiones a nuestra instalacion': 'excursiones',
  'Colchonetas': 'colchonetas',
}

const esImagen = f => /\.(jpe?g|png|webp)$/i.test(f)

function ficherosDe(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(f => esImagen(f) && statSync(join(dir, f)).isFile()).sort()
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
    await sharp(join(dirOrigen, f))
      .rotate() // respeta orientación EXIF
      .resize({ width: ANCHO_MAX, withoutEnlargement: true })
      .webp({ quality: CALIDAD })
      .toFile(salida)
  }
  resumen[slug] = n
}

console.log('\n✅ Optimización completada:\n')
for (const [slug, n] of Object.entries(resumen)) {
  console.log(`  /fotos/${slug}/  →  ${n} foto(s)`)
}
console.log('')
