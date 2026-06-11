import { requireSeccion } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminHeader } from '@/components/admin/ui'
import type { Familia } from '@/lib/familias/tipos'
import { sincronizarFamilias } from '@/lib/familias/sync'
import FamiliasClient, { type AlumnoLite } from './FamiliasClient'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')
async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<{ rows: T[]; ok: boolean }> {
  try { const { data, error } = await fn(); return { rows: data ?? [], ok: !error } } catch { return { rows: [], ok: false } }
}

export default async function FamiliasPage() {
  await requireSeccion('familias')
  // Sincroniza automáticamente las cuentas familiares con el CRM al abrir la sección.
  await sincronizarFamilias()
  const db = createAdminClient()

  const [famsRes, linksRes, subsRes] = await Promise.all([
    safe<Row>(() => db.from('club_familias').select('*').order('created_at', { ascending: false }) as never),
    safe<Row>(() => db.from('club_familia_alumnos').select('familia_id, submission_id') as never),
    safe<Row>(() => db.from('form_submissions').select('id, nombre, email, datos').eq('tipo', 'inscripcion_club').order('created_at', { ascending: false }).limit(2000) as never),
  ])

  const familias: Familia[] = famsRes.rows.map(f => ({
    id: str(f.id), email: str(f.email), nombre: (f.nombre as string) ?? null, telefono: (f.telefono as string) ?? null,
    estado: (str(f.estado) || 'activo') as Familia['estado'], created_at: str(f.created_at), ultimo_acceso: (f.ultimo_acceso as string) ?? null,
  }))

  const links = linksRes.rows.map(l => ({ familia_id: str(l.familia_id), submission_id: str(l.submission_id) }))

  const alumnos: AlumnoLite[] = subsRes.rows.map(s => {
    const d = (s.datos ?? {}) as Record<string, unknown>
    const completo = str(s.nombre) || `${str(d.nombre)} ${str(d.apellidos)}`.trim()
    return { id: str(s.id), nombre: completo || '(sin nombre)', actividad: str(d.actividad), email: str(s.email).toLowerCase() }
  })

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>👨‍👩‍👧</span> Portal de Familias</span>}
        subtitulo="Cuentas de familias, alumnos vinculados y acceso al portal privado"
      />
      <div className="p-4 lg:p-8">
        <FamiliasClient familias={familias} links={links} alumnos={alumnos} migrado={famsRes.ok && linksRes.ok} />
      </div>
    </>
  )
}
