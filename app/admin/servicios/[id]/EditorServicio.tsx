'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { guardarServicio } from '../actions'
import type { ServicioFull } from '@/lib/servicios/store'

const ESTADOS = ['activo', 'inactivo', 'proximamente', 'completo', 'pausado', 'oculto', 'borrador']
const ACCIONES_EMPRESA = [
  { id: 'reserva', label: 'Ir a reserva' }, { id: 'carrito', label: 'Ir a carrito' },
  { id: 'presupuesto', label: 'Solicitud de presupuesto' }, { id: 'formulario', label: 'Ir a formulario' },
  { id: 'externo', label: 'Enlace externo' }, { id: 'proximamente', label: 'Mostrar "próximamente"' },
  { id: 'espera', label: 'Lista de espera' },
]
const ACCIONES_CLUB = [
  { id: 'formulario', label: 'Ir a formulario' }, { id: 'externo', label: 'Enlace externo' },
  { id: 'proximamente', label: 'Mostrar "próximamente"' }, { id: 'espera', label: 'Lista de espera' },
]

const lbl = 'block text-xs font-bold text-pm-navy mb-1.5'
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red'

export default function EditorServicio({ servicio }: { servicio: ServicioFull }) {
  const [f, setF] = useState({ ...servicio })
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const esClub = servicio.entidad === 'club'
  const acciones = esClub ? ACCIONES_CLUB : ACCIONES_EMPRESA

  const set = (k: keyof ServicioFull, v: unknown) => setF(prev => ({ ...prev, [k]: v }))
  const num = (v: string) => (v === '' ? null : Number(v))

  function guardar() {
    // Confirmación en cambios sensibles
    const sensibles =
      f.precio !== servicio.precio || f.precioDesde !== servicio.precioDesde ||
      f.fianza !== servicio.fianza || f.fechas !== servicio.fechas
    if (sensibles && !confirm('Vas a cambiar precios o fechas. ¿Confirmas que quieres publicar estos cambios?')) return

    const contenido = {
      nombre: f.nombre, categoria: f.categoria, tipo: f.tipo,
      descripcionCorta: f.descripcionCorta, descripcionLarga: f.descripcionLarga,
      precio: f.precio, precioDesde: f.precioDesde, iva: f.iva, fianza: f.fianza,
      edad: f.edad, plazas: f.plazas, horarios: f.horarios, fechas: f.fechas,
      estado: f.estado, destacado: f.destacado,
      botonTexto: f.botonTexto, botonAccion: f.botonAccion, enlace: f.enlace,
      imagen: f.imagen, galeria: f.galeria, profesores: f.profesores, niveles: f.niveles,
      faqs: f.faqs, condiciones: f.condiciones, notasInternas: f.notasInternas,
    }
    startTransition(async () => {
      const r = await guardarServicio(servicio.id, contenido)
      setMsg(r.ok ? `✓ Guardado (${r.cambios ?? 0} cambios)` : `Error: ${r.error}`)
      setTimeout(() => setMsg(''), 4000)
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Botón / redirección */}
      <Seccion titulo="Botón y redirección" nota="Controla qué hace el botón principal en la web. Mantiene separada la lógica de club y empresa.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Texto del botón</label>
            <input className={inp} value={f.botonTexto} onChange={e => set('botonTexto', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Acción del botón</label>
            <select className={inp + ' bg-white'} value={f.botonAccion} onChange={e => set('botonAccion', e.target.value)}>
              {acciones.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={lbl}>Enlace / destino {f.botonAccion === 'externo' ? '(URL externa)' : '(ruta interna)'}</label>
          <input className={inp} value={f.enlace} onChange={e => set('enlace', e.target.value)} placeholder="/servicios/... o https://..." />
        </div>
        {esClub && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            🏅 Servicio del Club: solo dispone de acciones de formulario/info. Nunca compra directa.
          </p>
        )}
      </Seccion>

      {/* Básico */}
      <Seccion titulo="Información básica">
        <label className={lbl}>Nombre del servicio</label>
        <input className={inp} value={f.nombre} onChange={e => set('nombre', e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div><label className={lbl}>Categoría</label><input className={inp} value={f.categoria} onChange={e => set('categoria', e.target.value)} /></div>
          <div><label className={lbl}>Edad recomendada</label><input className={inp} value={f.edad} onChange={e => set('edad', e.target.value)} /></div>
        </div>
        <div className="mt-4"><label className={lbl}>Descripción corta</label><textarea rows={2} className={inp + ' resize-none'} value={f.descripcionCorta} onChange={e => set('descripcionCorta', e.target.value)} /></div>
        <div className="mt-4"><label className={lbl}>Descripción larga</label><textarea rows={4} className={inp + ' resize-none'} value={f.descripcionLarga} onChange={e => set('descripcionLarga', e.target.value)} /></div>
      </Seccion>

      {/* Económico (empresa) */}
      {!esClub && (
        <Seccion titulo="Precios y económico" nota="Cambios aquí pedirán confirmación al guardar.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className={lbl}>Precio (€)</label><input type="number" className={inp} value={f.precio ?? ''} onChange={e => set('precio', num(e.target.value))} /></div>
            <div><label className={lbl}>Precio desde (€)</label><input type="number" className={inp} value={f.precioDesde ?? ''} onChange={e => set('precioDesde', num(e.target.value))} /></div>
            <div><label className={lbl}>IVA (%)</label><input type="number" className={inp} value={f.iva ?? ''} onChange={e => set('iva', num(e.target.value))} /></div>
            <div><label className={lbl}>Fianza (€)</label><input type="number" className={inp} value={f.fianza ?? ''} onChange={e => set('fianza', num(e.target.value))} /></div>
          </div>
        </Seccion>
      )}

      {/* Logística */}
      <Seccion titulo="Fechas, horarios y plazas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Horarios</label><input className={inp} value={f.horarios} onChange={e => set('horarios', e.target.value)} /></div>
          <div><label className={lbl}>Plazas</label><input type="number" className={inp} value={f.plazas ?? ''} onChange={e => set('plazas', num(e.target.value))} /></div>
        </div>
        <div className="mt-4"><label className={lbl}>Fechas disponibles</label><input className={inp} value={f.fechas} onChange={e => set('fechas', e.target.value)} placeholder="Ej. 22 jun – 14 ago" /></div>
      </Seccion>

      {/* Club: profesores y niveles */}
      {esClub && (
        <Seccion titulo="Datos del Club">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Profesores</label><input className={inp} value={f.profesores} onChange={e => set('profesores', e.target.value)} /></div>
            <div><label className={lbl}>Niveles</label><input className={inp} value={f.niveles} onChange={e => set('niveles', e.target.value)} /></div>
          </div>
        </Seccion>
      )}

      {/* Imágenes */}
      <Seccion titulo="Imágenes" nota="Pega URLs de imágenes (por ahora). La subida de archivos se añadirá después.">
        <label className={lbl}>Imagen principal (URL)</label>
        <input className={inp} value={f.imagen} onChange={e => set('imagen', e.target.value)} placeholder="https://..." />
        <label className={lbl + ' mt-4'}>Galería (una URL por línea)</label>
        <textarea rows={3} className={inp + ' resize-none'} value={(f.galeria || []).join('\n')} onChange={e => set('galeria', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
      </Seccion>

      {/* FAQs */}
      <FaqEditor faqs={f.faqs || []} onChange={v => set('faqs', v)} />

      {/* Condiciones y notas */}
      <Seccion titulo="Condiciones y notas">
        <label className={lbl}>Condiciones / textos informativos</label>
        <textarea rows={3} className={inp + ' resize-none'} value={f.condiciones} onChange={e => set('condiciones', e.target.value)} />
        <label className={lbl + ' mt-4'}>Observaciones internas (no se muestran en la web)</label>
        <textarea rows={2} className={inp + ' resize-none'} value={f.notasInternas} onChange={e => set('notasInternas', e.target.value)} />
      </Seccion>

      {/* Estado + Guardar (barra fija inferior) */}
      <div className="sticky bottom-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex flex-wrap items-center gap-3">
        <div>
          <label className="text-xs font-bold text-pm-navy mr-2">Estado:</label>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" value={f.estado} onChange={e => set('estado', e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-pm-navy">
          <input type="checkbox" className="accent-pm-red w-4 h-4" checked={f.destacado} onChange={e => set('destacado', e.target.checked)} />
          Destacado
        </label>
        <div className="flex-1" />
        {msg && <span className={`text-sm font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-pm-red'}`}>{msg}</span>}
        <Link href="/admin/servicios" className="border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-pm-red">Volver</Link>
        <button onClick={guardar} disabled={pending} className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-sm">
          {pending ? 'Guardando...' : 'Publicar cambios'}
        </button>
      </div>
    </div>
  )
}

function Seccion({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-black text-pm-navy mb-1">{titulo}</h2>
      {nota && <p className="text-xs text-gray-400 mb-4">{nota}</p>}
      {!nota && <div className="mb-4" />}
      {children}
    </div>
  )
}

function FaqEditor({ faqs, onChange }: { faqs: { q: string; a: string }[]; onChange: (v: { q: string; a: string }[]) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-pm-navy">Preguntas frecuentes</h2>
        <button onClick={() => onChange([...faqs, { q: '', a: '' }])} className="text-sm font-bold text-pm-red">+ Añadir</button>
      </div>
      {faqs.length === 0 && <p className="text-sm text-gray-400">Sin preguntas. Pulsa "Añadir".</p>}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-pm-bg rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <input className={inp} placeholder="Pregunta" value={faq.q} onChange={e => onChange(faqs.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} />
              <button onClick={() => onChange(faqs.filter((_, j) => j !== i))} className="text-gray-400 hover:text-pm-red px-2">✕</button>
            </div>
            <textarea rows={2} className={inp + ' resize-none'} placeholder="Respuesta" value={faq.a} onChange={e => onChange(faqs.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} />
          </div>
        ))}
      </div>
    </div>
  )
}
