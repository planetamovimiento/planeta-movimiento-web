// Comprueba la lectura de fechas escritas a mano. Ejecutar: node scripts/check-fecha-texto.mjs
import assert from 'node:assert/strict'
import { fechaDeTexto } from '../lib/fechas/texto.ts'

const hoy = '2026-10-21'
const casos = [
  ['Sábado 31 de octubre', '2026-10-31'],
  ['5 de enero', '2027-01-05'],          // ya pasó este año → el que viene
  ['Domingo 4 de enero de 2027', '2027-01-04'],
  ['31 oct → 1 nov', null],              // sin «de <mes>»: no se adivina
  ['Martes y jueves', null],
  ['32 de octubre', null],
]
for (const [texto, esperado] of casos) assert.equal(fechaDeTexto(texto, hoy), esperado, texto)
console.log(`OK: ${casos.length} textos comprobados`)
