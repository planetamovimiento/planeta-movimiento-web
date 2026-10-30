import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/seguridad/ip'
import { enviarJustificanteAutorizacion } from '@/lib/emails/confirmacion'
import { TEXTO, CANALES, VERSION_AUTORIZACION, type DatosFirma } from './documento'

// ─────────────────────────────────────────────────────────────────────────────
// Firmas de la autorización de imagen (tabla autorizaciones_imagen). Cada firma
// es una fila nueva; la vigente de cada menor es la última. SOLO SERVIDOR.
// ─────────────────────────────────────────────────────────────────────────────

export type Autorizacion = {
  id: string
  created_at: string
  origen: 'portal' | 'enlace'
  familia_id: string | null
  submission_id: string | null
  actividad: string | null
  menor_nombre: string
  tutor_nombre: string
  tutor_dni: string
  tutor_relacion: string
  tutor_email: string
  web: boolean
  redes: boolean
  material: boolean
  memorias: boolean
  conformidad_menor: boolean
  documento_version: string
}

/** Huella del texto aceptado: si alguien cambia el documento, cambia la huella. */
const HUELLA = createHash('sha256').update(JSON.stringify([VERSION_AUTORIZACION, TEXTO, CANALES])).digest('hex')

export const normNombre = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

const ERR_TABLA = 'Las autorizaciones todavía no están activadas en la web. Avísanos, por favor.'
const faltaTabla = (m: string) => /autorizaciones_imagen|does not exist|schema cache/i.test(m)

export async function guardarFirmas(p: {
  origen: 'portal' | 'enlace'
  familiaId?: string
  email: string
  actividad?: string
  menores: { nombre: string; submissionId?: string }[]
  firma: DatosFirma
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await getClientIp()
  const ua = (await headers()).get('user-agent')?.slice(0, 300) ?? null
  const f = p.firma
  const filas = p.menores.map(m => ({
    origen: p.origen,
    familia_id: p.familiaId ?? null,
    submission_id: m.submissionId ?? null,
    actividad: p.actividad?.trim() || null,
    menor_nombre: m.nombre.trim(),
    tutor_nombre: f.tutorNombre.trim(),
    tutor_dni: f.tutorDni.toUpperCase().replace(/[\s.-]/g, ''),
    tutor_relacion: f.relacion,
    tutor_email: p.email.trim().toLowerCase(),
    web: f.canales.web === true,
    redes: f.canales.redes === true,
    material: f.canales.material === true,
    memorias: f.canales.memorias === true,
    conformidad_menor: f.conformidadMenor,
    documento_version: VERSION_AUTORIZACION,
    documento_hash: HUELLA,
    ip, user_agent: ua,
  }))

  const { error } = await createAdminClient().from('autorizaciones_imagen').insert(filas)
  if (error) return { ok: false, error: faltaTabla(error.message) ? ERR_TABLA : 'No se ha podido guardar la autorización. Inténtalo de nuevo.' }

  // Justificante para la familia (nunca rompe la firma si el correo falla).
  await enviarJustificanteAutorizacion({
    email: filas[0].tutor_email, tutor: filas[0].tutor_nombre, dni: filas[0].tutor_dni,
    menores: filas.map(x => x.menor_nombre), actividad: filas[0].actividad ?? '',
    canales: CANALES.map(c => ({ label: c.label, autoriza: f.canales[c.id] === true })),
    conformidadMenor: f.conformidadMenor, version: VERSION_AUTORIZACION,
  }).catch(() => {})
  return { ok: true }
}

/** La última firma de cada `clave` (las filas pueden venir en cualquier orden). */
function ultimaPor(filas: Autorizacion[], clave: (a: Autorizacion) => string): Map<string, Autorizacion> {
  const out = new Map<string, Autorizacion>()
  for (const a of filas) {
    const k = clave(a), prev = out.get(k)
    if (!prev || prev.created_at < a.created_at) out.set(k, a)
  }
  return out
}

/**
 * Vigente de cada hijo de una familia (firmada en el portal o con el enlace y su
 * mismo correo), por nombre. null si la tabla aún no existe (bloque oculto).
 */
export async function vigentesDeFamilia(familiaId: string, email: string): Promise<Map<string, Autorizacion> | null> {
  const db = createAdminClient()
  const [a, b] = await Promise.all([
    db.from('autorizaciones_imagen').select('*').eq('familia_id', familiaId),
    db.from('autorizaciones_imagen').select('*').eq('tutor_email', email.trim().toLowerCase()),
  ])
  if (a.error && faltaTabla(a.error.message)) return null
  return ultimaPor([...(a.data ?? []), ...(b.data ?? [])] as Autorizacion[], x => normNombre(x.menor_nombre))
}

/** Para el admin: la vigente de cada menor (mismo correo + mismo nombre) y el nº total de firmas. */
export async function vigentesAdmin(): Promise<{ lista: Autorizacion[]; total: number; activada: boolean }> {
  const { data, error } = await createAdminClient().from('autorizaciones_imagen')
    .select('*').order('created_at', { ascending: false }).limit(5000)
  if (error) return { lista: [], total: 0, activada: !faltaTabla(error.message) }
  const filas = (data ?? []) as Autorizacion[]
  const lista = [...ultimaPor(filas, x => `${x.tutor_email}|${normNombre(x.menor_nombre)}`).values()]
    .sort((x, y) => x.menor_nombre.localeCompare(y.menor_nombre, 'es'))
  return { lista, total: filas.length, activada: true }
}
