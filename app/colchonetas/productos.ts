// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE COLCHONETAS
// Datos reales extraídos de planetamovimiento.com. Editar aquí para actualizar.
// ─────────────────────────────────────────────────────────────────────────────

export type Variante = {
  id: string
  label: string        // "200 × 100 × 20 cm"
  precio: number       // €, IVA incluido
  nota?: string        // "IVA y transporte incluidos"
}

export type Color = {
  id: string
  label: string
  hex: string          // color de la funda
  hexEdge: string      // color del canto (más oscuro)
}

export type FichaRow = { campo: string; valor: string }

export type Producto = {
  id: string
  nombre: string
  tagline: string
  descripcionCorta: string
  descripcionLarga: string[]
  precioDesde: number
  icon: string
  grad: string             // gradiente del panel
  variantes: Variante[]
  colores: Color[]
  caracteristicas: string[]
  materiales: string[]
  usos: string[]
  ficha: FichaRow[]
}

// Paleta estándar de polipiel náutica (otros colores bajo personalización)
const COLORES_BASE: Color[] = [
  { id: 'azul',  label: 'Azul marino', hex: '#1A2A5E', hexEdge: '#0F1A3D' },
  { id: 'rojo',  label: 'Rojo',        hex: '#D42B2B', hexEdge: '#A81E1E' },
  { id: 'negro', label: 'Negro',       hex: '#1F2937', hexEdge: '#111827' },
  { id: 'verde', label: 'Verde',       hex: '#2F7D4F', hexEdge: '#205437' },
  { id: 'gris',  label: 'Gris',        hex: '#6B7280', hexEdge: '#4B5563' },
]

export const PRODUCTOS: Producto[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'nube-portatil',
    nombre: 'Nube Portátil',
    tagline: 'La alternativa portátil al foso tradicional',
    descripcionCorta:
      'Solución profesional para trabajar saltos, caídas y ejercicios de impacto sin instalación permanente ni obra.',
    descripcionLarga: [
      'La Nube Portátil es una solución profesional alternativa al foso tradicional, diseñada para espacios que requieren versatilidad.',
      'Permite trabajar saltos, caídas y ejercicios de impacto sin instalación permanente ni obra civil.',
      'Ofrece absorción de impacto profesional mediante tecnología de espuma troceada especializada y corte irregular que redistribuye las cargas.',
    ],
    precioDesde: 349,
    icon: '☁️',
    grad: 'from-sky-500 to-blue-700',
    variantes: [
      { id: 'std', label: '200 × 100 × 20 cm', precio: 349, nota: 'IVA incluido' },
    ],
    colores: COLORES_BASE,
    caracteristicas: [
      'Corte irregular para redistribución de cargas',
      '4 asas laterales reforzadas',
      'Sistema de cierre por velcro',
      '2 ventanas de aire (superior e inferior)',
      'Solo 10 kg — fácil de transportar',
      'Doble funda de alta resistencia',
    ],
    materiales: [
      'Relleno: espuma troceada de poliuretano/HR (densidad 20 kg/m³)',
      'Funda exterior: tejido stretch',
      'Funda interior: polipiel náutica (resistencia reforzada)',
    ],
    usos: ['Colegios', 'Clubes de gimnasia', 'Parkour', 'Artes marciales', 'Entrenamiento funcional', 'Centros deportivos'],
    ficha: [
      { campo: 'Dimensiones', valor: '200 × 100 × 20 cm' },
      { campo: 'Peso', valor: '10 kg' },
      { campo: 'Relleno', valor: 'Espuma troceada PU/HR' },
      { campo: 'Densidad', valor: '20 kg/m³' },
      { campo: 'Cierre', valor: 'Velcro' },
      { campo: 'Asas', valor: '4 laterales reforzadas' },
      { campo: 'Ventilación', valor: '2 ventanas de aire' },
      { campo: 'A medida', valor: 'Disponible bajo pedido' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'dual-impact',
    nombre: 'Dual Impact',
    tagline: 'Doble cara, doble comportamiento técnico',
    descripcionCorta:
      'Colchoneta profesional reversible de doble absorción para impacto medio y alto. Dos caras con comportamientos distintos.',
    descripcionLarga: [
      'Dual Impact es una colchoneta profesional de doble absorción para impacto medio y alto.',
      'Combina espuma de alta densidad con una capa viscoelástica para una absorción progresiva del impacto.',
      'Su gran ventaja: es reversible, con dos comportamientos técnicos según la cara que uses.',
    ],
    precioDesde: 559,
    icon: '🔄',
    grad: 'from-pm-red to-purple-700',
    variantes: [
      { id: 'std', label: '200 × 200 × 20 cm', precio: 559, nota: 'IVA incluido' },
    ],
    colores: COLORES_BASE,
    caracteristicas: [
      'Cara 1 · Modo Estabilidad: 10 cm de espuma HR (26 kg/m³), base firme para recepciones de pie, saltos técnicos y precisión',
      'Cara 2 · Modo Absorción: 10 cm de espuma viscoelástica para recepciones de espaldas, caídas laterales y acrobacia intensiva',
      '4 asas laterales reforzadas',
      'Cierre por velcro o cremallera',
      'Superficie amplia para mayor zona de seguridad',
      'Diseñada para uso intensivo profesional',
    ],
    materiales: [
      'Cara firme: espuma HR de 10 cm (densidad 26 kg/m³)',
      'Cara absorción: espuma viscoelástica de 10 cm',
      'Funda: polipiel náutica de interior',
    ],
    usos: ['Gimnasia artística', 'Centros deportivos', 'Parkour', 'Artes marciales', 'Colegios con programas avanzados'],
    ficha: [
      { campo: 'Dimensiones', valor: '200 × 200 × 20 cm' },
      { campo: 'Cara firme', valor: 'Espuma HR 26 kg/m³ (10 cm)' },
      { campo: 'Cara absorción', valor: 'Viscoelástica (10 cm)' },
      { campo: 'Reversible', valor: 'Sí — 2 comportamientos' },
      { campo: 'Cierre', valor: 'Velcro o cremallera' },
      { campo: 'Asas', valor: '4 laterales reforzadas' },
      { campo: 'A medida', valor: 'Disponible bajo pedido' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'quitamiedos',
    nombre: 'Quitamiedos',
    tagline: 'Máxima protección para recepciones exigentes',
    descripcionCorta:
      'Colchoneta profesional de 40 cm de grosor para absorber impactos de mayor altura y proteger en recepciones exigentes.',
    descripcionLarga: [
      'El Quitamiedos está diseñado para absorber impactos de mayor altura y proteger al deportista en recepciones exigentes.',
      'Destaca por tres aspectos clave: mayor grosor (40 cm), mayor superficie y mayor margen de seguridad.',
      'Orientado a clubes, gimnasios y centros educativos que trabajan disciplinas con riesgo real de caída.',
    ],
    precioDesde: 699,
    icon: '🛡️',
    grad: 'from-emerald-600 to-teal-800',
    variantes: [
      { id: 'm1', label: '220 × 220 × 40 cm', precio: 699, nota: 'IVA y transporte incluidos' },
      { id: 'm2', label: '300 × 200 × 40 cm', precio: 799, nota: 'IVA y transporte incluidos' },
    ],
    colores: COLORES_BASE,
    caracteristicas: [
      '40 cm de grosor para máxima absorción',
      'Mayor superficie y margen de seguridad',
      'Espuma de poliuretano HR (densidad 20 kg/m³)',
      '4 asas laterales',
      'Cierre por velcro o cremallera',
      'Pensada para uso intensivo y duradero',
    ],
    materiales: [
      'Relleno: espuma de poliuretano HR (densidad 20 kg/m³)',
      'Funda: polipiel náutica de interior',
    ],
    usos: ['Gimnasia artística', 'Parkour', 'Artes marciales', 'Entrenamiento acrobático', 'Colegios con programas avanzados'],
    ficha: [
      { campo: 'Grosor', valor: '40 cm' },
      { campo: 'Medidas', valor: '220×220 / 300×200' },
      { campo: 'Relleno', valor: 'Espuma PU HR' },
      { campo: 'Densidad', valor: '20 kg/m³' },
      { campo: 'Cierre', valor: 'Velcro o cremallera' },
      { campo: 'Asas', valor: '4 laterales' },
      { campo: 'A medida', valor: 'Disponible bajo pedido' },
    ],
  },
]
