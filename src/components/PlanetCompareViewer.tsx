import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Html } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

const EARTH_PATH = `${import.meta.env.BASE_URL}mars/earth.glb`
const MARS_PATH = `${import.meta.env.BASE_URL}mars/mars.glb`

/* Real equatorial radii: Earth ≈ 6 371 km, Mars ≈ 3 390 km — Mars is ≈ 0,53 × Earth */
const EARTH_RADIUS = 6371
const MARS_RADIUS = 3390
const MARS_RATIO = MARS_RADIUS / EARTH_RADIUS

const DISPLAY_RADIUS = 2.6

function NormalizedPlanet({ path, displayRadius, label, x, spinSpeed }: {
  path: string
  displayRadius: number
  label: string
  x: number
  spinSpeed: number
}) {
  const { scene } = useGLTF(path)
  const ref = useRef<THREE.Group>(null)

  const { normalized, scale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    const s = sphere.radius > 0 ? displayRadius / sphere.radius : 1
    return { normalized: sphere.center, scale: s }
  }, [scene, displayRadius])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * spinSpeed
  })

  return (
    <group position={[x, 0, 0]}>
      <group ref={ref} scale={scale} position={[-normalized.x * scale, -normalized.y * scale, -normalized.z * scale]}>
        <primitive object={scene} />
      </group>
      <Html position={[0, -displayRadius - 0.55, 0]} center distanceFactor={11} occlude={false}>
        <div className="px-2.5 py-1 rounded-full bg-deepspace/80 border border-white/15 text-white text-[12px] font-semibold whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  )
}

interface PlanetCompareViewerProps {
  className?: string
}

export function PlanetCompareViewer({ className = 'w-full h-[420px]' }: PlanetCompareViewerProps) {
  const marsRadius = DISPLAY_RADIUS * MARS_RATIO
  const gap = DISPLAY_RADIUS + marsRadius + 1.6

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 1.4, 13], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[15, 10, 8]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -6, -8]} intensity={0.35} color="#c8257a" />
        <Suspense fallback={null}>
          <NormalizedPlanet path={EARTH_PATH} displayRadius={DISPLAY_RADIUS} label="Terre · ⌀ 12 742 km" x={-gap / 2} spinSpeed={0.18} />
          <NormalizedPlanet path={MARS_PATH} displayRadius={marsRadius} label="Mars · ⌀ 6 779 km" x={gap / 2} spinSpeed={0.16} />
        </Suspense>
        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minDistance={6}
          maxDistance={40}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload(EARTH_PATH)
useGLTF.preload(MARS_PATH)
