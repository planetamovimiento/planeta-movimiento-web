'use client'

import { useEffect, useMemo, useState } from 'react'
import { redirigirARedsys } from '@/components/reserva/redirigirARedsys'
import { waNegocio } from '@/lib/whatsapp'
import PoliticaCancelacion from '@/components/reserva/PoliticaCancelacion'
import { useProteccion, ProteccionCampos } from '@/components/seguridad/ProteccionFormulario'
import { calcularPrecio, eurosDeCents, type NavidadConfig } from '@/lib/navidad/precios'
import type { PaseVista } from '@/lib/navidad/store'
import { comprarEntradasNavidad, comprobarSocioNavidad, getDisponibilidadNavidad } from './actions'

// ─────────────────────────────────────────────────────────────────────────────
// Compra de entradas: día → pase → entradas → datos → descuento → resumen → pago.
// Los precios que se ven aquí son informativos: el importe real lo recalcula el
// servidor antes de cobrar, y el aforo lo decide la base de datos.
// ─────────────────────────────────────────────────────────────────────────────

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fechaCorta(iso: string): { dia: string; numero: string; mes: string } {
  const d = new Date(`${iso}T12:00:00`)
  return { dia: DIAS[d.getDay()].slice(0, 3), numero: String(d.getDate()), mes: MESES[d.getMonth()].slice(0, 3) }
}
function fechaLarga(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

const ETIQUETA_ESTADO: Record<PaseVista['estado'], string> = {
  disponible: 'Disponible', ultimas: 'Últimas plazas', completo: 'Completo', bloqueado: 'No disponible',
}

function Paso({ n, titulo, children, activo = true }: { n: number; titulo: string; children: React.ReactNode; activo?: boolean }) {
  return (
    <section className={activo ? '' : 'opacity-40 pointer-events-none select-none'}>
      <h3 className="flex items-center gap-2 text-sm font-black text-white mb-3">
        <span className="w-6 h-6 rounded-full bg-amber-400 text-red-900 grid place-items-center text-xs">{n}</span>
        {titulo}
      </h3>
      {children}
    </section>
  )
}

function Contador({ label, ayuda, precio, valor, onChange, max }: {
  label: string; ayuda: string; precio: string; valor: number; max: number
  onChange: (v: number) => void
}) {
  const btn = 'w-10 h-10 rounded-xl border-2 border-white/25 text-white text-lg font-black grid place-items-center hover:border-amber-300 hover:text-amber-300 transition-colors disabled:opacity-30'
  return (
    <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
      <div className="min-w-0">
        <div className="text-white font-bold text-sm">{label}</div>
        <div className="text-white/50 text-xs">{ayuda}</div>
        <div className="text-amber-300 text-xs font-black mt-0.5">{precio}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" className={btn} onClick={() => onChange(Math.max(0, valor - 1))} disabled={valor <= 0}
          aria-label={`Quitar ${label}`}>−</button>
        <span className="w-8 text-center text-white font-black text-lg tabular-nums">{valor}</span>
        <button type="button" className={btn} onClick={() => onChange(valor + 1)} disabled={valor >= max}
          aria-label={`Añadir ${label}`}>+</button>
      </div>
    </div>
  )
}

export default function ReservaNavidad({ pasesIniciales, cfg, politicaCancelacion }: {
  pasesIniciales: PaseVista[]
  cfg: NavidadConfig
  politicaCancelacion: string
}) {
  const [pases, setPases] = useState(pasesIniciales)
  const [fecha, setFecha] = useState('')
  const [paseId, setPaseId] = useState('')
  const [ninos, setNinos] = useState(0)
  const [adultos, setAdultos] = useState(0)
  const [bebes, setBebes] = useState(0)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', notas: '' })
  const [socio, setSocio] = useState('')
  const [socioEstado, setSocioEstado] = useState<'sin' | 'comprobando' | 'ok' | 'ko'>('sin')
  const [acepta, setAcepta] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const { valores, hpRef, onToken } = useProteccion()

  const fechas = useMemo(() => [...new Set(pases.map(p => p.fecha))].sort(), [pases])
  const delDia = useMemo(() => pases.filter(p => p.fecha === fecha), [pases, fecha])
  const pase = useMemo(() => pases.find(p => p.id === paseId) || null, [pases, paseId])

  const entradas = { ninos, adultos, bebes }
  const calculo = calcularPrecio(entradas, { socioVerificado: socioEstado === 'ok' }, cfg)
  const topePase = pase ? Math.min(cfg.maxPorCompra, pase.libres) : cfg.maxPorCompra
  const quedanPorRepartir = Math.max(0, topePase - calculo.plazas)

  // Disponibilidad fresca al entrar y cada vez que se elige un día.
  useEffect(() => {
    let vivo = true
    getDisponibilidadNavidad().then(p => { if (vivo && p.length) setPases(p) }).catch(() => {})
    return () => { vivo = false }
  }, [fecha])

  // Si cambia el correo, el nº de socio hay que volver a comprobarlo.
  useEffect(() => { setSocioEstado('sin') }, [form.email])

  async function comprobarSocio() {
    if (!socio.trim() || !form.email.trim()) { setSocioEstado('ko'); return }
    setSocioEstado('comprobando')
    const r = await comprobarSocioNavidad(socio.trim(), form.email.trim())
    setSocioEstado(r.ok ? 'ok' : 'ko')
  }

  async function pagar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!pase) { setError('Elige un día y un pase.'); return }
    setEnviando(true)
    const r = await comprarEntradasNavidad({
      paseId: pase.id,
      entradas,
      cliente: { nombre: form.nombre, email: form.email, telefono: form.telefono },
      notas: form.notas,
      socioNumero: socioEstado === 'ok' ? socio.trim() : '',
      acepta,
      seguridad: valores(),
    })
    if (r.ok) { redirigirARedsys(r); return }
    setEnviando(false)
    setError(r.error)
    // Si falló por plazas, refrescamos para que vea la disponibilidad real.
    getDisponibilidadNavidad().then(p => { if (p.length) setPases(p) }).catch(() => {})
  }

  if (!cfg.ventaActiva) {
    return (
      <div className="bg-white/10 border border-amber-300/40 rounded-3xl p-8 text-center">
        <div className="text-amber-300 font-black text-lg mb-2">Entradas muy pronto</div>
        <p className="text-white/80 text-sm max-w-md mx-auto">
          Estamos terminando de preparar la fábrica. La venta de entradas se abre en unos días: escríbenos
          y te avisamos en cuanto estén disponibles.
        </p>
        <a href={waNegocio('Hola, avisadme cuando se abran las entradas de La Fábrica de Papá Noel')} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-5 bg-amber-400 hover:bg-amber-300 text-red-950 font-black px-6 py-3 rounded-xl transition-colors">
          Avisadme cuando se abran
        </a>
      </div>
    )
  }

  if (pases.length === 0) {
    return (
      <div className="bg-white/10 border border-white/20 rounded-3xl p-8 text-center text-white/80 text-sm">
        Todavía no hay pases publicados. Vuelve en unos días.
      </div>
    )
  }

  const campo = 'w-full bg-white/10 border border-white/25 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-300'

  return (
    <form onSubmit={pagar} className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-5 sm:p-7 space-y-7">
      <ProteccionCampos hpRef={hpRef} onToken={onToken} />

      {/* 1 · Día */}
      <Paso n={1} titulo="Elige el día">
        <div className="flex flex-wrap gap-2">
          {fechas.map(f => {
            const sel = f === fecha
            const libresDia = pases.filter(p => p.fecha === f).reduce((s, p) => s + (p.bloqueado ? 0 : p.libres), 0)
            const c = fechaCorta(f)
            return (
              <button key={f} type="button" disabled={libresDia === 0}
                onClick={() => { setFecha(f); setPaseId('') }}
                className={`w-[86px] rounded-2xl border-2 px-2 py-2.5 text-center transition-colors disabled:opacity-35 ${
                  sel ? 'border-amber-300 bg-amber-300/20' : 'border-white/25 hover:border-amber-300/70'
                }`}>
                <span className="block text-[11px] uppercase text-white/60">{c.dia}</span>
                <span className="block text-2xl font-black text-white leading-none">{c.numero}</span>
                <span className="block text-[11px] text-white/60">{c.mes}</span>
                <span className={`block text-[10px] font-bold mt-1 ${libresDia === 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                  {libresDia === 0 ? 'Completo' : `${libresDia} libres`}
                </span>
              </button>
            )
          })}
        </div>
      </Paso>

      {/* 2 · Pase */}
      <Paso n={2} titulo="Elige el pase" activo={!!fecha}>
        {!fecha ? (
          <p className="text-white/50 text-sm">Primero elige un día.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {delDia.map(p => {
              const libre = p.estado === 'disponible' || p.estado === 'ultimas'
              const sel = p.id === paseId
              return (
                <button key={p.id} type="button" disabled={!libre} onClick={() => setPaseId(p.id)}
                  className={`rounded-2xl border-2 px-3 py-2.5 text-left transition-colors disabled:opacity-35 ${
                    sel ? 'border-amber-300 bg-amber-300/20' : 'border-white/25 hover:border-amber-300/70'
                  }`}>
                  <span className="block text-white font-black">{p.hora}</span>
                  <span className="block text-[11px] text-white/60">a las {p.horaFin}</span>
                  <span className={`block text-[11px] font-bold mt-1 ${
                    p.estado === 'disponible' ? 'text-emerald-300'
                      : p.estado === 'ultimas' ? 'text-amber-300' : 'text-red-300'
                  }`}>
                    {ETIQUETA_ESTADO[p.estado]}{libre ? ` · ${p.libres} plazas` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </Paso>

      {/* 3 · Entradas */}
      <Paso n={3} titulo="¿Quién viene?" activo={!!pase}>
        <div className="space-y-2">
          <Contador label="Niños" ayuda="Desde 2 años" precio={eurosDeCents(cfg.precioNinoCents)}
            valor={ninos} max={ninos + quedanPorRepartir} onChange={setNinos} />
          <Contador label="Adultos" ayuda="Acompañantes" precio={eurosDeCents(cfg.precioAdultoCents)}
            valor={adultos} max={adultos + quedanPorRepartir} onChange={setAdultos} />
          <Contador label="Bebés" ayuda="Menores de 2 años · ocupan plaza" precio="Gratis"
            valor={bebes} max={bebes + quedanPorRepartir} onChange={setBebes} />
        </div>
        {pase && (
          <p className="text-white/50 text-xs mt-2">
            En este pase quedan {pase.libres} plazas. Los bebés entran gratis, pero cuentan para el aforo.
          </p>
        )}
        {calculo.pagantes >= cfg.minGrupo && (
          <p className="text-emerald-300 text-xs font-bold mt-2">
            Descuento de grupo aplicado: −{cfg.pctGrupo} % por ser {calculo.pagantes} entradas de pago.
          </p>
        )}
      </Paso>

      {/* 4 · Datos */}
      <Paso n={4} titulo="Datos de quien reserva" activo={calculo.plazas > 0}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre y apellidos *" className={`${campo} sm:col-span-2`} />
          <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Correo electrónico *" className={campo} />
          <input required type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
            placeholder="Teléfono *" className={campo} />
          <textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })}
            placeholder="¿Algo que debamos saber? (alergias, movilidad, celebraciones…)" className={`${campo} sm:col-span-2 resize-none`} />
        </div>
        <p className="text-white/40 text-[11px] mt-2">
          Solo pedimos los datos de la persona responsable. No hace falta ningún dato de los menores.
        </p>
      </Paso>

      {/* 5 · Descuentos */}
      <Paso n={5} titulo="¿Eres socio del club?" activo={calculo.plazas > 0}>
        {calculo.pagantes >= cfg.minGrupo ? (
          <p className="text-white/70 text-sm">
            Ya tienes el descuento de grupo (−{cfg.pctGrupo} %), que es mayor. Los descuentos no se suman.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input value={socio} onChange={e => { setSocio(e.target.value); setSocioEstado('sin') }}
              placeholder="Tu nº de socio" className={`${campo} max-w-[180px]`} />
            <button type="button" onClick={comprobarSocio} disabled={socioEstado === 'comprobando'}
              className="bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
              {socioEstado === 'comprobando' ? 'Comprobando…' : 'Comprobar'}
            </button>
            {socioEstado === 'ok' && <span className="text-emerald-300 text-xs font-bold">Socio verificado · −{cfg.pctSocio} %</span>}
            {socioEstado === 'ko' && <span className="text-red-300 text-xs font-bold">No coincide con tu correo</span>}
          </div>
        )}
        <p className="text-white/40 text-[11px] mt-2">
          Comprobamos el número contra el Portal de Familias, con el mismo correo con el que entras ahí.
        </p>
      </Paso>

      {/* 6 · Resumen */}
      <Paso n={6} titulo="Resumen" activo={calculo.plazas > 0}>
        <div className="bg-black/20 border border-white/15 rounded-2xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-white/80"><span>La Fábrica de Papá Noel</span>
            <span>{pase ? fechaLarga(pase.fecha) : '—'}</span></div>
          <div className="flex justify-between text-white/80"><span>Pase</span>
            <span>{pase ? `${pase.hora} – ${pase.horaFin}` : '—'}</span></div>
          <div className="flex justify-between text-white/80"><span>Asistentes</span>
            <span>{ninos} niños · {adultos} adultos · {bebes} bebés</span></div>
          <hr className="border-white/10 my-2" />
          <div className="flex justify-between text-white/80"><span>Subtotal</span><span>{eurosDeCents(calculo.subtotalCents)}</span></div>
          {calculo.pct > 0 && (
            <div className="flex justify-between text-emerald-300 font-bold">
              <span>{calculo.tipo === 'grupo' ? `Descuento de grupo −${calculo.pct} %` : `Descuento socio −${calculo.pct} %`}</span>
              <span>−{eurosDeCents(calculo.descuentoCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-black text-lg pt-1">
            <span>Total</span><span>{eurosDeCents(calculo.totalCents)}</span>
          </div>
        </div>

        <label className="flex items-start gap-2 mt-3 text-white/70 text-xs">
          <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} className="mt-0.5 accent-amber-400" />
          <span>
            Acepto las <a href="/terminos-y-condiciones" target="_blank" className="text-amber-300 underline">condiciones de compra</a> y
            la <a href="/politica-privacidad" target="_blank" className="text-amber-300 underline">política de privacidad</a>.
            {politicaCancelacion ? ` ${politicaCancelacion}` : ' Las entradas son para el día y el pase elegidos.'}
          </span>
        </label>
      </Paso>

      <PoliticaCancelacion tema="oscuro" />

      {error && <p className="bg-red-950/50 border border-red-400/40 text-red-200 text-sm rounded-xl px-4 py-3">{error}</p>}

      <button type="submit"
        disabled={enviando || !pase || calculo.totalCents <= 0 || !acepta || !form.nombre || !form.email || !form.telefono}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-red-950 font-black py-4 rounded-2xl text-lg transition-colors">
        {enviando ? 'Llevándote al pago…' : `Pagar ${eurosDeCents(calculo.totalCents)} y reservar`}
      </button>
      <p className="text-center text-white/50 text-xs">
        Pago seguro con tarjeta (Redsys). La plaza se guarda {cfg.minutosReserva} minutos mientras completas el pago.
      </p>
    </form>
  )
}
