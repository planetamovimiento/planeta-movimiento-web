'use client'

import { useMemo, useState } from 'react'
import { SubirImagen } from '@/components/admin/SubirImagen'
import {
  BROSJACA, CLAVES_CONFIG, OSCURIDAD_FONDO_DEFECTO, POSICIONES_FONDO, RETO, type ClaveConfig,
} from '@/lib/reto50/constants'
import type { ConfigReto } from '@/lib/reto50/tipos'
import { guardarConfig } from './actions'
import { Bloque, Campo, inputCls, type Correr } from './piezas'

type Props = { config: ConfigReto; pending: boolean; correr: Correr; editable: boolean }

export default function TabGeneral({ config, pending, correr, editable }: Props) {
  // Borrador local: se guarda solo lo que haya cambiado de verdad.
  const inicial = useMemo(() => {
    const o = {} as Record<ClaveConfig, string>
    for (const k of CLAVES_CONFIG) o[k] = config[k] ?? ''
    return o
  }, [config])

  const [draft, setDraft] = useState<Record<ClaveConfig, string>>(inicial)
  const set = (k: ClaveConfig, v: string) => setDraft(d => ({ ...d, [k]: v }))

  const cambiadas = CLAVES_CONFIG.filter(k => draft[k] !== (config[k] ?? ''))
  const hayCambios = cambiadas.length > 0

  function guardarTodo() {
    correr(async () => {
      for (const k of cambiadas) {
        const r = await guardarConfig(k, draft[k])
        if (!r.ok) return r
      }
      return { ok: true }
    })
  }

  const txt = (k: ClaveConfig, placeholder = '') => (
    <input className={inputCls} value={draft[k]} disabled={!editable} placeholder={placeholder}
      onChange={e => set(k, e.target.value)} />
  )
  const area = (k: ClaveConfig, rows = 4, placeholder = '') => (
    <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={draft[k]} disabled={!editable}
      placeholder={placeholder} onChange={e => set(k, e.target.value)} />
  )

  return (
    <div className="space-y-5">
      {/* Ficha del reto: datos fijos, no editables */}
      <div className="bg-pm-navy text-white rounded-2xl p-5">
        <div className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">Datos oficiales del reto</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><div className="text-white/40 text-xs">Protagonista</div><div className="font-bold">{RETO.protagonistaNombre} «{RETO.protagonista}»</div></div>
          <div><div className="text-white/40 text-xs">Causa</div><div className="font-bold">{RETO.causa}</div></div>
          <div><div className="text-white/40 text-xs">Salida</div><div className="font-bold">{RETO.ciudadInicio} · {RETO.fechaInicio}</div></div>
          <div><div className="text-white/40 text-xs">Meta</div><div className="font-bold">{RETO.ciudadFin} · {RETO.fechaFin}</div></div>
        </div>
        <p className="text-xs text-white/50 mt-4 leading-relaxed">
          Las 50 provincias son un hito dentro del reto anual de {RETO.diasRetoAnual} días: un {RETO.ejercicio} más cada
          día. Durante la ruta la progresión va de {RETO.burflipsInicio} a {RETO.burflipsFin} repeticiones. Estos datos
          están fijados en el código y no se editan desde aquí.
        </p>
      </div>

      <Bloque titulo="Portada" desc="Lo primero que se ve al entrar en la página pública.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Campo label="Título de portada" hint="Si lo dejas vacío se usa el título por defecto del reto.">
              {txt('hero_titulo', RETO.nombre)}
            </Campo>
            <Campo label="Subtítulo de portada">
              {area('hero_subtitulo', 3)}
            </Campo>
          </div>
          <div className="space-y-4">
            <Campo label="Imagen de portada">
              <SubirImagen carpeta="reto50" value={draft.hero_imagen} onChange={url => set('hero_imagen', url)} />
            </Campo>
            <Campo label={`Logo de ${RETO.protagonista}`} hint="Se muestra en la portada, junto a sus redes. PNG con fondo transparente si es posible.">
              <SubirImagen carpeta="reto50" value={draft.brosjaca_logo} onChange={url => set('brosjaca_logo', url)} />
            </Campo>
          </div>
        </div>
      </Bloque>

      <Bloque
        titulo="Paisaje de la ruta"
        desc="El fondo de la sección del calendario. Si no subes ninguna imagen se usa un paisaje de montaña dibujado, así que nunca se ve el fondo blanco."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Campo label="Imagen de fondo" hint="Un paisaje apaisado y de buena resolución (carretera, montaña, campo…). Máx. 25 MB.">
              <SubirImagen carpeta="reto50-fondo" value={draft.ruta_fondo_imagen} onChange={url => set('ruta_fondo_imagen', url)} />
            </Campo>
            <Campo label="Imagen para móvil (opcional)" hint="Si la subes, en móvil se usa esta: carga menos y encuadra mejor en vertical.">
              <SubirImagen carpeta="reto50-fondo" value={draft.ruta_fondo_movil} onChange={url => set('ruta_fondo_movil', url)} />
            </Campo>
          </div>

          <div className="space-y-4">
            <Campo label="Texto alternativo" hint="Describe el paisaje para accesibilidad.">
              {txt('ruta_fondo_alt', 'Carretera entre montañas')}
            </Campo>

            <Campo label="Encuadre de la imagen">
              <select className={inputCls} value={draft.ruta_fondo_posicion || 'center'} disabled={!editable}
                onChange={e => set('ruta_fondo_posicion', e.target.value)}>
                {POSICIONES_FONDO.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Campo>

            <Campo
              label={`Oscuridad de la capa: ${draft.ruta_fondo_oscuridad || OSCURIDAD_FONDO_DEFECTO} %`}
              hint="Cuanto más alta, más se lee el texto y menos se ve el paisaje. Por debajo de 40 % la lectura empieza a sufrir."
            >
              <input
                type="range" min="0" max="95" step="5"
                className="w-full accent-pm-red"
                value={draft.ruta_fondo_oscuridad || String(OSCURIDAD_FONDO_DEFECTO)}
                disabled={!editable}
                onChange={e => set('ruta_fondo_oscuridad', e.target.value)}
              />
            </Campo>

            <label className="flex items-center gap-2 text-sm text-pm-navy">
              <input
                type="checkbox"
                checked={draft.ruta_fondo_activo !== 'no'}
                disabled={!editable}
                onChange={e => set('ruta_fondo_activo', e.target.checked ? 'si' : 'no')}
              />
              Mostrar el paisaje <span className="text-xs text-gray-400">(si lo desactivas, fondo azul liso)</span>
            </label>
          </div>
        </div>
      </Bloque>

      <Bloque titulo="Textos" desc="Contenido de las secciones de presentación.">
        <div className="space-y-4">
          <Campo label="Presentación del reto">{area('intro_texto', 5)}</Campo>
          <Campo label={`Quién es ${RETO.protagonista}`}>{area('quien_es_texto', 5)}</Campo>
          <Campo label="Objetivo global" hint="Texto libre. No escribas cifras de recaudación que no estén confirmadas.">
            {txt('objetivo_global')}
          </Campo>
        </div>
      </Bloque>

      <Bloque titulo="Enlaces del reto" desc="El botón de donar solo aparece en la web si hay un enlace aquí.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Enlace de donación" hint="Vacío = la web dice que se anunciará próximamente. No pongas un enlace sin confirmar.">
            {txt('donacion_url', 'Aún no hay enlace oficial')}
          </Campo>
          <Campo label="Dossier (enlace)" hint="PDF o carpeta con el dossier del reto.">
            {txt('dossier_url', 'https://…')}
          </Campo>
        </div>
      </Bloque>

      <Bloque titulo="Redes sociales" desc="Los perfiles oficiales de Brosjaca ya están puestos por defecto. Rellena un campo solo si quieres cambiar uno.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Instagram">{txt('instagram_url', BROSJACA.instagram)}</Campo>
          <Campo label="TikTok">{txt('tiktok_url', BROSJACA.tiktok)}</Campo>
          <Campo label="YouTube">{txt('youtube_url', BROSJACA.youtube)}</Campo>
          <Campo label="Facebook">{txt('facebook_url', 'https://facebook.com/…')}</Campo>
          <Campo label={`Web de ${RETO.protagonista}`}>{txt('web_brosjaca', BROSJACA.web)}</Campo>
        </div>
      </Bloque>

      <Bloque titulo="Contacto para colaborar" desc="Se muestra a ayuntamientos, patrocinadores y medios.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Correo de contacto">{txt('contacto_email', 'nombre@correo.com')}</Campo>
          <Campo label="Teléfono de contacto">{txt('contacto_telefono', '600 00 00 00')}</Campo>
        </div>
      </Bloque>

      {/* Barra de guardado pegada abajo: con tanto campo, evita perder cambios */}
      {editable && hayCambios && (
        <div className="sticky bottom-4 z-20">
          <div className="bg-pm-navy text-white rounded-2xl shadow-lg p-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-semibold pl-2">
              {cambiadas.length} campo{cambiadas.length === 1 ? '' : 's'} sin guardar
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDraft(inicial)} disabled={pending}
                className="text-sm font-bold px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 disabled:opacity-40">
                Descartar
              </button>
              <button type="button" onClick={guardarTodo} disabled={pending}
                className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl text-sm">
                {pending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
