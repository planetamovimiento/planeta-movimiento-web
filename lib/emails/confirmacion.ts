// ─────────────────────────────────────────────────────────────────────────────
// Email de confirmación al cliente, con un mensaje ESPECÍFICO según el servicio.
// Se envía desde info@planetamovimiento.com (dominio ya verificado en Resend).
// Lo usan: el webhook de Redsys (reservas pagadas online), la reserva en
// instalación, y las inscripciones/solicitudes del Club y formularios.
// ─────────────────────────────────────────────────────────────────────────────

import { enviarEmail, NOTIF_TO } from '@/lib/emails/enviar'
import { escHtml } from '@/lib/seguridad/sanitize'
import { CUOTA, eurosCuota, fechaLarga } from '@/lib/club/cuota'
import { politicaCancelacionHtml } from '@/lib/reservas/cancelacion'

/**
 * Mensaje específico por servicio. Se elige por palabras clave del nombre.
 * `antes`: avisos prácticos en lista («Antes de venir»).
 */
type Plantilla = { titulo: string; intro: string; cierre?: string; antes?: string[] }

const txt = (v: unknown) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim())

/**
 * Eventos en el centro (Días Sin Cole, Domingos, Mañanas Mágicas, Halloween,
 * Talleres infantiles y Práctica Libre). Se pagan con tarjeta, así que cuando
 * hay pago el correo CONFIRMA la plaza; sin pago (precio aún sin poner) es una
 * solicitud.
 */
function plantillaEventoCentro(s: string, x: Record<string, unknown>, pagado: boolean): Plantilla | null {
  // Lo que llega del formulario (personaje, taller…) se escapa: va tal cual al HTML.

  if (s.includes('sin cole') || (s.includes('día') && s.includes('cole'))) return pagado ? {
    titulo: '¡Plaza confirmada para el Día Sin Cole! ⚡',
    intro: 'Hemos recibido el pago y la plaza está reservada. Vuestro peque vivirá una mañana épica en la Escuela de Superhéroes mientras la familia concilia.',
    antes: [
      'Os rogamos puntualidad en la entrada y en la recogida.',
      'Ropa y calzado cómodos para moverse.',
      'Almuerzo y botella de agua.',
    ],
  } : {
    titulo: '¡Solicitud para el Día Sin Cole recibida! ⚡',
    intro: 'Hemos recibido tu solicitud de plaza para el Día Sin Cole. Una mañana épica de juegos, retos y actividad mientras la familia concilia.',
    cierre: 'Te confirmaremos la plaza y el pago en breve. Recuerda que harán falta ropa cómoda y almuerzo.',
  }

  if (s.includes('domingo')) return pagado ? {
    titulo: '¡Domingo en Familia reservado! 👨‍👩‍👧‍👦',
    intro: 'Hemos recibido el pago y vuestra plaza está reservada. Práctica libre, juego y tiempo de calidad en familia en nuestras instalaciones.',
    antes: [
      'Los adultos entran gratis y se quedan en la instalación durante toda la actividad: no es un servicio de guardería.',
      'Los menores de 2 años también entran gratis.',
      'Ropa cómoda para todos, ¡también para los mayores!',
    ],
  } : {
    titulo: '¡Solicitud para el Domingo en Familia recibida! 👨‍👩‍👧‍👦',
    intro: 'Hemos recibido vuestra solicitud para el Domingo en Familia. Práctica libre, juego y tiempo de calidad en familia.',
    cierre: 'Te confirmaremos la plaza en breve. Recordad que los adultos permanecen en la instalación durante la actividad.',
  }

  if (s.includes('mañana')) {
    const personaje = txt(x.personaje)
    return pagado ? {
      titulo: '¡Plaza confirmada para la Mañana Mágica! ✨',
      intro: `Hemos recibido el pago y la plaza está reservada para la Mañana Mágica${personaje ? ` con ${escHtml(personaje)}` : ''}: show, manualidades, pintacaras, photocall y muchos juegos.`,
      antes: [
        'Llegad unos minutos antes de la hora de inicio.',
        'Ropa cómoda para moverse y jugar.',
      ],
    } : {
      titulo: '¡Solicitud para la Mañana Mágica recibida! ✨',
      intro: 'Hemos recibido tu solicitud de plaza para la Mañana Mágica. Una jornada temática con el personaje del mes, talleres y muchas sorpresas.',
      cierre: 'Te confirmaremos la plaza en breve. Trae ropa cómoda y muchas ganas de pasarlo en grande.',
    }
  }

  // «Talleres infantiles» va antes que Halloween: su taller puede llamarse «Halloween Infantil».
  if (s.includes('taller') && s.includes('infantil')) {
    const taller = txt(x.taller) || 'el taller infantil'
    const esHalloween = taller.toLowerCase().includes('halloween')
    return pagado ? {
      titulo: '¡Plaza confirmada para el taller infantil! 🎨',
      intro: `Hemos recibido el pago y la plaza está reservada para «${escHtml(taller)}»: manualidades y juegos en nuestra sala de colchonetas.`,
      antes: [
        'Llegad unos minutos antes de la hora de inicio.',
        'Papás y mamás pueden quedarse durante el taller, sin coste.',
        ...(esHalloween ? ['Pueden venir disfrazados, pero mejor sin maquillaje en la cara: mancha el material de la sala.'] : []),
      ],
    } : {
      titulo: '¡Inscripción al taller recibida! 🎨',
      intro: `Hemos recibido tu inscripción para «${escHtml(taller)}». Te confirmaremos tu plaza en breve.`,
      cierre: 'Si tienes cualquier duda, responde a este correo y te ayudamos.',
    }
  }

  if (s.includes('halloween')) {
    const evento = txt(x.evento)
    return pagado ? {
      titulo: '¡Plaza confirmada para la Noche de Halloween! 🧟',
      intro: `Hemos recibido el pago y la plaza está reservada para la Noche de Halloween${evento ? ` «${escHtml(evento)}»` : ''}: gymkana zombie, retos, película de terror y desayuno de churros al amanecer.`,
      antes: [
        'Unos días antes os escribiremos con la hora exacta de entrada y recogida y con lo que hay que traer para pasar la noche.',
        'Si hay alergias o algo que debamos saber, respondednos a este correo.',
      ],
    } : {
      titulo: '¡Solicitud para la Noche de Halloween recibida! 🧟',
      intro: 'Hemos recibido tu solicitud de plaza para la Noche de Halloween. Una noche épica e inolvidable de fiesta, retos y mucho terror divertido.',
      cierre: 'Las plazas son limitadas: te confirmaremos la tuya lo antes posible y te enviaremos qué traer.',
    }
  }

  if (s.includes('práctica libre') || s.includes('practica libre')) {
    const modalidad = txt(x.modalidad)
    const esBono = modalidad.toLowerCase().includes('bono')
    return pagado ? {
      titulo: '¡Práctica Libre reservada! 🤸',
      intro: esBono
        ? `Hemos recibido el pago. Tu ${escHtml(modalidad.toLowerCase())} de Práctica Libre ya está activo.`
        : 'Hemos recibido el pago y tu clase suelta de Práctica Libre está reservada.',
      antes: [
        'Un monitor de sala estará para resolver dudas y velar por la seguridad.',
        ...(esBono ? ['El bono se usa cuando quieras dentro de la temporada.'] : []),
        'Ropa deportiva cómoda y botella de agua.',
      ],
    } : {
      titulo: '¡Solicitud de Práctica Libre recibida! 🤸',
      intro: 'Hemos recibido tu solicitud de Práctica Libre. Te confirmaremos la plaza en breve.',
    }
  }

  return null
}

function plantillaPara(servicio: string, extra: Record<string, unknown> = {}, pagado = false): Plantilla {
  const s = (servicio || '').toLowerCase()

  const centro = plantillaEventoCentro(s, extra, pagado)
  if (centro) return centro

  if (s.includes('cumple')) return {
    titulo: '¡Cumpleaños reservado! 🎂',
    intro: 'Hemos confirmado la reserva de tu cumpleaños en Planeta Movimiento. ¡Va a ser un día genial! Lo tendremos todo preparado: actividad guiada, juegos, retos y merienda.',
    cierre: 'El resto del importe se abona el mismo día en la instalación (efectivo o tarjeta). Si necesitas cambiar la fecha o algún detalle, escríbenos respondiendo a este correo.',
  }
  if (s.includes('animaci') || s.includes('evento') || s.includes('boda') || s.includes('comuni') || s.includes('bautiz')) return {
    titulo: '¡Tu evento está reservado! 🎪',
    intro: 'Hemos confirmado la animación para tu evento. Nos desplazamos con nuestros monitores y todo el material para que los peques disfruten y los mayores descansen.',
    cierre: 'Nos pondremos en contacto contigo para afinar los últimos detalles (horario, ubicación y temática). El resto del importe se abona al confirmar el evento.',
  }
  if (s.includes('campamento')) return {
    titulo: '¡Plaza de campamento reservada! ⛺',
    intro: 'Hemos confirmado la plaza en el campamento. Prepárate para días llenos de actividad, juegos, circo y mucha diversión.',
    cierre: 'Te haremos llegar la información práctica (qué traer, horarios de entrada y recogida) antes del comienzo. El importe pendiente se abona según lo acordado.',
  }
  if (s.includes('taller')) return {
    titulo: '¡Inscripción al taller recibida! 🎨',
    intro: `Hemos recibido tu inscripción para «${servicio}». Te confirmaremos tu plaza en breve.`,
    cierre: 'Si tienes cualquier duda, responde a este correo y te ayudamos.',
  }
  if (s.includes('excursi')) return {
    titulo: '¡Solicitud de excursión recibida! 🚌',
    intro: `Hemos recibido tu solicitud para «${servicio}». Prepararemos una propuesta y nos pondremos en contacto contigo.`,
  }
  // Actividades del Club / extraescolares (gimnasia, telas, JJB, rítmica, etc.)
  if (s.includes('gimnasia') || s.includes('telas') || s.includes('jiu') || s.includes('jjb') ||
      s.includes('rítmica') || s.includes('ritmica') || s.includes('bienestar') ||
      s.includes('escuela infantil') || s.includes('circo') || s.includes('albéniz') || s.includes('albeniz') ||
      s.includes('extraescolar') || s.includes('inscrip')) return {
    titulo: '¡Inscripción recibida! 🤸',
    intro: `Hemos recibido tu inscripción${servicio ? ` en «${servicio}»` : ''}. Te confirmaremos la plaza y te enviaremos los detalles del grupo (horario y grupo de WhatsApp) lo antes posible.`,
    cierre: 'Si necesitas cambiar algo, responde a este correo.',
  }

  // Genérico
  return {
    titulo: 'Hemos recibido tu solicitud',
    intro: `Gracias por contar con Planeta Movimiento${servicio ? ` para «${servicio}»` : ''}. Hemos recibido tu solicitud y te responderemos lo antes posible.`,
  }
}

function fmtFecha(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(iso.slice(0, 10) + 'T12:00:00'))
  } catch { return iso }
}

const euro = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export type DatosConfirmacion = {
  servicio: string
  clienteNombre?: string | null
  clienteEmail?: string | null
  fecha?: string | null
  hora?: string | null
  participantes?: number | null
  numero?: string | null
  total?: number | null
  pagado?: number | null
  pendiente?: number | null
  /** Datos extra que guardó el formulario (participantes, modalidad, fecha en texto…). */
  extra?: Record<string, unknown>
}

/**
 * Los formularios guardan sus datos como JSON en la última línea de
 * `bookings.observaciones` (`notas\n{...}`). Devuelve ese objeto o {}.
 */
export function datosDeObservaciones(observaciones: unknown): Record<string, unknown> {
  const lineas = String(observaciones ?? '').split('\n').map(l => l.trim()).filter(Boolean)
  for (let i = lineas.length - 1; i >= 0; i--) {
    const l = lineas[i]
    if (!l.startsWith('{') || !l.endsWith('}')) continue
    try { return JSON.parse(l) as Record<string, unknown> } catch { /* sigue buscando */ }
  }
  return {}
}

/** Filas de la reserva, comunes al correo del cliente y al aviso interno. */
function filasReserva(p: DatosConfirmacion): [string, string][] {
  const x = p.extra ?? {}
  const pagado = Number(p.pagado) || 0
  const pendiente = Number(p.pendiente) || 0
  const nombres = txt(x.participantes)
  return [
    ['Servicio', p.servicio],
    ['Nº de reserva', p.numero || ''],
    ['Modalidad', txt(x.modalidad)],
    ['Taller', txt(x.taller)],
    // Halloween y talleres no guardan fecha exacta: va en texto en los datos.
    ['Fecha', p.fecha ? fmtFecha(p.fecha) : txt(x.fecha)],
    ['Horario', p.hora || txt(x.horario)],
    ['Participantes', nombres || (p.participantes && p.participantes > 0 ? String(p.participantes) : '')],
    ['Descuento', txt(x.descuento)],
    ['Importe total', p.total && p.total > 0 && pendiente > 0 ? euro(p.total) : ''],
    [pendiente > 0 ? 'Pagado ahora (señal)' : 'Total pagado', pagado > 0 ? euro(pagado) : ''],
    ['Pendiente', pendiente > 0 ? euro(pendiente) : ''],
    // Sin pago todavía (solicitud): el precio orientativo.
    ['Importe', pagado <= 0 && pendiente <= 0 && p.total && p.total > 0 ? euro(p.total) : ''],
  ]
}

/** Asunto y HTML del correo al cliente (separado del envío para poder previsualizarlo). */
export function correoConfirmacion(p: DatosConfirmacion): { asunto: string; html: string } {
  const pagado = (Number(p.pagado) || 0) > 0
  const pl = plantillaPara(p.servicio, p.extra ?? {}, pagado)

  const filas = filasReserva(p)
  const tabla = filas
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:7px 14px;color:#64748b;font-size:14px">${escHtml(k)}</td><td style="padding:7px 14px;color:#0F1A3D;font-weight:700;font-size:14px;text-align:right">${escHtml(v)}</td></tr>`)
    .join('')

  const html = `
<div style="background:#f1f5f9;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#0F1A3D;padding:24px 28px">
      <div style="color:#fff;font-weight:900;font-size:20px"><span style="color:#e11d2a">Planeta</span> Movimiento</div>
    </div>
    <div style="padding:28px">
      <h1 style="color:#0F1A3D;font-size:22px;margin:0 0 12px">${pl.titulo}</h1>
      ${p.clienteNombre ? `<p style="color:#334155;font-size:15px;margin:0 0 12px">Hola ${escHtml(p.clienteNombre.split(' ')[0])},</p>` : ''}
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 18px">${pl.intro}</p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden">${tabla}</table>
      ${pl.antes?.length ? `
      <h2 style="color:#0F1A3D;font-size:15px;margin:22px 0 8px">Antes de venir</h2>
      <ul style="color:#475569;font-size:14px;line-height:1.6;margin:0;padding-left:20px">
        ${pl.antes.map(a => `<li style="margin:0 0 4px">${a}</li>`).join('')}
      </ul>` : ''}
      ${pl.cierre ? `<p style="color:#475569;font-size:13px;line-height:1.6;margin:18px 0 0">${pl.cierre}</p>` : ''}
      ${pagado ? `<p style="color:#475569;font-size:13px;line-height:1.6;margin:18px 0 0">Si necesitáis cambiar algo, responded a este correo indicando vuestro nº de reserva.${pl.antes?.length ? ' Os esperamos en Planeta Movimiento, Polígono Los Palancares nº 8, Cuenca.' : ''}</p>` : ''}
      ${p.numero ? politicaCancelacionHtml() : ''}
    </div>
    <div style="background:#f8fafc;padding:18px 28px;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6">
        Planeta Movimiento · Cuenca · <a href="mailto:info@planetamovimiento.com" style="color:#e11d2a;text-decoration:none">info@planetamovimiento.com</a><br>
        ${pagado ? 'Este correo confirma tu reserva y tu pago.' : 'Este correo confirma tu solicitud.'} Si no la has realizado tú, ignóralo.
      </p>
    </div>
  </div>
</div>`

  return { asunto: `${pl.titulo} · Planeta Movimiento`, html }
}

/**
 * Envía el email de confirmación al cliente. Silencioso ante errores (nunca
 * rompe el flujo de la reserva). No hace nada si no hay email de cliente.
 */
export async function enviarConfirmacionReserva(p: DatosConfirmacion): Promise<void> {
  const email = (p.clienteEmail || '').trim()
  if (!email) return
  const { asunto, html } = correoConfirmacion(p)
  await enviarEmail({
    to: email,
    subject: asunto,
    html,
    tipo: 'confirmacion-cliente',
    meta: { servicio: p.servicio, numero: p.numero ?? null },
  })
}

/**
 * Aviso INTERNO al negocio (info@) de una nueva reserva o pago. Para que el
 * equipo se entere al instante de cada reserva online o en instalación.
 */
export async function avisarNegocioReserva(p: DatosConfirmacion & { motivo: string }): Promise<void> {
  const filas: [string, string][] = [
    ['Motivo', p.motivo],
    ['Cliente', p.clienteNombre || ''],
    ['Email', p.clienteEmail || ''],
    ...filasReserva(p),
  ]
  const tabla = filas
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${escHtml(k)}</td><td style="padding:6px 12px;color:#0F1A3D;font-weight:600">${escHtml(v)}</td></tr>`)
    .join('')
  const html = `<div style="font-family:sans-serif"><h2 style="color:#0F1A3D">${p.motivo} · ${p.servicio}</h2><table style="border-collapse:collapse;font-size:14px">${tabla}</table><p style="color:#94a3b8;font-size:12px;margin-top:16px">Gestiónalo en el panel de administración.</p></div>`

  await enviarEmail({
    to: NOTIF_TO,
    subject: `${p.motivo} · ${p.servicio}${p.numero ? ` (${p.numero})` : ''}`,
    html,
    tipo: 'aviso-reserva',
    meta: { servicio: p.servicio, numero: p.numero ?? null, motivo: p.motivo },
  })
}

// ─── Correos del Club: bienvenida (inscripción) y alta de socio ───────────────
// Textos fijos acordados con el club; los datos salen del propio formulario.

const IBAN_CLUB = 'ES35 3190 1010 0650 2365 8916'
const PORTAL_FAMILIAS = 'https://planetamovimiento.com/familias'
const COMUNIDAD_WHATSAPP = 'https://chat.whatsapp.com/FbwVcyucmSMGGojiEJt3dY'

const esc = (s: string) => escHtml((s || '').trim())
const parrafo = (html: string) => `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 14px">${html}</p>`
const titulo = (txt: string) => `<h2 style="color:#0F1A3D;font-size:16px;margin:24px 0 10px">${txt}</h2>`
const enlace = (url: string) => parrafo(`👉 <a href="${url}" style="color:#e11d2a;font-weight:700">${url}</a>`)
const saludo = (tutor: string) => parrafo(`Hola${tutor?.trim() ? `, ${esc(tutor)}` : ''}:`)

/** "A", "A y B", "A, B y C". */
const listaNombres = (n: string[]) => (n.length < 2 ? n.join('') : `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`)

function formasDePago(transferencia: string, concepto: string): string {
  return `${titulo('💳 FORMAS DE PAGO')}
      <ul style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 14px;padding-left:20px">
        <li>En efectivo, en las instalaciones de Planeta Movimiento.</li>
        <li>${transferencia}:<br>IBAN: <b>${IBAN_CLUB}</b> (Global Caja)</li>
      </ul>
      ${parrafo(`Concepto: ${concepto}`)}`
}

const ACCESO_PORTAL = 'Acceded con el correo electrónico del socio + número de socio. Desde el portal podréis indicar la talla de la equipación, consultar pagos y revisar el calendario de actividades y festivos.'

const CIERRE_CLUB = `${titulo('📲 COMUNIDAD DE PLANETA MOVIMIENTO')}
      ${parrafo('Únete a nuestra comunidad oficial de WhatsApp para estar al día de actividades, novedades, eventos y promociones de Planeta Movimiento.')}
      ${enlace(COMUNIDAD_WHATSAPP)}
      ${parrafo('Muchas gracias por confiar en nosotros.')}
      ${parrafo('<b>¡Bienvenido a la familia! 🤸‍♀️</b>')}
      <p style="color:#0F1A3D;font-size:15px;line-height:1.6;margin:0;font-weight:700">Club Deportivo Origen<br>Planeta Movimiento</p>`

const envolver = (cuerpo: string) => `
<div style="background:#f1f5f9;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#0F1A3D;padding:24px 28px">
      <div style="color:#fff;font-weight:900;font-size:20px"><span style="color:#e11d2a">Planeta</span> Movimiento</div>
    </div>
    <div style="padding:28px">
      ${cuerpo}
    </div>
  </div>
</div>`

export type DatosBienvenidaClub = {
  email: string
  tutor: string
  nombre: string
  apellidos: string
  actividad: string
  /** Grupo elegido en la inscripción (datos.nivel). Vacío si no eligió. */
  grupo: string
}

/** Inscripción a una disciplina del club. */
export async function enviarBienvenidaClub(d: DatosBienvenidaClub): Promise<void> {
  const email = (d.email || '').trim()
  if (!email) return
  const deportista = [d.nombre, d.apellidos].map(s => (s || '').trim()).filter(Boolean).join(' ')
  const actividad = `${esc(d.actividad)}${d.grupo?.trim() ? ` – ${esc(d.grupo)}` : ''}`

  const html = envolver(`
      ${saludo(d.tutor)}
      ${parrafo('<b>¡Bienvenidos al Club Deportivo Origen! 🎉</b>')}
      ${parrafo(`Hemos recibido correctamente la inscripción de <b>${esc(deportista)}</b> en <b>${actividad}</b>.`)}
      ${formasDePago('Por transferencia bancaria', 'Nombre y apellido del niño/a + actividad + mes/meses que abona.')}
      ${titulo('👨‍👩‍👧 PORTAL DE FAMILIAS')}
      ${parrafo('Es importante estar dado de alta como socio del club. Si ya lo sois y no conocéis vuestro número de socio, podéis consultárnoslo.')}
      ${enlace(PORTAL_FAMILIAS)}
      ${parrafo(ACCESO_PORTAL)}
      ${CIERRE_CLUB}`)

  await enviarEmail({
    to: email,
    subject: '¡Bienvenidos al Club Deportivo Origen! | Confirmación de inscripción',
    html,
    tipo: 'confirmacion-cliente',
    meta: { servicio: `Inscripción Club · ${d.actividad}` },
  })
}

/** Alta de socio (formulario "Hazte socio"): tutor + todos sus participantes. */
export async function enviarAltaSocio(d: { email: string; tutor: string; participantes: string[] }): Promise<void> {
  const email = (d.email || '').trim()
  if (!email) return
  const nombres = d.participantes.map(n => `<b>${esc(n)}</b>`)

  const html = envolver(`
      ${saludo(d.tutor)}
      ${parrafo('<b>¡Gracias por hacerte socio del Club Origen! 🎉</b>')}
      ${parrafo(`Hemos registrado como socios a toda la familia añadiendo a ${nombres.length > 1 ? 'los participantes' : 'el participante'} que has introducido: ${listaNombres(nombres)}.`)}
      ${formasDePago(`Por transferencia bancaria (${eurosCuota(CUOTA.normalCents)} o, si se paga hasta el ${fechaLarga(CUOTA.fechaLimiteReducida)}, ${eurosCuota(CUOTA.reducidaCents)})`, 'Nombre y apellido del tutor + socio')}
      ${titulo('👨‍👩‍👧 PORTAL DE FAMILIAS')}
      ${parrafo('Recordad que podéis entrar en la plataforma de Portal de familias en nuestra web de Planeta Movimiento. Si no conocéis vuestro número de socio, podéis consultárnoslo.')}
      ${enlace(PORTAL_FAMILIAS)}
      ${parrafo(ACCESO_PORTAL)}
      ${CIERRE_CLUB}`)

  await enviarEmail({
    to: email,
    subject: 'Solicitud de socio al Club Deportivo Origen',
    html,
    tipo: 'confirmacion-cliente',
    meta: { servicio: 'Alta de socio · Club Deportivo Origen' },
  })
}

/** Justificante de la autorización de imagen firmada (portal o enlace). */
export async function enviarJustificanteAutorizacion(d: {
  email: string; tutor: string; dni: string; menores: string[]; actividad: string
  canales: { label: string; autoriza: boolean }[]; conformidadMenor: boolean; version: string
}): Promise<void> {
  const fecha = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'short' })
  const filas = d.canales.map(c =>
    `<li>${c.autoriza ? '<b style="color:#15803d">AUTORIZO</b>' : '<b style="color:#b91c1c">NO AUTORIZO</b>'} · ${esc(c.label)}</li>`).join('')

  const html = envolver(`
      ${saludo(d.tutor)}
      ${parrafo('Hemos recibido tu <b>autorización para la captación y uso de imágenes de menores</b>. Este correo es tu justificante.')}
      ${parrafo(`Menor${d.menores.length > 1 ? 'es' : ''}: ${listaNombres(d.menores.map(n => `<b>${esc(n)}</b>`))}${d.actividad ? `<br>Actividad: <b>${esc(d.actividad)}</b>` : ''}`)}
      <ul style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 14px;padding-left:20px">${filas}</ul>
      ${d.conformidadMenor ? parrafo('Se ha indicado la conformidad del menor.') : ''}
      ${parrafo(`Firmado electrónicamente por <b>${esc(d.tutor)}</b> (DNI/NIE ${esc(d.dni)}) el ${fecha}. Versión del documento: ${esc(d.version)}.`)}
      ${parrafo('Puedes cambiar tu elección o retirar el consentimiento cuando quieras desde el Portal de Familias, firmando de nuevo en planetamovimiento.com/autorizacion, o escribiéndonos a info@planetamovimiento.com.')}
      <p style="color:#0F1A3D;font-size:15px;line-height:1.6;margin:0;font-weight:700">Planeta Carlos, S. L.<br>Planeta Movimiento</p>`)

  await enviarEmail({
    to: d.email,
    subject: 'Justificante: autorización de imágenes de menores',
    html,
    tipo: 'confirmacion-cliente',
    meta: { servicio: 'Autorización de imagen', menores: d.menores },
  })
}
