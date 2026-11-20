import { Suspense, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { tierSettings, type QualityTier } from '../../lib/device'

interface SceneCanvasProps {
  tier: QualityTier
  /** Pauses the render loop when false (e.g. while scrolled out of view). */
  active: boolean
  onReady?: () => void
  className?: string
  /** When false, page scroll wins over canvas hit-testing (hero tour). Default true. */
  pointerEvents?: boolean
  /**
   * Hero tour: freeze DPR and skip PerformanceMonitor so the canvas isn’t
   * resized mid-scroll (that hitch reads as frame-by-frame sticking).
   */
  stabilizeDpr?: boolean
  /** Cap device pixel ratio (hero uses a lower cap for steadier FPS). */
  dprCap?: number
  /** Disable shadow maps for cheaper scroll-linked scenes. */
  shadows?: boolean
  children: ReactNode
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current > 2) {
      done.current = true
      onReady?.()
    }
  })
  return null
}

function initialDpr(tier: QualityTier, dprCap?: number) {
  const [min, max] = tierSettings[tier].dpr
  const device = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : max
  const capped = Math.min(max, dprCap ?? max, Math.max(min, device))
  return capped
}

export function SceneCanvas({
  tier,
  active,
  onReady,
  className,
  pointerEvents = true,
  stabilizeDpr = false,
  dprCap,
  shadows,
  children,
}: SceneCanvasProps) {
  const settings = tierSettings[tier]
  const useShadows = shadows ?? settings.shadows
  const [dpr, setDpr] = useState(() => initialDpr(tier, dprCap))

  return (
    <Canvas
      className={className}
      style={{
        pointerEvents: pointerEvents ? 'auto' : 'none',
        touchAction: 'pan-y',
      }}
      shadows={useShadows ? { type: THREE.PCFSoftShadowMap } : false}
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 40, near: 0.1, far: 800, position: [4, 1.6, 4.5] }}
      gl={{
        antialias: !stabilizeDpr,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.domElement.style.touchAction = 'pan-y'
      }}
    >
      {!stabilizeDpr && (
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(settings.dpr[0], Math.round((d - 0.15) * 100) / 100))}
          onIncline={() => setDpr((d) => Math.min(dprCap ?? settings.dpr[1], Math.round((d + 0.15) * 100) / 100))}
        />
      )}
      <Suspense fallback={null}>
        {children}
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
