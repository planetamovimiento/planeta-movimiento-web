'use client'

import { useRef, useState, useTransition } from 'react'
import { subirImagen } from '@/app/admin/upload-actions'

/**
 * Control para subir una imagen desde el PC (jpg/png/webp).
 * Sube el archivo a Supabase Storage y devuelve la URL vía onChange.
 */
export function SubirImagen({ value, onChange, carpeta = 'general' }: {
  value: string
  onChange: (url: string) => void
  carpeta?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleFile(file: File) {
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('carpeta', carpeta)
    startTransition(async () => {
      const r = await subirImagen(fd)
      if (r.ok && r.url) onChange(r.url)
      else setError(r.error || 'Error al subir')
    })
  }

  return (
    <div>
      {/* Vista previa */}
      {value ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 mb-2 bg-pm-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Vista previa" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80">✕</button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={pending}
          className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-pm-red flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-pm-red transition-colors mb-2">
          {pending ? (
            <span className="text-sm font-semibold">Subiendo…</span>
          ) : (
            <>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 7l-4-4m0 0L8 7m4-4v12"/></svg>
              <span className="text-sm font-semibold">Subir imagen desde tu PC</span>
              <span className="text-xs">JPG, PNG o WebP · máx. 10 MB</span>
            </>
          )}
        </button>
      )}

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={pending}
          className="text-xs font-bold text-pm-red hover:underline">
          {value ? 'Cambiar imagen' : 'Elegir archivo'}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />

      {error && <p className="text-xs text-pm-red mt-1">{error}</p>}
    </div>
  )
}
