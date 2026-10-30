'use server'

import { revalidatePath } from 'next/cache'
import { getFamiliaUser } from '@/lib/familias/auth'
import { getAlumnoDeFamilia } from '@/lib/familias/data'
import { firmaDeEntrada, validarFirma } from '@/lib/autorizaciones/documento'
import { guardarFirmas } from '@/lib/autorizaciones/store'

/** Firma de la autorización de imagen de un hijo desde el Portal de Familias. */
export async function firmarAutorizacionHijo(submissionId: string, firmaRaw: unknown) {
  const familia = await getFamiliaUser()
  if (!familia) return { ok: false, error: 'Tu sesión ha caducado. Vuelve a entrar en el portal.' }

  // El menor sale de la BD (y debe ser de esta familia), nunca del navegador.
  const alumno = await getAlumnoDeFamilia(familia.id, String(submissionId))
  if (!alumno) return { ok: false, error: 'No encontramos a ese participante en tu cuenta.' }

  const firma = firmaDeEntrada(firmaRaw)
  const err = validarFirma(firma)
  if (err) return { ok: false, error: err }

  const r = await guardarFirmas({
    origen: 'portal', familiaId: familia.id, email: familia.email,
    menores: [{ nombre: `${alumno.nombre} ${alumno.apellidos}`.trim(), submissionId: alumno.id }],
    firma,
  })
  if (r.ok) revalidatePath('/familias')
  return r
}
