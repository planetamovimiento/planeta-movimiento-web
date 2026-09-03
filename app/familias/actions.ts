'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFamiliaUser } from '@/lib/familias/auth'
import { idsDeFamilia } from '@/lib/familias/data'
import { crearSesionFamilia } from '@/lib/familias/sesion'
import { normalizarNumeroSocio } from '@/lib/familias/socio'
import { getClientIp } from '@/lib/seguridad/ip'
import { enviarEmail } from '@/lib/emails/enviar'
import { comprimirImagen } from '@/lib/img/procesar'
import { TALLAS_EQUIPACION } from '@/lib/club/cuota'

/** MIME REAL por los bytes mágicos (evita ejecutables disfrazados de imagen). */
function mimeReal(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

const ERR_LOGIN = 'No se han podido validar los datos de acceso.'
const VENTANA_MS = 10 * 60 * 1000
const MAX_INTENTOS = 10
const MIN_TIEMPO_MS = 1500

/**
 * Acceso al Portal de Familias con correo + número de socio. Validación en el
 * servidor: rate-limit por IP, registro de intentos, mensaje genérico (no
 * revela si un correo existe). Solo entra una familia con estado activo y su
 * número de socio correcto.
 */
export async function loginFamilia(input: {
  email?: string; numeroSocio?: string; seguridad?: { hp?: string; renderedAt?: number }
}): Promise<{ ok: boolean; error?: string }> {
  // Antibots básicos.
  if (input.seguridad?.hp && input.seguridad.hp.trim() !== '') return { ok: false, error: ERR_LOGIN }
  if (typeof input.seguridad?.renderedAt === 'number' && input.seguridad.renderedAt > 0 && Date.now() - input.seguridad.renderedAt < MIN_TIEMPO_MS) {
    return { ok: false, error: ERR_LOGIN }
  }

  const ip = await getClientIp()
  const db = createAdminClient()

  // Rate-limit por IP.
  try {
    const desde = new Date(Date.now() - VENTANA_MS).toISOString()
    const { count } = await db.from('club_login_intentos').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', desde)
    if ((count ?? 0) >= MAX_INTENTOS) return { ok: false, error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' }
  } catch { /* si falta la tabla, no bloqueamos por ello */ }

  const email = (input.email || '').trim().toLowerCase()
  const numero = normalizarNumeroSocio(input.numeroSocio || '')
  const registrar = (ok: boolean) => { try { return db.from('club_login_intentos').insert({ ip, email: email || null, ok }) } catch { return Promise.resolve() } }

  if (!email || !numero) { await registrar(false); return { ok: false, error: ERR_LOGIN } }

  const { data } = await db.from('club_familias').select('id, estado, numero_socio').eq('email', email).maybeSingle()
  const fam = data as { id: string; estado: string; numero_socio: string | null } | null
  const numeroOk = !!fam?.numero_socio && normalizarNumeroSocio(fam.numero_socio) === numero

  if (!fam || !numeroOk || fam.estado !== 'activo') {
    await registrar(false)
    return { ok: false, error: ERR_LOGIN }
  }

  await registrar(true)
  const ua = (await headers()).get('user-agent') || ''
  await crearSesionFamilia(fam.id, ua)
  return { ok: true }
}

/**
 * "¿No recuerdas tu número de socio?" — si el correo es un socio activo, le
 * envía su número por email. Respuesta SIEMPRE igual (no revela si existe).
 */
export async function recuperarNumeroSocio(email?: string): Promise<{ ok: boolean }> {
  const e = (email || '').trim().toLowerCase()
  if (e) {
    try {
      const db = createAdminClient()
      const { data } = await db.from('club_familias').select('numero_socio, estado, nombre').eq('email', e).maybeSingle()
      const fam = data as { numero_socio: string | null; estado: string; nombre: string | null } | null
      if (fam?.numero_socio && fam.estado === 'activo') {
        await enviarEmail({
          to: e,
          subject: 'Tu acceso al Portal de Familias · Club Deportivo Origen',
          html: `<div style="font-family:sans-serif"><p>Hola${fam.nombre ? ' ' + fam.nombre : ''},</p><p>Tu número de socio para acceder al Portal de Familias es:</p><p style="font-size:20px;font-weight:bold;color:#0F1A3D">${fam.numero_socio}</p><p>Accede en <a href="https://planetamovimiento.com/familias/login">planetamovimiento.com/familias</a> con tu correo y este número.</p></div>`,
          tipo: 'portal-familias',
        })
      }
    } catch { /* nunca revelamos el resultado */ }
  }
  return { ok: true }
}

/** Comprueba que el alumno pertenece a la familia autenticada. Devuelve el email o null. */
async function autorizar(submissionId: string): Promise<string | null> {
  const familia = await getFamiliaUser()
  if (!familia) return null
  const ids = await idsDeFamilia(familia.id)
  if (!ids.includes(submissionId)) return null
  return familia.email
}

/**
 * Sube y fija la foto de perfil de un hijo, SOLO si pertenece a la familia.
 * Guarda en club_gestion.foto_url (mismo campo que ve/edita el admin).
 */
export async function guardarFotoHijo(submissionId: string, formData: FormData) {
  const email = await autorizar(submissionId)
  if (!email) return { ok: false, error: 'Sin permisos' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { ok: false, error: 'No se ha seleccionado ninguna imagen' }
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: 'La imagen supera los 8 MB' }

  const buffer = Buffer.from(await file.arrayBuffer())
  // Se comprueba el tipo REAL por los bytes mágicos, no solo la extensión/MIME
  // declarado: un archivo ejecutable renombrado a .jpg se rechaza aquí.
  const real = mimeReal(buffer)
  if (!real) return { ok: false, error: 'La imagen no es válida. Usa una foto JPG, PNG o WebP.' }

  const db = createAdminClient()
  const comp = await comprimirImagen(buffer)
  const finalBuf = comp?.buffer ?? buffer
  const contentType = comp?.contentType ?? real
  const ext = comp?.ext ?? (real === 'image/png' ? 'png' : real === 'image/webp' ? 'webp' : 'jpg')
  const path = `club-alumnos/${submissionId}-${Date.now()}.${ext}`
  const up = await db.storage.from('fotos').upload(path, finalBuf, { contentType, upsert: true, cacheControl: '2592000' })
  if (up.error) return { ok: false, error: up.error.message }

  const { data } = db.storage.from('fotos').getPublicUrl(path)
  const url = data.publicUrl

  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, foto_url: url, updated_at: new Date().toISOString(), updated_by: email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/familias')
  return { ok: true, url }
}

/** Quita la foto de perfil de un hijo, SOLO si pertenece a la familia. */
export async function quitarFotoHijo(submissionId: string) {
  const email = await autorizar(submissionId)
  if (!email) return { ok: false, error: 'Sin permisos' }

  const db = createAdminClient()
  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, foto_url: null, updated_at: new Date().toISOString(), updated_by: email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/familias')
  return { ok: true }
}

/**
 * La familia edita la talla de equipación de su hijo (uno de los pocos datos que
 * puede cambiar). Se valida contra el selector estándar y se sincroniza con el
 * CRM (club_gestion.talla). updated_by = correo de la familia (quién lo cambió).
 */
export async function guardarTallaHijo(submissionId: string, talla: string) {
  const email = await autorizar(submissionId)
  if (!email) return { ok: false, error: 'Sin permisos' }
  const t = (talla || '').trim()
  if (t && !(TALLAS_EQUIPACION as readonly string[]).includes(t)) return { ok: false, error: 'Talla no válida' }

  const db = createAdminClient()
  const { error } = await db.from('club_gestion').upsert(
    { submission_id: submissionId, talla: t || null, updated_at: new Date().toISOString(), updated_by: email },
    { onConflict: 'submission_id' }
  )
  if (error) return { ok: false, error: error.message }

  revalidatePath('/familias')
  return { ok: true }
}
