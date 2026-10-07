'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { enviarEmail, NOTIF_TO } from '@/lib/emails/enviar'
import { enviarConfirmacionReserva } from '@/lib/emails/confirmacion'
import { escHtml } from '@/lib/seguridad/sanitize'
import { comprobarEnvioForm } from '@/lib/seguridad/guard'
import type { Seguridad } from '@/lib/forms/actions'
import { getProducto } from '@/lib/productos/store'

// ─────────────────────────────────────────────────────────────────────────────
// Pedido de Planeta Shop. Queda registrado en `product_orders` (lo ve el CRM),
// avisa al negocio y manda confirmación al cliente. Sin cobro online: el pago
// se acuerda al confirmar, como hasta ahora.
// ─────────────────────────────────────────────────────────────────────────────

export type LineaPedido = {
  productoId: string
  varianteId: string
  colorId?: string
  talla?: string
  nombrePersonalizado?: string
  /** Nº de socio del club: activa su descuento. */
  numeroSocio?: string
  cantidad: number
}

type Res = { ok: true; total: number } | { ok: false; error: string }

const txt = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function enviarPedidoShop(input: {
  cliente: { nombre?: string; email?: string; telefono?: string; mensaje?: string }
  lineas: LineaPedido[]
  seguridad?: Seguridad
}): Promise<Res> {
  const g = await comprobarEnvioForm({
    formTipo: 'pedido_shop',
    honeypot: input.seguridad?.hp,
    renderedAt: input.seguridad?.renderedAt,
    turnstileToken: input.seguridad?.turnstileToken,
    email: input.cliente?.email,
    contenido: input.cliente?.mensaje,
  })
  if (!g.ok) return { ok: false, error: g.error }

  const nombre = txt(input.cliente?.nombre, 80)
  const email = txt(input.cliente?.email, 120).toLowerCase()
  const telefono = txt(input.cliente?.telefono, 30)
  const mensaje = txt(input.cliente?.mensaje, 600)
  if (!nombre || !email || !telefono) return { ok: false, error: 'Faltan tus datos de contacto' }
  if (!input.lineas?.length) return { ok: false, error: 'El carrito está vacío' }

  // El precio SIEMPRE sale del catálogo del servidor, nunca del navegador.
  const items: {
    productoId: string; nombre: string; variante: string; color: string
    talla: string; nombrePersonalizado: string; numeroSocio: string; descuento: string
    cantidad: number; precio: number; reserva: boolean; recogida: boolean
  }[] = []
  let total = 0
  for (const l of input.lineas) {
    const p = await getProducto(l.productoId)
    if (!p) continue
    const v = p.variantes.find(x => x.id === l.varianteId) ?? p.variantes[0]
    const cantidad = Math.min(20, Math.max(1, Math.round(Number(l.cantidad) || 1)))
    const color = p.colores.find(c => c.id === l.colorId)
    // El descuento de socio se recalcula aquí: el navegador no decide el precio.
    const numeroSocio = txt(l.numeroSocio, 20)
    const dto = numeroSocio && p.descuentoSocio ? p.descuentoSocio : 0
    const precio = Math.round(v.precio * (1 - dto / 100) * 100) / 100
    items.push({
      productoId: p.id,
      nombre: p.nombre,
      variante: v.label,
      color: color?.label ?? '',
      talla: txt(l.talla, 10),
      nombrePersonalizado: txt(l.nombrePersonalizado, 20),
      numeroSocio,
      descuento: dto ? `Socio −${dto} %` : '',
      cantidad,
      precio,
      reserva: p.tipo === 'reserva',
      recogida: !!p.recogida,
    })
    total += precio * cantidad
  }
  if (!items.length) return { ok: false, error: 'El carrito está vacío' }

  const hayReserva = items.some(i => i.reserva)
  const linea = (i: typeof items[number]) =>
    `${i.cantidad} × ${i.nombre} (${[i.variante, i.color, i.talla && `talla ${i.talla}`, i.nombrePersonalizado && `nombre: ${i.nombrePersonalizado}`, i.numeroSocio && `socio ${i.numeroSocio}`, i.descuento].filter(Boolean).join(' · ')})`
    + (i.precio ? ` — ${i.precio * i.cantidad} €` : ' — precio por confirmar')

  try {
    const db = createAdminClient()
    const { error } = await db.from('product_orders').insert({
      cliente_nombre: nombre, cliente_email: email, cliente_telefono: telefono,
      items, total, estado: 'nuevo', tipo: hayReserva ? 'reserva' : 'pedido',
      detalle: mensaje || null,
    })
    if (error) return { ok: false, error: 'No se pudo registrar el pedido. Inténtalo de nuevo.' }
  } catch {
    return { ok: false, error: 'No se pudo registrar el pedido. Inténtalo de nuevo.' }
  }

  const filas = [
    ['Cliente', nombre], ['Email', email], ['Teléfono', telefono],
    ['Pedido', items.map(linea).join(' | ')],
    ['Total', total ? `${total} €` : 'Por confirmar'],
    ['Entrega', items.every(i => i.recogida) ? 'Recogida en la instalación' : 'Envío o recogida por confirmar'],
    ['Mensaje', mensaje],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748b">${escHtml(String(k))}</td><td style="padding:6px 12px;color:#0F1A3D;font-weight:600">${escHtml(String(v))}</td></tr>`)
    .join('')

  await enviarEmail({
    to: NOTIF_TO,
    subject: `Nuevo pedido de Planeta Shop · ${nombre}`,
    html: `<div style="font-family:sans-serif"><h2 style="color:#0F1A3D">Nuevo pedido de Planeta Shop</h2><table style="border-collapse:collapse;font-size:14px">${filas}</table><p style="color:#94a3b8;font-size:12px;margin-top:16px">Gestiónalo en el panel, en Productos y pedidos.</p></div>`,
    tipo: 'aviso-interno',
  })

  await enviarConfirmacionReserva({
    servicio: hayReserva ? 'Reserva en Planeta Shop' : 'Pedido en Planeta Shop',
    clienteNombre: nombre, clienteEmail: email,
    total: total || null,
  })

  return { ok: true, total }
}
