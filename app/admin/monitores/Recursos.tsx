'use client'

import { useState, useRef, useTransition } from 'react'
import { crearCarpeta, eliminarCarpeta, subirDocumento, eliminarDocumento, sembrarCarpetasDefecto } from './actions'
import { ICONO_DOC } from '@/lib/monitores/constants'
import type { Carpeta, Documento } from '@/lib/monitores/tipos'

const fmtTam = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`

export default function Recursos({ carpetas, documentos, admin }: { carpetas: Carpeta[]; documentos: Documento[]; admin: boolean }) {
  const [sel, setSel] = useState<string | null>(carpetas[0]?.id ?? null)
  const [error, setError] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [, start] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const docs = sel ? documentos.filter(d => d.carpeta_id === sel) : []
  const carpetaSel = carpetas.find(c => c.id === sel)

  function nuevaCarpeta() {
    const nombre = window.prompt('Nombre de la nueva carpeta:')
    if (!nombre?.trim()) return
    start(async () => { const r = await crearCarpeta(nombre); if (!r.ok) setError(r.error) })
  }
  function borrarCarpeta(c: Carpeta) {
    if (!window.confirm(`¿Eliminar la carpeta "${c.nombre}" y sus ${c.numDocs} documento(s)?`)) return
    start(async () => { const r = await eliminarCarpeta(c.id); if (!r.ok) setError(r.error); else if (sel === c.id) setSel(null) })
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !sel) return
    setSubiendo(true); setError('')
    const fd = new FormData(); fd.append('file', file); fd.append('carpetaId', sel)
    const r = await subirDocumento(fd)
    setSubiendo(false)
    if (fileRef.current) fileRef.current.value = ''
    if (!r.ok) setError(r.error)
  }
  function borrarDoc(d: Documento) {
    if (!window.confirm(`¿Eliminar "${d.nombre}"?`)) return
    start(async () => { const r = await eliminarDocumento(d.id); if (!r.ok) setError(r.error) })
  }

  if (carpetas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="text-4xl mb-3">📁</div>
        <p className="text-gray-500 text-sm mb-4">Todavía no hay carpetas de recursos.</p>
        {admin && <button onClick={() => start(async () => { const r = await sembrarCarpetasDefecto(); if (!r.ok) setError(r.error) })}
          className="bg-pm-navy text-white font-bold text-sm px-5 py-2.5 rounded-xl">Crear carpetas por defecto</button>}
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      {/* Carpetas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Carpetas</span>
          {admin && <button onClick={nuevaCarpeta} className="text-pm-red text-sm font-bold hover:underline">+ Nueva</button>}
        </div>
        <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
          {carpetas.map(c => (
            <div key={c.id} className={`group flex items-center gap-1 rounded-xl ${sel === c.id ? 'bg-pm-red-light' : 'hover:bg-gray-50'}`}>
              <button onClick={() => setSel(c.id)} className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left ${sel === c.id ? 'text-pm-red font-bold' : 'text-pm-navy'}`}>
                <span>📁</span><span className="flex-1 truncate">{c.nombre}</span>
                <span className="text-xs text-gray-400">{c.numDocs}</span>
              </button>
              {admin && <button onClick={() => borrarCarpeta(c)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 px-2" title="Eliminar carpeta">✕</button>}
            </div>
          ))}
        </div>
      </div>

      {/* Documentos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-pm-navy">{carpetaSel ? `📁 ${carpetaSel.nombre}` : 'Selecciona una carpeta'}</h3>
          {admin && sel && (
            <>
              <input ref={fileRef} type="file" className="hidden" onChange={onFile}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.avif,.mp4,.mov,.webm" />
              <button onClick={() => fileRef.current?.click()} disabled={subiendo}
                className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-xl">
                {subiendo ? 'Subiendo…' : '⬆ Subir documento'}
              </button>
            </>
          )}
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {docs.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No hay documentos en esta carpeta.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {docs.map(d => (
              <div key={d.id} className="flex items-center gap-3 py-2.5">
                <span className="text-2xl shrink-0">{ICONO_DOC[d.tipo] ?? '📄'}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-pm-navy truncate">{d.nombre}</div>
                  <div className="text-xs text-gray-400">{fmtTam(d.tamano)}</div>
                </div>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-pm-navy hover:text-pm-red text-sm font-semibold px-2">Ver</a>
                <a href={d.url} download className="text-pm-red text-sm font-bold px-2">Descargar</a>
                {admin && <button onClick={() => borrarDoc(d)} className="text-gray-300 hover:text-red-500 px-1" title="Eliminar">🗑</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
