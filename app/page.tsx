import Link from 'next/link'

const servicios = [
  { nombre: 'Cumpleaños', slug: 'cumpleanos', desc: 'Celebra el día más especial con nuestras actividades de circo y acrobacia.', color: 'bg-pm-red', icon: '🎂' },
  { nombre: 'Campamentos', slug: 'campamentos', desc: 'Campamentos de verano e invierno llenos de movimiento, juego y diversión.', color: 'bg-pm-navy', icon: '⛺' },
  { nombre: 'Acrobacia', slug: 'acrobacia', desc: 'Aprende técnicas de acrobacia de suelo y aérea con nuestros monitores.', color: 'bg-pm-navy-md', icon: '🤸' },
  { nombre: 'Circo', slug: 'circo', desc: 'Malabares, trapecio y habilidades circenses para todas las edades.', color: 'bg-pm-red-dark', icon: '🎪' },
]

const audiencias = [
  { nombre: 'Familias', desc: 'Actividades para disfrutar juntos, desde los más pequeños hasta adultos.', color: 'bg-pm-navy', icon: '👨‍👩‍👧‍👦' },
  { nombre: 'Colegios', desc: 'Programas educativos que combinan deporte, creatividad y trabajo en equipo.', color: 'bg-pm-red', icon: '🏫' },
  { nombre: 'Empresas', desc: 'Team building y actividades de cohesión para equipos de trabajo.', color: 'bg-pm-navy-md', icon: '🏢' },
]

const razones = [
  { titulo: 'Seguridad ante todo', desc: 'Instalaciones homologadas y monitores certificados para una experiencia segura.' },
  { titulo: 'Todas las edades', desc: 'Desde 3 años hasta adultos. Tenemos la actividad perfecta para cada etapa.' },
  { titulo: 'En el corazón de Cuenca', desc: 'Ubicados en Cuenca, accesibles y con amplias instalaciones.' },
  { titulo: '9+ años de experiencia', desc: 'Casi una década creando experiencias únicas de movimiento y circo.' },
]

const resenas = [
  { nombre: 'María G.', texto: 'El cumpleaños de mi hija fue increíble. Los monitores son super profesionales y los niños se lo pasaron genial.', estrellas: 5 },
  { nombre: 'Carlos P.', texto: 'Llevamos a nuestro equipo al taller de empresa y fue una experiencia transformadora. 100% recomendable.', estrellas: 5 },
]

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-pm-navy border-t-4 border-pm-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-flex items-center gap-2 border border-pm-red/40 bg-pm-red/10 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-pm-red rounded-full"></span>
            Centro de referencia en Cuenca
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
            Aprende jugando,<br />
            <em className="text-pm-red not-italic">muévete sin límites</em>
          </h1>

          <p className="text-white/55 text-lg max-w-2xl mx-auto mb-10">
            Actividades de circo, acrobacia y movimiento para niños, jóvenes y adultos en Cuenca.
            Diversión, aprendizaje y salud en un mismo espacio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/reservar" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-3.5 rounded-full transition-colors">
              Reservar ahora
            </Link>
            <Link href="#servicios" className="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-full transition-colors">
              Ver actividades
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
            {[
              { valor: '+2K', label: 'Familias' },
              { valor: '15+', label: 'Actividades' },
              { valor: '9+', label: 'Años' },
            ].map(({ valor, label }) => (
              <div key={label} className="px-10 py-4 sm:py-0">
                <div className="text-3xl font-black text-white">{valor}</div>
                <div className="text-white/50 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiencia */}
      <section className="bg-pm-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-12">
            Encuentra tu actividad perfecta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {audiencias.map((a) => (
              <div key={a.nombre} className={`${a.color} text-white rounded-2xl p-8 flex flex-col gap-4 cursor-pointer hover:scale-105 transition-transform`}>
                <span className="text-4xl">{a.icon}</span>
                <div>
                  <h3 className="text-xl font-bold mb-2">{a.nombre}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">{a.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold">
                  Ver actividades <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios estrella */}
      <section id="servicios" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-12">
            Nuestras actividades estrella
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {servicios.map((s) => (
              <Link key={s.slug} href={`/servicios/${s.slug}`}
                className={`${s.color} text-white rounded-2xl p-8 flex flex-col gap-3 hover:scale-[1.02] transition-transform`}>
                <span className="text-3xl">{s.icon}</span>
                <h3 className="text-xl font-bold">{s.nombre}</h3>
                <p className="text-white/75 text-sm leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>

          {/* Featured card */}
          <div className="bg-pm-navy rounded-2xl overflow-hidden flex flex-col sm:flex-row">
            <div className="flex-1 p-10">
              <span className="inline-flex items-center gap-2 bg-pm-red/20 text-pm-red text-xs font-bold px-3 py-1 rounded-full mb-4">
                Nuevo — reserva online
              </span>
              <h3 className="text-2xl font-black text-white mb-3">Club de Movimiento</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-6">
                Clases semanales de acrobacia, malabares y circo. Apúntate a nuestro club y progresa a tu ritmo con monitores especializados.
              </p>
              <Link href="/reservar" className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors inline-block">
                Reservar plaza
              </Link>
            </div>
            <div className="sm:w-64 bg-pm-red flex items-center justify-center p-10">
              <span className="text-6xl">🎡</span>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="bg-pm-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {razones.map((r) => (
              <div key={r.titulo} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="w-10 h-10 bg-pm-red/20 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-4 h-4 bg-pm-red rounded-full"></div>
                </div>
                <h3 className="text-white font-bold mb-2">{r.titulo}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section className="bg-pm-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-12">
            Lo que dicen nuestras familias
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {resenas.map((r) => (
              <div key={r.nombre} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pm-navy rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {r.nombre.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-pm-navy text-sm">{r.nombre}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.estrellas }).map((_, i) => (
                        <span key={i} className="text-pm-red text-sm">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{r.texto}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-pm-red py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">¿Listo para empezar?</h2>
          <p className="text-white/80 mb-8">Reserva tu actividad en minutos y únete a nuestra comunidad.</p>
          <Link href="/reservar" className="bg-white text-pm-red hover:bg-pm-red-light font-bold px-10 py-3.5 rounded-full transition-colors inline-block">
            Hacer una reserva
          </Link>
        </div>
      </section>
    </main>
  )
}
