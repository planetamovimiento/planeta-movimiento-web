'use client'

import { useState } from 'react'
import { ModalInscripcion, type Modalidad } from '@/components/reserva/ModalInscripcion'

const NIVELES = [
  'Iniciación 1', 'Iniciación 2', 'Iniciación 3',
  'Medio 1', 'Medio 2', 'Medio 3',
  'Avanzado 1', 'Avanzado 2', 'Adultos',
]

const MODALIDADES: Modalidad[] = [
  { id: 'suelta', label: 'Clase suelta',       sublabel: 'Ven cuando quieras',          precio: 'Consultar precio' },
  { id: '1dia',  label: '1 clase / semana',    sublabel: 'Un día fijo a la semana',     precio: 'Consultar precio' },
  { id: '2dias', label: '2 clases / semana',   sublabel: 'Dos días fijos a la semana',  precio: 'Consultar precio' },
  { id: '3dias', label: '3 clases / semana',   sublabel: 'Tres días fijos a la semana', precio: 'Consultar precio' },
]

export function BotonApuntarme() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto bg-pm-red hover:bg-pm-red-dark text-white font-black text-sm tracking-widest uppercase px-10 py-4 rounded-xl transition-colors shadow-lg"
      >
        Apuntarme
      </button>
      {open && (
        <ModalInscripcion
          servicio="Escuela de aéreos — Telas, Aro y Trapecio"
          niveles={NIVELES}
          modalidades={MODALIDADES}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
