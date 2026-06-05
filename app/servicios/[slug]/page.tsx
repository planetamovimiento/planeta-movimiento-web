export default function ServicioPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-pm-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-black text-pm-navy mb-4 capitalize">{params.slug}</h1>
        <p className="text-gray-500">Detalle del servicio próximamente</p>
      </div>
    </div>
  )
}
