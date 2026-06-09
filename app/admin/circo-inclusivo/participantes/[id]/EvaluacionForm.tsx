'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { guardarEvaluacion } from '../../actions'
import { esquemaDe, ESCALA, VALORACIONES, type Evaluacion, type TipoEvaluacion, type ValoracionGlobal } from '@/lib/circo-inclusivo/tipos'

function periodoAuto(tipo: TipoEvaluacion, fecha: string): string {
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return ''
  if (tipo === 'mensual') return fecha.slice(0, 7)
  return `${d.getFullYear()}-T${Math.floor(d.getMonth() / 3) + 1}`
}

type Props = { participanteId: string; participanteNombre: string; tipo: TipoEvaluacion; evaluacion: Evaluacion | null }

export default function EvaluacionForm({ participanteId, participanteNombre, tipo, evaluacion }: Props) {
  const router = useRouter()
  const esquema = esquemaDe(tipo)
  const hoy = new Date().toISOString().slice(0, 10)

  const [fecha, setFecha] = useState(evaluacion?.fecha ?? hoy)
  const [profesional, setProfesional] = useState(evaluacion?.profesional ?? '')
  const [periodo, setPeriodo] = useState(evaluacion?.periodo ?? '')
  const [items, setItems] = useState<Record<string, number>>(evaluacion?.items ?? {})
  const [textos, setTextos] = useState<Record<string, string>>(evaluacion?.textos ?? {})
  const [valoracion, setValoracion] = useState<ValoracionGlobal | ''>((evaluacion?.valoracion_global as ValoracionGlobal) ?? '')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const setItem = (k: string, n: number) => setItems(p => ({ ...p, [k]: n }))
  const setTexto = (k: string, v: string) => setTextos(p => ({ ...p, [k]: v }))

  function guardar() {
    setError('')
    startTransition(async () => {
      const r = await guardarEvaluacion({
        id: evaluacion?.id,
        participante_id: participanteId,
        tipo,
        fecha,
        periodo: periodo || periodoAuto(tipo, fecha),
        profesional,
        items,
        textos,
        valoracion_global: valoracion || null,
      })
      if (!r.ok) setError(r.error || 'Error al guardar')
      else router.push(`/admin/circo-inclusivo/participantes/${participanteId}`)
    })
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Cabecera */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-black text-pm-navy mb-1">Evaluación {tipo} · {participanteNombre}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div><label className="text-xs font-bold text-gray-500">Fecha</label><input type="date" className={inputCls} value={fecha} onChange={e => setFecha(e.target.value)} /></div>
          <div><label className="text-xs font-bold text-gray-500">Periodo</label><input className={inputCls} placeholder={periodoAuto(tipo, fecha)} value={periodo} onChange={e => setPeriodo(e.target.value)} /></div>
          <div><label className="text-xs font-bold text-gray-500">Profesional responsable</label><input className={inputCls} value={profesional} onChange={e => setProfesional(e.target.value)} /></div>
        </div>
      </div>

      {/* Leyenda de la escala */}
      <div className="bg-pm-bg border border-gray-200 rounded-xl p-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-600">
        {ESCALA.map(s => <span key={s.valor}><strong className="text-pm-navy">{s.valor}</strong> · {s.label}</span>)}
      </div>

      {/* Áreas e ítems */}
      {esquema.areas.map(area => (
        <div key={area.area} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 font-black text-pm-navy text-sm">{area.area}</div>
          <div className="divide-y divide-gray-50">
            {area.items.map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className="flex gap-1 shrink-0">
                  {[1, 2, 3, 4].map(n => (
                    <button key={n} type="button" onClick={() => setItem(item.key, n)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors ${items[item.key] === n ? 'bg-pm-red text-white border-pm-red' : 'border-gray-200 text-gray-400 hover:border-pm-red'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Campos de texto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-black text-pm-navy text-sm">Valoración cualitativa</h3>
        {esquema.campos.map(c => (
          <div key={c.key}>
            <label className="text-xs font-bold text-gray-500">{c.label}</label>
            <textarea rows={2} className={inputCls} value={textos[c.key] ?? ''} onChange={e => setTexto(c.key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* Valoración global */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-black text-pm-navy text-sm mb-3">Valoración global</h3>
        <div className="flex flex-wrap gap-2">
          {VALORACIONES.map(v => (
            <button key={v.valor} type="button" onClick={() => setValoracion(v.valor)}
              className={`text-sm font-semibold border px-4 py-2 rounded-xl transition-colors ${valoracion === v.valor ? v.color : 'border-gray-200 text-gray-500 hover:border-pm-red'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-pm-red text-sm">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => router.push(`/admin/circo-inclusivo/participantes/${participanteId}`)} className="border border-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-xl text-sm">Cancelar</button>
        <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar evaluación'}</button>
      </div>
    </div>
  )
}
