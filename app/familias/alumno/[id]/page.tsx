import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnoDeFamilia } from '@/lib/familias/data'
import { Avatar, BadgeEstadoGeneral, CirculosMeses } from '../../ui'

export const dynamic = 'force-dynamic'

export default async function AlumnoFamiliaPage({ params }: { params: Promise<{ id: string }> }) {
  const familia = await requireFamilia()
  const { id } = await params
  const a = await getAlumnoDeFamilia(familia.id, id)
  if (!a) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Link href="/familias" className="text-sm text-gray-500 hover:text-pm-red">← Volver a mis hij@s</Link>

      {/* Cabecera */}
      <div className="bg-gradient-to-br from-pm-navy to-pm-navy-md rounded-3xl p-6 text-white flex items-center gap-5">
        <Avatar foto={a.foto_url} nombre={a.nombre} size="xl" />
        <div className="min-w-0">
          <h1 className="text-2xl font-black leading-tight">{a.nombre} {a.apellidos}</h1>
          <div className="text-white/70">{a.actividad || 'Club Deportivo Origen'}</div>
          <div className="mt-2"><BadgeEstadoGeneral estado={a.estado_general} /></div>
        </div>
      </div>

      {/* Datos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Dato label="Grupo" valor={a.grupo || '—'} />
        <Dato label="Horario" valor={a.horario || '—'} />
        <Dato label="Temporada" valor={a.temporada || '—'} />
        <Dato label="Actividad" valor={a.actividad || '—'} />
      </div>

      {/* Estado de la temporada */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-black text-pm-navy mb-1">Temporada (Sep → Jun)</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500" /> Pagado / activo</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Pendiente</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Baja</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-white border border-gray-300" /> Sin definir</span>
        </div>
        <CirculosMeses pagos={a.pagos} />
      </div>

      {/* Información importante para la familia */}
      {a.observaciones_familia && (
        <div className="bg-pm-red-light border border-pm-red/20 rounded-2xl p-5">
          <div className="text-xs font-black text-pm-red uppercase tracking-wider mb-1.5">Información importante</div>
          <p className="text-sm text-pm-navy leading-relaxed whitespace-pre-line">{a.observaciones_familia}</p>
        </div>
      )}
    </div>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-pm-navy text-sm break-words">{valor}</div>
    </div>
  )
}
