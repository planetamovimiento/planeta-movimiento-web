'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ESTADOS_TALLER, estadoTallerMeta, type Taller } from '@/app/club/talleres-intensivos/config'
import { crearTaller, duplicarTaller, archivarTaller, eliminarTaller, sembrarTalleresIniciales } from './actions'

export default function TalleresListClient({ talleres, totalEnBD }: { talleres: Taller[]; totalEnBD: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [fEstado, setFEstado] = useState('')
  const [fDisciplina, setFDisciplina] = useState('')
  const [soloDestacados, setSoloDestacados] = useState(false)
  const [verArchivados, setVerArchivados] = useState(false)

  const disciplinas = useMemo(() => Array.from(new Set(talleres.map(t => t.disciplina).filter(Boolean))).sort(), [talleres])

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return talleres.filter(x =>
      (verArchivados ? true : !x.archivado) &&
      (!t || x.nombre.toLowerCase().includes(t)) &&
      (!fEstado || x.estado === fEstado) &&
      (!fDisciplina || x.disciplina === fDisciplina) &&
      (!soloDestacados || x.destacado)
    )
  }, [talleres, q, fEstado, fDisciplina, soloDestacados, verArchivados])

  const correr = (fn: () => Promise<{ ok: boolean; error?: string | null }>, tras?: () => void) => {
    setError('')
    startTransition(async () => {
      const r = await fn()
      if (!r.ok) setError(r.error || 'Error')
      else { tras?.(); router.refresh() }
    })
  }

  const nuevo = () => {
    setError('')
    startTransition(async () => {
      const r = await crearTaller()
      if (r.ok && r.id) router.push(`/admin/talleres-intensivos/${r.id}`)
      else setError(r.error || 'No se pudo crear')
    })
  }

  const sel = 'border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={nuevo} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">+ Crear intensivo</button>
        {totalEnBD < talleres.length && (
          <button onClick={() => correr(() => sembrarTalleresIniciales())} disabled={pending}
            className="text-sm font-semibold text-pm-navy border border-gray-200 hover:border-pm-navy rounded-xl px-3 py-2">
            Importar los intensivos del código
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{lista.length} de {talleres.length}</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por título…"
          className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm flex-1 min-w-[180px]" />
        <select value={fEstado} onChange={e => setFEstado(e.target.value)} className={sel}>
          <option value="">Todos los estados</option>
          {ESTADOS_TALLER.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
        {disciplinas.length > 0 && (
          <select value={fDisciplina} onChange={e => setFDisciplina(e.target.value)} className={sel}>
            <option value="">Toda disciplina</option>
            {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <label className="flex items-center gap-1.5 text-sm text-pm-navy"><input type="checkbox" checked={soloDestacados} onChange={e => setSoloDestacados(e.target.checked)} className="accent-pm-red w-4 h-4" /> Destacados</label>
        <label className="flex items-center gap-1.5 text-sm text-gray-500"><input type="checkbox" checked={verArchivados} onChange={e => setVerArchivados(e.target.checked)} className="accent-pm-red w-4 h-4" /> Ver archivados</label>
      </div>

      {lista.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center bg-white rounded-2xl border border-gray-100">No hay intensivos con estos filtros.</p>
      ) : (
        <div className="space-y-2">
          {lista.map(t => {
            const meta = estadoTallerMeta(t.estado)
            return (
              <div key={t.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-wrap items-center gap-3 ${t.archivado ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-pm-navy truncate">{t.nombre}</span>
                    {t.destacado && <span className="text-xs font-bold text-pm-red bg-pm-red/10 rounded-full px-2 py-0.5">Destacado</span>}
                    {t.archivado && <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Archivado</span>}
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">
                    {[t.disciplina, t.fecha, t.precio].filter(Boolean).join(' · ') || 'Sin fecha'} · /{t.slug}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>{meta.label}</span>
                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  <Link href={`/admin/talleres-intensivos/${t.id}`} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red">Editar</Link>
                  <a href={`/club/talleres-intensivos#${t.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red">Ver</a>
                  <button onClick={() => correr(() => duplicarTaller(t.id))} disabled={pending} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-red disabled:opacity-40">Duplicar</button>
                  <button onClick={() => correr(() => archivarTaller(t.id, !t.archivado))} disabled={pending} className="text-xs font-bold text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-pm-navy disabled:opacity-40">{t.archivado ? 'Restaurar' : 'Archivar'}</button>
                  <button onClick={() => { if (confirm(`¿Eliminar «${t.nombre}»? Solo si no tiene inscripciones.`)) correr(() => eliminarTaller(t.id)) }} disabled={pending} className="text-xs font-bold text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-red-400 hover:text-red-500 disabled:opacity-40">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
