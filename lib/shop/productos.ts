// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE PLANETA SHOP
// Colchonetas de fabricación propia y producto de club. Editar aquí para
// actualizar precios, medidas o fichas técnicas.
// ─────────────────────────────────────────────────────────────────────────────

export type Variante = {
  id: string
  label: string        // "220 × 220 × 40 cm"
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

/** Punto fuerte del producto, como los que van sobre la foto del fabricante. */
export type Destacado = { titulo: string; texto: string }

export type Producto = {
  id: string
  nombre: string
  tagline: string
  /** 'colchoneta' = compra directa · 'reserva' = se reserva y se confirma después. */
  tipo: 'colchoneta' | 'reserva'
  categoria: string
  descripcionCorta: string
  descripcionLarga: string[]
  precioDesde: number
  imagen: string
  grad: string             // gradiente de respaldo si falla la foto
  variantes: Variante[]
  colores: Color[]
  /** Producto textil: tallas disponibles. */
  tallas?: string[]
  /** Producto textil: pide el nombre que va impreso. */
  pideNombre?: boolean
  /** Se recoge en la instalación: no se pide dirección de envío. */
  recogida?: boolean
  /** % de descuento para socios del club (pide el nº de socio). */
  descuentoSocio?: number
  destacados: Destacado[]
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
  { id: 'amarillo', label: 'Amarillo', hex: '#F2B705', hexEdge: '#C08F00' },
]

export const PRODUCTOS: Producto[] = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'quitamiedos',
    nombre: 'Quitamiedos',
    tagline: 'Máxima protección para recepciones exigentes',
    tipo: 'colchoneta',
    categoria: 'Colchonetas',
    descripcionCorta:
      'Colchoneta profesional de 40 cm de grosor para absorber impactos de mayor altura y proteger en recepciones exigentes.',
    descripcionLarga: [
      'El Quitamiedos está diseñado para absorber impactos de mayor altura y proteger al deportista en recepciones exigentes.',
      'Destaca por tres aspectos clave: mayor grosor (40 cm), mayor superficie y mayor margen de seguridad.',
      'Orientado a clubes, gimnasios y centros educativos que trabajan disciplinas con riesgo real de caída.',
    ],
    precioDesde: 699,
    imagen: '/fotos/shop/quitamiedos.webp',
    grad: 'from-emerald-600 to-teal-800',
    variantes: [
      { id: 'm1', label: '220 × 220 × 40 cm', precio: 699, nota: 'IVA y transporte incluidos' },
      { id: 'm2', label: '300 × 200 × 40 cm', precio: 799, nota: 'IVA y transporte incluidos' },
    ],
    colores: COLORES_BASE,
    destacados: [
      { titulo: 'Mayor grosor', texto: '40 cm para máxima absorción' },
      { titulo: 'Mayor superficie', texto: 'Más margen de seguridad' },
      { titulo: 'Espuma PU HR', texto: 'Densidad 20 kg/m³' },
      { titulo: 'Cierre', texto: 'Velcro o cremallera' },
      { titulo: '4 asas laterales', texto: 'Para fácil transporte' },
      { titulo: 'Uso intensivo', texto: 'Pensada para durar años' },
    ],
    caracteristicas: [
      '40 cm de grosor para máxima absorción de impactos',
      'Mayor superficie y margen de seguridad',
      'Espuma de poliuretano HR (densidad 20 kg/m³)',
      '4 asas laterales para moverla entre dos personas',
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
      { campo: 'Medidas', valor: '220 × 220 / 300 × 200' },
      { campo: 'Relleno', valor: 'Espuma PU HR' },
      { campo: 'Densidad', valor: '20 kg/m³' },
      { campo: 'Cierre', valor: 'Velcro o cremallera' },
      { campo: 'Asas', valor: '4 laterales' },
      { campo: 'A medida', valor: 'Disponible bajo pedido' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'dual-impact',
    nombre: 'Quitamiedos Dual Impact',
    tagline: 'Doble cara, doble comportamiento técnico',
    tipo: 'colchoneta',
    categoria: 'Colchonetas',
    descripcionCorta:
      'Colchoneta reversible de doble absorción: una cara firme para recepciones de pie y otra viscoelástica para caídas.',
    descripcionLarga: [
      'Dual Impact es una colchoneta profesional de doble absorción para impacto medio y alto.',
      'Combina espuma de alta densidad con una capa viscoelástica para una absorción progresiva del impacto.',
      'Su gran ventaja: es reversible, con dos comportamientos técnicos según la cara que se use.',
    ],
    precioDesde: 559,
    imagen: '/fotos/shop/dual-impact.webp',
    grad: 'from-amber-500 to-orange-700',
    variantes: [
      { id: 'std', label: '200 × 200 × 20 cm', precio: 559, nota: 'IVA incluido' },
    ],
    colores: COLORES_BASE,
    destacados: [
      { titulo: 'Cara firme', texto: 'Espuma HR 26 kg/m³ (10 cm)' },
      { titulo: 'Cara absorción', texto: 'Viscoelástica de 10 cm' },
      { titulo: 'Cierre', texto: 'Velcro o cremallera' },
      { titulo: 'Funda', texto: 'Polipiel náutica de interior' },
      { titulo: 'Respiraderos', texto: 'Dos compartimentos' },
      { titulo: '4 asas', texto: 'Laterales reforzadas' },
    ],
    caracteristicas: [
      'Cara estabilidad: 10 cm de espuma HR (26 kg/m³) para recepciones de pie y saltos técnicos',
      'Cara absorción: 10 cm de viscoelástica para recepciones de espaldas y acrobacia intensiva',
      '4 asas laterales reforzadas',
      'Respiraderos en los dos compartimentos',
      'Cierre por velcro o cremallera',
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
      { campo: 'Reversible', valor: 'Sí, dos comportamientos' },
      { campo: 'Cierre', valor: 'Velcro o cremallera' },
      { campo: 'Asas', valor: '4 laterales reforzadas' },
      { campo: 'A medida', valor: 'Disponible bajo pedido' },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'camiseta-pro-pm',
    nombre: 'Camiseta 10º Aniversario Planeta Movimiento',
    tagline: 'Edición limitada por los diez años de Planeta Movimiento',
    tipo: 'reserva',
    categoria: 'Edición limitada',
    descripcionCorta:
      'Camiseta técnica de edición limitada por el 10º aniversario, personalizada con el nombre del deportista a la espalda.',
    descripcionLarga: [
      'Camiseta técnica sublimada de edición limitada, creada para celebrar los diez años de Planeta Movimiento.',
      'Lleva el escudo de la Escuela de Superhéroes en el pecho y en la espalda, con el nombre del deportista impreso arriba.',
      'Se fabrica por encargo: se reserva indicando talla y nombre, y se recoge en nuestra instalación cuando esté lista.',
    ],
    precioDesde: 35,
    imagen: '/fotos/shop/camiseta-pro-pm.webp',
    grad: 'from-pm-red to-amber-600',
    variantes: [
      { id: 'unica', label: 'Camiseta personalizada', precio: 35, nota: 'IVA incluido · recogida en la instalación' },
    ],
    colores: [],
    tallas: ['4', '8', '12', '16', 'S', 'M', 'L', 'XL', '2XL'],
    pideNombre: true,
    recogida: true,
    descuentoSocio: 15,
    destacados: [
      { titulo: 'Edición limitada', texto: 'Diez años de Planeta Movimiento' },
      { titulo: 'Nombre a la espalda', texto: 'Personalizada para cada deportista' },
      { titulo: 'Tejido técnico', texto: 'Sublimado, transpirable y ligero' },
      { titulo: 'Por encargo', texto: 'Se fabrica con la reserva cerrada' },
      { titulo: 'Socios del club', texto: '15 % de descuento con tu nº de socio' },
      { titulo: 'Recogida', texto: 'En Polígono Los Palancares, 8' },
    ],
    caracteristicas: [
      'Diseño exclusivo del 10º aniversario',
      'Nombre del deportista impreso en la espalda',
      'Escudo de la Escuela de Superhéroes en pecho y espalda',
      'Tejido técnico sublimado y transpirable',
      'Tallaje infantil y adulto',
    ],
    materiales: ['Tejido técnico de poliéster con sublimación integral'],
    usos: ['Entrenamientos', 'Competiciones', 'Eventos del club', 'Uso diario'],
    ficha: [
      { campo: 'Edición', valor: '10º aniversario, limitada' },
      { campo: 'Tallas', valor: 'De la 4 a la 2XL' },
      { campo: 'Personalización', valor: 'Nombre a la espalda' },
      { campo: 'Precio', valor: '35 € (IVA incluido)' },
      { campo: 'Socios del club', valor: '15 % de descuento' },
      { campo: 'Fabricación', valor: 'Por encargo' },
      { campo: 'Entrega', valor: 'Recogida en Polígono Los Palancares, 8' },
    ],
  },
]

export const PRODUCTOS_MAP = new Map(PRODUCTOS.map(p => [p.id, p]))
