'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from './ui'
import { FichaParticipante } from '@/components/familias/FichaParticipante'
import { guardarFotoHijo, quitarFotoHijo, guardarTallaHijo } from './actions'
import { TALLAS_EQUIPACION } from '@/lib/club/cuota'
import type { AlumnoFamilia } from '@/lib/familias/tipos'

export default function PanelesHijos({ alumnos }: { alumnos: AlumnoFamilia[] }) {
  // Con un solo hijo, se abre directamente.
  const [abierto, setAbierto] = useState<string | null>(alumnos.length === 1 ? alumnos[0].id : null)

  return (
    <div className="space-y-4">
      {alumnos.map(a => {
        const open = abierto === a.id
        return (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tarjeta (clic para desplegar la ficha) */}
            <button onClick={() => setAbierto(open ? null : a.id)}
              className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors">
              <Avatar foto={a.foto_url} nombre={a.nombre} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-pm-navy truncate">{a.nombre} {a.apellidos}</div>
                <div className="text-sm text-gray-500 truncate">{a.actividad || 'Club Deportivo Origen'}</div>
                {a.grupo && <div className="text-xs text-gray-400 truncate">{a.grupo}</div>}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-pm-red mr-1">{open ? 'Ocultar' : 'Ver ficha'}</span>
              <svg className={`w-5 h-5 text-pm-red shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="border-t border-gray-100 p-4 sm:p-5">
                <FichaParticipante alumno={a}
                  slotFoto={<FotoHijo submissionId={a.id} foto={a.foto_url} nombre={a.nombre} />}
                  slotTalla={<TallaHijo submissionId={a.id} talla={a.talla} />} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Talla de equipación, editable por la familia. Se sincroniza con el CRM. */
function TallaHijo({ submissionId, talla }: { submissionId: string; talla: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [val, setVal] = useState(talla)
  const [msg, setMsg] = useState('')

  function guardar(nueva: string) {
    setVal(nueva); setMsg('')
    startTransition(async () => {
      const r = await guardarTallaHijo(submissionId, nueva)
      if (r.ok) { setMsg('Talla actualizada'); router.refresh() }
      else { setMsg(r.error || 'No se pudo guardar'); setVal(talla) }
    })
  }

  return (
    <div className="bg-pm-bg rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-400 mb-1">Talla equipación</div>
      <select value={val} disabled={pending} onChange={e => guardar(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-pm-red disabled:opacity-60">
        <option value="">— Elegir —</option>
        {TALLAS_EQUIPACION.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      {msg && <p className="text-[11px] text-gray-500 mt-1">{pending ? 'Guardando…' : msg}</p>}
    </div>
  )
}

/** Foto de perfil del hijo, editable por la familia (sube/cambia/quita). */
function FotoHijo({ submissionId, foto, nombre }: { submissionId: string; foto: string; nombre: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function subir(file: File) {
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      const r = await guardarFotoHijo(submissionId, fd)
      if (r.ok) router.refresh()
      else setError(r.error || 'No se pudo subir la imagen')
    })
  }

  function quitar() {
    setError('')
    startTransition(async () => {
      const r = await quitarFotoHijo(submissionId)
      if (r.ok) router.refresh()
      else setError(r.error || 'No se pudo quitar la imagen')
    })
  }

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <Avatar foto={foto} nombre={nombre} size="xl" />
      <div className="flex flex-col items-center gap-1">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={pending}
          className="text-xs font-bold text-pm-navy hover:text-pm-red transition-colors disabled:opacity-50">
          {pending ? 'Subiendo…' : foto ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {foto && !pending && (
          <button type="button" onClick={quitar} className="text-[11px] font-bold text-gray-400 hover:text-pm-red transition-colors">Quitar</button>
        )}
      </div>
      {error && <p className="text-[11px] text-pm-red text-center">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) subir(f); e.target.value = '' }} />
    </div>
  )
}
