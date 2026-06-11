import { MESES_TEMPORADA, ESTADO_PAGO_META, ESTADOS_GENERAL, type EstadoPago } from '@/lib/club/constants'

const DIMS: Record<string, string> = {
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
}

export function Avatar({ foto, nombre, size = 'lg' }: { foto?: string; nombre: string; size?: 'md' | 'lg' | 'xl' }) {
  const cls = `${DIMS[size]} rounded-2xl shrink-0`
  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={foto} alt={nombre} className={`${cls} object-cover border-2 border-white/40`} />
  }
  return (
    <div className={`${cls} bg-gradient-to-br from-pm-red to-pm-red-dark flex items-center justify-center font-black text-white`}>
      {(nombre || '?').trim().charAt(0).toUpperCase()}
    </div>
  )
}

export function BadgeEstadoGeneral({ estado }: { estado: string }) {
  const meta = ESTADOS_GENERAL.find(e => e.id === estado)
  return <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${meta?.badge ?? 'bg-white/20 text-white'}`}>{meta?.label ?? estado}</span>
}

export function CirculosMeses({ pagos }: { pagos: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-3">
      {MESES_TEMPORADA.map(m => {
        const estado = (pagos[m.key] ?? '') as EstadoPago | ''
        const meta = estado ? ESTADO_PAGO_META[estado] : null
        return (
          <div key={m.key} className="flex flex-col items-center gap-1">
            <span className={`w-7 h-7 rounded-full border ${meta ? `${meta.dot} border-transparent` : 'bg-white border-gray-300'}`} title={meta?.label ?? 'Sin definir'} />
            <span className="text-[10px] font-semibold text-gray-500">{m.label}</span>
          </div>
        )
      })}
    </div>
  )
}
