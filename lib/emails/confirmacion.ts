// ─────────────────────────────────────────────────────────────────────────────
// Email de confirmación al cliente, con un mensaje ESPECÍFICO según el servicio.
// Se envía desde info@planetamovimiento.com (dominio ya verificado en Resend).
// Lo usan: el webhook de Redsys (reservas pagadas online), la reserva en
// instalación, y las inscripciones/solicitudes del Club y formularios.
// ─────────────────────────────────────────────────────────────────────────────

import { enviarEmail, NOTIF_TO } from '@/lib/emails/enviar'
import { escHtml } from '@/lib/seguridad/sanitize'

/** Mensaje específico por servicio. Se elige por palabras clave del nombre. */
type Plantilla = { titulo: string; intro: string; cierre?: string }

function plantillaPara(servicio: string): Plantilla {
  const s = (servicio || '').toLowerCase()

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
  if (s.includes('sin cole') || (s.includes('día') && s.includes('cole'))) return {
    titulo: '¡Solicitud para el Día Sin Cole recibida! ⚡',
    intro: 'Hemos recibido tu solicitud de plaza para el Día Sin Cole. Una mañana épica de juegos, retos y actividad mientras la familia concilia.',
    cierre: 'Te confirmaremos la plaza y el pago en breve. Recuerda que harán falta ropa cómoda y almuerzo.',
  }
  if (s.includes('domingo')) return {
    titulo: '¡Solicitud para el Domingo en Familia recibida! 👨‍👩‍👧‍👦',
    intro: 'Hemos recibido vuestra solicitud para el Domingo en Familia. Práctica libre, juego y tiempo de calidad en familia.',
    cierre: 'Te confirmaremos la plaza en breve. Recordad que los adultos permanecen en la instalación durante la actividad.',
  }
  if (s.includes('mañana')) return {
    titulo: '¡Solicitud para la Mañana Mágica recibida! ✨',
    intro: 'Hemos recibido tu solicitud de plaza para la Mañana Mágica. Una jornada temática con el personaje del mes, talleres y muchas sorpresas.',
    cierre: 'Te confirmaremos la plaza en breve. Trae ropa cómoda y muchas ganas de pasarlo en grande.',
  }
  if (s.includes('halloween')) return {
    titulo: '¡Solicitud para la Noche de Halloween recibida! 🧟',
    intro: 'Hemos recibido tu solicitud de plaza para la Noche de Halloween. Una noche épica e inolvidable de fiesta, retos y mucho terror divertido.',
    cierre: 'Las plazas son limitadas: te confirmaremos la tuya lo antes posible y te enviaremos qué traer.',
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
}

/**
 * Envía el email de confirmación al cliente. Silencioso ante errores (nunca
 * rompe el flujo de la reserva). No hace nada si no hay email de cliente.
 */
export async function enviarConfirmacionReserva(p: DatosConfirmacion): Promise<void> {
  const email = (p.clienteEmail || '').trim()
  if (!email) return
  const pl = plantillaPara(p.servicio)

  const filas: [string, string][] = [
    ['Servicio', p.servicio],
    ['Nº de reserva', p.numero || ''],
    ['Fecha', p.fecha ? fmtFecha(p.fecha) : ''],
    ['Horario', p.hora || ''],
    ['Participantes', p.participantes && p.participantes > 0 ? String(p.participantes) : ''],
    ['Importe total', p.total && p.total > 0 ? euro(p.total) : ''],
    ['Pagado ahora (señal)', p.pagado && p.pagado > 0 ? euro(p.pagado) : ''],
    ['Pendiente', p.pendiente && p.pendiente > 0 ? euro(p.pendiente) : ''],
  ]
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
      ${pl.cierre ? `<p style="color:#475569;font-size:13px;line-height:1.6;margin:18px 0 0">${pl.cierre}</p>` : ''}
    </div>
    <div style="background:#f8fafc;padding:18px 28px;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6">
        Planeta Movimiento · Cuenca · <a href="mailto:info@planetamovimiento.com" style="color:#e11d2a;text-decoration:none">info@planetamovimiento.com</a><br>
        Este correo confirma tu solicitud. Si no la has realizado tú, ignóralo.
      </p>
    </div>
  </div>
</div>`

  await enviarEmail({
    to: email,
    subject: `${pl.titulo} · Planeta Movimiento`,
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
    ['Servicio', p.servicio],
    ['Nº de reserva', p.numero || ''],
    ['Cliente', p.clienteNombre || ''],
    ['Email', p.clienteEmail || ''],
    ['Fecha', p.fecha ? fmtFecha(p.fecha) : ''],
    ['Horario', p.hora || ''],
    ['Participantes', p.participantes && p.participantes > 0 ? String(p.participantes) : ''],
    ['Importe total', p.total && p.total > 0 ? euro(p.total) : ''],
    ['Pagado', p.pagado && p.pagado > 0 ? euro(p.pagado) : ''],
    ['Pendiente', p.pendiente && p.pendiente > 0 ? euro(p.pendiente) : ''],
  ]
  const tabla = filas
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${k}</td><td style="padding:6px 12px;color:#0F1A3D;font-weight:600">${v}</td></tr>`)
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
