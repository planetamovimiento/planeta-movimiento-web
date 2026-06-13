// ─────────────────────────────────────────────────────────────────────────────
// BOTS DE PRUEBA · llena la BD con datos realistas para probar todo el panel
// (reservas, pagos, calendario, clientes, inscripciones del club, familias).
//
//   node --env-file=.env.local scripts/seed-bots.mjs          → crea los datos
//   node --env-file=.env.local scripts/seed-bots.mjs --clean  → los borra todos
//
// Todo va etiquetado: bookings.notas_internas con "[BOT-TEST]", correos "@bot.local"
// y form_submissions.datos.__bot = true. Así el --clean los elimina sin tocar lo real.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const BOT = '[BOT-TEST]'
const DOMAIN = 'bot.local'
const TEMPORADA = '2025/26'

const hoy = new Date()
const iso = (offsetDias) => { const d = new Date(hoy); d.setDate(d.getDate() + offsetDias); return d.toISOString().slice(0, 10) }
const tel = () => '6' + String(Math.floor(10000000 + Math.random() * 89999999))

// ─── DATOS DE RESERVAS (bookings + crm_gestion + payments) ───────────────────
// estado: estado de reserva CRM (nueva|confirmada|finalizada|cancelada)
// pago:   estado de pago CRM (pagado|parcial|pendiente|impagado)
// senal:  importe de señal cobrada (cumpleaños/eventos) si pago='parcial'
const RESERVAS = [
  // CUMPLEAÑOS
  { servicio: 'Cumpleaños', cliente: 'Carlos Vidal', nino: 'Leo Vidal', part: 15, total: 165, hora: '18:15 – 20:15', dia: 20, estado: 'confirmada', pago: 'parcial', senal: 50 },
  { servicio: 'Cumpleaños', cliente: 'Marta Ruiz', nino: 'Diego Ruiz', part: 20, total: 260, hora: '16:45 – 18:45', dia: 35, estado: 'confirmada', pago: 'pagado' },
  { servicio: 'Cumpleaños', cliente: 'Javier Moreno', nino: 'Alba Moreno', part: 13, total: 143, hora: '18:15 – 20:15', dia: 50, estado: 'nueva', pago: 'pendiente' },
  { servicio: 'Cumpleaños', cliente: 'Lucía Ferrer', nino: 'Mateo Ferrer', part: 18, total: 234, hora: '16:45 – 18:45', dia: -25, estado: 'finalizada', pago: 'pagado' },
  { servicio: 'Cumpleaños', cliente: 'Sergio Pardo', nino: 'Vega Pardo', part: 13, total: 143, hora: '18:15 – 20:15', dia: 9, estado: 'cancelada', pago: 'pendiente' },
  { servicio: 'Cumpleaños', cliente: 'Ana Lozano', nino: 'Bruno Lozano', part: 14, total: 154, hora: '18:15 – 20:15', dia: -3, estado: 'confirmada', pago: 'pagado' },
  { servicio: 'Cumpleaños', cliente: 'Pedro Gallego', nino: 'Iván Gallego', part: 13, total: 143, hora: '16:45 – 18:45', dia: 8, estado: 'confirmada', pago: 'parcial', senal: 50 },
  // CAMPAMENTOS
  { servicio: 'Campamento de Verano', cliente: 'Elena Sanz', nino: 'Sofía Sanz', part: 3, total: 285, hora: '9:00 – 14:00', dia: 14, estado: 'confirmada', pago: 'pagado' },
  { servicio: 'Campamento de Verano', cliente: 'Raúl Ibáñez', nino: 'Nora Ibáñez', part: 1, total: 95, hora: '9:00 – 14:00', dia: 16, estado: 'nueva', pago: 'pendiente' },
  { servicio: 'Campamento de Verano', cliente: 'Clara Méndez', nino: 'Hugo Méndez', part: 2, total: 190, hora: '9:00 – 14:00', dia: 18, estado: 'confirmada', pago: 'pendiente' },
  { servicio: 'Campamento de Navidad', cliente: 'Tomás Rey', nino: 'Lía Rey', part: 1, total: 95, hora: '9:00 – 14:00', dia: -150, estado: 'finalizada', pago: 'pagado' },
  // EVENTOS
  { servicio: 'Animación en tu evento · Boda', cliente: 'Patricia Soler', part: 25, total: 363, hora: '17:00 – 19:00', dia: 30, estado: 'confirmada', pago: 'parcial', senal: 50 },
  { servicio: 'Días Sin Cole', cliente: 'Nuria Calvo', part: 1, total: 36, hora: '9:00 – 14:00', dia: 15, estado: 'confirmada', pago: 'pagado' },
  { servicio: 'Domingos en Familia', cliente: 'David Mora', part: 2, total: 30, hora: '11:00 – 13:00', dia: 12, estado: 'nueva', pago: 'pendiente' },
  { servicio: 'Mañanas Mágicas', cliente: 'Beatriz Lara', part: 2, total: 60, hora: '11:00 – 13:00', dia: -10, estado: 'finalizada', pago: 'pagado' },
  { servicio: 'Días Sin Cole', cliente: 'Óscar Peña', part: 2, total: 72, hora: '9:00 – 14:00', dia: 6, estado: 'confirmada', pago: 'pendiente' },
  { servicio: 'Animación en tu evento · Comunión', cliente: 'Rosa Gil', part: 20, total: 250, hora: '12:00 – 14:00', dia: 25, estado: 'cancelada', pago: 'pendiente' },
  { servicio: 'Domingos en Familia', cliente: 'Sandra Vega', part: 3, total: 45, hora: '11:00 – 13:00', dia: -45, estado: 'finalizada', pago: 'pagado' },
  { servicio: 'Días Sin Cole', cliente: 'Manuel Cano', part: 1, total: 36, hora: '9:00 – 14:00', dia: -8, estado: 'finalizada', pago: 'impagado' },
  // TALLERES
  { servicio: 'Taller de circo participativo', cliente: 'Ayto. de Cuenca', part: 12, total: 180, hora: '17:00 – 19:00', dia: 12, estado: 'confirmada', pago: 'pagado' },
  { servicio: 'Taller de malabares', cliente: 'AMPA Las Acacias', part: 10, total: 150, hora: '18:00 – 19:30', dia: 28, estado: 'nueva', pago: 'pendiente' },
  { servicio: 'Taller de circo', cliente: 'Colegio San José', part: 14, total: 200, hora: '10:00 – 12:00', dia: -18, estado: 'finalizada', pago: 'pagado' },
]

// ─── DATOS DE INSCRIPCIONES DEL CLUB (form_submissions + club_gestion + familias) ──
// Las familias se agrupan por correo del tutor (siblings comparten correo).
const INSCRIPCIONES = [
  { nombre: 'Leo', apellidos: 'Vidal', actividad: 'Gimnasia Acrobática', grupo: 'Iniciación 1', tutor: 'Carlos Vidal', email: 'carlos.vidal', fnac: '2016-04-12', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'pagado', dic: 'pendiente' } },
  { nombre: 'Nora', apellidos: 'Vidal', actividad: 'Gimnasia Rítmica', grupo: 'Rítmica 1', tutor: 'Carlos Vidal', email: 'carlos.vidal', fnac: '2018-09-03', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'pagado', dic: 'pagado' } },
  { nombre: 'Diego', apellidos: 'Ruiz', actividad: 'Jiu-Jitsu Brasileño', grupo: 'JJB 1', tutor: 'Marta Ruiz', email: 'marta.ruiz', fnac: '2014-01-22', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'pendiente' } },
  { nombre: 'Alba', apellidos: 'Moreno', actividad: 'Escuela de aéreos', grupo: 'Iniciación 1', tutor: 'Javier Moreno', email: 'javier.moreno', fnac: '2015-06-30', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'pagado' } },
  { nombre: 'Hugo', apellidos: 'Moreno', actividad: 'Gimnasia Acrobática', grupo: 'Medio 1', tutor: 'Javier Moreno', email: 'javier.moreno', fnac: '2013-11-15', estado: 'activo', pagos: { sep: 'pagado', oct: 'pendiente', nov: 'pendiente' } },
  { nombre: 'Mateo', apellidos: 'Ferrer', actividad: 'Escuela infantil', grupo: 'Iniciación 1', tutor: 'Lucía Ferrer', email: 'lucia.ferrer', fnac: '2020-03-08', estado: 'pendiente', pagos: { sep: 'pendiente' } },
  { nombre: 'Vega', apellidos: 'Pardo', actividad: 'Escuela de Bienestar', grupo: 'Bienestar 1', tutor: 'Sergio Pardo', email: 'sergio.pardo', fnac: '1995-07-19', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'pagado', dic: 'pagado', ene: 'pagado' } },
  { nombre: 'Bruno', apellidos: 'Lozano', actividad: 'Gimnasia Acrobática', grupo: 'Avanzado', tutor: 'Ana Lozano', email: 'ana.lozano', fnac: '2011-02-27', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'pagado', dic: 'pagado' } },
  { nombre: 'Carla', apellidos: 'Lozano', actividad: 'Circo Inclusivo', grupo: 'Iniciación 1', tutor: 'Ana Lozano', email: 'ana.lozano', fnac: '2013-05-14', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado', nov: 'baja' } },
  { nombre: 'Iván', apellidos: 'Gallego', actividad: 'Jiu-Jitsu Brasileño', grupo: 'JJB 1', tutor: 'Pedro Gallego', email: 'pedro.gallego', fnac: '2012-10-01', estado: 'activo', pagos: { sep: 'pagado', oct: 'pagado' } },
  { nombre: 'Sofía', apellidos: 'Sanz', actividad: 'Gimnasia Rítmica', grupo: 'Rítmica 1', tutor: 'Elena Sanz', email: 'elena.sanz', fnac: '2017-12-20', estado: 'activo', pagos: { sep: 'pagado', oct: 'pendiente' } },
  { nombre: 'Aitor', apellidos: 'Romero', actividad: 'Escuela de aéreos', grupo: 'Iniciación 1', tutor: 'Beatriz Romero', email: 'beatriz.romero', fnac: '2016-08-09', estado: 'espera', pagos: {} },
  { nombre: 'Daniela', apellidos: 'Cruz', actividad: 'Gimnasia Acrobática', grupo: 'Iniciación 2', tutor: 'Cruz (sin correo)', email: null, fnac: '2015-01-30', estado: 'pendiente', pagos: { sep: 'pendiente' } },
  { nombre: 'Pablo', apellidos: 'Díaz', actividad: 'Escuela de Bienestar', grupo: 'Bienestar 1', tutor: 'Díaz (sin correo)', email: null, fnac: '1988-04-25', estado: 'baja', pagos: { sep: 'pagado', oct: 'baja' } },
]

// ─── Otros (un formulario de presupuesto y un pedido de colchonetas) ─────────
const FORMS_EXTRA = [
  { tipo: 'presupuesto', nombre: 'Hotel Cuenca Resort', asunto: 'Animación boda', mensaje: 'Queremos animación para una boda en julio.', datos: { tipoEvento: 'Boda', participantes: 30, fecha: iso(40) } },
  { tipo: 'colegio', nombre: 'CEIP Fuente del Oro', asunto: 'Excursión escolar', mensaje: 'Visita guiada para 3º de primaria.', datos: { alumnos: 50, fecha: iso(22) } },
]

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  let nB = 0, nP = 0, nG = 0
  for (let i = 0; i < RESERVAS.length; i++) {
    const r = RESERVAS[i]
    const fecha = iso(r.dia)
    const esCumple = /cumplea/i.test(r.servicio)
    const datos = esCumple
      ? { cumpleanero: r.nino, numNinos: r.part }
      : (r.nino ? { participantes: r.nino, numNinos: r.part } : { numNinos: r.part })
    const observaciones = `\n${JSON.stringify(datos)}`
    const rawReserva = r.estado === 'cancelada' ? 'cancelada' : r.estado === 'nueva' ? 'pendiente' : 'confirmada'

    const { data: bk, error: eB } = await db.from('bookings').insert({
      numero: `PM-BOT-${String(i + 1).padStart(3, '0')}`,
      servicio: r.servicio,
      cliente_nombre: r.cliente,
      cliente_email: `${r.cliente.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@${DOMAIN}`,
      cliente_telefono: tel(),
      fecha, hora: r.hora, participantes: r.part, precio: r.total,
      estado_reserva: rawReserva, estado_pago: r.pago === 'parcial' ? 'parcial' : r.pago === 'pagado' ? 'pagado' : 'pendiente',
      observaciones, notas_internas: `${BOT} reserva de prueba`,
    }).select('id').single()
    if (eB) { console.error('booking', eB.message); continue }
    nB++
    const id = bk.id

    const pagado = r.pago === 'pagado' ? r.total : r.pago === 'parcial' ? (r.senal || 50) : 0
    const metodo = ['tarjeta', 'transferencia', 'efectivo', 'bizum'][i % 4]
    const pagos = pagado > 0 ? [{ fecha: new Date().toISOString(), importe: pagado, metodo, nota: r.pago === 'parcial' ? 'Señal' : 'Cobro completo' }] : []

    await db.from('crm_gestion').upsert({
      origen: 'booking', origen_id: id,
      estado_reserva: r.estado, estado_pago: r.pago,
      total: r.total, pagado, metodo_pago: pagado > 0 ? metodo : null,
      fecha_realizacion: fecha, participantes: r.part,
      pagos, observaciones: BOT, updated_at: new Date().toISOString(), updated_by: 'bot',
    }, { onConflict: 'origen,origen_id' })
    nG++

    if (pagado > 0) {
      await db.from('payments').insert({
        booking_id: id, cliente_nombre: r.cliente, servicio: r.servicio,
        importe: pagado, fianza: r.pago === 'parcial' ? pagado : null, pendiente: Math.max(0, r.total - pagado),
        metodo, estado: 'pagado', referencia: `${BOT}-${i + 1}`,
      })
      nP++
    }
  }

  // ── Inscripciones del club ──
  const famByEmail = new Map()
  let nIns = 0, nFam = 0, nLink = 0
  for (const s of INSCRIPCIONES) {
    const email = s.email ? `${s.email}@${DOMAIN}` : null
    const { data: sub, error: eS } = await db.from('form_submissions').insert({
      tipo: 'inscripcion_club',
      nombre: `${s.nombre} ${s.apellidos}`,
      email, telefono: tel(),
      datos: { nombre: s.nombre, apellidos: s.apellidos, actividad: s.actividad, tutorLegal: s.tutor, fechaNacimiento: s.fnac, nivel: s.grupo, __bot: true },
      estado: 'nueva',
    }).select('id').single()
    if (eS) { console.error('inscripcion', eS.message); continue }
    nIns++
    await db.from('club_gestion').upsert({
      submission_id: sub.id, grupo: s.grupo, estado_general: s.estado, temporada: TEMPORADA,
      pagos: s.pagos, observaciones: BOT, updated_at: new Date().toISOString(), updated_by: 'bot',
    }, { onConflict: 'submission_id' })

    if (email) {
      let famId = famByEmail.get(email)
      if (!famId) {
        const { data: fam } = await db.from('club_familias').insert({ email, nombre: s.tutor, telefono: tel(), estado: 'activo' }).select('id').single()
        if (fam) { famId = fam.id; famByEmail.set(email, famId); nFam++ }
      }
      if (famId) { await db.from('club_familia_alumnos').upsert({ familia_id: famId, submission_id: sub.id }, { onConflict: 'familia_id,submission_id' }); nLink++ }
    }
  }

  // ── Formularios extra ──
  let nF = 0
  for (const f of FORMS_EXTRA) {
    await db.from('form_submissions').insert({
      tipo: f.tipo, nombre: f.nombre, email: `${f.nombre.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@${DOMAIN}`,
      telefono: tel(), asunto: f.asunto, mensaje: f.mensaje, datos: { ...f.datos, __bot: true }, estado: 'nueva',
    })
    nF++
  }

  // ── Un pedido de colchonetas ──
  await db.from('product_orders').insert({
    cliente_nombre: 'Gimnasio La Cima', cliente_email: `gimnasio.la.cima@${DOMAIN}`, cliente_telefono: tel(),
    items: [{ nombre: 'Colchoneta plegable 2x1', cantidad: 2 }], total: 240, estado: 'nuevo', tipo: 'pedido', detalle: `${BOT} pedido de prueba`,
  })

  console.log(JSON.stringify({ reservas: nB, cobros: nP, gestion_reservas: nG, inscripciones_club: nIns, familias: nFam, vinculos: nLink, formularios: nF }, null, 2))
}

// ─────────────────────────────────────────────────────────────────────────────
async function clean() {
  const { data: bks } = await db.from('bookings').select('id').ilike('notas_internas', `%${BOT}%`)
  const ids = (bks ?? []).map(b => b.id)
  if (ids.length) {
    await db.from('crm_gestion').delete().eq('origen', 'booking').in('origen_id', ids)
    await db.from('payments').delete().in('booking_id', ids)
    await db.from('bookings').delete().in('id', ids)
  }
  const { data: fs } = await db.from('form_submissions').select('id, email, datos')
  const fIds = (fs ?? []).filter(f => (f.datos && f.datos.__bot) || (f.email || '').endsWith(`@${DOMAIN}`)).map(f => f.id)
  if (fIds.length) {
    await db.from('club_familia_alumnos').delete().in('submission_id', fIds)
    await db.from('club_gestion').delete().in('submission_id', fIds)
    await db.from('form_submissions').delete().in('id', fIds)
  }
  await db.from('club_familias').delete().ilike('email', `%@${DOMAIN}`)
  await db.from('product_orders').delete().ilike('cliente_email', `%@${DOMAIN}`)
  console.log(JSON.stringify({ reservas_borradas: ids.length, formularios_borrados: fIds.length }, null, 2))
}

const modo = process.argv.includes('--clean') ? 'clean' : 'seed'
;(modo === 'clean' ? clean() : seed()).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
