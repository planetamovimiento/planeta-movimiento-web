'use server'

import { comprobarEnvioForm } from '@/lib/seguridad/guard'
import { firmaDeEntrada, validarFirma } from '@/lib/autorizaciones/documento'
import { guardarFirmas } from '@/lib/autorizaciones/store'
import type { EnvioAutorizacion } from '@/components/autorizaciones/FormAutorizacion'

/** Firma desde el enlace público planetamovimiento.com/autorizacion. */
export async function firmarAutorizacionPublica(e: EnvioAutorizacion) {
  const email = String(e?.email ?? '').trim().slice(0, 160)
  const menores = (Array.isArray(e?.menores) ? e.menores : [])
    .map(m => String(m).trim().slice(0, 120)).filter(Boolean).slice(0, 6)
  const actividad = String(e?.actividad ?? '').trim().slice(0, 120)

  const guard = await comprobarEnvioForm({
    formTipo: 'autorizacion_imagen',
    honeypot: e?.seguridad?.hp, renderedAt: e?.seguridad?.renderedAt, turnstileToken: e?.seguridad?.turnstileToken,
    email, contenido: menores.join(' '),
  })
  if (!guard.ok) return guard

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Escribe un correo electrónico válido.' }
  if (!menores.length || menores.some(m => m.length < 4)) return { ok: false, error: 'Escribe el nombre y apellidos completos de cada menor.' }
  const firma = firmaDeEntrada(e?.firma)
  const err = validarFirma(firma)
  if (err) return { ok: false, error: err }

  return guardarFirmas({ origen: 'enlace', email, actividad, menores: menores.map(nombre => ({ nombre })), firma })
}
