'use client'

import {
  Suspense,
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
  Component,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { X } from 'lucide-react'
import * as THREE from 'three'

// ── Minecraft 3D Avatar ─────────────────────────────────────────────────────
// Ported from Queuepid-Web's AvatarViewer3D (Minecraft path only). The skin
// texture is loaded straight from mc-heads.net (CORS-enabled), so no backend
// proxy or API key is needed. Model defaults to 'classic'.

const S = 64
const PX = 1 / 16

type FaceUVs = {
  right: [number, number, number, number]
  front: [number, number, number, number]
  left: [number, number, number, number]
  back: [number, number, number, number]
  top: [number, number, number, number]
  bottom: [number, number, number, number]
}

const FACE_ORDER: (keyof FaceUVs)[] = ['left', 'right', 'top', 'bottom', 'front', 'back']

function skinBox(w: number, h: number, d: number, coords: FaceUVs) {
  const geo = new THREE.BoxGeometry(w, h, d)
  const uvs = geo.getAttribute('uv').array as Float32Array
  for (let face = 0; face < 6; face++) {
    const [px, py, pw, ph] = coords[FACE_ORDER[face]]
    const u0 = px / S,
      v0 = 1 - (py + ph) / S,
      u1 = (px + pw) / S,
      v1 = 1 - py / S
    const i = face * 8
    uvs[i] = u0
    uvs[i + 1] = v1
    uvs[i + 2] = u1
    uvs[i + 3] = v1
    uvs[i + 4] = u0
    uvs[i + 5] = v0
    uvs[i + 6] = u1
    uvs[i + 7] = v0
  }
  geo.getAttribute('uv').needsUpdate = true
  return geo
}

type SkinModel = 'classic' | 'slim'

const PARTS_CLASSIC = {
  head: { size: [8, 8, 8], pos: [0, 10, 0] },
  body: { size: [8, 12, 4], pos: [0, 0, 0] },
  rightArm: { size: [4, 12, 4], pos: [-6, 0, 0] },
  leftArm: { size: [4, 12, 4], pos: [6, 0, 0] },
  rightLeg: { size: [4, 12, 4], pos: [-2, -12, 0] },
  leftLeg: { size: [4, 12, 4], pos: [2, -12, 0] },
} as const

const PARTS_SLIM = {
  ...PARTS_CLASSIC,
  rightArm: { size: [3, 12, 4], pos: [-5.5, 0, 0] },
  leftArm: { size: [3, 12, 4], pos: [5.5, 0, 0] },
} as const

const BASE_UVS_CLASSIC: Record<string, FaceUVs> = {
  head: {
    right: [0, 8, 8, 8],
    front: [8, 8, 8, 8],
    left: [16, 8, 8, 8],
    back: [24, 8, 8, 8],
    top: [8, 0, 8, 8],
    bottom: [16, 0, 8, 8],
  },
  body: {
    right: [16, 20, 4, 12],
    front: [20, 20, 8, 12],
    left: [28, 20, 4, 12],
    back: [32, 20, 8, 12],
    top: [20, 16, 8, 4],
    bottom: [28, 16, 8, 4],
  },
  rightArm: {
    right: [40, 20, 4, 12],
    front: [44, 20, 4, 12],
    left: [48, 20, 4, 12],
    back: [52, 20, 4, 12],
    top: [44, 16, 4, 4],
    bottom: [48, 16, 4, 4],
  },
  leftArm: {
    right: [32, 52, 4, 12],
    front: [36, 52, 4, 12],
    left: [40, 52, 4, 12],
    back: [44, 52, 4, 12],
    top: [36, 48, 4, 4],
    bottom: [40, 48, 4, 4],
  },
  rightLeg: {
    right: [0, 20, 4, 12],
    front: [4, 20, 4, 12],
    left: [8, 20, 4, 12],
    back: [12, 20, 4, 12],
    top: [4, 16, 4, 4],
    bottom: [8, 16, 4, 4],
  },
  leftLeg: {
    right: [16, 52, 4, 12],
    front: [20, 52, 4, 12],
    left: [24, 52, 4, 12],
    back: [28, 52, 4, 12],
    top: [20, 48, 4, 4],
    bottom: [24, 48, 4, 4],
  },
}

const OVERLAY_UVS_CLASSIC: Record<string, FaceUVs> = {
  head: {
    right: [32, 8, 8, 8],
    front: [40, 8, 8, 8],
    left: [48, 8, 8, 8],
    back: [56, 8, 8, 8],
    top: [40, 0, 8, 8],
    bottom: [48, 0, 8, 8],
  },
  body: {
    right: [16, 36, 4, 12],
    front: [20, 36, 8, 12],
    left: [28, 36, 4, 12],
    back: [32, 36, 8, 12],
    top: [20, 32, 8, 4],
    bottom: [28, 32, 8, 4],
  },
  rightArm: {
    right: [40, 36, 4, 12],
    front: [44, 36, 4, 12],
    left: [48, 36, 4, 12],
    back: [52, 36, 4, 12],
    top: [44, 32, 4, 4],
    bottom: [48, 32, 4, 4],
  },
  leftArm: {
    right: [48, 52, 4, 12],
    front: [52, 52, 4, 12],
    left: [56, 52, 4, 12],
    back: [60, 52, 4, 12],
    top: [52, 48, 4, 4],
    bottom: [56, 48, 4, 4],
  },
  rightLeg: {
    right: [0, 36, 4, 12],
    front: [4, 36, 4, 12],
    left: [8, 36, 4, 12],
    back: [12, 36, 4, 12],
    top: [4, 32, 4, 4],
    bottom: [8, 32, 4, 4],
  },
  leftLeg: {
    right: [0, 52, 4, 12],
    front: [4, 52, 4, 12],
    left: [8, 52, 4, 12],
    back: [12, 52, 4, 12],
    top: [4, 48, 4, 4],
    bottom: [8, 48, 4, 4],
  },
}

const SLIM_ARM_UVS = {
  rightArm: {
    base: {
      right: [40, 20, 4, 12],
      front: [44, 20, 3, 12],
      left: [47, 20, 4, 12],
      back: [51, 20, 3, 12],
      top: [44, 16, 3, 4],
      bottom: [47, 16, 3, 4],
    } as FaceUVs,
    overlay: {
      right: [40, 36, 4, 12],
      front: [44, 36, 3, 12],
      left: [47, 36, 4, 12],
      back: [51, 36, 3, 12],
      top: [44, 32, 3, 4],
      bottom: [47, 32, 3, 4],
    } as FaceUVs,
  },
  leftArm: {
    base: {
      right: [32, 52, 4, 12],
      front: [36, 52, 3, 12],
      left: [39, 52, 4, 12],
      back: [43, 52, 3, 12],
      top: [36, 48, 3, 4],
      bottom: [39, 48, 3, 4],
    } as FaceUVs,
    overlay: {
      right: [48, 52, 4, 12],
      front: [52, 52, 3, 12],
      left: [55, 52, 4, 12],
      back: [59, 52, 3, 12],
      top: [52, 48, 3, 4],
      bottom: [55, 48, 3, 4],
    } as FaceUVs,
  },
}

// Overlay region detector for a 64×64 skin (skin-space pixel coords).
function isOverlayPixel(x: number, y: number): boolean {
  if (y < 16) return x >= 32 && x < 64 // head overlay
  if (y >= 32 && y < 48) return x < 56 // body/arms/legs overlay row
  if (y >= 48 && y < 64) return x < 16 || x >= 48 // left leg + left arm overlay
  return false
}

function mirrorHorizontalInPlace(img: ImageData) {
  const { width: w, height: h, data } = img
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w / 2; x++) {
      const a = (y * w + x) * 4
      const b = (y * w + (w - 1 - x)) * 4
      for (let k = 0; k < 4; k++) {
        const tmp = data[a + k]
        data[a + k] = data[b + k]
        data[b + k] = tmp
      }
    }
  }
}

function normalizeSkinTexture(source: CanvasImageSource & { width: number; height: number }) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 64, 64)
  ctx.drawImage(source, 0, 0)

  if (source.height === 32) {
    const arm = ctx.getImageData(40, 16, 16, 16)
    mirrorHorizontalInPlace(arm)
    ctx.putImageData(arm, 32, 48)
    const leg = ctx.getImageData(0, 16, 16, 16)
    mirrorHorizontalInPlace(leg)
    ctx.putImageData(leg, 16, 48)
  }

  const data = ctx.getImageData(0, 0, 64, 64)
  const px = data.data
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      if (!isOverlayPixel(x, y)) continue
      const i = (y * 64 + x) * 4
      if (px[i + 3] === 255 && px[i] === 0 && px[i + 1] === 0 && px[i + 2] === 0) {
        px[i + 3] = 0
      }
    }
  }
  ctx.putImageData(data, 0, 0)
  return canvas
}

function MinecraftModel({ username, model = 'classic' }: { username: string; model?: SkinModel }) {
  const raw = useLoader(THREE.TextureLoader, `https://mc-heads.net/skin/${username}`)
  const groupRef = useRef<THREE.Group>(null!)

  const texture = useMemo(() => {
    const img = raw.image as (CanvasImageSource & { width: number; height: number }) | undefined
    const tex = img && img.width ? new THREE.CanvasTexture(normalizeSkinTexture(img)) : raw
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestFilter
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [raw])

  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ map: texture }), [texture])
  const overlayMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.01,
        depthWrite: false,
      }),
    [texture]
  )

  const { parts, geos } = useMemo(() => {
    const parts = model === 'slim' ? PARTS_SLIM : PARTS_CLASSIC
    const baseUVs: Record<string, FaceUVs> = { ...BASE_UVS_CLASSIC }
    const overlayUVs: Record<string, FaceUVs> = { ...OVERLAY_UVS_CLASSIC }
    if (model === 'slim') {
      baseUVs.rightArm = SLIM_ARM_UVS.rightArm.base
      baseUVs.leftArm = SLIM_ARM_UVS.leftArm.base
      overlayUVs.rightArm = SLIM_ARM_UVS.rightArm.overlay
      overlayUVs.leftArm = SLIM_ARM_UVS.leftArm.overlay
    }
    const geos: Record<string, { base: THREE.BoxGeometry; overlay: THREE.BoxGeometry }> = {}
    for (const [name, part] of Object.entries(parts)) {
      const [w, h, d] = part.size
      geos[name] = {
        base: skinBox(w * PX, h * PX, d * PX, baseUVs[name]),
        overlay: skinBox(w * PX, h * PX, d * PX, overlayUVs[name]),
      }
    }
    return { parts, geos }
  }, [model])

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={groupRef} scale={0.7}>
      {Object.entries(parts).map(([name, part]) => {
        const [x, y, z] = part.pos
        return (
          <group key={name} position={[x * PX, y * PX, z * PX]}>
            <mesh geometry={geos[name].base} material={baseMat} />
            <mesh geometry={geos[name].overlay} material={overlayMat} scale={1.125} renderOrder={1} />
          </group>
        )
      })}
    </group>
  )
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-qp-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center animate-pulse">
          <span className="text-4xl font-display font-black gradient-text">Q</span>
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-transparent border-t-qp-500/50 animate-spin" />
      </div>
      <p className="text-xs text-white/30 animate-pulse">Loading model...</p>
    </div>
  )
}

class AvatarErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <p className="text-sm text-white/30">Couldn&apos;t load avatar</p>
          <p className="text-xs text-white/15">The account may no longer exist</p>
        </div>
      )
    }
    return this.props.children
  }
}

interface AvatarViewer3DProps {
  avatarUsername: string
  model?: SkinModel
  onClose: () => void
}

export function AvatarViewer3D({ avatarUsername, model = 'classic', onClose }: AvatarViewer3DProps) {
  const [modelReady, setModelReady] = useState(false)
  const handleReady = useCallback(() => setModelReady(true), [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] bg-[#030308] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all active:scale-95"
        >
          <X size={16} />
          Back
        </button>
        <div className="text-right">
          <p className="text-xs text-white/30 uppercase tracking-wider">Minecraft</p>
          <p className="text-sm font-display font-bold text-white/70">{avatarUsername}</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <AvatarErrorBoundary>
        <div className="relative flex-1 min-h-0">
          {!modelReady && <LoadingOverlay />}
          <Canvas
            camera={{ position: [0, 0.15, 3.5], fov: 35 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
            style={{ opacity: modelReady ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 3]} intensity={1.2} />
            <pointLight position={[-3, 2, -3]} intensity={0.4} color="#55c553" />
            <pointLight position={[3, 2, 3]} intensity={0.4} color="#3b82f6" />
            <Suspense fallback={null}>
              <MinecraftModel username={avatarUsername} model={model} />
              <Environment preset="night" />
              <ReadySignal onReady={handleReady} />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.3}
            />
          </Canvas>
        </div>
      </AvatarErrorBoundary>

      {/* Footer */}
      <div className="text-center py-3 shrink-0">
        <p className="text-[10px] text-white/15">drag to orbit</p>
      </div>
    </div>
  )
}
