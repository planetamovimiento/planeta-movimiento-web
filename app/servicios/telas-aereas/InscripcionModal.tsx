'use client'

import { useState } from 'react'
import { ModalInscripcion, type Modalidad } from '@/components/reserva/ModalInscripcion'
import { cuotaMensualTexto } from '@/lib/club/cuota'

// Grupos de Telas Aéreas · temporada 2026/27 (sin Iniciación 3 esta temporada).
const NIVELES = [
  'Iniciación 1', 'Iniciación 2',
  'Medio 1', 'Medio 2', 'Medio 3',
  'Avanzado 1', 'Adultos / P. libre',
]

const MODALIDADES: Modalidad[] = [
  { id: 'suelta', label: 'Clase suelta',       sublabel: 'Ven cuando quieras',          precio: 'Consultar precio' },
  { id: '1dia',  label: '1 clase / semana',    sublabel: 'Un día fijo a la semana',     precio: cuotaMensualTexto('Escuela de aéreos', 1) },
  { id: '2dias', label: '2 clases / semana',   sublabel: 'Dos días fijos a la semana',  precio: cuotaMensualTexto('Escuela de aéreos', 2) },
  { id: '3dias', label: '3 clases / semana',   sublabel: 'Tres días fijos a la semana', precio: cuotaMensualTexto('Escuela de aéreos', 3) },
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
          servicio="Escuela de aéreos"
          niveles={NIVELES}
          modalidades={MODALIDADES}
          preguntarInicio
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
