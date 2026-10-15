// ─────────────────────────────────────────────────────────────────────────────
// Política de cancelación de Planeta Movimiento. Única para todos los servicios
// con reserva; se enseña antes de pagar, en el correo de confirmación y en las
// condiciones de uso. Para cambiarla, se toca solo este archivo.
//
// En actividades de ocio con fecha no hay derecho de desistimiento (art. 103.l
// del RDL 1/2007), así que esta política es la que rige las devoluciones.
// Archivo puro: se usa en servidor (correos) y en cliente (formularios).
// ─────────────────────────────────────────────────────────────────────────────

export const CANCELACION_TRAMOS: { cuando: string; devolucion: string }[] = [
  { cuando: 'Con 15 días o más de antelación', devolucion: 'devolución del 100 %' },
  { cuando: 'Entre 14 días y 48 horas antes', devolucion: 'devolución del 50 %' },
  { cuando: 'Con menos de 48 horas o si no se asiste', devolucion: 'sin devolución' },
]

export const CANCELACION_NOTAS: string[] = [
  'Los plazos cuentan hasta la fecha y hora de inicio de la actividad.',
  'En cumpleaños y animaciones, la misma escala se aplica a la señal de reserva de 50 €.',
  'Si somos nosotros quienes cancelamos la actividad, devolvemos el 100 %.',
  'Para cancelar, escríbenos a info@planetamovimiento.com o por WhatsApp indicando tu nº de reserva.',
]

/** Bloque de la política para los correos (HTML con estilos en línea). */
export function politicaCancelacionHtml(): string {
  const tramos = CANCELACION_TRAMOS
    .map(t => `<li style="margin:0 0 3px"><strong>${t.cuando}:</strong> ${t.devolucion}.</li>`)
    .join('')
  const notas = CANCELACION_NOTAS.map(n => `<li style="margin:0 0 3px">${n}</li>`).join('')
  return `
      <div style="margin:22px 0 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
        <div style="color:#0F1A3D;font-size:14px;font-weight:800;margin:0 0 6px">Política de cancelación</div>
        <ul style="color:#475569;font-size:13px;line-height:1.55;margin:0 0 6px;padding-left:18px">${tramos}</ul>
        <ul style="color:#64748b;font-size:12px;line-height:1.55;margin:0;padding-left:18px">${notas}</ul>
      </div>`
}
