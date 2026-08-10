import { CUOTA, eurosCuota } from '@/lib/club/cuota'

// ─────────────────────────────────────────────────────────────────────────────
// Sección pública "Cuota de socio" del Club Deportivo Origen (temporada activa).
// Dos precios según fecha de pago + qué incluye. Sin pago online: gestión manual.
// Sin emojis. Ancla #cuota para enlazar desde los servicios.
// ─────────────────────────────────────────────────────────────────────────────

export function CuotaSocio() {
  return (
    <section id="cuota" className="bg-pm-bg py-16 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-2">Temporada {CUOTA.temporada}</div>
          <h2 className="text-3xl font-black text-pm-navy mb-3">Cuota de socio</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Información importante para formar parte del Club Deportivo Origen esta temporada.
            El pago se realiza de forma presencial (sin cobro online).
          </p>
        </div>

        {/* Dos precios según fecha de pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border-2 border-pm-red bg-white p-6 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Precio reducido</span>
            <div className="text-sm text-gray-500 mb-1">Pago hasta el 27 de septiembre de 2026</div>
            <div className="text-4xl font-black text-pm-navy">{eurosCuota(CUOTA.reducidaCents)}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Pago a partir del 28 de septiembre de 2026</div>
            <div className="text-4xl font-black text-pm-navy">{eurosCuota(CUOTA.normalCents)}</div>
          </div>
        </div>

        {/* Qué incluye */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="text-xs font-black text-pm-navy uppercase tracking-widest mb-4">Qué incluye la cuota</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CUOTA.incluye.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                <svg className="w-4 h-4 text-pm-red shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ── Aviso discreto de cuota para las páginas de servicio (punto 20) ────────────
export function AvisoCuotaClub() {
  return (
    <p className="text-xs text-gray-500 leading-relaxed mt-4">
      Para la temporada {CUOTA.temporada} se aplica la cuota anual de socio del Club Deportivo Origen.{' '}
      <a href="/club#cuota" className="text-pm-red font-semibold hover:underline whitespace-nowrap">Ver qué incluye la cuota</a>
    </p>
  )
}
