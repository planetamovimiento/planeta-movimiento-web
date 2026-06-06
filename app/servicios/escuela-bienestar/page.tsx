import Link from 'next/link'
import { BotonApuntarme } from './InscripcionModal'
import TabsDescripcion from './TabsDescripcion'

export const metadata = {
  title: 'Escuela de Bienestar — Gimnasia para Tod@s | Planeta Movimiento',
  description:
    'Encuentra el equilibrio entre cuerpo y mente. Pilates, Yoga, Baile y Movimiento para adultos en Cuenca. Clases lunes, miércoles y viernes.',
}

export default function EscuelaBienestarPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-pm-bg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/club" className="hover:text-pm-red transition-colors">Club</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Escuela de Bienestar</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* COLUMNA IZQUIERDA — Imágenes */}
          <div className="space-y-3">
            {/* Cartel principal — teal/azul con foto de clase */}
            <div className="relative bg-teal-700 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-teal-600 to-cyan-400 opacity-90" />
              <div className="relative text-center px-6 space-y-3">
                <div className="text-white/20 font-black text-7xl leading-none select-none">25/26</div>
                <div className="text-white font-black text-lg tracking-widest uppercase">Temporada</div>
                {/* Frase del cartel */}
                <div className="bg-white/10 rounded-xl px-4 py-3 mt-2">
                  <p className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-1">
                    Cada desafío es una
                  </p>
                  <p className="text-white font-black text-base uppercase tracking-wider">
                    oportunidad para crecer
                  </p>
                </div>
                <div className="mt-3">
                  <span className="text-teal-200 font-black text-2xl tracking-wide">Gimnasia para</span>
                  <br />
                  <span className="text-white font-black text-3xl tracking-wide">TOD@S</span>
                </div>
                <div className="text-teal-200 text-xs mt-2">www.planetamovimiento.com</div>
              </div>
              <button className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
              </button>
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border-2 border-pm-red aspect-square bg-teal-700 flex items-center justify-center cursor-pointer">
                <span className="text-white/40 text-xs font-bold">25/26</span>
              </div>
              <div className="rounded-xl border-2 border-gray-200 aspect-square bg-teal-100 flex items-center justify-center cursor-pointer hover:border-pm-red transition-colors">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="rounded-xl border-2 border-gray-200 aspect-square bg-cyan-50 flex items-center justify-center cursor-pointer hover:border-pm-red transition-colors">
                <span className="text-3xl">🧘</span>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA — Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-black text-pm-navy leading-tight mb-5">
              Gimnasia para tod@s
            </h1>

            {/* Descripción fiel al original */}
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed mb-6">
              <p>
                Encuentra el equilibrio entre <strong className="text-pm-navy">cuerpo y mente.</strong>
              </p>
              <p>
                Realiza actividades diferentes como:{' '}
                <strong className="text-pm-navy">Pilates, Yoga, Baile y Movimiento.</strong>
              </p>
              <p>
                Un espacio para <strong className="text-pm-navy">moverte, relajarte y sentirte mejor</strong> cada día.
              </p>
            </div>

            {/* Actividades como pills visuales */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { emoji: '🧘', label: 'Pilates',    color: 'bg-teal-100 text-teal-800 border-teal-200' },
                { emoji: '🕉️', label: 'Yoga',       color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                { emoji: '💃', label: 'Baile',      color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                { emoji: '🤸', label: 'Movimiento', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              ].map(({ emoji, label, color }) => (
                <span key={label} className={`inline-flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded-full ${color}`}>
                  {emoji} {label}
                </span>
              ))}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { icon: '👩', texto: 'Para adultos' },
                { icon: '⏱',  texto: '60 min/sesión' },
                { icon: '📅', texto: 'L · X · V' },
                { icon: '🕤',  texto: '09:30 – 10:30' },
                { icon: '🛡',  texto: 'Todos los niveles' },
              ].map(({ icon, texto }) => (
                <span key={texto} className="inline-flex items-center gap-1.5 bg-pm-bg border border-gray-200 text-pm-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                  {icon} {texto}
                </span>
              ))}
            </div>

            {/* Botón */}
            <BotonApuntarme />

            <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              Inscripción gratuita · Pago mensual al confirmar plaza
            </p>

            {/* Horario rápido */}
            <div className="mt-6 bg-teal-50 border border-teal-100 rounded-xl p-4">
              <p className="text-xs font-black text-teal-700 uppercase tracking-wider mb-3">Horario semanal</p>
              <div className="flex gap-3">
                {['Lunes', 'Miércoles', 'Viernes'].map(dia => (
                  <div key={dia} className="flex-1 bg-teal-500 text-white text-center rounded-lg py-2 px-1">
                    <div className="font-black text-xs">{dia}</div>
                    <div className="text-teal-100 text-xs mt-0.5">09:30</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contacto */}
            <div className="border-t border-gray-100 mt-8 pt-6">
              <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">¿Tienes dudas?</p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:+34657604665" className="flex items-center gap-2 text-sm text-pm-navy hover:text-pm-red transition-colors font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  657 604 665
                </a>
                <a href="https://wa.me/34657604665" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Calendario */}
        <TabsDescripcion />
      </div>
    </main>
  )
}
