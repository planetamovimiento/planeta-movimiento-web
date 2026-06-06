import Link from 'next/link'
import { TALLERES } from './config'
import TalleresClient from './TalleresClient'

export const metadata = {
  title: 'Talleres Intensivos — Club Deportivo Origen | Planeta Movimiento',
  description:
    'Formaciones de corta duración y alta intensidad en Telas Aéreas, Backflip, Verticales y Jiu-Jitsu. Para alumnos del club y público externo. Fines de semana en Cuenca.',
}

const abiertos    = TALLERES.filter(t => t.estado === 'abierto' || t.estado === 'ultimas').length
const proximamente = TALLERES.filter(t => t.estado === 'proximamente').length

export default function TalleresIntensivosPage() {
  return (
    <main className="bg-pm-bg min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/club" className="hover:text-pm-red transition-colors">Club Deportivo Origen</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Talleres Intensivos</span>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white py-16 border-t-4 border-pm-red">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="bg-pm-red text-white text-xs font-black px-3 py-1 rounded-full">
                  Club Deportivo Origen
                </span>
                {abiertos > 0 && (
                  <span className="bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">
                    {abiertos} taller{abiertos > 1 ? 'es' : ''} con inscripción abierta
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Talleres<br/>
                <span className="text-pm-red">Intensivos</span>
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-6 max-w-lg">
                Formaciones de corta duración y alta intensidad centradas en una sola disciplina.
                Para alumnos del club y para cualquier persona que quiera aprender más rápido y con más profundidad.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Fines de semana', 'Grupos reducidos', 'Instructor especializado', 'Alumnos y externos'].map(b => (
                  <span key={b} className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
                ))}
              </div>
              <a href="#talleres" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg">
                Ver talleres disponibles →
              </a>
            </div>

            {/* 4 disciplinas en grid */}
            <div className="grid grid-cols-2 gap-3">
              {TALLERES.map(t => (
                <div key={t.id} className={`bg-gradient-to-br ${t.grad} rounded-2xl p-5 text-white relative overflow-hidden`}>
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <div className="font-black text-sm leading-tight">{t.nombre}</div>
                  <div className="text-white/60 text-xs mt-1">{t.subtitulo}</div>
                  <div className={`absolute bottom-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full border ${
                    t.estado === 'abierto'      ? 'bg-green-500/20 border-green-400/30 text-green-300' :
                    t.estado === 'ultimas'      ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' :
                    t.estado === 'completo'     ? 'bg-gray-500/20 border-gray-400/30 text-gray-300'   :
                                                  'bg-blue-500/20 border-blue-400/30 text-blue-300'
                  }`}>
                    {t.estado === 'abierto' ? 'Abierto' : t.estado === 'ultimas' ? 'Últimas' : t.estado === 'completo' ? 'Completo' : 'Próximamente'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUÉ SON ── */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🎯', titulo: 'Objetivo único',     desc: 'Cada taller se centra en una sola disciplina o habilidad concreta, sin dispersión.' },
              { icon: '⚡', titulo: 'Alta intensidad',     desc: 'Más horas de práctica en menos tiempo. Avanzas más rápido que en las clases regulares.' },
              { icon: '👥', titulo: 'Grupos reducidos',    desc: 'Plazas muy limitadas para garantizar atención personalizada de cada participante.' },
            ].map(({ icon, titulo, desc }) => (
              <div key={titulo} className="bg-pm-bg border border-gray-200 rounded-2xl p-6">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-black text-pm-navy text-base mb-2">{titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TALLERES ── */}
      <section className="bg-pm-bg py-14" id="talleres">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-pm-navy">Talleres disponibles</h2>
              <p className="text-gray-500 text-sm mt-1">
                {proximamente > 0
                  ? `${proximamente} taller${proximamente > 1 ? 'es' : ''} en preparación · Activa el aviso para ser el primero`
                  : 'Elige tu taller e inscríbete'}
              </p>
            </div>
            {/* Leyenda de estados */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {[
                { estado: 'abierto',      label: 'Abierto',      color: 'bg-green-100 text-green-700 border-green-300' },
                { estado: 'ultimas',      label: 'Últimas plazas', color: 'bg-amber-100 text-amber-700 border-amber-300' },
                { estado: 'completo',     label: 'Completo',      color: 'bg-gray-100 text-gray-500 border-gray-300' },
                { estado: 'proximamente', label: 'Próximamente',  color: 'bg-blue-100 text-blue-700 border-blue-300' },
              ].map(({ label, color }) => (
                <span key={label} className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${color}`}>{label}</span>
              ))}
            </div>
          </div>

          <TalleresClient talleres={TALLERES} />

          {/* Nota de escalabilidad */}
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm">
            <div className="text-2xl mb-2">🗓️</div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
              <strong className="text-pm-navy">¿Hay alguna disciplina que te gustaría ver como taller?</strong><br/>
              Escríbenos y tendremos en cuenta tu interés para planificar las próximas ediciones.
            </p>
            <a href="https://wa.me/34969000000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 bg-pm-navy hover:bg-pm-navy-md text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Sugerir un taller por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-pm-red py-14 text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-4xl mb-3">🏅</div>
          <h2 className="text-2xl font-black mb-3">¿Eres alumno del Club?</h2>
          <p className="text-red-100 text-sm mb-6">
            Los socios del Club Deportivo Origen tienen acceso prioritario a los talleres intensivos.
            Consulta condiciones especiales.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/club"
              className="inline-block bg-white text-pm-red hover:bg-pm-red-light font-black px-8 py-3.5 rounded-xl transition-colors text-sm">
              Ver el Club →
            </Link>
            <a href="tel:+34969000000"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Llamar
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
