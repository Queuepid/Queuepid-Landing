'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

type MouseRef = React.MutableRefObject<{ x: number; y: number }>

// ── Particles that hug the edges, avoiding center ────────────────────────────
function EdgeParticles({ count = 400, mouse }: { count?: number; mouse: MouseRef }) {
  const ref = useRef<THREE.Points>(null!)

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#06b6d4'),
      new THREE.Color('#6366f1'),
      new THREE.Color('#22d3ee'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#67e8f9'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      // Distribute around edges — avoid center rectangle
      let x: number, y: number
      do {
        x = (Math.random() - 0.5) * 22
        y = (Math.random() - 0.5) * 18
      } while (Math.abs(x) < 4 && Math.abs(y) < 5) // keep center clear

      pos[i3] = x
      pos[i3 + 1] = y
      pos[i3 + 2] = (Math.random() - 0.5) * 8 - 4

      vel[i3] = (Math.random() - 0.5) * 0.008
      vel[i3 + 1] = (Math.random() - 0.5) * 0.008
      vel[i3 + 2] = (Math.random() - 0.5) * 0.003

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b
    }
    return [pos, vel, col]
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const posArray = ref.current.geometry.attributes.position.array as Float32Array
    const mx = mouse.current.x * 6
    const my = mouse.current.y * 4

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      posArray[i3] += velocities[i3] + Math.sin(t * 0.2 + i * 0.05) * 0.003
      posArray[i3 + 1] += velocities[i3 + 1] + Math.cos(t * 0.15 + i * 0.04) * 0.003
      posArray[i3 + 2] += velocities[i3 + 2]

      // Mouse interaction
      const dx = mx - posArray[i3]
      const dy = my - posArray[i3 + 1]
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 5) {
        const force = ((5 - dist) / 5) * 0.002
        posArray[i3] += dx * force
        posArray[i3 + 1] += dy * force
      }

      // Push away from center (keep cards visible)
      if (Math.abs(posArray[i3]) < 3.5 && Math.abs(posArray[i3 + 1]) < 4.5) {
        posArray[i3] += posArray[i3] > 0 ? 0.01 : -0.01
        posArray[i3 + 1] += posArray[i3 + 1] > 0 ? 0.008 : -0.008
      }

      // Wrap
      if (Math.abs(posArray[i3]) > 12) posArray[i3] *= -0.95
      if (Math.abs(posArray[i3 + 1]) > 10) posArray[i3 + 1] *= -0.95
      if (Math.abs(posArray[i3 + 2]) > 6) posArray[i3 + 2] *= -0.9
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y = t * 0.005
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
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Orbiting gems that stay on edges (icosahedron — same shape used by the
// homepage HeroScene's OrbitingGem, post-pivot away from hearts) ──────────────
function EdgeGem({
  orbitRadius,
  speed,
  offset,
  size,
  color,
  yTilt,
}: {
  orbitRadius: number
  speed: number
  offset: number
  size: number
  color: string
  yTilt: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.MeshStandardMaterial>(null!)

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.5, 0), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset
    ref.current.position.x = Math.cos(t) * orbitRadius
    ref.current.position.y = Math.sin(t * 0.6) * orbitRadius * yTilt
    ref.current.position.z = Math.sin(t) * 3 - 4
    ref.current.rotation.y = t * 0.8
    ref.current.rotation.z = Math.sin(t * 1.5) * 0.3

    // Pulse glow
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3
    }
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
        opacity={0.7}
      />
    </mesh>
  )
}

// ── Nebula blobs on edges ────────────────────────────────────────────────────
function EdgeNebula({
  position,
  color,
  size,
  speed,
}: {
  position: [number, number, number]
  color: string
  size: number
  speed: number
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    ref.current.position.x = position[0] + Math.sin(t * 0.4) * 1.5
    ref.current.position.y = position[1] + Math.cos(t * 0.3) * 1
    ref.current.scale.setScalar(size + Math.sin(t * 0.8) * size * 0.15)
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Energy arcs on left/right edges ──────────────────────────────────────────
function EnergyArc({
  side,
  yOffset,
  color,
  speed,
}: {
  side: 'left' | 'right'
  yOffset: number
  color: string
  speed: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const x = side === 'left' ? -7 : 7

  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.z = t * speed
    ref.current.rotation.x = Math.sin(t * speed * 0.5) * 0.5
    ref.current.position.y = yOffset + Math.sin(t * 0.3) * 0.5
    const pulse = 1 + Math.sin(t * 2) * 0.1
    ref.current.scale.setScalar(pulse)
  })

  return (
    <mesh ref={ref} position={[x, yOffset, -3]}>
      <torusGeometry args={[2.5, 0.008, 16, 64, Math.PI * 0.8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Vertical light streaks on edges ──────────────────────────────────────────
function LightStreak({
  x,
  height,
  color,
  speed,
  delay,
}: {
  x: number
  height: number
  color: string
  speed: number
  delay: number
}) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + delay
    ref.current.position.y = Math.sin(t) * 2
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.02 + Math.sin(t * 2) * 0.01
  })

  return (
    <mesh ref={ref} position={[x, 0, -6]}>
      <planeGeometry args={[0.08, height]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.03}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// ── Connection lines between edge elements ───────────────────────────────────
function EdgeConnections() {
  const ref = useRef<THREE.LineSegments>(null!)

  const positions = useMemo(() => {
    const pts: number[] = []
    // Lines from left edge to right edge, arcing around center
    for (let i = 0; i < 12; i++) {
      const y = (Math.random() - 0.5) * 14
      const z = -3 - Math.random() * 4
      // Left point
      const lx = -6 - Math.random() * 4
      // Right point
      const rx = 6 + Math.random() * 4
      pts.push(lx, y + (Math.random() - 0.5) * 2, z)
      pts.push(rx, y + (Math.random() - 0.5) * 2, z - Math.random() * 2)
    }
    return new Float32Array(pts)
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.03) * 0.05
  })

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={24} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.025}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

// ── Camera parallax ──────────────────────────────────────────────────────────
function CameraFollow({ mouse }: { mouse: MouseRef }) {
  const { camera } = useThree()
  const smooth = useRef({ x: 0, y: 0 })

  useFrame(() => {
    smooth.current.x += (mouse.current.x * 0.6 - smooth.current.x) * 0.03
    smooth.current.y += (mouse.current.y * 0.4 - smooth.current.y) * 0.03
    camera.position.x = smooth.current.x
    camera.position.y = smooth.current.y
    camera.lookAt(0, 0, -3)
  })

  return null
}

// ── Scene ────────────────────────────────────────────────────────────────────
function Scene({ mouse }: { mouse: MouseRef }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[-8, 4, 2]} intensity={1.2} color="#06b6d4" distance={20} />
      <pointLight position={[8, -3, 2]} intensity={1} color="#6366f1" distance={18} />
      <pointLight position={[-7, -5, 1]} intensity={0.6} color="#818cf8" distance={15} />
      <pointLight position={[7, 5, 1]} intensity={0.6} color="#22d3ee" distance={15} />

      <CameraFollow mouse={mouse} />

      <Stars radius={50} depth={70} count={2000} factor={2.5} saturation={0.4} fade speed={0.3} />

      {/* Nebula blobs — all on edges */}
      <EdgeNebula position={[-8, 4, -8]} color="#06b6d4" size={4} speed={0.3} />
      <EdgeNebula position={[9, -3, -10]} color="#6366f1" size={5} speed={0.2} />
      <EdgeNebula position={[-7, -5, -7]} color="#818cf8" size={3.5} speed={0.25} />
      <EdgeNebula position={[8, 5, -9]} color="#22d3ee" size={4.5} speed={0.15} />
      <EdgeNebula position={[-5, 7, -11]} color="#818cf8" size={3} speed={0.28} />
      <EdgeNebula position={[6, -7, -8]} color="#06b6d4" size={3.5} speed={0.22} />

      {/* Orbiting hearts — large orbits stay on edges */}
      <EdgeGem orbitRadius={7} speed={0.2} offset={0} size={0.2} color="#06b6d4" yTilt={0.5} />
      <EdgeGem orbitRadius={8} speed={-0.15} offset={2} size={0.16} color="#6366f1" yTilt={0.4} />
      <EdgeGem orbitRadius={6.5} speed={0.25} offset={4} size={0.14} color="#22d3ee" yTilt={0.6} />
      <EdgeGem orbitRadius={9} speed={0.12} offset={1} size={0.18} color="#818cf8" yTilt={0.3} />
      <EdgeGem orbitRadius={7.5} speed={-0.18} offset={3} size={0.13} color="#67e8f9" yTilt={0.5} />
      <EdgeGem orbitRadius={8.5} speed={0.1} offset={5} size={0.15} color="#818cf8" yTilt={0.45} />
      <EdgeGem orbitRadius={6} speed={0.22} offset={2.5} size={0.12} color="#06b6d4" yTilt={0.55} />
      <EdgeGem
        orbitRadius={9.5}
        speed={-0.08}
        offset={4.5}
        size={0.17}
        color="#6366f1"
        yTilt={0.35}
      />

      {/* Energy arcs on left and right */}
      <EnergyArc side="left" yOffset={2} color="#06b6d4" speed={0.15} />
      <EnergyArc side="left" yOffset={-3} color="#6366f1" speed={-0.1} />
      <EnergyArc side="right" yOffset={1} color="#22d3ee" speed={0.12} />
      <EnergyArc side="right" yOffset={-2} color="#818cf8" speed={-0.08} />

      {/* Vertical light streaks */}
      <LightStreak x={-8} height={14} color="#06b6d4" speed={0.3} delay={0} />
      <LightStreak x={-6.5} height={10} color="#6366f1" speed={0.25} delay={1} />
      <LightStreak x={8} height={14} color="#22d3ee" speed={0.3} delay={0.5} />
      <LightStreak x={6.5} height={10} color="#818cf8" speed={0.25} delay={1.5} />
      <LightStreak x={-9} height={8} color="#818cf8" speed={0.2} delay={2} />
      <LightStreak x={9} height={8} color="#06b6d4" speed={0.2} delay={2.5} />

      {/* Connection lines across edges */}
      <EdgeConnections />

      {/* Particles that avoid center */}
      <EdgeParticles count={500} mouse={mouse} />

      <fog attach="fog" args={['#1a1a2e', 5, 22]} />
    </>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export function BackgroundParticles() {
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      mouseRef.current.x = (t.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(t.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 80 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        style={{ background: '#1a1a2e' }}
      >
        <Scene mouse={mouseRef} />
      </Canvas>
    </div>
  )
}
