/* ── Bencho sounds ─────────────────────────────────────────
   Interface sounds from https://bencho.dev/sounds, synthesised
   with the Web Audio API — no files, no dependencies. MIT. */

export type Note = {
  hz: number
  to?: number
  glide?: number
  ms: number
  gain?: number
  wave?: OscillatorType
  cut?: number
  at?: number
  atk?: number
  noise?: 'bandpass' | 'lowpass'
  q?: number
  lin?: true
}

export const SOUNDS = {
  /* Nib · Actions — https://bencho.dev/sounds/nib — soft ambient screen tap */
  nib: [
    { hz: 1900, ms: 12, gain: 0.058, noise: 'bandpass' as const, q: 2.5, atk: 1 },
    { hz: 2250, to: 2000, ms: 12, gain: 0.046, atk: 1 },
    { hz: 300, ms: 10, gain: 0.023, atk: 1 },
  ],
  /* Paid · Feedback — https://bencho.dev/sounds/paid */
  paid: [
    { hz: 587, ms: 170, gain: 0.05, wave: 'sine' as const, cut: 2600, atk: 5 },
    { hz: 880, ms: 460, gain: 0.046, wave: 'sine' as const, cut: 2800, atk: 6, at: 95 },
    { hz: 1760, ms: 300, gain: 0.009, wave: 'sine' as const, atk: 8, at: 100 },
  ],
  /* Clack · Selection — https://bencho.dev/sounds/clack */
  clack: [
    { hz: 2600, ms: 5, gain: 0.19, noise: 'bandpass' as const, q: 0.5, atk: 0.5 },
    { hz: 75, to: 48, ms: 48, gain: 0.071, at: 2, atk: 2, glide: 12 },
    { hz: 55, ms: 48, gain: 0.026, at: 3, atk: 3 },
    { hz: 2800, ms: 5, gain: 0.19, noise: 'bandpass' as const, q: 0.5, at: 106, atk: 0.5 },
    { hz: 75, to: 48, ms: 48, gain: 0.077, at: 108, atk: 2, glide: 12 },
    { hz: 55, ms: 48, gain: 0.03, at: 110, atk: 3 },
  ],
} satisfies Record<string, Note[]>

export type SoundName = keyof typeof SOUNDS

let ctx: AudioContext | null = null
const NOISE = new WeakMap<BaseAudioContext, AudioBuffer>()

function noiseFor(c: BaseAudioContext) {
  let b = NOISE.get(c)
  if (!b) {
    b = c.createBuffer(1, Math.floor(c.sampleRate * 2), c.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    NOISE.set(c, b)
  }
  return b
}

export function schedule(
  c: BaseAudioContext,
  notes: readonly Note[],
  when: number,
  volume = 1,
  bend = 1,
) {
  for (const n of notes) {
    const t0 = when + (n.at ?? 0) / 1000
    const t1 = t0 + n.ms / 1000
    const tg = n.glide ? t0 + n.glide / 1000 : t1
    let src: AudioScheduledSourceNode
    let head: AudioNode
    if (n.noise) {
      const s = c.createBufferSource()
      s.buffer = noiseFor(c)
      s.loop = true
      const f = c.createBiquadFilter()
      f.type = n.noise
      f.frequency.setValueAtTime(n.hz * bend, t0)
      if (n.to) f.frequency.exponentialRampToValueAtTime(n.to * bend, tg)
      if (n.q !== undefined) f.Q.value = n.q
      s.connect(f)
      src = s
      head = f
    } else {
      const o = c.createOscillator()
      o.type = n.wave ?? 'sine'
      o.frequency.setValueAtTime(n.hz * bend, t0)
      if (n.to) o.frequency.exponentialRampToValueAtTime(n.to * bend, tg)
      src = o
      head = o
    }
    const g = c.createGain()
    const atk = Math.min((n.atk ?? 4) / 1000, (n.ms / 1000) * 0.6)
    const peak = (n.gain ?? 0.05) * volume
    g.gain.setValueAtTime(0.0001, t0)
    if (n.lin) g.gain.linearRampToValueAtTime(peak, t0 + atk)
    else g.gain.exponentialRampToValueAtTime(peak, t0 + atk)
    g.gain.exponentialRampToValueAtTime(0.0001, t1)
    let tail: AudioNode = head
    if (n.cut) {
      const f = c.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = n.cut
      head.connect(f)
      tail = f
    }
    tail.connect(g).connect(c.destination)
    if (n.noise) (src as AudioBufferSourceNode).start(t0, Math.random() * 1.5)
    else src.start(t0)
    src.stop(t1 + 0.02)
  }
}

export function play(name: SoundName, o: { volume?: number; pitch?: number } = {}) {
  if (typeof window === 'undefined') return
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  schedule(ctx, SOUNDS[name], ctx.currentTime + 0.005, o.volume ?? 1, o.pitch ?? 1)
}
