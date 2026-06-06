import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Bounds, useBounds } from '@react-three/drei'
import { Suspense, useRef, useEffect } from 'react'
import type * as THREE from 'three'

const MODEL_PATH = `${import.meta.env.BASE_URL}models/iss.glb`

function FitOnLoad() {
  const bounds = useBounds()
  useEffect(() => { bounds.refresh().fit() }, [bounds])
  return null
}

function ISSModel() {
  const { scene } = useGLTF(MODEL_PATH)
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05
  })

  return <primitive ref={ref} object={scene} />
}

interface ISSViewerProps {
  className?: string
}

export function ISSViewer({ className = 'w-full h-[400px]' }: ISSViewerProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 3, 20], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[15, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-8, -4, -6]} intensity={0.3} color="#c8257a" />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <ISSModel />
            <FitOnLoad />
          </Bounds>
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          minDistance={2}
          maxDistance={200}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
