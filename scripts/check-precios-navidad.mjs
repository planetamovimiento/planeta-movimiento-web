// Comprobación de los precios y descuentos de La Fábrica de Papá Noel.
// Son los casos que pidió Carlos. Ejecutar:  node scripts/check-precios-navidad.mjs
import assert from 'node:assert/strict'
import { calcularPrecio, eurosDeCents } from '../lib/navidad/precios.ts'

const casos = [
  ['1 niño + 1 adulto = 33 €',              { ninos: 1, adultos: 1, bebes: 0 }, false, 3300, 'ninguno', 2],
  ['6 niños = 76,50 € (grupo −15 %)',       { ninos: 6, adultos: 0, bebes: 0 }, false, 7650, 'grupo',   6],
  ['4 niños + 2 adultos = 81,60 €',         { ninos: 4, adultos: 2, bebes: 0 }, false, 8160, 'grupo',   6],
  ['socio + 2 niños = 25,50 €',             { ninos: 2, adultos: 0, bebes: 0 }, true,  2550, 'socio',   2],
  ['socio + 6 niños = 76,50 € (un solo 15 %)', { ninos: 6, adultos: 0, bebes: 0 }, true, 7650, 'grupo', 6],
  ['5 de pago + 1 bebé: sin grupo',         { ninos: 3, adultos: 2, bebes: 1 }, false, 8100, 'ninguno', 6],
  ['bebés gratis pero ocupan plaza',        { ninos: 0, adultos: 2, bebes: 3 }, false, 3600, 'ninguno', 5],
]

let fallos = 0
for (const [nombre, entradas, socio, totalEsperado, tipoEsperado, plazasEsperadas] of casos) {
  const c = calcularPrecio(entradas, { socioVerificado: socio })
  try {
    assert.equal(c.totalCents, totalEsperado, `total ${eurosDeCents(c.totalCents)} ≠ ${eurosDeCents(totalEsperado)}`)
    assert.equal(c.tipo, tipoEsperado, `descuento "${c.tipo}" ≠ "${tipoEsperado}"`)
    assert.equal(c.plazas, plazasEsperadas, `plazas ${c.plazas} ≠ ${plazasEsperadas}`)
    console.log(`OK   ${nombre} → ${eurosDeCents(c.totalCents)}`)
  } catch (e) {
    fallos++
    console.log(`FALLA ${nombre}: ${e.message}`)
  }
}

// Los descuentos nunca se suman: grupo y socio a la vez sigue siendo un único 15 %.
const ambos = calcularPrecio({ ninos: 6, adultos: 2, bebes: 1 }, { socioVerificado: true })
assert.equal(ambos.pct, 15)
assert.equal(ambos.plazas, 9)

console.log(fallos === 0 ? '\nTodo correcto.' : `\n${fallos} caso(s) mal.`)
process.exit(fallos === 0 ? 0 : 1)
