'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generarFamiliasDesdeCRM, guardarFamilia, cambiarEstadoFamilia, vincularAlumno, desvincularAlumno, eliminarFamilia } from './actions'
import { ESTADOS_FAMILIA, type Familia, type EstadoFamilia } from '@/lib/familias/tipos'

export type AlumnoLite = { id: string; nombre: string; actividad: string; email: string }
type Link = { familia_id: string; submission_id: string }
type Props = { familias: Familia[]; links: Link[]; alumnos: AlumnoLite[]; migrado: boolean }

const fechaHora = (s?: string | null) => (s ? new Date(s).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Nunca')
type Resultado = { ok: boolean; error?: string | null }

export default function FamiliasClient({ familias, links, alumnos, migrado }: Props) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [abierta, setAbierta] = useState<string | null>(null)

  const alumnoMap = useMemo(() => new Map(alumnos.map(a => [a.id, a])), [alumnos])
  const idsPorFamilia = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const l of links) { const a = m.get(l.familia_id) ?? []; a.push(l.submission_id); m.set(l.familia_id, a) }
    return m
  }, [links])

  const correr = (fn: () => Promise<Resultado>) => {
    setError('')
    startTransition(async () => { const r = await fn(); if (!r.ok) setError(r.error || 'Error'); else router.refresh() })
  }
  function generar() {
    setError(''); setMsg('')
    startTransition(async () => {
      const r = await generarFamiliasDesdeCRM()
      if (!r.ok) setError(r.error || 'Error')
      else { setMsg(`✓ ${r.nuevasFamilias} cuenta(s) y ${r.nuevosVinculos} vínculo(s) nuevos`); router.refresh() }
    })
  }

  const filtradas = familias.filter(f => !q.trim() || `${f.nombre ?? ''} ${f.email}`.toLowerCase().includes(q.toLowerCase()))
  const activas = familias.filter(f => f.estado === 'activo').length

  return (
    <div className="space-y-5">
      {!migrado && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <div className="font-black mb-1">⚙️ Falta una migración</div>
          Ejecuta <code className="bg-amber-100 px-1.5 py-0.5 rounded">supabase/migration_familias_club.sql</code> en Supabase para activar el Portal de Familias.
        </div>
      )}

      {/* Barra */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o correo…"
          className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red" />
        <button onClick={generar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm whitespace-nowrap">
          {pending ? 'Procesando…' : '↻ Generar / actualizar desde CRM'}
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
      {msg && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{msg}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="text-2xl font-black text-pm-navy">{familias.length}</div><div className="text-xs text-gray-400">Cuentas familiares</div></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="text-2xl font-black text-green-600">{activas}</div><div className="text-xs text-gray-400">Activas</div></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="text-2xl font-black text-pm-navy">{links.length}</div><div className="text-xs text-gray-400">Alumnos vinculados</div></div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          {familias.length === 0 ? 'Aún no hay cuentas. Pulsa «Generar desde CRM» para crearlas a partir de las inscripciones.' : 'Ninguna cuenta coincide con la búsqueda.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(f => {
            const ids = idsPorFamilia.get(f.id) ?? []
            const vinculados = ids.map(id => alumnoMap.get(id)).filter(Boolean) as AlumnoLite[]
            const disponibles = alumnos.filter(a => !ids.includes(a.id))
            return (
              <CardFamilia key={f.id} familia={f} vinculados={vinculados} disponibles={disponibles}
                abierta={abierta === f.id} onToggle={() => setAbierta(abierta === f.id ? null : f.id)}
                pending={pending} correr={correr} />
            )
          })}
        </div>
      )}
    </div>
  )
}

function CardFamilia({ familia, vinculados, disponibles, abierta, onToggle, pending, correr }: {
  familia: Familia; vinculados: AlumnoLite[]; disponibles: AlumnoLite[]
  abierta: boolean; onToggle: () => void; pending: boolean; correr: (fn: () => Promise<Resultado>) => void
}) {
  const [nombre, setNombre] = useState(familia.nombre ?? '')
  const [telefono, setTelefono] = useState(familia.telefono ?? '')
  const [email, setEmail] = useState(familia.email)
  const [addId, setAddId] = useState('')
  const estadoMeta = ESTADOS_FAMILIA.find(e => e.valor === familia.estado)
  const cambiado = nombre !== (familia.nombre ?? '') || telefono !== (familia.telefono ?? '') || email !== familia.email
  const input = 'w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-pm-red'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
        <div className="w-10 h-10 bg-pm-navy rounded-full flex items-center justify-center text-white font-black shrink-0">{(familia.nombre || familia.email)[0].toUpperCase()}</div>
        <div className="flex-1 min-w-[160px]">
          <div className="font-semibold text-pm-navy truncate">{familia.nombre || familia.email.split('@')[0]}</div>
          <div className="text-xs text-gray-400 truncate">{familia.email}{familia.telefono ? ` · ${familia.telefono}` : ''}</div>
        </div>
        <span className="text-xs text-gray-400 hidden lg:block">Últ. acceso: {fechaHora(familia.ultimo_acceso)}</span>
        <span className="text-xs font-semibold bg-pm-bg border border-gray-200 rounded-full px-2 py-0.5 whitespace-nowrap">{vinculados.length} alumno(s)</span>
        <select value={familia.estado} disabled={pending} onChange={e => correr(() => cambiarEstadoFamilia(familia.id, e.target.value as EstadoFamilia))}
          className={`text-xs font-semibold border rounded-lg px-2 py-1.5 ${estadoMeta?.color ?? ''}`}>
          {ESTADOS_FAMILIA.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}
        </select>
        <button onClick={onToggle} className="text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-3 py-1.5 hover:border-pm-red">{abierta ? 'Cerrar' : 'Gestionar'}</button>
      </div>

      {abierta && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Datos de la cuenta</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className={input} placeholder="Nombre del tutor" value={nombre} onChange={e => setNombre(e.target.value)} />
              <input className={input} placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
              <input className={input} placeholder="Correo de acceso" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {cambiado && (
              <button onClick={() => correr(() => guardarFamilia({ id: familia.id, nombre, telefono, email }))} disabled={pending}
                className="mt-2 bg-pm-navy text-white text-xs font-bold px-4 py-2 rounded-lg">Guardar datos</button>
            )}
          </div>

          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Alumnos vinculados</div>
            {vinculados.length === 0 ? (
              <p className="text-xs text-gray-400">Sin alumnos vinculados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vinculados.map(a => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 bg-pm-bg border border-gray-200 rounded-full pl-3 pr-1.5 py-1 text-xs">
                    <span className="font-semibold text-pm-navy">{a.nombre}</span>
                    {a.actividad && <span className="text-gray-400">· {a.actividad}</span>}
                    <button onClick={() => correr(() => desvincularAlumno(familia.id, a.id))} disabled={pending} className="text-gray-300 hover:text-red-500 ml-0.5">✕</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <select value={addId} onChange={e => setAddId(e.target.value)} className={`${input} flex-1`}>
                <option value="">+ Añadir alumno…</option>
                {disponibles.map(a => <option key={a.id} value={a.id}>{a.nombre}{a.actividad ? ` · ${a.actividad}` : ''}{a.email ? ` · ${a.email}` : ''}</option>)}
              </select>
              <button onClick={() => { if (addId) { correr(() => vincularAlumno(familia.id, addId)); setAddId('') } }} disabled={!addId || pending}
                className="bg-pm-red text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50">Añadir</button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <button onClick={() => { if (confirm(`¿Eliminar la cuenta familiar de ${familia.email}? (No borra a los alumnos del CRM)`)) correr(() => eliminarFamilia(familia.id)) }}
              disabled={pending} className="text-xs font-semibold text-gray-400 hover:text-pm-red">Eliminar cuenta familiar</button>
          </div>
        </div>
      )}
    </div>
  )
}
