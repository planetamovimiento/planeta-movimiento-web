// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de WhatsApp (enlaces wa.me con mensaje predeterminado)
// ─────────────────────────────────────────────────────────────────────────────

/** Número de WhatsApp del negocio (Planeta Movimiento). */
export const WHATSAPP_NEGOCIO = '34657604665'

/** Normaliza un teléfono a formato wa.me con prefijo de España (34). */
export function telefonoWa(tel: string): string {
  const d = (tel || '').replace(/\D/g, '')
  if (d.startsWith('0034')) return d.slice(2)
  if (d.startsWith('34')) return d
  return '34' + d
}

/** Enlace de WhatsApp al número del negocio con un mensaje predeterminado. */
export function waNegocio(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NEGOCIO}?text=${encodeURIComponent(mensaje)}`
}

/** Enlace de WhatsApp a un cliente concreto con un mensaje predeterminado. */
export function waCliente(telefono: string, mensaje: string): string {
  return `https://wa.me/${telefonoWa(telefono)}?text=${encodeURIComponent(mensaje)}`
}
