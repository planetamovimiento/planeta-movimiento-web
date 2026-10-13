import type { Metadata } from 'next'
import { waNegocio } from '@/lib/whatsapp'
import { getAjustesNavidad, getPases, agruparPorFecha } from '@/lib/navidad/store'
import { eurosDeCents } from '@/lib/navidad/precios'
import ReservaNavidad from './ReservaNavidad'
import { Nieve, Escena, DibujoFabrica, DibujoCartas, DibujoJuguetes, DibujoPapaNoel, DibujoFiesta } from './Ilustraciones'

export const metadata: Metadata = {
  title: 'La Fábrica de Papá Noel — Planeta Movimiento',
  description: 'Conviértete en ayudante oficial de Papá Noel: taller de cartas, fábrica de juguetes, visita a su despacho y fiesta final. Diciembre de 2026 en Cuenca.',
  alternates: { canonical: '/fabrica-de-papa-noel' },
}

// Las plazas y el estado de la venta cambian solos: la página se regenera cada
// minuto (y al instante cuando se guarda algo en el panel), en vez de quedarse
// con lo que hubiera en el momento del despliegue.
export const revalidate = 60

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "18, 19, 22, 23 y 24 de diciembre" a partir de los pases publicados. */
function textoFechas(fechas: string[]): string {
  if (fechas.length === 0) return 'Diciembre de 2026'
  const dias = fechas.map(f => Number(f.slice(8, 10)))
  const mes = MESES[Number(fechas[0].slice(5, 7)) - 1]
  const lista = dias.length === 1 ? String(dias[0]) : `${dias.slice(0, -1).join(', ')} y ${dias[dias.length - 1]}`
  return `${lista} de ${mes}`
}

const EXPERIENCIAS = [
  {
    n: 1, titulo: 'El taller de cartas', duracion: '10 minutos',
    texto: 'Comienza tu aventura convirtiéndote en ayudante oficial de Papá Noel. Diseña tu propia carta navideña y prepárala para entregársela personalmente.',
    puntos: ['Carnet de ayudante oficial', 'Tu carta, hecha a mano', 'Lista para entregar en persona'],
    color: 'from-red-800 to-red-950', acento: 'text-amber-300',
  },
  {
    n: 2, titulo: 'La fábrica de juguetes', duracion: '17 minutos',
    texto: '¡Los elfos necesitan tu ayuda! Entra en una auténtica fábrica navideña, descubre cómo se preparan los juguetes y participa en divertidas misiones para que todos los regalos estén listos a tiempo.',
    puntos: ['Fabricación de juguetes', 'Clasificación de regalos', 'Empaquetado contrarreloj', 'Juegos de movimiento', 'Circuitos navideños', 'Misiones de los elfos', 'Encendido mágico de la fábrica'],
    color: 'from-emerald-800 to-emerald-950', acento: 'text-emerald-300',
  },
  {
    n: 3, titulo: 'Conoce a Papá Noel', duracion: '16 minutos',
    texto: 'Ha llegado el momento más esperado. Visita el despacho de Papá Noel, entrégale tu carta, cuéntale tus deseos y disfruta de un recuerdo inolvidable con una fotografía.',
    puntos: ['Su despacho, tal cual', 'Entrega de la carta', 'Fotografía de recuerdo'],
    color: 'from-amber-700 to-red-950', acento: 'text-amber-200',
  },
  {
    n: 4, titulo: 'Gran fiesta de despedida', duracion: '7 minutos',
    texto: 'Antes de regresar a casa, disfruta de una fiesta navideña con música, baile, elfos y una última sorpresa de Papá Noel.',
    puntos: ['Música y baile', 'Los elfos se vienen arriba', 'Una última sorpresa'],
    color: 'from-violet-800 to-violet-950', acento: 'text-violet-200',
  },
]

const FAQS = [
  { q: '¿Cuánto dura la visita?', a: 'Unos 50 minutos en total, repartidos en las cuatro partes de la experiencia: el taller de cartas, la fábrica de juguetes, la visita a Papá Noel y la fiesta de despedida.' },
  { q: '¿Para qué edades es?', a: 'Está pensada para familias con niños. No hay edad mínima: los bebés menores de 2 años entran gratis, y los más mayores participan en todas las misiones.' },
  { q: '¿Los bebés pagan entrada?', a: 'Los menores de 2 años no pagan, pero hay que incluirlos en la reserva porque ocupan plaza dentro del aforo del pase.' },
  { q: '¿Pueden entrar los niños solos?', a: 'No. Los menores tienen que venir acompañados por un adulto responsable durante toda la visita, y ese adulto necesita su propia entrada.' },
  { q: '¿Cuánta gente entra en cada pase?', a: 'Como mucho 25 personas por pase, contando niños, adultos y bebés. Así la visita es tranquila y todos ven bien cada parte.' },
  { q: '¿Qué descuentos hay?', a: 'Un 20 % en reservas de 6 o más entradas de pago, y un 15 % para socios del Club Deportivo Origen. Solo se aplica uno de los dos: si cumples los dos, se queda el del 20 %.' },
  { q: '¿Qué horarios hay?', a: 'Los días 18, 19, 22 y 23 hay pases de mañana (10:00, 11:00 y 12:00) y de tarde (16:00, 17:00, 18:00 y 19:00). El 24 de diciembre solo hay pases de mañana.' },
  { q: '¿Cómo sé que mi reserva está confirmada?', a: 'Al terminar el pago recibes un correo con tu localizador y los datos del pase. Si no llega el correo, escríbenos: sin localizador no hay reserva confirmada.' },
]

export default async function FabricaPapaNoelPage() {
  const [cfg, pases] = await Promise.all([getAjustesNavidad(), getPases()])
  const grupos = agruparPorFecha(pases)
  const fechas = grupos.map(g => g.fecha)
  const plazasLibres = pases.reduce((s, p) => s + (p.bloqueado ? 0 : p.libres), 0)

  const dibujos = [
    <DibujoCartas key="c" className="w-full h-full" />,
    <DibujoJuguetes key="j" className="w-full h-full" />,
    <DibujoPapaNoel key="p" className="w-full h-full" />,
    <DibujoFiesta key="f" className="w-full h-full" />,
  ]
  const fotos = [cfg.imagenCartas, cfg.imagenFabrica, cfg.imagenPapaNoel, cfg.imagenFiesta]

  return (
    <main className="bg-[#3b0a16]">
      {/* ════ HERO ════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#10172e] via-[#4c0d1c] to-[#3b0a16]">
        <Nieve />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-emerald-500/15 border border-amber-300/50 text-amber-200 text-xs font-black px-4 py-1.5 rounded-full">
                Navidad 2026 · Cuenca
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-4 leading-[1.05]">
                La Fábrica de<br />
                <span className="text-amber-300">Papá Noel</span>
              </h1>
              <p className="text-xl text-emerald-200 font-bold mt-3">
                ¡La magia de la Navidad llega a Planeta Movimiento!
              </p>
              <p className="text-white/80 text-base leading-relaxed mt-4 max-w-xl">
                Esta Navidad, las puertas de la fábrica más mágica del mundo se abren para recibir a pequeños y
                mayores. Conviértete en ayudante oficial de Papá Noel, descubre cómo se preparan los regalos,
                participa en divertidas misiones y conoce personalmente al mismísimo Papá Noel.
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {[textoFechas(fechas), '50 minutos de experiencia', 'Plazas limitadas: 25 por pase'].map(t => (
                  <span key={t} className="bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">{t}</span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-7">
                <a href="#entradas"
                  className="bg-amber-400 hover:bg-amber-300 text-red-950 font-black px-7 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-amber-500/20">
                  Reservar entradas
                </a>
                <a href="#experiencia" className="text-white/80 hover:text-white font-bold text-sm underline underline-offset-4">
                  Ver qué vivirás dentro
                </a>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300/30 shadow-2xl shadow-black/40 aspect-[4/3]">
              <Escena foto={cfg.imagenHero} alt="La fábrica de Papá Noel iluminada en una noche nevada">
                <DibujoFabrica className="w-full h-full" />
              </Escena>
            </div>
          </div>
        </div>
      </section>

      {/* ════ QUÉ VIVIRÁS ════ */}
      <section id="experiencia" className="bg-[#3b0a16] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest">La visita, paso a paso</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">¿Qué vivirás en la fábrica?</h2>
            <p className="text-white/60 text-sm mt-2">Cuatro paradas, unos 50 minutos, cero prisas.</p>
          </div>

          <div className="space-y-6">
            {EXPERIENCIAS.map((e, i) => (
              <article key={e.n}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br ${e.color}`}>
                <div className={`aspect-[16/10] lg:aspect-auto lg:min-h-[260px] ${i % 2 ? 'lg:order-2' : ''}`}>
                  <Escena foto={fotos[i]} alt={e.titulo}>{dibujos[i]}</Escena>
                </div>
                <div className="p-7 sm:p-9 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-white/15 text-white font-black grid place-items-center">{e.n}</span>
                    <span className={`text-xs font-black uppercase tracking-wider ${e.acento}`}>{e.duracion} aprox.</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{e.titulo}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{e.texto}</p>
                  <ul className="flex flex-wrap gap-2 mt-4">
                    {e.puntos.map(p => (
                      <li key={p} className="bg-black/25 border border-white/10 text-white/85 text-xs font-bold px-3 py-1.5 rounded-full">{p}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PRECIOS ════ */}
      <section className="bg-[#2d0711] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-9">
            <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">Entradas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Precios</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { t: 'Entrada infantil', p: eurosDeCents(cfg.precioNinoCents), d: 'Desde los 2 años' },
              { t: 'Entrada adulto', p: eurosDeCents(cfg.precioAdultoCents), d: 'Acompañantes' },
              { t: 'Bebés', p: 'Gratis', d: 'Menores de 2 años · ocupan plaza' },
            ].map(x => (
              <div key={x.t} className="bg-white/5 border border-white/15 rounded-3xl p-6 text-center">
                <div className="text-white font-black text-lg">{x.t}</div>
                <div className="text-amber-300 font-black text-3xl my-2">{x.p}</div>
                <div className="text-white/60 text-xs">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-emerald-900/40 border border-emerald-400/30 rounded-3xl p-6">
              <div className="text-emerald-300 font-black">Grupo · −{cfg.pctGrupo} %</div>
              <p className="text-white/80 text-sm mt-1">
                Si reserváis {cfg.minGrupo} entradas de pago o más, el descuento se aplica solo, sin códigos.
                Los bebés gratis no cuentan para llegar a {cfg.minGrupo}.
              </p>
            </div>
            <div className="bg-red-900/40 border border-amber-300/30 rounded-3xl p-6">
              <div className="text-amber-300 font-black">Socios del club · −{cfg.pctSocio} %</div>
              <p className="text-white/80 text-sm mt-1">
                Para socios del Club Deportivo Origen. Comprobamos el nº de socio con el correo del Portal de
                Familias. Los descuentos no se suman: se aplica el mayor de los dos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════ ENTRADAS ════ */}
      <section id="entradas" className="bg-gradient-to-b from-[#3b0a16] to-[#10251a] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest">Reserva</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Elige tu pase</h2>
            <p className="text-white/60 text-sm mt-2">
              {plazasLibres > 0 ? `Quedan ${plazasLibres} plazas en total.` : 'Las plazas se publican en breve.'}
            </p>
          </div>

          <ReservaNavidad pasesIniciales={pases} cfg={cfg} politicaCancelacion={cfg.politicaCancelacion} />
        </div>
      </section>

      {/* ════ PREGUNTAS ════ */}
      <section className="bg-[#10251a] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {FAQS.map(f => (
              <details key={f.q} className="group bg-white/5 border border-white/10 rounded-2xl p-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-white font-bold text-sm">
                  {f.q}
                  <span className="text-amber-300 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="text-white/70 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
            {cfg.avisoAccesibilidad && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/70 text-sm">{cfg.avisoAccesibilidad}</div>
            )}
          </div>

          <div className="text-center mt-10">
            <p className="text-white/60 text-sm">¿Dudas con la reserva?</p>
            <a href={waNegocio('Hola, tengo una duda sobre La Fábrica de Papá Noel')} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl transition-colors">
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
