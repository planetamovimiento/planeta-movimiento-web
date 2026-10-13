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
    const t = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(iso.slice(0, 10) + 'T12:00:00'))
    return t.charAt(0).toUpperCase() + t.slice(1)
  } catch { return iso }
}

function filas(e: EntradasNavidad): string {
  const lista: [string, string][] = [
    ['Código de entrada', e.localizador],
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

/** La entrada en HTML (se usa en el correo y para previsualizarla). */
export function htmlEntradasNavidad(e: EntradasNavidad): string {
  return `
<div style="background:#f1f5f9;padding:24px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#7f1d1d;padding:24px 28px">
      <div style="color:#fff;font-weight:900;font-size:20px">La Fábrica de Papá Noel</div>
      <div style="color:#fecaca;font-size:13px;margin-top:2px">Planeta Movimiento · Cuenca</div>
    </div>
    <div style="padding:28px">
      <h1 style="color:#0F1A3D;font-size:22px;margin:0 0 12px">¡Vuestra visita está confirmada!</h1>
      <p style="color:#334155;font-size:15px;margin:0 0 12px">Hola ${escHtml((e.nombre || '').split(' ')[0] || '')},</p>
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 20px">
        Ya tenéis vuestras entradas para La Fábrica de Papá Noel. Esta es vuestra entrada: podéis
        imprimirla o enseñarla en el móvil al llegar. Os esperamos con los elfos listos.
      </p>

      <!-- ── Entrada ─────────────────────────────────────────────────────── -->
      <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;border:2px dashed #dc2626;border-radius:14px;background:#fffdf5;overflow:hidden">
        <tr>
          <td style="padding:16px 18px;background:#7f1d1d">
            <div style="color:#fde68a;font-size:11px;font-weight:700;letter-spacing:2px">ENTRADA · PLANETA MOVIMIENTO</div>
            <div style="color:#fff;font-size:18px;font-weight:900;margin-top:2px">La Fábrica de Papá Noel</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px">
            <table role="presentation" style="width:100%;border-collapse:collapse">
              <tr>
                <td style="vertical-align:top;padding:0 10px 0 0">
                  <div style="color:#78716c;font-size:11px;font-weight:700;letter-spacing:1px">DÍA</div>
                  <div style="color:#1c1917;font-size:15px;font-weight:800">${escHtml(fechaLargaES(e.fecha))}</div>
                  <div style="color:#78716c;font-size:11px;font-weight:700;letter-spacing:1px;margin-top:10px">PASE</div>
                  <div style="color:#1c1917;font-size:15px;font-weight:800">${escHtml(e.horaFin ? `${e.hora} – ${e.horaFin}` : e.hora)}</div>
                  <div style="color:#78716c;font-size:11px;font-weight:700;letter-spacing:1px;margin-top:10px">ASISTENTES</div>
                  <div style="color:#1c1917;font-size:15px;font-weight:800">${e.plazas} personas</div>
                  <div style="color:#57534e;font-size:12px">${e.ninos} niños · ${e.adultos} adultos · ${e.bebes} bebés</div>
                </td>
                <td style="width:168px;vertical-align:middle;border-left:2px dashed #d6d3d1;padding-left:16px;text-align:center">
                  <div style="color:#991b1b;font-size:11px;font-weight:700;letter-spacing:2px">CÓDIGO</div>
                  <div style="color:#7f1d1d;font-size:34px;font-weight:900;letter-spacing:6px;line-height:1.2">${escHtml(e.localizador)}</div>
                  <div style="color:#78716c;font-size:11px;line-height:1.4;margin-top:4px">Enséñalo al llegar</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 18px;background:#fef2f2;border-top:1px dashed #fca5a5">
            <div style="color:#7f1d1d;font-size:12px;font-weight:700">
              Total pagado: ${escHtml(eurosDeCents(e.totalCents))}${e.descuento ? ` · ${escHtml(e.descuento)}` : ''}
            </div>
          </td>
        </tr>
      </table>

      <p style="color:#475569;font-size:13px;line-height:1.6;margin:20px 0 0">
        <strong>Antes de venir:</strong> llegad unos 10 minutos antes de la hora del pase, porque la visita
        empieza puntual y dura entre una hora y cuarto y una hora y veinte.
        Los menores deben venir acompañados de un adulto responsable durante toda la visita.
        Los bebés menores de 2 años entran gratis, pero ocupan plaza y han de estar incluidos en la reserva.
      </p>
      <p style="color:#475569;font-size:13px;line-height:1.6;margin:10px 0 0">
        <strong>Dónde:</strong> Planeta Movimiento, Polígono Los Palancares nº 8, Cuenca.
      </p>
      <p style="color:#475569;font-size:13px;line-height:1.6;margin:10px 0 0">
        Si necesitáis cambiar algo, responded a este correo indicando vuestro código ${escHtml(e.localizador)}.
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
}

/** Entradas al comprador. Silencioso ante errores: nunca rompe el cobro. */
export async function enviarEntradasNavidad(e: EntradasNavidad): Promise<void> {
  const para = (e.email || '').trim()
  if (!para) return

  await enviarEmail({
    to: para,
    html: htmlEntradasNavidad(e),
    subject: `Tus entradas · La Fábrica de Papá Noel · código ${e.localizador}`,
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
