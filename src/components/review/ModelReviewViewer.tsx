import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import type { ReviewModel } from '../../data/modelReviews'
import {
  clearAnnotations,
  loadAnnotations,
  saveAnnotations,
  type ModelAnnotation,
} from '../../lib/modelAnnotations'
import { SceneErrorBoundary } from '../three/SceneErrorBoundary'
import { contentBox } from '../three/modelBounds'

type ViewMode = 'interior' | 'exterior'

type ModelReviewViewerProps = {
  model: ReviewModel
}

/** Place the camera from the live world AABB — guaranteed inside / outside the shell. */
function frameCamera(
  object: THREE.Object3D,
  view: ViewMode,
  camera: THREE.Camera,
  controls: OrbitControlsImpl | null,
) {
  object.updateWorldMatrix(true, true)
  const full = new THREE.Box3().setFromObject(object)
  if (full.isEmpty()) return

  /* Interior stands inside the furnished core — not the empty inflated shell AABB. */
  const box = view === 'interior' ? contentBox(object) : full
  if (box.isEmpty()) return

  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const persp = camera as THREE.PerspectiveCamera
  const alongZ = size.z >= size.x
  const longest = Math.max(size.x, size.z, 1)

  if (view === 'interior') {
    const eyeY = THREE.MathUtils.clamp(box.min.y + 1.55, box.min.y + 0.4, box.max.y - 0.35)
    /* Stand in the open middle of the core — edge lerps clip into walls. */
    const pos = new THREE.Vector3(center.x, eyeY, center.z)
    const target = new THREE.Vector3(center.x, eyeY - 0.1, center.z)
    if (alongZ) {
      pos.z = THREE.MathUtils.lerp(box.min.z, box.max.z, 0.34)
      target.z = THREE.MathUtils.lerp(box.min.z, box.max.z, 0.76)
      /* Bias left of centre so the wood partition doesn’t fill the frame. */
      pos.x = THREE.MathUtils.lerp(box.min.x, box.max.x, 0.42)
      target.x = THREE.MathUtils.lerp(box.min.x, box.max.x, 0.46)
    } else {
      pos.x = THREE.MathUtils.lerp(box.min.x, box.max.x, 0.34)
      target.x = THREE.MathUtils.lerp(box.min.x, box.max.x, 0.76)
      pos.z = THREE.MathUtils.lerp(box.min.z, box.max.z, 0.42)
      target.z = THREE.MathUtils.lerp(box.min.z, box.max.z, 0.46)
    }

    persp.fov = 62
    persp.near = 0.08
    persp.far = Math.max(800, longest * 8)
    persp.position.copy(pos)
    persp.lookAt(target)
    persp.updateProjectionMatrix()

    if (controls) {
      controls.target.copy(target)
      controls.minDistance = 0.2
      controls.maxDistance = longest * 1.5
      controls.update()
    }
    return
  }

  const elev = Math.max(size.y * 0.55, 4)
  const dist = longest * 0.85
  const pos = new THREE.Vector3(
    center.x + (alongZ ? dist * 0.45 : dist),
    center.y + elev,
    center.z + (alongZ ? dist : dist * 0.35),
  )
  persp.fov = 45
  persp.near = 0.1
  persp.far = Math.max(1200, longest * 8)
  persp.position.copy(pos)
  persp.lookAt(center)
  persp.updateProjectionMatrix()

  if (controls) {
    controls.target.copy(center)
    controls.minDistance = 1
    controls.maxDistance = longest * 4
    controls.update()
  }
}

function ReviewModelMesh({
  url,
  annotateMode,
  onAnnotate,
  interiorPass,
  view,
  controlsRef,
  frameKey,
}: {
  url: string
  annotateMode: boolean
  onAnnotate: (point: THREE.Vector3) => void
  interiorPass: boolean
  view: ViewMode
  controlsRef: RefObject<OrbitControlsImpl | null>
  frameKey: number
}) {
  /* Meshopt-compressed review GLBs (e.g. sraven-interior). */
  const { scene } = useGLTF(url, false, true)
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const clone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.frustumCulled = false
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((mat) => {
        if (!mat) return
        /* DoubleSide — CAD shells face out; interior cameras need the inner faces. */
        mat.side = THREE.DoubleSide
        mat.needsUpdate = true
      })
    })
  }, [clone])

  /* interiorPass kept for call-site clarity (framing) — materials stay DoubleSide. */
  void interiorPass

  useLayoutEffect(() => {
    const root = groupRef.current
    if (!root) return
    /* Wait one frame so matrices are settled after mount / material side change. */
    const id = requestAnimationFrame(() => {
      frameCamera(root, view, camera, controlsRef.current)
    })
    return () => cancelAnimationFrame(id)
  }, [camera, controlsRef, frameKey, view, clone])

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!annotateMode) return
      e.stopPropagation()
      onAnnotate(e.point.clone())
    },
    [annotateMode, onAnnotate],
  )

  return (
    <group ref={groupRef}>
      <primitive
        object={clone}
        onPointerDown={onPointerDown}
        onPointerOver={() => {
          if (annotateMode) document.body.style.cursor = 'crosshair'
        }}
        onPointerOut={() => {
          document.body.style.cursor = ''
        }}
      />
    </group>
  )
}

function AnnotationMarker({
  annotation,
  selected,
  onSelect,
}: {
  annotation: ModelAnnotation
  selected: boolean
  onSelect: () => void
}) {
  return (
    <group position={[annotation.x, annotation.y, annotation.z]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={selected ? '#c45c3e' : '#e8c9a0'}
          emissive={selected ? '#c45c3e' : '#8a6a4a'}
          emissiveIntensity={0.45}
          roughness={0.4}
        />
      </mesh>
      <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div
          className={`whitespace-nowrap rounded px-2 py-1 text-[10px] shadow-sm ${
            selected ? 'bg-terracotta text-parchment' : 'bg-ink/80 text-cream'
          }`}
        >
          {annotation.label || 'Untitled'}
        </div>
      </Html>
    </group>
  )
}

function LoadingOverlay() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-ink/50 text-xs text-cream/70">
      Loading model… {Math.round(progress)}%
    </div>
  )
}

export function ModelReviewViewer({ model }: ModelReviewViewerProps) {
  const [view, setView] = useState<ViewMode>(model.defaultView ?? 'exterior')
  const [annotateMode, setAnnotateMode] = useState(true)
  const [annotations, setAnnotations] = useState<ModelAnnotation[]>(() => loadAnnotations(model.slug))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [pendingPoint, setPendingPoint] = useState<THREE.Vector3 | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [frameKey, setFrameKey] = useState(0)
  const labelRef = useRef<HTMLInputElement>(null)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    setAnnotations(loadAnnotations(model.slug))
    setSelectedId(null)
    setPendingPoint(null)
    setDraft('')
    setLoadFailed(false)
    setView(model.defaultView ?? 'exterior')
    setFrameKey((n) => n + 1)
  }, [model])

  useEffect(() => {
    saveAnnotations(model.slug, annotations)
  }, [model.slug, annotations])

  useEffect(() => {
    if (pendingPoint) labelRef.current?.focus()
  }, [pendingPoint])

  const selected = annotations.find((a) => a.id === selectedId) ?? null

  const handleAnnotate = useCallback((point: THREE.Vector3) => {
    setPendingPoint(point)
    setSelectedId(null)
    setDraft('')
  }, [])

  const commitAnnotation = (e: FormEvent) => {
    e.preventDefault()
    if (!pendingPoint) return
    const label = draft.trim() || 'Note'
    const next: ModelAnnotation = {
      id: crypto.randomUUID(),
      x: pendingPoint.x,
      y: pendingPoint.y,
      z: pendingPoint.z,
      label,
      createdAt: Date.now(),
    }
    setAnnotations((prev) => [...prev, next])
    setSelectedId(next.id)
    setPendingPoint(null)
    setDraft('')
  }

  const updateSelectedLabel = (label: string) => {
    if (!selectedId) return
    setAnnotations((prev) => prev.map((a) => (a.id === selectedId ? { ...a, label } : a)))
  }

  const removeSelected = () => {
    if (!selectedId) return
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId))
    setSelectedId(null)
  }

  const wipeAll = () => {
    clearAnnotations(model.slug)
    setAnnotations([])
    setSelectedId(null)
    setPendingPoint(null)
  }

  const applyView = (next: ViewMode) => {
    setView(next)
    setFrameKey((n) => n + 1)
  }

  return (
    <div className="relative grid min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[1fr_20rem]">
      <div className="relative min-h-[55svh] bg-ink lg:min-h-0">
        <LoadingOverlay />
        <Canvas
          key={model.slug}
          shadows
          camera={{ fov: 60, near: 0.05, far: 2000, position: [8, 4, 12] }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.1
          }}
        >
          <color attach="background" args={['#1a1614']} />
          <ambientLight intensity={view === 'interior' ? 0.85 : 0.45} />
          <directionalLight
            castShadow
            position={view === 'interior' ? [2, 6, 1] : [8, 12, 6]}
            intensity={view === 'interior' ? 0.95 : 1.35}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[0, 2, 0]} intensity={view === 'interior' ? 0.55 : 0} distance={40} />
          <hemisphereLight args={['#d8e0ea', '#3a2e28', view === 'interior' ? 0.6 : 0.35]} />
          <SceneErrorBoundary fallback={null} onError={() => setLoadFailed(true)}>
            <Suspense fallback={null}>
              <ReviewModelMesh
                url={model.file}
                annotateMode={annotateMode}
                onAnnotate={handleAnnotate}
                interiorPass={view === 'interior'}
                view={view}
                controlsRef={controlsRef}
                frameKey={frameKey}
              />
              <Environment preset={view === 'interior' ? 'apartment' : 'city'} />
              {annotations.map((a) => (
                <AnnotationMarker
                  key={a.id}
                  annotation={a}
                  selected={a.id === selectedId}
                  onSelect={() => {
                    setSelectedId(a.id)
                    setPendingPoint(null)
                  }}
                />
              ))}
            </Suspense>
          </SceneErrorBoundary>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI * 0.95}
          />
        </Canvas>

        {loadFailed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/80 text-sm text-cream/70">
            Couldn’t load this model.
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="pointer-events-auto rounded border border-line bg-ink/75 px-3 py-2 text-xs text-cream/70 backdrop-blur-sm">
            {view === 'interior'
              ? 'Standing inside the room — drag to look around'
              : annotateMode
                ? 'Click the model to drop a pin'
                : 'Orbit / zoom — annotate mode off'}
          </div>
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyView('interior')}
              className={`min-h-10 px-3 text-xs ${view === 'interior' ? 'bg-terracotta text-parchment' : 'border border-line bg-ink/75 text-cream'}`}
            >
              Interior
            </button>
            <button
              type="button"
              onClick={() => applyView('exterior')}
              className={`min-h-10 px-3 text-xs ${view === 'exterior' ? 'bg-terracotta text-parchment' : 'border border-line bg-ink/75 text-cream'}`}
            >
              Exterior
            </button>
            <button
              type="button"
              onClick={() => setFrameKey((n) => n + 1)}
              className="min-h-10 border border-line bg-ink/75 px-3 text-xs text-cream"
            >
              Reset angle
            </button>
            <button
              type="button"
              onClick={() => setAnnotateMode((v) => !v)}
              className={`min-h-10 px-3 text-xs ${annotateMode ? 'bg-terracotta text-parchment' : 'border border-line bg-ink/75 text-cream'}`}
            >
              {annotateMode ? 'Annotating' : 'Orbit only'}
            </button>
          </div>
        </div>

        {pendingPoint ? (
          <form
            onSubmit={commitAnnotation}
            className="absolute bottom-4 left-4 right-4 z-10 flex max-w-md flex-col gap-2 rounded border border-line bg-ink/90 p-3 backdrop-blur-sm sm:left-4 sm:right-auto"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-gold">New pin</p>
            <input
              ref={labelRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What should we note here?"
              className="min-h-10 border border-line bg-obsidian px-3 text-sm text-cream outline-none focus:border-terracotta"
            />
            <div className="flex gap-2">
              <button type="submit" className="min-h-10 flex-1 bg-terracotta px-3 text-xs text-parchment">
                Save pin
              </button>
              <button
                type="button"
                onClick={() => setPendingPoint(null)}
                className="min-h-10 border border-line px-3 text-xs text-cream/70"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <aside className="flex flex-col border-t border-line bg-obsidian lg:border-t-0 lg:border-l">
        <div className="border-b border-line px-4 py-4">
          <p className="eyebrow text-gold">Review</p>
          <h1 className="display mt-2 text-display-sm text-cream">{model.title}</h1>
          <p className="mt-2 text-xs text-cream/55">{model.note}</p>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 text-xs text-cream/50">
          <span>
            {annotations.length} pin{annotations.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={wipeAll}
            disabled={annotations.length === 0}
            className="text-cream/45 underline-offset-2 hover:text-cream disabled:opacity-30"
          >
            Clear all
          </button>
        </div>

        <ul className="flex-1 space-y-1 overflow-y-auto p-3">
          {annotations.length === 0 ? (
            <li className="px-1 py-6 text-center text-xs text-cream/40">No pins yet — click the model.</li>
          ) : (
            annotations.map((a, i) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(a.id)
                    setPendingPoint(null)
                  }}
                  className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                    a.id === selectedId ? 'bg-terracotta/20 text-cream' : 'text-cream/70 hover:bg-line/40 hover:text-cream'
                  }`}
                >
                  <span className="mr-2 text-[0.65rem] text-gold">{i + 1}</span>
                  {a.label || 'Untitled'}
                </button>
              </li>
            ))
          )}
        </ul>

        {selected ? (
          <div className="space-y-3 border-t border-line p-4">
            <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-gold">
              Selected pin
              <input
                value={selected.label}
                onChange={(e) => updateSelectedLabel(e.target.value)}
                className="mt-2 min-h-10 w-full border border-line bg-ink px-3 text-sm normal-case tracking-normal text-cream outline-none focus:border-terracotta"
              />
            </label>
            <button
              type="button"
              onClick={removeSelected}
              className="min-h-10 w-full border border-line text-xs text-cream/60 hover:text-cream"
            >
              Delete pin
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}
