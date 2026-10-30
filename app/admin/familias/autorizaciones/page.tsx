import Link from 'next/link'
import { requireSeccion } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminHeader } from '@/components/admin/ui'
import { vigentesAdmin, normNombre } from '@/lib/autorizaciones/store'
import AutorizacionesClient, { type FilaAut, type Pendiente } from './AutorizacionesClient'

export const dynamic = 'force-dynamic'

const str = (v: unknown) => (typeof v === 'string' ? v : '')

export default async function AutorizacionesPage() {
  await requireSeccion('familias')
  const db = createAdminClient()
  const [{ lista, total, activada }, fams, links, subs] = await Promise.all([
    vigentesAdmin(),
    db.from('club_familias').select('id, email, nombre'),
    db.from('club_familia_alumnos').select('familia_id, submission_id'),
    db.from('form_submissions').select('id, nombre, datos').eq('tipo', 'inscripcion_club').limit(3000),
  ])

  const filas: FilaAut[] = lista.map(a => ({
    id: a.id, fecha: a.created_at, menor: a.menor_nombre, tutor: a.tutor_nombre, dni: a.tutor_dni,
    relacion: a.tutor_relacion, email: a.tutor_email, origen: a.origen, actividad: a.actividad ?? '',
    web: a.web, redes: a.redes, material: a.material, memorias: a.memorias, conformidad: a.conformidad_menor,
  }))

  // Hijos de las cuentas del Portal de Familias que aún no tienen firma.
  const firmados = new Set(lista.map(a => `${a.tutor_email}|${normNombre(a.menor_nombre)}`))
  const famMap = new Map((fams.data ?? []).map(f => [str(f.id), f]))
  const nombreDe = new Map((subs.data ?? []).map(s => {
    const d = (s.datos ?? {}) as Record<string, unknown>
    return [str(s.id), `${str(d.nombre)} ${str(d.apellidos)}`.trim() || str(s.nombre)]
  }))
  const pendientes = new Map<string, Pendiente>()
  for (const l of links.data ?? []) {
    const f = famMap.get(str(l.familia_id)), menor = nombreDe.get(str(l.submission_id))
    if (!f || !menor) continue
    const email = str(f.email).toLowerCase(), k = `${email}|${normNombre(menor)}`
    if (!firmados.has(k)) pendientes.set(k, { menor, familia: str(f.nombre), email })
  }

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>📸</span> Autorizaciones de imagen</span>}
        subtitulo="Firmas de las familias para usar fotos y vídeos de los menores"
      />
      <div className="p-4 lg:p-8 space-y-4">
        <Link href="/admin/familias" className="text-sm text-gray-500 hover:text-pm-red">← Volver a Portal de Familias</Link>
        {!activada ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Falta activar las autorizaciones: ejecuta <code>supabase/migration_autorizaciones_imagen.sql</code> en Supabase.
          </div>
        ) : (
          <AutorizacionesClient filas={filas} total={total}
            pendientes={[...pendientes.values()].sort((a, b) => a.menor.localeCompare(b.menor, 'es'))} />
        )}
      </div>
    </>
  )
}
