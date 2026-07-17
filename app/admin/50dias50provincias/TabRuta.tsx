'use client'

import { useMemo, useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import {
  AQUI, ESTADOS_ETAPA, ESTADO_ACTUAL, badgeEstadoEtapa, dotEstadoEtapa, euros, fechaCorta,
  fechaLarga, labelEstadoEtapa, youtubeEmbed, youtubeId,
  type EstadoEtapa,
} from '@/lib/reto50/constants'
import type { Etapa } from '@/lib/reto50/tipos'
import { guardarEtapa, marcarEtapaActual } from './actions'
import { Bloque, BotonMini, Campo, inputCls, type Correr } from './piezas'

type Props = { etapas: Etapa[]; pending: boolean; correr: Correr; editable: boolean }

export default function TabRuta({ etapas, pending, correr, editable }: Props) {
  const [q, setQ] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'' | EstadoEtapa>('')
  const [abierta, setAbierta] = useState<string | null>(null)

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase()
    return etapas.filter(e => {
      if (filtroEstado && e.estado !== filtroEstado) return false
      if (!t) return true
      return `${e.dia} ${e.provincia} ${e.ciudad} ${e.fecha}`.toLowerCase().includes(t)
    })
  }, [etapas, q, filtroEstado])

  const actual = etapas.find(e => e.estado === ESTADO_ACTUAL)
  const hechas = etapas.filter(e => e.estado === 'finalizada').length

  /**
   * Marca dónde está Brosjaca. Si ya había otra etapa actual, se pregunta antes
   * de darla por completada: que la fecha haya pasado no significa que se hiciera.
   */
  function marcarActual(etapa: Etapa) {
    const anterior = actual && actual.id !== etapa.id ? actual : null
    let completar = false
    if (anterior) {
      completar = confirm(
        `Vas a marcar el Día ${etapa.dia} · ${etapa.provincia} como etapa actual.\n\n` +
        `¿Marcar también la anterior (Día ${anterior.dia} · ${anterior.provincia}) como completada?\n\n` +
        `Aceptar = se marca completada.\nCancelar = vuelve a pendiente.`,
      )
    }
    correr(() => marcarEtapaActual(etapa.id, completar))
  }

  return (
    <div className="space-y-4">
      <Bloque
        titulo="Las 50 etapas"
        desc="Una provincia por día, del 19 de julio al 6 de septiembre de 2026."
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por provincia, ciudad, día o fecha…"
            className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pm-red"
          />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value as '' | EstadoEtapa)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-pm-red"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_ETAPA.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-400">
          <span>{filtradas.length} de {etapas.length} etapas</span>
          <span>{hechas} completadas</span>
          <span>
            Etapa actual:{' '}
            {actual
              ? <strong className="text-pm-red">Día {actual.dia} · {actual.provincia}</strong>
              : <em>sin marcar</em>}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Marca cada día dónde estáis: la etapa actual sale en rojo en el mapa y en el calendario, y la próxima parada se
          recalcula sola. Nada se completa por sí solo al pasar la fecha; lo confirmas tú.
        </p>
      </Bloque>

      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
          Ninguna etapa coincide con la búsqueda.
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map(e => (
            <FilaEtapa
              key={e.id}
              etapa={e}
              abierta={abierta === e.id}
              onToggle={() => setAbierta(abierta === e.id ? null : e.id)}
              onMarcarActual={() => marcarActual(e)}
              pending={pending}
              correr={correr}
              editable={editable}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Fila + editor desplegable ────────────────────────────────────────────────

function FilaEtapa({ etapa, abierta, onToggle, onMarcarActual, pending, correr, editable }: {
  etapa: Etapa; abierta: boolean; onToggle: () => void; onMarcarActual: () => void
  pending: boolean; correr: Correr; editable: boolean
}) {
  const esActual = etapa.estado === ESTADO_ACTUAL
  return (
    <div className={`bg-white rounded-2xl border shadow-sm ${esActual ? 'border-pm-red border-2' : 'border-gray-100'}`}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <div className="w-11 h-11 rounded-xl bg-pm-bg border border-gray-100 flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-gray-400 leading-none">DÍA</span>
          <span className="text-sm font-black text-pm-navy leading-tight">{etapa.dia}</span>
        </div>

        <div className="flex-1 min-w-[150px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotEstadoEtapa(etapa.estado)}`} />
            <span className="font-bold text-pm-navy truncate">{etapa.provincia}</span>
          </div>
          <div className="text-xs text-gray-400 truncate">
            {etapa.ciudad || 'Sin ciudad'} · {fechaCorta(etapa.fecha)} · {etapa.burflips} burflips
          </div>
        </div>

        {etapa.recaudado != null && (
          <span className="text-xs font-bold text-emerald-600 hidden sm:block">{euros(etapa.recaudado)}</span>
        )}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${badgeEstadoEtapa(etapa.estado)}`}>
          {esActual ? AQUI : labelEstadoEtapa(etapa.estado)}
        </span>

        {editable && !esActual && (
          <BotonMini onClick={onMarcarActual} disabled={pending}
            titulo="Marcar dónde está Brosjaca ahora mismo">
            Estamos aquí
          </BotonMini>
        )}
        <BotonMini onClick={onToggle}>{abierta ? 'Cerrar' : editable ? 'Editar' : 'Ver'}</BotonMini>
      </div>

      {abierta && (
        <EditorEtapa key={etapa.id} etapa={etapa} pending={pending} correr={correr} editable={editable} onCerrar={onToggle} />
      )}
    </div>
  )
}

function EditorEtapa({ etapa, pending, correr, editable, onCerrar }: {
  etapa: Etapa; pending: boolean; correr: Correr; editable: boolean; onCerrar: () => void
}) {
  const s = (v: number | null) => (v == null ? '' : String(v))

  const [dia, setDia] = useState(String(etapa.dia))
  const [fecha, setFecha] = useState(etapa.fecha)
  const [provincia, setProvincia] = useState(etapa.provincia)
  const [ciudad, setCiudad] = useState(etapa.ciudad)
  const [hora, setHora] = useState(etapa.hora)
  const [puntoEncuentro, setPuntoEncuentro] = useState(etapa.puntoEncuentro)
  const [burflips, setBurflips] = useState(String(etapa.burflips))
  const [estado, setEstado] = useState<EstadoEtapa>(etapa.estado)
  const [recaudado, setRecaudado] = useState(s(etapa.recaudado))
  const [asistentes, setAsistentes] = useState(s(etapa.asistentes))
  const [galeria, setGaleria] = useState<string[]>(etapa.galeria)
  const [videoUrl, setVideoUrl] = useState(etapa.videoUrl)
  const [videoTitulo, setVideoTitulo] = useState(etapa.videoTitulo)
  const [videoDescripcion, setVideoDescripcion] = useState(etapa.videoDescripcion)
  const [videoMiniatura, setVideoMiniatura] = useState(etapa.videoMiniatura)
  const [videoFecha, setVideoFecha] = useState(etapa.videoFecha)
  const [enlaceRedes, setEnlaceRedes] = useState(etapa.enlaceRedes)
  const [testimonios, setTestimonios] = useState(etapa.testimonios)

  const videoId = youtubeId(videoUrl)
  const videoRoto = videoUrl.trim() !== '' && !videoId

  function guardar() {
    correr(async () => {
      const r = await guardarEtapa({
        id: etapa.id,
        dia, fecha, provincia, ciudad, hora, puntoEncuentro,
        burflips, estado, recaudado, asistentes,
        galeria, videoUrl, videoTitulo, videoDescripcion, videoMiniatura, videoFecha,
        enlaceRedes, testimonios,
      })
      if (r.ok) onCerrar()
      return r
    })
  }

  return (
    <div className="border-t border-gray-100 p-5 space-y-6">
      {/* Identificación */}
      <div>
        <Titulo>Etapa</Titulo>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Campo label="Día del reto"><input type="number" className={inputCls} value={dia} disabled={!editable} onChange={e => setDia(e.target.value)} /></Campo>
          <Campo label="Fecha" hint={fecha ? fechaLarga(fecha) : undefined}>
            <input type="date" className={inputCls} value={fecha} disabled={!editable} onChange={e => setFecha(e.target.value)} />
          </Campo>
          <Campo label="Provincia"><input className={inputCls} value={provincia} disabled={!editable} onChange={e => setProvincia(e.target.value)} /></Campo>
          <Campo label="Burflips del día" hint="Repeticiones que le tocan ese día del reto anual.">
            <input type="number" className={inputCls} value={burflips} disabled={!editable} onChange={e => setBurflips(e.target.value)} />
          </Campo>
        </div>
      </div>

      {/* Ciudad y punto de encuentro */}
      <div>
        <Titulo>Ciudad y punto de encuentro</Titulo>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Campo label="Ciudad">
            <input className={inputCls} value={ciudad} disabled={!editable} onChange={e => setCiudad(e.target.value)} />
          </Campo>
          <Campo label="Hora" hint="Déjalo vacío mientras no haya hora oficial: la web no mostrará ninguna.">
            <input className={inputCls} value={hora} disabled={!editable} placeholder="Sin hora oficial todavía" onChange={e => setHora(e.target.value)} />
          </Campo>
          <Campo label="Punto de encuentro" hint="Vacío = la web no anuncia ningún punto.">
            <input className={inputCls} value={puntoEncuentro} disabled={!editable} placeholder="Sin punto oficial todavía" onChange={e => setPuntoEncuentro(e.target.value)} />
          </Campo>
        </div>
      </div>

      {/* Estado y textos públicos */}
      <div>
        <Titulo>Estado y textos públicos</Titulo>
        <div className="space-y-3">
          <Campo label="Estado de la etapa">
            <select className={inputCls} value={estado} disabled={!editable} onChange={e => setEstado(e.target.value as EstadoEtapa)}>
              {ESTADOS_ETAPA.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </Campo>
          <Campo label="Testimonios">
            <textarea className={`${inputCls} resize-y leading-relaxed`} rows={3} value={testimonios} disabled={!editable} onChange={e => setTestimonios(e.target.value)} />
          </Campo>
        </div>
      </div>

      {/* Resultados */}
      <div>
        <Titulo>Resultados de la etapa</Titulo>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Campo label="Recaudado (€)" hint="Vacío = aún sin datos. No pongas 0: la web mostraría un dato falso.">
            <input type="number" min="0" step="0.01" className={inputCls} value={recaudado} disabled={!editable}
              placeholder="Aún sin datos" onChange={e => setRecaudado(e.target.value)} />
          </Campo>
          <Campo label="Asistentes" hint="Vacío = aún sin datos.">
            <input type="number" min="0" className={inputCls} value={asistentes} disabled={!editable}
              placeholder="Aún sin datos" onChange={e => setAsistentes(e.target.value)} />
          </Campo>
        </div>
      </div>

      {/* Fotos y vídeo */}
      <div>
        <Titulo>Fotos y vídeo</Titulo>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-bold text-gray-500 mb-1">Galería ({galeria.length})</span>
            {galeria.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {galeria.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-pm-bg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    {editable && (
                      <button type="button" onClick={() => setGaleria(g => g.filter((_, k) => k !== i))}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none">
                        ✕
                      </button>
                    )}
                    {editable && i > 0 && (
                      <button type="button" title="Mover antes"
                        onClick={() => setGaleria(g => { const n = [...g]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n })}
                        className="absolute bottom-1 left-1 bg-black/60 hover:bg-black/80 text-white rounded w-5 h-5 flex items-center justify-center text-xs leading-none">
                        ←
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {editable && (
              <SubirImagen carpeta="reto50" value="" onChange={url => { if (url) setGaleria(g => [...g, url]) }} />
            )}
            <p className="text-xs text-gray-400 mt-1">Sube tantas fotos como quieras: se añaden al final de la galería.</p>
          </div>

          <div className="space-y-3">
            <Campo label="Enlace a redes" hint="Publicación de esa etapa en redes.">
              <input className={inputCls} value={enlaceRedes} disabled={!editable} placeholder="https://…" onChange={e => setEnlaceRedes(e.target.value)} />
            </Campo>
          </div>
        </div>
      </div>

      {/* Vídeo resumen del día: es lo que verá la gente al pulsar esta provincia */}
      <div>
        <Titulo>Vídeo resumen del día</Titulo>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Campo
              label="URL del vídeo de YouTube"
              hint="Vale el enlace normal, el corto (youtu.be), un Short o un directo. Vacío = la web dirá «Vídeo resumen próximamente»."
            >
              <input
                className={`${inputCls} ${videoRoto ? 'border-red-300 focus:border-red-400' : ''}`}
                value={videoUrl}
                disabled={!editable}
                placeholder="https://www.youtube.com/watch?v=…"
                onChange={e => setVideoUrl(e.target.value)}
              />
            </Campo>

            {videoRoto && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 leading-relaxed">
                Ese enlace no es de YouTube o no se reconoce. Copia la URL desde el navegador o desde «Compartir» en la
                app de YouTube. No se guardará hasta que sea válido.
              </p>
            )}

            <Campo label="Título del vídeo (opcional)" hint="Si lo dejas vacío se usa «Día X · Provincia».">
              <input className={inputCls} value={videoTitulo} disabled={!editable}
                onChange={e => setVideoTitulo(e.target.value)} />
            </Campo>

            <Campo label="Descripción (opcional)">
              <textarea className={`${inputCls} resize-y leading-relaxed`} rows={3} value={videoDescripcion}
                disabled={!editable} onChange={e => setVideoDescripcion(e.target.value)} />
            </Campo>

            <Campo label="Fecha de publicación (opcional)">
              <input type="date" className={inputCls} value={videoFecha} disabled={!editable}
                onChange={e => setVideoFecha(e.target.value)} />
            </Campo>
          </div>

          <div className="space-y-3">
            {/* Vista previa: lo mismo que se verá en la web */}
            <span className="block text-xs font-bold text-gray-500 mb-1">Vista previa</span>
            {videoId ? (
              <>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-pm-navy">
                  <iframe
                    key={videoId}
                    src={youtubeEmbed(videoId)}
                    title="Vista previa del vídeo"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-emerald-600 font-bold">✓ Enlace válido · {videoId}</span>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors"
                    >
                      Quitar el vídeo
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 grid place-items-center p-4">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  {videoRoto
                    ? 'El enlace no es válido: aquí verás la vista previa cuando lo sea.'
                    : 'Pega arriba la URL de YouTube y aquí verás el vídeo.'}
                </p>
              </div>
            )}

            <Campo label="Miniatura propia (opcional)" hint="Si no subes ninguna, se usa la carátula del propio YouTube.">
              <SubirImagen carpeta="reto50-videos" value={videoMiniatura} onChange={url => setVideoMiniatura(url)} />
            </Campo>
          </div>
        </div>
      </div>

      {/* Planificación (informativo) */}
      {(etapa.trayecto || etapa.kmAprox || etapa.tiempoAprox) && (
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-3">
          <strong className="text-gray-500">Trayecto planificado:</strong>{' '}
          {etapa.trayecto || '—'}
          {etapa.kmAprox && ` · ${etapa.kmAprox}`}
          {etapa.tiempoAprox && ` · ${etapa.tiempoAprox}`}
        </div>
      )}

      {editable && (
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
          <button type="button" onClick={guardar} disabled={pending}
            className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-sm">
            {pending ? 'Guardando…' : 'Guardar etapa'}
          </button>
          <button type="button" onClick={onCerrar} disabled={pending}
            className="text-sm font-bold text-gray-400 hover:text-pm-navy px-3 py-2">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

function Titulo({ children }: { children: string }) {
  return <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">{children}</div>
}
