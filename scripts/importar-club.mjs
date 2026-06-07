// ─────────────────────────────────────────────────────────────────────────────
// Importador del CRM del Club Deportivo Origen desde Excel multi-hoja.
//
//   node scripts/importar-club.mjs "<ruta.xlsx>" "<temporada>"          (dry-run)
//   node scripts/importar-club.mjs "<ruta.xlsx>" "<temporada>" commit   (escribe)
//
// Reutilizable para futuras temporadas: cambia la ruta y la temporada.
// Idempotente: no duplica (clave nombre+apellidos+actividad+grupo+temporada).
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import crypto from 'crypto'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const RUTA = process.argv[2] || 'C:/Users/carlo/Downloads/alumnos club Origen mayo 2026.xlsx'
const TEMPORADA = process.argv[3] || '2025/26'
const COMMIT = process.argv.includes('commit')

// ── Config por hoja ───────────────────────────────────────────────────────────
const SHEETS = [
  { sheet: 'gimnasia acrobatica', actividad: 'Gimnasia Acrobática', privada: false, mode: 'sections',
    cols: { nombre: 1, apellidos: 2, tutor: 3, telefono: 4, dias: 5, fnac: 6 } },
  { sheet: 'telas aéreas', actividad: 'Escuela de aéreos', privada: false, mode: 'sections',
    cols: { nombre: 1, apellidos: 2, tutor: 3, telefono: 4, dias: 5, fnac: 6 } },
  { sheet: 'escuela infantil', actividad: 'Escuela infantil', privada: false, mode: 'flat', grupoNorm: 'infantil',
    cols: { nombre: 1, apellidos: 2, tutor: 3, telefono: 4, grupo: 5, dias: 6, fnac: 7, email: 8 } },
  { sheet: 'escuela bienestar', actividad: 'Escuela de Bienestar', privada: false, mode: 'flat',
    cols: { nombre: 1, apellidos: 2, telefono: 3, fnac: 4 } },
  { sheet: 'Escuela BBJ Adamas', actividad: 'Jiu-Jitsu Brasileño', privada: false, mode: 'flat',
    cols: { nombreCompleto: 1, email: 2, fnac: 3, telefono: 4 } },
  { sheet: 'gimnasia ritmica', actividad: 'Gimnasia Rítmica', privada: true, mode: 'flat',
    cols: { nombre: 1, apellidos: 2, tutor: 3, telefono: 4, anio: 5 } },
  { sheet: 'extraescolar Isaac Albeniz', actividad: 'Colegio Isaac Albéniz', privada: true, mode: 'flat',
    cols: { nombre: 1, apellidos: 2, tutor: 3, telefono: 4, edad: 5 } },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
const limpia = s => String(s ?? '').replace(/\*/g, '').replace(/\s+/g, ' ').trim()
const tel = v => String(v ?? '').replace(/\D/g, '')

function fnacISO(v) {
  if (v == null || v === '') return ''
  if (typeof v === 'number' && v > 10000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000))
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }
  const s = String(v).trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/); if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` }
  return ''
}

function grupoCanonico(header) {
  const H = norm(header)
  let m = H.match(/avanzado\s*(\d+)?/); if (m) return 'Avanzado' + (m[1] ? ' ' + m[1] : '')
  m = H.match(/medio\s*(\d+)/); if (m) return 'Medio ' + m[1]
  m = H.match(/(iniciacion|inicio)\s*(\d+)/); if (m) return 'Iniciación ' + m[2]
  return null // cabecera anómala (p.ej. un nombre suelto)
}

function scheduleDe(header) {
  const partes = String(header).split(' - ').map(s => s.trim()).filter(Boolean)
  return partes.slice(1).join(' · ')
}

function normGrupoInfantil(raw) {
  const s = norm(raw)
  if (!s) return ''
  const m = s.match(/(\d+)/)
  if (m) return 'Infantil ' + m[1]
  if (/inf/.test(s)) return 'Infantil'
  return limpia(raw)
}

// ── Parseo del Excel ────────────────────────────────────────────────────────────
const wb = XLSX.read(fs.readFileSync(RUTA), { cellDates: false, raw: true })
const alumnos = []
const incidencias = []
const gruposSet = new Map() // `${actividad}||${grupo}` -> {actividad, grupo}

for (const cfg of SHEETS) {
  const ws = wb.Sheets[cfg.sheet]
  if (!ws) { incidencias.push(`Hoja no encontrada: ${cfg.sheet}`); continue }
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true, header: 1 })
  let grupoActual = ''

  for (const r of rows) {
    const c = cfg.cols
    const nombreRaw = c.nombreCompleto != null ? r[c.nombreCompleto] : r[c.nombre]
    const c1 = limpia(nombreRaw)
    if (!c1) continue
    if (/^nombre$/i.test(c1)) continue // fila de cabecera de columnas

    // ¿cabecera de sección (grupo)? -> la columna índice (col 0) está vacía
    if (cfg.mode === 'sections') {
      const idx = r[0]
      const esIndice = typeof idx === 'number' || /^\d+$/.test(String(idx).trim())
      if (!esIndice) {
        const g = grupoCanonico(c1)
        if (g) { grupoActual = g; gruposSet.set(`${cfg.actividad}||${g}`, { actividad: cfg.actividad, grupo: g, horario: scheduleDe(c1) }) }
        else incidencias.push(`[${cfg.sheet}] Cabecera no reconocida como grupo: «${c1}» (ignorada)`)
        continue
      }
    }

    // ── Alumno ──
    let nombre, apellidos
    if (c.nombreCompleto != null) {
      const partes = c1.split(' ')
      nombre = partes[0]; apellidos = partes.slice(1).join(' ')
    } else {
      nombre = c1; apellidos = limpia(r[c.apellidos])
    }

    let grupo = ''
    if (cfg.mode === 'sections') grupo = grupoActual
    else if (c.grupo != null) grupo = cfg.grupoNorm === 'infantil' ? normGrupoInfantil(r[c.grupo]) : limpia(r[c.grupo])

    const obsParts = []
    if (c.dias != null && limpia(r[c.dias])) obsParts.push('Días: ' + limpia(r[c.dias]))
    if (cfg.mode === 'sections' && grupo) {
      const horario = gruposSet.get(`${cfg.actividad}||${grupo}`)?.horario
      if (horario) obsParts.push('Horario: ' + horario)
    }
    if (c.anio != null && String(r[c.anio] ?? '').trim()) obsParts.push('Año de nacimiento: ' + String(r[c.anio]).trim())
    if (c.edad != null && String(r[c.edad] ?? '').trim()) obsParts.push('Edad: ' + String(r[c.edad]).trim())

    const fechaNacimiento = c.fnac != null ? fnacISO(r[c.fnac]) : ''
    const telefono = c.telefono != null ? tel(r[c.telefono]) : ''
    const email = c.email != null ? limpia(r[c.email]) : ''
    const tutorLegal = c.tutor != null ? limpia(r[c.tutor]) : ''

    if (String(nombreRaw).includes('*')) incidencias.push(`[${cfg.sheet}] Nombre con «*» (revisar): ${c1}`)

    if (grupo) gruposSet.set(`${cfg.actividad}||${grupo}`, gruposSet.get(`${cfg.actividad}||${grupo}`) || { actividad: cfg.actividad, grupo })

    alumnos.push({
      sheet: cfg.sheet, actividad: cfg.actividad, privada: cfg.privada,
      nombre, apellidos, tutorLegal, telefono, email, fechaNacimiento,
      grupo, observaciones: obsParts.join(' · '),
    })
  }
}

// ── Deduplicado dentro del archivo ──────────────────────────────────────────────
const keyDe = a => [norm(a.nombre), norm(a.apellidos), a.actividad, norm(a.grupo), TEMPORADA].join('|')
const vistos = new Set()
const dupFichero = []
const multiGrupo = new Map() // persona+actividad -> grupos
const unicos = []
for (const a of alumnos) {
  const k = keyDe(a)
  if (vistos.has(k)) { dupFichero.push(`${a.nombre} ${a.apellidos} · ${a.actividad} · ${a.grupo}`); continue }
  vistos.add(k); unicos.push(a)
  const pk = `${norm(a.nombre)} ${norm(a.apellidos)}||${a.actividad}`
  multiGrupo.set(pk, (multiGrupo.get(pk) || 0) + 1)
}

// ── Validación: campos vacíos importantes ────────────────────────────────────────
const sinTelefono = unicos.filter(a => !a.telefono && !a.privada).length
const sinFnac = unicos.filter(a => !a.fechaNacimiento).length
const sinApellidos = unicos.filter(a => !a.apellidos).length

// ── Resumen por actividad/grupo ──────────────────────────────────────────────────
const resumen = {}
for (const a of unicos) {
  resumen[a.actividad] ??= { total: 0, privada: a.privada, grupos: {} }
  resumen[a.actividad].total++
  const g = a.grupo || '(sin grupo)'
  resumen[a.actividad].grupos[g] = (resumen[a.actividad].grupos[g] || 0) + 1
}

// ── Conexión ────────────────────────────────────────────────────────────────────
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

// Existentes (para no duplicar) + semillas de prueba
const { data: exSubs } = await db.from('form_submissions').select('id, nombre, datos').eq('tipo', 'inscripcion_club')
const { data: exGest } = await db.from('club_gestion').select('submission_id, grupo, temporada')
const gestById = new Map((exGest || []).map(g => [g.submission_id, g]))
const existentesKeys = new Set()
const semillas = []
for (const s of exSubs || []) {
  const d = s.datos || {}
  if (d.__seed === true) semillas.push(s.id)
  const g = gestById.get(s.id) || {}
  const completo = String(s.nombre || '')
  const nombre = d.nombre || completo.split(' ')[0] || ''
  const apellidos = d.apellidos || completo.split(' ').slice(1).join(' ')
  existentesKeys.add([norm(nombre), norm(apellidos), d.actividad || '', norm(g.grupo || ''), g.temporada || ''].join('|'))
}
const aInsertar = unicos.filter(a => !existentesKeys.has(keyDe(a)))
const yaEnBD = unicos.length - aInsertar.length

// ── Informe ──────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════')
console.log(`  IMPORTACIÓN CRM CLUB · Temporada ${TEMPORADA} · ${COMMIT ? '🟢 COMMIT' : '🟡 DRY-RUN'}`)
console.log('══════════════════════════════════════════════════════════')
console.log(`Archivo: ${RUTA}`)
console.log(`\nAlumnos en Excel: ${alumnos.length} | únicos: ${unicos.length} | nuevos a insertar: ${aInsertar.length} | ya en BD: ${yaEnBD}`)
console.log('\n── Por actividad / grupo ──')
for (const [act, info] of Object.entries(resumen)) {
  console.log(`\n• ${act} ${info.privada ? '🔒 (privada, solo admin)' : ''} — ${info.total} alumnos`)
  for (const [g, n] of Object.entries(info.grupos).sort()) console.log(`    - ${g}: ${n}`)
}
console.log('\n── Grupos detectados (a registrar) ──')
console.log([...gruposSet.values()].map(g => `${g.actividad} :: ${g.grupo}`).sort().join('\n'))
console.log('\n── Validación / incidencias ──')
console.log(`Sin teléfono (no privadas): ${sinTelefono} | Sin fecha nac.: ${sinFnac} | Sin apellidos: ${sinApellidos}`)
console.log(`Duplicados exactos en el archivo (omitidos): ${dupFichero.length}`)
if (dupFichero.length) console.log('   ' + dupFichero.join('\n   '))
const multi = [...multiGrupo.entries()].filter(([, n]) => n > 1)
console.log(`Alumnos en varios grupos de la misma actividad (se mantienen como líneas separadas): ${multi.length}`)
if (incidencias.length) { console.log('Otras incidencias:'); incidencias.forEach(i => console.log('   - ' + i)) }
console.log(`\nInscripciones de prueba (__seed) en BD: ${semillas.length}${semillas.length ? ' → se eliminarán en commit' : ''}`)

// ── Escritura ─────────────────────────────────────────────────────────────────────
if (!COMMIT) {
  console.log('\n🟡 DRY-RUN: no se ha escrito nada. Repite con «commit» al final para guardar.\n')
  process.exit(0)
}

// Precondición: las tablas de gestión deben existir antes de tocar nada
for (const t of ['club_gestion', 'club_grupos']) {
  const { error } = await db.from(t).select('*').limit(1)
  if (error) {
    console.log(`\n❌ Falta la tabla «${t}» (${error.code}). Ejecuta primero supabase/migration_club.sql en el SQL Editor de Supabase.\n   No se ha escrito nada.\n`)
    process.exit(1)
  }
}

// 1) Eliminar semillas de prueba
if (semillas.length) {
  await db.from('club_gestion').delete().in('submission_id', semillas)
  await db.from('form_submissions').delete().in('id', semillas)
  console.log(`🗑️  Eliminadas ${semillas.length} inscripciones de prueba.`)
}

// 2) Insertar grupos nuevos en club_grupos
const { data: gAct } = await db.from('club_grupos').select('actividad, nombre')
const gExist = new Set((gAct || []).map(g => `${g.actividad || ''}||${g.nombre}`))
const gruposNuevos = [...gruposSet.values()]
  .filter(g => !gExist.has(`${g.actividad}||${g.grupo}`))
  .map((g, i) => ({ actividad: g.actividad, nombre: g.grupo, orden: 10 + i }))
if (gruposNuevos.length) {
  const { error } = await db.from('club_grupos').insert(gruposNuevos)
  console.log(error ? `⚠️  Grupos: ${error.message}` : `✅ Grupos registrados: ${gruposNuevos.length}`)
}

// 3) Insertar alumnos (form_submissions + club_gestion) por lotes
const subs = [], gest = []
for (const a of aInsertar) {
  const id = crypto.randomUUID()
  const nombreCompleto = `${a.nombre} ${a.apellidos}`.trim()
  subs.push({
    id, tipo: 'inscripcion_club', nombre: nombreCompleto,
    email: a.email || null, telefono: a.telefono || null,
    asunto: `Inscripción Club · ${a.actividad}`,
    datos: { actividad: a.actividad, nombre: a.nombre, apellidos: a.apellidos, fechaNacimiento: a.fechaNacimiento, tutorLegal: a.tutorLegal, __import: true, origen: `excel-${TEMPORADA}` },
    estado: 'cerrada',
  })
  gest.push({
    submission_id: id, grupo: a.grupo || null, estado_general: 'activo', temporada: TEMPORADA,
    pagos: {}, observaciones: a.observaciones || null, updated_by: 'import-excel',
  })
}
const lote = (arr, n) => arr.reduce((acc, _, i) => (i % n ? acc : [...acc, arr.slice(i, i + n)]), [])
let insertados = 0
for (const chunk of lote(subs, 200)) { const { error } = await db.from('form_submissions').insert(chunk); if (error) { console.log('❌ subs:', error.message); process.exit(1) } insertados += chunk.length }
for (const chunk of lote(gest, 200)) { const { error } = await db.from('club_gestion').insert(chunk); if (error) { console.log('❌ gestion:', error.message); process.exit(1) } }
console.log(`\n✅ IMPORTADOS ${insertados} alumnos en la temporada ${TEMPORADA}.`)
console.log('   Revisa el panel: /admin/club\n')
