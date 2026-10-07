import Link from 'next/link'
import { waNegocio } from '@/lib/whatsapp'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbsJsonLd } from '@/lib/seo'
import TiendaClient from './TiendaClient'

export const metadata = {
  title: 'Planeta Shop — Colchonetas profesionales y equipación | Planeta Movimiento',
  description:
    'Tienda de Planeta Movimiento: quitamiedos de 40 cm (desde 699 €), quitamiedos Dual Impact reversible (559 €) y la camiseta Pro PM del 10º aniversario, personalizada con tu nombre.',
  alternates: { canonical: '/planeta-shop' },
}

const GARANTIAS = [
  { titulo: 'Fabricación propia', desc: 'Las colchonetas se fabrican en Cuenca, con control de calidad en cada pieza.' },
  { titulo: 'Materiales técnicos', desc: 'Espumas de alta densidad y polipiel náutica preparadas para uso intensivo.' },
  { titulo: 'Medidas a medida', desc: 'Si necesitas otro tamaño o color, lo fabricamos bajo pedido.' },
  { titulo: 'Asesoramiento real', desc: 'Te ayudamos a elegir según la disciplina, la altura de trabajo y el espacio del que dispones.' },
]

export default function PlanetaShopPage() {
  return (
    <main className="bg-pm-bg min-h-screen">
      <JsonLd data={breadcrumbsJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Planeta Shop', path: '/planeta-shop' }])} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-pm-red transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-pm-navy font-semibold">Planeta Shop</span>
          </nav>
        </div>
      </div>

      {/* Portada */}
      <section className="relative bg-pm-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pm-red/15 rounded-full blur-[110px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center border border-white/15 bg-white/5 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            Fabricación propia en Cuenca
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">Planeta Shop</h1>
          <p className="text-white/70 text-base max-w-2xl mx-auto">
            Material deportivo que usamos cada día en nuestras instalaciones y la equipación oficial del club.
            Pide lo que necesites y te confirmamos disponibilidad, plazo y envío.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="#catalogo" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
              Ver productos
            </a>
            <a href={waNegocio('Hola, me gustaría información sobre los productos de Planeta Shop.')} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              Hablar con el equipo
            </a>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-14" id="catalogo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-pm-navy">Productos</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-2xl">
              Elige medida, color o talla, añádelo al carrito y envíanos el pedido. No se cobra nada online:
              confirmamos contigo disponibilidad, transporte y forma de pago antes de fabricar.
            </p>
          </div>

          <TiendaClient />
        </div>
      </section>

      {/* Garantías */}
      <section className="bg-white border-y border-gray-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GARANTIAS.map(g => (
              <div key={g.titulo}>
                <div className="w-10 h-0.5 bg-pm-red mb-3" />
                <div className="font-black text-pm-navy text-sm mb-1">{g.titulo}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A medida */}
      <section className="bg-pm-navy py-14 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">¿Necesitas otras medidas o colores?</h2>
          <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
            Fabricamos colchonetas a medida según las necesidades de tu club, gimnasio o centro educativo.
            Cuéntanos qué necesitas y te preparamos un presupuesto sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#catalogo" className="bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-3.5 rounded-xl transition-colors">
              Ver productos
            </a>
            <a href={waNegocio('Hola, necesito una colchoneta a medida. Os cuento las medidas que busco:')} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-colors">
              Pedir presupuesto a medida
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
