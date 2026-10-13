'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { comprobarEnvioForm } from '@/lib/seguridad/guard'
import { emitirCobroRedsys } from '@/lib/redsys/cobro'
import { calcularPrecio, normalizarEntradas, textoDescuentoNavidad, eurosDeCents, type Entradas } from '@/lib/navidad/precios'
import { getAjustesNavidad, getPases, verificarSocio, type PaseVista } from '@/lib/navidad/store'

// ─────────────────────────────────────────────────────────────────────────────
// Compra de entradas de LA FÁBRICA DE PAPÁ NOEL.
//
// Todo lo que decide dinero o plazas se hace AQUÍ, en el servidor:
//   1. se comprueba que la venta esté abierta y que el pase exista,
//   2. se verifica de verdad el nº de socio contra el Portal de Familias,
//   3. se recalculan precio y descuento en céntimos (lo que mande el navegador
//      es solo informativo),
//   4. se bloquea la plaza con la función navidad_reservar (cerrojo de fila:
//      dos compras a la vez nunca superan el aforo); la reserva nace PENDIENTE
//      y caduca sola si no se paga,
//   5. se emite el cobro en Redsys. La reserva pasa a confirmada únicamente
//      cuando llega la notificación firmada (lib/redsys/confirmar.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type CompraNavidadPayload = {
  paseId: string
  entradas: Partial<Entradas>
  cliente: { nombre: string; email: string; telefono: string }
  notas?: string
  socioNumero?: string
  acepta: boolean
  seguridad?: { hp?: string; renderedAt?: number; turnstileToken?: string }
}

export type CompraResult =
  | { ok: true; url: string; Ds_SignatureVersion: string; Ds_MerchantParameters: string; Ds_Signature: string }
  | { ok: false; error: string }

const SERVICIO_NAVIDAD = 'La Fábrica de Papá Noel'

/** Localizador corto y legible: PN-7F3K9Q (sin letras que se confundan). */
function nuevoLocalizador(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return `PN-${s}`
}

/** Hoy en Europe/Madrid (YYYY-MM-DD), para no vender pases ya pasados. */
function hoyMadrid(): string {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' })
  return f.format(new Date())
}

/** Disponibilidad al minuto (el widget la refresca antes de pagar). */
export async function getDisponibilidadNavidad(): Promise<PaseVista[]> {
  const hoy = hoyMadrid()
  const pases = await getPases()
  return pases.filter(p => p.fecha >= hoy)
}

/** Comprobación del nº de socio para el descuento (solo dice sí o no). */
export async function comprobarSocioNavidad(numero: string, email: string): Promise<{ ok: boolean }> {
  return { ok: await verificarSocio(numero, email) }
}

export async function comprarEntradasNavidad(p: CompraNavidadPayload): Promise<CompraResult> {
  // ── Datos del responsable ──────────────────────────────────────────────────
  const nombre = (p.cliente?.nombre || '').trim()
  const email = (p.cliente?.email || '').trim().toLowerCase()
  const telefono = (p.cliente?.telefono || '').trim()
  if (!nombre || !email || !telefono) return { ok: false, error: 'Faltan datos de contacto obligatorios.' }
  if (!p.acepta) return { ok: false, error: 'Debes aceptar las condiciones de compra para continuar.' }

  // ── Antibots / antispam (honeypot, tiempo, rate-limit, captcha) ────────────
  const g = await comprobarEnvioForm({
    formTipo: 'reserva',
    honeypot: p.seguridad?.hp,
    renderedAt: p.seguridad?.renderedAt,
    turnstileToken: p.seguridad?.turnstileToken,
    email,
    contenido: p.notas,
  })
  if (!g.ok) return g

  // ── Venta abierta ──────────────────────────────────────────────────────────
  const cfg = await getAjustesNavidad()
  if (!cfg.ventaActiva) return { ok: false, error: 'La venta de entradas todavía no está abierta. Vuelve a intentarlo en unos días.' }

  // ── Pase elegido ───────────────────────────────────────────────────────────
  const pases = await getPases()
  const pase = pases.find(x => x.id === p.paseId)
  if (!pase) return { ok: false, error: 'Elige un día y un pase para continuar.' }
  if (pase.bloqueado) return { ok: false, error: 'Ese pase no está disponible. Elige otro horario.' }
  if (pase.fecha < hoyMadrid()) return { ok: false, error: 'Ese pase ya ha pasado. Elige otra fecha.' }

  // ── Entradas ───────────────────────────────────────────────────────────────
  const entradas = normalizarEntradas(p.entradas)
  const plazas = entradas.ninos + entradas.adultos + entradas.bebes
  if (plazas < 1) return { ok: false, error: 'Indica cuántas personas vais a venir.' }
  if (entradas.ninos + entradas.adultos < 1) return { ok: false, error: 'Añade al menos una entrada de niño o de adulto: los bebés no pueden venir solos.' }
  if (plazas > cfg.maxPorCompra) return { ok: false, error: `En una misma compra caben como mucho ${cfg.maxPorCompra} personas. Escríbenos para grupos más grandes.` }
  if (plazas > pase.libres) {
    return { ok: false, error: pase.libres > 0
      ? `En ese pase solo quedan ${pase.libres} plaza${pase.libres === 1 ? '' : 's'}. Elige otro horario o menos asistentes.`
      : 'Ese pase se acaba de completar. Elige otro horario.' }
  }

  // ── Socio: se verifica de verdad (correo + nº del Portal de Familias) ──────
  const socioNumero = (p.socioNumero || '').trim()
  let socioVerificado = false
  if (socioNumero) {
    socioVerificado = await verificarSocio(socioNumero, email)
    if (!socioVerificado) {
      return { ok: false, error: 'Ese número de socio no coincide con el correo indicado. Usa el correo con el que entras al Portal de Familias, o quita el número para seguir sin descuento.' }
    }
  }

  // ── Precio (autoritativo, en céntimos) ─────────────────────────────────────
  const calculo = calcularPrecio(entradas, { socioVerificado }, cfg)
  if (calculo.totalCents <= 0) return { ok: false, error: 'El importe no es válido. Contacta con nosotros.' }

  // ── Plaza bloqueada de forma atómica (anti-sobreventa) ─────────────────────
  const db = createAdminClient()
  const localizador = nuevoLocalizador()
  const { data: fila, error: errRpc } = await db.rpc('navidad_reservar', {
    p_pase_id: pase.id,
    p_localizador: localizador,
    p_nombre: nombre,
    p_email: email,
    p_telefono: telefono,
    p_notas: (p.notas || '').trim(),
    p_ninos: entradas.ninos,
    p_adultos: entradas.adultos,
    p_bebes: entradas.bebes,
    p_subtotal_cents: calculo.subtotalCents,
    p_descuento_tipo: calculo.tipo,
    p_descuento_pct: calculo.pct,
    p_descuento_cents: calculo.descuentoCents,
    p_total_cents: calculo.totalCents,
    p_socio: socioVerificado ? socioNumero : '',
    p_minutos: cfg.minutosReserva,
  })

  if (errRpc || !fila) {
    const m = errRpc?.message || ''
    if (m.includes('SIN_PLAZAS')) {
      const libres = Number(m.split('SIN_PLAZAS:')[1]?.match(/\d+/)?.[0] ?? 0)
      return { ok: false, error: libres > 0
        ? `Alguien se ha adelantado: en ese pase solo quedan ${libres} plaza${libres === 1 ? '' : 's'}.`
        : 'Ese pase se acaba de completar. Elige otro horario.' }
    }
    if (m.includes('PASE_BLOQUEADO')) return { ok: false, error: 'Ese pase no está disponible. Elige otro horario.' }
    return { ok: false, error: 'No se pudo guardar la reserva. Inténtalo de nuevo.' }
  }

  const reserva = fila as unknown as { id: string }

  // ── Cobro con tarjeta ──────────────────────────────────────────────────────
  const descuentoTexto = textoDescuentoNavidad(calculo, socioNumero)
  const datosCRM = {
    localizador,
    pase: `${pase.fecha} · ${pase.hora}–${pase.horaFin}`,
    ninos: entradas.ninos, adultos: entradas.adultos, bebes: entradas.bebes,
    asistentes: plazas,
    subtotal: eurosDeCents(calculo.subtotalCents),
    descuento: descuentoTexto || 'Sin descuento',
    importe: eurosDeCents(calculo.totalCents),
    numeroSocio: socioVerificado ? socioNumero : '',
  }

  const cobro = await emitirCobroRedsys({
    servicioNombre: SERVICIO_NAVIDAD,
    clienteNombre: nombre,
    email, telefono,
    fecha: pase.fecha,
    hora: `${pase.hora} – ${pase.horaFin}`,
    participantes: plazas,
    importeCents: calculo.totalCents,
    observaciones: `${(p.notas || '').trim()}\n${JSON.stringify(datosCRM)}`.trim(),
    notaPendiente: `⏳ SIN PAGAR · Entradas ${localizador} (Fábrica de Papá Noel). La plaza se libera sola si no completa el pago.`,
  })

  if (!cobro.ok) {
    // Sin pasarela no hay venta: se suelta la plaza en el acto.
    await db.from('navidad_reservas').delete().eq('id', reserva.id)
    return { ok: false, error: cobro.error }
  }

  await db.from('navidad_reservas')
    .update({ booking_id: cobro.bookingId, ds_order: cobro.dsOrder, updated_at: new Date().toISOString() })
    .eq('id', reserva.id)

  return { ok: true, ...cobro.campos }
}
