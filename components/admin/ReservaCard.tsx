import type { Reserva } from '@/types'

type EstadoType = Reserva['estado']

const ESTADO_STYLES: Record<EstadoType, { bg: string; text: string; label: string }> = {
  pendiente:   { bg: '#FEF9C3', text: '#854D0E', label: 'Pendiente' },
  confirmada:  { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmada' },
  pagada:      { bg: '#DCFCE7', text: '#166534', label: 'Pagada' },
  cancelada:   { bg: '#FFF0F0', text: '#D42B2B', label: 'Cancelada' },
  completada:  { bg: '#F3F4F6', text: '#374151', label: 'Completada' },
}

type BadgeProps = { estado: EstadoType }

export function EstadoBadge({ estado }: BadgeProps) {
  const s = ESTADO_STYLES[estado]
  return (
    <span
      className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

type Props = {
  reserva: Pick<Reserva, 'numero' | 'fecha' | 'hora_inicio' | 'estado' | 'total'> & {
    clienteNombre: string
    servicioNombre: string
  }
  onVer?: () => void
  onEditar?: () => void
}

export default function ReservaCard({ reserva, onVer, onEditar }: Props) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-pm-red font-semibold">{reserva.numero}</td>
      <td className="px-4 py-3 text-sm text-gray-800">{reserva.clienteNombre}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{reserva.servicioNombre}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{reserva.fecha} {reserva.hora_inicio}</td>
      <td className="px-4 py-3"><EstadoBadge estado={reserva.estado} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={onVer} title="Ver" className="p-1.5 text-gray-400 hover:text-pm-navy transition-colors rounded-lg hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button onClick={onEditar} title="Editar" className="p-1.5 text-gray-400 hover:text-pm-navy transition-colors rounded-lg hover:bg-gray-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
