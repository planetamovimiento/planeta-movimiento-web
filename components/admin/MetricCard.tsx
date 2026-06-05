type Props = {
  label: string
  valor: string
  tendencia?: string
  positivo?: boolean
}

export default function MetricCard({ label, valor, tendencia, positivo }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="text-2xl font-black text-pm-navy">{valor}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
      {tendencia && (
        <div className={`text-xs font-semibold mt-2 ${positivo ? 'text-green-600' : 'text-red-500'}`}>
          {tendencia}
        </div>
      )}
    </div>
  )
}
