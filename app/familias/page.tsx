import { requireFamilia } from '@/lib/familias/auth'
import { getAlumnosDeFamilia } from '@/lib/familias/data'
import { getTemporadaActiva } from '@/lib/config/store'
import { temporadaDisplay } from '@/lib/club/constants'
import { getAvisosActivos } from '@/lib/familias/avisos'
import { getEventos, getExcepciones, getTipos } from '@/lib/calendario-club/data'
import { expandirOcurrencias } from '@/lib/calendario-club/expand'
import { ocurrenciasDeFamilia } from '@/lib/familias/calendario'
import { AvisosClub } from '@/components/familias/AvisosClub'
import { CabeceraFamilia } from '@/components/familias/CabeceraFamilia'
import { CalendarioClub } from '@/components/familias/CalendarioClub'
import { vigentesDeFamilia, normNombre } from '@/lib/autorizaciones/store'
import type { Relacion } from '@/lib/autorizaciones/documento'
import PanelesHijos from './PanelesHijos'
import AutorizacionHijos, { type EstadoAutorizacionHijo } from './AutorizacionHijos'

export const dynamic = 'force-dynamic'

export default async function FamiliasDashboard() {
  const familia = await requireFamilia()
  const [alumnos, tempRaw, avisos, eventos, excepciones, tipos, autorizaciones] = await Promise.all([
    getAlumnosDeFamilia(familia.id), getTemporadaActiva(), getAvisosActivos(),
    getEventos(), getExcepciones(), getTipos(), vigentesDeFamilia(familia.id, familia.email),
  ])
  const saludo = familia.nombre ? familia.nombre.split(' ')[0] : ''

  // Autorización de imagen: una por hijo (el mismo niño puede venir de la
  // inscripción y del alta de socio; se agrupa por nombre).
  const hijosAut = new Map<string, EstadoAutorizacionHijo>()
  for (const a of [...alumnos].sort((x, y) => Number(x.soloSocio) - Number(y.soloSocio))) {
    const nombre = `${a.nombre} ${a.apellidos}`.trim(), k = normNombre(nombre)
    if (!nombre || hijosAut.has(k)) continue
    const v = autorizaciones?.get(k)
    hijosAut.set(k, {
      id: a.id, nombre,
      firmada: v ? {
        fecha: v.created_at,
        previa: {
          tutorNombre: v.tutor_nombre, tutorDni: v.tutor_dni, relacion: v.tutor_relacion as Relacion,
          canales: { web: v.web, redes: v.redes, material: v.material, memorias: v.memorias },
        },
      } : null,
    })
  }

  // Calendario del Club: clases, festivos y eventos PÚBLICOS de la temporada.
  const startYear = parseInt(tempRaw.slice(0, 4), 10) || new Date().getFullYear()
  const calDesde = `${startYear}-09-01`, calHasta = `${startYear + 1}-08-31`
  const ocurrencias = ocurrenciasDeFamilia(expandirOcurrencias(eventos, excepciones, calDesde, calHasta), alumnos)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <CabeceraFamilia saludo={saludo} numeroSocio={familia.numero_socio} temporada={temporadaDisplay(tempRaw)} nParticipantes={alumnos.length} />

      <AvisosClub avisos={avisos} />

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
          Todavía no hay participantes vinculados a tu cuenta. Contacta con el Club Deportivo Origen.
        </div>
      ) : (
        <PanelesHijos alumnos={alumnos} />
      )}

      {autorizaciones && hijosAut.size > 0 && <AutorizacionHijos hijos={[...hijosAut.values()]} tutorNombre={familia.nombre ?? ''} />}

      {ocurrencias.length > 0 && (
        <CalendarioClub ocurrencias={ocurrencias} tipos={tipos} desde={calDesde} hasta={calHasta} />
      )}
    </div>
  )
}
