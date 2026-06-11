import { createAdminClient } from '@/lib/supabase/admin'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)
// Escapa comodines de ILIKE (% y _) para que el correo se compare de forma exacta (case-insensitive).
const ilikeExacto = (s: string) => s.replace(/([%_\\])/g, '\\$1')

/**
 * Crea cuentas familiares (una por correo de inscripción del club) y vincula sus
 * alumnos. Idempotente: solo añade lo que falta. Las cuentas nacen activas.
 */
export async function sincronizarFamilias(): Promise<{ nuevasFamilias: number; nuevosVinculos: number }> {
  const db = createAdminClient()
  const [subsRes, famsRes, linksRes] = await Promise.all([
    db.from('form_submissions').select('id, email, telefono, datos').eq('tipo', 'inscripcion_club'),
    db.from('club_familias').select('id, email'),
    db.from('club_familia_alumnos').select('familia_id, submission_id'),
  ])
  const subs = ((subsRes.data ?? []) as Row[]).filter(s => str(s.email).trim())
  const famByEmail = new Map<string, string>(((famsRes.data ?? []) as Row[]).map(f => [str(f.email).toLowerCase(), str(f.id)]))
  const linkSet = new Set(((linksRes.data ?? []) as Row[]).map(l => `${str(l.familia_id)}|${str(l.submission_id)}`))

  const infoEmail = new Map<string, { nombre: string | null; telefono: string | null }>()
  for (const s of subs) {
    const email = str(s.email).trim().toLowerCase()
    if (!infoEmail.has(email)) {
      const datos = (s.datos ?? {}) as Record<string, unknown>
      infoEmail.set(email, { nombre: txt(str(datos.tutorLegal)), telefono: txt(str(s.telefono)) })
    }
  }

  let nuevasFamilias = 0
  const nuevosEmails = [...infoEmail.keys()].filter(e => !famByEmail.has(e))
  if (nuevosEmails.length) {
    const rows = nuevosEmails.map(e => ({ email: e, nombre: infoEmail.get(e)!.nombre, telefono: infoEmail.get(e)!.telefono, estado: 'activo' }))
    const { data: creadas } = await db.from('club_familias').insert(rows).select('id, email')
    for (const f of (creadas ?? []) as Row[]) { famByEmail.set(str(f.email).toLowerCase(), str(f.id)); nuevasFamilias++ }
  }

  const nuevosLinks: { familia_id: string; submission_id: string }[] = []
  for (const s of subs) {
    const famId = famByEmail.get(str(s.email).trim().toLowerCase())
    if (!famId) continue
    const key = `${famId}|${str(s.id)}`
    if (!linkSet.has(key)) { linkSet.add(key); nuevosLinks.push({ familia_id: famId, submission_id: str(s.id) }) }
  }
  let nuevosVinculos = 0
  if (nuevosLinks.length) {
    const { error } = await db.from('club_familia_alumnos').insert(nuevosLinks)
    if (!error) nuevosVinculos = nuevosLinks.length
  }
  return { nuevasFamilias, nuevosVinculos }
}

/**
 * Asegura la cuenta + vínculos de UNA familia por su correo (al entrar al portal).
 * Crea la fila si falta (activa) y sincroniza sus alumnos. Respeta el estado existente.
 * Devuelve la fila de la familia, o null si ese correo no tiene inscripciones ni cuenta.
 */
export async function provisionarFamilia(email: string): Promise<Row | null> {
  const db = createAdminClient()
  const e = email.trim().toLowerCase()
  if (!e) return null

  const { data: subsData } = await db.from('form_submissions').select('id, telefono, datos')
    .eq('tipo', 'inscripcion_club').ilike('email', ilikeExacto(e))
  const subs = (subsData ?? []) as Row[]

  let { data: rowData } = await db.from('club_familias').select('*').eq('email', e).maybeSingle()
  let row = rowData as Row | null

  // Sin inscripciones: solo es familia si ya tiene cuenta manual.
  if (subs.length === 0) return row

  if (!row) {
    const datos = (subs[0].datos ?? {}) as Record<string, unknown>
    const { data: creada, error } = await db.from('club_familias')
      .insert({ email: e, nombre: txt(str(datos.tutorLegal)), telefono: txt(str(subs[0].telefono)), estado: 'activo' })
      .select('*').single()
    if (error) {
      const { data: r2 } = await db.from('club_familias').select('*').eq('email', e).maybeSingle()
      row = r2 as Row | null
    } else {
      row = creada as Row
    }
  }
  if (!row) return null

  const linkRows = subs.map(s => ({ familia_id: str(row!.id), submission_id: str(s.id) }))
  if (linkRows.length) await db.from('club_familia_alumnos').upsert(linkRows, { onConflict: 'familia_id,submission_id' })
  return row
}
