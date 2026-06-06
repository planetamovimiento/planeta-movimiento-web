import Link from 'next/link'
import Reveal from '@/components/home/Reveal'

export const metadata = {
  title: 'Planeta TDAH — Plataforma gamificada | Colaboración con Planeta Movimiento',
  description:
    'Planeta TDAH: la primera plataforma web gamificada para personas con TDAH y sus familias. Convierte tu rutina en una aventura. Tu universo. Tu foco. Tu poder.',
}

const PLANETA_TDAH_URL = 'https://planetatdah.com/ref/GKSUYP'

const FUNCIONALIDADES = [
  { icon: '🦸', titulo: 'Camino del Héroe', desc: 'Minijuego con héroes que evolucionan por nivel, una mascota que cuidas, misiones diarias y personalizadas, tienda con monedas y logros.' },
  { icon: '🎯', titulo: 'Misiones', desc: 'Ganas XP automáticamente usando la plataforma y subes de nivel a tu propio ritmo.' },
  { icon: '🎵', titulo: 'Música TDAH', desc: 'Playlists de foco, lo-fi, relax y ruido blanco, con tus favoritos siempre a mano.' },
  { icon: '📂', titulo: 'Recursos', desc: 'Plantillas, meditaciones, pilates, yoga, respiraciones y método Pomodoro. Vídeos y descargables.' },
  { icon: '💬', titulo: 'Comunidad', desc: 'Comparte, comenta y conecta con personas que te entienden de verdad.' },
  { icon: '🏆', titulo: 'Logros e insignias', desc: 'Progreso visible de bronce a diamante que refuerza la constancia día a día.' },
]

const BENEFICIOS = [
  { icon: '🚀', titulo: 'Tu día a día se convierte en progreso real', desc: 'Hábitos y tareas se transforman en misiones con XP, niveles y recompensas.' },
  { icon: '🧠', titulo: 'Motivación que engancha, sin culpa', desc: 'Gamificación pensada para cómo funciona el cerebro TDAH.' },
  { icon: '👨‍👩‍👧', titulo: 'Para toda la familia', desc: 'Un adulto gestiona su cuenta y puede usar el Camino del Héroe junto a su peque.' },
]

export default function PlanetaTdahPage() {
  return (
    <main className="bg-[#0a0613]">

      {/* Breadcrumb */}
      <div className="bg-[#0a0613] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-white/80 font-semibold">Planeta TDAH</span>
          </nav>
        </div>
      </div>

      {/* ════ HERO COSMICO ════ */}
      <section className="relative overflow-hidden">
        {/* Fondo aurora */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0613] via-[#1a0f3d] to-[#0a0613]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-32 left-1/4 w-[480px] h-[480px] rounded-full bg-violet-600/30 blur-[120px] animate-orb" />
        <div className="absolute top-1/4 -right-20 w-[420px] h-[420px] rounded-full bg-fuchsia-500/20 blur-[120px] animate-orb-rev" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-500/15 blur-[100px] animate-glow-pulse" />

        {/* Estrellas */}
        <div className="absolute inset-0 opacity-60" aria-hidden>
          {[
            'top-[12%] left-[15%]', 'top-[22%] left-[80%]', 'top-[40%] left-[10%]',
            'top-[18%] left-[55%]', 'top-[60%] left-[85%]', 'top-[70%] left-[25%]',
            'top-[33%] left-[35%]', 'top-[50%] left-[65%]',
          ].map((pos, i) => (
            <span key={i} className={`absolute ${pos} w-1 h-1 bg-white rounded-full animate-glow-pulse`} style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge colaboración */}
          <span className="inline-flex items-center gap-2 border border-violet-400/30 bg-violet-500/10 backdrop-blur text-violet-200 text-xs font-bold px-4 py-1.5 rounded-full mb-8">
            ✦ Colaboración · Plataforma aliada
          </span>

          {/* Logo oficial — planeta con anillo */}
          <div className="relative mb-6 flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-56 h-56 rounded-full bg-violet-500/30 blur-[70px] animate-glow-pulse" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tdah/planet.png"
              alt="Planeta TDAH"
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain animate-float"
              style={{ filter: 'drop-shadow(0 20px 50px rgba(124,58,237,0.5))' }}
            />
          </div>

          {/* Logotipo de texto oficial */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tdah/logo-text.png"
            alt="Planeta TDAH"
            className="h-12 sm:h-16 w-auto object-contain mx-auto mb-3"
          />
          <h1 className="sr-only">Planeta TDAH</h1>
          <p className="text-xl sm:text-2xl font-black text-white mb-6">
            Tu universo. Tu foco. Tu poder.
          </p>

          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            La primera plataforma web <strong className="text-violet-200">gamificada</strong> para personas con TDAH y sus familias
            que convierte la rutina diaria en una aventura.
          </p>
          <p className="text-white/40 text-sm max-w-xl mx-auto mb-10">
            Para personas con TDAH, neurodivergentes y familias que quieren acompañar a sus peques con una herramienta motivadora.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a href={PLANETA_TDAH_URL} target="_blank" rel="noopener noreferrer"
              className="group bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-violet-600/40 hover:-translate-y-0.5">
              Descubre Planeta TDAH
              <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a href={PLANETA_TDAH_URL} target="_blank" rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/15 backdrop-blur border border-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5">
              Empieza gratis
            </a>
          </div>
          <p className="text-white/40 text-xs mt-4">Acceso gratuito durante la beta · Sin tarjeta</p>
        </div>
      </section>

      {/* ════ FUNCIONALIDADES ════ */}
      <section className="relative bg-[#0a0613] py-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-700/10 rounded-full blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-fuchsia-400 text-xs font-black uppercase tracking-widest mb-3">Qué incluye</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Todo un universo de herramientas</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">Diseñado para cómo funciona tu cerebro, no en tu contra.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FUNCIONALIDADES.map((f, i) => (
              <Reveal key={f.titulo} delay={i * 60}>
                <div className="group h-full bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] hover:border-violet-400/30 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="font-black text-white text-lg mb-2">{f.titulo}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Idiomas */}
          <Reveal className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-sm font-semibold px-5 py-2.5 rounded-full">
              🌍 Disponible en Español e Inglés
            </span>
          </Reveal>
        </div>
      </section>

      {/* ════ BENEFICIOS ════ */}
      <section className="relative bg-gradient-to-b from-[#0a0613] to-[#160a33] py-20 overflow-hidden">
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-fuchsia-400 text-xs font-black uppercase tracking-widest mb-3">Por qué funciona</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Más que una app de tareas</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BENEFICIOS.map((b, i) => (
              <Reveal key={b.titulo} delay={i * 80}>
                <div className="h-full bg-gradient-to-br from-violet-600/15 to-fuchsia-600/10 border border-violet-400/20 rounded-3xl p-7">
                  <div className="text-4xl mb-4">{b.icon}</div>
                  <h3 className="font-black text-white text-base mb-2">{b.titulo}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Frase de acompañamiento */}
          <Reveal className="mt-10 text-center">
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              <span className="text-violet-200 font-bold">Foco a demanda</span> y una
              <span className="text-violet-200 font-bold"> comunidad que te entiende</span>, con especialistas de confianza
              que te acompañan en el camino.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════ CTA FINAL ════ */}
      <section className="relative bg-[#160a33] py-20 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[110px] animate-orb" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[110px] animate-orb-rev" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="text-4xl mb-4">🪐</div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Empieza tu aventura hoy
            </h2>
            <p className="text-white/60 text-lg mb-3 max-w-xl mx-auto">
              Convierte tu rutina en progreso real. Únete gratis durante la beta y descubre tu poder.
            </p>
            <p className="text-violet-300 font-black text-lg mb-10">Tu universo. Tu foco. Tu poder.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={PLANETA_TDAH_URL} target="_blank" rel="noopener noreferrer"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-violet-600/40 hover:-translate-y-0.5">
                Descubre Planeta TDAH →
              </a>
              <a href={PLANETA_TDAH_URL} target="_blank" rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/15 backdrop-blur border-2 border-white/20 text-white font-bold px-10 py-4 rounded-2xl transition-all hover:-translate-y-0.5">
                Empieza gratis
              </a>
            </div>

            {/* Nota de colaboración */}
            <p className="text-white/30 text-xs mt-10 max-w-md mx-auto">
              Planeta TDAH es una plataforma aliada de Planeta Movimiento. Es una herramienta educativa y motivacional;
              no constituye un servicio sanitario ni terapéutico.
            </p>
          </Reveal>
        </div>
      </section>

    </main>
  )
}
