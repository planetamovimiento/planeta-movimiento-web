import type { ReactNode } from 'react'

// ─── Cabecera de página ───────────────────────────────────────────────────────
export function AdminHeader({ titulo, subtitulo, accion }: { titulo: ReactNode; subtitulo?: string; accion?: ReactNode }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="pl-12 lg:pl-0">
        <h1 className="text-lg lg:text-xl font-black text-pm-navy">{titulo}</h1>
        {subtitulo && <p className="text-xs lg:text-sm text-gray-500">{subtitulo}</p>}
      </div>
      {accion}
    </header>
  )
}

// ─── Badge de estado ──────────────────────────────────────────────────────────
const ESTADO_COLORS: Record<string, string> = {
  // reservas
  pendiente:   'bg-amber-100 text-amber-700',
  confirmada:  'bg-blue-100 text-blue-700',
  pagada:      'bg-green-100 text-green-700',
  cancelada:   'bg-gray-100 text-gray-500',
  espera:      'bg-purple-100 text-purple-700',
  reembolsada: 'bg-rose-100 text-rose-700',
  // pagos
  pagado:    'bg-green-100 text-green-700',
  fallido:   'bg-rose-100 text-rose-700',
  reembolsado:'bg-gray-100 text-gray-500',
  parcial:   'bg-amber-100 text-amber-700',
  // formularios
  nueva:       'bg-pm-red-light text-pm-red',
  leida:       'bg-blue-100 text-blue-700',
  respondida:  'bg-green-100 text-green-700',
  seguimiento: 'bg-amber-100 text-amber-700',
  cerrada:     'bg-gray-100 text-gray-500',
  // servicios / disponibilidad
  activo:        'bg-green-100 text-green-700',
  inactivo:      'bg-gray-100 text-gray-500',
  completo:      'bg-rose-100 text-rose-700',
  proximamente:  'bg-blue-100 text-blue-700',
  ultimas:       'bg-amber-100 text-amber-700',
  finalizado:    'bg-gray-100 text-gray-500',
  disponible:    'bg-green-100 text-green-700',
  bloqueado:     'bg-gray-200 text-gray-600',
  // pedidos
  nuevo:      'bg-pm-red-light text-pm-red',
  preparando: 'bg-amber-100 text-amber-700',
  enviado:    'bg-blue-100 text-blue-700',
  entregado:  'bg-green-100 text-green-700',
}

const ESTADO_LABEL: Record<string, string> = {
  espera: 'Lista de espera',
  ultimas: 'Últimas plazas',
  finalizado: 'Finalizado',
}

export function EstadoBadge({ estado }: { estado: string }) {
  const color = ESTADO_COLORS[estado] ?? 'bg-gray-100 text-gray-500'
  const label = ESTADO_LABEL[estado] ?? estado.charAt(0).toUpperCase() + estado.slice(1)
  return <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>{label}</span>
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', titulo, desc }: { icon?: string; titulo: string; desc?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-bold text-pm-navy">{titulo}</p>
      {desc && <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">{desc}</p>}
    </div>
  )
}

// ─── Aviso de configuración (si la BD no está lista) ──────────────────────────
export function SetupNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
      <div className="font-black mb-1">⚙️ Base de datos no inicializada</div>
      <p className="text-amber-700 leading-relaxed">
        Para que el panel cargue datos reales, ejecuta una vez el archivo <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/schema.sql</code> en
        el SQL Editor de tu proyecto de Supabase. Mientras tanto, las secciones aparecerán vacías.
      </p>
    </div>
  )
}

// ─── Tarjeta métrica ──────────────────────────────────────────────────────────
export function Metric({ label, valor, sub, tono = 'navy' }: { label: string; valor: string | number; sub?: string; tono?: 'navy' | 'red' | 'green' | 'amber' | 'purple' }) {
  const tonos = {
    navy: 'text-pm-navy', red: 'text-pm-red', green: 'text-green-600', amber: 'text-amber-600', purple: 'text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-black ${tonos[tono]}`}>{valor}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
