import { createAdminClient } from '@/lib/supabase/admin'
import { TIPOS_DEFAULT, type EventoClub, type Excepcion, type TipoEvento } from './tipos'

async function safe<T>(fn: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  try {
    const { data, error } = await fn()
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getEventos(): Promise<EventoClub[]> {
  const db = createAdminClient()
  return safe<EventoClub>(() => db.from('cc_eventos').select('*') as never)
}

export async function getExcepciones(): Promise<Excepcion[]> {
  const db = createAdminClient()
  return safe<Excepcion>(() => db.from('cc_excepciones').select('*') as never)
}

export async function getTipos(): Promise<TipoEvento[]> {
  const db = createAdminClient()
  const rows = await safe<TipoEvento>(() => db.from('cc_tipos').select('*').order('orden') as never)
  return rows.length ? rows : TIPOS_DEFAULT
}

/**
 * Días anulados (excepción «cancelar») de los eventos del calendario cuyo título
 * encaja con `patron` (p. ej. /domingos en familia/i). Así los formularios de
 * reserva no ofrecen un día que no se va a hacer.
 */
export async function diasCancelados(patron: RegExp): Promise<string[]> {
  const [eventos, excepciones] = await Promise.all([getEventos(), getExcepciones()])
  const ids = new Set(eventos.filter(e => patron.test(e.titulo)).map(e => e.id))
  return excepciones
    .filter(x => x.accion === 'cancelar' && ids.has(x.evento_id))
    .map(x => String(x.fecha).slice(0, 10))
}

/** Grupos del Club ya creados (tabla club_grupos del CRM). */
export async function getClubGrupos(): Promise<string[]> {
  const db = createAdminClient()
  const rows = await safe<{ nombre: string }>(() => db.from('club_grupos').select('nombre').order('orden') as never)
  return Array.from(new Set(rows.map(r => r.nombre).filter(Boolean)))
}
