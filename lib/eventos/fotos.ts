import { getEventoCentro, getMananaMagica } from './store'

/** Carteles subidos desde el panel: mandan sobre las fotos fijas del catálogo. */
export async function fotosDeEventos(): Promise<Record<string, string>> {
  const [dsc, dom, hw, mm] = await Promise.all([
    getEventoCentro('dias-sin-cole'), getEventoCentro('domingos'), getEventoCentro('halloween'), getMananaMagica(),
  ])
  const fotos: Record<string, string> = {}
  if (dsc.imagen) fotos.diassinc = dsc.imagen
  if (dom.imagen) fotos.domingos = dom.imagen
  if (hw.imagen) fotos.halloween = hw.imagen
  if (mm.imagen) fotos['manana-magica'] = mm.imagen
  return fotos
}
