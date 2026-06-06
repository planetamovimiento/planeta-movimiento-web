import Link from 'next/link'
import { waNegocio } from '@/lib/whatsapp'
import { Foto } from '@/components/ui/Foto'

export const metadata = {
  title: 'Club Deportivo Origen — Circo y Acrobacia en Cuenca',
  description:
    'El Club Deportivo Origen ofrece clases semanales de circo, acrobacia, aéreos, jiu-jitsu y bienestar en Cuenca. Deporte, salud, inclusión y comunidad para todas las edades.',
}

// ─── Disciplinas del Club ─────────────────────────────────────────────────────
const DISCIPLINAS = [
  {
    nombre: 'Gimnasia Acrobática',
    desc: 'Técnica de suelo, volteos, figuras y composición corporal en grupo. Disciplina reglada con progresión por niveles.',
    edad: 'Desde 4 años', foto: '/fotos/gimnasia-acrobatica/1.webp', grad: 'from-pm-red to-pm-red-dark',
    href: '/servicios/gimnasia-acrobatica',
  },
  {
    nombre: 'Parkour',
    desc: 'Desplazamiento acrobático: saltos, equilibrios y control del cuerpo en el espacio. Superación y confianza.',
    edad: 'Desde 6 años', foto: '', grad: 'from-slate-700 to-pm-navy',
    href: '#inscripcion',
  },
  {
    nombre: 'Telas Aéreas',
    desc: 'Técnica aérea en tela: figuras, envolturas y trabajo de altura con progresión adaptada y total seguridad.',
    edad: 'Desde 6 años', foto: '/fotos/telas-aereas/1.webp', grad: 'from-purple-700 to-indigo-800',
    href: '/servicios/telas-aereas',
  },
  {
    nombre: 'Escuela Infantil',
    desc: 'Movimiento, psicomotricidad y primeras habilidades circenses para los más pequeños a través del juego.',
    edad: '3 a 5 años', foto: '', grad: 'from-amber-400 to-orange-500',
    href: '/servicios/escuela-infantil',
  },
  {
    nombre: 'Escuela de Bienestar',
    desc: 'Pilates, Yoga y Baile para adultos. Cuerpo y mente en equilibrio, lunes, miércoles y viernes.',
    edad: 'Adultos', foto: '', grad: 'from-teal-600 to-cyan-700',
    href: '/servicios/escuela-bienestar',
  },
  {
    nombre: 'Jiu-Jitsu Brasileño',
    desc: 'Arte marcial de suelo en colaboración con Academia Adamas (Madrid). Disciplina, técnica y confianza. Sábados 11:30-13:30.',
    edad: '+16 años · 60 €/mes', foto: '', grad: 'from-slate-800 to-pm-navy',
    href: '/servicios/jiu-jitsu',
  },
  {
    nombre: 'Circo Inclusivo',
    desc: 'Circo adaptado y psicomotricidad para personas con discapacidad intelectual. Inclusión real a través del movimiento. Con CADIG Crisol.',
    edad: 'Adultos', foto: '', grad: 'from-indigo-700 to-purple-800',
    href: '/servicios/circo-inclusivo',
  },
]

const NIVELES = [
  { nombre: 'Iniciación',  desc: 'Primeros pasos. Sin experiencia necesaria. Juego y descubrimiento.', color: 'bg-gray-100 border-gray-300',  text: 'text-gray-700' },
  { nombre: 'Intermedio',  desc: 'Consolidación de habilidades básicas. Pequeñas rutinas y combinaciones.', color: 'bg-pm-red-light border-pm-red/30', text: 'text-pm-red' },
  { nombre: 'Avanzado',    desc: 'Técnica depurada, combinaciones complejas y trabajo coreográfico.', color: 'bg-pm-red/80 border-pm-red', text: 'text-white' },
  { nombre: 'Competición', desc: 'Preparación para exhibiciones y competiciones. Entrenamientos intensivos.', color: 'bg-pm-red border-pm-red-dark', text: 'text-white' },
]

const VALORES = [
  { titulo: 'Salud y deporte', desc: 'Actividad física real que mejora la condición, la coordinación y los hábitos de vida saludables.' },
  { titulo: 'Desarrollo personal', desc: 'Cada reto superado refuerza la confianza, la autoestima y la autonomía de quien lo vive.' },
  { titulo: 'Inclusión social', desc: 'Un espacio abierto a todas las personas, edades y capacidades, donde todo el mundo tiene su lugar.' },
  { titulo: 'Educación en valores', desc: 'Aprendemos esfuerzo, respeto, paciencia y trabajo en equipo a través del movimiento.' },
  { titulo: 'Bienestar', desc: 'Cuerpo y mente en equilibrio: el movimiento como herramienta para sentirse mejor cada día.' },
  { titulo: 'Comunidad', desc: 'Más que clases: una comunidad que crece junta y comparte la pasión por el movimiento.' },
]

function TarjetaDisciplina({ d }: { d: typeof DISCIPLINAS[0] }) {
  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <Foto src={d.foto} alt={d.nombre} gradient={d.grad} className="h-28" />
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="font-black text-pm-navy text-base">{d.nombre}</h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1">{d.desc}</p>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs bg-pm-bg border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{d.edad}</span>
          <Link href={d.href} className="text-xs font-black text-pm-red flex items-center gap-1 hover:gap-2 transition-all">
            Apuntarse
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ClubPage() {
  return (
    <main className="bg-pm-bg min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-pm-navy text-white py-20 border-t-4 border-pm-red">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Club</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-pm-red text-white text-xs font-black px-3 py-1 rounded-full mb-5">
                Temporada 2025-26 abierta
              </span>
              <div className="text-pm-red text-sm font-black uppercase tracking-widest mb-2">Deporte · Salud · Comunidad</div>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
                Club Deportivo<br/>Origen
              </h1>
              <p className="text-white/65 text-base leading-relaxed mb-8 max-w-lg">
                Acercamos el circo, la acrobacia y el movimiento a todas las edades como herramienta de salud,
                inclusión y crecimiento personal. Más que un club: una comunidad en movimiento.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#disciplinas" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
                  Ver disciplinas
                </a>
                <a href="#inscripcion" className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-6 py-3.5 rounded-xl transition-colors text-sm">
                  Apuntarse al club
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: '7', label: 'Disciplinas' },
                { valor: '4', label: 'Niveles de progresión' },
                { valor: 'Todas', label: 'Edades y capacidades' },
                { valor: '+10', label: 'Años de experiencia' },
              ].map(({ valor, label }) => (
                <div key={label} className="bg-white/5 border border-white/15 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-black text-white">{valor}</div>
                  <div className="text-white/50 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUÉ ES EL CLUB ── */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">Nuestra esencia</div>
          <h2 className="text-3xl font-black text-pm-navy mb-5">El movimiento que transforma</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            El Club Deportivo Origen nació para demostrar que el circo y el deporte pueden cambiar vidas. A través del
            movimiento trabajamos la <strong className="text-pm-navy">salud física</strong>, el
            <strong className="text-pm-navy"> desarrollo personal</strong>, la
            <strong className="text-pm-navy"> educación en valores</strong> y la
            <strong className="text-pm-navy"> inclusión</strong> de todas las personas.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Desarrollamos nuestras clases en las instalaciones de Planeta Movimiento, con quien colaboramos para que
            cada alumno disfrute del mejor espacio y material. Aquí cada pequeño logro se celebra y cada persona crece a su ritmo.
          </p>
        </div>
      </section>

      {/* ── VALORES / IMPACTO ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Lo que aporta formar parte del Club</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-xl mx-auto">El movimiento como motor de salud, aprendizaje y comunidad</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALORES.map(v => (
              <div key={v.titulo} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-pm-red-light rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-pm-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="font-black text-pm-navy text-base mb-2">{v.titulo}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCIPLINAS ── */}
      <section className="bg-white py-16" id="disciplinas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-pm-navy mb-3">Disciplinas del Club</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Clases semanales impartidas por monitores especializados. Elige tu disciplina o combina varias.
              Grupos reducidos y progresión personalizada.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DISCIPLINAS.map(d => <TarjetaDisciplina key={d.nombre} d={d} />)}
          </div>
        </div>
      </section>

      {/* ── NIVELES ── */}
      <section className="bg-pm-bg py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-pm-navy text-center mb-3">Sistema de niveles</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Progresa de forma estructurada con objetivos claros en cada etapa</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {NIVELES.map((nivel, i) => (
              <div key={nivel.nombre} className="relative">
                {i < NIVELES.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[55%] w-full h-0.5 bg-gray-200 z-0"/>
                )}
                <div className={`relative z-10 border-2 rounded-2xl p-6 h-full ${nivel.color}`}>
                  <div className={`text-xs font-black uppercase tracking-wider mb-1 opacity-60 ${nivel.text}`}>Nivel {i + 1}</div>
                  <div className={`font-black text-lg mb-2 ${nivel.text}`}>{nivel.nombre}</div>
                  <p className={`text-sm opacity-80 ${nivel.text}`}>{nivel.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA INSCRIPCIÓN ── */}
      <section className="bg-pm-red py-16 text-white text-center" id="inscripcion">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-black mb-3">Únete al Club Deportivo Origen</h2>
          <p className="text-red-100 text-sm mb-8">
            Las plazas son limitadas. Ponte en contacto con nosotros y te informamos de disponibilidad, horarios y cuotas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+34657604665"
              className="inline-flex items-center justify-center gap-2 bg-white text-pm-red font-black px-8 py-3.5 rounded-xl transition-colors hover:bg-pm-red-light text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              657 604 665
            </a>
            <a href={waNegocio('Hola 👋, me gustaría recibir información sobre las actividades del Club Deportivo Origen.')} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
