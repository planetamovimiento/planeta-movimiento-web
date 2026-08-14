'use client'

import { useState } from 'react'
import { ModalInscripcion, type Modalidad } from '@/components/reserva/ModalInscripcion'
import { cuotaMensualTexto } from '@/lib/club/cuota'

const NIVELES = ['Pilates', 'Yoga', 'Baile y Movimiento', 'Clase combinada']

const MODALIDADES: Modalidad[] = [
  { id: '1dia',  label: '1 día / semana',  sublabel: 'Lunes, Miércoles o Viernes',   precio: cuotaMensualTexto('Escuela de Bienestar', 1) },
  { id: '2dias', label: '2 días / semana', sublabel: 'Dos días fijos a la semana',   precio: cuotaMensualTexto('Escuela de Bienestar', 2) },
  { id: '3dias', label: '3 días / semana', sublabel: 'Lunes, Miércoles y Viernes',   precio: cuotaMensualTexto('Escuela de Bienestar', 3) },
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
          servicio="Escuela de Bienestar"
          niveles={NIVELES}
          modalidades={MODALIDADES}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
