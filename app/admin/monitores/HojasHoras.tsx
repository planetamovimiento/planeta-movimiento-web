'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { subirHojaHoras, urlHojaHoras, firmarHojaHoras, eliminarHojaHoras } from './actions'
import type { HojaHoras } from '@/lib/monitores/tipos'

const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '')

/** Abre en otra pestaña el archivo o la firma (enlace firmado de 60 s). */
async function abrir(id: string, que: 'hoja' | 'firma', onError: (e: string) => void) {
  const r = await urlHojaHoras(id, que)
  if (r.ok) window.open(r.url, '_blank', 'noopener')
  else onError(r.error)
}

// ─── Panel del ADMIN: subir hojas y ver cuáles están firmadas ─────────────────
export function HojasHorasAdmin({ monitorId, hojas }: { monitorId: string; hojas: HojaHoras[] }) {
  const router = useRouter()
  const [periodo, setPeriodo] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, start] = useTransition()

  function subir(file: File) {
    setError('')
    if (!periodo.trim()) { setError('Escribe el periodo antes de subir el archivo'); return }
    const fd = new FormData()
    fd.append('monitorId', monitorId); fd.append('periodo', periodo.trim()); fd.append('file', file)
    start(async () => {
      const r = await subirHojaHoras(fd)
      if (!r.ok) setError(r.error)
      else { setPeriodo(''); router.refresh() }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Hojas de horas</div>
      <p className="text-xs text-gray-400 mb-3">Sube la hoja (PDF o imagen) y el monitor la firma desde su portal.</p>

      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input value={periodo} onChange={e => setPeriodo(e.target.value)} placeholder="Periodo (Septiembre 2026)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:border-pm-red" />
        <button type="button" disabled={pending} onClick={() => inputRef.current?.click()}
          className="bg-pm-navy text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50">
          {pending ? 'Subiendo…' : 'Subir hoja'}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) subir(f); e.target.value = '' }} />
      </div>

      {error && <p className="text-xs text-pm-red mb-2">{error}</p>}

      {hojas.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no has subido ninguna hoja de horas.</p>
      ) : (
        <div className="space-y-2">
          {hojas.map(h => (
            <div key={h.id} className="flex flex-wrap items-center gap-2 border border-gray-100 rounded-xl p-2.5">
              <div className="flex-1 min-w-[160px]">
                <div className="font-bold text-pm-navy text-sm">{h.periodo}</div>
                <div className="text-[11px] text-gray-400">
                  {h.firmado_at ? `Firmada por ${h.firma_nombre} · ${fecha(h.firmado_at)}` : 'Pendiente de firma'}
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${h.firmado_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {h.firmado_at ? '✓ Firmada' : '⏳ Sin firmar'}
              </span>
              <button type="button" onClick={() => abrir(h.id, 'hoja', setError)} className="text-xs font-bold text-pm-navy hover:text-pm-red">Ver hoja</button>
              {h.firmado_at && (
                <button type="button" onClick={() => abrir(h.id, 'firma', setError)} className="text-xs font-bold text-pm-navy hover:text-pm-red">Ver firma</button>
              )}
              <button type="button" disabled={pending}
                onClick={() => { if (window.confirm(`¿Eliminar la hoja de horas «${h.periodo}»? También se borra su firma.`)) start(async () => { const r = await eliminarHojaHoras(h.id); if (!r.ok) setError(r.error); else router.refresh() }) }}
                className="text-xs font-bold text-gray-400 hover:text-red-600">Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Portal del MONITOR: ver sus hojas y firmarlas ───────────────────────────
export function HojasHorasMonitor({ hojas }: { hojas: HojaHoras[] }) {
  const router = useRouter()
  const [firmando, setFirmando] = useState<HojaHoras | null>(null)
  const [error, setError] = useState('')

  const pendientes = hojas.filter(h => !h.firmado_at)

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {hojas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-400">
          Todavía no tienes ninguna hoja de horas. Cuando el club suba una, aparecerá aquí para que la firmes.
        </div>
      ) : (
        <>
          {pendientes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              Tienes {pendientes.length} hoja(s) de horas pendientes de firmar.
            </div>
          )}
          {hojas.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[160px]">
                <div className="font-black text-pm-navy">{h.periodo}</div>
                <div className="text-xs text-gray-400">
                  {h.firmado_at ? `Firmada el ${fecha(h.firmado_at)}` : 'Revísala y fírmala'}
                </div>
                {h.observaciones && <div className="text-xs text-gray-500 mt-1">{h.observaciones}</div>}
              </div>
              <button type="button" onClick={() => abrir(h.id, 'hoja', setError)}
                className="text-sm font-bold text-pm-navy hover:text-pm-red">Ver hoja</button>
              {h.firmado_at ? (
                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">✓ Firmada</span>
              ) : (
                <button type="button" onClick={() => { setError(''); setFirmando(h) }}
                  className="bg-pm-red text-white text-sm font-bold px-4 py-2 rounded-xl">✍️ Firmar</button>
              )}
            </div>
          ))}
        </>
      )}

      {firmando && (
        <ModalFirma hoja={firmando} onClose={() => setFirmando(null)}
          onFirmada={() => { setFirmando(null); router.refresh() }} onError={setError} />
      )}
    </div>
  )
}

/** Lienzo de firma: vale con el ratón y con el dedo en el móvil. */
function ModalFirma({ hoja, onClose, onFirmada, onError }: {
  hoja: HojaHoras; onClose: () => void; onFirmada: () => void; onError: (e: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dibujando = useRef(false)
  const [vacia, setVacia] = useState(true)
  const [pending, start] = useTransition()

  function punto(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height }
  }

  function empezar(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0F1A3D'
    const p = punto(e)
    ctx.beginPath(); ctx.moveTo(p.x, p.y)
    dibujando.current = true
    setVacia(false)
    canvasRef.current!.setPointerCapture(e.pointerId)
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const p = punto(e)
    ctx.lineTo(p.x, p.y); ctx.stroke()
  }

  function limpiar() {
    const c = canvasRef.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setVacia(true)
  }

  function guardar() {
    const dataUrl = canvasRef.current!.toDataURL('image/png')
    start(async () => {
      const r = await firmarHojaHoras(hoja.id, dataUrl)
      if (r.ok) onFirmada()
      else { onError(r.error); onClose() }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
        <div className="font-black text-pm-navy mb-1">Firmar «{hoja.periodo}»</div>
        <p className="text-xs text-gray-500 mb-3">
          Firma con el ratón o con el dedo. Al guardar, quedan registrados tu nombre y la fecha, y la firma no se puede cambiar.
        </p>
        <canvas ref={canvasRef} width={600} height={220}
          onPointerDown={empezar} onPointerMove={mover} onPointerUp={() => { dibujando.current = false }}
          onPointerLeave={() => { dibujando.current = false }}
          className="w-full h-[180px] border-2 border-dashed border-gray-200 rounded-xl bg-white touch-none" />
        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" onClick={guardar} disabled={vacia || pending}
            className="bg-pm-red text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40">
            {pending ? 'Guardando…' : 'Guardar firma'}
          </button>
          <button type="button" onClick={limpiar} className="text-sm font-bold text-gray-500 px-3 py-2">Borrar</button>
          <button type="button" onClick={onClose} className="ml-auto text-sm font-bold text-gray-400 px-3 py-2">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
