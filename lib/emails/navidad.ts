import { enviarEmail, NOTIF_TO } from '@/lib/emails/enviar'
import { escHtml } from '@/lib/seguridad/sanitize'
import { eurosDeCents } from '@/lib/navidad/precios'

// ─────────────────────────────────────────────────────────────────────────────
// Entradas de LA FÁBRICA DE PAPÁ NOEL por correo. Se envía cuando Redsys
// confirma el pago (lib/redsys/confirmar.ts), nunca antes.
// ─────────────────────────────────────────────────────────────────────────────

export type EntradasNavidad = {
  localizador: string
  nombre: string
  email: string
  fecha: string        // YYYY-MM-DD
  hora: string         // '10:00'
  horaFin?: string
  ninos: number
  adultos: number
  bebes: number
  plazas: number
  totalCents: number
  descuento?: string
}

function fechaLargaES(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(iso.slice(0, 10) + 'T12:00:00'))
  } catch { return iso }
}

function filas(e: EntradasNavidad): string {
  const lista: [string, string][] = [
    ['Localizador', e.localizador],
    ['Día', fechaLargaES(e.fecha)],
    ['Pase', e.horaFin ? `${e.hora} – ${e.horaFin}` : e.hora],
    ['Niños (desde 2 años)', e.ninos > 0 ? String(e.ninos) : ''],
    ['Adultos', e.adultos > 0 ? String(e.adultos) : ''],
    ['Bebés (menores de 2 años)', e.bebes > 0 ? String(e.bebes) : ''],
    ['Asistentes en total', String(e.plazas)],
    ['Descuento aplicado', e.descuento || ''],
    ['Total pagado', eurosDeCents(e.totalCents)],
  ]
  return lista.filter(([, v]) => v).map(([k, v]) =>
    `<tr><td style="padding:7px 14px;color:#64748b;font-size:14px">${escHtml(k)}</td>` +
    `<td style="padding:7px 14px;color:#0F1A3D;font-weight:700;font-size:14px;text-align:right">${escHtml(v)}</td></tr>`,
  ).join('')
}

/** Entradas al comprador. Silencioso ante errores: nunca rompe el cobro. */
export async function enviarEntradasNavidad(e: EntradasNavidad): Promise<void> {
  const para = (e.email || '').trim()
  if (!para) return

  const html = `
<div style="background:#f1f5f9;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#7f1d1d;padding:24px 28px">
      <div style="color:#fff;font-weight:900;font-size:20px">La Fábrica de Papá Noel</div>
      <div style="color:#fecaca;font-size:13px;margin-top:2px">Planeta Movimiento · Cuenca</div>
    </div>
    <div style="padding:28px">
      <h1 style="color:#0F1A3D;font-size:22px;margin:0 0 12px">¡Entradas confirmadas!</h1>
      <p style="color:#334155;font-size:15px;margin:0 0 12px">Hola ${escHtml((e.nombre || '').split(' ')[0] || '')},</p>
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 18px">
        Vuestra visita a la fábrica está confirmada. Enseñad este correo al llegar: con el localizador basta.
      </p>

      <div style="background:#fef2f2;border:2px dashed #dc2626;border-radius:12px;padding:16px;text-align:center;margin:0 0 18px">
        <div style="color:#991b1b;font-size:12px;font-weight:700;letter-spacing:1px">LOCALIZADOR</div>
        <div style="color:#7f1d1d;font-size:30px;font-weight:900;letter-spacing:3px">${escHtml(e.localizador)}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden">${filas(e)}</table>

      <p style="color:#475569;font-size:13px;line-height:1.6;margin:18px 0 0">
        <strong>Antes de venir:</strong> llegad unos 10 minutos antes del pase, porque la experiencia empieza puntual.
        Los menores deben venir acompañados de un adulto responsable durante toda la visita.
        Los bebés menores de 2 años entran gratis, pero ocupan plaza y han de estar incluidos en la reserva.
      </p>
      <p style="color:#475569;font-size:13px;line-height:1.6;margin:10px 0 0">
        Si necesitáis cambiar algo, responded a este correo indicando vuestro localizador.
      </p>
    </div>
    <div style="background:#f8fafc;padding:18px 28px;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6">
        Planeta Movimiento · Polígono Los Palancares, 8 · Cuenca ·
        <a href="mailto:info@planetamovimiento.com" style="color:#e11d2a;text-decoration:none">info@planetamovimiento.com</a>
      </p>
    </div>
  </div>
</div>`

  await enviarEmail({
    to: para,
    subject: `Entradas confirmadas · La Fábrica de Papá Noel (${e.localizador})`,
    html,
    tipo: 'entradas-navidad',
    meta: { localizador: e.localizador, fecha: e.fecha, hora: e.hora },
  })
}

/** Aviso interno a info@ con cada venta. */
export async function avisarNegocioNavidad(e: EntradasNavidad): Promise<void> {
  const html = `<div style="font-family:sans-serif">
    <h2 style="margin:0 0 8px">Nueva venta · Fábrica de Papá Noel</h2>
    <p style="margin:0 0 10px">${escHtml(e.nombre)} · ${escHtml(e.email)} · ${escHtml(e.localizador)}</p>
    <table style="border-collapse:collapse">${filas(e)}</table>
  </div>`
  await enviarEmail({
    to: NOTIF_TO,
    subject: `Venta Fábrica de Papá Noel · ${e.localizador}`,
    html,
    tipo: 'aviso-navidad',
    meta: { localizador: e.localizador },
  })
}
