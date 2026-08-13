'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarTaller } from '../actions'
import { SubirImagen } from '@/components/admin/SubirImagen'
import { slugify } from '@/lib/talleres/store'
import type { Taller, SemanaIntensivo, SesionDia } from '@/app/club/talleres-intensivos/config'

const lbl = 'block text-xs font-bold text-pm-navy mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'
const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'

const ESTADOS: { id: string; label: string; desc: string }[] = [
  { id: 'borrador', label: 'Borrador', desc: 'No se muestra en la web' },
  { id: 'proximamente', label: 'Próximamente', desc: 'Aparece en "Próximamente" (sin inscripción)' },
  { id: 'abierto', label: 'Inscripciones abiertas', desc: 'Botón "Inscribirme"' },
  { id: 'ultimas', label: 'Últimas plazas', desc: 'Inscripción abierta, avisa de pocas plazas' },
  { id: 'completo', label: 'Completo', desc: 'Lista de espera' },
  { id: 'cerrado', label: 'Cerrado', desc: 'Sin inscripción (histórico)' },
  { id: 'finalizado', label: 'Finalizado', desc: 'Ya se realizó (histórico)' },
]
const PRIORIDADES = [{ v: 100, l: 'Muy alta (100)' }, { v: 75, l: 'Alta (75)' }, { v: 50, l: 'Normal (50)' }, { v: 10, l: 'Baja (10)' }]
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

type Modalidad = { id: string; nombre: string; descripcion: string; importe: string; activa: boolean }
const num = (v: string): number | null => (v.trim() === '' ? null : Number(v))
const g = <T,>(o: unknown, k: string, d: T): T => ((o as Record<string, unknown>)?.[k] as T) ?? d

export default function EditorTaller({ taller }: { taller: Taller }) {
  const [f, setF] = useState({
    nombre: taller.nombre, subtitulo: taller.subtitulo, descripcion: taller.descripcion,
    nivel: taller.nivel, profesor: taller.profesor, fecha: taller.fecha, horario: taller.horario,
    duracion: taller.duracion, precio: taller.precio,
    plazasTotal: taller.plazasTotal, plazasLibres: taller.plazasLibres,
    imagen: g<string>(taller, 'imagen', ''),
    imagenAlt: g<string>(taller, 'imagenAlt', ''),
    galeria: g<string[]>(taller, 'galeria', []),
    objetivos: taller.objetivos,
    slug: taller.slug || slugify(taller.nombre),
    disciplina: taller.disciplina || '',
    edadMin: g<string>(taller, 'edadMin', ''),
    edadMax: g<string>(taller, 'edadMax', ''),
    lugar: g<string>(taller, 'lugar', ''),
    modalidades: g<Modalidad[]>(taller, 'modalidades', []),
    iban: g<string>(taller, 'iban', ''),
    concepto: g<string>(taller, 'concepto', ''),
    observaciones: g<string>(taller, 'observaciones', ''),
    // ── multi-fecha (legado; la web pública lo sigue usando) ──
    semanas: (taller.semanas ?? []) as SemanaIntensivo[],
    precioDia: taller.precioDia ?? null, precioSemana: taller.precioSemana ?? null, precioPack: taller.precioPack ?? null,
    packLabel: taller.packLabel || 'Las dos semanas',
    plazasSesion: taller.plazasSesion ?? null, plazasSemana: taller.plazasSemana ?? null,
    pagoNota: taller.pagoNota || '',
  })
  const [estado, setEstado] = useState<string>(taller.estado)
  const [prioridad, setPrioridad] = useState<number>(taller.prioridad ?? 50)
  const [destacado, setDestacado] = useState<boolean>(taller.destacado ?? false)
  const [orden, setOrden] = useState<number>(taller.orden ?? 0)
  const [multi, setMulti] = useState((taller.semanas?.length ?? 0) > 0)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const set = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  // ── Semanas/días (legado) ──
  const setSemanas = (semanas: SemanaIntensivo[]) => set('semanas', semanas)
  const patchSemana = (i: number, patch: Partial<SemanaIntensivo>) => setSemanas(f.semanas.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const patchDia = (i: number, j: number, patch: Partial<SesionDia>) => patchSemana(i, { dias: f.semanas[i].dias.map((d, idx) => (idx === j ? { ...d, ...patch } : d)) })

  // ── Modalidades ──
  const setModalidad = (i: number, patch: Partial<Modalidad>) => set('modalidades', f.modalidades.map((m, idx) => idx === i ? { ...m, ...patch } : m))
  const addModalidad = () => set('modalidades', [...f.modalidades, { id: `m${Date.now().toString(36)}`, nombre: '', descripcion: '', importe: '', activa: true }])
  const delModalidad = (i: number) => set('modalidades', f.modalidades.filter((_, idx) => idx !== i))

  function guardar() {
    startTransition(async () => {
      const contenido = { ...f, semanas: multi ? f.semanas : [] }
      const meta = { slug: f.slug, disciplina: f.disciplina, profesor: f.profesor, prioridad, orden, destacado }
      const r = await guardarTaller(taller.id, contenido, estado, meta)
      setMsg(r.ok ? '✓ Guardado' : `Error: ${r.error}`)
      setTimeout(() => setMsg(''), 4000)
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Publicación */}
      <div className={card}>
        <h2 className="font-black text-pm-navy">Publicación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ESTADOS.map(e => (
            <button key={e.id} onClick={() => setEstado(e.id)}
              className={`text-left border-2 rounded-xl p-3 transition-colors ${estado === e.id ? 'border-pm-red bg-pm-red-light' : 'border-gray-200 hover:border-pm-red/40'}`}>
              <div className={`font-bold text-sm ${estado === e.id ? 'text-pm-red' : 'text-pm-navy'}`}>{e.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{e.desc}</div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>URL (slug)</label>
            <div className="flex gap-1.5">
              <input className={inp} value={f.slug} onChange={e => set('slug', e.target.value)} />
              <button onClick={() => set('slug', slugify(f.nombre))} className="shrink-0 text-xs font-bold text-pm-navy border border-gray-200 rounded-lg px-2 hover:border-pm-red" title="Generar desde el título">↻</button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">/club/talleres-intensivos/{f.slug || '…'}</p>
          </div>
          <div>
            <label className={lbl}>Prioridad</label>
            <select className={inp + ' bg-white'} value={prioridad} onChange={e => setPrioridad(Number(e.target.value))}>
              {PRIORIDADES.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Orden manual</label>
            <input type="number" className={inp} value={orden} onChange={e => setOrden(Number(e.target.value) || 0)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-pm-navy">
          <input type="checkbox" checked={destacado} onChange={e => setDestacado(e.target.checked)} className="accent-pm-red w-4 h-4" />
          Destacar en la web (tarjeta grande, etiqueta «Destacado», aparece primero)
        </label>
      </div>

      {/* Datos */}
      <div className={card}>
        <h2 className="font-black text-pm-navy">Datos del intensivo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Título</label><input className={inp} value={f.nombre} onChange={e => set('nombre', e.target.value)} /></div>
          <div><label className={lbl}>Disciplina</label><input className={inp} value={f.disciplina} onChange={e => set('disciplina', e.target.value)} placeholder="Telas aéreas, Verticales…" /></div>
        </div>
        <div><label className={lbl}>Descripción corta (subtítulo)</label><input className={inp} value={f.subtitulo} onChange={e => set('subtitulo', e.target.value)} /></div>
        <div><label className={lbl}>Descripción completa</label><textarea rows={3} className={inp + ' resize-none'} value={f.descripcion} onChange={e => set('descripcion', e.target.value)} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={lbl}>Profesor / monitor</label><input className={inp} value={f.profesor} onChange={e => set('profesor', e.target.value)} /></div>
          <div><label className={lbl}>Nivel</label><input className={inp} value={f.nivel} onChange={e => set('nivel', e.target.value)} /></div>
          <div><label className={lbl}>Duración (por sesión)</label><input className={inp} value={f.duracion} onChange={e => set('duracion', e.target.value)} placeholder="1 h 30 min" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><label className={lbl}>Edad mínima</label><input className={inp} value={f.edadMin} onChange={e => set('edadMin', e.target.value)} placeholder="6" /></div>
          <div><label className={lbl}>Edad máxima</label><input className={inp} value={f.edadMax} onChange={e => set('edadMax', e.target.value)} placeholder="opcional" /></div>
          <div><label className={lbl}>Plazas máx.</label><input type="number" className={inp} value={f.plazasTotal} onChange={e => set('plazasTotal', Number(e.target.value))} /></div>
          <div><label className={lbl}>Lugar</label><input className={inp} value={f.lugar} onChange={e => set('lugar', e.target.value)} placeholder="Instalación del Club" /></div>
        </div>
        <div><label className={lbl}>Objetivos (uno por línea)</label>
          <textarea rows={4} className={inp + ' resize-none'} value={(f.objetivos || []).join('\n')} onChange={e => set('objetivos', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} /></div>
        <div><label className={lbl}>Observaciones internas (no salen a la web)</label>
          <textarea rows={2} className={inp + ' resize-none'} value={f.observaciones} onChange={e => set('observaciones', e.target.value)} /></div>
      </div>

      {/* Imágenes */}
      <div className={card}>
        <h2 className="font-black text-pm-navy">Imágenes</h2>
        <div>
          <label className={lbl}>Cartel / imagen principal</label>
          <SubirImagen value={f.imagen} onChange={url => set('imagen', url)} carpeta="talleres" />
        </div>
        <div><label className={lbl}>Texto alternativo (accesibilidad/SEO)</label><input className={inp} value={f.imagenAlt} onChange={e => set('imagenAlt', e.target.value)} placeholder="Descripción de la imagen" /></div>
        <div>
          <label className={lbl}>Galería (opcional)</label>
          <div className="space-y-2">
            {f.galeria.map((url, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1"><SubirImagen value={url} onChange={u => set('galeria', f.galeria.map((x, j) => j === i ? u : x))} carpeta="talleres" /></div>
                <button onClick={() => set('galeria', f.galeria.filter((_, j) => j !== i))} className="text-xs font-bold text-gray-400 hover:text-pm-red border border-gray-200 rounded-lg px-2 py-2">Quitar</button>
              </div>
            ))}
            <button onClick={() => set('galeria', [...f.galeria, ''])} className="text-xs font-bold text-pm-red hover:text-pm-red-dark">+ Añadir imagen a la galería</button>
          </div>
        </div>
      </div>

      {/* Modalidades de precio */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-pm-navy">Precios (modalidades)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Informativo. NUNCA hay pago online: la inscripción es por formulario.</p>
          </div>
        </div>
        <div><label className={lbl}>Precio resumen (para la tarjeta)</label><input className={inp} value={f.precio} onChange={e => set('precio', e.target.value)} placeholder="Desde 20 €" /></div>
        <div className="space-y-2">
          {f.modalidades.map((m, i) => (
            <div key={m.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input className={inp + ' flex-1 min-w-[120px]'} value={m.nombre} onChange={e => setModalidad(i, { nombre: e.target.value })} placeholder="Nombre (Día suelto, Semana…)" />
                <input className={inp + ' max-w-[110px]'} value={m.importe} onChange={e => setModalidad(i, { importe: e.target.value })} placeholder="20 €" />
                <label className="flex items-center gap-1.5 text-xs font-bold text-pm-navy"><input type="checkbox" checked={m.activa} onChange={e => setModalidad(i, { activa: e.target.checked })} className="accent-pm-red w-4 h-4" /> Activa</label>
                <button onClick={() => delModalidad(i)} className="text-gray-300 hover:text-red-500 text-lg px-1">✕</button>
              </div>
              <input className={inp} value={m.descripcion} onChange={e => setModalidad(i, { descripcion: e.target.value })} placeholder="Descripción (opcional)" />
            </div>
          ))}
          <button onClick={addModalidad} className="text-xs font-bold text-pm-red hover:text-pm-red-dark">+ Añadir modalidad de precio</button>
        </div>
      </div>

      {/* Fechas y sesiones (modo legado multi-semana) */}
      <div className={card}>
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
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lbl}>{multi ? 'Resumen de fechas' : 'Fecha'}</label><input className={inp} value={f.fecha} onChange={e => set('fecha', e.target.value)} placeholder="Semanas del 6 y 20 de julio" /></div>
          <div><label className={lbl}>Horario resumen</label><input className={inp} value={f.horario} onChange={e => set('horario', e.target.value)} placeholder="19:00 – 20:30" /></div>
        </div>
        {multi && (
          <div className="space-y-4">
            {f.semanas.map((s, i) => (
              <div key={s.id} className="border-2 border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input className={inp + ' font-semibold'} value={s.titulo} onChange={e => patchSemana(i, { titulo: e.target.value })} placeholder={`Semana ${i + 1}`} />
                  <button onClick={() => setSemanas(f.semanas.filter((_, idx) => idx !== i))} className="shrink-0 text-gray-400 hover:text-pm-red text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-2">Quitar</button>
                </div>
                <div className="space-y-2">
                  {s.dias.map((d, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <select value={d.dia} onChange={e => patchDia(i, j, { dia: e.target.value })} className={inp + ' bg-white max-w-[10rem]'}>{DIAS_SEMANA.map(dn => <option key={dn} value={dn}>{dn}</option>)}</select>
                      <input value={d.horario} onChange={e => patchDia(i, j, { horario: e.target.value })} placeholder="19:00 – 20:30" className={inp} />
                      <button onClick={() => patchSemana(i, { dias: s.dias.filter((_, idx) => idx !== j) })} className="shrink-0 text-gray-400 hover:text-pm-red text-lg px-1">✕</button>
                    </div>
                  ))}
                  <button onClick={() => patchSemana(i, { dias: [...s.dias, { dia: 'Lunes', horario: f.horario || '19:00 – 20:30' }] })} className="text-xs font-bold text-pm-red">+ Añadir día</button>
                </div>
              </div>
            ))}
            <button onClick={() => setSemanas([...f.semanas, { id: `s${Date.now().toString(36)}`, titulo: '', dias: [] }])} className="w-full border-2 border-dashed border-gray-200 hover:border-pm-red/40 text-sm font-bold text-pm-navy rounded-2xl py-3">+ Añadir semana</button>
          </div>
        )}
      </div>

      {/* Pago */}
      <div className={card}>
        <h2 className="font-black text-pm-navy">Pago (manual · sin cobro online)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>IBAN del Club <span className="text-gray-400 font-normal">(vacío = el del club)</span></label><input className={inp} value={f.iban} onChange={e => set('iban', e.target.value)} placeholder="ES00 0000 …" /></div>
          <div><label className={lbl}>Concepto de transferencia</label><input className={inp} value={f.concepto} onChange={e => set('concepto', e.target.value)} placeholder="Intensivo + nombre del participante" /></div>
        </div>
        <div><label className={lbl}>Nota de pago (opcional)</label><textarea rows={2} className={inp + ' resize-none'} value={f.pagoNota} onChange={e => set('pagoNota', e.target.value)} placeholder="Efectivo en la instalación o transferencia. Plazos, descuentos…" /></div>
      </div>

      {/* Guardar */}
      <div className="sticky bottom-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center gap-3 flex-wrap">
        <a href={`/club/talleres-intensivos#${f.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-pm-navy border border-gray-200 rounded-xl px-4 py-2.5 hover:border-pm-red">Vista previa</a>
        <div className="flex-1" />
        {msg && <span className={`text-sm font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-pm-red'}`}>{msg}</span>}
        <Link href="/admin/talleres-intensivos" className="border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-pm-red">Volver</Link>
        <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-sm">{pending ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </div>
  )
}
