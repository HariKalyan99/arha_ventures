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
import {
  getPaletteGuidance,
  recommendedIds,
  type FinishCategory,
} from '../../data/atelierGuide'
import { media } from '../../data/media'
import { getQualityTier, hasWebGL } from '../../lib/device'
import { useInViewport } from '../../hooks/useInViewport'
import { useFinePointer } from '../../hooks/useMediaQuery'
import { Img } from '../ui/Img'
import { SceneErrorBoundary } from '../three/SceneErrorBoundary'

const ConfiguratorScene = lazy(() => import('../three/ConfiguratorScene'))

const DEFAULT_MOOD: LightingMood = 'evening'
const DEFAULT_VIEW: RoomView = 'lounge'

function SwatchGroup<T extends string>({
  name,
  legend,
  options,
  value,
  recommended,
  onChange,
}: {
  name: string
  legend: string
  options: Option<T>[]
  value: T
  /** Finish ids that pair well with the current focus choice */
  recommended?: Set<string>
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
      <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
        {options.map((o) => {
          const isRec = recommended?.has(o.id) && o.id !== value
          return (
            <label
              key={o.id}
              className="group relative cursor-pointer"
              title={isRec ? `${o.label} — pairs well with your current focus` : `${o.label} — ${o.note}`}
            >
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
                {isRec ? '. Suggested pairing.' : ''}
              </span>
              <span
                aria-hidden
                className={`block size-11 border transition-[box-shadow,transform,border-color] duration-500 group-hover:scale-105 peer-checked:ring-1 peer-checked:ring-gold peer-checked:ring-offset-2 peer-checked:ring-offset-obsidian peer-focus-visible:ring-2 peer-focus-visible:ring-cream sm:size-12 ${
                  isRec ? 'border-gold/70 shadow-[0_0_0_1px_rgba(182,155,117,0.35)]' : 'border-cream/15'
                }`}
                style={{ background: o.swatch }}
              />
              {isRec && (
                <span aria-hidden className="pointer-events-none absolute -top-1 -right-1 size-1.5 rounded-full bg-gold" />
              )}
            </label>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-cream/50" aria-hidden>
        {selected?.note}
        {recommended && recommended.size > 0 ? ' · Highlighted swatches pair with your focus choice.' : ''}
      </p>
    </fieldset>
  )
}

/** Interactive study room — teaches finish pairing through live 3D feedback. */
export function RoomConfigurator() {
  const [finishes, setFinishes] = useState<RoomFinishes>(defaultFinishes)
  const [mood, setMood] = useState<LightingMood>(DEFAULT_MOOD)
  const [view, setView] = useState<RoomView>(DEFAULT_VIEW)
  const [viewRequest, setViewRequest] = useState(0)
  const [focus, setFocus] = useState<FinishCategory>('floor')
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
  // Touch: canvas only captures gestures after Explore, so the page stays scrollable.
  const interactive = finePointer || exploring

  const guidance = useMemo(() => getPaletteGuidance(finishes, mood, focus), [finishes, mood, focus])

  const recWall = useMemo(() => recommendedIds(finishes, mood, focus, 'wall'), [finishes, mood, focus])
  const recFloor = useMemo(() => recommendedIds(finishes, mood, focus, 'floor'), [finishes, mood, focus])
  const recUpholstery = useMemo(() => recommendedIds(finishes, mood, focus, 'upholstery'), [finishes, mood, focus])
  const recMetal = useMemo(() => recommendedIds(finishes, mood, focus, 'metal'), [finishes, mood, focus])
  const recMood = useMemo(() => recommendedIds(finishes, mood, focus, 'mood'), [finishes, mood, focus])

  const setFinish =
    <K extends keyof RoomFinishes>(key: K) =>
    (value: RoomFinishes[K]) => {
      setFocus(key)
      setFinishes((f) => ({ ...f, [key]: value }))
    }

  const changeMood = (next: LightingMood) => {
    setFocus('mood')
    setMood(next)
  }

  const applySuggestion = (category: FinishCategory, id: string) => {
    setFocus(category)
    if (category === 'mood') {
      setMood(id as LightingMood)
      return
    }
    setFinishes((f) => ({ ...f, [category]: id }))
  }

  const frame = (next: RoomView) => {
    setView(next)
    setViewRequest((n) => n + 1)
  }

  const reset = () => {
    setFinishes(defaultFinishes)
    setMood(DEFAULT_MOOD)
    setFocus('floor')
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
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,#2d2420_0%,#171717_60%,#111111_100%)]" />
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

              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/80 to-transparent p-4 sm:p-6">
                <div role="group" aria-label="Camera view" className="flex flex-wrap gap-1 bg-obsidian/80 p-1 backdrop-blur-sm">
                  {viewOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={view === o.id}
                      onClick={() => frame(o.id)}
                      className={`eyebrow min-h-10 px-3 transition-colors duration-500 sm:px-4 ${
                        view === o.id ? 'bg-parchment text-on-plate' : 'text-cream/70 hover:text-cream'
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
                  The 3D study needs WebGL, which isn’t available here. You can still explore the finish guide and pairing notes in the panel alongside.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational controls */}
      <div className="bg-obsidian lg:col-span-4">
        <div className="flex flex-col gap-6 p-6 sm:p-10 lg:p-8 xl:p-10">
          <div>
            <p className="eyebrow text-gold">Material study</p>
            <p className="mt-3 text-sm leading-relaxed text-cream/70">
              Choose a finish to learn what it asks of the room. Suggested companions are highlighted — try them and watch the scene respond.
            </p>
          </div>

          {/* Live lesson for the last choice */}
          <aside
            className="rounded-sm border border-gold/25 bg-ink/50 p-4 sm:p-5"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="eyebrow text-gold/90">Focus</p>
            <h3 className="font-display mt-2 text-xl text-cream italic sm:text-2xl">{guidance.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">{guidance.lesson}</p>

            {guidance.suggestions.length > 0 && (
              <div className="mt-5">
                <p className="eyebrow text-cream/45">Works well with</p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {guidance.suggestions.map((s) => (
                    <li key={`${s.category}-${s.id}`}>
                      <button
                        type="button"
                        onClick={() => !s.active && applySuggestion(s.category, s.id)}
                        disabled={s.active}
                        className={`group flex w-full gap-3 border px-3 py-3 text-left transition-colors duration-500 ${
                          s.active
                            ? 'cursor-default border-gold/30 bg-gold/5'
                            : 'border-line bg-obsidian/60 hover:border-gold/40 hover:bg-espresso/40'
                        }`}
                      >
                        {s.swatch ? (
                          <span
                            aria-hidden
                            className="mt-0.5 size-10 shrink-0 border border-cream/15 sm:size-11"
                            style={{ background: s.swatch }}
                          />
                        ) : (
                          <span
                            aria-hidden
                            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center border border-cream/15 text-[0.55rem] tracking-[0.18em] uppercase sm:size-11 ${
                              s.id === 'daylight' ? 'bg-parchment text-on-plate' : s.id === 'evening' ? 'bg-gold/25 text-cream' : 'bg-espresso text-cream/70'
                            }`}
                          >
                            {s.id === 'daylight' ? 'Day' : s.id === 'evening' ? 'Eve' : 'Ngt'}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="eyebrow block text-[0.6rem] text-cream/45">{s.categoryLabel}</span>
                          <span className={`mt-0.5 block text-sm ${s.active ? 'text-gold-soft' : 'text-cream group-hover:text-brass-soft'}`}>
                            {s.label}
                          </span>
                          <span className="mt-1.5 block text-xs leading-relaxed text-cream/55">{s.reason}</span>
                        </span>
                        <span className={`eyebrow shrink-0 self-center ${s.active ? 'text-gold/80' : 'text-gold/70'}`}>
                          {s.active ? 'In use' : 'Try'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guidance.tension && (
              <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-gold-soft/90">
                <span className="eyebrow mr-2 text-gold">Note</span>
                {guidance.tension}
              </p>
            )}
          </aside>

          <fieldset>
            <legend className="eyebrow text-cream/55">Light</legend>
            <div className="mt-4 grid grid-cols-3 gap-px bg-line">
              {moodOptions.map((o) => {
                const isRec = recMood.has(o.id) && o.id !== mood
                return (
                  <label key={o.id} className="relative cursor-pointer bg-obsidian">
                    <input type="radio" name="mood" value={o.id} checked={mood === o.id} onChange={() => changeMood(o.id)} className="peer sr-only" />
                    <span
                      className={`flex h-full flex-col gap-1 p-3 transition-colors duration-500 peer-checked:bg-parchment peer-checked:text-on-plate peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-gold hover:bg-espresso peer-checked:hover:bg-parchment ${
                        isRec ? 'ring-1 ring-inset ring-gold/50' : ''
                      }`}
                    >
                      <span className="text-sm">{o.label}</span>
                      <span className="text-[0.7rem] leading-snug opacity-60">{o.note}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <SwatchGroup name="floor" legend="Floor" options={floorOptions} value={finishes.floor} recommended={recFloor} onChange={setFinish('floor')} />
          <SwatchGroup name="wall" legend="Feature wall" options={wallOptions} value={finishes.wall} recommended={recWall} onChange={setFinish('wall')} />
          <SwatchGroup
            name="upholstery"
            legend="Upholstery"
            options={upholsteryOptions}
            value={finishes.upholstery}
            recommended={recUpholstery}
            onChange={setFinish('upholstery')}
          />
          <SwatchGroup name="metal" legend="Metalwork" options={metalOptions} value={finishes.metal} recommended={recMetal} onChange={setFinish('metal')} />

          <div className="border-t border-line pt-6">
            <h3 className="eyebrow text-gold">Reading this palette</h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/75">{guidance.reading}</p>
            <ul className="mt-5 flex flex-col gap-1.5 text-xs text-cream/55" aria-live="polite">
              <li>Floor · {floorOptions.find((o) => o.id === finishes.floor)?.label}</li>
              <li>Wall · {wallOptions.find((o) => o.id === finishes.wall)?.label}</li>
              <li>Upholstery · {upholsteryOptions.find((o) => o.id === finishes.upholstery)?.label}</li>
              <li>Metal · {metalOptions.find((o) => o.id === finishes.metal)?.label}</li>
              <li>Light · {moodOptions.find((o) => o.id === mood)?.label}</li>
            </ul>
            <button
              type="button"
              onClick={reset}
              className="eyebrow mt-8 inline-flex min-h-12 items-center gap-2 px-2 text-cream/70 transition-colors duration-500 hover:text-cream"
            >
              <RotateCcw className="size-4" strokeWidth={1.25} aria-hidden />
              Reset study
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
