'use client'

import { useState } from 'react'

// Calendario naranja — Grupos Infantil 1-6
const horarios = [
  {
    franja: '16:00 – 17:00',
    lunes:    { texto: 'Infantil 1', color: 'bg-orange-400 text-white' },
    martes:   { texto: 'Infantil 3', color: 'bg-orange-400 text-white' },
    miercoles:{ texto: 'Infantil 1', color: 'bg-orange-400 text-white' },
    jueves:   { texto: 'Infantil 3', color: 'bg-orange-400 text-white' },
    viernes:  { texto: 'Infantil 5', color: 'bg-orange-400 text-white' },
  },
  {
    franja: '17:00 – 18:00',
    lunes:    { texto: 'Infantil 2', color: 'bg-orange-600 text-white' },
    martes:   { texto: 'Infantil 4', color: 'bg-orange-600 text-white' },
    miercoles:{ texto: 'Infantil 2', color: 'bg-orange-600 text-white' },
    jueves:   { texto: 'Infantil 4', color: 'bg-orange-600 text-white' },
    viernes:  { texto: 'Infantil 6', color: 'bg-orange-600 text-white' },
  },
]

type Dia = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes'
const diaKeys: Dia[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
const diasLabel = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

export default function TabsDescripcion() {
  const [tab, setTab] = useState<'descripcion' | 'info'>('descripcion')

  return (
    <div className="mt-10">
      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        {(['descripcion', 'info'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t
                ? 'border-pm-red text-pm-red'
                : 'border-transparent text-gray-500 hover:text-pm-navy'
            }`}
          >
            {t === 'descripcion' ? 'Descripción' : 'Información adicional'}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === 'descripcion' ? (
          <div className="max-w-2xl space-y-4 text-gray-700 text-sm leading-relaxed">
            <p className="font-bold text-pm-navy">
              Si tu objetivo es mejorar o simplemente probar una de las disciplinas más preciosas del circo.
              Este es tu Club Deportivo.
            </p>
            <p className="font-bold text-pm-navy">Un espacio donde el aprendizaje y la evolución van de la mano.</p>
            <p className="font-bold text-pm-navy">Disfruta y diviértete descubriendo habilidades que nunca has entrenado.</p>
            <p className="font-bold text-pm-navy">¡Si te gustan los deportes novedosos te esperamos con los brazos abiertos!</p>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">Trabajamos…</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Motricidad gruesa',  icon: '🏃', desc: 'Grandes movimientos y control del cuerpo' },
                  { label: 'Conexión grupal',     icon: '🤝', desc: 'Juegos cooperativos y trabajo en equipo' },
                  { label: 'Lateralidad',         icon: '↔️', desc: 'Distinguir derecha e izquierda con el cuerpo' },
                ].map(d => (
                  <div key={d.label} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="text-2xl mb-2">{d.icon}</div>
                    <div className="font-bold text-pm-navy text-sm">{d.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">¿Qué desarrollarán?</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Coordinación y equilibrio', 'Creatividad',
                  'Confianza en sí mismos', 'Autonomía',
                  'Gusto por el movimiento', 'Trabajo en equipo',
                  'Expresión corporal', 'Habilidades sociales',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-pm-red font-bold">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Edad', valor: '3 a 5 años' },
                { label: 'Duración', valor: '60 min' },
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
                Ropa cómoda y deportiva. Calcetines antideslizantes recomendados.
                Todo el material de actividad lo ponemos nosotros.
              </p>
            </div>
            <div>
              <h3 className="font-black text-pm-navy text-base mb-1">Política de inscripción</h3>
              <p className="text-sm text-gray-600">
                La plaza se confirma tras ponernos en contacto con la familia.
                El pago mensual se realiza los primeros 5 días de cada mes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Calendario naranja */}
      <div className="mt-4">
        <div className="bg-pm-navy rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-orange-400 font-black text-sm tracking-wider uppercase">
              Calendario de Gimnasia Infantil
            </h3>
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Curso 2025-2026
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-pm-navy-md">
                  <th className="text-white/60 font-semibold px-4 py-2.5 text-left w-24">Horario</th>
                  {diasLabel.map(d => (
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
                          <span className={`inline-block ${celda.color} font-bold px-2 py-1.5 rounded-lg text-center w-full`}>
                            {celda.texto}
                          </span>
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
