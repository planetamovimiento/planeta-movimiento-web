import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-pm-navy">
      {/* ── Capas de fondo ─────────────────────────────────────────────── */}
      {/* Degradado base */}
      <div className="absolute inset-0 bg-gradient-to-b from-pm-navy via-pm-navy-md to-pm-navy" />

      {/* Rejilla sutil */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Orbes de luz animados */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-pm-red/25 blur-[120px] animate-orb" />
      <div className="absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-blue-500/20 blur-[130px] animate-orb-rev" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-pm-red/10 blur-[100px] animate-glow-pulse" />

      {/* Viñeta inferior para fundir con la siguiente sección */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pm-navy to-transparent" />

      {/* ── Contenido ──────────────────────────────────────────────────── */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-20 sm:pb-28 flex flex-col items-center text-center">

        {/* Badge */}
        <span className="inline-flex items-center gap-2 border border-white/15 bg-white/5 backdrop-blur text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 bg-pm-red rounded-full animate-pulse" />
          Centro de referencia en Cuenca · Circo, deporte y ocio
        </span>

        {/* Logo protagonista con glow */}
        <div className="relative mb-8">
          {/* Halo de luz tras el logo */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Planeta Movimiento"
            className="w-44 h-44 sm:w-56 sm:h-56 object-contain animate-float drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(212,43,43,0.35))' }}
          />
        </div>

        {/* Titular */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 max-w-4xl">
          Donde el movimiento<br />
          <span className="text-shimmer">se convierte en aventura</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Circo, acrobacia, campamentos, eventos y formación para todas las edades.
          Un espacio único en Cuenca donde aprender, jugar y superarse no tiene límites.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center mb-6">
          <Link
            href="/reservar"
            className="group relative bg-pm-red hover:bg-pm-red-dark text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-pm-red/30 hover:shadow-pm-red/50 hover:-translate-y-0.5"
          >
            Reservar ahora
            <span className="inline-block ml-1 transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/actividades"
            className="bg-white/10 hover:bg-white/15 backdrop-blur border border-white/20 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5"
          >
            Ver actividades
          </Link>
        </div>

        {/* Accesos rápidos */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50">
          <Link href="/club" className="hover:text-white transition-colors">Club Deportivo</Link>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <Link href="/servicios/cumpleanos" className="hover:text-white transition-colors">Cumpleaños</Link>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <Link href="/servicios/campamentos" className="hover:text-white transition-colors">Campamentos</Link>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <Link href="/servicios/eventos" className="hover:text-white transition-colors">Eventos</Link>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="relative pb-8 flex justify-center">
        <div className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Descubre más</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bob" />
          </div>
        </div>
      </div>
    </section>
  )
}
