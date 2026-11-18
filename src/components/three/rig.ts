import * as THREE from 'three'

/**
 * Light-emitting materials and shader uniforms that the lighting system animates.
 * Created once per scene and shared by the geometry that displays them.
 */
export interface SceneRig {
  /** Current interior light levels (0–1), written by <Lighting> every frame and read by light fixtures. */
  levels: { lamp: number; fire: number }
  bulb: THREE.MeshStandardMaterial
  cove: THREE.MeshStandardMaterial
  pendant: THREE.MeshStandardMaterial
  pool: THREE.MeshStandardMaterial
  sea: THREE.MeshStandardMaterial
  hills: THREE.MeshBasicMaterial
  sky: THREE.ShaderMaterial
  fire: THREE.ShaderMaterial
}

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform float uGlowStrength;
  uniform vec3 uSunDir;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -0.2, 1.0);
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
    float sun = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
    col += uGlow * uGlowStrength * (pow(sun, 6.0) * 0.6 + pow(sun, 60.0) * 0.8) * (1.0 - smoothstep(0.0, 0.5, h));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const fireVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Stylised gas-fire ribbon: layered sine noise rising from a bright base. */
const fireFragment = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i.x + i.y * 57.0), b = hash(i.x + 1.0 + i.y * 57.0);
    float c = hash(i.x + (i.y + 1.0) * 57.0), d = hash(i.x + 1.0 + (i.y + 1.0) * 57.0);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  void main() {
    vec2 uv = vUv;
    float n = noise(vec2(uv.x * 14.0, uv.y * 3.0 - uTime * 2.4)) * 0.6 + noise(vec2(uv.x * 30.0, uv.y * 6.0 - uTime * 3.6)) * 0.4;
    float flame = smoothstep(0.95, 0.0, uv.y + n * 0.55 - 0.15);
    float edge = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x);
    flame *= edge;
    vec3 col = mix(vec3(1.0, 0.32, 0.06), vec3(1.0, 0.78, 0.42), flame * flame);
    gl_FragColor = vec4(col * flame * uIntensity * 2.2, flame * uIntensity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function createRig(): SceneRig {
  const emissive = (hex: string) =>
    new THREE.MeshStandardMaterial({ color: '#1a1714', emissive: new THREE.Color(hex), emissiveIntensity: 0, roughness: 0.6 })

  return {
    levels: { lamp: 0, fire: 0 },
    bulb: emissive('#ffd29a'),
    cove: emissive('#ffcf96'),
    pendant: emissive('#ffd7a4'),
    pool: new THREE.MeshStandardMaterial({ color: '#1c3238', emissive: new THREE.Color('#2a6f78'), emissiveIntensity: 0, roughness: 0.08, metalness: 0.2 }),
    sea: new THREE.MeshStandardMaterial({ color: '#3a3540', roughness: 0.55, metalness: 0.1, envMapIntensity: 0.25 }),
    hills: new THREE.MeshBasicMaterial({ color: '#2a2a30' }),
    sky: new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uGlow: { value: new THREE.Color() },
        uGlowStrength: { value: 1 },
        uSunDir: { value: new THREE.Vector3(0, 0.2, -1) },
      },
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
    }),
    fire: new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 } },
      vertexShader: fireVertex,
      fragmentShader: fireFragment,
    }),
  }
}

export function disposeRig(rig: SceneRig) {
  const { levels: _levels, ...materials } = rig
  void _levels
  Object.values(materials).forEach((m) => m.dispose())
}
