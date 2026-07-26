// ─────────────────────────────────────────────────────────────────────────────
// Dinero de facturación. TODO en céntimos (enteros): nada de coma flotante.
//
// Fichero PURO (sin imports): lo usan el formulario (cliente) y las acciones
// (servidor), y se puede ejecutar solo para el self-test del final.
//
// El IVA y el IRPF se redondean por GRUPO de tipo, no línea a línea: es como se
// muestran en la factura y evita que la suma de redondeos por línea descuadre
// respecto al total por tipo impositivo.
// ─────────────────────────────────────────────────────────────────────────────

/** Redondeo a entero, medio-arriba en valor absoluto (2,5→3, −2,5→−3). */
export function redondear(x: number): number {
  return Math.sign(x) * Math.round(Math.abs(x))
}

export type LineaEntrada = {
  cantidad: number          // admite decimales (horas, kg…)
  precioCents: number       // precio unitario en céntimos
  descuentoPct?: number     // % sobre el bruto de la línea
  descuentoCents?: number   // descuento fijo adicional en céntimos
  ivaPct?: number           // 21, 10, 4, 0…
  ivaTipo?: 'normal' | 'exento' | 'no_sujeto'
  irpfPct?: number          // retención de la línea
}

export type LineaCalculada = {
  brutoCents: number        // cantidad × precio
  descuentoCents: number    // descuento total aplicado (pct + fijo)
  baseCents: number         // bruto − descuentos (nunca < 0)
  ivaCents: number          // informativo por línea
  irpfCents: number         // informativo por línea
  totalCents: number        // base + IVA − IRPF
}

export type GrupoImpuesto = { pct: number; baseCents: number; cuotaCents: number }

export type TotalesDocumento = {
  lineas: LineaCalculada[]
  gruposIva: GrupoImpuesto[]
  gruposIrpf: GrupoImpuesto[]
  baseCents: number         // suma de bases
  descuentoCents: number    // suma de descuentos (para mostrar)
  ivaCents: number          // suma de cuotas de IVA
  irpfCents: number         // suma de retenciones
  suplidosCents: number
  totalCents: number        // base + IVA − IRPF + suplidos
}

/** ¿Este tipo de línea lleva IVA? exento/no_sujeto = 0. */
function llevaIva(l: LineaEntrada): boolean {
  return (l.ivaTipo ?? 'normal') === 'normal'
}

/** Cálculo de una línea. */
export function calcularLinea(l: LineaEntrada): LineaCalculada {
  const bruto = redondear((l.cantidad || 0) * (l.precioCents || 0))
  const descPct = redondear(bruto * (l.descuentoPct || 0) / 100)
  const desc = descPct + (l.descuentoCents || 0)
  const base = Math.max(0, bruto - desc)
  const iva = llevaIva(l) ? redondear(base * (l.ivaPct || 0) / 100) : 0
  const irpf = redondear(base * (l.irpfPct || 0) / 100)
  return { brutoCents: bruto, descuentoCents: desc, baseCents: base, ivaCents: iva, irpfCents: irpf, totalCents: base + iva - irpf }
}

/**
 * Totales del documento. Agrupa por tipo de IVA y de IRPF y redondea una sola
 * vez por grupo (norma española).
 */
export function calcularDocumento(entradas: LineaEntrada[], suplidosCents = 0): TotalesDocumento {
  const lineas = entradas.map(calcularLinea)

  const ivaPorPct = new Map<number, number>()   // pct → base acumulada (solo líneas con IVA)
  const irpfPorPct = new Map<number, number>()

  entradas.forEach((e, i) => {
    const base = lineas[i].baseCents
    if (llevaIva(e)) {
      const pct = e.ivaPct || 0
      ivaPorPct.set(pct, (ivaPorPct.get(pct) || 0) + base)
    }
    if ((e.irpfPct || 0) !== 0) {
      const pct = e.irpfPct || 0
      irpfPorPct.set(pct, (irpfPorPct.get(pct) || 0) + base)
    }
  })

  const grupo = (m: Map<number, number>): GrupoImpuesto[] =>
    [...m.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([pct, baseCents]) => ({ pct, baseCents, cuotaCents: redondear(baseCents * pct / 100) }))

  const gruposIva = grupo(ivaPorPct)
  const gruposIrpf = grupo(irpfPorPct)

  const baseCents = lineas.reduce((s, l) => s + l.baseCents, 0)
  const descuentoCents = lineas.reduce((s, l) => s + l.descuentoCents, 0)
  const ivaCents = gruposIva.reduce((s, g) => s + g.cuotaCents, 0)
  const irpfCents = gruposIrpf.reduce((s, g) => s + g.cuotaCents, 0)

  return {
    lineas, gruposIva, gruposIrpf,
    baseCents, descuentoCents, ivaCents, irpfCents, suplidosCents,
    totalCents: baseCents + ivaCents - irpfCents + suplidosCents,
  }
}

// ── Formato y parseo (es-ES) ──────────────────────────────────────────────

/** Céntimos → "1.234,56 €". */
export function eur(cents: number, moneda = 'EUR'): string {
  const s = (Math.abs(cents) / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const simbolo = moneda === 'EUR' ? ' €' : ` ${moneda}`
  return (cents < 0 ? '−' : '') + s + simbolo
}

/** Céntimos → "1.234,56" (sin símbolo, para inputs). */
export function centsAInput(cents: number | null | undefined): string {
  if (cents == null) return ''
  return (cents / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
}

/**
 * Texto del usuario → céntimos. Acepta "1.234,56", "1234,56", "1234.56", "12".
 * Devuelve null si no es un número válido.
 */
export function inputACents(texto: string): number | null {
  const t = (texto ?? '').trim()
  if (t === '') return null
  // Se quita el separador de miles y se normaliza la coma decimal a punto.
  let limpio = t.replace(/\s/g, '').replace(/€/g, '')
  if (limpio.includes(',')) limpio = limpio.replace(/\./g, '').replace(',', '.')
  const n = Number(limpio)
  if (!Number.isFinite(n)) return null
  return redondear(n * 100)
}

/** Texto → número (cantidad, porcentaje). null si inválido. */
export function inputANumero(texto: string): number | null {
  const t = (texto ?? '').trim()
  if (t === '') return null
  let limpio = t.replace(/\s/g, '')
  if (limpio.includes(',')) limpio = limpio.replace(/\./g, '').replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : null
}

// ── Self-test (node --experimental-strip-types lib/facturacion/dinero.ts) ──
// ponytail: sin framework. Un assert por caso; falla ruidoso si la math rompe.
function selfTest() {
  const assert = (cond: boolean, msg: string) => { if (!cond) { throw new Error('FALLA: ' + msg) } }

  // 1. 2 × 10,00 € al 21%
  let d = calcularDocumento([{ cantidad: 2, precioCents: 1000, ivaPct: 21 }])
  assert(d.baseCents === 2000 && d.ivaCents === 420 && d.totalCents === 2420, 'línea simple 21%')

  // 2. Descuento 10% sobre 100,00 €
  d = calcularDocumento([{ cantidad: 1, precioCents: 10000, descuentoPct: 10, ivaPct: 21 }])
  assert(d.baseCents === 9000 && d.ivaCents === 1890 && d.totalCents === 10890, 'descuento 10%')

  // 3. Dos tipos de IVA distintos, agrupados
  d = calcularDocumento([
    { cantidad: 1, precioCents: 10000, ivaPct: 21 },
    { cantidad: 1, precioCents: 10000, ivaPct: 10 },
  ])
  assert(d.gruposIva.length === 2 && d.ivaCents === 2100 + 1000, 'dos tipos de IVA')

  // 4. Retención IRPF 15%
  d = calcularDocumento([{ cantidad: 1, precioCents: 100000, ivaPct: 21, irpfPct: 15 }])
  assert(d.ivaCents === 21000 && d.irpfCents === 15000 && d.totalCents === 106000, 'IRPF 15%')

  // 5. Redondeo por GRUPO ≠ suma de redondeos por línea
  //    3 líneas base 3,33/3,33/3,34 al 10% → grupo: 10,00×0,10 = 100 céntimos.
  d = calcularDocumento([
    { cantidad: 1, precioCents: 333, ivaPct: 10 },
    { cantidad: 1, precioCents: 333, ivaPct: 10 },
    { cantidad: 1, precioCents: 334, ivaPct: 10 },
  ])
  assert(d.baseCents === 1000 && d.ivaCents === 100, 'IVA por grupo, no por línea')

  // 6. Exento no lleva IVA
  d = calcularDocumento([{ cantidad: 1, precioCents: 5000, ivaTipo: 'exento', ivaPct: 21 }])
  assert(d.ivaCents === 0 && d.totalCents === 5000, 'exento sin IVA')

  // 7. Descuento fijo + porcentual + cantidad decimal
  d = calcularDocumento([{ cantidad: 3, precioCents: 333, descuentoPct: 10, descuentoCents: 50, ivaPct: 21 }])
  // bruto 999, −10%=100 → 899, −50 = 849; IVA 21% = round(178.29)=178
  assert(d.baseCents === 849 && d.ivaCents === 178 && d.totalCents === 1027, 'descuentos combinados')

  // 8. Parseo/formato es-ES
  assert(inputACents('1.234,56') === 123456, 'parseo miles+coma')
  assert(inputACents('1234.56') === 123456, 'parseo punto decimal')
  assert(inputACents('12') === 1200, 'parseo entero')
  assert(inputACents('') === null && inputACents('x') === null, 'parseo inválido')
  // es-ES no agrupa 4 cifras enteras; sí a partir de 5 (regla CLDR).
  assert(eur(1234567) === '12.345,67 €', 'formato eur con miles')
  assert(eur(-5000) === '−50,00 €', 'formato eur negativo')

  console.log('dinero.ts · 9/9 self-test OK')
}

// Se ejecuta solo si el fichero se lanza directo, nunca al importarlo.
if (typeof process !== 'undefined' && process.argv?.[1] && /dinero\.[tj]s$/.test(process.argv[1])) {
  selfTest()
}
