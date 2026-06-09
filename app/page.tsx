import Link from 'next/link'
import { waNegocio } from '@/lib/whatsapp'
import Hero from '@/components/home/Hero'
import Reveal from '@/components/home/Reveal'
import CountUp from '@/components/home/CountUp'
import { Foto } from '@/components/ui/Foto'

export const metadata = {
  title: 'Planeta Movimiento — Circo, deporte y ocio en Cuenca',
  description:
    'Centro de circo, acrobacia y movimiento en Cuenca. Club deportivo, cumpleaños, campamentos, eventos, talleres, excursiones y formación para todas las edades.',
  alternates: { canonical: '/' },
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const STATS = [
  { end: 2000, prefix: '+', suffix: '', label: 'Familias confían en nosotros' },
  { end: 15,   prefix: '', suffix: '+', label: 'Actividades diferentes' },
  { end: 10,   prefix: '', suffix: '+', label: 'Años de experiencia' },
  { end: 50,   prefix: '+', suffix: '', label: 'Eventos al año' },
]

const AUDIENCIAS = [
  { nombre: 'Familias', desc: 'Cumpleaños, campamentos y actividades para disfrutar juntos.', href: '/actividades', grad: 'from-pm-red to-pm-red-dark' },
  { nombre: 'Colegios y AMPAs', desc: 'Excursiones, extraescolares y programas educativos.', href: '/actividades', grad: 'from-blue-600 to-pm-navy' },
  { nombre: 'Empresas', desc: 'Team building, talleres y eventos corporativos.', href: '/actividades', grad: 'from-slate-700 to-pm-navy' },
  { nombre: 'Ayuntamientos', desc: 'Talleres y programas para eventos municipales.', href: '/actividades', grad: 'from-emerald-600 to-teal-700' },
]

const GALERIA = [
  { label: 'Acrobacia', foto: '/fotos/gimnasia-acrobatica/1.webp', grad: 'from-pm-red to-pm-red-dark' },
  { label: 'Telas aéreas', foto: '/fotos/telas-aereas/1.webp', grad: 'from-purple-600 to-indigo-800' },
  { label: 'Trampolín', foto: '/fotos/gimnasia-acrobatica/2.webp', grad: 'from-slate-700 to-pm-navy' },
  { label: 'Talleres', foto: '/fotos/talleres/1.webp', grad: 'from-amber-500 to-orange-600' },
  { label: 'Acrobacia', foto: '/fotos/gimnasia-acrobatica/3.webp', grad: 'from-emerald-600 to-teal-700' },
  { label: 'Talleres', foto: '/fotos/talleres/4.webp', grad: 'from-pink-500 to-pm-red' },
  { label: 'Aéreos', foto: '/fotos/telas-aereas/2.webp', grad: 'from-cyan-600 to-blue-700' },
  { label: 'Talleres', foto: '/fotos/talleres/7.webp', grad: 'from-slate-800 to-pm-navy-md' },
]

const RAZONES = [
  { titulo: 'Monitores certificados', desc: 'Profesionales titulados y con años de experiencia en circo y deporte.' },
  { titulo: 'Instalaciones seguras', desc: 'Material homologado, colchonetas profesionales y protocolos de seguridad.' },
  { titulo: 'Para todas las edades', desc: 'Desde los 2 años hasta adultos. Una actividad perfecta para cada etapa.' },
  { titulo: 'Metodología propia', desc: 'Aprendizaje a través del juego con la temática Escuela de Superhéroes.' },
]

const COLABORADORES = [
  { nombre: 'CADIG Crisol', tipo: 'Circo inclusivo' },
  { nombre: 'Residencia Sagrado Corazón', tipo: 'Envejecimiento activo' },
  { nombre: 'ARKHE', tipo: 'Formación juvenil' },
  { nombre: 'Academia Adamas', tipo: 'Jiu-Jitsu · Madrid' },
  { nombre: 'Club Deportivo Origen', tipo: 'Entidad deportiva' },
]

const RESENAS = [
  { nombre: 'María G.', rol: 'Madre', texto: 'El cumpleaños de mi hija fue increíble. Los monitores son súper profesionales y los niños no pararon de reír y moverse.', estrellas: 5 },
  { nombre: 'Carlos P.', rol: 'RRHH empresa', texto: 'Llevamos a nuestro equipo al taller de empresa y fue una experiencia transformadora. Cohesión total. 100% recomendable.', estrellas: 5 },
  { nombre: 'AMPA CEIP San Julián', rol: 'Centro educativo', texto: 'El multideporte extraescolar es un éxito entre los alumnos. Organización impecable y trato cercano con las familias.', estrellas: 5 },
]

export default function HomePage() {
  return (
    <main className="bg-white">

      {/* ════ HERO ════ */}
      <Hero />

      {/* ════ COLABORADORES / CONFIANZA ════ */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            Colaboramos con entidades de confianza
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {COLABORADORES.map(c => (
              <div key={c.nombre} className="flex flex-col items-center text-center">
                <span className="font-black text-pm-navy text-base">{c.nombre}</span>
                <span className="text-xs text-gray-400">{c.tipo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ ESTADÍSTICAS ════ */}
      <section className="relative bg-pm-navy py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-pm-red/15 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Una comunidad en movimiento</h2>
            <p className="text-white/50 text-base">Cifras que demuestran nuestra experiencia y compromiso</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-7 text-center backdrop-blur hover:bg-white/10 transition-colors">
                  <div className="text-4xl sm:text-5xl font-black text-white mb-2">
                    <CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="text-white/50 text-sm leading-tight">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ AUDIENCIAS ════ */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-pm-red text-xs font-black uppercase tracking-widest mb-3">¿Quién eres?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-pm-navy mb-3">Una experiencia para cada perfil</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Elige tu perfil y descubre las actividades pensadas para ti.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AUDIENCIAS.map((a, i) => (
              <Reveal key={a.nombre} delay={i * 70}>
                <Link href={a.href}
                  className={`group block h-full bg-gradient-to-br ${a.grad} rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                  <h3 className="text-lg font-black text-white mb-2">{a.nombre}</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">{a.desc}</p>
                  <span className="text-white text-sm font-bold inline-flex items-center gap-1.5">
                    Ver más
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ GALERÍA DINÁMICA (marquesina) ════ */}
      <section className="bg-pm-bg py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <Reveal className="text-center">
            <span className="inline-block text-pm-red text-xs font-black uppercase tracking-widest mb-3">Imagina la experiencia</span>
            <h2 className="text-3xl sm:text-4xl font-black text-pm-navy mb-3">Disciplinas que vas a vivir</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Un universo de movimiento esperándote.</p>
          </Reveal>
        </div>

        {/* Marquesina */}
        <div className="relative">
          {/* Difuminados laterales */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-pm-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-pm-bg to-transparent z-10 pointer-events-none" />

          <div className="marquee-track gap-5">
            {[...GALERIA, ...GALERIA].map((g, i) => (
              <div key={i} className="relative w-64 h-72 shrink-0 rounded-3xl overflow-hidden group cursor-default">
                <Foto src={g.foto} alt={g.label} gradient={g.grad} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 text-white font-black text-lg tracking-wide">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ POR QUÉ ELEGIRNOS ════ */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-pm-red text-xs font-black uppercase tracking-widest mb-3">La diferencia</span>
            <h2 className="text-3xl sm:text-4xl font-black text-pm-navy mb-3">¿Por qué Planeta Movimiento?</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RAZONES.map((r, i) => (
              <Reveal key={r.titulo} delay={i * 70}>
                <div className="h-full bg-pm-bg border border-gray-100 rounded-3xl p-6 hover:shadow-lg hover:border-pm-red/20 transition-all">
                  <div className="w-12 h-12 bg-pm-red-light rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-pm-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h3 className="font-black text-pm-navy text-base mb-2">{r.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ RESEÑAS ════ */}
      <section className="bg-pm-bg py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-pm-red text-xl">★</span>)}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-pm-navy mb-3">Lo que dicen de nosotros</h2>
            <p className="text-gray-500 text-base">Familias, colegios y empresas que ya confían en nosotros</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESENAS.map((r, i) => (
              <Reveal key={r.nombre} delay={i * 80}>
                <div className="h-full bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: r.estrellas }).map((_, j) => <span key={j} className="text-pm-red">★</span>)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">&ldquo;{r.texto}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-pm-navy rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                      {r.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="font-black text-pm-navy text-sm">{r.nombre}</div>
                      <div className="text-gray-400 text-xs">{r.rol}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA FINAL ════ */}
      <section className="relative bg-pm-red overflow-hidden py-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-orb" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pm-navy/30 rounded-full blur-[100px] animate-orb-rev" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              ¿Listo para empezar la aventura?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Reserva tu actividad o solicita información sin compromiso. Estamos deseando conocerte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ocio"
                className="bg-white text-pm-red hover:bg-pm-navy hover:text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl hover:-translate-y-0.5">
                Reservar ahora
              </Link>
              <a href={waNegocio('Hola 👋, me gustaría recibir información sobre las actividades de Planeta Movimiento.')} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-pm-navy/30 hover:bg-pm-navy/50 backdrop-blur border-2 border-white/30 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Solicitar información
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  )
}
