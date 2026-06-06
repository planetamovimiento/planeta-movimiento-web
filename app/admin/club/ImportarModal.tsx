'use client'

import { useState, useMemo, useTransition } from 'react'
import { MESES_TEMPORADA, TEMPORADAS, TEMPORADA_ACTUAL, ESTADOS_GENERAL } from '@/lib/club/constants'
import { importarInscripciones, type ImportRow } from './actions'

// Campos de destino (además de los meses, que se tratan aparte)
const CAMPOS: { key: keyof ImportRow; label: string; alias: string[] }[] = [
  { key: 'nombre', label: 'Nombre', alias: ['nombre', 'name', 'alumno', 'nom'] },
  { key: 'apellidos', label: 'Apellidos', alias: ['apellidos', 'apellido', 'surname'] },
  { key: 'actividad', label: 'Actividad', alias: ['actividad', 'disciplina', 'clase', 'modalidad'] },
  { key: 'grupo', label: 'Grupo', alias: ['grupo', 'group', 'nivel'] },
  { key: 'fechaNacimiento', label: 'Fecha nacimiento', alias: ['nacimiento', 'fecha nac', 'fnac', 'birth', 'nac.'] },
  { key: 'tutorLegal', label: 'Tutor legal', alias: ['tutor', 'padre', 'madre', 'responsable'] },
  { key: 'telefono', label: 'Teléfono', alias: ['tel', 'telefono', 'teléfono', 'movil', 'móvil', 'phone', 'contacto'] },
  { key: 'email', label: 'Email', alias: ['email', 'correo', 'mail', 'e-mail'] },
  { key: 'estado_general', label: 'Estado general', alias: ['estado'] },
  { key: 'observaciones', label: 'Observaciones', alias: ['observ', 'notas', 'obs', 'comentario'] },
  { key: 'temporada', label: 'Temporada', alias: ['temporada', 'curso', 'season', 'año'] },
  { key: 'fechaInscripcion', label: 'Fecha de inscripción', alias: ['inscrip', 'alta', 'fecha alta'] },
]

const SIN = '__none__'

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}
function autoMatch(headers: string[], alias: string[]): string {
  const h = headers.find(x => alias.some(a => norm(x).includes(norm(a))))
  return h ?? SIN
}
function normPago(v: unknown): string {
  const s = norm(String(v ?? ''))
  if (!s) return ''
  if (s.includes('pag') || s === 'si' || s === 'sí' || s === 'x' || s === 'ok') return 'pagado'
  if (s.includes('pend') || s === 'no') return 'pendiente'
  if (s.includes('baja')) return 'baja'
  return ''
}
function normEstado(v: unknown): string {
  const s = norm(String(v ?? ''))
  if (s.includes('activ')) return 'activo'
  if (s.includes('baja')) return 'baja'
  if (s.includes('espera')) return 'espera'
  if (s.includes('archiv')) return 'archivado'
  if (s.includes('pend')) return 'pendiente'
  return ''
}
function toISODate(v: unknown): string {
  if (v == null || v === '') return ''
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    // Serial de Excel (días desde 1899-12-30)
    const d = new Date(Math.round((v - 25569) * 86400 * 1000))
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }
  const s = String(v).trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/)
  if (m) {
    const yyyy = m[3].length === 2 ? '20' + m[3] : m[3]
    return `${yyyy}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

type Crudo = Record<string, unknown>

export default function ImportarModal({ onClose }: { onClose: () => void }) {
  const [paso, setPaso] = useState<'subir' | 'mapear' | 'fin'>('subir')
  const [headers, setHeaders] = useState<string[]>([])
  const [datos, setDatos] = useState<Crudo[]>([])
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [map, setMap] = useState<Record<string, string>>({})
  const [mapMeses, setMapMeses] = useState<Record<string, string>>({})
  const [temporadaDef, setTemporadaDef] = useState(TEMPORADA_ACTUAL)
  const [estadoDef, setEstadoDef] = useState('activo')
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{ importadas: number; saltadas: number } | null>(null)
  const [pending, startTransition] = useTransition()

  async function onFile(file: File) {
    setError('')
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      // cellDates:false → en CSV las fechas se quedan como texto literal (dd/mm),
      // y en Excel como nº de serie (sin ambigüedad). toISODate normaliza ambos.
      const wb = XLSX.read(buf, { type: 'array', cellDates: false, raw: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Crudo>(ws, { defval: '', raw: true })
      if (json.length === 0) { setError('El archivo no tiene filas de datos.'); return }
      const hs = Object.keys(json[0])
      setHeaders(hs)
      setDatos(json)
      setNombreArchivo(file.name)
      // auto-asignación
      const m: Record<string, string> = {}
      CAMPOS.forEach(c => { m[c.key as string] = autoMatch(hs, c.alias) })
      setMap(m)
      const mm: Record<string, string> = {}
      MESES_TEMPORADA.forEach(mes => { mm[mes.key] = autoMatch(hs, [mes.nombre, mes.label]) })
      setMapMeses(mm)
      setPaso('mapear')
    } catch {
      setError('No se pudo leer el archivo. Asegúrate de que es un .csv o .xlsx válido.')
    }
  }

  const filasMapeadas = useMemo<ImportRow[]>(() => {
    const val = (row: Crudo, col: string) => (col && col !== SIN ? row[col] : '')
    return datos.map(row => {
      const pagos: Record<string, string> = {}
      MESES_TEMPORADA.forEach(mes => {
        const e = normPago(val(row, mapMeses[mes.key]))
        if (e) pagos[mes.key] = e
      })
      const estadoCol = normEstado(val(row, map.estado_general))
      return {
        nombre: String(val(row, map.nombre) ?? '').trim(),
        apellidos: String(val(row, map.apellidos) ?? '').trim(),
        actividad: String(val(row, map.actividad) ?? '').trim(),
        grupo: String(val(row, map.grupo) ?? '').trim(),
        fechaNacimiento: toISODate(val(row, map.fechaNacimiento)),
        tutorLegal: String(val(row, map.tutorLegal) ?? '').trim(),
        telefono: String(val(row, map.telefono) ?? '').trim(),
        email: String(val(row, map.email) ?? '').trim(),
        estado_general: estadoCol || estadoDef,
        observaciones: String(val(row, map.observaciones) ?? '').trim(),
        temporada: String(val(row, map.temporada) ?? '').trim() || temporadaDef,
        fechaInscripcion: toISODate(val(row, map.fechaInscripcion)) || undefined,
        pagos,
      }
    })
  }, [datos, map, mapMeses, temporadaDef, estadoDef])

  const validas = filasMapeadas.filter(r => `${r.nombre} ${r.apellidos}`.trim())

  function importar() {
    setError('')
    startTransition(async () => {
      const r = await importarInscripciones(validas)
      if (!r.ok) { setError(r.error || 'No se pudo importar'); return }
      setResultado({ importadas: r.importadas ?? 0, saltadas: r.saltadas ?? 0 })
      setPaso('fin')
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-pm-navy text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-black">Importar inscripciones (CSV / Excel)</div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">{error}</div>}

          {/* PASO 1 — Subir */}
          {paso === 'subir' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Sube un archivo <strong>.csv</strong> o <strong>.xlsx</strong> con tus inscripciones de otras temporadas.
                La primera fila debe contener los <strong>títulos de columna</strong>. Después podrás indicar qué columna corresponde a cada dato.
              </p>
              <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-pm-red transition-colors">
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
                <div className="text-4xl mb-2">📄</div>
                <div className="font-bold text-pm-navy">Haz clic para elegir un archivo</div>
                <div className="text-xs text-gray-400 mt-1">CSV o Excel (.xlsx)</div>
              </label>
              <div className="bg-pm-bg rounded-xl p-3 text-xs text-gray-500">
                💡 Consejo: si exportas primero la lista actual con «Exportar CSV/Excel», tendrás un archivo con las columnas
                exactas (Nombre, Apellidos, Actividad, Grupo, meses…) que puedes rellenar y volver a importar.
              </div>
            </div>
          )}

          {/* PASO 2 — Mapear */}
          {paso === 'mapear' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600"><strong>{datos.length}</strong> filas leídas de <strong>{nombreArchivo}</strong></div>
                <button onClick={() => { setPaso('subir'); setError('') }} className="text-xs text-pm-red font-semibold hover:underline">Cambiar archivo</button>
              </div>

              {/* Valores por defecto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pm-bg rounded-xl p-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Temporada por defecto</label>
                  <select value={temporadaDef} onChange={e => setTemporadaDef(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-pm-red">
                    {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Se usa si una fila no trae su propia temporada.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estado por defecto</label>
                  <select value={estadoDef} onChange={e => setEstadoDef(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-pm-red">
                    {ESTADOS_GENERAL.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Asignación de campos */}
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Asignar columnas</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CAMPOS.map(c => (
                    <div key={c.key as string} className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 w-32 shrink-0">{c.label}{c.key === 'nombre' && ' *'}</label>
                      <select value={map[c.key as string] ?? SIN} onChange={e => setMap(m => ({ ...m, [c.key as string]: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red">
                        <option value={SIN}>— No importar —</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meses */}
              <details className="bg-pm-bg rounded-xl p-3">
                <summary className="text-xs font-black text-pm-navy uppercase tracking-wider cursor-pointer">Estado de pago por mes (opcional)</summary>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                  {MESES_TEMPORADA.map(mes => (
                    <div key={mes.key} className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 w-10 shrink-0">{mes.label}</label>
                      <select value={mapMeses[mes.key] ?? SIN} onChange={e => setMapMeses(m => ({ ...m, [mes.key]: e.target.value }))}
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-pm-red">
                        <option value={SIN}>—</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Se interpretan automáticamente: «pagado», «pendiente», «baja» (también sí/no, x, ok).</p>
              </details>

              {/* Previsualización */}
              <div>
                <div className="text-xs font-black text-pm-navy uppercase tracking-wider mb-2">Previsualización ({validas.length} válidas de {datos.length})</div>
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-pm-bg text-gray-500">
                      <tr>
                        {['Nombre', 'Apellidos', 'Actividad', 'Grupo', 'F. nac.', 'Teléfono', 'Email', 'Temp.'].map(h => <th key={h} className="text-left px-2 py-1.5 font-bold whitespace-nowrap">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filasMapeadas.slice(0, 6).map((r, i) => (
                        <tr key={i} className={!`${r.nombre} ${r.apellidos}`.trim() ? 'opacity-40' : ''}>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.nombre || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.apellidos || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.actividad || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.grupo || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.fechaNacimiento || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.telefono || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap max-w-[140px] truncate">{r.email || '—'}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.temporada}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {datos.length > 6 && <p className="text-[11px] text-gray-400 mt-1">…y {datos.length - 6} filas más.</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={onClose} className="text-sm font-semibold text-gray-500 px-4 py-2.5">Cancelar</button>
                <button onClick={importar} disabled={pending || validas.length === 0}
                  className="bg-pm-red hover:bg-pm-red-dark disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl transition-colors">
                  {pending ? 'Importando…' : `Importar ${validas.length} alumnos`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Fin */}
          {paso === 'fin' && resultado && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-xl font-black text-pm-navy mb-1">¡Importación completada!</h3>
              <p className="text-gray-500 text-sm">Se han añadido <strong className="text-pm-navy">{resultado.importadas}</strong> alumnos
                {resultado.saltadas > 0 && <> · {resultado.saltadas} saltadas (sin nombre)</>}.</p>
              <button onClick={() => window.location.reload()} className="mt-6 bg-pm-navy text-white font-bold px-6 py-3 rounded-xl">Ver la lista actualizada</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
