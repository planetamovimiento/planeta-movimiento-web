'use client'

import { useState, useMemo } from 'react'
import { submitForm } from '@/lib/forms/actions'
import { PagoClub } from '@/components/club/PagoClub'
import { type Taller, type Estado } from './config'

// ─── Badge de estado ─────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<Estado, { label: string; color: string; dot: string }> = {
  abierto:      { label: 'Inscripción abierta',  color: 'bg-green-100 text-green-700 border-green-300',  dot: 'bg-green-500' },
  ultimas:      { label: 'Últimas plazas',        color: 'bg-amber-100 text-amber-700 border-amber-300',  dot: 'bg-amber-500 animate-pulse' },
  completo:     { label: 'Completo',              color: 'bg-gray-100 text-gray-500 border-gray-300',     dot: 'bg-gray-400' },
  proximamente: { label: 'Próximamente',           color: 'bg-blue-100 text-blue-700 border-blue-300',    dot: 'bg-blue-400' },
  finalizado:   { label: 'Finalizado',             color: 'bg-gray-100 text-gray-500 border-gray-300',    dot: 'bg-gray-400' },
}

// ─── Helpers de intensivo multi-semana ────────────────────────────────────────
const esMulti = (t: Taller) => !!(t.semanas && t.semanas.length > 0)

/** Horario común de una semana, o null si los días tienen horarios distintos. */
function horarioComun(dias: { horario: string }[]): string | null {
  const set = new Set(dias.map(d => d.horario).filter(Boolean))
  return set.size === 1 ? [...set][0] : null
}

type Modalidad = { value: string; label: string; precio: number | null }

/** Opciones de inscripción según los precios configurados. */
function modalidadesDe(t: Taller): Modalidad[] {
  const out: Modalidad[] = []
  const semanas = t.semanas ?? []
  if (t.precioDia != null) out.push({ value: 'dia', label: 'Un día suelto', precio: t.precioDia })
  for (const s of semanas) out.push({ value: `sem-${s.id}`, label: `${s.titulo} completa`, precio: t.precioSemana ?? null })
  if (semanas.length > 1 && t.precioPack != null) out.push({ value: 'pack', label: `${t.packLabel || 'Pack completo'} (todas las semanas)`, precio: t.precioPack })
  return out
}

/** Lista de todas las sesiones (para elegir un día suelto concreto). */
function sesionesDe(t: Taller): string[] {
  const out: string[] = []
  for (const s of t.semanas ?? []) for (const d of s.dias) out.push(`${s.titulo} · ${d.dia} (${d.horario})`)
  return out
}

// ─── Lightbox del cartel ───────────────────────────────────────────────────────
function CartelLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-[92vh] max-w-full w-auto rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
      <button onClick={onClose} className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white rounded-full w-10 h-10 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  )
}

// ─── Modal aviso / inscripción ────────────────────────────────────────────────
function ModalAviso({ taller, tipo, onClose }: {
  taller: Taller
  tipo: 'aviso' | 'inscripcion' | 'espera'
  onClose: () => void
}) {
  const multi = esMulti(taller)
  const modalidades = useMemo(() => modalidadesDe(taller), [taller])
  const sesiones = useMemo(() => sesionesDe(taller), [taller])
  // Por defecto, la primera modalidad que no obligue a elegir día concreto.
  const modPorDefecto = (modalidades.find(m => m.value !== 'dia') ?? modalidades[0])?.value ?? ''

  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', nivel: '', modalidad: modPorDefecto, sesion: '' })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const modSel = modalidades.find(m => m.value === form.modalidad)
  const precioSel = modSel?.precio
  const necesitaSesion = multi && form.modalidad === 'dia'

  const titulos = {
    aviso:       `Avísame — ${taller.nombre}`,
    inscripcion: `Inscripción — ${taller.nombre}`,
    espera:      `Lista de espera — ${taller.nombre}`,
  }
  const textos = {
    aviso:       'Te notificaremos en cuanto se abra la inscripción para este taller.',
    inscripcion: 'Completa tus datos para reservar tu plaza. Te confirmaremos la inscripción en breve.',
    espera:      'El taller está completo. Déjanos tus datos y te avisamos si se libera alguna plaza.',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
    const extra =
      tipo === 'inscripcion' && multi
        ? {
            modalidad: modSel?.label ?? '',
            precio: precioSel != null ? `${precioSel} €` : '',
            ...(necesitaSesion && form.sesion ? { dia: form.sesion } : {}),
            pago: 'Transferencia al Club Deportivo Origen o pago en la instalación',
          }
        : {}
    await submitForm({
      tipo: 'inscripcion',
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      asunto: `Taller intensivo · ${taller.nombre} (${tipo})`,
      datos: {
        taller: taller.nombre,
        solicitud: tipo === 'aviso' ? 'Avisar cuando abra' : tipo === 'espera' ? 'Lista de espera' : 'Inscripción',
        nivel: form.nivel,
        ...extra,
      },
    })
    setEnviando(false); setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-br ${taller.grad} text-white px-6 py-5 flex items-center justify-between sticky top-0 z-10`}>
          <div>
            <div className="font-black text-base">{titulos[tipo]}</div>
            <div className="text-white/70 text-xs mt-0.5">{textos[tipo]}</div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white shrink-0 ml-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {enviado ? (
          <div className="text-center py-10 px-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-black text-pm-navy text-lg mb-2">¡Recibido!</p>
            <p className="text-gray-500 text-sm mb-3">
              {tipo === 'aviso'   && 'Te avisaremos en cuanto se abra la inscripción.'}
              {tipo === 'espera'  && 'Te contactaremos si se libera alguna plaza.'}
              {tipo === 'inscripcion' && 'Nos pondremos en contacto contigo para confirmar tu plaza.'}
            </p>
            {tipo === 'inscripcion' && multi && (
              <div className="mb-5">
                <PagoClub actividad={taller.nombre} />
                {taller.pagoNota && <p className="text-gray-500 text-xs mt-2 leading-relaxed">{taller.pagoNota}</p>}
              </div>
            )}
            <button onClick={onClose} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Resumen de la edición */}
            {tipo === 'inscripcion' && (
              <div className={`${taller.colorLight} border ${taller.colorBorder} rounded-xl p-3 text-sm`}>
                <div className={`font-bold ${taller.colorText}`}>{taller.nombre}</div>
                {multi
                  ? <div className="text-gray-600 text-xs mt-1">{taller.fecha} · {taller.horario}</div>
                  : taller.fecha && <div className="text-gray-600 text-xs mt-1">{taller.fecha} · {taller.horario} · {taller.precio}</div>}
                {!multi && taller.fecha && <div className="text-gray-500 text-xs">Plazas disponibles: {taller.plazasLibres} / {taller.plazasTotal}</div>}
              </div>
            )}

            {/* Selector de modalidad (intensivos de varias semanas) */}
            {tipo === 'inscripcion' && multi && modalidades.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-pm-navy uppercase tracking-wider">Modalidad</label>
                <div className="space-y-1.5">
                  {modalidades.map(m => (
                    <label key={m.value}
                      className={`flex items-center justify-between gap-2 border-2 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${form.modalidad === m.value ? `${taller.colorBorder} ${taller.colorLight}` : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="flex items-center gap-2 text-sm">
                        <input type="radio" name="modalidad" value={m.value} checked={form.modalidad === m.value}
                          onChange={e => setForm(f => ({ ...f, modalidad: e.target.value }))} className="accent-pm-red" />
                        <span className="font-semibold text-pm-navy">{m.label}</span>
                      </span>
                      {m.precio != null && <span className={`font-black text-sm ${taller.colorText}`}>{m.precio} €</span>}
                    </label>
                  ))}
                </div>
                {/* Día concreto si es "un día suelto" */}
                {necesitaSesion && (
                  <select required value={form.sesion} onChange={e => setForm(f => ({ ...f, sesion: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white">
                    <option value="">Elige el día *</option>
                    {sesiones.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {precioSel != null && (
                  <div className="flex items-center justify-between bg-pm-navy text-white rounded-xl px-4 py-2.5">
                    <span className="text-xs font-semibold text-white/70">Precio</span>
                    <span className="font-black text-lg">{precioSel} €</span>
                  </div>
                )}
              </div>
            )}

            <input required type="text" placeholder="Nombre y apellidos *"
              value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            <input required type="email" placeholder="Email *"
              value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            <input type="tel" placeholder="Teléfono"
              value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>

            {tipo === 'inscripcion' && (
              <select value={form.nivel} onChange={e => setForm(f => ({...f, nivel: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white">
                <option value="">Nivel / experiencia previa</option>
                <option>Sin experiencia</option>
                <option>Principiante (menos de 1 año)</option>
                <option>Intermedio (1-3 años)</option>
                <option>Avanzado (+3 años)</option>
              </select>
            )}

            {/* Información de pago del Club (solo inscripción multi) */}
            {tipo === 'inscripcion' && multi && (
              <div>
                <PagoClub actividad={taller.nombre} />
                {taller.pagoNota && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{taller.pagoNota}</p>}
              </div>
            )}

            <button type="submit" disabled={!form.nombre || !form.email || enviando}
              className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
              {enviando ? 'Enviando...' : (
                tipo === 'aviso'       ? 'Avísame cuando se abra' :
                tipo === 'espera'      ? 'Apuntarme a la lista'   :
                                        'Confirmar inscripción'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Barra de plazas ─────────────────────────────────────────────────────────
function BarraPlazas({ taller }: { taller: Taller }) {
  const porcentaje = taller.plazasTotal > 0
    ? Math.round(((taller.plazasTotal - taller.plazasLibres) / taller.plazasTotal) * 100)
    : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{taller.plazasLibres} plazas libres</span>
        <span>{taller.plazasTotal} total</span>
      </div>
      <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            porcentaje >= 90 ? 'bg-pm-red' : porcentaje >= 60 ? 'bg-amber-500' : 'bg-green-500'
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}

// ─── Botón de acción según estado ──────────────────────────────────────────────
function BotonEstado({ estado, onAbrir }: { estado: Estado; onAbrir: (t: 'aviso' | 'inscripcion' | 'espera') => void }) {
  if (estado === 'abierto')
    return <button onClick={() => onAbrir('inscripcion')} className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3.5 rounded-xl transition-colors">Inscribirme</button>
  if (estado === 'ultimas')
    return <button onClick={() => onAbrir('inscripcion')} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-xl transition-colors">Últimas plazas — Inscribirme</button>
  if (estado === 'completo')
    return <button onClick={() => onAbrir('espera')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-black py-3.5 rounded-xl transition-colors">Apuntarme a la lista de espera</button>
  if (estado === 'proximamente')
    return <button onClick={() => onAbrir('aviso')} className="w-full border-2 border-pm-navy text-pm-navy hover:bg-pm-navy hover:text-white font-black py-3.5 rounded-xl transition-colors">Avísame cuando se abra</button>
  return <div className="w-full text-center bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl text-sm">Intensivo finalizado</div>
}

// ─── Tarjeta de taller ────────────────────────────────────────────────────────
function TarjetaTaller({ taller }: { taller: Taller }) {
  const [modal, setModal] = useState<'aviso' | 'inscripcion' | 'espera' | null>(null)
  const [verCartel, setVerCartel] = useState(false)
  const estado = ESTADO_CONFIG[taller.estado]
  const multi = esMulti(taller)
  const conCartel = !!taller.imagen

  // ── Tarjeta con cartel: el cartel ya contiene la información, mostramos lo mínimo ──
  if (conCartel) {
    return (
      <>
        <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
          <button type="button" onClick={() => setVerCartel(true)} className="relative block w-full bg-pm-navy group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={taller.imagen} alt={`Cartel del ${taller.nombre}`} className="w-full h-auto block" />
            <span className={`absolute top-3 right-3 flex items-center gap-1.5 border text-xs font-bold px-3 py-1 rounded-full shadow ${estado.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`}/>{estado.label}
            </span>
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Ampliar cartel</span>
          </button>
          <div className="p-5 flex flex-col gap-3">
            <div>
              <h3 className="font-black text-pm-navy text-lg leading-tight">{taller.nombre}</h3>
              {taller.subtitulo && <p className="text-gray-500 text-sm">{taller.subtitulo}</p>}
            </div>
            <BotonEstado estado={taller.estado} onAbrir={setModal} />
          </div>
        </div>

        {verCartel && <CartelLightbox src={taller.imagen!} alt={`Cartel del ${taller.nombre}`} onClose={() => setVerCartel(false)} />}
        {modal && <ModalAviso taller={taller} tipo={modal} onClose={() => setModal(null)} />}
      </>
    )
  }

  // ── Tarjeta sin cartel: diseño informativo completo ──
  const infoCells = multi
    ? [
        { label: 'Nivel', valor: taller.nivel },
        { label: 'Duración', valor: taller.duracion },
        { label: 'Plazas/sesión', valor: taller.plazasSesion ? String(taller.plazasSesion) : '—' },
        { label: 'Instructor', valor: taller.profesor },
      ]
    : [
        { label: 'Nivel', valor: taller.nivel },
        { label: 'Duración', valor: taller.duracion },
        { label: 'Precio', valor: taller.precio },
        { label: 'Instructor', valor: taller.profesor },
      ]

  return (
    <>
      <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">

        {/* Cabecera visual */}
        <div className={`relative bg-gradient-to-br ${taller.grad} p-8 text-white`}>
          <div className="flex items-start justify-end mb-4">
            <span className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1 rounded-full ${estado.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`}/>
              {estado.label}
            </span>
          </div>
          <h3 className="text-2xl font-black mb-1">{taller.nombre}</h3>
          <p className="text-white/70 text-sm">{taller.subtitulo}</p>

          {/* Semanas y sesiones (modo multi) */}
          {multi ? (
            <div className="mt-4 space-y-2">
              {taller.semanas!.map(s => {
                const hc = horarioComun(s.dias)
                return (
                  <div key={s.id} className="bg-white/10 border border-white/20 rounded-xl p-3 text-sm">
                    <div className="font-semibold">{s.titulo}</div>
                    <div className="text-white/70 text-xs mt-1">
                      {s.dias.map(d => d.dia).join(' · ')}{hc ? ` · ${hc}` : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            taller.fecha && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-3 text-sm space-y-1">
                <div className="font-semibold">{taller.fecha}</div>
                {taller.horario && <div className="text-white/80">{taller.horario}</div>}
              </div>
            )
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 flex flex-col flex-1 gap-5">

          {/* Descripción */}
          <p className="text-gray-600 text-sm leading-relaxed">{taller.descripcion}</p>

          {/* Precios por tramo (modo multi) */}
          {multi && (
            <div className={`${taller.colorLight} border ${taller.colorBorder} rounded-xl p-4`}>
              <div className={`text-xs font-black uppercase tracking-wider ${taller.colorText} mb-2`}>Precios</div>
              <ul className="text-sm text-pm-navy space-y-1.5">
                {taller.precioDia != null && (
                  <li className="flex justify-between"><span>1 día suelto</span><span className="font-bold">{taller.precioDia} €</span></li>
                )}
                {taller.precioSemana != null && (
                  <li className="flex justify-between"><span>1 semana completa</span><span className="font-bold">{taller.precioSemana} €</span></li>
                )}
                {taller.precioPack != null && (taller.semanas?.length ?? 0) > 1 && (
                  <li className="flex justify-between"><span>{taller.packLabel || 'Pack completo'}</span><span className="font-bold">{taller.precioPack} €</span></li>
                )}
              </ul>
              <p className="text-xs text-gray-500 mt-2">Una semana completa equivale a todos los días de esa semana.</p>
            </div>
          )}

          {/* Objetivos */}
          <div>
            <div className={`text-xs font-black uppercase tracking-wider ${taller.colorText} mb-2`}>Trabajarás</div>
            <div className="flex flex-wrap gap-1.5">
              {taller.objetivos.map(o => (
                <span key={o} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${taller.colorLight} ${taller.colorText} ${taller.colorBorder}`}>
                  {o}
                </span>
              ))}
            </div>
          </div>

          {/* Info rápida */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {infoCells.map(({ label, valor }) => (
              <div key={label} className="bg-pm-bg rounded-xl p-2.5">
                <div className="text-gray-400 text-xs">{label}</div>
                <div className="font-bold text-pm-navy mt-0.5 leading-tight">{valor}</div>
              </div>
            ))}
          </div>

          {/* Plazas (solo legacy con fecha) */}
          {!multi && taller.fecha && taller.estado !== 'proximamente' && taller.estado !== 'finalizado' && (
            <BarraPlazas taller={taller} />
          )}

          {/* Botón según estado */}
          <div className="mt-auto">
            <BotonEstado estado={taller.estado} onAbrir={setModal} />
          </div>
        </div>
      </div>

      {modal && (
        <ModalAviso taller={taller} tipo={modal} onClose={() => setModal(null)}/>
      )}
    </>
  )
}

// ─── Componente principal exportado ──────────────────────────────────────────
export default function TalleresClient({ talleres }: { talleres: Taller[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {talleres.map(t => <TarjetaTaller key={t.id} taller={t} />)}
    </div>
  )
}
