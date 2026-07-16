import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getEtapas, getPatrocinadores, getFaq, getQrs, getDonantes, getConfigReto, hayTablaEtapas, resumenReto } from '@/lib/reto50/data'
import Reto50Client from './Reto50Client'

export const dynamic = 'force-dynamic'

export default async function Reto50Page() {
  const admin = await requireSeccion('50dias50provincias')

  // getEtapas() incluye las notas internas: aquí sí, es el panel.
  const [etapas, patrocinadores, faq, qrs, donantes, config, migrado] = await Promise.all([
    getEtapas(),
    getPatrocinadores(),
    getFaq(),
    getQrs(),
    getDonantes(),
    getConfigReto(),
    hayTablaEtapas(),
  ])

  // resumenReto vive en data.ts (service-role): se calcula aquí y viaja como prop.
  const resumen = resumenReto(etapas)

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🗺️</span> 50 días, 50 provincias</span>}
        subtitulo="Reto solidario de Brosjaca a beneficio de la Asociación Española Contra el Cáncer"
      />
      <div className="p-4 lg:p-8">
        <Reto50Client
          etapas={etapas}
          patrocinadores={patrocinadores}
          faq={faq}
          qrs={qrs}
          donantes={donantes}
          config={config}
          resumen={resumen}
          migrado={migrado}
          puedeEditar={can.edit(admin.role)}
        />
      </div>
    </>
  )
}
