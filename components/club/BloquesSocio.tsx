import { getClubConfig } from '@/lib/club/config'
import { getTemporadaActiva } from '@/lib/config/store'
import { temporadaDisplay } from '@/lib/club/constants'
import { eurosCuota, fechaLarga, diaSiguiente } from '@/lib/club/cuota'
import { BotonHazteSocio, type SocioInfo } from './HazteSocio'

// ─────────────────────────────────────────────────────────────────────────────
// Bloques públicos de "Hazte socio" (servidor). Leen la config editable del club.
// - HeroHazteSocio: bloque destacado para la portada del club (#cuota).
// - AvisoServicioSocio: bloque compacto para los servicios (punto 16-18).
// Sin emojis. Pago manual (efectivo/transferencia), sin pasarela.
// ─────────────────────────────────────────────────────────────────────────────

async function cargar() {
  const [{ cuota }, tempRaw] = await Promise.all([getClubConfig(), getTemporadaActiva()])
  const info: SocioInfo = {
    temporada: temporadaDisplay(tempRaw),
    reducidaCents: cuota.reducidaCents,
    normalCents: cuota.normalCents,
    fechaLimiteReducida: cuota.fechaLimiteReducida,
    iban: cuota.iban,
    conceptoTransferencia: cuota.conceptoTransferencia,
  }
  return { info, beneficios: cuota.beneficios }
}

export async function HeroHazteSocio() {
  const { info, beneficios } = await cargar()
  return (
    <section id="cuota" className="bg-pm-bg py-14 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Izquierda: mensaje + precios + botón */}
            <div className="p-6 sm:p-8">
              <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-2">Hazte socio del Club · Temporada {info.temporada}</div>
              <h2 className="text-2xl sm:text-3xl font-black text-pm-navy leading-tight mb-3">Hazte socio del Club Deportivo Origen</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                Formaliza el alta de tu familia para la temporada {info.temporada}. Una sola solicitud para todos tus hijos.
                El pago es presencial o por transferencia (sin cobro online).
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl border-2 border-pm-red bg-pm-red-light p-4 text-center relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-pm-red text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">Precio reducido</span>
                  <div className="text-[11px] text-gray-500 mb-1 leading-tight">Hasta el {fechaLarga(info.fechaLimiteReducida)}</div>
                  <div className="text-3xl font-black text-pm-navy">{eurosCuota(info.reducidaCents)}</div>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
                  <div className="text-[11px] text-gray-500 mb-1 leading-tight">Desde el {fechaLarga(diaSiguiente(info.fechaLimiteReducida))}</div>
                  <div className="text-3xl font-black text-pm-navy">{eurosCuota(info.normalCents)}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5">Ventaja por darte de alta antes del 28 de septiembre.</p>

              <BotonHazteSocio info={info} variant="principal" />
              <p className="text-xs text-gray-500 mt-3">
                ¿Ya eres socio? <a href="/familias" className="text-pm-red font-semibold hover:underline">Acceder al Portal de Familias</a>
              </p>
            </div>

            {/* Derecha: qué incluye */}
            <div className="bg-pm-navy text-white p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-widest text-white/55 mb-4">Qué incluye ser socio</div>
              <ul className="space-y-2.5">
                {beneficios.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                    <svg className="w-4 h-4 text-pm-red shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export async function AvisoServicioSocio() {
  const { info } = await cargar()
  return (
    <div className="rounded-2xl border border-pm-navy/15 bg-white shadow-sm p-5 mt-6">
      <div className="text-sm font-black text-pm-navy mb-1">Hazte socio del Club Deportivo Origen</div>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">
        Reserva tu plaza para la temporada {info.temporada} y accede a los beneficios de ser socio.
        Cuota desde {eurosCuota(info.reducidaCents)}.
      </p>
      <BotonHazteSocio info={info} variant="secundario" />
    </div>
  )
}
