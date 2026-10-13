// ─────────────────────────────────────────────────────────────────────────────
// Ilustraciones de La Fábrica de Papá Noel. Son dibujos propios (SVG), no fotos
// de archivo: pesan unos pocos KB y no hacen pasar por nuestras instalaciones
// imágenes que no lo son.
//
// Cuando Carlos suba las fotos reales del montaje desde el panel, cada bloque
// las usa en lugar del dibujo (<Escena foto="…">), sin tocar el diseño.
// ─────────────────────────────────────────────────────────────────────────────

type Props = { className?: string }

/** Nieve del hero: copos con tamaño, caída y retardo repartidos. */
export function Nieve({ copos = 26 }: { copos?: number }) {
  const lista = Array.from({ length: copos }, (_, i) => {
    const r = (i * 37) % 100                      // reparto estable (sin aleatorio: evita saltos al hidratar)
    const tam = 2 + ((i * 13) % 5)
    return {
      left: `${r}%`,
      width: `${tam}px`,
      height: `${tam}px`,
      '--dur': `${9 + ((i * 7) % 12)}s`,
      '--delay': `${(i * 0.9) % 11}s`,
      '--dx': `${((i % 5) - 2) * 26}px`,
      '--caida': `${520 + ((i * 29) % 260)}px`,
    } as React.CSSProperties
  })
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {lista.map((s, i) => <span key={i} className="pm-copo" style={s} />)}
    </div>
  )
}

/** Marco común: la foto real si existe, y si no el dibujo. */
export function Escena({ foto, alt, children, className = '' }: {
  foto?: string
  alt: string
  children: React.ReactNode
  className?: string
}) {
  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={foto} alt={alt} loading="lazy" className={`w-full h-full object-cover ${className}`} />
  }
  return <div role="img" aria-label={alt} className={`w-full h-full ${className}`}>{children}</div>
}

// ─── Dibujos ────────────────────────────────────────────────────────────────

/** Nave de la fábrica de noche, con nieve en el tejado y ventanas encendidas. */
export function DibujoFabrica({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cieloF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15213f" /><stop offset="100%" stopColor="#3b1021" />
        </linearGradient>
        <linearGradient id="luzF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" /><stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#cieloF)" />
      {[30, 90, 150, 240, 310, 370].map((x, i) => (
        <circle key={x} cx={x} cy={24 + (i % 3) * 16} r={1.6} fill="#fff" opacity=".75" />
      ))}
      <circle cx="340" cy="46" r="20" fill="#fef3c7" opacity=".9" />
      <path d="M0 190 L70 120 L120 165 L170 112 L250 190Z" fill="#1e293b" />
      <path d="M170 112 L190 130 L150 130Z" fill="#e2e8f0" />
      <rect x="110" y="140" width="190" height="78" fill="#991b1b" />
      <path d="M100 142 L205 92 L310 142Z" fill="#7f1d1d" />
      <path d="M100 142 L205 92 L310 142 L310 150 Q205 108 100 150Z" fill="#f8fafc" />
      <rect x="252" y="104" width="20" height="30" fill="#7f1d1d" />
      <circle cx="262" cy="96" r="9" fill="#cbd5e1" opacity=".5" />
      <circle cx="272" cy="80" r="7" fill="#cbd5e1" opacity=".35" />
      {[128, 160, 228, 260].map(x => <rect key={x} x={x} y="158" width="26" height="24" rx="3" fill="url(#luzF)" />)}
      <path d="M186 218 v-34 a19 19 0 0 1 38 0 v34Z" fill="#166534" />
      <circle cx="205" cy="200" r="3" fill="#fde68a" />
      {[120, 145, 170, 195, 220, 245, 270, 295].map((x, i) => (
        <circle key={x} cx={x} cy={146 + (i % 2) * 5} r="3.2" fill={i % 3 === 0 ? '#fde68a' : i % 3 === 1 ? '#86efac' : '#fca5a5'} />
      ))}
      <path d="M40 218 L58 176 L76 218Z" fill="#14532d" />
      <path d="M46 198 h24" stroke="#f8fafc" strokeWidth="3" />
      <path d="M330 218 L346 182 L362 218Z" fill="#14532d" />
      <rect x="0" y="214" width="400" height="26" fill="#f8fafc" />
    </svg>
  )
}

/** Taller de cartas: carta, sobre y lápiz sobre la mesa. */
export function DibujoCartas({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="240" fill="#7f1d1d" />
      <circle cx="320" cy="50" r="70" fill="#991b1b" />
      <g transform="rotate(-6 180 130)">
        <rect x="96" y="58" width="168" height="150" rx="6" fill="#fffbeb" />
        {[86, 104, 122, 140, 158].map(y => (
          <rect key={y} x="116" y={y} width={y === 158 ? 70 : 128} height="7" rx="3.5" fill="#fcd34d" opacity=".75" />
        ))}
        <path d="M180 178 l7 15 16 2 -12 11 3 16 -14-8 -14 8 3-16 -12-11 16-2Z" fill="#dc2626" />
      </g>
      <g transform="rotate(8 300 180)">
        <rect x="242" y="140" width="120" height="78" rx="6" fill="#166534" />
        <path d="M242 146 L302 186 L362 146" fill="none" stroke="#dcfce7" strokeWidth="5" />
      </g>
      <g transform="rotate(-28 90 200)">
        <rect x="58" y="188" width="90" height="13" rx="3" fill="#fbbf24" />
        <path d="M58 188 L44 194.5 L58 201Z" fill="#f8fafc" />
        <rect x="140" y="188" width="12" height="13" fill="#be123c" />
      </g>
    </svg>
  )
}

/** Cinta de montaje con regalos y engranajes. */
export function DibujoJuguetes({ className = '' }: Props) {
  const engranaje = (cx: number, cy: number, r: number, fill: string) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="#0f172a" opacity=".35" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={cx - 4} y={cy - r - 7} width="8" height="10" rx="2" fill={fill}
          transform={`rotate(${i * 45} ${cx} ${cy})`} />
      ))}
    </g>
  )
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="240" fill="#14532d" />
      <rect y="150" width="400" height="90" fill="#166534" />
      {engranaje(66, 70, 34, '#facc15')}
      {engranaje(126, 44, 22, '#f8fafc')}
      {engranaje(338, 62, 28, '#fca5a5')}
      <rect x="20" y="176" width="360" height="18" rx="9" fill="#0f172a" opacity=".55" />
      {[60, 140, 220, 300].map(x => <circle key={x} cx={x} cy="185" r="7" fill="#334155" />)}
      {[
        { x: 52, w: 54, h: 46, c: '#dc2626', l: '#fde68a' },
        { x: 150, w: 44, h: 60, c: '#f8fafc', l: '#dc2626' },
        { x: 236, w: 62, h: 40, c: '#facc15', l: '#166534' },
        { x: 322, w: 40, h: 52, c: '#38bdf8', l: '#f8fafc' },
      ].map(g => (
        <g key={g.x}>
          <rect x={g.x} y={176 - g.h} width={g.w} height={g.h} rx="4" fill={g.c} />
          <rect x={g.x + g.w / 2 - 5} y={176 - g.h} width="10" height={g.h} fill={g.l} />
          <rect x={g.x} y={176 - g.h + g.h / 2 - 5} width={g.w} height="10" fill={g.l} />
          <circle cx={g.x + g.w / 2 - 7} cy={176 - g.h - 5} r="7" fill={g.l} />
          <circle cx={g.x + g.w / 2 + 7} cy={176 - g.h - 5} r="7" fill={g.l} />
        </g>
      ))}
    </svg>
  )
}

/** Papá Noel en su despacho. */
export function DibujoPapaNoel({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="240" fill="#1f2937" />
      <rect y="150" width="400" height="90" fill="#7c2d12" />
      <rect x="120" y="96" width="160" height="130" rx="22" fill="#7f1d1d" />
      <path d="M152 226 v-54 a48 48 0 0 1 96 0 v54Z" fill="#dc2626" />
      <rect x="152" y="196" width="96" height="18" fill="#1f2937" />
      <rect x="188" y="196" width="24" height="18" fill="#facc15" />
      <circle cx="200" cy="124" r="34" fill="#fde7d3" />
      <path d="M168 128 a32 42 0 0 0 64 0 a32 30 0 0 1 -64 0Z" fill="#f8fafc" />
      <ellipse cx="200" cy="150" rx="17" ry="22" fill="#f8fafc" />
      <circle cx="189" cy="118" r="3.4" fill="#1f2937" />
      <circle cx="211" cy="118" r="3.4" fill="#1f2937" />
      <circle cx="200" cy="130" r="5" fill="#fb7185" />
      <path d="M166 104 c4-30 22-44 46-44 c22 0 38 14 42 34 c-28-10-60-8-88 10Z" fill="#dc2626" />
      <rect x="162" y="98" width="80" height="13" rx="6.5" fill="#f8fafc" />
      <circle cx="252" cy="62" r="11" fill="#f8fafc" />
      <path d="M296 226 c-18 0-30-14-26-32 l8-34 h44 l8 34 c4 18-8 32-26 32Z" fill="#a16207" />
      <rect x="276" y="152" width="48" height="12" rx="6" fill="#854d0e" />
    </svg>
  )
}

/** Fiesta final: guirnaldas, confeti y siluetas bailando. */
export function DibujoFiesta({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 400 240" className={className} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="240" fill="#4c1d95" />
      <circle cx="200" cy="40" r="60" fill="#6d28d9" opacity=".7" />
      <path d="M0 34 Q100 86 200 34 T400 34" fill="none" stroke="#f8fafc" strokeWidth="3" opacity=".7" />
      {[40, 90, 140, 190, 240, 290, 340].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={i % 2 ? 54 : 62} x2={x} y2={i % 2 ? 64 : 72} stroke="#f8fafc" strokeWidth="2" opacity=".6" />
          <circle cx={x} cy={i % 2 ? 70 : 78} r="8" fill={['#f87171', '#fbbf24', '#4ade80', '#60a5fa'][i % 4]} />
        </g>
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={(i * 53) % 390} y={95 + ((i * 31) % 110)} width="7" height="11" rx="2"
          fill={['#fbbf24', '#f87171', '#4ade80', '#f8fafc', '#60a5fa'][i % 5]}
          transform={`rotate(${(i * 37) % 360} ${(i * 53) % 390} ${95 + ((i * 31) % 110)})`} opacity=".9" />
      ))}
      {[120, 200, 280].map((x, i) => (
        <g key={x} fill="#1e1b4b" opacity=".85">
          <circle cx={x} cy={160 - i * 6} r="14" />
          <path d={`M${x - 18} 240 v-42 a18 18 0 0 1 36 0 v42Z`} />
          <path d={`M${x - 18} 196 l-18 ${i % 2 ? -22 : 16}`} stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
          <path d={`M${x + 18} 196 l18 ${i % 2 ? 16 : -22}`} stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
        </g>
      ))}
      <rect y="232" width="400" height="8" fill="#f8fafc" opacity=".25" />
    </svg>
  )
}
