// ─────────────────────────────────────────────────────────────────────────────
// Periodo especial de septiembre del Club Deportivo Origen (previo al inicio
// normal de octubre). Datos centralizados aquí para poder moverlos a la
// configuración editable del admin en la Fase D (punto 23) sin tocar el diseño.
// ponytail: constante fija por ahora; pasar a global_config cuando se pida.
// ─────────────────────────────────────────────────────────────────────────────

export const SEPTIEMBRE = {
  activo: true,
  titulo: 'Septiembre de preparación',
  intro: 'Antes del inicio normal en octubre, abrimos dos semanas especiales en septiembre para ir cogiendo ritmo.',
  semanas: [
    { label: 'Semana 1', fechas: 'Del 14 al 17 de septiembre' },
    { label: 'Semana 2', fechas: 'Del 21 al 25 de septiembre' },
  ],
  precios: [
    { concepto: '1 hora a la semana', precio: '20 €' },
    { concepto: '2 horas a la semana', precio: '35 €' },
  ],
} as const

/** Servicios del club donde se muestra el panel de septiembre. */
export const SERVICIOS_SEPTIEMBRE = ['gimnasia-acrobatica', 'telas-aereas', 'escuela-infantil'] as const
