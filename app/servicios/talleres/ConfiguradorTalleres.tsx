'use client'

import { useState, useMemo } from 'react'

// ─── Módulos disponibles ─────────────────────────────────────────────────────
const MODULOS = [
  {
    id: 'airtrack',
    nombre: 'AirTrack',
    precio: 250,
    icon: '🤸',
    color: 'border-blue-300 bg-blue-50',
    colorSel: 'border-blue-500 bg-blue-100',
    badge: 'bg-blue-500',
    descripcion: 'Colchoneta hinchable profesional para saltos, acrobacias, circuitos y dinámicas deportivas.',
    incluye: [],
    destacado: false,
  },
  {
    id: 'portico',
    nombre: 'Pórtico Aéreo + Tela',
    precio: 300,
    icon: '🎪',
    color: 'border-purple-300 bg-purple-50',
    colorSel: 'border-purple-500 bg-purple-100',
    badge: 'bg-purple-500',
    descripcion: 'Estructura aérea portátil con tela aérea para iniciación al circo aéreo de forma segura.',
    incluye: ['Estructura portátil montada', 'Tela aérea profesional', 'Equipamiento de seguridad'],
    destacado: true,
  },
  {
    id: 'circo',
    nombre: 'Taller de Circo',
    precio: 200,
    icon: '🎭',
    color: 'border-pm-red/30 bg-pm-red-light',
    colorSel: 'border-pm-red bg-red-100',
    badge: 'bg-pm-red',
    descripcion: 'Iniciación a las principales disciplinas circenses mediante juegos y retos adaptados a cada grupo.',
    incluye: ['Malabares', 'Equilibrios', 'Juegos grupales', 'Material completo'],
    destacado: false,
  },
  {
    id: 'manualidades',
    nombre: 'Taller de Manualidades',
    precio: 50,
    icon: '🎨',
    color: 'border-yellow-300 bg-yellow-50',
    colorSel: 'border-yellow-500 bg-yellow-100',
    badge: 'bg-yellow-500',
    descripcion: 'Taller creativo adaptado a todas las edades donde los participantes desarrollan actividades artísticas.',
    incluye: [],
    destacado: false,
  },
  {
    id: 'pintacaras',
    nombre: 'Pintacaras + Tatuajes',
    precio: 100,
    icon: '💄',
    color: 'border-pink-300 bg-pink-50',
    colorSel: 'border-pink-500 bg-pink-100',
    badge: 'bg-pink-500',
    descripcion: 'Servicio de pintacaras artístico y tatuajes temporales para grandes grupos y eventos multitudinarios.',
    incluye: [],
    destacado: false,
  },
  {
    id: 'agua',
    nombre: 'Taller del Agua',
    precio: 100,
    icon: '💧',
    color: 'border-sky-300 bg-sky-50',
    colorSel: 'border-sky-500 bg-sky-100',
    badge: 'bg-sky-500',
    descripcion: 'Taller temático con actividades refrescantes y dinámicas grupales de verano.',
    incluye: ['Juegos con agua', 'Pistolas de agua', 'Globos de agua', 'Juegos cooperativos', 'Retos por equipos'],
    destacado: false,
  },
]

const TIPOS_ENTIDAD = [
  'Ayuntamiento', 'Diputación', 'Empresa', 'Asociación',
  'Centro educativo', 'AMPA', 'Entidad pública', 'Festival / Feria', 'Otro',
]

// ─── Cálculo de monitores ─────────────────────────────────────────────────────
function calcularMonitores(participantes: number): number {
  return Math.max(2, Math.ceil(participantes / 12))
}

// ─── Tarjeta de módulo ────────────────────────────────────────────────────────
function TarjetaModulo({
  modulo, seleccionado, onToggle,
}: {
  modulo: typeof MODULOS[0]
  seleccionado: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col gap-3 ${
        seleccionado ? modulo.colorSel + ' shadow-md scale-[1.01]' : modulo.color + ' hover:shadow-sm hover:scale-[1.005]'
      }`}
    >
      {/* Destacado badge */}
      {modulo.destacado && !seleccionado && (
        <span className="absolute -top-3 left-4 bg-pm-navy text-white text-xs font-black px-3 py-1 rounded-full">
          ⭐ Más solicitado
        </span>
      )}

      {/* Check seleccionado */}
      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        seleccionado ? `${modulo.badge} border-transparent` : 'border-gray-300 bg-white'
      }`}>
        {seleccionado && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>

      {/* Contenido */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{modulo.icon}</span>
        <div>
          <h3 className="font-black text-pm-navy text-base leading-tight">{modulo.nombre}</h3>
          <span className="text-2xl font-black text-pm-navy">{modulo.precio} €</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">{modulo.descripcion}</p>

      {modulo.incluye.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {modulo.incluye.map(item => (
            <span key={item} className="text-xs bg-white/70 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              ✓ {item}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`mt-auto w-full py-2 rounded-xl text-sm font-black transition-colors ${
          seleccionado
            ? 'bg-pm-navy text-white'
            : 'bg-white border border-gray-200 text-pm-navy hover:border-pm-navy'
        }`}
      >
        {seleccionado ? '✓ Añadido al taller' : '+ Añadir al taller'}
      </button>
    </div>
  )
}

// ─── Resumen de presupuesto ────────────────────────────────────────────────────
function ResumenPresupuesto({
  seleccionados, participantes, monitores,
}: {
  seleccionados: Set<string>
  participantes: number
  monitores: number
}) {
  const modulosSelec = MODULOS.filter(m => seleccionados.has(m.id))
  const costoActividades = modulosSelec.reduce((s, m) => s + m.precio, 0)
  const costoMonitores = monitores * 100
  const total = costoActividades + costoMonitores

  return (
    <div className="space-y-3">
      {/* Actividades */}
      {modulosSelec.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm italic">
          Selecciona actividades para ver el presupuesto
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-black text-gray-500 uppercase tracking-wider">Actividades</div>
          {modulosSelec.map(m => (
            <div key={m.id} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100">
              <span className="flex items-center gap-1.5 text-pm-navy">
                <span>{m.icon}</span>{m.nombre}
              </span>
              <span className="font-bold text-pm-navy">{m.precio} €</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-gray-600 pt-1">
            <span>Subtotal actividades</span>
            <span className="font-semibold">{costoActividades} €</span>
          </div>
        </div>
      )}

      {/* Monitores */}
      <div className="bg-pm-bg border border-gray-200 rounded-xl p-3">
        <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Monitores (obligatorio)</div>
        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="font-bold text-pm-navy">{monitores} monitor{monitores > 1 ? 'es' : ''}</div>
            <div className="text-xs text-gray-500">
              {participantes} participantes ÷ 12 = {monitores} (mín. 2)
            </div>
          </div>
          <div className="font-bold text-pm-navy">{costoMonitores} €</div>
        </div>

        {/* Barra visual de ratio */}
        <div className="mt-2 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-pm-red h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, (participantes / (monitores * 12)) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1 flex justify-between">
          <span>{participantes} participantes</span>
          <span>Capacidad máx: {monitores * 12}</span>
        </div>
      </div>

      {/* Total */}
      {modulosSelec.length > 0 && (
        <div className="bg-pm-navy text-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white/60 text-xs">Presupuesto total</div>
              <div className="text-white/60 text-xs">({modulosSelec.length} actividad{modulosSelec.length > 1 ? 'es' : ''} + {monitores} monitores)</div>
            </div>
            <div className="text-3xl font-black">{total} €</div>
          </div>
          <p className="text-white/50 text-xs mt-2">* Precio orientativo. El presupuesto final puede variar según la ubicación y duración.</p>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ConfiguradorTalleres() {
  const [participantes, setParticipantes] = useState(50)
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({
    entidad: '', tipoEntidad: '', contacto: '', telefono: '',
    email: '', direccion: '', fecha: '', horario: '', observaciones: '',
  })

  const monitores = useMemo(() => calcularMonitores(participantes), [participantes])

  function toggleModulo(id: string) {
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const costoActividades = MODULOS.filter(m => seleccionados.has(m.id)).reduce((s, m) => s + m.precio, 0)
  const costoMonitores   = monitores * 100
  const totalPresupuesto = costoActividades + costoMonitores

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    await new Promise(r => setTimeout(r, 1500))
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="text-2xl font-black text-pm-navy mb-3">¡Solicitud de presupuesto enviada!</h3>
        <p className="text-gray-600 text-sm max-w-sm mx-auto mb-4">
          Nuestro equipo revisará tu configuración y te responderá en menos de 24 horas con el presupuesto detallado.
        </p>
        <div className="inline-block bg-pm-bg border border-gray-200 rounded-xl px-6 py-4 text-left text-sm max-w-xs mb-6">
          <div className="font-black text-pm-navy mb-2">Tu configuración:</div>
          <div className="text-gray-600">{participantes} participantes · {monitores} monitores</div>
          <div className="text-gray-600">{seleccionados.size} actividades seleccionadas</div>
          <div className="font-black text-pm-navy mt-2">Total estimado: {totalPresupuesto} €</div>
        </div>
        <br/>
        <button onClick={() => setEnviado(false)} className="text-pm-red underline text-sm">
          Hacer otra consulta
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* ── PASO 1: Participantes ── */}
      <div id="configurador">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-pm-red rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">1</div>
          <h2 className="text-xl font-black text-pm-navy">¿Cuántos participantes asistirán?</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slider + counter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-5 mb-5">
              <button onClick={() => setParticipantes(p => Math.max(12, p - 12))}
                className="w-12 h-12 bg-pm-bg border border-gray-200 rounded-xl text-xl font-bold hover:border-pm-red transition-colors">−</button>
              <div className="flex-1 text-center">
                <div className="text-6xl font-black text-pm-navy leading-none">{participantes}</div>
                <div className="text-gray-400 text-sm mt-1">participantes</div>
              </div>
              <button onClick={() => setParticipantes(p => p + 12)}
                className="w-12 h-12 bg-pm-bg border border-gray-200 rounded-xl text-xl font-bold hover:border-pm-red transition-colors">+</button>
            </div>
            <input
              type="range" min={12} max={300} step={1} value={participantes}
              onChange={e => setParticipantes(Number(e.target.value))}
              className="w-full accent-pm-red h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12</span><span>150</span><span>300+</span>
            </div>
          </div>

          {/* Monitores calculados */}
          <div className="bg-pm-navy text-white rounded-2xl p-6">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-3">Monitores necesarios (cálculo automático)</div>
            <div className="flex items-end gap-3 mb-3">
              <div className="text-5xl font-black">{monitores}</div>
              <div className="text-white/70 text-sm pb-1">monitores × 100 € = <strong className="text-white">{monitores * 100} €</strong></div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-sm space-y-1.5">
              <div className="flex justify-between text-white/70">
                <span>Fórmula:</span>
                <span>ceil({participantes} ÷ 12) = {Math.ceil(participantes / 12)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Mínimo obligatorio:</span>
                <span>2 monitores</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-white/10 pt-1.5 mt-1">
                <span>Monitores asignados:</span>
                <span>{monitores}</span>
              </div>
            </div>

            {/* Escala visual */}
            <div className="mt-3 flex gap-1 flex-wrap">
              {Array.from({ length: Math.min(monitores, 8) }).map((_, i) => (
                <div key={i} className="w-8 h-8 bg-white/20 border border-white/30 rounded-lg flex items-center justify-center text-sm">
                  👨‍🏫
                </div>
              ))}
              {monitores > 8 && <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-lg flex items-center justify-center text-xs text-white/70">+{monitores - 8}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── PASO 2: Módulos ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pm-red rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">2</div>
            <h2 className="text-xl font-black text-pm-navy">Elige las actividades de tu taller</h2>
          </div>
          {seleccionados.size > 0 && (
            <button onClick={() => setSeleccionados(new Set())}
              className="text-xs text-gray-400 hover:text-pm-red underline transition-colors">
              Limpiar selección
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULOS.map(modulo => (
            <TarjetaModulo
              key={modulo.id}
              modulo={modulo}
              seleccionado={seleccionados.has(modulo.id)}
              onToggle={() => toggleModulo(modulo.id)}
            />
          ))}
        </div>
      </div>

      {/* ── PASO 3: Resumen + Formulario ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-pm-red rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">3</div>
          <h2 className="text-xl font-black text-pm-navy">Resumen y solicitud de presupuesto</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="text-xs font-black text-pm-navy uppercase tracking-wider pb-2 border-b border-gray-100">Datos de tu organización</div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de entidad *</label>
                <select required value={form.tipoEntidad} onChange={e => setForm(f => ({...f, tipoEntidad: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red bg-white">
                  <option value="">— Selecciona —</option>
                  {TIPOS_ENTIDAD.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre de la organización *</label>
                <input required type="text" placeholder="Ayto. de Cuenca, AMPA..."
                  value={form.entidad} onChange={e => setForm(f => ({...f, entidad: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Persona de contacto *</label>
                <input required type="text" placeholder="Nombre y apellidos"
                  value={form.contacto} onChange={e => setForm(f => ({...f, contacto: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono *</label>
                <input required type="tel" placeholder="600 000 000"
                  value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
              <input required type="email" placeholder="contacto@entidad.org"
                value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha del evento *</label>
                <input required type="date" min={new Date().toISOString().slice(0,10)}
                  value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Horario aproximado</label>
                <input type="text" placeholder="Ej. de 10:00 a 14:00"
                  value={form.horario} onChange={e => setForm(f => ({...f, horario: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección del evento *</label>
              <input required type="text" placeholder="Plaza Mayor s/n, Parque Municipal..."
                value={form.direccion} onChange={e => setForm(f => ({...f, direccion: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Observaciones</label>
              <textarea rows={3} placeholder="Espacio disponible, público objetivo, necesidades especiales, contexto del evento..."
                value={form.observaciones} onChange={e => setForm(f => ({...f, observaciones: e.target.value}))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-pm-red resize-none"/>
            </div>

            {seleccionados.size === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3">
                ⚠ Selecciona al menos una actividad para completar la solicitud.
              </div>
            )}

            <button type="submit"
              disabled={seleccionados.size === 0 || !form.entidad || !form.contacto || !form.email || !form.telefono || !form.fecha || !form.direccion || enviando}
              className="w-full bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-colors shadow-lg">
              {enviando
                ? 'Enviando solicitud...'
                : seleccionados.size > 0
                  ? `Solicitar presupuesto — ${totalPresupuesto} €`
                  : 'Selecciona actividades para continuar'
              }
            </button>
            <p className="text-center text-xs text-gray-400">Sin compromiso · Respuesta en menos de 24 horas</p>
          </form>

          {/* Resumen sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-pm-navy text-white px-5 py-4">
                <div className="font-black text-base">📊 Presupuesto en tiempo real</div>
                <div className="text-white/60 text-xs mt-0.5">{participantes} participantes · {monitores} monitores</div>
              </div>
              <div className="p-5">
                <ResumenPresupuesto
                  seleccionados={seleccionados}
                  participantes={participantes}
                  monitores={monitores}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
