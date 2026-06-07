import { getAdminUser, can } from '@/lib/admin/auth'
import { getMananaMagica } from '@/lib/eventos/store'
import { AdminHeader } from '@/components/admin/ui'
import EditorMananaMagica from './EditorMananaMagica'

export default async function MananaMagicaAdminPage() {
  const admin = await getAdminUser()
  const cfg = await getMananaMagica()

  return (
    <>
      <AdminHeader
        titulo="Mañanas Mágicas"
        subtitulo="Edita el personaje del mes y los datos del evento. Se actualiza al instante en la web."
      />
      <div className="p-6 lg:p-8">
        <EditorMananaMagica inicial={cfg} puedeEditar={admin ? can.edit(admin.role) : false} />
      </div>
    </>
  )
}
