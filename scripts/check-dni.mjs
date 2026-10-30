import assert from 'node:assert'
import { dniValido, validarFirma } from '../lib/autorizaciones/documento.ts'
assert(dniValido('12345678Z')); assert(dniValido('12.345.678-z')); assert(!dniValido('12345678A'))
assert(dniValido('X1234567L')); assert(dniValido('Y1234567X')); assert(!dniValido('X1234567A')); assert(!dniValido('1234567Z'))
const base = { tutorNombre: 'Ana Pérez', tutorDni: '12345678Z', relacion: 'madre', declaracion: true, conformidadMenor: false,
  canales: { web: true, redes: false, material: true, memorias: false } }
assert.equal(validarFirma(base), '')
assert.match(validarFirma({ ...base, canales: { ...base.canales, web: null } }), /cuatro usos/)
assert.match(validarFirma({ ...base, declaracion: false }), /declaración/)
console.log('OK: DNI/NIE y firma')
