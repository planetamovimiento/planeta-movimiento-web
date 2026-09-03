import type { Aviso } from '@/lib/familias/avisos'

// Bloque "Avisos del club" para el portal (y la vista previa de admin).
// Presentacional. No se muestra nada si no hay avisos activos.

export function AvisosClub({ avisos }: { avisos: Aviso[] }) {
  if (!avisos.length) return null
  return (
    <div className="bg-white rounded-2xl border border-pm-red/20 shadow-sm p-5 mb-6">
      <div className="text-xs font-black text-pm-red uppercase tracking-widest mb-3">Avisos del club</div>
      <ul className="space-y-3">
        {avisos.map(a => (
          <li key={a.id} className="border-l-2 border-pm-red pl-3">
            {a.titulo && <div className="font-bold text-pm-navy text-sm">{a.titulo}</div>}
            {a.cuerpo && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{a.cuerpo}</p>}
            {a.enlace && (
              <a href={a.enlace} target={a.enlace.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-pm-red border border-pm-red/30 rounded-lg px-3 py-1.5 hover:bg-pm-red/5 transition-colors">
                {a.enlaceTexto || 'Ver más →'}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
