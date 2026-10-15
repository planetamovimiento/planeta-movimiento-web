// Comprueba las fechas de las temporadas. Ejecutar: node scripts/check-temporada.mjs
import assert from 'node:assert/strict'
import { temporadaDe } from '../lib/temporada.ts'

const casos = [
  [10, 9, ''], [10, 10, 'halloween'], [10, 31, 'halloween'], [11, 1, 'halloween'],
  [11, 2, ''], [11, 30, ''], [12, 1, 'navidad'], [12, 31, 'navidad'],
  [1, 1, 'navidad'], [1, 6, 'navidad'], [1, 7, ''], [6, 15, ''],
]
for (const [m, d, esperado] of casos) {
  assert.equal(temporadaDe(m, d), esperado, `${d}/${m} → "${temporadaDe(m, d)}" (esperado "${esperado}")`)
}
console.log(`OK: ${casos.length} fechas comprobadas`)
