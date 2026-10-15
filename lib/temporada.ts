// ─────────────────────────────────────────────────────────────────────────────
// Temporadas de la web (Halloween / Navidad). Cambian SOLAS según el día en
// Madrid: no hace falta desplegar nada ni tocar el panel.
//
// La función va autocontenida (sin nada de fuera) porque se inyecta tal cual
// en el <head> como script: así el color correcto se pinta desde el primer
// fotograma, también en páginas cacheadas.
// ─────────────────────────────────────────────────────────────────────────────

export type Temporada = 'halloween' | 'navidad' | ''

/**
 * Temporada de un día (mes 1-12, día 1-31).
 *  - Halloween: del 10 de octubre al 1 de noviembre (incluido el fin de semana
 *    de la Noche de Halloween).
 *  - Navidad: del 1 de diciembre al 6 de enero (Reyes).
 * Para cambiar las fechas, se tocan solo estos números.
 */
export function temporadaDe(mes: number, dia: number): Temporada {
  const md = mes * 100 + dia
  if (md >= 1010 && md <= 1101) return 'halloween'
  if (md >= 1201 || md <= 106) return 'navidad'
  return ''
}

/**
 * Script del <head>: calcula la temporada con la hora de Madrid y la deja en
 * <html data-temporada="…">. El panel de administración queda siempre neutro.
 * Se puede forzar para probar con ?temporada=navidad (o halloween / ninguna).
 */
export function scriptTemporada(): string {
  return `(function(){try{
var p=location.pathname;if(p.indexOf('/admin')===0)return;
var f=${temporadaDe.toString()};
var q=new URLSearchParams(location.search).get('temporada');
var t;
if(q==='halloween'||q==='navidad'){t=q}else if(q==='ninguna'){t=''}else{
var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',month:'numeric',day:'numeric'}).formatToParts(new Date());
var m=0,d=0;for(var i=0;i<parts.length;i++){if(parts[i].type==='month')m=+parts[i].value;if(parts[i].type==='day')d=+parts[i].value}
t=f(m,d)}
if(t)document.documentElement.setAttribute('data-temporada',t);
}catch(e){}})();`
}
