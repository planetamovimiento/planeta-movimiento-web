import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidad — Planeta Movimiento',
  description: 'Política de privacidad y protección de datos personales de Planeta Movimiento (Planeta Carlos S.L.), conforme al RGPD y la LOPDGDD.',
}

const T = {
  empresa: 'Planeta Carlos S.L.',
  marca: 'Planeta Movimiento',
  nif: 'B16346256',
  domicilio: 'Polígono Los Palancares, 8, 16004 Cuenca (España)',
  email: 'info@planetamovimiento.com',
}
const ACTUALIZACION = '6 de junio de 2026'

function Section({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-pm-navy mb-2">{n}. {titulo}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

export default function PoliticaPrivacidadPage() {
  return (
    <main className="bg-pm-bg min-h-screen">
      <section className="bg-pm-navy text-white py-14 border-t-4 border-pm-red">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white">Política de Privacidad</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Política de Privacidad</h1>
          <p className="text-white/60 text-sm">Última actualización: {ACTUALIZACION}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 space-y-8 text-[15px] leading-relaxed text-gray-700">

          <Section n="1" titulo="Responsable del tratamiento">
            <p>De acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), el responsable del tratamiento de tus datos es:</p>
            <ul className="mt-3 space-y-1">
              <li><strong>Responsable:</strong> {T.empresa}, que opera como «{T.marca}».</li>
              <li><strong>NIF:</strong> {T.nif}</li>
              <li><strong>Domicilio:</strong> {T.domicilio}</li>
              <li><strong>Correo de contacto:</strong> {T.email}</li>
            </ul>
          </Section>

          <Section n="2" titulo="Datos que tratamos">
            <p>Tratamos los datos que nos facilitas a través de los formularios y procesos de reserva del sitio web, así como los derivados de la propia navegación:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li><strong>Datos identificativos y de contacto:</strong> nombre, apellidos, teléfono y correo electrónico.</li>
              <li><strong>Datos de la actividad o reserva:</strong> servicio de interés, fechas, número de participantes, edad o fecha de nacimiento, observaciones y, en su caso, datos del tutor legal.</li>
              <li><strong>Datos de entidades:</strong> nombre del centro, AMPA, empresa o asociación y persona de contacto, cuando la solicitud procede de una entidad.</li>
              <li><strong>Datos de navegación:</strong> información técnica necesaria para el funcionamiento del sitio (ver la <Link href="/politica-cookies" className="text-pm-red underline">Política de Cookies</Link>).</li>
            </ul>
            <p className="mt-2">No solicitamos datos de categorías especiales. Si nos comunicas información médica relevante por motivos de seguridad de la actividad, la trataremos con la única finalidad de garantizar una participación segura.</p>
          </Section>

          <Section n="3" titulo="Finalidades del tratamiento">
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestionar las solicitudes de información, inscripción, reserva o presupuesto que nos envías.</li>
              <li>Tramitar y gestionar las reservas, compras y la prestación de los servicios contratados.</li>
              <li>Mantener la comunicación contigo en relación con tu solicitud o actividad.</li>
              <li>Gestionar el alta de alumnos y usuarios de las actividades del Club Deportivo Origen.</li>
              <li>Cumplir con las obligaciones legales, contables y fiscales aplicables.</li>
            </ul>
          </Section>

          <Section n="4" titulo="Base jurídica">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Consentimiento</strong> del interesado al enviar un formulario o solicitud (art. 6.1.a RGPD).</li>
              <li><strong>Ejecución de un contrato</strong> o de medidas precontractuales en las reservas y compras (art. 6.1.b RGPD).</li>
              <li><strong>Cumplimiento de obligaciones legales</strong> en materia fiscal y contable (art. 6.1.c RGPD).</li>
              <li><strong>Interés legítimo</strong> en responder a las consultas y mejorar nuestros servicios (art. 6.1.f RGPD).</li>
            </ul>
          </Section>

          <Section n="5" titulo="Plazo de conservación">
            <p>Conservaremos tus datos durante el tiempo necesario para atender tu solicitud y prestar el servicio, y posteriormente durante los plazos legalmente exigibles (por ejemplo, obligaciones fiscales). Cuando dejen de ser necesarios, se suprimirán de forma segura.</p>
          </Section>

          <Section n="6" titulo="Destinatarios y encargados del tratamiento">
            <p>No cedemos tus datos a terceros salvo obligación legal. Para prestar el servicio nos apoyamos en proveedores que actúan como encargados del tratamiento, con las debidas garantías contractuales:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li><strong>Proveedor de alojamiento y base de datos</strong> del sitio web y del sistema de gestión.</li>
              <li><strong>Proveedor de envío de correos electrónicos</strong> para las confirmaciones y comunicaciones.</li>
              <li><strong>Plataforma de pago</strong>, en su caso, para procesar los cobros de reservas y compras.</li>
            </ul>
            <p className="mt-2">Algunos proveedores pueden realizar tratamientos en servidores ubicados dentro del Espacio Económico Europeo o con garantías adecuadas de transferencia internacional conforme al RGPD.</p>
          </Section>

          <Section n="7" titulo="Tus derechos">
            <p>Puedes ejercer en cualquier momento tus derechos de <strong>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</strong>, así como retirar el consentimiento prestado, escribiendo a <a href={`mailto:${T.email}`} className="text-pm-red underline">{T.email}</a>, indicando el derecho que deseas ejercer.</p>
            <p className="mt-2">Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-pm-red underline">www.aepd.es</a>).</p>
          </Section>

          <Section n="8" titulo="Seguridad">
            <p>Aplicamos las medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o alteración, conforme al estado de la técnica y a los riesgos del tratamiento.</p>
          </Section>

          <Section n="9" titulo="Menores de edad">
            <p>Los datos de personas menores de edad se facilitan bajo la responsabilidad de su padre, madre, tutor legal o representante autorizado, que garantiza contar con la capacidad necesaria para ello.</p>
          </Section>

          <div className="border-t border-gray-100 pt-6 text-sm text-gray-500">
            Para cualquier cuestión sobre el tratamiento de tus datos, escríbenos a{' '}
            <a href={`mailto:${T.email}`} className="text-pm-red underline">{T.email}</a>.
          </div>
        </div>
      </article>
    </main>
  )
}
