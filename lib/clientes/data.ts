import { createAdminClient } from '@/lib/supabase/admin'

export type OrigenCliente = 'club' | 'reserva' | 'form'

export type Cliente = {
  origen: OrigenCliente
  id: string
  participante: string
  tutor: string
  email: string
  telefono: string
  servicio: string
  fecha: string
}

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try { const { data, error } = await fn(); return error ? [] : (data ?? []) } catch { return [] }
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

const SERVICIO_FORM: Record<string, string> = {
  presupuesto: 'Talleres Participativos', colegio: 'Excursiones Escolares', extraescolar: 'Actividades Extraescolares',
  licitaciones: 'Licitaciones', 'piea-residencias': 'PIEA · Residencias', 'piea-talleres': 'PIEA · Talleres mayores',
  colchonetas: 'Colchonetas', inscripcion: 'Talleres Intensivos', informacion: 'Información', contacto: 'Contacto',
  empresa: 'Eventos de empresa', ayuntamiento: 'Administración pública',
}

/** Extrae el JSON que las reservas guardan al final de observaciones. */
function datosDeObs(obs: string): Record<string, unknown> {
  const m = obs.match(/\{[\s\S]*\}\s*$/)
  if (m) { try { const d = JSON.parse(m[0]); if (d && typeof d === 'object') return d as Record<string, unknown> } catch { /* */ } }
  return {}
}

/** Nombre(s) del/los niño(s) de una reserva, según el tipo de servicio. '' si no se capturó. */
function nombresHijos(d: Record<string, unknown>): string {
  // Campamentos: lista "1) Nombre Apellidos — dd/mm/aaaa\n2) ..."
  const parts = str(d.participantes)
  if (parts) {
    const nombres = parts.split('\n')
      .map(l => l.replace(/^\s*\d+\)\s*/, '').replace(/\s*—.*$/, '').trim())
      .filter(Boolean)
    if (nombres.length) return nombres.join(', ')
  }
  // Cumpleaños: nombre del cumpleañero/a (formulario dedicado o asistente)
  return str(d.cumpleanero) || str(d.nombreCumpleanero) || ''
}

export async function getClientes(): Promise<{ clientes: Cliente[]; ok: boolean }> {
  const db = createAdminClient()
  const forms = await safe<Record<string, unknown>>(() => db.from('form_submissions').select('id, tipo, nombre, email, telefono, asunto, datos, created_at').order('created_at', { ascending: false }).limit(5000) as never)
  const books = await safe<Record<string, unknown>>(() => db.from('bookings').select('id, servicio, cliente_nombre, cliente_email, cliente_telefono, observaciones, created_at').order('created_at', { ascending: false }).limit(5000) as never)

  const out: Cliente[] = []

  for (const f of forms) {
    const d = (f.datos as Record<string, unknown>) || {}
    const club = str(f.tipo) === 'inscripcion_club'
    const participante = club
      ? (`${str(d.nombre)} ${str(d.apellidos)}`.trim() || str(f.nombre))
      : str(f.nombre)
    out.push({
      origen: club ? 'club' : 'form', id: str(f.id),
      participante: participante || '—',
      tutor: str(d.tutorLegal) || str(d.tutor) || '',
      email: str(f.email), telefono: str(f.telefono),
      servicio: club ? str(d.actividad) : (SERVICIO_FORM[str(f.tipo)] || str(f.asunto) || str(f.tipo) || 'Solicitud'),
      fecha: str(f.created_at),
    })
  }

  for (const b of books) {
    const d = datosDeObs(str(b.observaciones))
    const contacto = str(b.cliente_nombre)
    const hijos = nombresHijos(d)
    const numNinos = str(d.numNinos)
    // Participante = niño/s; Tutor = quien paga/contacto. Si la reserva no captura
    // el nombre del niño, se muestra "N niños"; si tampoco, el contacto como cliente.
    let participante: string, tutor: string
    if (hijos) { participante = hijos; tutor = contacto }
    else if (numNinos) { participante = `${numNinos} niño${numNinos === '1' ? '' : 's'}`; tutor = contacto }
    else { participante = contacto || '—'; tutor = str(d.tutor) || str(d.tutorLegal) || '' }
    out.push({
      origen: 'reserva', id: str(b.id),
      participante,
      tutor,
      email: str(b.cliente_email), telefono: str(b.cliente_telefono),
      servicio: str(b.servicio) || 'Reserva',
      fecha: str(b.created_at),
    })
  }

  out.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
  return { clientes: out, ok: forms.length > 0 || books.length >= 0 }
}
