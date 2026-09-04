'use client'

import { useState } from 'react'

// De lunes a viernes — franja 10:00-11:00
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const horarios = [
  { franja: '10:00 – 11:00', texto: 'Pilates', color: 'bg-teal-500 text-white' },
]

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
            <p>Si tu objetivo es mejorar o simplemente probar una de las disciplinas más preciosas del circo. Este es tu Club Deportivo.</p>
            <p className="font-bold text-pm-navy">Un espacio donde el aprendizaje y la evolución van de la mano.</p>
            <p>Disfruta y diviértete descubriendo habilidades que nunca has entrenado.</p>
            <p className="font-bold text-pm-navy">¡Si te gustan los deportes novedosos te esperamos con los brazos abiertos!</p>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">Actividades disponibles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Pilates',          icon: '🧘', desc: 'Control postural, core y respiración' },
                  { label: 'Yoga',             icon: '🕉️', desc: 'Flexibilidad, equilibrio y mindfulness' },
                  { label: 'Baile y Movimiento', icon: '💃', desc: 'Ritmo, coordinación y expresión' },
                ].map(d => (
                  <div key={d.label} className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                    <div className="text-2xl mb-2">{d.icon}</div>
                    <div className="font-bold text-pm-navy text-sm">{d.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">Beneficios</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Mejora postural', 'Reducción del estrés',
                  'Flexibilidad y movilidad', 'Fuerza funcional',
                  'Bienestar mental', 'Comunidad activa',
                  'Adaptado a todos los niveles', 'Ambiente motivador',
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
                { label: 'Edad',      valor: 'Adultos' },
                { label: 'Duración',  valor: '60 min' },
                { label: 'Días',      valor: 'L a V' },
                { label: 'Horario',   valor: '10:00 – 11:00' },
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
                Ropa cómoda, calcetines o zapatillas de deporte. Para Pilates y Yoga, esterilla propia recomendada
                (también disponemos de esterillas en el centro).
              </p>
            </div>
            <div>
              <h3 className="font-black text-pm-navy text-base mb-1">Política de inscripción</h3>
              <p className="text-sm text-gray-600">
                La plaza se confirma tras ponernos en contacto contigo. El pago mensual se realiza
                los primeros 5 días de cada mes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Calendario — de lunes a viernes, tono teal */}
      <div className="mt-4">
        <div className="bg-pm-navy rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-teal-400 font-black text-sm tracking-wider uppercase">
              Calendario de Gimnasia para Tod@s
            </h3>
            <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Curso 2026-2027
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-pm-navy-md">
                  <th className="text-white/60 font-semibold px-4 py-2.5 text-left w-28">Horario</th>
                  {DIAS.map(d => (
                    <th key={d} className="text-white font-bold px-3 py-2.5 text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horarios.map((fila, i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="text-white/70 font-semibold px-4 py-4 whitespace-nowrap">{fila.franja}</td>
                    {DIAS.map(d => (
                      <td key={d} className="px-3 py-3 text-center">
                        <span className={`inline-block ${fila.color} font-bold px-3 py-2 rounded-lg w-full`}>
                          {fila.texto}
                        </span>
                      </td>
                    ))}
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
