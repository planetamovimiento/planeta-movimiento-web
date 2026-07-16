'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Preguntas frecuentes del reto.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { FaqItem } from '@/lib/reto50/tipos'
import { eliminarFaq, guardarFaq, reordenarFaq } from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, inputCls, type Correr } from './piezas'

type Props = {
  faq: FaqItem[]
  pending: boolean
  correr: Correr
  editable: boolean
}

type Draft = { id?: string; pregunta: string; respuesta: string; activo: boolean }

const VACIO: Draft = { pregunta: '', respuesta: '', activo: true }
const aDraft = (f: FaqItem): Draft => ({ id: f.id, pregunta: f.pregunta, respuesta: f.respuesta, activo: f.activo })

function Formulario({ draft, setDraft, onGuardar, onCancelar, pending, editable }: {
  draft: Draft
  setDraft: (d: Draft) => void
  onGuardar: () => void
  onCancelar: () => void
  pending: boolean
  editable: boolean
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })

  return (
    <div className="bg-pm-bg rounded-xl p-4 space-y-3">
      <Campo label="Pregunta">
        <input className={inputCls} value={draft.pregunta} disabled={!editable}
          onChange={e => set('pregunta', e.target.value)} placeholder="¿…?" />
      </Campo>
      <Campo label="Respuesta">
        <textarea className={`${inputCls} min-h-[90px]`} value={draft.respuesta} disabled={!editable}
          onChange={e => set('respuesta', e.target.value)} />
      </Campo>
      <label className="flex items-center gap-2 text-sm text-pm-navy">
        <input type="checkbox" checked={draft.activo} disabled={!editable}
          onChange={e => set('activo', e.target.checked)} />
        Activa <span className="text-xs text-gray-400">(visible en la web)</span>
      </label>
      <div className="flex gap-2 pt-1">
        <BotonGuardar onClick={onGuardar} pending={pending}
          disabled={!editable || !draft.pregunta.trim() || !draft.respuesta.trim()} />
        <button type="button" onClick={onCancelar}
          className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function TabFaq({ faq, pending, correr, editable }: Props) {
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<Draft>(VACIO)

  function cerrar() {
    setCreando(false)
    setEditando(null)
  }

  function guardar() {
    correr(async () => {
      const r = await guardarFaq({
        id: draft.id,
        pregunta: draft.pregunta,
        respuesta: draft.respuesta,
        orden: faq.length + 1,
        activo: draft.activo,
      })
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque titulo="Preguntas frecuentes" desc="Se muestran en la web en el orden que fijes aquí.">
      <div className="space-y-3">
        {faq.length === 0 && !creando && (
          <p className="text-sm text-gray-400 py-4 text-center">Todavía no hay preguntas.</p>
        )}

        {faq.map((f, i) => (
          <div key={f.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-pm-navy">{f.pregunta}</span>
                  {!f.activo && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Oculta</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{f.respuesta}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <BotonMini onClick={() => correr(() => reordenarFaq(f.id, 'subir'))} disabled={!editable || i === 0} titulo="Subir">↑</BotonMini>
                <BotonMini onClick={() => correr(() => reordenarFaq(f.id, 'bajar'))} disabled={!editable || i === faq.length - 1} titulo="Bajar">↓</BotonMini>
                <BotonMini onClick={() => { if (editando === f.id) cerrar(); else { setDraft(aDraft(f)); setEditando(f.id); setCreando(false) } }} disabled={!editable}>
                  {editando === f.id ? 'Cerrar' : 'Editar'}
                </BotonMini>
                <BotonMini
                  onClick={() => { if (confirm('¿Eliminar esta pregunta?')) correr(() => eliminarFaq(f.id)) }}
                  disabled={!editable}
                  titulo="Eliminar"
                >
                  ✕
                </BotonMini>
              </div>
            </div>

            {editando === f.id && (
              <div className="p-3 pt-0">
                <Formulario draft={draft} setDraft={setDraft} onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
              </div>
            )}
          </div>
        ))}

        {creando ? (
          <Formulario draft={draft} setDraft={setDraft} onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
        ) : (
          <button
            type="button"
            onClick={() => { setDraft({ ...VACIO }); setCreando(true); setEditando(null) }}
            disabled={!editable}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-400"
          >
            + Añadir pregunta
          </button>
        )}
      </div>
    </Bloque>
  )
}
