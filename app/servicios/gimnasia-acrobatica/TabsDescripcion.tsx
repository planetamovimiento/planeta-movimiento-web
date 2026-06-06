'use client'

import { useState } from 'react'

const horarios = [
  {
    franja: '16:00 – 17:00',
    lunes: { texto: 'Iniciación 1', color: 'bg-yellow-400 text-yellow-900' },
    martes: { texto: 'Iniciación 2', color: 'bg-yellow-400 text-yellow-900' },
    miercoles: { texto: 'Iniciación 1', color: 'bg-yellow-400 text-yellow-900' },
    jueves: { texto: 'Iniciación 2', color: 'bg-yellow-400 text-yellow-900' },
    viernes: { texto: 'Iniciación 3', color: 'bg-yellow-400 text-yellow-900' },
  },
  {
    franja: '17:00 – 18:00',
    lunes: { texto: 'Medio 1', color: 'bg-orange-400 text-orange-900' },
    martes: { texto: 'Medio 2', color: 'bg-orange-400 text-orange-900' },
    miercoles: { texto: 'Medio 1', color: 'bg-orange-400 text-orange-900' },
    jueves: { texto: 'Medio 2', color: 'bg-orange-400 text-orange-900' },
    viernes: { texto: 'Medio 3', color: 'bg-orange-400 text-orange-900' },
  },
  {
    franja: '20:00 – 21:30',
    lunes: { texto: 'Avanzado 1\nAdultos', color: 'bg-red-500 text-white' },
    martes: { texto: 'Avanzado 2\nAdultos', color: 'bg-red-500 text-white' },
    miercoles: { texto: 'Avanzado 1\nAdultos', color: 'bg-red-500 text-white' },
    jueves: { texto: 'Avanzado 2\nAdultos', color: 'bg-red-500 text-white' },
    viernes: { texto: '', color: '' },
  },
]

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const
type Dia = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'
const diaKeys: Dia[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

export default function TabsDescripcion() {
  const [tab, setTab] = useState<'descripcion' | 'info'>('descripcion')

  return (
    <div className="mt-10 flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        <button
          onClick={() => setTab('descripcion')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'descripcion'
              ? 'border-pm-red text-pm-red'
              : 'border-transparent text-gray-500 hover:text-pm-navy'
          }`}
        >
          Descripción
        </button>
        <button
          onClick={() => setTab('info')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'info'
              ? 'border-pm-red text-pm-red'
              : 'border-transparent text-gray-500 hover:text-pm-navy'
          }`}
        >
          Información adicional
        </button>
      </div>

      {/* Contenido */}
      <div className="py-8">
        {tab === 'descripcion' ? (
          <div className="max-w-2xl space-y-4 text-gray-700 text-sm leading-relaxed">
            <p>
              Si tu objetivo es mejorar o simplemente probar una de las disciplinas más preciosas del circo.
              Este es tu Club Deportivo.
            </p>
            <p className="font-bold text-pm-navy">
              Un espacio donde el aprendizaje y la evolución van de la mano.
            </p>
            <p>
              Disfruta y diviértete descubriendo habilidades que nunca has entrenado.
            </p>
            <p className="font-bold text-pm-navy">
              ¡Si te gustan los deportes novedosos te esperamos con los brazos abiertos!
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">¿Qué trabajamos?</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Acrobacias de suelo', 'Saltos y vuelos', 'Equilibrio y control',
                  'Técnica de parkour', 'Coordinación', 'Resistencia y fuerza',
                  'Confianza en uno mismo', 'Trabajo en equipo',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-pm-red font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Edad mínima', valor: '5 años' },
                { label: 'Duración sesión', valor: '60 – 90 min' },
                { label: 'Inicio', valor: 'Septiembre' },
                { label: 'Seguro', valor: 'Incluido' },
              ].map(({ label, valor }) => (
                <div key={label} className="bg-pm-bg rounded-xl p-4 text-center">
                  <div className="font-black text-pm-navy text-base">{valor}</div>
                  <div className="text-gray-500 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-black text-pm-navy text-base mb-1">Material necesario</h3>
              <p className="text-sm text-gray-600">
                Ropa cómoda y deportiva, calcetines antideslizantes. El material de circo lo ponemos nosotros.
              </p>
            </div>

            <div>
              <h3 className="font-black text-pm-navy text-base mb-1">Política de inscripción</h3>
              <p className="text-sm text-gray-600">
                La inscripción se formaliza una vez confirmada la plaza por nuestro equipo. El pago de la mensualidad
                se realiza los primeros 5 días de cada mes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Calendario — colocado arriba, justo bajo el botón Apuntarme */}
      <div className="order-first mb-6">
        <div className="bg-pm-navy rounded-2xl overflow-hidden">
          {/* Cabecera */}
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-black text-sm tracking-wider uppercase">
              Calendario de Gimnasia Acrobática y Trampolín
            </h3>
            <span className="bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full">
              Curso 2025-2026
            </span>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-pm-navy-md">
                  <th className="text-white/60 font-semibold px-4 py-2.5 text-left w-24">Horario</th>
                  {dias.map(d => (
                    <th key={d} className="text-white font-bold px-3 py-2.5 text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horarios.map((fila, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="text-white/70 font-semibold px-4 py-3 whitespace-nowrap">{fila.franja}</td>
                    {diaKeys.map(dia => {
                      const celda = fila[dia]
                      return (
                        <td key={dia} className="px-2 py-2 text-center">
                          {celda.texto ? (
                            <span className={`inline-block ${celda.color} font-bold px-2 py-1.5 rounded-lg text-center w-full whitespace-pre-line leading-tight`}>
                              {celda.texto}
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
