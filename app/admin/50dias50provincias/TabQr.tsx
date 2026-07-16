'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Códigos QR de donación. Se muestran en la portada del reto.
// La imagen del QR la sube el admin: aquí no se genera ni se inventa ninguna.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import type { QrDonacion } from '@/lib/reto50/tipos'
import { eliminarQr, guardarQr, reordenarQr } from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, inputCls, type Correr } from './piezas'

type Props = {
  qrs: QrDonacion[]
  pending: boolean
  correr: Correr
  editable: boolean
}

type Draft = {
  id?: string
  titulo: string
  descripcion: string
  imagenUrl: string
  enlaceUrl: string
  activo: boolean
}

const VACIO: Draft = { titulo: '', descripcion: '', imagenUrl: '', enlaceUrl: '', activo: true }

const aDraft = (q: QrDonacion): Draft => ({
  id: q.id, titulo: q.titulo, descripcion: q.descripcion,
  imagenUrl: q.imagenUrl, enlaceUrl: q.enlaceUrl, activo: q.activo,
})

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
      <div className="grid sm:grid-cols-2 gap-3">
        <Campo label="Título" hint="Por ejemplo: Donación para gasolina.">
          <input className={inputCls} value={draft.titulo} disabled={!editable}
            onChange={e => set('titulo', e.target.value)} placeholder="Donación para gasolina" />
        </Campo>
        <Campo label="Enlace (opcional)" hint="Si lo dejas vacío, la tarjeta no lleva botón.">
          <input className={inputCls} value={draft.enlaceUrl} disabled={!editable}
            onChange={e => set('enlaceUrl', e.target.value)} placeholder="https://" />
        </Campo>
      </div>

      <Campo label="Descripción" hint="Una frase corta explicando para qué es este QR.">
        <textarea className={`${inputCls} min-h-[70px]`} value={draft.descripcion} disabled={!editable}
          onChange={e => set('descripcion', e.target.value)} />
      </Campo>

      <Campo label="Imagen del QR" hint="Sube la imagen del código (JPG, PNG o WebP). Cuanto más nítida, mejor se escanea.">
        <SubirImagen carpeta="reto50-qr" value={draft.imagenUrl} onChange={url => set('imagenUrl', url)} />
      </Campo>

      <label className="flex items-center gap-2 text-sm text-pm-navy">
        <input type="checkbox" checked={draft.activo} disabled={!editable}
          onChange={e => set('activo', e.target.checked)} />
        Activo <span className="text-xs text-gray-400">(visible en la portada del reto)</span>
      </label>

      <div className="flex gap-2 pt-1">
        <BotonGuardar onClick={onGuardar} pending={pending} disabled={!editable || !draft.titulo.trim()} />
        <button type="button" onClick={onCancelar} className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function TabQr({ qrs, pending, correr, editable }: Props) {
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<Draft>(VACIO)

  const activos = qrs.filter(q => q.activo).length

  function cerrar() {
    setCreando(false)
    setEditando(null)
  }

  function guardar() {
    correr(async () => {
      const r = await guardarQr({ ...draft, orden: draft.id ? undefined : qrs.length + 1 })
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque
      titulo="Códigos QR de donación"
      desc="Aparecen en la portada del reto. La web se adapta sola al número de QR activos: con uno se ve a lo ancho y con varios se reparten."
    >
      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          {activos === 0
            ? 'No hay ningún QR activo: en la portada no se mostrará el panel de donaciones.'
            : `${activos} ${activos === 1 ? 'QR activo' : 'QR activos'} en la portada.`}
        </p>

        {qrs.map((q, i) => (
          <div key={q.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-14 h-14 shrink-0 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                {q.imagenUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={q.imagenUrl} alt={q.titulo} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] font-black text-gray-300 text-center leading-tight px-1">Sin imagen</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-pm-navy truncate">{q.titulo}</span>
                  {!q.activo && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Oculto</span>}
                  {!q.imagenUrl && <span className="text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">Falta la imagen</span>}
                </div>
                {q.descripcion && <p className="text-xs text-gray-400 truncate mt-0.5">{q.descripcion}</p>}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <BotonMini onClick={() => correr(() => reordenarQr(q.id, 'subir'))} disabled={!editable || i === 0} titulo="Subir">↑</BotonMini>
                <BotonMini onClick={() => correr(() => reordenarQr(q.id, 'bajar'))} disabled={!editable || i === qrs.length - 1} titulo="Bajar">↓</BotonMini>
                <BotonMini onClick={() => correr(() => guardarQr({ ...aDraft(q), activo: !q.activo }))} disabled={!editable}
                  titulo={q.activo ? 'Ocultar de la portada' : 'Mostrar en la portada'}>
                  {q.activo ? 'Ocultar' : 'Mostrar'}
                </BotonMini>
                <BotonMini onClick={() => (editando === q.id ? cerrar() : (setDraft(aDraft(q)), setEditando(q.id), setCreando(false)))} disabled={!editable}>
                  {editando === q.id ? 'Cerrar' : 'Editar'}
                </BotonMini>
                <BotonMini onClick={() => { if (confirm(`¿Eliminar «${q.titulo}»?`)) correr(() => eliminarQr(q.id)) }} disabled={!editable} titulo="Eliminar">
                  ✕
                </BotonMini>
              </div>
            </div>

            {editando === q.id && (
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
            + Añadir código QR
          </button>
        )}
      </div>
    </Bloque>
  )
}
