// ─────────────────────────────────────────────────────────────────────────────
// BOT DE PRUEBA · Planeta Movimiento
// Rellena una reserva/solicitud de cada servicio para verificar el panel.
//
//   node scripts/seed-test.mjs          → crea datos de prueba
//   node scripts/seed-test.mjs clean    → borra los datos de prueba
//
// Marca de prueba: bookings.numero empieza por "PM-TEST", emails "@seed.test".
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'

// ── Cargar credenciales de .env.local ────────────────────────────────────────
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const get = (k) => (env.match(new RegExp(`${k}=(.*)`)) || [])[1]?.trim()
const URL_BASE = get('NEXT_PUBLIC_SUPABASE_URL')
const KEY = get('SUPABASE_SECRET_KEY')
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const rest = (path, method = 'GET', body) =>
  fetch(`${URL_BASE}/rest/v1/${path}`, { method, headers: { ...H, Prefer: 'return=representation,resolution=merge-duplicates' }, body: body ? JSON.stringify(body) : undefined })

// Fecha futura a N días
const futuro = (dias) => { const d = new Date(); d.setDate(d.getDate() + dias); return d.toISOString().slice(0, 10) }

// ── Datos de prueba ──────────────────────────────────────────────────────────

// CLUB DEPORTIVO ORIGEN → form_submissions tipo='inscripcion_club'
const CLUB = [
  { actividad: 'Gimnasia acrobática y trampolín', nombre: 'Lucía Test', tutor: 'María Test', edad: '2015-04-10' },
  { actividad: 'Telas Aéreas', nombre: 'Mario Test', tutor: 'Pedro Test', edad: '2012-09-01' },
  { actividad: 'Escuela Infantil', nombre: 'Olivia Test', tutor: 'Sara Test', edad: '2021-02-20' },
  { actividad: 'Jiu-Jitsu Brasileño', nombre: 'Dani Test', tutor: '', edad: '2002-06-15' },
  { actividad: 'Escuela de Bienestar', nombre: 'Carmen Test', tutor: '', edad: '1985-11-30' },
  { actividad: 'Circo Inclusivo', nombre: 'Asoc. CADIG Test', tutor: '', edad: '' },
]

// EMPRESA → bookings (reservas)
const RESERVAS = [
  { servicio: 'Cumpleaños', nombre: 'Familia Pérez Test', fecha: futuro(12), hora: '18:15 – 20:15', part: 15, precio: 195, estado: 'pendiente', datos: { merienda: 'Nuggets', traeTarta: 'No' } },
  { servicio: 'Campamento de Verano', nombre: 'Familia Gómez Test', fecha: futuro(40), part: 2, precio: 190, estado: 'confirmada', datos: { semana: 'Semana 1 - Tierra', cuponHermanos: 'Aplicado' } },
  { servicio: 'Campamento de Navidad', nombre: 'Familia Ruiz Test', fecha: futuro(60), part: 1, precio: 0, estado: 'pendiente', datos: { dias: '26,27,28 dic' } },
  { servicio: 'Campamento de Semana Santa', nombre: 'Familia Díaz Test', fecha: futuro(90), part: 1, precio: 0, estado: 'pendiente', datos: {} },
  { servicio: 'Evento · Boda', nombre: 'Ana & Luis Test', fecha: futuro(75), hora: '18:00 a 21:00', part: 20, precio: 363, estado: 'pendiente', datos: { pack: 'Pack Grande', extras: 'AirTrack' } },
  { servicio: 'Días Sin Cole', nombre: 'Familia López Test', fecha: futuro(20), hora: '9:00 - 14:00', part: 1, precio: 36.3, estado: 'confirmada', datos: {} },
  { servicio: 'Domingos en Familia', nombre: 'Familia Marín Test', fecha: futuro(7), hora: '11:00 - 13:00', part: 2, precio: 30, estado: 'pagada', datos: { nota: 'Adultos gratis' } },
  { servicio: 'Noche de Halloween', nombre: 'Familia Soto Test', fecha: futuro(120), part: 3, precio: 0, estado: 'espera', datos: { evento: 'Apocalipsis Zombie', edades: '11, 12' } },
]

// EMPRESA → form_submissions (solicitudes, NO club)
const SOLICITUDES = [
  { tipo: 'colegio', nombre: 'CEIP San Julián Test', asunto: 'Excursión escolar', datos: { centro: 'CEIP San Julián', alumnos: '55', cursos: '5º y 6º Primaria' } },
  { tipo: 'extraescolar', nombre: 'AMPA Las Acacias Test', asunto: 'Extraescolar Multideporte', datos: { colegio: 'CEIP Las Acacias', numAlumnos: '20', dias: 'Ma, Ju' } },
  { tipo: 'presupuesto', nombre: 'Ayto. Cuenca Test', asunto: 'Taller de circo', datos: { entidad: 'Ayto. de Cuenca', participantes: '60', modulos: 'AirTrack, Taller de Circo', presupuesto: '950 €' } },
  { tipo: 'inscripcion', nombre: 'Sergio Test', asunto: 'Taller intensivo · Backflip', datos: { taller: 'Backflip', solicitud: 'Avisar cuando abra' } },
  { tipo: 'colchonetas', nombre: 'Gimnasio Flic Flac Test', asunto: 'Personalización · Quitamiedos', datos: { producto: 'Quitamiedos', medidas: '250×200×40', color: 'Azul' } },
]

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')

async function seed() {
  let n = 0
  console.log('\n🤖 Generando datos de prueba...\n')

  // Club
  for (const c of CLUB) {
    const email = `club.${slug(c.nombre)}@seed.test`
    await rest('customers', 'POST', { nombre: c.nombre, email, telefono: '600000000' })
    await rest('form_submissions', 'POST', {
      tipo: 'inscripcion_club', nombre: c.nombre, email, telefono: '600000000',
      asunto: `Inscripción Club · ${c.actividad}`, mensaje: 'Solicitud de prueba (bot)',
      datos: { actividad: c.actividad, fechaNacimiento: c.edad, tutorLegal: c.tutor, __seed: true }, estado: 'nueva',
    })
    console.log(`  🏅 CLUB     · ${c.actividad}`); n++
  }

  // Reservas empresa
  let i = 0
  for (const r of RESERVAS) {
    const email = `reserva.${slug(r.nombre)}@seed.test`
    await rest('customers', 'POST', { nombre: r.nombre, email, telefono: '611111111' })
    await rest('bookings', 'POST', {
      numero: `PM-TEST-${String(++i).padStart(2, '0')}`, servicio: r.servicio,
      cliente_nombre: r.nombre, cliente_email: email, cliente_telefono: '611111111',
      fecha: r.fecha, hora: r.hora ?? null, participantes: r.part, precio: r.precio,
      estado_reserva: r.estado, estado_pago: r.estado === 'pagada' ? 'pagado' : 'pendiente',
      observaciones: 'Reserva de prueba (bot)\n' + JSON.stringify(r.datos),
    })
    // pago si pagada
    if (r.estado === 'pagada') {
      await rest('payments', 'POST', { cliente_nombre: r.nombre, servicio: r.servicio, importe: r.precio, metodo: 'tarjeta', estado: 'pagado', referencia: 'TEST-' + i })
    }
    console.log(`  📋 EMPRESA  · Reserva ${r.servicio}`); n++
  }

  // Solicitudes empresa
  for (const s of SOLICITUDES) {
    const email = `sol.${slug(s.nombre)}@seed.test`
    await rest('customers', 'POST', { nombre: s.nombre, email, telefono: '622222222' })
    await rest('form_submissions', 'POST', {
      tipo: s.tipo, nombre: s.nombre, email, telefono: '622222222',
      asunto: s.asunto, mensaje: 'Solicitud de prueba (bot)', datos: { ...s.datos, __seed: true }, estado: 'nueva',
    })
    console.log(`  ✉️  EMPRESA  · Solicitud ${s.asunto}`); n++
  }

  console.log(`\n✅ ${n} registros de prueba creados.`)
  console.log('   Míralos en el panel: Club → Solicitudes · Empresa → Reservas/Solicitudes · Clientes')
  console.log('   Para borrarlos:  node scripts/seed-test.mjs clean\n')
}

async function clean() {
  console.log('\n🧹 Borrando datos de prueba...\n')
  const r1 = await rest('bookings?numero=like.PM-TEST*', 'DELETE')
  const r2 = await rest('form_submissions?email=like.*@seed.test', 'DELETE')
  const r3 = await rest('payments?referencia=like.TEST-*', 'DELETE')
  const r4 = await rest('customers?email=like.*@seed.test', 'DELETE')
  const count = async (res) => { try { return (await res.json()).length } catch { return '?' } }
  console.log(`  Reservas borradas:     ${await count(r1)}`)
  console.log(`  Formularios borrados:  ${await count(r2)}`)
  console.log(`  Pagos borrados:        ${await count(r3)}`)
  console.log(`  Clientes borrados:     ${await count(r4)}`)
  console.log('\n✅ Limpieza completada.\n')
}

const cmd = process.argv[2]
if (!URL_BASE || !KEY) { console.error('❌ Faltan credenciales en .env.local'); process.exit(1) }
;(cmd === 'clean' ? clean() : seed()).catch(e => { console.error('Error:', e.message); process.exit(1) })
