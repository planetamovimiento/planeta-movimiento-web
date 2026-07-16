'use client'

import { useState } from 'react'
import type { FaqItem } from '@/lib/reto50/tipos'

export default function Faq({ preguntas }: { preguntas: FaqItem[] }) {
  const [abierta, setAbierta] = useState<string | null>(preguntas[0]?.id ?? null)

  if (preguntas.length === 0) return null

  return (
    <div className="max-w-3xl mx-auto divide-y divide-gray-100 border-y border-gray-100">
      {preguntas.map(p => {
        const activa = abierta === p.id
        return (
          <div key={p.id}>
            <h3>
              <button
                type="button"
                onClick={() => setAbierta(activa ? null : p.id)}
                aria-expanded={activa}
                aria-controls={`faq-${p.id}`}
                className="w-full flex items-center justify-between gap-4 text-left py-5 group"
              >
                <span className="font-black text-pm-navy group-hover:text-pm-red transition-colors">{p.pregunta}</span>
                <svg
                  className={`w-4 h-4 shrink-0 text-gray-300 transition-transform duration-200 ${activa ? 'rotate-45' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </h3>
            <div id={`faq-${p.id}`} hidden={!activa} className="pb-5 -mt-1">
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{p.respuesta}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
