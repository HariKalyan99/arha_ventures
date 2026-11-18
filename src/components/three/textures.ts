import * as THREE from 'three'

/**
 * Procedural, seamlessly tiling material textures painted with Canvas 2D.
 * Avoids shipping large texture files while giving every surface real grain,
 * veining and pores. Textures are cached per (kind, size) and shared between scenes.
 *
 * To use photographic PBR textures instead, replace a painter with a
 * THREE.TextureLoader call returning the same texture key.
 */

type Rand = () => number
type Painter = (ctx: CanvasRenderingContext2D, size: number, rand: Rand) => void

const cache = new Map<string, THREE.CanvasTexture>()

function seeded(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Runs a draw call at the 9 wrapped offsets so shapes crossing an edge continue on the opposite side. */
function tiled(size: number, draw: (ox: number, oy: number) => void) {
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) draw(x * size, y * size)
}

function mottle(ctx: CanvasRenderingContext2D, size: number, rand: Rand, colors: string[], count: number, radius: [number, number], alpha: [number, number]) {
  for (let i = 0; i < count; i++) {
    const cx = rand() * size
    const cy = rand() * size
    const r = (radius[0] + rand() * (radius[1] - radius[0])) * size
    const color = colors[Math.floor(rand() * colors.length)]
    const a = alpha[0] + rand() * (alpha[1] - alpha[0])
    tiled(size, (ox, oy) => {
      const g = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r)
      g.addColorStop(0, withAlpha(color, a))
      g.addColorStop(1, withAlpha(color, 0))
      ctx.fillStyle = g
      ctx.fillRect(cx + ox - r, cy + oy - r, r * 2, r * 2)
    })
  }
}

function speckle(ctx: CanvasRenderingContext2D, size: number, rand: Rand, amount: number) {
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

function withAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Wandering vein path, the basis of marble and stone veining. */
function vein(ctx: CanvasRenderingContext2D, size: number, rand: Rand, color: string, width: number, alpha: number, blur: number) {
  const points: [number, number][] = []
  let x = rand() * size
  let y = rand() * size
  let angle = -0.6 + rand() * 0.5
  const steps = 60
  const step = (size * 1.3) / steps
  for (let i = 0; i < steps; i++) {
    points.push([x, y])
    angle += (rand() - 0.5) * 0.55
    x += Math.cos(angle) * step
    y += Math.sin(angle) * step
  }
  ctx.save()
  ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none'
  ctx.strokeStyle = withAlpha(color, alpha)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  tiled(size, (ox, oy) => {
    ctx.beginPath()
    points.forEach(([px, py], i) => {
      ctx.lineWidth = width * (0.6 + 0.8 * Math.abs(Math.sin(i * 0.3)))
      if (i === 0) ctx.moveTo(px + ox, py + oy)
      else ctx.lineTo(px + ox, py + oy)
    })
    ctx.stroke()
  })
  ctx.restore()
}

const painters: Record<string, Painter> = {
  calacatta(ctx, s, rand) {
    ctx.fillStyle = '#ece6dc'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#d9d1c4', '#f4efe7', '#e1d6c3'], 40, [0.08, 0.3], [0.15, 0.4])
    for (let i = 0; i < 7; i++) vein(ctx, s, rand, '#8f877c', s * 0.012, 0.12, s * 0.008)
    for (let i = 0; i < 9; i++) vein(ctx, s, rand, '#7d756b', s * 0.0028, 0.55, 0.6)
    for (let i = 0; i < 4; i++) vein(ctx, s, rand, '#a8916a', s * 0.002, 0.5, 0.4)
    speckle(ctx, s, rand, 6)
    // slab joints
    ctx.fillStyle = 'rgba(120,112,100,0.35)'
    ctx.fillRect(0, 0, s, Math.max(1, s / 700))
    ctx.fillRect(0, 0, Math.max(1, s / 700), s)
  },
  nero(ctx, s, rand) {
    ctx.fillStyle = '#1c1b1a'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#2a2826', '#121211'], 30, [0.1, 0.3], [0.3, 0.6])
    for (let i = 0; i < 6; i++) vein(ctx, s, rand, '#cfc8bd', s * 0.0022, 0.55, 0.5)
    for (let i = 0; i < 4; i++) vein(ctx, s, rand, '#e9e2d6', s * 0.008, 0.06, s * 0.006)
    speckle(ctx, s, rand, 5)
  },
  travertine(ctx, s, rand) {
    ctx.fillStyle = '#cdb99c'
    ctx.fillRect(0, 0, s, s)
    // horizontal sedimentary bands
    let y = 0
    while (y < s) {
      const h = s * (0.004 + rand() * 0.03)
      const tone = rand() > 0.5 ? '#bea583' : '#d8c7ab'
      ctx.fillStyle = withAlpha(tone, 0.25 + rand() * 0.4)
      ctx.beginPath()
      const amp = s * 0.004
      ctx.moveTo(0, y)
      for (let x = 0; x <= s; x += s / 32) ctx.lineTo(x, y + Math.sin((x / s) * Math.PI * 2 * 2 + y) * amp)
      for (let x = s; x >= 0; x -= s / 32) ctx.lineTo(x, y + h + Math.sin((x / s) * Math.PI * 2 * 2 + y) * amp)
      ctx.closePath()
      ctx.fill()
      y += h
    }
    // pores
    for (let i = 0; i < s * 0.6; i++) {
      const px = rand() * s
      const py = rand() * s
      const w = s * (0.002 + rand() * 0.012)
      ctx.fillStyle = withAlpha('#8c7656', 0.25 + rand() * 0.35)
      ctx.beginPath()
      ctx.ellipse(px, py, w, w * (0.18 + rand() * 0.2), 0, 0, Math.PI * 2)
      ctx.fill()
    }
    speckle(ctx, s, rand, 7)
    ctx.fillStyle = 'rgba(110,92,68,0.4)'
    ctx.fillRect(0, 0, s, Math.max(1, s / 600))
    ctx.fillRect(0, s / 2, s, Math.max(1, s / 600))
    ctx.fillRect(0, 0, Math.max(1, s / 600), s)
  },
  oak: (ctx, s, rand) => planks(ctx, s, rand, { base: '#a47d53', dark: '#6f4f31', light: '#c09a6e', planksAcross: 6 }),
  smokedOak: (ctx, s, rand) => planks(ctx, s, rand, { base: '#6a5744', dark: '#3f3228', light: '#85705a', planksAcross: 6 }),
  walnut: (ctx, s, rand) => planks(ctx, s, rand, { base: '#5b3f2c', dark: '#34231a', light: '#7a573d', planksAcross: 6 }),
  walnutGrain: (ctx, s, rand) => grain(ctx, s, rand, { base: '#563a28', dark: '#2f1f16', light: '#734f37' }),
  oakGrain: (ctx, s, rand) => grain(ctx, s, rand, { base: '#9f7a52', dark: '#6b4c30', light: '#bb966b' }),
  limestone(ctx, s, rand) {
    ctx.fillStyle = '#ddd2c2'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#cfc3b0', '#e8dfd0', '#c4b8a4'], 55, [0.06, 0.28], [0.18, 0.42])
    for (let i = 0; i < 5; i++) vein(ctx, s, rand, '#b5a890', s * 0.003, 0.18, s * 0.004)
    speckle(ctx, s, rand, 7)
    ctx.fillStyle = 'rgba(130,118,100,0.28)'
    ctx.fillRect(0, 0, s, Math.max(1, s / 650))
    ctx.fillRect(0, 0, Math.max(1, s / 650), s)
  },
  plaster(ctx, s, rand) {
    ctx.fillStyle = '#d8cfc1'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#cbc0ae', '#e3dbcf', '#d2c6b3'], 70, [0.05, 0.25], [0.2, 0.45])
    speckle(ctx, s, rand, 8)
  },
  limewash(ctx, s, rand) {
    ctx.fillStyle = '#cfc2ad'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#b9aa92', '#ddd2c0', '#c4b59d', '#e2d8c8'], 110, [0.04, 0.22], [0.25, 0.55])
    // trowel strokes
    for (let i = 0; i < 70; i++) {
      const x = rand() * s
      const y = rand() * s
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rand() * Math.PI)
      ctx.fillStyle = withAlpha(rand() > 0.5 ? '#e6dccb' : '#b5a68e', 0.12)
      ctx.beginPath()
      ctx.ellipse(0, 0, s * (0.05 + rand() * 0.08), s * (0.008 + rand() * 0.01), 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    speckle(ctx, s, rand, 6)
  },
  boucle(ctx, s, rand) {
    ctx.fillStyle = '#e4dccd'
    ctx.fillRect(0, 0, s, s)
    const loops = s * 14
    for (let i = 0; i < loops; i++) {
      const x = rand() * s
      const y = rand() * s
      const r = s * (0.002 + rand() * 0.004)
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,252,245,0.55)' : 'rgba(150,138,118,0.35)'
      ctx.lineWidth = Math.max(0.6, s * 0.0012)
      ctx.beginPath()
      ctx.arc(x, y, r, rand() * 6, rand() * 6 + 4)
      ctx.stroke()
    }
  },
  charcoalWool(ctx, s, rand) {
    ctx.fillStyle = '#3a3835'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#2c2a27', '#4a4743', '#524f4a'], 70, [0.03, 0.14], [0.25, 0.5])
    for (let i = 0; i < s * 10; i++) {
      const x = rand() * s
      const y = rand() * s
      ctx.fillStyle = rand() > 0.5 ? 'rgba(90,86,80,0.35)' : 'rgba(20,18,16,0.3)'
      ctx.fillRect(x, y, s * 0.004, s * 0.002)
    }
    speckle(ctx, s, rand, 10)
  },
  linen(ctx, s, rand) {
    ctx.fillStyle = '#d2c4ae'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < s * 18; i++) {
      const x = rand() * s
      const y = rand() * s
      ctx.fillStyle = rand() > 0.5 ? 'rgba(240,230,214,0.35)' : 'rgba(150,130,105,0.28)'
      if (rand() > 0.5) ctx.fillRect(x, y, s * 0.01, s * 0.0018)
      else ctx.fillRect(x, y, s * 0.0018, s * 0.01)
    }
    mottle(ctx, s, rand, ['#c4b49c', '#e0d4c0'], 30, [0.05, 0.18], [0.15, 0.3])
    speckle(ctx, s, rand, 8)
  },
  leather(ctx, s, rand) {
    ctx.fillStyle = '#8a4f2c'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#6f3c20', '#a2633b', '#7b4526'], 60, [0.04, 0.18], [0.25, 0.5])
    speckle(ctx, s, rand, 14)
  },
  velvet(ctx, s, rand) {
    ctx.fillStyle = '#4c5339'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#3b412b', '#5c6447'], 50, [0.05, 0.2], [0.2, 0.4])
    speckle(ctx, s, rand, 8)
  },
  inkVelvet(ctx, s, rand) {
    ctx.fillStyle = '#1c2230'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#151820', '#2a3144', '#243048'], 55, [0.05, 0.2], [0.25, 0.45])
    speckle(ctx, s, rand, 7)
  },
  rug(ctx, s, rand) {
    ctx.fillStyle = '#8f7f6c'
    ctx.fillRect(0, 0, s, s)
    // dense woven texture
    for (let i = 0; i < s * 9; i++) {
      const x = rand() * s
      const y = rand() * s
      ctx.fillStyle = rand() > 0.5 ? 'rgba(175,160,140,0.35)' : 'rgba(80,68,56,0.3)'
      ctx.fillRect(x, y, s * 0.006, s * 0.0025)
    }
    // tone-on-tone border
    const b = s * 0.06
    ctx.strokeStyle = 'rgba(60,50,40,0.45)'
    ctx.lineWidth = s * 0.012
    ctx.strokeRect(b, b, s - b * 2, s - b * 2)
    ctx.strokeStyle = 'rgba(190,170,140,0.25)'
    ctx.lineWidth = s * 0.004
    ctx.strokeRect(b * 1.6, b * 1.6, s - b * 3.2, s - b * 3.2)
  },
  terrace(ctx, s, rand) {
    ctx.fillStyle = '#9d9283'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#8a7f70', '#ada291'], 40, [0.05, 0.2], [0.2, 0.4])
    speckle(ctx, s, rand, 10)
    ctx.fillStyle = 'rgba(60,54,46,0.5)'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(0, (i * s) / 4, s, Math.max(1, s / 400))
      ctx.fillRect((i * s) / 4, 0, Math.max(1, s / 400), s)
    }
  },
  artwork(ctx, s, rand) {
    ctx.fillStyle = '#d9cfbf'
    ctx.fillRect(0, 0, s, s)
    mottle(ctx, s, rand, ['#cfc3b0', '#e4dbcd'], 30, [0.1, 0.3], [0.2, 0.4])
    ctx.fillStyle = '#2b2522'
    ctx.fillRect(s * 0.14, s * 0.52, s * 0.42, s * 0.34)
    ctx.strokeStyle = '#a8895d'
    ctx.lineWidth = s * 0.03
    ctx.beginPath()
    ctx.arc(s * 0.6, s * 0.48, s * 0.26, Math.PI * 1.05, Math.PI * 1.95)
    ctx.stroke()
    ctx.fillStyle = 'rgba(96,75,59,0.85)'
    ctx.beginPath()
    ctx.arc(s * 0.72, s * 0.7, s * 0.09, 0, Math.PI * 2)
    ctx.fill()
    speckle(ctx, s, rand, 10)
  },
}

function planks(ctx: CanvasRenderingContext2D, s: number, rand: Rand, c: { base: string; dark: string; light: string; planksAcross: number }) {
  const pw = s / c.planksAcross
  for (let col = 0; col < c.planksAcross; col++) {
    let y = -rand() * s * 0.5
    while (y < s) {
      const len = s * (0.45 + rand() * 0.55)
      const tone = rand()
      ctx.fillStyle = c.base
      ctx.fillRect(col * pw, y, pw, len)
      ctx.globalAlpha = 0.25 + rand() * 0.25
      ctx.fillStyle = tone < 0.5 ? c.dark : c.light
      ctx.fillRect(col * pw, y, pw, len)
      ctx.globalAlpha = 1
      // grain lines along the plank
      for (let g = 0; g < 26; g++) {
        const gx = col * pw + rand() * pw
        ctx.strokeStyle = withAlpha(rand() > 0.3 ? c.dark : c.light, 0.08 + rand() * 0.22)
        ctx.lineWidth = Math.max(0.5, s * (0.0008 + rand() * 0.0025))
        ctx.beginPath()
        ctx.moveTo(gx, y)
        const wobble = pw * 0.05
        for (let k = 1; k <= 12; k++) ctx.lineTo(gx + Math.sin(k * 0.9 + gx) * wobble * rand(), y + (len * k) / 12)
        ctx.stroke()
      }
      // end joint
      ctx.fillStyle = withAlpha(c.dark, 0.7)
      ctx.fillRect(col * pw, y, pw, Math.max(1, s / 500))
      y += len
    }
    ctx.fillStyle = withAlpha(c.dark, 0.8)
    ctx.fillRect(col * pw, 0, Math.max(1, s / 500), s)
  }
}

function grain(ctx: CanvasRenderingContext2D, s: number, rand: Rand, c: { base: string; dark: string; light: string }) {
  ctx.fillStyle = c.base
  ctx.fillRect(0, 0, s, s)
  mottle(ctx, s, rand, [c.dark, c.light], 20, [0.1, 0.3], [0.1, 0.25])
  for (let g = 0; g < s * 0.25; g++) {
    const gx = rand() * s
    ctx.strokeStyle = withAlpha(rand() > 0.35 ? c.dark : c.light, 0.06 + rand() * 0.25)
    ctx.lineWidth = Math.max(0.5, s * (0.0006 + rand() * 0.002))
    const phase = rand() * 6
    tiled(s, (ox) => {
      ctx.beginPath()
      for (let k = 0; k <= 24; k++) {
        const yy = (s * k) / 24
        const xx = gx + ox + Math.sin((k / 24) * Math.PI * 2 + phase) * s * 0.006
        if (k === 0) ctx.moveTo(xx, yy)
        else ctx.lineTo(xx, yy)
      }
      ctx.stroke()
    })
  }
}

export type TextureKind = keyof typeof painters

export function getTexture(kind: TextureKind, size: number, repeat: [number, number] = [1, 1]): THREE.CanvasTexture {
  const key = `${kind}:${size}:${repeat.join('x')}`
  const hit = cache.get(key)
  if (hit) return hit

  // Share the painted canvas between repeat variants of the same kind.
  const baseKey = `${kind}:${size}:canvas`
  let canvas = (cache.get(baseKey)?.image as HTMLCanvasElement | undefined) ?? undefined
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    const seed = Array.from(kind).reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261)
    painters[kind](ctx, size, seeded(seed))
    const base = new THREE.CanvasTexture(canvas)
    cache.set(baseKey, base)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat[0], repeat[1])
  texture.anisotropy = 8
  cache.set(key, texture)
  return texture
}
