'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUser, can, logActivity } from '@/lib/admin/auth'
import { CATALOGO_MAP } from '@/lib/servicios/catalogo'
import type { SlotSemanal } from '@/lib/reservas/horarios'

/** Limpia y valida las franjas recibidas del cliente. */
function sanear(slots: SlotSemanal[]): SlotSemanal[] {
  if (!Array.isArray(slots)) return []
  return slots
    .map(s => ({
      dias: Array.isArray(s.dias) ? s.dias.filter(d => d >= 1 && d <= 7) : [],
      horaInicio: String(s.horaInicio ?? '').trim(),
      horaFin: String(s.horaFin ?? '').trim(),
      plazas: Math.max(1, Math.round(Number(s.plazas) || 1)),
    }))
    .filter(s => s.dias.length > 0 && /^\d{1,2}:\d{2}$/.test(s.horaInicio))
}

/** Guarda el horario de reserva (franjas + plazas) de un servicio. */
export async function guardarHorariosReserva(servicioId: string, slots: SlotSemanal[]) {
  const admin = await getAdminUser()
  if (!admin || !can.edit(admin.role)) return { ok: false, error: 'Sin permisos para editar' }
  if (!CATALOGO_MAP.get(servicioId)) return { ok: false, error: 'Servicio desconocido' }

  const limpio = sanear(slots)
  const db = createAdminClient()
  const { error } = await db.from('reserva_horarios').upsert({
    servicio_id: servicioId,
    slots: limpio,
    updated_at: new Date().toISOString(),
    updated_by: admin.email,
  })
  if (error) return { ok: false, error: error.message }

  await logActivity({
    actorEmail: admin.email,
    accion: `Editó los horarios de reserva de "${CATALOGO_MAP.get(servicioId)?.nombre ?? servicioId}"`,
    entidad: 'reserva_horarios', entidadId: servicioId,
    detalle: `${limpio.length} franja(s)`,
  })

  revalidatePath('/admin/horarios-reserva')
  revalidatePath('/reservar')
  return { ok: true }
}
