import { requireSeccion, can } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminHeader } from '@/components/admin/ui'
import type { Familia } from '@/lib/familias/tipos'
import { sincronizarFamilias } from '@/lib/familias/sync'
import FamiliasClient, { type AlumnoLite } from './FamiliasClient'
import AvisosManager from './AvisosManager'
import { getAvisos } from '@/lib/familias/avisos'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')
async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<{ rows: T[]; ok: boolean }> {
  try { const { data, error } = await fn(); return { rows: data ?? [], ok: !error } } catch { return { rows: [], ok: false } }
}

export default async function FamiliasPage() {
  const admin = await requireSeccion('familias')
  // Sincroniza automáticamente las cuentas con el CRM (solo quien puede editar).
  if (can.edit(admin.role)) await sincronizarFamilias()
  const db = createAdminClient()

  const [famsRes, linksRes, subsRes, gestRes] = await Promise.all([
    safe<Row>(() => db.from('club_familias').select('*').order('created_at', { ascending: false }) as never),
    safe<Row>(() => db.from('club_familia_alumnos').select('familia_id, submission_id') as never),
    safe<Row>(() => db.from('form_submissions').select('id, nombre, email, datos').eq('tipo', 'inscripcion_club').order('created_at', { ascending: false }).limit(2000) as never),
    safe<Row>(() => db.from('club_gestion').select('submission_id, grupo, whatsapp_url, cuota_estado') as never),
  ])
  const gestMap = new Map(gestRes.rows.map(g => [str(g.submission_id), g]))

  const familias: Familia[] = famsRes.rows.map(f => ({
    id: str(f.id), email: str(f.email), nombre: (f.nombre as string) ?? null, telefono: (f.telefono as string) ?? null,
    estado: (str(f.estado) || 'activo') as Familia['estado'], numero_socio: (f.numero_socio as string) ?? null,
    created_at: str(f.created_at), ultimo_acceso: (f.ultimo_acceso as string) ?? null,
  }))

  const links = linksRes.rows.map(l => ({ familia_id: str(l.familia_id), submission_id: str(l.submission_id) }))

  const alumnos: AlumnoLite[] = subsRes.rows.map(s => {
    const d = (s.datos ?? {}) as Record<string, unknown>
    const g = gestMap.get(str(s.id))
    const completo = str(s.nombre) || `${str(d.nombre)} ${str(d.apellidos)}`.trim()
    return {
      id: str(s.id), nombre: completo || '(sin nombre)', actividad: str(d.actividad), email: str(s.email).toLowerCase(),
      grupo: str(g?.grupo), whatsapp_url: str(g?.whatsapp_url),
      esSocio: d.esSocio === true, cuotaEstado: str(g?.cuota_estado),
    }
  })

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>👨‍👩‍👧</span> Portal de Familias</span>}
        subtitulo="Cuentas de familias, alumnos vinculados y acceso al portal privado"
      />
      <div className="p-4 lg:p-8">
        <AvisosManager avisos={await getAvisos()} puedeEditar={can.edit(admin.role)} />
        <FamiliasClient familias={familias} links={links} alumnos={alumnos} migrado={famsRes.ok && linksRes.ok} puedeEditar={can.edit(admin.role)} />
      </div>
    </>
  )
}
