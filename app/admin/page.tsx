export default function AdminPage() {
  return (
    <div className="min-h-screen bg-pm-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-pm-navy mb-8">Panel de administración</h1>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[
            { label: 'Reservas hoy', valor: '0' },
            { label: 'Esta semana', valor: '0' },
            { label: 'Ingresos mes', valor: '0€' },
            { label: 'Pendientes', valor: '0' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-2xl font-black text-pm-navy">{m.valor}</div>
              <div className="text-gray-500 text-sm mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
