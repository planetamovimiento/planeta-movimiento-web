'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ── Trazado del contorno del logo desde su canal alfa (Moore-Neighbor) ──────────
const NB: [number, number][] = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]]

function trazarContorno(mask: Uint8Array, W: number, H: number): [number, number][] {
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1
  let sx = -1, sy = -1
  for (let y = 0; y < H && sy < 0; y++) for (let x = 0; x < W; x++) if (op(x, y)) { sx = x; sy = y; break }
  if (sx < 0) return []
  const pts: [number, number][] = [[sx, sy]]
  let px = sx, py = sy, bx = sx - 1, by = sy
  const max = W * H * 4
  for (let it = 0; it < max; it++) {
    let d = 0
    for (let k = 0; k < 8; k++) if (px + NB[k][0] === bx && py + NB[k][1] === by) { d = k; break }
    let found = false
    for (let k = 1; k <= 8; k++) {
      const dir = (d + k) % 8
      const nx = px + NB[dir][0], ny = py + NB[dir][1]
      if (op(nx, ny)) {
        const prev = (dir + 7) % 8
        bx = px + NB[prev][0]; by = py + NB[prev][1]
        px = nx; py = ny; pts.push([px, py]); found = true; break
      }
    }
    if (!found) break
    if (px === sx && py === sy) break
  }
  return pts
}

// Simplificación Ramer–Douglas–Peucker
function rdp(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts
  let dmax = 0, idx = 0
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1]
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len
    if (d > dmax) { dmax = d; idx = i }
  }
  if (dmax > eps) {
    const left = rdp(pts.slice(0, idx + 1), eps)
    const right = rdp(pts.slice(idx), eps)
    return [...left.slice(0, -1), ...right]
  }
  return [pts[0], pts[pts.length - 1]]
}

// RDP para una curva CERRADA: se parte en el punto más lejano y se simplifica
// cada mitad por separado (un RDP normal colapsaría el bucle a 2 puntos).
function rdpCerrado(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 5) return pts
  const p = (pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) ? pts.slice(0, -1) : pts.slice()
  let far = 0, fd = -1
  for (let i = 1; i < p.length; i++) {
    const d = (p[i][0] - p[0][0]) ** 2 + (p[i][1] - p[0][1]) ** 2
    if (d > fd) { fd = d; far = i }
  }
  const a = rdp(p.slice(0, far + 1), eps)
  const b = rdp([...p.slice(far), p[0]], eps)
  return [...a.slice(0, -1), ...b.slice(0, -1)]
}

/** Devuelve el contorno del logo en coordenadas de mundo (centrado, Y hacia arriba). */
function contornoDeImagen(img: HTMLImageElement): [number, number][] {
  const maxDim = 200
  const sc = Math.min(maxDim / img.width, maxDim / img.height)
  const W = Math.round(img.width * sc) + 2
  const H = Math.round(img.height * sc) + 2
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 1, 1, W - 2, H - 2)
  const data = ctx.getImageData(0, 0, W, H).data
  const mask = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) mask[i] = data[i * 4 + 3] > 128 ? 1 : 0
  const raw = trazarContorno(mask, W, H)
  const pts = rdpCerrado(raw, 0.9)
  const s = 2 / Math.max(W, H)
  return pts.map(([x, y]) => [(x - W / 2) * s, (H / 2 - y) * s] as [number, number])
}

/**
 * Logo del hero como OBJETO 3D real: se extruye el contorno exacto del logo
 * (ExtrudeGeometry) → "ficha troquelada" con la silueta del escudo, caras
 * texturizadas con el logo y laterales sólidos. Se arrastra para rotar 360°.
 */
export default function LogoMoneda() {
  const cont = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cont.current
    if (!el) return
    let disposed = false
    let raf = 0

    const SIZE = el.clientWidth || 224
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(SIZE, SIZE)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.touchAction = 'none'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    // Luces — relieve suave
    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(4, 6, 8); scene.add(key)
    const fill = new THREE.DirectionalLight(0x88aaff, 0.5); fill.position.set(-6, -2, 4); scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(0, 2, -6); scene.add(rim)

    const grupo = new THREE.Group()
    scene.add(grupo)

    // Rotación con arrastre (objetivo + suavizado)
    const target = { x: -0.18, y: 0.5 }
    let dragging = false, lx = 0, ly = 0
    const onDown = (e: PointerEvent) => { dragging = true; lx = e.clientX; ly = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); renderer.domElement.style.cursor = 'grabbing' }
    const onMove = (e: PointerEvent) => { if (!dragging) return; target.y += (e.clientX - lx) * 0.01; target.x += (e.clientY - ly) * 0.01; lx = e.clientX; ly = e.clientY }
    const onUp = () => { dragging = false; renderer.domElement.style.cursor = 'grab' }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointercancel', onUp)

    // Carga del logo → contorno → extrusión
    const img = new Image()
    img.src = '/logo.png'
    img.onload = () => {
      if (disposed) return
      const pts = contornoDeImagen(img)
      if (pts.length < 4) return

      const shape = new THREE.Shape()
      shape.moveTo(pts[0][0], pts[0][1])
      for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1])
      shape.closePath()

      // bbox para mapear la textura sobre las caras
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y) }
      const w = maxX - minX, h = maxY - minY

      const depth = Math.max(w, h) * 0.04   // ~4% del ancho → canto fino y elegante
      const uvGen = {
        generateTopUV(_g: THREE.ExtrudeGeometry, v: number[], a: number, b: number, c: number) {
          const f = (i: number) => new THREE.Vector2((v[i * 3] - minX) / w, (v[i * 3 + 1] - minY) / h)
          return [f(a), f(b), f(c)]
        },
        generateSideWallUV() {
          return [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)]
        },
      }
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: depth * 0.3, bevelSegments: 3, steps: 1,
        UVGenerator: uvGen as unknown as THREE.UVGenerator,
      })
      geo.center()

      const tex = new THREE.Texture(img)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      tex.needsUpdate = true

      const caraMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.55, metalness: 0.05 })
      const cantoMat = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, metalness: 0.55, roughness: 0.4 })

      const mesh = new THREE.Mesh(geo, [caraMat, cantoMat])
      grupo.add(mesh)

      // Encaje en cámara
      const box = new THREE.Box3().setFromObject(mesh)
      const size = new THREE.Vector3(); box.getSize(size)
      const fit = 2.2 / Math.max(size.x, size.y)
      grupo.scale.setScalar(fit)
    }

    const animar = () => {
      raf = requestAnimationFrame(animar)
      grupo.rotation.x += (target.x - grupo.rotation.x) * 0.1
      grupo.rotation.y += (target.y - grupo.rotation.y) * 0.1
      renderer.render(scene, camera)
    }
    animar()

    const ro = new ResizeObserver(() => {
      const s = el.clientWidth || SIZE
      renderer.setSize(s, s)
    })
    ro.observe(el)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointercancel', onUp)
      scene.traverse(o => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[]
        if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else if (mat) mat.dispose()
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative mb-8 select-none flex justify-center">
      {/* Halo de luz */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-pm-red/30 blur-[80px] animate-glow-pulse" />
      </div>
      <div
        ref={cont}
        title="Pincha y arrastra para girar el logo en 3D 🪙"
        className="w-44 h-44 sm:w-56 sm:h-56"
        style={{ filter: 'drop-shadow(0 22px 38px rgba(0,0,0,0.5))' }}
      />
    </div>
  )
}
