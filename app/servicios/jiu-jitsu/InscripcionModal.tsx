'use client'

import { useState } from 'react'
import { ModalInscripcion, type Modalidad } from '@/components/reserva/ModalInscripcion'

const NIVELES = ['Sin experiencia previa', 'Principiante (< 1 año)', 'Intermedio (1-3 años)', 'Avanzado (> 3 años)']

const MODALIDADES: Modalidad[] = [
  { id: 'mensual', label: 'Mensualidad', sublabel: 'Todos los sábados del mes', precio: '60 € / mes' },
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
          servicio="Jiu-Jitsu Brasileño — Academia Adamas"
          niveles={NIVELES}
          modalidades={MODALIDADES}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
