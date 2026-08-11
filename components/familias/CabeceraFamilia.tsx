// Cabecera de bienvenida del portal. Presentacional: la usan el portal público
// y la vista previa de admin ("Ver como familia") para mostrar lo mismo.

export function CabeceraFamilia({ saludo, numeroSocio, temporada, nParticipantes }: {
  saludo: string
  numeroSocio?: string | null
  temporada: string
  nParticipantes: number
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-pm-navy to-pm-navy-md text-white p-6 sm:p-7 mb-6">
      <div className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">Portal de Familias</div>
      <h1 className="text-2xl sm:text-3xl font-black leading-tight">Hola{saludo ? `, ${saludo}` : ''}</h1>
      <div className="flex flex-wrap gap-2 mt-4">
        {numeroSocio && <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold">Socio {numeroSocio}</span>}
        <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold">Temporada {temporada}</span>
        <span className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold">
          {nParticipantes} {nParticipantes === 1 ? 'participante' : 'participantes'}
        </span>
      </div>
    </div>
  )
}
