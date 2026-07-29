import { notFound } from 'next/navigation'
import { requireSeccion } from '@/lib/admin/auth'
import { getDocumento, getPerfil, getClienteFactura } from '@/lib/facturacion/data'
import FacturaDoc, { type EmisorView, type ClienteView } from './FacturaDoc'
import PrintBar from './PrintBar'

export const dynamic = 'force-dynamic'

const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))

export default async function FacturaPdfPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSeccion('facturacion')
  const { id } = await params
  const doc = await getDocumento(id)
  if (!doc) notFound()

  // Emisor: del snapshot si está emitido; si es borrador, del perfil vivo.
  let emisor: EmisorView
  if (doc.emisorSnapshot) {
    const e = doc.emisorSnapshot
    emisor = {
      nombreComercial: s(e.nombre_comercial), razonSocial: s(e.razon_social), nif: s(e.nif),
      direccion: s(e.direccion), cp: s(e.cp), localidad: s(e.localidad), provincia: s(e.provincia), pais: s(e.pais),
      telefono: s(e.telefono), email: s(e.email), web: s(e.web), iban: s(e.iban), bic: s(e.bic),
      textoLegal: s(e.texto_legal), pieFactura: s(e.pie_factura), logoUrl: s(e.logo_url), color: s(e.color) || '#0F1A3D',
    }
  } else {
    const p = doc.profileId ? await getPerfil(doc.profileId) : null
    emisor = {
      nombreComercial: p?.nombreComercial ?? '', razonSocial: p?.razonSocial ?? '', nif: p?.nif ?? '',
      direccion: p?.direccion ?? '', cp: p?.cp ?? '', localidad: p?.localidad ?? '', provincia: p?.provincia ?? '', pais: p?.pais ?? '',
      telefono: p?.telefono ?? '', email: p?.email ?? '', web: p?.web ?? '', iban: p?.iban ?? '', bic: p?.bic ?? '',
      textoLegal: p?.textoLegal ?? '', pieFactura: p?.pieFactura ?? '', logoUrl: p?.logoUrl ?? '', color: p?.color ?? '#0F1A3D',
    }
  }

  // Cliente: del snapshot (emitido o inline) o de la ficha viva.
  let cli = doc.clienteSnapshot as Record<string, unknown> | null
  if (!cli && doc.clientId) {
    const c = await getClienteFactura(doc.clientId)
    if (c) cli = c as unknown as Record<string, unknown>
  }
  const cliente: ClienteView = {
    nombre: s(cli?.nombre), nif: s(cli?.nif), direccion: s(cli?.direccion), cp: s(cli?.cp),
    localidad: s(cli?.localidad), provincia: s(cli?.provincia), pais: s(cli?.pais),
    email: s(cli?.email), telefono: s(cli?.telefono), contacto: s(cli?.contacto),
  }

  const titulo = `${doc.tipo === 'proforma' ? 'Proforma' : 'Factura'} ${doc.numero || '(borrador)'}`

  return (
    <div className="min-h-screen bg-gray-100">
      <PrintBar titulo={titulo} />
      <div className="py-6">
        <div className="shadow-lg bg-white mx-auto" style={{ maxWidth: '210mm' }}>
          <FacturaDoc doc={doc} emisor={emisor} cliente={cliente} />
        </div>
      </div>
    </div>
  )
}
