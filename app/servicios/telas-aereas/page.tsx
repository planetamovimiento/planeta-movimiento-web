import Link from 'next/link'
import { BotonApuntarme } from './InscripcionModal'
import TabsDescripcion from './TabsDescripcion'
import { Galeria } from '@/components/ui/Galeria'
import { fotoPrincipal, fotosDe } from '@/lib/fotos'

export const metadata = {
  title: 'Escuela de aéreos — Telas y Aro | Planeta Movimiento',
  description:
    'Descubre la magia de volar con nuestras clases de telas aéreas y aro aéreo. Aprenderás figuras, subidas y pequeñas coreografías adaptadas a cada nivel.',
}

export default function TelasAereasPage() {
  const principal = fotoPrincipal('telas-aereas')
  const miniaturas = fotosDe('telas-aereas').slice(1, 4)
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
            <span className="text-pm-navy font-semibold">Escuela de aéreos</span>
          </nav>
        </div>
      </div>

      {/* Layout principal — 2 columnas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* COLUMNA IZQUIERDA — Imágenes */}
          <div className="space-y-3">
            {/* Imagen principal con foto real de fondo */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-purple-900">
              {principal ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={principal} alt="Clase de telas aéreas" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 opacity-90" />
              )}
              {/* Overlay degradado para legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/85 via-purple-900/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-white/60 font-black text-xs tracking-[0.2em] uppercase mb-1">Temporada 25/26</div>
                <div className="text-white font-black text-2xl leading-tight">Telas Aéreas · Aro Aéreo</div>
                <div className="text-purple-200 font-bold text-sm italic mt-1">¿Te atreves a colgarte?</div>
              </div>
            </div>

            {/* Miniaturas reales */}
            {miniaturas.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {miniaturas.map((src, i) => (
                  <div key={src} className="rounded-xl overflow-hidden aspect-square bg-pm-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Telas aéreas ${i + 2}`} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA — Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-black text-pm-navy leading-tight mb-5">
              Escuela de aéreos
            </h1>

            {/* Descripción con negritas (fiel al original) */}
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed mb-6">
              <p>
                Descubre la <strong className="text-pm-navy">magia de volar</strong> y expresarte en el aire con
                nuestras clases de <strong className="text-pm-navy">telas aéreas</strong>.
              </p>
              <p>
                Aprenderás figuras, subidas, caídas controladas y{' '}
                <strong className="text-pm-navy">pequeñas coreografías</strong> adaptadas a cada nivel.
              </p>
              <p>
                Mejorarás <strong className="text-pm-navy">fuerza, flexibilidad y control corporal</strong> en un
                ambiente motivador.
              </p>
              <p>
                Una disciplina <strong className="text-pm-navy">artística y deportiva</strong> que te hará sentir{' '}
                <strong className="text-pm-navy">ligera y poderosa.</strong>
              </p>
            </div>

            {/* Badges rápidos */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { icon: '🧒', texto: 'Desde 7 años' },
                { icon: '⏱', texto: '60 – 90 min' },
                { icon: '📅', texto: 'Lun – Vie' },
                { icon: '🎗️', texto: 'Telas · Aro' },
                { icon: '🛡', texto: 'Seguro incluido' },
              ].map(({ icon, texto }) => (
                <span key={texto} className="inline-flex items-center gap-1.5 bg-pm-bg border border-gray-200 text-pm-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                  {icon} {texto}
                </span>
              ))}
            </div>

            {/* Botón APUNTARME */}
            <BotonApuntarme />

            {/* Info pago */}
            <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              Inscripción gratuita · Pago mensual al confirmar plaza
            </p>

            {/* Modalidades rápidas */}
            <div className="mt-6 bg-pm-bg rounded-xl p-4">
              <p className="text-xs font-black text-pm-navy uppercase tracking-wider mb-3">Modalidades disponibles</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Clase suelta', '1 clase / semana',
                  '2 clases / semana', '3 clases / semana',
                ].map(m => (
                  <div key={m} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0"/>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Separador contacto */}
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

        {/* Tabs descripción + calendario morado */}
        <TabsDescripcion />
      </div>

      {/* Galería de fotos */}
      <Galeria slug="telas-aereas" titulo="Galería" subtitulo="Telas y aro aéreo: figuras, fuerza y trabajo en altura" fondo="bg-pm-bg" />
    </main>
  )
}
