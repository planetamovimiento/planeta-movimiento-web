import Link from 'next/link'
import { getPromosActivas, type Promo } from '@/lib/home/promos'

// Tiras promocionales del inicio (editables desde el admin). Mismo estilo que la
// tira de "50 días, 50 provincias": etiqueta + texto + botón que redirige.

function FilaPromo({ p }: { p: Promo }) {
  const contenido = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="shrink-0">
        {p.etiqueta && <div className="text-pm-red font-black text-xs uppercase tracking-widest">{p.etiqueta}</div>}
        <div className="text-white font-black text-base sm:text-lg leading-tight">{p.titulo}</div>
      </div>
      <div className="hidden sm:block w-px h-10 bg-white/15 shrink-0" aria-hidden="true" />
      {p.texto && <p className="text-white/70 text-sm leading-relaxed min-w-0 flex-1">{p.texto}</p>}
      <span className="inline-flex items-center gap-2 text-pm-red group-hover:text-white font-bold text-sm whitespace-nowrap transition-colors shrink-0">
        {p.botonTexto || 'Ver más'}
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </div>
  )
  const cls = 'group block max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6'
  const externo = /^https?:\/\//.test(p.enlace)
  return externo
    ? <a href={p.enlace} target="_blank" rel="noopener noreferrer" className={cls}>{contenido}</a>
    : <Link href={p.enlace} className={cls}>{contenido}</Link>
}

export async function PromosDestacadas() {
  const promos = await getPromosActivas()
  if (promos.length === 0) return null
  return (
    <section className="bg-pm-navy border-b border-white/10">
      <div className="divide-y divide-white/10">
        {promos.map(p => <FilaPromo key={p.id} p={p} />)}
      </div>
    </section>
  )
}
