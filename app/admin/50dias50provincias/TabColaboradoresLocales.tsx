'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Colaboradores locales: la tercera categoría de apoyo, aparte de
// patrocinadores y colaboradores.
//
// Solo nombre y logo (el enlace es opcional). Cada uno se marca en las
// provincias donde colabora, y sale en el detalle de esas etapas de la ruta.
// Un mismo colaborador se guarda UNA vez aunque apoye a varias provincias: se
// marcan varias casillas, no se crean registros repetidos.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { PROVINCIAS_RETO } from '@/lib/reto50/constants'
import type { ColaboradorLocal, Etapa } from '@/lib/reto50/tipos'
import { eliminarColaboradorLocal, guardarColaboradorLocal, reordenarColaboradorLocal } from './actions'
import { Bloque, BotonGuardar, BotonMini, Campo, inputCls, type Correr } from './piezas'

type Props = {
  colaboradores: ColaboradorLocal[]
  etapas: Etapa[]
  pending: boolean
  correr: Correr
  editable: boolean
}

type Draft = {
  id?: string
  nombre: string
  logoUrl: string
  webUrl: string
  provincias: string[]
  activo: boolean
}

const vacio = (): Draft => ({ nombre: '', logoUrl: '', webUrl: '', provincias: [], activo: true })

const aDraft = (c: ColaboradorLocal): Draft => ({
  id: c.id, nombre: c.nombre, logoUrl: c.logoUrl, webUrl: c.webUrl,
  provincias: [...c.provincias], activo: c.activo,
})

/** Selector de provincias. Va por casillas para poder marcar varias de un vistazo. */
function SelectorProvincias({ provincias, marcadas, onToggle, editable }: {
  provincias: { nombre: string; dia: number }[]
  marcadas: string[]
  onToggle: (provincia: string) => void
  editable: boolean
}) {
  const [filtro, setFiltro] = useState('')
  const q = filtro.trim().toLowerCase()
  const visibles = q ? provincias.filter(p => p.nombre.toLowerCase().includes(q)) : provincias

  return (
    <div className="border border-gray-200 rounded-xl bg-white">
      <div className="p-2 border-b border-gray-100 flex items-center gap-2">
        <input
          className={inputCls}
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar provincia…"
        />
        <span className="text-xs font-black text-gray-400 whitespace-nowrap px-1">
          {marcadas.length} marcada{marcadas.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
        {visibles.map(p => (
          <label key={p.nombre} className="flex items-center gap-2 text-sm text-pm-navy py-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={marcadas.includes(p.nombre)}
              disabled={!editable}
              onChange={() => onToggle(p.nombre)}
            />
            <span className="truncate" title={p.nombre}>
              <span className="text-xs text-gray-400 mr-1">{p.dia}.</span>
              {p.nombre}
            </span>
          </label>
        ))}
        {visibles.length === 0 && (
          <p className="text-sm text-gray-400 col-span-full py-3 text-center">Ninguna provincia coincide.</p>
        )}
      </div>
    </div>
  )
}

function Formulario({ draft, setDraft, provincias, onGuardar, onCancelar, pending, editable }: {
  draft: Draft
  setDraft: (d: Draft) => void
  provincias: { nombre: string; dia: number }[]
  onGuardar: () => void
  onCancelar: () => void
  pending: boolean
  editable: boolean
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v })

  const toggle = (provincia: string) =>
    set('provincias', draft.provincias.includes(provincia)
      ? draft.provincias.filter(p => p !== provincia)
      : [...draft.provincias, provincia])

  return (
    <div className="bg-pm-bg rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Campo label="Nombre">
          <input className={inputCls} value={draft.nombre} disabled={!editable}
            onChange={e => set('nombre', e.target.value)} placeholder="Nombre del colaborador" />
        </Campo>
        <Campo label="Logo">
          <SubirImagen carpeta="reto50-locales" value={draft.logoUrl} onChange={url => set('logoUrl', url)} />
        </Campo>
      </div>

      <Campo label="Enlace (opcional)" hint="Su web o red social. Si lo dejas vacío, el logo no enlaza a ninguna parte.">
        <input className={inputCls} value={draft.webUrl} disabled={!editable}
          onChange={e => set('webUrl', e.target.value)} placeholder="https://" />
      </Campo>

      <Campo
        label="Provincias donde colabora"
        hint="Marca todas las que quieras: aparecerá en el detalle de esas etapas. Sin ninguna marcada solo sale en la sección general."
      >
        <SelectorProvincias provincias={provincias} marcadas={draft.provincias} onToggle={toggle} editable={editable} />
      </Campo>

      <label className="flex items-center gap-2 text-sm text-pm-navy">
        <input type="checkbox" checked={draft.activo} disabled={!editable}
          onChange={e => set('activo', e.target.checked)} />
        Activo <span className="text-xs text-gray-400">(visible en la web)</span>
      </label>

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

export default function TabColaboradoresLocales({ colaboradores, etapas, pending, correr, editable }: Props) {
  const [editando, setEditando] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [draft, setDraft] = useState<Draft>(vacio())

  // Las provincias reales de la ruta, en orden de etapa. Si la tabla todavía no
  // está migrada se usa la ruta oficial de respaldo.
  const provincias = useMemo(() => {
    if (etapas.length) {
      return etapas
        .slice()
        .sort((a, b) => a.dia - b.dia)
        .map(e => ({ nombre: e.provincia, dia: e.dia }))
    }
    return PROVINCIAS_RETO.map((nombre, i) => ({ nombre, dia: i + 1 }))
  }, [etapas])

  function cerrar() {
    setCreando(false)
    setEditando(null)
  }

  function guardar() {
    correr(async () => {
      const r = await guardarColaboradorLocal({
        id: draft.id,
        nombre: draft.nombre,
        logoUrl: draft.logoUrl,
        webUrl: draft.webUrl,
        provincias: draft.provincias,
        orden: draft.id ? undefined : colaboradores.length + 1,
        activo: draft.activo,
      })
      if (r.ok) cerrar()
      return r
    })
  }

  return (
    <Bloque
      titulo="Colaboradores locales"
      desc="Apoyos de una provincia concreta: solo nombre y logo. Salen en el detalle de sus etapas y en la sección de patrocinadores y colaboradores de la web."
    >
      <div className="space-y-3">
        {colaboradores.length === 0 && !creando && (
          <p className="text-sm text-gray-400 py-4 text-center">Todavía no hay colaboradores locales.</p>
        )}

        {colaboradores.map((c, i) => (
          <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-14 h-14 shrink-0 rounded-lg bg-pm-bg border border-gray-100 flex items-center justify-center overflow-hidden">
                {c.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logoUrl} alt={c.nombre} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-black text-gray-300">{c.nombre.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-pm-navy truncate">{c.nombre}</span>
                  {!c.activo && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Oculto</span>}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {c.provincias.length
                    ? `${c.provincias.length} provincia${c.provincias.length === 1 ? '' : 's'}: ${c.provincias.join(', ')}`
                    : 'Sin provincias asignadas'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <BotonMini onClick={() => correr(() => reordenarColaboradorLocal(c.id, 'subir'))} disabled={!editable || i === 0} titulo="Subir">↑</BotonMini>
                <BotonMini onClick={() => correr(() => reordenarColaboradorLocal(c.id, 'bajar'))} disabled={!editable || i === colaboradores.length - 1} titulo="Bajar">↓</BotonMini>
                <BotonMini
                  onClick={() => correr(() => guardarColaboradorLocal({ ...aDraft(c), activo: !c.activo }))}
                  disabled={!editable}
                  titulo={c.activo ? 'Ocultar de la web' : 'Mostrar en la web'}
                >
                  {c.activo ? 'Ocultar' : 'Mostrar'}
                </BotonMini>
                <BotonMini onClick={() => { if (editando === c.id) { cerrar() } else { setDraft(aDraft(c)); setEditando(c.id); setCreando(false) } }} disabled={!editable}>
                  {editando === c.id ? 'Cerrar' : 'Editar'}
                </BotonMini>
                <BotonMini
                  onClick={() => { if (confirm(`¿Eliminar a ${c.nombre}?`)) correr(() => eliminarColaboradorLocal(c.id)) }}
                  disabled={!editable}
                  titulo="Eliminar"
                >
                  ✕
                </BotonMini>
              </div>
            </div>

            {editando === c.id && (
              <div className="p-3 pt-0">
                <Formulario draft={draft} setDraft={setDraft} provincias={provincias}
                  onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
              </div>
            )}
          </div>
        ))}

        {creando ? (
          <Formulario draft={draft} setDraft={setDraft} provincias={provincias}
            onGuardar={guardar} onCancelar={cerrar} pending={pending} editable={editable} />
        ) : (
          <button
            type="button"
            onClick={() => { setDraft(vacio()); setCreando(true); setEditando(null) }}
            disabled={!editable}
            className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red text-sm font-bold text-gray-400 hover:text-pm-red rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-400"
          >
            + Añadir colaborador local
          </button>
        )}
      </div>
    </Bloque>
  )
}
