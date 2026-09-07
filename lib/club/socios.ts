import { createAdminClient } from '@/lib/supabase/admin'
import { esSoloSocio } from '@/lib/club/constants'

// ─────────────────────────────────────────────────────────────────────────────
// SOCIOS del Club Deportivo Origen (Admin → Socios).
//
// Un socio = un CORREO que ha hecho el formulario de alta de socio. Sus
// participantes son las inscripciones de ese correo marcadas con `esSocio`.
// El mismo correo es el del Portal de Familias, así que el nº de socio que se
// asigna aquí es el que la familia usa para entrar (club_familias.numero_socio).
//
// Aquí solo se gestiona lo del socio: nº de socio y entrega de equipación. Las
// cuotas mensuales y la ficha deportiva viven en Inscripciones Club.
// ─────────────────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')

export type ParticipanteSocio = {
  /** id de la inscripción (form_submissions). */
  id: string
  nombre: string
  apellidos: string
  fechaNacimiento: string
  actividad: string
  talla: string
  /** Fecha en la que se entregó la equipación ('' si aún no). */
  equipacionEntregada: string
  // ── Cuota de socio (lo que paga por participante: plaza + equipación) ──
  cuotaEstado: string
  cuotaImporteCents: number
  cuotaFechaPago: string
  cuotaFormaPago: string
  /** true si solo existe por el alta de socio (no está inscrito a una disciplina). */
  soloSocio: boolean
}

export type Socio = {
  email: string
  tutor: string
  telefono: string
  dni: string
  direccion: string
  /** Fecha del alta de socio más antigua de ese correo. */
  fechaAlta: string
  numeroSocio: string
  /** Cuenta del Portal de Familias con ese correo (null si aún no existe). */
  familiaId: string | null
  participantes: ParticipanteSocio[]
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, ' ')

/** Clave para no repetir al mismo niño (inscripción + línea del alta de socio). */
function claveParticipante(p: { nombre: string; apellidos: string; fechaNacimiento: string }): string {
  const nom = norm(p.nombre).split(' ')[0]
  const ape = norm(p.apellidos).split(' ')[0]
  return p.fechaNacimiento ? `f:${p.fechaNacimiento}` : `n:${nom} ${ape}`
}

async function filas(fn: () => Promise<{ data: unknown; error: unknown }>): Promise<Row[]> {
  try {
    const { data, error } = await fn()
    return error || !Array.isArray(data) ? [] : (data as Row[])
  } catch {
    return []
  }
}

/** Todos los socios con sus participantes (los más recientes primero). */
export async function getSocios(): Promise<Socio[]> {
  const db = createAdminClient()
  const [subs, gest, fams] = await Promise.all([
    filas(() => db.from('form_submissions').select('id, nombre, email, telefono, asunto, datos, created_at')
      .eq('tipo', 'inscripcion_club').order('created_at', { ascending: true }).limit(2000) as never),
    filas(() => db.from('club_gestion').select('submission_id, talla, cuota_estado, cuota_importe_cents, cuota_fecha_pago, cuota_forma_pago') as never),
    filas(() => db.from('club_familias').select('id, email, numero_socio, telefono, nombre') as never),
  ])

  const gestDe = new Map(gest.map(g => [str(g.submission_id), g]))
  const famDe = new Map(fams.map(f => [str(f.email).trim().toLowerCase(), f]))

  const porEmail = new Map<string, Socio>()
  for (const s of subs) {
    const d = (s.datos ?? {}) as Record<string, unknown>
    if (d.esSocio !== true) continue
    const email = str(s.email).trim().toLowerCase()
    if (!email) continue

    const completo = str(s.nombre)
    const p: ParticipanteSocio = {
      id: str(s.id),
      nombre: str(d.nombre) || completo.split(' ')[0] || '',
      apellidos: str(d.apellidos) || completo.split(' ').slice(1).join(' '),
      fechaNacimiento: str(d.fechaNacimiento).slice(0, 10),
      actividad: str(d.actividad),
      // La talla de la ficha (club_gestion) es la que edita la familia en el
      // portal o el admin; la del formulario de socio es solo el punto de partida.
      talla: str(gestDe.get(str(s.id))?.talla) || str(d.talla) || '',
      equipacionEntregada: str(d.equipacionEntregada).slice(0, 10),
      cuotaEstado: str(gestDe.get(str(s.id))?.cuota_estado),
      cuotaImporteCents: Number(gestDe.get(str(s.id))?.cuota_importe_cents ?? 0) || 0,
      cuotaFechaPago: str(gestDe.get(str(s.id))?.cuota_fecha_pago).slice(0, 10),
      cuotaFormaPago: str(gestDe.get(str(s.id))?.cuota_forma_pago),
      soloSocio: esSoloSocio(d, str(s.asunto)),
    }

    let socio = porEmail.get(email)
    if (!socio) {
      const fam = famDe.get(email)
      socio = {
        email,
        tutor: str(d.tutorLegal) || str(fam?.nombre),
        telefono: str(s.telefono) || str(fam?.telefono),
        dni: str(d.dniTutor),
        direccion: str(d.direccionTutor),
        fechaAlta: str(s.created_at),
        numeroSocio: str(fam?.numero_socio),
        familiaId: fam ? str(fam.id) : null,
        participantes: [],
      }
      porEmail.set(email, socio)
    }
    // Datos del tutor: se completa con lo que traiga cualquiera de sus altas.
    socio.tutor ||= str(d.tutorLegal)
    socio.dni ||= str(d.dniTutor)
    socio.direccion ||= str(d.direccionTutor)
    socio.telefono ||= str(s.telefono)

    // Un participante puede tener dos filas (su inscripción + la del alta de
    // socio): manda la inscripción real, que es donde está su ficha.
    const k = claveParticipante(p)
    const yaIdx = socio.participantes.findIndex(x => claveParticipante(x) === k)
    if (yaIdx === -1) socio.participantes.push(p)
    else if (socio.participantes[yaIdx].soloSocio && !p.soloSocio) {
      // Se queda la inscripción real, conservando la entrega ya registrada.
      p.equipacionEntregada ||= socio.participantes[yaIdx].equipacionEntregada
      p.talla ||= socio.participantes[yaIdx].talla
      if (!p.cuotaFechaPago && socio.participantes[yaIdx].cuotaFechaPago) {
        p.cuotaEstado = socio.participantes[yaIdx].cuotaEstado
        p.cuotaImporteCents = socio.participantes[yaIdx].cuotaImporteCents
        p.cuotaFechaPago = socio.participantes[yaIdx].cuotaFechaPago
        p.cuotaFormaPago = socio.participantes[yaIdx].cuotaFormaPago
      }
      socio.participantes[yaIdx] = p
    } else if (!p.equipacionEntregada && socio.participantes[yaIdx].equipacionEntregada) {
      // nada: ya está la mejor fila
    } else if (p.equipacionEntregada && !socio.participantes[yaIdx].equipacionEntregada) {
      socio.participantes[yaIdx].equipacionEntregada = p.equipacionEntregada
    }
  }

  return [...porEmail.values()]
    .map(s => ({ ...s, participantes: s.participantes.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) }))
    .sort((a, b) => (b.fechaAlta || '').localeCompare(a.fechaAlta || ''))
}

/** Nº de socios sin número asignado (globo rojo de la barra lateral). */
export async function contarSociosSinNumero(): Promise<number> {
  const socios = await getSocios()
  return socios.filter(s => !s.numeroSocio).length
}
