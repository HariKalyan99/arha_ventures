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
  children: ReactNode
}

/** Calls onReady once a couple of frames have rendered, so the canvas can fade in without a blank flash. */
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

export function SceneCanvas({ tier, active, onReady, className, children }: SceneCanvasProps) {
  const settings = tierSettings[tier]
  const [dpr, setDpr] = useState(settings.dpr[1])

  return (
    <Canvas
      className={className}
      shadows={settings.shadows ? { type: THREE.PCFShadowMap } : false}
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 40, near: 0.1, far: 800, position: [4, 1.6, 4.5] }}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
      }}
    >
      {/* Drops resolution on devices that can't hold a steady frame rate */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(settings.dpr[0], d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(settings.dpr[1], d + 0.25))}
      />
      <Suspense fallback={null}>
        {children}
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
