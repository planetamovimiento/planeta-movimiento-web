'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarTaller } from '../actions'
import { SubirImagen } from '@/components/admin/SubirImagen'
import type { Taller, SemanaIntensivo, SesionDia } from '@/app/club/talleres-intensivos/config'

const lbl = 'block text-xs font-bold text-pm-navy mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

const ESTADOS: { id: string; label: string; desc: string }[] = [
  { id: 'proximamente', label: 'Próximamente', desc: 'Muestra el botón "Avisarme cuando se abra"' },
  { id: 'abierto', label: 'Inscripciones abiertas', desc: 'Muestra el botón "Inscribirme"' },
  { id: 'ultimas', label: 'Últimas plazas', desc: 'Inscripción abierta, avisa de pocas plazas' },
  { id: 'completo', label: 'Completo', desc: 'Muestra lista de espera' },
  { id: 'finalizado', label: 'Finalizado', desc: 'El intensivo ya se realizó (sin inscripción)' },
]

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** Convierte un texto del input numérico en número o null. */
const num = (v: string): number | null => (v.trim() === '' ? null : Number(v))

export default function EditorTaller({ taller }: { taller: Taller & { updatedAt?: string | null; updatedBy?: string | null } }) {
  const [f, setF] = useState({
    nombre: taller.nombre, subtitulo: taller.subtitulo, descripcion: taller.descripcion,
    nivel: taller.nivel, profesor: taller.profesor, fecha: taller.fecha, horario: taller.horario,
    duracion: taller.duracion, precio: taller.precio,
    plazasTotal: taller.plazasTotal, plazasLibres: taller.plazasLibres,
    imagen: (taller as { imagen?: string }).imagen || '',
    formulario: (taller as { formulario?: string }).formulario || 'Inscripción / aviso integrado',
    objetivos: taller.objetivos,
    // ── multi-fecha ──
    semanas: (taller.semanas ?? []) as SemanaIntensivo[],
    precioDia: taller.precioDia ?? null,
    precioSemana: taller.precioSemana ?? null,
    precioPack: taller.precioPack ?? null,
    packLabel: taller.packLabel || 'Las dos semanas',
    plazasSesion: taller.plazasSesion ?? null,
    plazasSemana: taller.plazasSemana ?? null,
    pagoNota: taller.pagoNota || '',
  })
  const [estado, setEstado] = useState<string>(taller.estado)
  const [multi, setMulti] = useState((taller.semanas?.length ?? 0) > 0)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const set = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  // ── Gestión de semanas y días ───────────────────────────────────────────────
  const setSemanas = (semanas: SemanaIntensivo[]) => set('semanas', semanas)
  const addSemana = () => setSemanas([...f.semanas, { id: `s${Date.now().toString(36)}`, titulo: '', dias: [] }])
  const delSemana = (i: number) => setSemanas(f.semanas.filter((_, idx) => idx !== i))
  const patchSemana = (i: number, patch: Partial<SemanaIntensivo>) =>
    setSemanas(f.semanas.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const addDia = (i: number) =>
    patchSemana(i, { dias: [...f.semanas[i].dias, { dia: 'Lunes', horario: f.horario || '19:00 – 20:30' }] })
  const delDia = (i: number, j: number) =>
    patchSemana(i, { dias: f.semanas[i].dias.filter((_, idx) => idx !== j) })
  const patchDia = (i: number, j: number, patch: Partial<SesionDia>) =>
    patchSemana(i, { dias: f.semanas[i].dias.map((d, idx) => (idx === j ? { ...d, ...patch } : d)) })

  function guardar() {
    startTransition(async () => {
      // Si el modo multi está desactivado, no guardamos semanas (vuelve a una sola fecha).
      const contenido = { ...f, semanas: multi ? f.semanas : [] }
      const r = await guardarTaller(taller.id, contenido, estado)
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
          <div><label className={lbl}>Duración (por sesión)</label><input className={inp} value={f.duracion} onChange={e => set('duracion', e.target.value)} placeholder="1 h 30 min por sesión" /></div>
          <div><label className={lbl}>Nivel</label><input className={inp} value={f.nivel} onChange={e => set('nivel', e.target.value)} /></div>
        </div>
        <div><label className={lbl}>Profesor / instructor</label><input className={inp} value={f.profesor} onChange={e => set('profesor', e.target.value)} /></div>
        <div><label className={lbl}>Imagen</label><SubirImagen value={f.imagen} onChange={url => set('imagen', url)} carpeta="talleres" /></div>
        <div>
          <label className={lbl}>Objetivos (uno por línea)</label>
          <textarea rows={4} className={inp + ' resize-none'} value={(f.objetivos || []).join('\n')} onChange={e => set('objetivos', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
        </div>
        <div><label className={lbl}>Formulario asociado</label><input className={inp} value={f.formulario} onChange={e => set('formulario', e.target.value)} /></div>
      </div>

      {/* Fechas y sesiones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-black text-pm-navy">Fechas y sesiones</h2>
            <p className="text-xs text-gray-400 mt-0.5">Activa el modo intensivo para configurar varias semanas y días.</p>
          </div>
          <button onClick={() => setMulti(m => !m)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${multi ? 'bg-pm-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <span className={`w-2 h-2 rounded-full ${multi ? 'bg-white' : 'bg-gray-400'}`} />
            {multi ? 'Varias semanas: activado' : 'Varias semanas: desactivado'}
          </button>
        </div>

        {!multi ? (
          // Modo simple: una sola fecha/horario/precio
          <>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Fecha</label><input className={inp} value={f.fecha} onChange={e => set('fecha', e.target.value)} placeholder="Sábado 12 julio 2026" /></div>
              <div><label className={lbl}>Horario</label><input className={inp} value={f.horario} onChange={e => set('horario', e.target.value)} placeholder="10:00 – 14:00" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={lbl}>Precio</label><input className={inp} value={f.precio} onChange={e => set('precio', e.target.value)} placeholder="60 €" /></div>
              <div><label className={lbl}>Plazas totales</label><input type="number" className={inp} value={f.plazasTotal} onChange={e => set('plazasTotal', Number(e.target.value))} /></div>
              <div><label className={lbl}>Plazas libres</label><input type="number" className={inp} value={f.plazasLibres} onChange={e => set('plazasLibres', Number(e.target.value))} /></div>
            </div>
          </>
        ) : (
          // Modo intensivo: varias semanas con sus días y horarios
          <div className="space-y-4">
            {/* Resumen mostrado en la tarjeta */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Resumen de fechas (texto)</label><input className={inp} value={f.fecha} onChange={e => set('fecha', e.target.value)} placeholder="Semanas del 6 y 20 de julio" /></div>
              <div><label className={lbl}>Horario resumen</label><input className={inp} value={f.horario} onChange={e => set('horario', e.target.value)} placeholder="19:00 – 20:30" /></div>
            </div>

            {/* Semanas */}
            {f.semanas.map((s, i) => (
              <div key={s.id} className="border-2 border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input className={inp + ' font-semibold'} value={s.titulo} onChange={e => patchSemana(i, { titulo: e.target.value })} placeholder={`Semana ${i + 1} · ej. "Semana del 6 de julio"`} />
                  <button onClick={() => delSemana(i)} className="shrink-0 text-gray-400 hover:text-pm-red text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-2">Quitar</button>
                </div>

                {/* Días de la semana */}
                <div className="space-y-2">
                  {s.dias.map((d, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <select value={d.dia} onChange={e => patchDia(i, j, { dia: e.target.value })} className={inp + ' bg-white max-w-[10rem]'}>
                        {DIAS_SEMANA.map(dn => <option key={dn} value={dn}>{dn}</option>)}
                      </select>
                      <input value={d.horario} onChange={e => patchDia(i, j, { horario: e.target.value })} placeholder="19:00 – 20:30" className={inp} />
                      <button onClick={() => delDia(i, j)} className="shrink-0 text-gray-400 hover:text-pm-red" title="Quitar día">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addDia(i)} className="text-xs font-bold text-pm-red hover:text-pm-red-dark">+ Añadir día</button>
                </div>
              </div>
            ))}
            <button onClick={addSemana} className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red/40 text-sm font-bold text-pm-navy rounded-2xl py-3 transition-colors">+ Añadir semana</button>

            {/* Precios por tramo */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h3 className="font-bold text-pm-navy text-sm">Precios</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={lbl}>Día suelto (€)</label><input type="number" className={inp} value={f.precioDia ?? ''} onChange={e => set('precioDia', num(e.target.value))} placeholder="20" /></div>
                <div><label className={lbl}>Semana completa (€)</label><input type="number" className={inp} value={f.precioSemana ?? ''} onChange={e => set('precioSemana', num(e.target.value))} placeholder="60" /></div>
                <div><label className={lbl}>Pack completo (€)</label><input type="number" className={inp} value={f.precioPack ?? ''} onChange={e => set('precioPack', num(e.target.value))} placeholder="100" /></div>
              </div>
              <div><label className={lbl}>Etiqueta del pack</label><input className={inp} value={f.packLabel} onChange={e => set('packLabel', e.target.value)} placeholder="Las dos semanas" /></div>
            </div>

            {/* Plazas */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Plazas por sesión</label><input type="number" className={inp} value={f.plazasSesion ?? ''} onChange={e => set('plazasSesion', num(e.target.value))} placeholder="10" /></div>
              <div><label className={lbl}>Plazas por semana</label><input type="number" className={inp} value={f.plazasSemana ?? ''} onChange={e => set('plazasSemana', num(e.target.value))} placeholder="10" /></div>
            </div>

            {/* Nota de pago */}
            <div>
              <label className={lbl}>Instrucciones de pago</label>
              <textarea rows={3} className={inp + ' resize-none'} value={f.pagoNota} onChange={e => set('pagoNota', e.target.value)}
                placeholder="Transferencia al Club Deportivo Origen o pago en la instalación. Concepto: «Intensivo + nombre del participante»." />
              <p className="text-xs text-gray-400 mt-1">Los talleres del Club no tienen pago online: este texto guía al usuario tras inscribirse.</p>
            </div>
          </div>
        )}
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
