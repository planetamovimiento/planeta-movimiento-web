'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/forms/actions'
import { type Taller, type Estado } from './config'

// ─── Badge de estado ─────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<Estado, { label: string; color: string; dot: string }> = {
  abierto:      { label: 'Inscripción abierta',  color: 'bg-green-100 text-green-700 border-green-300',  dot: 'bg-green-500' },
  ultimas:      { label: 'Últimas plazas',        color: 'bg-amber-100 text-amber-700 border-amber-300',  dot: 'bg-amber-500 animate-pulse' },
  completo:     { label: 'Completo',              color: 'bg-gray-100 text-gray-500 border-gray-300',     dot: 'bg-gray-400' },
  proximamente: { label: 'Próximamente',           color: 'bg-blue-100 text-blue-700 border-blue-300',    dot: 'bg-blue-400' },
}

// ─── Modal aviso / inscripción ────────────────────────────────────────────────
function ModalAviso({ taller, tipo, onClose }: {
  taller: Taller
  tipo: 'aviso' | 'inscripcion' | 'espera'
  onClose: () => void
}) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', nivel: '' })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const titulos = {
    aviso:       `🔔 Avísame — ${taller.nombre}`,
    inscripcion: `✍️ Inscripción — ${taller.nombre}`,
    espera:      `📋 Lista de espera — ${taller.nombre}`,
  }

  const textos = {
    aviso:       'Te notificaremos en cuanto se abra la inscripción para este taller.',
    inscripcion: 'Completa tus datos para reservar tu plaza. Te confirmaremos la inscripción en breve.',
    espera:      'El taller está completo. Déjanos tus datos y te avisamos si se libera alguna plaza.',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setEnviando(true)
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
      },
    })
    setEnviando(false); setEnviado(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-br ${taller.grad} text-white px-6 py-5 flex items-center justify-between`}>
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
            <p className="text-gray-500 text-sm mb-5">
              {tipo === 'aviso'   && 'Te avisaremos en cuanto se abra la inscripción.'}
              {tipo === 'espera'  && 'Te contactaremos si se libera alguna plaza.'}
              {tipo === 'inscripcion' && 'Nos pondremos en contacto contigo para confirmar tu plaza.'}
            </p>
            <button onClick={onClose} className="bg-pm-red hover:bg-pm-red-dark text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {tipo === 'inscripcion' && taller.fecha && (
              <div className={`${taller.colorLight} border ${taller.colorBorder} rounded-xl p-3 text-sm`}>
                <div className={`font-bold ${taller.colorText}`}>{taller.nombre}</div>
                <div className="text-gray-600 text-xs mt-1">{taller.fecha} · {taller.horario} · {taller.precio}</div>
                <div className="text-gray-500 text-xs">Plazas disponibles: {taller.plazasLibres} / {taller.plazasTotal}</div>
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

            <button type="submit" disabled={!form.nombre || !form.email || enviando}
              className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black py-3.5 rounded-xl transition-colors">
              {enviando ? 'Enviando...' : (
                tipo === 'aviso'       ? '🔔 Avísame cuando se abra'  :
                tipo === 'espera'      ? '📋 Apuntarme a la lista'    :
                                        '✍️ Confirmar inscripción'
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

// ─── Tarjeta de taller ────────────────────────────────────────────────────────
function TarjetaTaller({ taller }: { taller: Taller }) {
  const [modal, setModal] = useState<'aviso' | 'inscripcion' | 'espera' | null>(null)
  const estado = ESTADO_CONFIG[taller.estado]

  return (
    <>
      <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">

        {/* Cabecera visual */}
        <div className={`relative bg-gradient-to-br ${taller.grad} p-8 text-white`}>
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl">{taller.icon}</span>
            <span className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1 rounded-full ${estado.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`}/>
              {estado.label}
            </span>
          </div>
          <h3 className="text-2xl font-black mb-1">{taller.nombre}</h3>
          <p className="text-white/70 text-sm">{taller.subtitulo}</p>

          {/* Fecha y horario si existen */}
          {taller.fecha && (
            <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-3 text-sm space-y-1">
              <div className="flex items-center gap-2"><span>📅</span><span className="font-semibold">{taller.fecha}</span></div>
              {taller.horario && <div className="flex items-center gap-2"><span>⏰</span><span>{taller.horario}</span></div>}
            </div>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 flex flex-col flex-1 gap-5">

          {/* Descripción */}
          <p className="text-gray-600 text-sm leading-relaxed">{taller.descripcion}</p>

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
            {[
              { icon: '🎯', label: 'Nivel', valor: taller.nivel },
              { icon: '⏱',  label: 'Duración', valor: taller.duracion },
              { icon: '💰', label: 'Precio', valor: taller.precio },
              { icon: '👨‍🏫', label: 'Instructor', valor: taller.profesor },
            ].map(({ icon, label, valor }) => (
              <div key={label} className="bg-pm-bg rounded-xl p-2.5">
                <div className="text-gray-400 text-xs">{icon} {label}</div>
                <div className="font-bold text-pm-navy mt-0.5 leading-tight">{valor}</div>
              </div>
            ))}
          </div>

          {/* Plazas (solo si hay fecha) */}
          {taller.fecha && taller.estado !== 'proximamente' && (
            <BarraPlazas taller={taller} />
          )}

          {/* Botón según estado */}
          <div className="mt-auto">
            {taller.estado === 'abierto' && (
              <button onClick={() => setModal('inscripcion')}
                className="w-full bg-pm-red hover:bg-pm-red-dark text-white font-black py-3.5 rounded-xl transition-colors">
                ✍️ Inscribirme
              </button>
            )}
            {taller.estado === 'ultimas' && (
              <button onClick={() => setModal('inscripcion')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-xl transition-colors">
                ⚡ Últimas plazas — Inscribirme
              </button>
            )}
            {taller.estado === 'completo' && (
              <button onClick={() => setModal('espera')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-black py-3.5 rounded-xl transition-colors">
                📋 Apuntarme a la lista de espera
              </button>
            )}
            {taller.estado === 'proximamente' && (
              <button onClick={() => setModal('aviso')}
                className="w-full border-2 border-pm-navy text-pm-navy hover:bg-pm-navy hover:text-white font-black py-3.5 rounded-xl transition-colors">
                🔔 Avísame cuando se abra
              </button>
            )}
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
