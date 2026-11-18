import { lazy, Suspense, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Hand, Move3d, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import type { CameraControlsImpl } from '@react-three/drei'
import {
  defaultFinishes,
  floorOptions,
  metalOptions,
  moodOptions,
  upholsteryOptions,
  viewOptions,
  wallOptions,
  type LightingMood,
  type Option,
  type RoomFinishes,
  type RoomView,
} from '../../data/configurator'
import { media } from '../../data/media'
import { getQualityTier, hasWebGL } from '../../lib/device'
import { useInViewport } from '../../hooks/useInViewport'
import { useFinePointer } from '../../hooks/useMediaQuery'
import { Img } from '../ui/Img'
import { ArrowLink } from '../ui/ArrowButton'
import { SceneErrorBoundary } from '../three/SceneErrorBoundary'

const ConfiguratorScene = lazy(() => import('../three/ConfiguratorScene'))

const DEFAULT_MOOD: LightingMood = 'evening'
const DEFAULT_VIEW: RoomView = 'lounge'

function SwatchGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const selected = options.find((o) => o.id === value)
  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="sr-only">{legend}</legend>
      <div className="flex items-baseline justify-between gap-4" aria-hidden>
        <span className="eyebrow text-cream/55">{legend}</span>
        <span className="font-display text-lg text-cream italic">{selected?.label}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {options.map((o) => (
          <label key={o.id} className="group relative cursor-pointer" title={o.label}>
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="peer sr-only"
            />
            <span className="sr-only">
              {o.label} — {o.note}
            </span>
            <span
              aria-hidden
              className="block size-12 border border-cream/15 ring-gold ring-offset-2 ring-offset-obsidian transition-[box-shadow,transform] duration-500 group-hover:scale-105 peer-checked:ring-1 peer-focus-visible:ring-2 peer-focus-visible:ring-cream sm:size-14"
              style={{ background: o.swatch }}
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-cream/50" aria-hidden>
        {selected?.note}
      </p>
    </fieldset>
  )
}

export function RoomConfigurator() {
  const [finishes, setFinishes] = useState<RoomFinishes>(defaultFinishes)
  const [mood, setMood] = useState<LightingMood>(DEFAULT_MOOD)
  const [view, setView] = useState<RoomView>(DEFAULT_VIEW)
  const [viewRequest, setViewRequest] = useState(0)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [exploring, setExploring] = useState(false)
  const viewport = useRef<HTMLDivElement>(null)
  const controls = useRef<CameraControlsImpl | null>(null)
  const finePointer = useFinePointer()
  const visible = useInViewport(viewport, '100px')
  const webgl = useMemo(() => hasWebGL(), [])
  const tier = useMemo(() => getQualityTier(), [])
  const show3d = webgl && !failed
  // On touch screens the canvas only captures gestures once the visitor opts in, so the page stays scrollable.
  const interactive = finePointer || exploring

  const set = <K extends keyof RoomFinishes>(key: K) => (value: RoomFinishes[K]) => setFinishes((f) => ({ ...f, [key]: value }))

  const frame = (next: RoomView) => {
    setView(next)
    setViewRequest((n) => n + 1)
  }

  const reset = () => {
    setFinishes(defaultFinishes)
    setMood(DEFAULT_MOOD)
    frame(DEFAULT_VIEW)
  }

  const rotate = (azimuth: number, polar = 0) => controls.current?.rotate(azimuth, polar, true)
  const dolly = (distance: number) => controls.current?.dolly(distance, true)

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 0.12
    const actions: Record<string, () => void> = {
      ArrowLeft: () => rotate(step),
      ArrowRight: () => rotate(-step),
      ArrowUp: () => rotate(0, step * 0.6),
      ArrowDown: () => rotate(0, -step * 0.6),
      '+': () => dolly(0.4),
      '=': () => dolly(0.4),
      '-': () => dolly(-0.4),
    }
    const action = actions[e.key]
    if (action) {
      e.preventDefault()
      action()
    }
  }

  const summary = [
    `Floor: ${floorOptions.find((o) => o.id === finishes.floor)?.label}`,
    `Walls: ${wallOptions.find((o) => o.id === finishes.wall)?.label}`,
    `Upholstery: ${upholsteryOptions.find((o) => o.id === finishes.upholstery)?.label}`,
    `Metal: ${metalOptions.find((o) => o.id === finishes.metal)?.label}`,
    `Light: ${moodOptions.find((o) => o.id === mood)?.label}`,
  ]

  return (
    <div className="grid gap-px bg-line lg:grid-cols-12">
      {/* Viewport */}
      <div className="bg-ink lg:col-span-8">
        <div
          ref={viewport}
          tabIndex={show3d ? 0 : undefined}
          role={show3d ? 'application' : undefined}
          aria-label={
            show3d
              ? 'Interactive 3D living room. Drag to look around. With the keyboard, use the arrow keys to rotate and plus or minus to move closer or further.'
              : undefined
          }
          aria-describedby={show3d ? 'atelier-status' : undefined}
          onKeyDown={show3d ? onKeyDown : undefined}
          className={`relative h-[68svh] min-h-[22rem] overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-inset lg:sticky lg:top-[var(--header-h)] lg:h-[calc(100svh-var(--header-h))] ${
            interactive ? 'cursor-grab touch-none active:cursor-grabbing' : 'touch-pan-y'
          }`}
        >
          {show3d ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,#3a2c22_0%,#171716_60%,#10100f_100%)]" />
              <SceneErrorBoundary fallback={null} onError={() => setFailed(true)}>
                <Suspense fallback={null}>
                  <div
                    className={`absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-luxe)] ${ready ? 'opacity-100' : 'opacity-0'} ${
                      interactive ? '' : 'pointer-events-none'
                    }`}
                  >
                    <ConfiguratorScene
                      finishes={finishes}
                      mood={mood}
                      view={view}
                      viewRequest={viewRequest}
                      tier={tier}
                      active={visible}
                      interactive={interactive}
                      controlsRef={controls}
                      onReady={() => setReady(true)}
                    />
                  </div>
                </Suspense>
              </SceneErrorBoundary>

              {!ready && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5" role="status">
                  <span className="eyebrow text-cream/70">Preparing the room</span>
                  <span aria-hidden className="relative block h-px w-40 overflow-hidden bg-cream/15">
                    <span className="animate-loading-bar absolute inset-y-0 left-0 w-1/3 bg-gold" />
                  </span>
                </div>
              )}

              {/* Camera tools */}
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/80 to-transparent p-4 sm:p-6">
                <div role="group" aria-label="Camera view" className="flex flex-wrap gap-1 bg-obsidian/80 p-1 backdrop-blur-sm">
                  {viewOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={view === o.id}
                      onClick={() => frame(o.id)}
                      className={`eyebrow min-h-10 px-3 transition-colors duration-500 sm:px-4 ${
                        view === o.id ? 'bg-cream text-obsidian' : 'text-cream/70 hover:text-cream'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 bg-obsidian/80 p-1 backdrop-blur-sm">
                  {!finePointer && (
                    <button
                      type="button"
                      aria-pressed={exploring}
                      onClick={() => setExploring((v) => !v)}
                      className={`eyebrow flex min-h-10 items-center gap-2 px-3 transition-colors duration-500 ${
                        exploring ? 'bg-gold text-obsidian' : 'text-cream'
                      }`}
                    >
                      {exploring ? <Hand className="size-4" strokeWidth={1.25} aria-hidden /> : <Move3d className="size-4" strokeWidth={1.25} aria-hidden />}
                      {exploring ? 'Done' : 'Explore'}
                    </button>
                  )}
                  <button type="button" aria-label="Look left" onClick={() => rotate(0.3)} className="flex size-10 items-center justify-center text-cream hover:text-gold">
                    <RotateCcw className="size-4" strokeWidth={1.25} aria-hidden />
                  </button>
                  <button type="button" aria-label="Look right" onClick={() => rotate(-0.3)} className="flex size-10 items-center justify-center text-cream hover:text-gold">
                    <RotateCw className="size-4" strokeWidth={1.25} aria-hidden />
                  </button>
                  <button type="button" aria-label="Move closer" onClick={() => dolly(0.6)} className="hidden size-10 items-center justify-center text-cream hover:text-gold sm:flex">
                    <ZoomIn className="size-4" strokeWidth={1.25} aria-hidden />
                  </button>
                  <button type="button" aria-label="Move back" onClick={() => dolly(-0.6)} className="hidden size-10 items-center justify-center text-cream hover:text-gold sm:flex">
                    <ZoomOut className="size-4" strokeWidth={1.25} aria-hidden />
                  </button>
                </div>
              </div>
              <p id="atelier-status" className="eyebrow pointer-events-none absolute top-4 left-4 text-[0.62rem] text-cream/60 sm:top-6 sm:left-6">
                {finePointer ? 'Drag to look · Right-drag to move' : exploring ? 'Drag to look · Pinch to move' : 'Tap Explore to move the camera'}
              </p>
            </>
          ) : (
            <div className="absolute inset-0">
              <Img media={media['living-stone']} className="size-full object-cover" sizes="(min-width: 1024px) 66vw, 100vw" />
              <div className="absolute inset-0 bg-ink/55" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <p className="max-w-md text-cream/85">
                  The 3D room needs WebGL, which isn’t available in this browser. You can still compose a palette — your selections are listed alongside
                  and can be sent with an enquiry.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-obsidian lg:col-span-4">
        <div className="flex flex-col gap-6 p-6 sm:p-10 lg:p-8 xl:p-10">
          <fieldset>
            <legend className="eyebrow text-cream/55">Light</legend>
            <div className="mt-4 grid grid-cols-3 gap-px bg-line">
              {moodOptions.map((o) => (
                <label key={o.id} className="relative cursor-pointer bg-obsidian">
                  <input type="radio" name="mood" value={o.id} checked={mood === o.id} onChange={() => setMood(o.id)} className="peer sr-only" />
                  <span className="flex h-full flex-col gap-1 p-3 transition-colors duration-500 peer-checked:bg-cream peer-checked:text-obsidian peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-gold hover:bg-espresso peer-checked:hover:bg-cream">
                    <span className="text-sm">{o.label}</span>
                    <span className="text-[0.7rem] leading-snug opacity-60">{o.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <SwatchGroup name="floor" legend="Floor" options={floorOptions} value={finishes.floor} onChange={set('floor')} />
          <SwatchGroup name="wall" legend="Feature wall" options={wallOptions} value={finishes.wall} onChange={set('wall')} />
          <SwatchGroup name="upholstery" legend="Upholstery" options={upholsteryOptions} value={finishes.upholstery} onChange={set('upholstery')} />
          <SwatchGroup name="metal" legend="Metalwork" options={metalOptions} value={finishes.metal} onChange={set('metal')} />

          <div className="border-t border-line pt-6">
            <h3 className="eyebrow text-gold">Your palette</h3>
            <ul className="mt-4 flex flex-col gap-1.5 text-sm text-cream/75" aria-live="polite">
              {summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <ArrowLink variant="solid" to={`/contact?palette=${encodeURIComponent(summary.join('; '))}`}>
                Discuss this palette
              </ArrowLink>
              <button
                type="button"
                onClick={reset}
                className="eyebrow inline-flex min-h-12 items-center gap-2 px-2 text-cream/70 transition-colors duration-500 hover:text-cream"
              >
                <RotateCcw className="size-4" strokeWidth={1.25} aria-hidden />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
