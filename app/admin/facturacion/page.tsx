import { requireSeccion, can } from '@/lib/admin/auth'
import { AdminHeader } from '@/components/admin/ui'
import { getPerfiles, getSeries, getClientesFactura, hayTablasFacturacion } from '@/lib/facturacion/data'
import FacturacionClient from './FacturacionClient'

export const dynamic = 'force-dynamic'

export default async function FacturacionPage() {
  const admin = await requireSeccion('facturacion')
  const migrado = await hayTablasFacturacion()

  const [perfiles, series, clientes] = migrado
    ? await Promise.all([getPerfiles(), getSeries(), getClientesFactura()])
    : [[], [], []]

  return (
    <>
      <AdminHeader
        titulo={<span className="flex items-center gap-2"><span>🧾</span> Facturación</span>}
        subtitulo="Facturas y proformas · perfiles emisores y clientes"
      />
      <div className="p-4 lg:p-8">
        <FacturacionClient
          perfiles={perfiles}
          series={series}
          clientes={clientes}
          migrado={migrado}
          puedePerfiles={can.facturaPerfiles(admin.role)}
          puedeClientes={can.facturaClientes(admin.role)}
        />
      </div>
    </>
  )
}
