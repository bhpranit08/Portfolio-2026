import { Component, Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bounds, Environment, Html, Lightformer, Sparkles } from '@react-three/drei'
import Gyroscope from './Gyroscope.jsx'
import CoreEffects from './CoreEffects.jsx'
import useReducedMotion from '../hooks/useReducedMotion.js'

class SceneErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error('CORE scene failed:', error) }
  render() {
    if (this.state.failed) return <p className="scene-status" role="status">CORE unavailable. The portfolio is still online.</p>
    return this.props.children
  }
}

function Composition() {
  const { camera, size, invalidate } = useThree()
  useEffect(() => {
    const mobile = size.width < 760
    camera.setViewOffset(size.width, size.height, mobile ? 0 : -size.width * 0.24, mobile ? -size.height * 0.22 : 0, size.width, size.height)
    invalidate()
    return () => camera.clearViewOffset()
  }, [camera, size, invalidate])
  return null
}

export default function GlobalScene() {
  const reducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(document.getElementById('hero'))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="global-scene" style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
          frameloop={visible && !reducedMotion ? 'always' : 'demand'}
          fallback={<p className="scene-status" role="status">3D preview unavailable in this browser.</p>}
        >
          <Composition />
          <color attach="background" args={['#080808']} />
          <ambientLight intensity={0.08} />
          <directionalLight position={[-3, 4, 5]} color="#f2eee8" intensity={2.5} />
          <directionalLight position={[3, 1, -2]} color="#8b3dff" intensity={1.2} />
          <Environment resolution={128} frames={1}>
            <Lightformer position={[-3, 4, 3]} rotation={[Math.PI / 4, 0, 0]} scale={[5, 2, 1]} intensity={3} />
            <Lightformer position={[4, 1, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 5, 1]} intensity={1.5} />
            <Lightformer position={[0, 0, -4]} scale={[3, 1, 1]} color="#8b3dff" intensity={1} />
          </Environment>
          <Suspense fallback={<Html center><p className="loading" role="status">INITIALIZING CORE…</p></Html>}>
            <Bounds fit clip observe margin={1.8} maxDuration={0}>
              <Gyroscope rotation={[0.08, -0.28, -0.12]} reducedMotion={reducedMotion} />
            </Bounds>
          </Suspense>
          <Sparkles count={45} scale={[5, 3, 3]} size={0.65} opacity={0.16} color="#b3adb9" speed={reducedMotion ? 0 : 0.08} />
          <CoreEffects />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
