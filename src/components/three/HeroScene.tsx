'use client'

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox, Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

type MouseRef = React.MutableRefObject<{ x: number; y: number; clicked: boolean }>

const CONTROLLER_MODEL_URL = '/models/controller.glb'

// Intro animation timing (seconds)
// The outside-in fade is deliberately slow: particles appear at the edges
// immediately, and the center fills in gradually. That gentle convergence
// gives the controller GLB time to download/parse/compile before it needs to
// appear at the center, so the model is ready by the time the center fills.
const INTRO_DURATION = 3.5 // particles travel edge→center over this window
const FADE_WINDOW = 0.5 // how long each particle takes to go 0→full opacity
const CONTROLLER_START = 3.0 // controller begins fading in
const CONTROLLER_FADE = 1.2 // controller fade-in duration

// ── Particle reveal patch ─────────────────────────────────────────────────────
//
// Each particle gets a pre-baked aRevealDelay attribute: outer particles get 0,
// inner particles get larger delays. Rather than hand-roll a points shader
// (which loses sizeAttenuation / tonemapping / opacity handling), we patch the
// stock PointsMaterial via onBeforeCompile and only gate the per-particle alpha
// by smoothstep(uTime - aRevealDelay). This produces the outside-in reveal
// while keeping all of PointsMaterial's correct rendering.
//
// Returns a stable uTime uniform ref + the onBeforeCompile patch + a unique
// program-cache key. The unique key is essential: without it, two PointsMaterials
// whose patch source stringifies identically would share one cached GL program,
// so onBeforeCompile (and its uTime wiring) would run for only the first — the
// second would never bind uTime and its particles would stay invisible.
// Drive the reveal by mutating uniforms.current.uTime.value each frame.
let revealKeyCounter = 0
function useReveal() {
  const uniforms = useRef({ uTime: { value: 0 } })
  const cacheKey = useMemo(() => `reveal-${revealKeyCounter++}`, [])

  const onBeforeCompile = useMemo(
    () => (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uTime = uniforms.current.uTime
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
           attribute float aRevealDelay;
           uniform float uTime;
           varying float vReveal;`
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vReveal = smoothstep(0.0, ${FADE_WINDOW.toFixed(2)}, max(0.0, uTime - aRevealDelay));`
        )
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying float vReveal;`)
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>\ndiffuseColor.a *= vReveal;`
        )
    },
    []
  )

  return { uniforms, onBeforeCompile, cacheKey }
}

// ── Cosmic dust nebula ────────────────────────────────────────────────────────
function CosmicDust({ count = 2000, mouse }: { count?: number; mouse: MouseRef }) {
  const ref = useRef<THREE.Points>(null!)
  const { uniforms: revealUniforms, onBeforeCompile, cacheKey } = useReveal()

  const [positions, colors, revealDelays] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const delays = new Float32Array(count)
    const palette = ['#06b6d4', '#6366f1', '#22d3ee', '#818cf8', '#818cf8', '#67e8f9'].map(
      (c) => new THREE.Color(c)
    )
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.5) * 25
      pos[i3] = Math.cos(theta) * r
      pos[i3 + 1] = (Math.random() - 0.5) * 8 + Math.sin(theta * 3) * 1.5
      pos[i3 + 2] = Math.sin(theta) * r - 10
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b
      // Outer ring (r≈25) → delay≈0; center (r≈0) → delay≈INTRO_DURATION
      delays[i] = (1 - r / 25) * INTRO_DURATION
    }
    return [pos, col, delays]
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.015 + mouse.current.x * 0.08
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.05 + mouse.current.y * 0.04
    revealUniforms.current.uTime.value = t
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute
          attach="attributes-aRevealDelay"
          count={count}
          array={revealDelays}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        onBeforeCompile={onBeforeCompile}
        customProgramCacheKey={() => cacheKey}
      />
    </points>
  )
}

// ── Mouse-reactive particle swarm (attract + click repel) ────────────────────
function ParticleSwarm({ count = 800, mouse }: { count?: number; mouse: MouseRef }) {
  const ref = useRef<THREE.Points>(null!)
  const { uniforms: revealUniforms, onBeforeCompile, cacheKey } = useReveal()

  const [positions, velocities, colors, homePositions, revealDelays] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const home = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const delays = new Float32Array(count)
    const cyan = new THREE.Color('#06b6d4')
    const indigo = new THREE.Color('#6366f1')
    const white = new THREE.Color('#ffffff')
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 6 // radius 2–8
      pos[i3] = home[i3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i3 + 1] = home[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i3 + 2] = home[i3 + 2] = r * Math.cos(phi) - 2
      vel[i3] = (Math.random() - 0.5) * 0.02
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01
      const c = Math.random() > 0.6 ? white : Math.random() > 0.5 ? cyan : indigo
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b
      // Outer swarm (r=8) → delay≈0.5s; inner (r=2) → delay≈2.9s
      delays[i] = (1 - (r - 2) / 6) * 2.4 + 0.5
    }
    return [pos, vel, col, home, delays]
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const posArray = ref.current.geometry.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime
    const mx = mouse.current.x * 8
    const my = mouse.current.y * 5
    const clicked = mouse.current.clicked

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      posArray[i3] += velocities[i3] + Math.sin(t * 0.3 + i * 0.01) * 0.003
      posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(t * 0.2 + i * 0.01) * 0.003
      posArray[i3 + 2] += velocities[i3 + 2]

      const dx = mx - posArray[i3]
      const dy = my - posArray[i3 + 1]
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (clicked && dist < 8) {
        const repelForce = (Math.max(0, 8 - dist) / 8) * 0.15
        posArray[i3] -= dx * repelForce
        posArray[i3 + 1] -= dy * repelForce
        posArray[i3 + 2] += (Math.random() - 0.5) * repelForce * 2
      } else if (dist < 6) {
        const force = ((6 - dist) / 6) * 0.004
        posArray[i3] += dx * force
        posArray[i3 + 1] += dy * force
      }

      posArray[i3] += (homePositions[i3] - posArray[i3]) * 0.001
      posArray[i3 + 1] += (homePositions[i3 + 1] - posArray[i3 + 1]) * 0.001
      posArray[i3 + 2] += (homePositions[i3 + 2] - posArray[i3 + 2]) * 0.001

      const r = Math.sqrt(posArray[i3] ** 2 + posArray[i3 + 1] ** 2 + (posArray[i3 + 2] + 2) ** 2)
      if (r > 14) {
        posArray[i3] *= 0.98
        posArray[i3 + 1] *= 0.98
        posArray[i3 + 2] = posArray[i3 + 2] * 0.98 - 0.02
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    revealUniforms.current.uTime.value = t
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute
          attach="attributes-aRevealDelay"
          count={count}
          array={revealDelays}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        onBeforeCompile={onBeforeCompile}
        customProgramCacheKey={() => cacheKey}
      />
    </points>
  )
}

// ── Helper: unproject mouse to world position on a z-plane ───────────────────
function useMouseWorld(mouse: MouseRef, zPlane = 1) {
  const { camera } = useThree()
  const worldPos = useRef(new THREE.Vector3())
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), -zPlane))

  const update = () => {
    raycaster.current.setFromCamera(new THREE.Vector2(mouse.current.x, mouse.current.y), camera)
    raycaster.current.ray.intersectPlane(plane.current, worldPos.current)
    return worldPos.current
  }

  return update
}

// ── Click-burst particles ────────────────────────────────────────────────────
function ClickBursts({ mouse }: { mouse: MouseRef }) {
  const ref = useRef<THREE.Points>(null!)
  const maxBursts = 200
  const lifetimes = useRef(new Float32Array(maxBursts))
  const burstVelocities = useRef(new Float32Array(maxBursts * 3))
  const nextIdx = useRef(0)
  const wasClicked = useRef(false)
  const getWorldPos = useMouseWorld(mouse, 1)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(maxBursts * 3).fill(999)
    const col = new Float32Array(maxBursts * 3)
    const palette = [
      new THREE.Color('#06b6d4'),
      new THREE.Color('#6366f1'),
      new THREE.Color('#22d3ee'),
      new THREE.Color('#fbbf24'),
      new THREE.Color('#ffffff'),
    ]
    for (let i = 0; i < maxBursts; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const posArray = ref.current.geometry.attributes.position.array as Float32Array

    if (mouse.current.clicked && !wasClicked.current) {
      const wp = getWorldPos()
      for (let j = 0; j < 30; j++) {
        const idx = (nextIdx.current + j) % maxBursts
        const i3 = idx * 3
        posArray[i3] = wp.x
        posArray[i3 + 1] = wp.y
        posArray[i3 + 2] = wp.z
        const angle = Math.random() * Math.PI * 2
        const speed = 1.5 + Math.random() * 4
        burstVelocities.current[i3] = Math.cos(angle) * speed
        burstVelocities.current[i3 + 1] = Math.sin(angle) * speed
        burstVelocities.current[i3 + 2] = (Math.random() - 0.5) * 2
        lifetimes.current[idx] = 1.5
      }
      nextIdx.current = (nextIdx.current + 30) % maxBursts
    }
    wasClicked.current = mouse.current.clicked

    for (let i = 0; i < maxBursts; i++) {
      if (lifetimes.current[i] <= 0) continue
      lifetimes.current[i] -= delta
      const i3 = i * 3
      const decay = Math.max(0, lifetimes.current[i] / 1.5)
      posArray[i3] += burstVelocities.current[i3] * delta * decay
      posArray[i3 + 1] +=
        (burstVelocities.current[i3 + 1] - 3 * (1.5 - lifetimes.current[i])) * delta * decay
      posArray[i3 + 2] += burstVelocities.current[i3 + 2] * delta * decay
      if (lifetimes.current[i] <= 0) {
        posArray[i3] = posArray[i3 + 1] = posArray[i3 + 2] = 999
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    const avgLife =
      Array.from(lifetimes.current).reduce((a, b) => a + Math.max(0, b), 0) / maxBursts
    ;(ref.current.material as THREE.PointsMaterial).opacity = Math.min(1, avgLife * 10 + 0.3)
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxBursts}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-color" count={maxBursts} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Cursor trail ─────────────────────────────────────────────────────────────
function CursorTrail({ mouse }: { mouse: MouseRef }) {
  const ref = useRef<THREE.Points>(null!)
  const trailLength = 60
  const headIdx = useRef(0)
  const getWorldPos = useMouseWorld(mouse, 1)

  const [positions] = useMemo(() => {
    const pos = new Float32Array(trailLength * 3).fill(999)
    return [pos]
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const posArray = ref.current.geometry.attributes.position.array as Float32Array

    const wp = getWorldPos()
    const idx = headIdx.current % trailLength
    const i3 = idx * 3
    posArray[i3] = wp.x
    posArray[i3 + 1] = wp.y
    posArray[i3 + 2] = wp.z
    headIdx.current++

    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={trailLength}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#06b6d4"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Hero controller ──────────────────────────────────────────────────────────
interface ControllerProps {
  scale?: number
  position?: [number, number, number]
  mouse: MouseRef
}

function ControllerModel({ scale = 1, position = [0, 0, 0], mouse }: ControllerProps) {
  const { scene: gltfScene } = useGLTF(CONTROLLER_MODEL_URL)
  const { gl, camera, scene } = useThree()
  const groupRef = useRef<THREE.Group>(null!)
  // Stay out of the render list until shaders/textures are compiled+uploaded,
  // so the reveal frame doesn't synchronously stall (which jitters the
  // particle animation). See the compileAsync effect below.
  const [compiled, setCompiled] = useState(false)

  const [cloned, allMaterials] = useMemo(() => {
    const clone = gltfScene.clone(true)

    // Normalise size + orientation (same as before)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const norm = 1 / maxDim
    const center = box.getCenter(new THREE.Vector3())
    clone.position.copy(center.multiplyScalar(-norm))
    clone.scale.setScalar(norm)
    clone.rotation.x = Math.PI / 2
    clone.rotation.y = Math.PI

    // Clone every material so we can animate opacity independently
    const mats: THREE.Material[] = []
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const src = child.material
      if (Array.isArray(src)) {
        child.material = src.map((m) => {
          const mc = m.clone()
          mc.transparent = true
          mc.opacity = 0
          mats.push(mc)
          return mc
        })
      } else if (src) {
        const mc = src.clone()
        mc.transparent = true
        mc.opacity = 0
        child.material = mc
        mats.push(mc)
      }
    })

    return [clone, mats]
  }, [gltfScene])

  // Warm up the controller's GPU programs + textures off the critical path.
  // compileAsync uses KHR_parallel_shader_compile when available, so the heavy
  // work doesn't block the render loop. We keep the group invisible until it
  // resolves; the first time it actually renders, the program is already
  // cached, so there's no synchronous compile stall on the reveal frame.
  useEffect(() => {
    let cancelled = false
    const done = () => {
      if (!cancelled) setCompiled(true)
    }
    const maybePromise = gl.compileAsync?.(cloned, camera, scene)
    if (maybePromise && typeof maybePromise.then === 'function') {
      maybePromise.then(done, done)
    } else {
      done() // compileAsync unavailable — fall back to showing immediately
    }
    return () => {
      cancelled = true
    }
  }, [gl, camera, scene, cloned])

  useFrame((state) => {
    if (!compiled) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3 + mouse.current.x * 0.2
    groupRef.current.rotation.x = mouse.current.y * 0.15
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05 + mouse.current.x * 0.05
    const pulse = 1 + Math.sin(t * 1.5) * 0.02
    groupRef.current.scale.setScalar(scale * pulse)
    groupRef.current.position.x = position[0] + mouse.current.x * 0.3
    groupRef.current.position.y = position[1] + mouse.current.y * 0.2

    // Fade in after particles converge
    const opacity = THREE.MathUtils.clamp((t - CONTROLLER_START) / CONTROLLER_FADE, 0, 1)
    if (opacity < 1) {
      for (const m of allMaterials) {
        ;(m as THREE.MeshStandardMaterial).opacity = opacity
      }
    }
  })

  return (
    <group ref={groupRef} position={position} dispose={null} visible={compiled}>
      <primitive object={cloned} />
    </group>
  )
}

class ControllerErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[HeroScene] Falling back from ${CONTROLLER_MODEL_URL}:`, err)
    }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function ControllerMesh(props: ControllerProps) {
  return (
    // Render nothing while the GLB streams in (no primitive flash). The
    // primitive only appears if the model genuinely fails to load, so the
    // page still never ends up empty.
    <ControllerErrorBoundary fallback={<ControllerFallback {...props} />}>
      <Suspense fallback={null}>
        <ControllerModel {...props} />
      </Suspense>
    </ControllerErrorBoundary>
  )
}

// Primitive fallback — hidden until controller reveal time, then pops in.
// Only shown briefly while the GLB streams on first load (cached after that).
function ControllerFallback({
  scale = 1,
  position = [0, 0, 0] as [number, number, number],
  mouse,
}: ControllerProps) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    groupRef.current.visible = t >= CONTROLLER_START
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3 + mouse.current.x * 0.2
    groupRef.current.rotation.x = mouse.current.y * 0.15
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05 + mouse.current.x * 0.05
    const pulse = 1 + Math.sin(t * 1.5) * 0.02
    groupRef.current.scale.setScalar(scale * pulse)
    groupRef.current.position.x = position[0] + mouse.current.x * 0.3
    groupRef.current.position.y = position[1] + mouse.current.y * 0.2
  })

  const faceZ = 0.21

  return (
    <group ref={groupRef} position={position} visible={false}>
      <RoundedBox args={[1.5, 0.78, 0.4]} radius={0.18} smoothness={4}>
        <meshStandardMaterial
          color="#0e7490"
          emissive="#6366f1"
          emissiveIntensity={0.25}
          roughness={0.35}
          metalness={0.6}
        />
      </RoundedBox>

      <mesh position={[0, 0, faceZ - 0.005]}>
        <planeGeometry args={[1.35, 0.62]} />
        <meshStandardMaterial
          color="#155e75"
          emissive="#06b6d4"
          emissiveIntensity={0.12}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      <group position={[-0.78, -0.22, 0]} rotation={[0, 0, -0.45]}>
        <RoundedBox args={[0.32, 0.7, 0.42]} radius={0.14} smoothness={4}>
          <meshStandardMaterial
            color="#0e7490"
            emissive="#6366f1"
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.55}
          />
        </RoundedBox>
      </group>
      <group position={[0.78, -0.22, 0]} rotation={[0, 0, 0.45]}>
        <RoundedBox args={[0.32, 0.7, 0.42]} radius={0.14} smoothness={4}>
          <meshStandardMaterial
            color="#0e7490"
            emissive="#6366f1"
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.55}
          />
        </RoundedBox>
      </group>

      <group position={[-0.5, 0.42, 0]} rotation={[0, 0, -0.2]}>
        <RoundedBox args={[0.32, 0.12, 0.22]} radius={0.05} smoothness={3}>
          <meshStandardMaterial
            color="#155e75"
            emissive="#06b6d4"
            emissiveIntensity={0.15}
            roughness={0.4}
            metalness={0.5}
          />
        </RoundedBox>
      </group>
      <group position={[0.5, 0.42, 0]} rotation={[0, 0, 0.2]}>
        <RoundedBox args={[0.32, 0.12, 0.22]} radius={0.05} smoothness={3}>
          <meshStandardMaterial
            color="#155e75"
            emissive="#06b6d4"
            emissiveIntensity={0.15}
            roughness={0.4}
            metalness={0.5}
          />
        </RoundedBox>
      </group>

      <mesh position={[-0.45, 0.08, faceZ]}>
        <boxGeometry args={[0.26, 0.08, 0.06]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[-0.45, 0.08, faceZ]}>
        <boxGeometry args={[0.08, 0.26, 0.06]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
          roughness={0.25}
        />
      </mesh>

      {(
        [
          [0.45, 0.2, '#fbbf24'],
          [0.32, 0.08, '#22d3ee'],
          [0.58, 0.08, '#f87171'],
          [0.45, -0.04, '#86efac'],
        ] as Array<[number, number, string]>
      ).map(([x, y, color], i) => (
        <mesh key={i} position={[x, y, faceZ + 0.01]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}

      {(
        [
          [-0.18, -0.16],
          [0.18, -0.16],
        ] as Array<[number, number]>
      ).map(([x, y], i) => (
        <group key={i} position={[x, y, faceZ]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
            <meshStandardMaterial color="#0c4a6e" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.06, 20]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#0ea5e9"
              emissiveIntensity={0.2}
              roughness={0.35}
              metalness={0.5}
            />
          </mesh>
        </group>
      ))}

      {(
        [
          [-0.09, 0.16],
          [0.09, 0.16],
        ] as Array<[number, number]>
      ).map(([x, y], i) => (
        <mesh key={i} position={[x, y, faceZ]}>
          <boxGeometry args={[0.07, 0.025, 0.03]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} />
        </mesh>
      ))}

      <mesh position={[0, -0.02, faceZ + 0.01]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#06b6d4"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

// ── Volumetric light rays ─────────────────────────────────────────────────────
function LightRays({ mouse }: { mouse: MouseRef }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.z = t * 0.03 + mouse.current.x * 0.15
    ref.current.rotation.x = mouse.current.y * 0.1
  })

  return (
    <group ref={ref} position={[0, 0, -5]}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} rotation={[0, 0, angle]}>
            <planeGeometry args={[0.15, 20]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#06b6d4' : '#6366f1'}
              transparent
              opacity={0.015}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Orbiting gems ─────────────────────────────────────────────────────────────
function OrbitingGem({
  radius,
  speed,
  offset,
  size,
  color,
  mouse,
}: {
  radius: number
  speed: number
  offset: number
  size: number
  color: string
  mouse: MouseRef
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.MeshStandardMaterial>(null!)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset
    const px = Math.cos(t) * radius
    const py = Math.sin(t * 0.7) * radius * 0.4
    ref.current.position.set(px, py, Math.sin(t) * radius - 2)
    ref.current.rotation.y = t
    ref.current.rotation.z = Math.sin(t * 2) * 0.3

    const mx = mouse.current.x * 8
    const my = mouse.current.y * 5
    const dx = mx - px
    const dy = my - py
    const dist = Math.sqrt(dx * dx + dy * dy)
    const proximity = Math.max(0, 1 - dist / 4)
    const targetScale = size * (1 + proximity * 0.8)
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    if (matRef.current) matRef.current.emissiveIntensity = 0.5 + proximity * 2
  })

  return (
    <mesh ref={ref} geometry={geometry} scale={size}>
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

// ── Energy rings ──────────────────────────────────────────────────────────────
function EnergyRings({ mouse }: { mouse: MouseRef }) {
  const refs = useRef<THREE.Mesh[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.rotation.x = t * (0.1 + i * 0.05) + i * 1.2 + mouse.current.y * 0.3
      mesh.rotation.y = t * (0.08 + i * 0.03) + mouse.current.x * 0.3
      const pulse = 1 + Math.sin(t * 2 + i * 2) * 0.05
      mesh.scale.setScalar(pulse)
    })
  })

  const rings = [
    { radius: 3.0, color: '#06b6d4', opacity: 0.12, tube: 0.012 },
    { radius: 4.0, color: '#6366f1', opacity: 0.08, tube: 0.008 },
    { radius: 5.5, color: '#22d3ee', opacity: 0.05, tube: 0.006 },
    { radius: 2.0, color: '#818cf8', opacity: 0.15, tube: 0.015 },
  ]

  return (
    <group position={[0, 0, -2]}>
      {rings.map((ring, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el
          }}
        >
          <torusGeometry args={[ring.radius, ring.tube, 32, 128]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Camera: scroll dolly + mouse parallax ────────────────────────────────────
function CameraController({
  scrollY,
  mouse,
}: {
  scrollY: React.MutableRefObject<number>
  mouse: MouseRef
}) {
  const { camera } = useThree()
  const smoothMouse = useRef({ x: 0, y: 0 })

  useFrame(() => {
    const scroll = scrollY.current
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.05
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.05

    camera.position.x = smoothMouse.current.x * 1.2
    camera.position.y = smoothMouse.current.y * 0.8 + scroll * -1.5
    camera.position.z = 6 + scroll * 4
    camera.lookAt(smoothMouse.current.x * 0.3, smoothMouse.current.y * 0.2 + scroll * -0.8, -2)
  })

  return null
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ scrollY, mouse }: { scrollY: React.MutableRefObject<number>; mouse: MouseRef }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[3, 3, 4]} intensity={2} color="#06b6d4" distance={20} />
      <pointLight position={[-4, -2, 2]} intensity={1} color="#6366f1" distance={15} />
      <pointLight position={[0, 5, -3]} intensity={0.5} color="#22d3ee" distance={15} />
      <pointLight position={[0, -3, 0]} intensity={0.8} color="#818cf8" distance={12} />

      <CameraController scrollY={scrollY} mouse={mouse} />
      <Stars radius={50} depth={80} count={3000} factor={3} saturation={0.5} fade speed={0.5} />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1.5}>
        <ControllerMesh scale={6} position={[0, 0.3, -1]} mouse={mouse} />
      </Float>

      <OrbitingGem radius={4} speed={0.3} offset={0} size={0.3} color="#22d3ee" mouse={mouse} />
      <OrbitingGem radius={5.5} speed={-0.2} offset={2} size={0.22} color="#6366f1" mouse={mouse} />
      <OrbitingGem radius={3.2} speed={0.4} offset={4} size={0.18} color="#06b6d4" mouse={mouse} />
      <OrbitingGem radius={6.5} speed={0.15} offset={1} size={0.25} color="#818cf8" mouse={mouse} />
      <OrbitingGem
        radius={4.8}
        speed={-0.25}
        offset={3}
        size={0.15}
        color="#67e8f9"
        mouse={mouse}
      />
      <OrbitingGem radius={7} speed={0.1} offset={5} size={0.2} color="#818cf8" mouse={mouse} />

      <EnergyRings mouse={mouse} />
      <LightRays mouse={mouse} />
      <CosmicDust count={2500} mouse={mouse} />
      <ParticleSwarm count={800} mouse={mouse} />
      <ClickBursts mouse={mouse} />
      <CursorTrail mouse={mouse} />

      <fog attach="fog" args={['#0a0a1a', 8, 35]} />
    </>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function HeroScene() {
  const mouseRef = useRef({ x: 0, y: 0, clicked: false })
  const scrollRef = useRef(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onDown = () => {
      mouseRef.current.clicked = true
    }
    const onUp = () => {
      mouseRef.current.clicked = false
    }
    const onScroll = () => {
      scrollRef.current = Math.min(window.scrollY / window.innerHeight, 3)
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1
    }
    const onTouchStart = (e: TouchEvent) => {
      onTouchMove(e)
      mouseRef.current.clicked = true
    }
    const onTouchEnd = () => {
      mouseRef.current.clicked = false
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 -z-10 transition-opacity duration-1000 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 65, near: 0.1, far: 100 }}
        // Cap at 1.5 instead of 2: on retina this renders ~44% fewer pixels,
        // a big fill-rate win for all the additive-blended particles + fog.
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: '#0a0a1a' }}
        onCreated={() => {
          requestAnimationFrame(() => setReady(true))
        }}
      >
        <Scene scrollY={scrollRef} mouse={mouseRef} />
      </Canvas>
    </div>
  )
}

useGLTF.preload(CONTROLLER_MODEL_URL)
