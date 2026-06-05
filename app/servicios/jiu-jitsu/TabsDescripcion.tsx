'use client'

import { useState } from 'react'

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
            <p>
              El Jiu-Jitsu Brasileño (BJJ) es un arte marcial de agarre y suelo que enseña a una persona
              más pequeña a defenderse de un oponente más grande y fuerte mediante técnica, palancas y estrangulaciones.
            </p>
            <p className="font-bold text-pm-navy">
              Un deporte que desarrolla la mente tanto como el cuerpo.
            </p>
            <p>
              Nuestras clases están impartidas por <strong className="text-pm-navy">especialistas de la Academia Adamas de Madrid</strong>,
              que se desplazan cada sábado a nuestras instalaciones en Cuenca para ofrecer clases de alto nivel.
            </p>
            <p>
              Aprenderás posiciones básicas, barridos, guardias, sumisiones y estrategia de combate en un ambiente
              <strong className="text-pm-navy"> respetuoso, seguro y progresivo</strong>.
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">¿Qué trabajarás?</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Técnica de agarre y posicionamiento',
                  'Guardias y barridos',
                  'Palancas articulares',
                  'Estrangulaciones controladas',
                  'Estrategia de combate (sparring)',
                  'Conciencia corporal y reflejos',
                  'Fuerza funcional y resistencia',
                  'Disciplina y mentalidad marcial',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span className="text-pm-red font-bold">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-pm-navy font-black text-base mb-3">Academia Adamas — especialistas en BJJ</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
                  <div>
                    <div className="font-black text-pm-navy text-sm">Academia Adamas</div>
                    <div className="text-xs text-gray-500">Madrid · Especialistas en BJJ</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Colaboramos con la Academia Adamas de Madrid, trayendo cada sábado a sus instructores
                  certificados a nuestras instalaciones. Una oportunidad única de recibir enseñanza de alto nivel
                  sin desplazarte a la capital.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Edad mínima', valor: '16 años' },
                { label: 'Duración', valor: '2 horas' },
                { label: 'Día', valor: 'Sábados' },
                { label: 'Horario', valor: '11:30 – 13:30' },
              ].map(({ label, valor }) => (
                <div key={label} className="bg-pm-bg rounded-xl p-4 text-center">
                  <div className="font-black text-pm-navy text-base">{valor}</div>
                  <div className="text-gray-500 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800 text-white rounded-xl p-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Precio</div>
                <div className="text-3xl font-black text-white">60 €</div>
                <div className="text-slate-400 text-sm">por mes · todos los sábados</div>
                <div className="text-xs text-slate-500 mt-2">Temporada septiembre – junio</div>
              </div>
              <div className="bg-pm-bg rounded-xl p-5">
                <div className="text-xs font-bold text-pm-navy uppercase tracking-wider mb-2">Temporada</div>
                <div className="font-black text-pm-navy text-lg">Sept – Junio</div>
                <div className="text-gray-500 text-sm mt-1">Clases todos los sábados del curso</div>
                <div className="text-xs text-gray-400 mt-2">Sin clases en periodos festivos</div>
              </div>
            </div>

            <div>
              <h3 className="font-black text-pm-navy text-base mb-1">Material necesario</h3>
              <p className="text-sm text-gray-600">
                Kimono (gi) o ropa deportiva ajustada para las primeras clases. Se recomienda adquirir un gi
                homologado una vez confirmada la incorporación. Los protectores de boca son opcionales para
                las sesiones de sparring.
              </p>
            </div>

            <div>
              <h3 className="font-black text-pm-navy text-base mb-1">Política de inscripción</h3>
              <p className="text-sm text-gray-600">
                La plaza se confirma tras ponernos en contacto contigo. El pago de 60€/mes se realiza
                al inicio de cada mes. No se descuentan clases individuales por ausencia.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Calendario — solo sábados */}
      <div className="mt-4">
        <div className="bg-slate-900 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-slate-300 font-black text-sm tracking-wider uppercase">
              Calendario de Jiu-Jitsu Brasileño
            </h3>
            <span className="bg-pm-red text-white text-xs font-bold px-3 py-1 rounded-full">
              Curso 2025-2026
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800">
                  <th className="text-slate-500 font-semibold px-4 py-2.5 text-left w-28">Horario</th>
                  <th className="text-slate-300 font-bold px-3 py-2.5 text-center">Lunes</th>
                  <th className="text-slate-300 font-bold px-3 py-2.5 text-center">Martes</th>
                  <th className="text-slate-300 font-bold px-3 py-2.5 text-center">Miércoles</th>
                  <th className="text-slate-300 font-bold px-3 py-2.5 text-center">Jueves</th>
                  <th className="text-slate-300 font-bold px-3 py-2.5 text-center">Viernes</th>
                  <th className="text-white font-black px-3 py-2.5 text-center">Sábado ⭐</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-700">
                  <td className="text-slate-400 font-semibold px-4 py-4 whitespace-nowrap">11:30 – 13:30</td>
                  {['', '', '', '', ''].map((_, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      <span className="text-slate-700">—</span>
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center">
                    <span className="inline-block bg-pm-red text-white font-black px-3 py-2 rounded-lg text-center w-full leading-tight">
                      BJJ<br/>
                      <span className="text-red-200 font-normal text-xs">Academia Adamas</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-800/50 text-slate-500 text-xs">
            ★ Instructores desplazados desde Madrid · Septiembre a Junio
          </div>
        </div>
      </div>
    </div>
  )
}
