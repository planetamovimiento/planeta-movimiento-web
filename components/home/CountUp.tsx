'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  end: number
  /** Texto que precede al número, ej. "+" */
  prefix?: string
  /** Texto que sigue al número, ej. "K", "%", "+" */
  suffix?: string
  duration?: number
  className?: string
}

export default function CountUp({ end, prefix = '', suffix = '', duration = 1800, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setValue(Math.round(eased * end))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString('es-ES')}{suffix}
    </span>
  )
}
