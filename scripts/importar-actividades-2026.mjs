// ─────────────────────────────────────────────────────────────────────────────
// Importa "ACTIVIDADES 2026.xlsx" al CRM de Reservas (empresa).
//   node scripts/importar-actividades-2026.mjs "<ruta.xlsx>"          (dry-run)
//   node scripts/importar-actividades-2026.mjs "<ruta.xlsx>" commit    (escribe)
//
// Historial ya realizado → estado 'finalizada'. Pago 'pagado' si la fila trae
// importe/forma de pago; si no, 'pendiente'. Idempotente (purga import previo).
// Cada hoja tiene estructura propia: se parsea a medida y se filtran plantillas.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import crypto from 'crypto'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

const RUTA = process.argv[2] || 'C:/Users/carlo/Downloads/ACTIVIDADES 2026.xlsx'
const COMMIT = process.argv.includes('commit')
const MARCA = 'actividades-2026'

// ── Helpers ───────────────────────────────────────────────────────────────────
const S = v => String(v ?? '').replace(/\s+/g, ' ').trim()
const isNum = v => typeof v === 'number' || /^\d+([.,]\d+)?$/.test(S(v))
function imp(v) {
  if (typeof v === 'number') return isNaN(v) ? null : v
  const s = S(v).replace(/[^\d.,]/g, ''); if (!s) return null
  const n = Number(s.includes(',') && !s.includes('.') ? s.replace(',', '.') : s.replace(/,/g, ''))
  return isNaN(n) ? null : n
}
function tel(v) { const d = S(v).replace(/\D/g, ''); return d || '' }
function serialISO(v) {
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000))
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }
  return ''
}
function horaDe(v) {
  if (typeof v === 'number' && v > 0 && v < 1) {
    const tot = Math.round(v * 24 * 60); return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`
  }
  return S(v)
}
const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 }
function fechaCumple(mes, dia) {
  const m = MESES[S(mes).toLowerCase()]; const d = parseInt(S(dia), 10)
  if (!m || !d) return ''
  return `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function fechaDeTitulo(t) {
  const m = S(t).toLowerCase().match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/)
  if (!m) return ''
  return `2026-${String(MESES[m[2]]).padStart(2, '0')}-${String(parseInt(m[1], 10)).padStart(2, '0')}`
}

const wb = XLSX.read(fs.readFileSync(RUTA), { cellDates: false, raw: true })
const sh = name => XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '', raw: true, header: 1 })
const registros = []
const inc = []
function add(r) { registros.push(r) }

// ── CUMPLEAÑOS ───────────────────────────────────────────────────────────────
{
  const rows = sh('CUMPLEAÑOS 2026'); let mes = ''
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i]; if (S(r[1])) mes = S(r[1])
    const cumple = S(r[5]); if (!cumple) continue
    const total = imp(r[13])
    add({
      sheet: 'Cumpleaños', servicio: 'Cumpleaños',
      cliente_nombre: S(r[8]) || cumple, email: S(r[9]), telefono: tel(r[10]), entidad: '',
      fecha: fechaCumple(mes, r[2]), hora: horaDe(r[4]),
      participantes: imp(r[7]), total, pagado: !!(total && total > 0), metodo: '',
      detalles: { cumpleanero: cumple, edad: S(r[6]), precioParticipante: imp(r[11]), reserva: S(r[12]) }, nota: '',
    })
  }
}

// ── CAMPAMENTO SEMANA SANTA ──────────────────────────────────────────────────
{
  const rows = sh('CAMPAMENTO S.SANTA')
  for (let i = 7; i < rows.length; i++) {
    const r = rows[i]; const nom = S(r[1]); if (!nom || !isNum(r[0])) continue
    const total = imp(r[15])
    add({
      sheet: 'Campamento S. Santa', servicio: 'Campamento de Semana Santa',
      cliente_nombre: `${nom} ${S(r[2])}`.trim(), email: S(r[7]), telefono: tel(r[6]), entidad: '',
      fecha: '', hora: '', participantes: 1, total, pagado: !!(total && total > 0), metodo: '',
      detalles: { fechaNacimiento: serialISO(r[3]), edad: S(r[4]), tutor: S(r[5]) }, nota: '',
    })
  }
}

// ── CAMPAMENTO VERANO ────────────────────────────────────────────────────────
{
  const rows = sh('CAMPAMENTO VERANO NAVE')
  for (let i = 4; i < rows.length; i++) {
    const r = rows[i]; const nom = S(r[2]); if (!nom || !isNum(r[1])) continue
    const total = imp(r[15])
    add({
      sheet: 'Campamento Verano', servicio: 'Campamento de Verano',
      cliente_nombre: `${nom} ${S(r[3])}`.trim(), email: S(r[7]), telefono: tel(r[6]), entidad: '',
      fecha: '', hora: '', participantes: 1, total, pagado: !!(total && total > 0), metodo: S(r[16]),
      detalles: { semana: S(r[8]), matinal: S(r[13]), fechaNacimiento: serialISO(r[4]), tutor: S(r[5]) }, nota: '',
    })
  }
}

// ── DOMINGOS EN FAMILIA ──────────────────────────────────────────────────────
{
  const rows = sh('DOMINGOS EN FAMILIA')
  for (let i = 4; i < rows.length; i++) {
    const r = rows[i]; const adulto = S(r[1]); const part = S(r[2]); if (!adulto && !part) continue
    if (/^nombre/i.test(adulto)) continue
    const total = imp(r[6])
    add({
      sheet: 'Domingos en Familia', servicio: 'Domingos en Familia',
      cliente_nombre: adulto || part, email: S(r[4]), telefono: tel(r[3]), entidad: '',
      fecha: serialISO(r[5]), hora: '11:00 – 13:00', participantes: 1, total, pagado: !!(total && total > 0), metodo: '',
      detalles: { participante: part }, nota: '',
    })
  }
}

// ── EVENTOS FUERA DE INSTALACIÓN ─────────────────────────────────────────────
{
  const rows = sh('EVENTOS FUERA DE INSTALACION'); let seccion = 'Evento externo'
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const c0 = S(r[0]), c1 = S(r[1])
    if (c0 && !c1 && !isNum(r[0]) && !/^fecha/i.test(c0)) { seccion = c0.charAt(0) + c0.slice(1).toLowerCase(); continue }
    if (/^fecha/i.test(c0)) continue
    if (!c1 || !(typeof r[0] === 'number')) continue
    const total = imp(r[10]); const metodo = S(r[11])
    const np = imp(r[5]); const part = (np != null && np < 500) ? np : null
    add({
      sheet: 'Eventos fuera', servicio: `Evento · ${seccion}`,
      cliente_nombre: S(r[2]) || c1, email: '', telefono: tel(r[3]), entidad: S(r[4]),
      fecha: serialISO(r[0]), hora: S(r[6]), participantes: part, total, pagado: !!(metodo || (total && total > 0)), metodo,
      detalles: { nino: c1, lugar: S(r[4]), edades: S(r[7]), actividades: S(r[9]), numNinos: S(r[5]) }, nota: '',
    })
  }
}

// ── EXCURSIONES EN INSTALACIÓN ───────────────────────────────────────────────
{
  const rows = sh('EXCURSIONES INSTALACION')
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; const centro = S(r[1]); if (!centro) continue
    const total = imp(r[8]); const metodo = S(r[9])
    add({
      sheet: 'Excursiones', servicio: 'Excursiones Escolares',
      cliente_nombre: centro, email: '', telefono: tel(r[3]), entidad: centro,
      fecha: serialISO(r[0]), hora: S(r[6]), participantes: imp(r[5]), total, pagado: !!(metodo || (total && total > 0)), metodo,
      detalles: { edades: S(r[4]), horario: S(r[6]) }, nota: '',
    })
  }
}

// ── DÍAS SIN COLE ────────────────────────────────────────────────────────────
{
  const rows = sh('DIAS SIN COLE 2026')
  for (let i = 8; i < rows.length; i++) {
    const r = rows[i]; const nom = S(r[1]); if (!nom || /^nombre/i.test(nom)) continue
    const total = imp(r[11])
    add({
      sheet: 'Días Sin Cole', servicio: 'Días Sin Cole',
      cliente_nombre: `${nom} ${S(r[2])}`.trim(), email: S(r[7]), telefono: tel(r[6]), entidad: '',
      fecha: '', hora: '9:00 – 14:00', participantes: 1, total, pagado: !!(total && total > 0), metodo: '',
      detalles: { fechaNacimiento: serialISO(r[3]), edad: S(r[4]), tutor: S(r[5]), grupoWhatsapp: S(r[8]) }, nota: '',
    })
  }
}

// ── TALLERES INTENSIVOS Y EVENTOS (dos tablas solapadas) ─────────────────────
{
  const rows = sh('TALLERES INTENSIVOS Y EVENTOS N')
  // IZQUIERDA (cols 0-6)
  let tIzq = ''
  for (const r of rows) {
    const c0 = r[0], c1 = S(r[1])
    if (!S(c0) && c1 && /(TALLER|INTENSIVO)/i.test(c1)) { tIzq = c1; continue }
    if (typeof c0 === 'number' && c1 && !c1.includes('@') && tIzq) {
      const total = imp(r[5])
      add({
        sheet: 'Talleres Intensivos', servicio: 'Talleres Intensivos',
        cliente_nombre: c1, email: S(r[2]), telefono: tel(r[4]), entidad: '',
        fecha: fechaDeTitulo(tIzq), hora: '', participantes: 1, total, pagado: !!(total && total > 0), metodo: '',
        detalles: { taller: tIzq, fechaNacimiento: serialISO(r[3]) }, nota: '',
      })
    }
  }
  // DERECHA (cols 9-13)
  let tDer = '', partCol = 9, aduCol = 10
  for (const r of rows) {
    const c9 = S(r[9]); if (!c9) continue
    if (/(TALLER|INTENSIVO)/i.test(c9)) { tDer = c9; partCol = 9; aduCol = 10; continue }
    if (/^total|^equipo/i.test(c9)) continue
    if (/^nombre/i.test(c9)) { partCol = /participante/i.test(c9) ? 9 : 10; aduCol = partCol === 9 ? 10 : 9; continue }
    if (!tDer) continue
    const participante = S(r[partCol]), adulto = S(r[aduCol]); const total = imp(r[13])
    add({
      sheet: 'Talleres Intensivos', servicio: 'Talleres Intensivos',
      cliente_nombre: adulto || participante, email: '', telefono: '', entidad: '',
      fecha: fechaDeTitulo(tDer), hora: '', participantes: 1, total, pagado: !!(total && total > 0), metodo: '',
      detalles: { taller: tDer, participante }, nota: '',
    })
  }
}

// ── Deduplicado y validación ─────────────────────────────────────────────────
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const seen = new Set(); const dups = []
const unicos = registros.filter(r => {
  const k = [r.servicio, norm(r.cliente_nombre), r.fecha, r.total, norm(r.detalles.cumpleanero || r.detalles.participante || r.detalles.taller || '')].join('|')
  if (seen.has(k)) { dups.push(r); return false } seen.add(k); return true
})
const porServicio = {}
for (const r of unicos) { porServicio[r.servicio] = (porServicio[r.servicio] || 0) + 1 }
const sinTel = unicos.filter(r => !r.telefono).length
const sinImporte = unicos.filter(r => r.total == null).length

// ── Conexión ──────────────────────────────────────────────────────────────────
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

// ── Informe ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════')
console.log(`  IMPORTACIÓN ACTIVIDADES 2026 · ${COMMIT ? '🟢 COMMIT' : '🟡 DRY-RUN'}`)
console.log('══════════════════════════════════════════════════════════')
console.log(`Registros en Excel: ${registros.length} | únicos: ${unicos.length} | duplicados omitidos: ${dups.length}`)
console.log('\n── Por servicio ──')
for (const [s, n] of Object.entries(porServicio).sort()) console.log(`  • ${s}: ${n}`)
const pagados = unicos.filter(r => r.pagado).length
console.log(`\nPagados (según Excel): ${pagados} | Pendientes: ${unicos.length - pagados}`)
console.log(`Sin teléfono: ${sinTel} | Sin importe: ${sinImporte}`)
if (inc.length) { console.log('Incidencias:'); inc.forEach(i => console.log('  - ' + i)) }

if (!COMMIT) { console.log('\n🟡 DRY-RUN: no se ha escrito nada. Repite con «commit».\n'); process.exit(0) }

// ── Precondición ──────────────────────────────────────────────────────────────
for (const t of ['bookings', 'crm_gestion']) {
  const { error } = await db.from(t).select('*').limit(1)
  if (error) { console.log(`\n❌ Falta la tabla «${t}» (${error.code}).`); process.exit(1) }
}

// ── Purga de importación previa (idempotente) ─────────────────────────────────
const { data: prev } = await db.from('bookings').select('id').ilike('observaciones', `%"__src":"${MARCA}"%`)
const prevIds = (prev || []).map(b => b.id)
if (prevIds.length) {
  await db.from('crm_gestion').delete().eq('origen', 'booking').in('origen_id', prevIds)
  await db.from('bookings').delete().in('id', prevIds)
  console.log(`🗑️  Purgada importación previa: ${prevIds.length} reservas.`)
}

// ── Construir e insertar ──────────────────────────────────────────────────────
const bookings = [], gest = []
for (const r of unicos) {
  const id = crypto.randomUUID()
  const detalles = Object.fromEntries(Object.entries(r.detalles).filter(([, v]) => S(v) !== ''))
  const obs = `${r.nota ? r.nota + '\n' : ''}${JSON.stringify({ ...detalles, __src: MARCA })}`
  bookings.push({
    id, numero: 'PM-' + id.slice(0, 6).toUpperCase(), servicio: r.servicio,
    cliente_nombre: r.cliente_nombre || null, cliente_email: r.email || null, cliente_telefono: r.telefono || null,
    fecha: r.fecha || null, hora: r.hora || null, participantes: r.participantes ?? null, precio: r.total ?? null,
    estado_reserva: 'confirmada', estado_pago: r.pagado ? 'pagado' : 'pendiente', observaciones: obs,
  })
  gest.push({
    origen: 'booking', origen_id: id, estado_reserva: 'finalizada',
    estado_pago: r.pagado ? 'pagado' : 'pendiente', total: r.total ?? null, pagado: r.pagado ? (r.total ?? null) : null,
    metodo_pago: r.metodo || null, participantes: r.participantes ?? null, updated_by: 'import-2026',
  })
}
const lote = (a, n) => a.reduce((acc, _, i) => (i % n ? acc : [...acc, a.slice(i, i + n)]), [])
for (const c of lote(bookings, 200)) { const { error } = await db.from('bookings').insert(c); if (error) { console.log('❌ bookings:', error.message); process.exit(1) } }
for (const c of lote(gest, 200)) { const { error } = await db.from('crm_gestion').insert(c); if (error) { console.log('❌ crm_gestion:', error.message); process.exit(1) } }
console.log(`\n✅ IMPORTADAS ${bookings.length} actividades al CRM de Reservas (estado: Finalizada).`)
console.log('   Revísalas en /admin/reservas\n')
