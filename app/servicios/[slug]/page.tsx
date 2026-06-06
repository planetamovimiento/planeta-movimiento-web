import Link from 'next/link'
import { waNegocio } from '@/lib/whatsapp'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

type ServicioData = {
  nombre: string
  descripcionLarga: string
  edadMin: number
  duracion: number
  precioBase: number
  icon: string
  color: 'pm-red' | 'pm-navy' | 'pm-navy-md'
  paquetes: { nombre: string; precio: number; incluye: string[]; destacado: boolean }[]
}

const SERVICIOS_DATA: Record<string, ServicioData> = {
  cumpleanos: {
    nombre: 'Cumpleaños circense',
    icon: '🎂',
    color: 'pm-red',
    edadMin: 4,
    duracion: 90,
    precioBase: 1500,
    descripcionLarga:
      'Celebra el día más especial de tu hijo con una fiesta de cumpleaños única llena de circo, acrobacia y magia. Nuestros monitores especializados crean una experiencia memorable para los niños y sus familias. Incluye actividades adaptadas a la edad de los participantes y un ambiente completamente temático.',
    paquetes: [
      { nombre: 'Básico', precio: 1500, destacado: false, incluye: ['Monitor circense', 'Materiales', '90 min de actividad', 'Seguro incluido'] },
      { nombre: 'Fiesta', precio: 2200, destacado: true, incluye: ['Monitor circense', 'Materiales', '90 min de actividad', 'Seguro', 'Decoración temática', 'Zona merienda'] },
      { nombre: 'Premium', precio: 3000, destacado: false, incluye: ['2 monitores', 'Materiales', '120 min', 'Seguro', 'Decoración', 'Zona merienda', 'Fotografías', 'Diplomas'] },
    ],
  },
  malabares: {
    nombre: 'Malabares',
    icon: '🎪',
    color: 'pm-navy',
    edadMin: 6,
    duracion: 60,
    precioBase: 1200,
    descripcionLarga:
      'Aprende a manejar pelotas, clavas, aros y pañuelos con nuestros expertos en malabares. Las clases se adaptan a todos los niveles, desde iniciación hasta técnicas avanzadas de circo. Un arte que mejora la coordinación, la concentración y la expresión corporal de forma divertida.',
    paquetes: [
      { nombre: 'Clase suelta', precio: 1200, destacado: false, incluye: ['1 sesión 60 min', 'Monitor', 'Materiales'] },
      { nombre: 'Bono 5 clases', precio: 5000, destacado: true, incluye: ['5 sesiones', 'Monitor', 'Materiales', 'Progresión personalizada'] },
      { nombre: 'Bono mensual', precio: 8000, destacado: false, incluye: ['Clases semanales', 'Monitor', 'Materiales', 'Seguimiento de nivel', 'Seguro'] },
    ],
  },
  trapecio: {
    nombre: 'Trapecio y aéreos',
    icon: '🎡',
    color: 'pm-navy',
    edadMin: 8,
    duracion: 75,
    precioBase: 1500,
    descripcionLarga:
      'Descubre la libertad de las disciplinas aéreas: trapecio fijo, tela aérea y cuerda. Con nuestros monitores titulados en artes aéreas y equipos de seguridad homologados, aprenderás a volar de forma segura y progresiva. Una experiencia transformadora que desarrolla fuerza, flexibilidad y confianza.',
    paquetes: [
      { nombre: 'Clase prueba', precio: 1500, destacado: false, incluye: ['1 sesión 75 min', 'Monitor aéreo', 'Equipo de seguridad'] },
      { nombre: 'Iniciación (4 clases)', precio: 5500, destacado: true, incluye: ['4 sesiones', 'Monitor', 'Equipo seguridad', 'Progresión guiada'] },
      { nombre: 'Mensual avanzado', precio: 9500, destacado: false, incluye: ['Clases semanales', 'Monitor', 'Equipo', 'Coreografía', 'Seguro deportivo'] },
    ],
  },
  equilibrio: {
    nombre: 'Equilibrio y contorsión',
    icon: '⚖️',
    color: 'pm-navy',
    edadMin: 6,
    duracion: 60,
    precioBase: 1200,
    descripcionLarga:
      'Las disciplinas de equilibrio y contorsión trabajan la flexibilidad, la fuerza y el control corporal de manera progresiva y segura. Aprende equilibrios estáticos, contorsión suave y técnicas de yoga circense con nuestros monitores especializados. Apto para todas las edades y niveles de flexibilidad.',
    paquetes: [
      { nombre: 'Clase suelta', precio: 1200, destacado: false, incluye: ['1 sesión 60 min', 'Monitor', 'Materiales'] },
      { nombre: 'Bono 5 clases', precio: 5000, destacado: true, incluye: ['5 sesiones', 'Monitor', 'Materiales', 'Plan de progresión'] },
      { nombre: 'Mensual', precio: 4500, destacado: false, incluye: ['4 clases/mes', 'Monitor', 'Seguimiento', 'Seguro'] },
    ],
  },
  acrobacia: {
    nombre: 'Acrobacia de suelo',
    icon: '🤸',
    color: 'pm-red',
    edadMin: 4,
    duracion: 60,
    precioBase: 1200,
    descripcionLarga:
      'Clases de acrobacia de suelo con monitores titulados. Aprende volteretas, equilibrios, pirámides humanas y mucho más en un ambiente seguro y motivador. Ideal para niños y adultos que quieran mejorar su capacidad física, coordinación y trabajo en equipo a través del juego acrobático.',
    paquetes: [
      { nombre: 'Clase suelta', precio: 1200, destacado: false, incluye: ['1 sesión 60 min', 'Monitor', 'Colchonetas'] },
      { nombre: 'Bono 5 clases', precio: 5000, destacado: true, incluye: ['5 sesiones', 'Monitor', 'Material', 'Progresión de nivel'] },
      { nombre: 'Club mensual', precio: 4500, destacado: false, incluye: ['Clases semanales', 'Monitor', 'Seguro deportivo', 'Comunidad'] },
    ],
  },
  talleres: {
    nombre: 'Talleres de circo',
    icon: '🎨',
    color: 'pm-navy',
    edadMin: 5,
    duracion: 90,
    precioBase: 1200,
    descripcionLarga:
      'Talleres puntuales abiertos al público donde puedes probar diferentes disciplinas del circo en una sola sesión. Perfectos para quienes quieren descubrir el mundo circense sin compromiso. Malabares, acrobacia, equilibrio y mucho más en 90 minutos de pura diversión.',
    paquetes: [
      { nombre: 'Taller individual', precio: 1200, destacado: false, incluye: ['90 min', 'Monitor', 'Materiales', 'Todas las edades'] },
      { nombre: 'Taller en pareja', precio: 2000, destacado: true, incluye: ['90 min', 'Monitor', 'Materiales', 'Descuento del 17%'] },
      { nombre: 'Taller familiar', precio: 3500, destacado: false, incluye: ['90 min', 'Monitor', 'Materiales', 'Hasta 4 personas'] },
    ],
  },
  eventos: {
    nombre: 'Animación para eventos',
    icon: '🎉',
    color: 'pm-red',
    edadMin: 3,
    duracion: 120,
    precioBase: 3000,
    descripcionLarga:
      'Llevamos el circo a tu evento: bodas, comuniones, ferias, inauguraciones y cualquier celebración que quieras hacer especial. Nuestros artistas y monitores ofrecen espectáculos y talleres interactivos que sorprenden y entretienen a todo tipo de público. Personalización total según el concepto de tu evento.',
    paquetes: [
      { nombre: 'Show 1h', precio: 3000, destacado: false, incluye: ['1h de espectáculo', '1-2 artistas', 'Vestuario profesional'] },
      { nombre: 'Show + Taller', precio: 5000, destacado: true, incluye: ['Show 1h', 'Taller participativo 1h', '2-3 artistas', 'Materiales'] },
      { nombre: 'Evento completo', precio: 8500, destacado: false, incluye: ['Show personalizado', 'Talleres todo el día', '4+ artistas', 'Coordinación técnica'] },
    ],
  },
  campamentos: {
    nombre: 'Campamentos de verano',
    icon: '⛺',
    color: 'pm-navy',
    edadMin: 6,
    duracion: 480,
    precioBase: 9500,
    descripcionLarga:
      'Semanas completas de campamento circense en Cuenca. Los niños viven una experiencia única de convivencia, aprendizaje y diversión rodeados de naturaleza y artes circenses. Actividades de circo, juegos cooperativos, talleres creativos y mucho más con monitores especializados las 24 horas.',
    paquetes: [
      { nombre: 'Semana básica', precio: 9500, destacado: false, incluye: ['5 días', 'Alojamiento', 'Manutención', 'Actividades', 'Monitor 24h'] },
      { nombre: 'Semana completa', precio: 12000, destacado: true, incluye: ['5 días', 'Alojamiento', 'Manutención completa', 'Actividades', 'Monitor 24h', 'Excursión', 'Fotografías'] },
      { nombre: '2 semanas', precio: 20000, destacado: false, incluye: ['10 días', 'Todo incluido', 'Diploma', 'Vídeo recuerdo', 'Descuento del 12%'] },
    ],
  },
  colegios: {
    nombre: 'Programas para colegios',
    icon: '🏫',
    color: 'pm-navy',
    edadMin: 5,
    duracion: 60,
    precioBase: 800,
    descripcionLarga:
      'Programas pedagógicos de circo y acrobacia diseñados para complementar el currículo escolar. Trabajamos la psicomotricidad, el trabajo en equipo y la expresión corporal a través de actividades circenses adaptadas a cada etapa educativa. Disponible como visita de un día, programa trimestral o extraescolar semanal.',
    paquetes: [
      { nombre: 'Visita de un día', precio: 800, destacado: false, incluye: ['Jornada completa', 'Monitor', 'Materiales', 'Seguro', '20-30 alumnos'] },
      { nombre: 'Trimestral (10 ses.)', precio: 6000, destacado: true, incluye: ['10 sesiones 60 min', 'Monitor', 'Materiales', 'Informe progreso'] },
      { nombre: 'Campamento escolar', precio: 12000, destacado: false, incluye: ['3-5 días', 'Alojamiento', 'Manutención', 'Monitores 24h', 'Seguro completo'] },
    ],
  },
  'campamentos-escolares': {
    nombre: 'Campamentos escolares',
    icon: '🏕️',
    color: 'pm-navy',
    edadMin: 8,
    duracion: 480,
    precioBase: 12000,
    descripcionLarga:
      'Campamentos de convivencia para grupos escolares con actividades circenses como eje vertebrador. Una experiencia de 3 a 5 días que refuerza los lazos entre compañeros, desarrolla la autonomía y fomenta valores como la cooperación y el respeto. Diseñado junto al profesorado para complementar el proyecto educativo del centro.',
    paquetes: [
      { nombre: '3 días', precio: 12000, destacado: false, incluye: ['3 días', 'Alojamiento', 'Manutención', 'Actividades', 'Monitor 24h', 'Seguro'] },
      { nombre: '5 días', precio: 18000, destacado: true, incluye: ['5 días', 'Todo incluido', 'Taller final', 'Diploma', 'Fotografías'] },
      { nombre: 'Personalizado', precio: 20000, destacado: false, incluye: ['A medida', 'Planificación con el centro', 'Contenido curricular', 'Informe final'] },
    ],
  },
  extraescolares: {
    nombre: 'Extraescolares de circo',
    icon: '🎓',
    color: 'pm-navy-md',
    edadMin: 5,
    duracion: 60,
    precioBase: 600,
    descripcionLarga:
      'Impartimos actividades extraescolares de circo directamente en tu colegio. Nuestros monitores se desplazan con todo el material necesario para ofrecer una actividad semanal de 60 minutos con grupos de 8 a 20 alumnos. Disponible desde iniciación hasta niveles avanzados, adaptando el programa al ciclo educativo.',
    paquetes: [
      { nombre: 'Trimestral', precio: 6000, destacado: false, incluye: ['10 sesiones', 'Monitor', 'Materiales', 'Seguro'] },
      { nombre: 'Semestral', precio: 10000, destacado: true, incluye: ['20 sesiones', 'Monitor', 'Materiales', 'Seguro', 'Evaluación de progreso'] },
      { nombre: 'Anual', precio: 18000, destacado: false, incluye: ['Curso completo', 'Monitor', 'Materiales', 'Seguro', 'Festival fin de curso'] },
    ],
  },
  'team-building': {
    nombre: 'Team Building Circense',
    icon: '🤝',
    color: 'pm-red',
    edadMin: 18,
    duracion: 120,
    precioBase: 3000,
    descripcionLarga:
      'Actividades de team building basadas en el circo y la acrobacia que generan cohesión real entre los miembros del equipo. Malabares en grupo, pirámides humanas, retos de coordinación y confianza ciega. Una experiencia que mejora la comunicación, derriba jerarquías y crea recuerdos compartidos que fortalecen el equipo.',
    paquetes: [
      { nombre: 'Básico (2h)', precio: 3000, destacado: false, incluye: ['2h de actividad', 'Monitor', 'Materiales', 'Diploma', 'Hasta 20 personas'] },
      { nombre: 'Estándar (3h)', precio: 4500, destacado: true, incluye: ['3h de actividad', 'Monitor', 'Materiales', 'Diploma', 'Fotos', 'Hasta 40 personas'] },
      { nombre: 'Premium (día)', precio: 8500, destacado: false, incluye: ['Día completo', '2 monitores', 'Materiales', 'Diploma', 'Fotos y vídeo', 'Comida incluida'] },
    ],
  },
  'eventos-corporativos': {
    nombre: 'Eventos corporativos',
    icon: '🏢',
    color: 'pm-navy',
    edadMin: 18,
    duracion: 180,
    precioBase: 5000,
    descripcionLarga:
      'Dotamos a tus eventos corporativos de una dimensión única con espectáculos de circo, animación interactiva y talleres participativos. Adaptamos el concepto al mensaje de tu empresa: lanzamientos de producto, cenas de empresa, ferias y congresos. Profesionalidad artística con coordinación logística completa.',
    paquetes: [
      { nombre: 'Animación (2h)', precio: 5000, destacado: false, incluye: ['Show 1h', 'Zona interactiva 1h', '2 artistas', 'Vestuario'] },
      { nombre: 'Evento completo', precio: 8000, destacado: true, incluye: ['Show personalizado', 'Talleres participativos', '3-4 artistas', 'Coordinación técnica', 'Fotos'] },
      { nombre: 'Gala premium', precio: 15000, destacado: false, incluye: ['Show exclusivo', 'Toda la noche', 'Equipo completo', 'Dirección artística', 'Vídeo'] },
    ],
  },
  formacion: {
    nombre: 'Formación especializada',
    icon: '📚',
    color: 'pm-navy-md',
    edadMin: 16,
    duracion: 120,
    precioBase: 4500,
    descripcionLarga:
      'Programas de formación especializada en artes circenses para profesionales de la educación, el ocio y el deporte. Aprende a dirigir talleres de circo, a utilizar las artes del movimiento como herramienta pedagógica y a gestionar grupos con dinámicas circenses. Formación certificada con prácticas incluidas.',
    paquetes: [
      { nombre: 'Taller intensivo (1 día)', precio: 4500, destacado: false, incluye: ['8h formación', 'Material didáctico', 'Certificado asistencia'] },
      { nombre: 'Curso básico (20h)', precio: 18000, destacado: true, incluye: ['20h teórico-prácticas', 'Material', 'Certificado', 'Prácticas supervisadas'] },
      { nombre: 'Formación completa', precio: 35000, destacado: false, incluye: ['50h formación', 'Material completo', 'Diploma oficial', 'Bolsa de trabajo'] },
    ],
  },
}

type Props = { params: Promise<{ slug: string }> }

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params
  const servicio = SERVICIOS_DATA[slug]

  if (!servicio) {
    notFound()
  }

  const heroBg =
    servicio.color === 'pm-red' ? 'bg-pm-red' :
    servicio.color === 'pm-navy-md' ? 'bg-pm-navy-md' :
    'bg-pm-navy'

  return (
    <main>
      {/* HERO */}
      <section className={`${heroBg} text-white py-16 px-4 border-t-4 border-pm-red`}>
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-300 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link>
            <span>›</span>
            <span className="text-white">{servicio.nombre}</span>
          </nav>
          <div className="text-5xl mb-4">{servicio.icon}</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{servicio.nombre}</h1>
          <p className="text-gray-200 text-lg max-w-2xl mb-8">{servicio.descripcionLarga}</p>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="bg-white/15 px-4 py-2 rounded-full text-sm font-medium">⏱ {servicio.duracion} min</span>
            <span className="bg-white/15 px-4 py-2 rounded-full text-sm font-medium">🧒 Desde {servicio.edadMin} años</span>
            <span className="bg-white/15 px-4 py-2 rounded-full text-sm font-medium">Desde {formatPrice(servicio.precioBase)}</span>
          </div>
          <Link href="/reservar" className="inline-block bg-pm-red hover:bg-pm-red-dark text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg">
            Reservar ahora
          </Link>
        </div>
      </section>

      {/* PAQUETES */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-pm-navy mb-3 text-center">Paquetes disponibles</h2>
          <p className="text-gray-500 text-center mb-10">Elige el que mejor se adapte a lo que necesitas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicio.paquetes.map((p) => (
              <div
                key={p.nombre}
                className={`relative rounded-2xl border-2 p-6 ${p.destacado ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 bg-white'}`}
              >
                {p.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Más popular
                  </span>
                )}
                <h3 className="text-xl font-black text-pm-navy mb-1">{p.nombre}</h3>
                <div className="text-3xl font-black text-pm-red mb-4">{formatPrice(p.precio)}</div>
                <ul className="space-y-2 mb-6">
                  {p.incluye.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/reservar"
                  className={`block text-center py-2.5 rounded-xl font-bold transition-colors ${
                    p.destacado
                      ? 'bg-pm-red text-white hover:bg-pm-red-dark'
                      : 'border-2 border-pm-navy text-pm-navy hover:bg-pm-navy hover:text-white'
                  }`}
                >
                  Seleccionar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="bg-pm-bg py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">🧒</div>
              <div className="font-bold text-pm-navy text-lg mb-1">Edad mínima</div>
              <div className="text-gray-500">{servicio.edadMin} años</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">⏱</div>
              <div className="font-bold text-pm-navy text-lg mb-1">Duración</div>
              <div className="text-gray-500">{servicio.duracion} minutos</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pm-red py-14 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3">¿Tienes dudas? Llámanos</h2>
          <p className="text-red-100 mb-6">Estaremos encantados de ayudarte a elegir la mejor opción</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+34657604665" className="text-2xl font-black hover:underline">657 604 665</a>
            <a
              href={waNegocio(`Hola 👋, me gustaría recibir información sobre ${servicio.nombre} de Planeta Movimiento.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
