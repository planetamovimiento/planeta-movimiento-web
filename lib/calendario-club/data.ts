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

/** Grupos del Club ya creados (tabla club_grupos del CRM). */
export async function getClubGrupos(): Promise<string[]> {
  const db = createAdminClient()
  const rows = await safe<{ nombre: string }>(() => db.from('club_grupos').select('nombre').order('orden') as never)
  return Array.from(new Set(rows.map(r => r.nombre).filter(Boolean)))
}
