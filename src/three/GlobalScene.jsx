import { Component, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Html, Lightformer } from '@react-three/drei'
import CoreStage from './CoreStage.jsx'
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

export default function GlobalScene() {
  const reducedMotion = useReducedMotion()
  return (
    <div className="global-scene">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true }}
          frameloop={reducedMotion ? 'demand' : 'always'}
          fallback={<p className="scene-status" role="status">3D preview unavailable in this browser.</p>}
        >
          <ambientLight intensity={0.08} />
          <directionalLight position={[-3, 4, 5]} color="#f2eee8" intensity={2.5} />
          <directionalLight position={[3, 1, -2]} color="#8b3dff" intensity={1.2} />
          <Environment resolution={128} frames={1}>
            <Lightformer position={[-3, 4, 3]} rotation={[Math.PI / 4, 0, 0]} scale={[5, 2, 1]} intensity={3} />
            <Lightformer position={[4, 1, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 5, 1]} intensity={1.5} />
            <Lightformer position={[0, 0, -4]} scale={[3, 1, 1]} color="#8b3dff" intensity={1} />
          </Environment>
          <Suspense fallback={<Html center><p className="loading" role="status">INITIALIZING CORE…</p></Html>}>
            <CoreStage reducedMotion={reducedMotion} />
          </Suspense>
          <CoreEffects />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
