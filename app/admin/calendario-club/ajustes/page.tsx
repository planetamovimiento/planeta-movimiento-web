import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getTipos } from '@/lib/calendario-club/data'
import { AdminHeader } from '@/components/admin/ui'
import AjustesColoresClient from './AjustesColoresClient'

export const dynamic = 'force-dynamic'

export default async function AjustesCalendarioPage() {
  const admin = await requireSeccion('calendario-club')
  if (admin.role !== 'principal') redirect('/admin/calendario-club')
  const tipos = await getTipos()

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🎨</span> Calendario Club · Colores y tipos</span>}
        subtitulo="Personaliza el color y el nombre de cada tipo de evento"
      />
      <div className="p-4 lg:p-8">
        <Link href="/admin/calendario-club" className="text-sm text-gray-500 hover:text-pm-red">← Volver al calendario</Link>
        <div className="mt-4 max-w-2xl">
          <AjustesColoresClient tipos={tipos} />
        </div>
      </div>
    </>
  )
}
