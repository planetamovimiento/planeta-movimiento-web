// ─────────────────────────────────────────────────────────────────────────────
// Documento imprimible (A4). Presentacional: recibe el documento + los datos ya
// normalizados del emisor y del receptor (desde el snapshot si está emitido, o
// desde el perfil/cliente vivos si es un borrador). El navegador lo imprime a PDF.
// ─────────────────────────────────────────────────────────────────────────────

import { calcularDocumento, eur } from '@/lib/facturacion/dinero'
import { fechaCorta, TEXTO_PROFORMA, AVISO_PROFORMA } from '@/lib/facturacion/constants'
import type { Documento } from '@/lib/facturacion/tipos'

export type EmisorView = {
  nombreComercial: string; razonSocial: string; nif: string; direccion: string; cp: string; localidad: string
  provincia: string; pais: string; telefono: string; email: string; web: string; iban: string; bic: string
  textoLegal: string; pieFactura: string; logoUrl: string; color: string
}
export type ClienteView = {
  nombre: string; nif: string; direccion: string; cp: string; localidad: string; provincia: string
  pais: string; email: string; telefono: string; contacto: string
}

const IVA_LABEL = (pct: number, tipo: string) => tipo === 'exento' ? 'Exento' : tipo === 'no_sujeto' ? 'No sujeto' : `${pct}%`

export default function FacturaDoc({ doc, emisor, cliente }: { doc: Documento; emisor: EmisorView; cliente: ClienteView }) {
  const color = emisor.color || '#0F1A3D'
  const esProforma = doc.tipo === 'proforma'
  const titulo = esProforma ? TEXTO_PROFORMA : 'FACTURA'

  const calc = calcularDocumento(doc.lineas.map(l => ({
    cantidad: l.cantidad, precioCents: l.precioCents, descuentoPct: l.descuentoPct, descuentoCents: l.descuentoCents,
    ivaPct: l.ivaPct, ivaTipo: l.ivaTipo, irpfPct: l.irpfPct,
  })), doc.suplidosCents)

  const dir2 = [emisor.cp, emisor.localidad].filter(Boolean).join(' ')
  const cliDir2 = [cliente.cp, cliente.localidad].filter(Boolean).join(' ')

  return (
    <div className="pm-print-root bg-white text-[#1a1a1a] mx-auto" style={{ maxWidth: '210mm', padding: '14mm', fontSize: '12px', lineHeight: 1.45 }}>
      {/* Cabecera: emisor + logo */}
      <div className="flex justify-between items-start gap-6">
        <div>
          <div className="font-black text-lg" style={{ color }}>{emisor.nombreComercial || emisor.razonSocial}</div>
          {emisor.razonSocial && emisor.razonSocial !== emisor.nombreComercial && <div className="font-semibold">{emisor.razonSocial}</div>}
          {emisor.direccion && <div>{emisor.direccion}</div>}
          {dir2 && <div>{dir2}</div>}
          {emisor.provincia && <div>{emisor.provincia}{emisor.pais ? ` · ${emisor.pais}` : ''}</div>}
          {emisor.nif && <div className="mt-1 font-semibold">CIF/NIF: {emisor.nif}</div>}
          {(emisor.telefono || emisor.email) && <div className="text-[11px] text-gray-500 mt-1">{[emisor.telefono, emisor.email, emisor.web].filter(Boolean).join(' · ')}</div>}
        </div>
        {emisor.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emisor.logoUrl} alt="" style={{ maxHeight: '80px', maxWidth: '180px', objectFit: 'contain' }} />
        )}
      </div>

      {/* Banda de título */}
      <div className="mt-6 flex items-stretch gap-3">
        <div className="text-white font-black px-4 py-2 rounded" style={{ background: color }}>
          {titulo}{doc.numero ? ` Nº ${doc.numero}` : ''}
        </div>
        <div className="border border-gray-200 rounded px-4 py-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Fecha</span>
          <div className="font-bold">{fechaCorta(doc.fecha) || '—'}</div>
        </div>
        {doc.vencimiento && (
          <div className="border border-gray-200 rounded px-4 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Vencimiento</span>
            <div className="font-bold">{fechaCorta(doc.vencimiento)}</div>
          </div>
        )}
      </div>

      {esProforma && <p className="mt-2 text-[11px] italic text-gray-500">{AVISO_PROFORMA}</p>}

      {/* Receptor */}
      <div className="mt-5 border border-gray-200 rounded p-3 max-w-md ml-auto">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cliente</div>
        <div className="font-bold">{cliente.nombre || '—'}</div>
        {cliente.nif && <div>CIF/NIF: {cliente.nif}</div>}
        {cliente.direccion && <div>{cliente.direccion}</div>}
        {cliDir2 && <div>{cliDir2}</div>}
        {cliente.provincia && <div>{cliente.provincia}{cliente.pais ? ` · ${cliente.pais}` : ''}</div>}
      </div>

      {/* Conceptos */}
      <table className="w-full mt-5 border-collapse">
        <thead>
          <tr style={{ background: color, color: 'white' }} className="text-left text-[11px]">
            <th className="px-2 py-2 font-bold">Concepto</th>
            <th className="px-2 py-2 font-bold text-right w-14">Cant.</th>
            <th className="px-2 py-2 font-bold text-right w-24">Precio</th>
            <th className="px-2 py-2 font-bold text-right w-16">IVA</th>
            <th className="px-2 py-2 font-bold text-right w-28">Importe</th>
          </tr>
        </thead>
        <tbody>
          {doc.lineas.map(l => (
            <tr key={l.id} className="border-b border-gray-100 align-top">
              <td className="px-2 py-2">
                <div className="font-semibold">{l.concepto}</div>
                {l.descripcion && <div className="text-[11px] text-gray-500 whitespace-pre-line">{l.descripcion}</div>}
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{l.cantidad}{l.unidad ? ` ${l.unidad}` : ''}</td>
              <td className="px-2 py-2 text-right tabular-nums">{eur(l.precioCents)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{IVA_LABEL(l.ivaPct, l.ivaTipo)}</td>
              <td className="px-2 py-2 text-right tabular-nums font-semibold">{eur(l.baseCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="flex justify-end mt-4">
        <div className="w-72 text-sm">
          <div className="flex justify-between py-0.5"><span className="text-gray-500">Base imponible</span><span className="tabular-nums">{eur(calc.baseCents)}</span></div>
          {calc.gruposIva.map(g => <div key={`iv${g.pct}`} className="flex justify-between py-0.5"><span className="text-gray-500">IVA {g.pct}%</span><span className="tabular-nums">{eur(g.cuotaCents)}</span></div>)}
          {calc.gruposIrpf.map(g => <div key={`ir${g.pct}`} className="flex justify-between py-0.5"><span className="text-gray-500">Retención IRPF {g.pct}%</span><span className="tabular-nums">−{eur(g.cuotaCents)}</span></div>)}
          {doc.suplidosCents > 0 && <div className="flex justify-between py-0.5"><span className="text-gray-500">Suplidos</span><span className="tabular-nums">{eur(doc.suplidosCents)}</span></div>}
          <div className="flex justify-between mt-1 pt-1.5 font-black text-base" style={{ borderTop: `2px solid ${color}`, color }}>
            <span>TOTAL</span><span className="tabular-nums">{eur(calc.totalCents)}</span>
          </div>
        </div>
      </div>

      {/* Forma de pago + IBAN */}
      {(doc.formaPago || emisor.iban) && (
        <div className="mt-6 border-t border-gray-200 pt-3 text-[11px]">
          <span className="font-bold">Forma de pago: </span>{doc.formaPago || '—'}
          {emisor.iban && <span> · <span className="font-bold">IBAN:</span> {emisor.iban}{emisor.bic ? ` · BIC: ${emisor.bic}` : ''}</span>}
        </div>
      )}

      {doc.observaciones && <p className="mt-3 text-[11px] whitespace-pre-line">{doc.observaciones}</p>}

      {/* Pie legal */}
      {(emisor.pieFactura || emisor.textoLegal) && (
        <div className="mt-6 text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2 whitespace-pre-line">
          {[emisor.pieFactura, emisor.textoLegal].filter(Boolean).join('\n')}
        </div>
      )}
    </div>
  )
}
