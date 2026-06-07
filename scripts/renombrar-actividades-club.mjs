// ─────────────────────────────────────────────────────────────────────────────
// Renombra las actividades del Club a nombres canónicos cortos.
//   node scripts/renombrar-actividades-club.mjs           (dry-run)
//   node scripts/renombrar-actividades-club.mjs commit     (aplica)
// Actualiza form_submissions.datos.actividad + asunto y club_grupos.actividad.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const COMMIT = process.argv.includes('commit')

const RENOMBRES = {
  'Escuela de aéreos — Telas y Aro': 'Escuela de aéreos',
  'Escuela de Bienestar — Gimnasia para tod@s': 'Escuela de Bienestar',
  'Escuela Infantil — Grupos de 3 a 5 años': 'Escuela infantil',
  'Gimnasia acrobática y trampolín': 'Gimnasia Acrobática',
  'Jiu-Jitsu Brasileño — Academia Adamas': 'Jiu-Jitsu Brasileño',
  'Extraescolares Isaac Albéniz': 'Colegio Isaac Albéniz',
  // 'Gimnasia Rítmica' se mantiene igual
}

const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

console.log(COMMIT ? '🟢 COMMIT' : '🟡 DRY-RUN')

// 1) form_submissions
const { data: subs } = await db.from('form_submissions').select('id, asunto, datos').eq('tipo', 'inscripcion_club')
const aCambiar = (subs || []).filter(s => RENOMBRES[s.datos?.actividad])
console.log(`\nAlumnos a renombrar: ${aCambiar.length} de ${subs?.length ?? 0}`)
const cuenta = {}
for (const s of aCambiar) { const o = s.datos.actividad; cuenta[o] = (cuenta[o] || 0) + 1 }
for (const [o, n] of Object.entries(cuenta)) console.log(`   «${o}» → «${RENOMBRES[o]}» (${n})`)

if (COMMIT) {
  let ok = 0
  for (const s of aCambiar) {
    const nueva = RENOMBRES[s.datos.actividad]
    const datos = { ...s.datos, actividad: nueva }
    const asunto = `Inscripción Club · ${nueva}`
    const { error } = await db.from('form_submissions').update({ datos, asunto }).eq('id', s.id)
    if (error) { console.log('❌', s.id, error.message); process.exit(1) }
    ok++
  }
  console.log(`✅ Alumnos actualizados: ${ok}`)
}

// 2) club_grupos
const { data: grupos } = await db.from('club_grupos').select('id, actividad')
const gCambiar = (grupos || []).filter(g => RENOMBRES[g.actividad])
console.log(`\nGrupos a renombrar: ${gCambiar.length}`)
if (COMMIT) {
  for (const [viejo, nuevo] of Object.entries(RENOMBRES)) {
    const { error } = await db.from('club_grupos').update({ actividad: nuevo }).eq('actividad', viejo)
    if (error) { console.log('❌ grupos', error.message); process.exit(1) }
  }
  console.log('✅ Grupos actualizados.')
}

if (!COMMIT) console.log('\n🟡 DRY-RUN: nada escrito. Repite con «commit».')
else console.log('\n✅ Renombrado completado.')
