import { getServicio } from '@/lib/servicios/store'
import { getTemporadaActiva } from '@/lib/config/store'
import { temporadaDisplay } from '@/lib/club/constants'
import { AvisoCuotaClub } from '@/components/club/CuotaSocio'

/** Servicios del Club que llevan cuota anual de socio. */
const SERVICIOS_CON_SOCIO = ['gimnasia-acrobatica', 'telas-aereas', 'escuela-infantil']

/**
 * Bloque de PRECIOS informativos de un servicio del Club Deportivo Origen.
 * Los precios y la nota son editables desde /admin/servicios (catálogo/BD).
 * El Club NO tiene compra online: la inscripción es siempre por formulario.
 */
export async function PreciosServicioClub({ servicioId }: { servicioId: string }) {
  const [servicio, temporada] = await Promise.all([getServicio(servicioId), getTemporadaActiva()])
  const filas = servicio?.preciosClub ?? []
  const nota = servicio?.preciosNota ?? ''
  if (filas.length === 0 && !nota) return null

  return (
    <div className="rounded-2xl border border-gray-100 bg-pm-bg shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-black text-pm-navy text-base sm:text-lg">Precios</h3>
        <span className="text-xs font-bold text-pm-red bg-pm-red-light border border-pm-red/20 px-3 py-1 rounded-full whitespace-nowrap">
          Temporada {temporadaDisplay(temporada)}
        </span>
      </div>

      {filas.length > 0 && (
        <ul className="divide-y divide-gray-200/70 mb-1">
          {filas.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-gray-600 leading-snug">{f.concepto}</span>
              <span className="text-sm font-black text-pm-navy whitespace-nowrap">{f.precio}</span>
            </li>
          ))}
        </ul>
      )}

      {nota && <p className="text-sm text-gray-600 leading-relaxed">{nota}</p>}

      <p className="text-xs text-gray-400 mt-4 flex items-start gap-1.5">
        <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
        <span>Inscripción por formulario · la mensualidad se abona al confirmar la plaza (sin pago online).</span>
      </p>

      {SERVICIOS_CON_SOCIO.includes(servicioId) && <AvisoCuotaClub temporada={temporadaDisplay(temporada)} />}
    </div>
  )
}
