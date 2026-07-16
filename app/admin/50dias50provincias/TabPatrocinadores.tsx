'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Patrocinadores y colaboradores. Lista abierta: admite tantos como haga falta.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { CATEGORIAS_APOYO, NIVELES_PATROCINIO, labelNivel } from '@/lib/reto50/constants'
import type { CategoriaApoyo } from '@/lib/reto50/constants'
import type { Patrocinador } from '@/lib/reto50/tipos'
import { eliminarPatrocinador, guardarPatrocinador, reordenarPatrocinador } from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, inputCls, type Correr } from './piezas'

type Props = {
  patrocinadores: Patrocinador[]
  pending: boolean
  correr: Correr
  editable: boolean
}

type Draft = {
  id?: string
  nombre: string
  descripcion: string
  logoUrl: string
  webUrl: string
  categoria: CategoriaApoyo
  nivel: string
  activo: boolean
  destacado: boolean
}

const vacio = (categoria: CategoriaApoyo): Draft => ({
  nombre: '', descripcion: '', logoUrl: '', webUrl: '',
  categoria, nivel: categoria === 'colaborador' ? 'apoyo' : 'principal',
  activo: true, destacado: false,
})

const aDraft = (p: Patrocinador): Draft => ({
  id: p.id, nombre: p.nombre, descripcion: p.descripcion, logoUrl: p.logoUrl,
  webUrl: p.webUrl, categoria: p.categoria, nivel: p.nivel, activo: p.activo, destacado: p.destacado,
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
      <div className="grid sm:grid-cols-3 gap-3">
        <Campo label="Nombre">
          <input className={inputCls} value={draft.nombre} disabled={!editable}
            onChange={e => set('nombre', e.target.value)} placeholder="Nombre" />
        </Campo>
        <Campo label="Categoría" hint="Cámbiala para moverlo de lista.">
          <select className={inputCls} value={draft.categoria} disabled={!editable}
            onChange={e => set('categoria', e.target.value as CategoriaApoyo)}>
            {CATEGORIAS_APOYO.map(c => <option key={c.id} value={c.id}>{c.singular}</option>)}
          </select>
        </Campo>
        <Campo label="Nivel">
          <select className={inputCls} value={draft.nivel} disabled={!editable}
            onChange={e => set('nivel', e.target.value)}>
            {NIVELES_PATROCINIO.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </Campo>
      </div>

      <Campo label="Descripción" hint="Una o dos frases sobre su aportación al reto.">
        <textarea className={`${inputCls} min-h-[70px]`} value={draft.descripcion} disabled={!editable}
          onChange={e => set('descripcion', e.target.value)} />
      </Campo>

      <div className="grid sm:grid-cols-2 gap-3">
        <Campo label="Enlace externo" hint="Su web. Se abre en una pestaña nueva.">
          <input className={inputCls} value={draft.webUrl} disabled={!editable}
            onChange={e => set('webUrl', e.target.value)} placeholder="https://" />
        </Campo>
        <Campo label="Logo">
          <SubirImagen carpeta="reto50-patrocinadores" value={draft.logoUrl} onChange={url => set('logoUrl', url)} />
        </Campo>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-pm-navy">
          <input type="checkbox" checked={draft.activo} disabled={!editable}
            onChange={e => set('activo', e.target.checked)} />
          Activo <span className="text-xs text-gray-400">(visible en la web)</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-pm-navy">
          <input type="checkbox" checked={draft.destacado} disabled={!editable}
            onChange={e => set('destacado', e.target.checked)} />
          Destacado <span className="text-xs text-gray-400">(se muestra más grande)</span>
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <BotonGuardar onClick={onGuardar} pending={pending} disabled={!editable || !draft.nombre.trim()} />
        <button type="button" onClick={onCancelar}
          className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function TabPatrocinadores({ patrocinadores, pending, correr, editable }: Props) {
  return (
    <div className="space-y-5">
      {CATEGORIAS_APOYO.map(c => (
        <BloqueCategoria
          key={c.id}
          categoria={c.id}
          lista={patrocinadores.filter(p => p.categoria === c.id)}
          pending={pending}
          correr={correr}
          editable={editable}
        />
      ))}
    </div>
  )
}

/** Una lista independiente por categoría: no se mezclan ni se pisan al ordenar. */
function BloqueCategoria({ categoria, lista, pending, correr, editable }: {
  categoria: CategoriaApoyo
  lista: Patrocinador[]
  pending: boolean
  correr: Correr
  editable: boolean
}) {
  const meta = CATEGORIAS_APOYO.find(c => c.id === categoria)!
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<Draft>(vacio(categoria))

  function abrirNuevo() {
    setDraft(vacio(categoria))
    setCreando(true)
    setEditando(null)
  }

  function abrirEdicion(p: Patrocinador) {
    setDraft(aDraft(p))
    setEditando(p.id)
    setCreando(false)
  }

  function cerrar() {
    setCreando(false)
    setEditando(null)
  }

  function guardar() {
    correr(async () => {
      const r = await guardarPatrocinador({
        id: draft.id,
        nombre: draft.nombre,
        descripcion: draft.descripcion,
        logoUrl: draft.logoUrl,
        webUrl: draft.webUrl,
        categoria: draft.categoria,
        nivel: draft.nivel,
        orden: draft.id ? undefined : lista.length + 1,
        activo: draft.activo,
        destacado: draft.destacado,
      })
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque titulo={meta.label} desc={meta.desc}>
      <div className="space-y-3">
        {lista.length === 0 && !creando && (
          <p className="text-sm text-gray-400 py-4 text-center">
            Todavía no hay {meta.label.toLowerCase()}.
          </p>
        )}

        {lista.map((p, i) => (
          <div key={p.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-14 h-14 shrink-0 rounded-lg bg-pm-bg border border-gray-100 flex items-center justify-center overflow-hidden">
                {p.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logoUrl} alt={p.nombre} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-black text-gray-300">{p.nombre.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-pm-navy truncate">{p.nombre}</span>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{labelNivel(p.nivel)}</span>
                  {p.destacado && <span className="text-xs font-bold text-pm-red bg-pm-red/10 rounded-full px-2 py-0.5">Destacado</span>}
                  {!p.activo && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Oculto</span>}
                </div>
                {p.descripcion && <p className="text-xs text-gray-400 truncate mt-0.5">{p.descripcion}</p>}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <BotonMini onClick={() => correr(() => reordenarPatrocinador(p.id, 'subir'))} disabled={!editable || i === 0} titulo="Subir">↑</BotonMini>
                <BotonMini onClick={() => correr(() => reordenarPatrocinador(p.id, 'bajar'))} disabled={!editable || i === lista.length - 1} titulo="Bajar">↓</BotonMini>
                <BotonMini onClick={() => correr(() => guardarPatrocinador({ ...aDraft(p), activo: !p.activo }))} disabled={!editable} titulo={p.activo ? 'Ocultar de la web' : 'Mostrar en la web'}>
                  {p.activo ? 'Ocultar' : 'Mostrar'}
                </BotonMini>
                <BotonMini onClick={() => (editando === p.id ? cerrar() : abrirEdicion(p))} disabled={!editable}>
                  {editando === p.id ? 'Cerrar' : 'Editar'}
                </BotonMini>
                <BotonMini
                  onClick={() => { if (confirm(`¿Eliminar a ${p.nombre}?`)) correr(() => eliminarPatrocinador(p.id)) }}
                  disabled={!editable}
                  titulo="Eliminar"
                >
                  ✕
                </BotonMini>
              </div>
            </div>

            {editando === p.id && (
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
            onClick={abrirNuevo}
            disabled={!editable}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-400"
          >
            + Añadir {meta.singular.toLowerCase()}
          </button>
        )}
      </div>
    </Bloque>
  )
}
