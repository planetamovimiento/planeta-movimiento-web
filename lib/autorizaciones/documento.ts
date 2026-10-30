// ─────────────────────────────────────────────────────────────────────────────
// Autorización para la captación y uso de imágenes de menores (texto de
// protección de datos, Word «Planeta Carlos 20261028»). Archivo puro: lo usan el
// formulario (cliente) y el servidor. Si cambia el texto, sube VERSION: cada
// firma guarda la versión y la huella del texto que se aceptó.
// ─────────────────────────────────────────────────────────────────────────────

export const VERSION_AUTORIZACION = '2026-10-28'

export type CanalId = 'web' | 'redes' | 'material' | 'memorias'

export const CANALES: { id: CanalId; label: string; corto: string }[] = [
  { id: 'web', label: 'Página web corporativa de la entidad.', corto: 'Web' },
  { id: 'redes', label: 'Redes sociales oficiales de la entidad.', corto: 'Redes' },
  { id: 'material', label: 'Material informativo y divulgativo, impreso o digital.', corto: 'Material' },
  { id: 'memorias', label: 'Memorias, presentaciones y publicaciones relacionadas con las actividades de la entidad.', corto: 'Memorias' },
]

export type Relacion = 'padre' | 'madre' | 'tutor'
export const RELACIONES: { id: Relacion; label: string }[] = [
  { id: 'padre', label: 'Padre' }, { id: 'madre', label: 'Madre' }, { id: 'tutor', label: 'Tutor/a legal' },
]

/** Lo que firma el tutor (igual en el portal y en el enlace). */
export type DatosFirma = {
  tutorNombre: string
  tutorDni: string
  relacion: Relacion | ''
  canales: Record<CanalId, boolean | null>   // null = sin marcar
  declaracion: boolean
  conformidadMenor: boolean
}

/** Bloques del documento, tal cual el Word. */
export const TEXTO = {
  titulo: 'Autorización para la captación y uso de imágenes de menores',
  autorizo: 'AUTORIZO expresamente a Planeta Carlos, S. L. a captar fotografías y/o vídeos en los que pueda aparecer la imagen del menor, realizados con motivo de las actividades, eventos o actuaciones organizadas por la entidad, y a utilizarlos únicamente para las finalidades y a través de los canales autorizados a continuación.',
  finalidad: 'Las imágenes podrán utilizarse para informar, promocionar y difundir las actividades desarrolladas por la entidad. Marque de forma independiente las opciones que autoriza:',
  limite: 'La autorización se limita a las finalidades y canales expresamente seleccionados. No ampara la utilización de las imágenes para fines diferentes ni permite su cesión a terceros para finalidades propias ajenas a las indicadas.',
  internet: 'ADVERTENCIA SOBRE INTERNET Y REDES SOCIALES: Cuando se autorice la publicación en Internet o redes sociales, las imágenes podrán resultar accesibles a terceros. Debido a las características de estos medios, Planeta Carlos, S. L. no puede garantizar el control absoluto sobre copias o usos posteriores realizados por terceros ajenos a la entidad, sin perjuicio de adoptar las medidas razonables que procedan ante una solicitud de retirada.',
  voluntario: 'CARÁCTER VOLUNTARIO: La autorización es voluntaria. La negativa a autorizar la captación o difusión de la imagen no supondrá un trato desfavorable ni impedirá la participación del menor en la actividad, salvo que la captación resulte imprescindible para una actividad concreta, circunstancia que deberá informarse previamente.',
  proteccion: 'Responsable del tratamiento: Planeta Carlos, S. L. Finalidad: Captación y utilización de fotografías y/o vídeos del menor para las finalidades y canales expresamente autorizados. Legitimación: Consentimiento, que podrá retirarse en cualquier momento. Destinatarios: Las imágenes podrán resultar accesibles públicamente cuando se difundan a través de los canales autorizados. No se prevén otras comunicaciones, salvo obligación legal. Conservación: Las imágenes se conservarán mientras se mantenga la finalidad autorizada y no se retire el consentimiento, sin perjuicio de los plazos necesarios para atender posibles responsabilidades. Derechos: Puede retirar el consentimiento y ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, cuando procedan, dirigiéndose a Polígono Los Palancares 8, 16004 Cuenca. Información adicional: Puede consultar la información adicional en www.planetamovimiento.com. La retirada del consentimiento no afectará a la licitud del tratamiento efectuado con anterioridad.',
  declaracion: 'DECLARO que ostento la patria potestad o tutela del menor anteriormente identificado, que dispongo de facultades suficientes para otorgar esta autorización y que no conozco oposición, limitación o resolución judicial que me impida prestarla.',
  conformidad: 'Conformidad del menor, cuando proceda por su edad y madurez: el menor ha recibido una explicación comprensible sobre el uso de su imagen y manifiesta su conformidad con las opciones señaladas en este documento.',
} as const

const PREFIJO_NIE: Record<string, string> = { X: '0', Y: '1', Z: '2' }

/** DNI (8 cifras + letra) o NIE (X/Y/Z + 7 cifras + letra), con letra de control. */
export function dniValido(v: string): boolean {
  const m = /^(?:([XYZ])(\d{7})|(\d{8}))([A-Z])$/.exec(v.toUpperCase().replace(/[\s.-]/g, ''))
  if (!m) return false
  const n = Number(m[1] ? PREFIJO_NIE[m[1]] + m[2] : m[3])
  return 'TRWAGMYFPDXBNJZSQVHLCKE'[n % 23] === m[4]
}

/** Normaliza lo que llega del navegador (en el servidor nada se da por bueno). */
export function firmaDeEntrada(x: unknown): DatosFirma {
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>
  const c = (o.canales && typeof o.canales === 'object' ? o.canales : {}) as Record<string, unknown>
  const bool = (v: unknown) => (v === true ? true : v === false ? false : null)
  const rel = RELACIONES.find(r => r.id === o.relacion)?.id ?? ''
  return {
    tutorNombre: String(o.tutorNombre ?? '').slice(0, 120),
    tutorDni: String(o.tutorDni ?? '').slice(0, 20),
    relacion: rel,
    canales: { web: bool(c.web), redes: bool(c.redes), material: bool(c.material), memorias: bool(c.memorias) },
    declaracion: o.declaracion === true,
    conformidadMenor: o.conformidadMenor === true,
  }
}

/** Error a mostrar, o '' si la firma está completa. */
export function validarFirma(d: DatosFirma): string {
  if (CANALES.some(c => d.canales[c.id] == null)) return 'Marca «Autorizo» o «No autorizo» en cada uno de los cuatro usos.'
  if (d.tutorNombre.trim().length < 5) return 'Escribe tu nombre y apellidos.'
  if (!dniValido(d.tutorDni)) return 'El DNI/NIE no es válido. Revisa los números y la letra.'
  if (!d.relacion) return 'Indica si actúas como padre, madre o tutor/a legal.'
  if (!d.declaracion) return 'Para firmar tienes que marcar la declaración de patria potestad o tutela.'
  return ''
}
