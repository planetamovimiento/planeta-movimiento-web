import Link from 'next/link'

export const metadata = {
  title: 'Términos y Condiciones — Planeta Movimiento',
  description: 'Términos y condiciones de uso y contratación del sitio web de Planeta Movimiento (Planeta Carlos S.L.).',
  robots: { index: true, follow: true },
}

// Datos del titular — actualizar aquí si cambian
const TITULAR = {
  empresa: 'Planeta Carlos S.L.',
  marca: 'Planeta Movimiento',
  nif: 'B16346256',
  domicilio: 'Polígono Los Palancares, 8, 16004 Cuenca (España)',
  telefonos: '657 604 665',
  email: 'info@planetamovimiento.com',
  instalaciones: 'Polígono Los Palancares, 8, 16004 Cuenca',
}

const ACTUALIZACION = '6 de junio de 2026'

export default function TerminosPage() {
  return (
    <main className="bg-pm-bg min-h-screen">
      {/* Cabecera */}
      <section className="bg-pm-navy text-white py-14 border-t-4 border-pm-red">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Términos y Condiciones</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Términos y Condiciones</h1>
          <p className="text-white/60 text-sm">Última actualización: {ACTUALIZACION}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-8 text-[15px] leading-relaxed text-gray-700">

          {/* 1. Titular */}
          <Section n="1" titulo="Titular del sitio web">
            <p>
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
              Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular:
            </p>
            <ul className="mt-3 space-y-1">
              <li><strong>Titular:</strong> {TITULAR.empresa}, que opera bajo la marca «{TITULAR.marca}».</li>
              <li><strong>NIF:</strong> {TITULAR.nif}</li>
              <li><strong>Domicilio social:</strong> {TITULAR.domicilio}</li>
              <li><strong>Teléfono:</strong> {TITULAR.telefonos}</li>
              <li><strong>Correo electrónico:</strong> {TITULAR.email}</li>
              <li><strong>Instalaciones / lugar habitual de actividad:</strong> {TITULAR.instalaciones}</li>
            </ul>
          </Section>

          {/* 2. Objeto */}
          <Section n="2" titulo="Objeto y alcance">
            <p>
              Las presentes condiciones regulan el acceso y uso del sitio web de {TITULAR.marca} así como la
              contratación y/o reserva de las actividades, servicios y eventos ofrecidos a través del mismo.
              El uso del sitio web atribuye la condición de usuario e implica la aceptación plena de estas condiciones.
            </p>
          </Section>

          {/* 3. Dos tipos de actividad */}
          <Section n="3" titulo="Actividades del Club Deportivo y servicios de la empresa">
            <p>
              En este sitio conviven dos tipos de actividad con gestión diferenciada:
            </p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong>Actividades del Club Deportivo Origen</strong> (clases regulares como gimnasia acrobática,
                aéreos, escuela infantil, jiu-jitsu, bienestar o circo inclusivo): se gestionan mediante
                <strong> solicitud de inscripción</strong> y alta manual. No constituyen una compra ni reserva
                automática a través del sitio web.
              </li>
              <li>
                <strong>Servicios de la empresa</strong> (cumpleaños, campamentos, eventos, talleres, excursiones,
                extraescolares, productos y demás): pueden contratarse o reservarse en línea, o mediante solicitud de
                presupuesto, según se indique en cada ficha.
              </li>
            </ul>
          </Section>

          {/* 4. Uso del sitio */}
          <Section n="4" titulo="Uso del sitio web">
            <p>
              El acceso al sitio es gratuito, salvo el coste de la conexión a través de la red de telecomunicaciones.
              El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos con fines ilícitos,
              lesivos para terceros, ni de forma que pueda dañar, inutilizar o interferir en el normal funcionamiento del sitio.
            </p>
          </Section>

          {/* 5. Información de servicios */}
          <Section n="5" titulo="Información sobre los servicios">
            <p>
              La información sobre las actividades (descripción, edad recomendada, duración, horarios, aforo y precio)
              tiene carácter informativo y puede variar por motivos organizativos. {TITULAR.marca} podrá proponer
              alternativas de horario o fecha cuando resulte necesario.
            </p>
          </Section>

          {/* 6. Reservas */}
          <Section n="6" titulo="Proceso de reserva y contratación">
            <p>
              La reserva o contratación se entenderá confirmada al completar con éxito el proceso de compra/reserva en
              línea y/o al recibir confirmación expresa por parte de {TITULAR.marca}. En los servicios que requieran
              fianza o señal, la reserva quedará bloqueada únicamente tras su abono.
            </p>
          </Section>

          {/* 7. Precios */}
          <Section n="7" titulo="Precios e impuestos">
            <p>
              Los precios aplicables serán los vigentes en el momento de la contratación, con los impuestos indicados
              en cada caso. En caso de error tipográfico o evidente en el precio, {TITULAR.marca} podrá anular la
              reserva afectada y ofrecer la confirmación al precio correcto o el reembolso íntegro de las cantidades abonadas.
            </p>
          </Section>

          {/* 8. Pago */}
          <Section n="8" titulo="Formas de pago">
            <p>
              El pago se realizará mediante los métodos habilitados en el proceso de compra/reserva del sitio web.
              Según el servicio, podrán aplicarse señal o fianza, pago total anticipado o pagos fraccionados, conforme
              a lo indicado en la ficha del servicio.
            </p>
          </Section>

          {/* 9. Cancelaciones */}
          <Section n="9" titulo="Cancelaciones, desistimiento y no asistencia">
            <p>
              De acuerdo con el artículo 103.l) del Real Decreto Legislativo 1/2007, por el que se aprueba el texto
              refundido de la Ley General para la Defensa de los Consumidores y Usuarios, el derecho de desistimiento
              <strong> no resulta aplicable</strong> a los servicios relacionados con actividades de esparcimiento que
              prevean una fecha o periodo de ejecución específicos.
            </p>
            <p className="mt-3">
              Las condiciones concretas de cancelación constarán en la ficha del servicio, en el proceso de reserva
              y/o en la confirmación enviada. En caso de no presentación del cliente («no show»), la reserva podrá
              considerarse consumida total o parcialmente, sin derecho a reembolso.
            </p>
            <p className="mt-3">
              {TITULAR.marca} podrá cancelar o reprogramar una actividad por causas organizativas, de seguridad,
              meteorología adversa u otras circunstancias justificadas, ofreciendo alternativa o reembolso cuando proceda.
            </p>
          </Section>

          {/* 10. Seguridad */}
          <Section n="10" titulo="Normas de seguridad y participación">
            <p>
              Los participantes deben respetar las normas internas, las instalaciones y el material, y comunicar
              previamente cualquier condición médica relevante. {TITULAR.marca} podrá denegar la participación o
              interrumpir la actividad si detecta una situación de riesgo, sin obligación de reembolso en tales casos.
            </p>
          </Section>

          {/* 11. Menores */}
          <Section n="11" titulo="Menores de edad">
            <p>
              Cuando la contratación o participación implique a personas menores de edad, deberá ser realizada por su
              padre, madre, tutor legal o representante debidamente autorizado, que declara contar con capacidad legal
              para ello.
            </p>
          </Section>

          {/* 12. Imágenes */}
          <Section n="12" titulo="Imágenes y testimonios">
            <p>
              La captación, uso y publicación de imágenes durante las actividades se realizará conforme a la normativa
              aplicable y a las autorizaciones o cláusulas de consentimiento que se faciliten a tal efecto.
            </p>
          </Section>

          {/* 13. Propiedad intelectual */}
          <Section n="13" titulo="Propiedad intelectual e industrial">
            <p>
              Todos los contenidos del sitio web (textos, imágenes, logotipos, marcas, diseño y software) están
              protegidos por derechos de propiedad intelectual e industrial titularidad de {TITULAR.empresa} o de
              terceros. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin
              autorización expresa.
            </p>
          </Section>

          {/* 14. Responsabilidad */}
          <Section n="14" titulo="Responsabilidad">
            <p>
              {TITULAR.marca} no se responsabiliza de las interrupciones del servicio web por causas técnicas, tareas
              de mantenimiento o fuerza mayor, ni del uso indebido del sitio por parte del usuario. Se procurará en
              todo momento la disponibilidad y el correcto funcionamiento del sitio.
            </p>
          </Section>

          {/* 15. Protección de datos */}
          <Section n="15" titulo="Protección de datos personales">
            <p>
              El tratamiento de los datos personales se rige por el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica
              3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), conforme a lo
              detallado en la Política de Privacidad y la Política de Cookies disponibles en el sitio web. El usuario
              podrá ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad
              dirigiéndose a {TITULAR.email}.
            </p>
          </Section>

          {/* 16. Reclamaciones */}
          <Section n="16" titulo="Reclamaciones y resolución de litigios">
            <p>
              Los clientes pueden dirigir cualquier reclamación a través de los medios de contacto indicados y
              solicitar hojas de reclamaciones conforme a la normativa vigente. Asimismo, conforme al Reglamento (UE)
              524/2013, se informa de la existencia de la plataforma europea de resolución de litigios en línea,
              accesible en{' '}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-pm-red underline">
                ec.europa.eu/consumers/odr
              </a>.
            </p>
          </Section>

          {/* 17. Ley aplicable */}
          <Section n="17" titulo="Legislación aplicable y jurisdicción">
            <p>
              Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier
              controversia, y salvo que la normativa de consumidores establezca otro fuero, serán competentes los
              Juzgados y Tribunales de Cuenca (España).
            </p>
          </Section>

          {/* Contacto */}
          <div className="border-t border-gray-100 pt-6 text-sm text-gray-500">
            Para cualquier duda sobre estos términos, contacta en{' '}
            <a href={`mailto:${TITULAR.email}`} className="text-pm-red underline">{TITULAR.email}</a> o en el teléfono {TITULAR.telefonos}.
          </div>
        </div>
      </article>
    </main>
  )
}

function Section({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-pm-navy mb-2">{n}. {titulo}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  )
}
