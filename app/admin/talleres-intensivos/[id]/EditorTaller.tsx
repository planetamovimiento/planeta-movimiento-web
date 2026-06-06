'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarTaller } from '../actions'
import type { Taller } from '@/app/club/talleres-intensivos/config'

const lbl = 'block text-xs font-bold text-pm-navy mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

const ESTADOS: { id: string; label: string; desc: string }[] = [
  { id: 'proximamente', label: 'Próximamente', desc: 'Muestra el botón "Avisarme cuando se abra"' },
  { id: 'abierto', label: 'Inscripciones abiertas', desc: 'Muestra el botón "Inscribirme"' },
  { id: 'ultimas', label: 'Últimas plazas', desc: 'Inscripción abierta, avisa de pocas plazas' },
  { id: 'completo', label: 'Completo', desc: 'Muestra lista de espera' },
]

export default function EditorTaller({ taller }: { taller: Taller & { updatedAt?: string | null; updatedBy?: string | null } }) {
  const [f, setF] = useState({
    nombre: taller.nombre, subtitulo: taller.subtitulo, descripcion: taller.descripcion,
    nivel: taller.nivel, profesor: taller.profesor, fecha: taller.fecha, horario: taller.horario,
    duracion: taller.duracion, precio: taller.precio,
    plazasTotal: taller.plazasTotal, plazasLibres: taller.plazasLibres,
    imagen: (taller as { imagen?: string }).imagen || '',
    formulario: (taller as { formulario?: string }).formulario || 'Inscripción / aviso integrado',
    objetivos: taller.objetivos,
  })
  const [estado, setEstado] = useState<string>(taller.estado)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const set = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  function guardar() {
    startTransition(async () => {
      const r = await guardarTaller(taller.id, f, estado)
      setMsg(r.ok ? '✓ Guardado y publicado' : `Error: ${r.error}`)
      setTimeout(() => setMsg(''), 4000)
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Estado / inscripciones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-black text-pm-navy mb-1">Estado e inscripciones</h2>
        <p className="text-xs text-gray-400 mb-4">Controla qué botón ve el usuario en la web</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ESTADOS.map(e => (
            <button key={e.id} onClick={() => setEstado(e.id)}
              className={`text-left border-2 rounded-xl p-3 transition-colors ${estado === e.id ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
              <div className={`font-bold text-sm ${estado === e.id ? 'text-pm-red' : 'text-pm-navy'}`}>{e.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{e.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Datos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-pm-navy">Datos del taller</h2>
        <div><label className={lbl}>Nombre</label><input className={inp} value={f.nombre} onChange={e => set('nombre', e.target.value)} /></div>
        <div><label className={lbl}>Subtítulo</label><input className={inp} value={f.subtitulo} onChange={e => set('subtitulo', e.target.value)} /></div>
        <div><label className={lbl}>Descripción</label><textarea rows={3} className={inp + ' resize-none'} value={f.descripcion} onChange={e => set('descripcion', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>Fecha</label><input className={inp} value={f.fecha} onChange={e => set('fecha', e.target.value)} placeholder="Sábado 12 julio 2026" /></div>
          <div><label className={lbl}>Horario</label><input className={inp} value={f.horario} onChange={e => set('horario', e.target.value)} placeholder="10:00 – 14:00" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className={lbl}>Duración</label><input className={inp} value={f.duracion} onChange={e => set('duracion', e.target.value)} /></div>
          <div><label className={lbl}>Precio</label><input className={inp} value={f.precio} onChange={e => set('precio', e.target.value)} placeholder="60 €" /></div>
          <div><label className={lbl}>Nivel</label><input className={inp} value={f.nivel} onChange={e => set('nivel', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>Plazas totales</label><input type="number" className={inp} value={f.plazasTotal} onChange={e => set('plazasTotal', Number(e.target.value))} /></div>
          <div><label className={lbl}>Plazas libres</label><input type="number" className={inp} value={f.plazasLibres} onChange={e => set('plazasLibres', Number(e.target.value))} /></div>
        </div>
        <div><label className={lbl}>Profesor / instructor</label><input className={inp} value={f.profesor} onChange={e => set('profesor', e.target.value)} /></div>
        <div><label className={lbl}>Imagen (URL)</label><input className={inp} value={f.imagen} onChange={e => set('imagen', e.target.value)} placeholder="/fotos/taller-telas.jpg" /></div>
        <div>
          <label className={lbl}>Objetivos (uno por línea)</label>
          <textarea rows={4} className={inp + ' resize-none'} value={(f.objetivos || []).join('\n')} onChange={e => set('objetivos', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
        </div>
        <div><label className={lbl}>Formulario asociado</label><input className={inp} value={f.formulario} onChange={e => set('formulario', e.target.value)} /></div>
      </div>

      {/* Guardar */}
      <div className="sticky bottom-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
        <div className="flex-1" />
        {msg && <span className={`text-sm font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-pm-red'}`}>{msg}</span>}
        <Link href="/admin/talleres-intensivos" className="border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-pm-red">Volver</Link>
        <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-sm">
          {pending ? 'Guardando...' : 'Publicar cambios'}
        </button>
      </div>
    </div>
  )
}
