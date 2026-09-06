import { createAdminClient } from '@/lib/supabase/admin'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const txt = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null)
// Escapa comodines de ILIKE (% y _) para que el correo se compare de forma exacta (case-insensitive).
const ilikeExacto = (s: string) => s.replace(/([%_\\])/g, '\\$1')

/** ¿Esta inscripción viene del formulario de socio? */
const esInscripcionSocio = (s: Row) => ((s.datos ?? {}) as Record<string, unknown>).esSocio === true

/**
 * Correos que han hecho el formulario de socio. El Portal de Familias es SOLO
 * para socios del Club Deportivo Origen: quien solo tiene inscripciones de
 * actividad no llega a tener cuenta familiar.
 */
function emailsSocios(subs: Row[]): Set<string> {
  return new Set(subs.filter(esInscripcionSocio).map(s => str(s.email).trim().toLowerCase()).filter(Boolean))
}

/**
 * Crea cuentas familiares (una por correo que ha hecho el formulario de SOCIO) y
 * vincula sus alumnos. Idempotente: solo añade lo que falta. Nacen activas.
 *
 * Los vínculos sí incluyen TODAS las inscripciones de ese correo (también las de
 * actividad), para que el socio vea a todos sus hijos en el portal.
 */
export async function sincronizarFamilias(): Promise<{ nuevasFamilias: number; nuevosVinculos: number }> {
  const db = createAdminClient()
  const [subsRes, famsRes, linksRes, exclRes] = await Promise.all([
    db.from('form_submissions').select('id, email, telefono, datos').eq('tipo', 'inscripcion_club'),
    db.from('club_familias').select('id, email'),
    db.from('club_familia_alumnos').select('familia_id, submission_id'),
    db.from('club_familia_excluidos').select('familia_id, submission_id'),
  ])
  const subs = ((subsRes.data ?? []) as Row[]).filter(s => str(s.email).trim())
  const famByEmail = new Map<string, string>(((famsRes.data ?? []) as Row[]).map(f => [str(f.email).toLowerCase(), str(f.id)]))
  const linkSet = new Set(((linksRes.data ?? []) as Row[]).map(l => `${str(l.familia_id)}|${str(l.submission_id)}`))
  // Vínculos que el admin quitó a mano: no se vuelven a crear.
  const exclSet = new Set(((exclRes.data ?? []) as Row[]).map(l => `${str(l.familia_id)}|${str(l.submission_id)}`))

  const socios = emailsSocios(subs)
  const infoEmail = new Map<string, { nombre: string | null; telefono: string | null }>()
  for (const s of subs) {
    const email = str(s.email).trim().toLowerCase()
    if (!socios.has(email)) continue // sin formulario de socio no hay cuenta familiar
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
    if (exclSet.has(key)) continue // desvinculado a mano: no re-crear
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
 * Crea la fila solo si ese correo hizo el formulario de SOCIO; si ya existe cuenta,
 * respeta su estado y sincroniza sus alumnos.
 * Devuelve la fila de la familia, o null si no es socio ni tiene cuenta.
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

  // Sin inscripciones, o sin formulario de socio: solo es familia si ya tiene cuenta.
  if (subs.length === 0 || !subs.some(esInscripcionSocio)) return row

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

  // Respeta las desvinculaciones manuales (no re-vincular lo que el admin quitó).
  const { data: exclData } = await db.from('club_familia_excluidos').select('submission_id').eq('familia_id', str(row.id))
  const excl = new Set(((exclData ?? []) as Row[]).map(x => str(x.submission_id)))
  const linkRows = subs.map(s => ({ familia_id: str(row!.id), submission_id: str(s.id) })).filter(l => !excl.has(l.submission_id))
  if (linkRows.length) await db.from('club_familia_alumnos').upsert(linkRows, { onConflict: 'familia_id,submission_id' })
  return row
}

/** Familia socia = tiene nº de socio asignado o alguna inscripción de socio. */
function esFamiliaSocia(fam: Row, socios: Set<string>, submissionsSocias: Set<string>, links: Row[]): boolean {
  if (str(fam.numero_socio).trim()) return true
  if (socios.has(str(fam.email).trim().toLowerCase())) return true
  return links.some(l => str(l.familia_id) === str(fam.id) && submissionsSocias.has(str(l.submission_id)))
}

/**
 * Cuenta (y opcionalmente borra) las cuentas familiares que NO son de socios.
 * El portal es solo para socios del Club, así que estas cuentas sobran: sus
 * inscripciones del CRM no se tocan, solo desaparece la cuenta del portal
 * (los vínculos y sesiones caen por cascada).
 */
export async function limpiarFamiliasSinSocio(soloContar = false): Promise<{ borradas: number; conservadas: number; emails: string[] }> {
  const db = createAdminClient()
  const [famsRes, subsRes, linksRes] = await Promise.all([
    db.from('club_familias').select('id, email, numero_socio'),
    db.from('form_submissions').select('id, email, datos').eq('tipo', 'inscripcion_club'),
    db.from('club_familia_alumnos').select('familia_id, submission_id'),
  ])
  const fams = (famsRes.data ?? []) as Row[]
  const subs = (subsRes.data ?? []) as Row[]
  const links = (linksRes.data ?? []) as Row[]

  const socios = emailsSocios(subs)
  const submissionsSocias = new Set(subs.filter(esInscripcionSocio).map(s => str(s.id)))

  const sobran = fams.filter(f => !esFamiliaSocia(f, socios, submissionsSocias, links))
  if (!soloContar && sobran.length) {
    await db.from('club_familias').delete().in('id', sobran.map(f => str(f.id)))
  }
  return {
    borradas: sobran.length,
    conservadas: fams.length - sobran.length,
    emails: sobran.map(f => str(f.email)).sort(),
  }
}
