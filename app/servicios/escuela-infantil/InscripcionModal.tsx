'use client'

import { useState } from 'react'
import { ModalInscripcion, type Modalidad } from '@/components/reserva/ModalInscripcion'

const NIVELES = [
  'Infantil 1', 'Infantil 2', 'Infantil 3',
  'Infantil 4', 'Infantil 5', 'Infantil 6',
]

const MODALIDADES: Modalidad[] = [
  { id: '1dia',  label: '1 día / semana',  sublabel: 'Un día fijo a la semana',    precio: 'Consultar precio' },
  { id: '2dias', label: '2 días / semana', sublabel: 'Dos días fijos a la semana', precio: 'Consultar precio' },
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
          servicio="Escuela Infantil — Grupos de 3 a 5 años"
          niveles={NIVELES}
          modalidades={MODALIDADES}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
