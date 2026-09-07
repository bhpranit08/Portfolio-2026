import { Component, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Environment, Html, Lightformer } from '@react-three/drei'
import Gyroscope from './Gyroscope.jsx'

class SceneErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('Gyroscope scene failed:', error)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="status" role="alert">
          <p>Unable to display the model. Please reload to try again.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <main aria-label="Gyroscope asset preview">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 40 }}
          dpr={[1, 2]}
          fallback={<p className="status" role="alert">WebGL is unavailable in this browser.</p>}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 4, 5]} intensity={2} />
          <directionalLight position={[-3, 1, -4]} color="#77bbff" intensity={3} />
          <Environment resolution={128}>
            <Lightformer position={[0, 4, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 4, 1]} intensity={3} />
            <Lightformer position={[-4, 0, 1]} rotation={[0, Math.PI / 2, 0]} scale={[3, 6, 1]} color="#77bbff" intensity={2} />
          </Environment>
          <Suspense fallback={<Html center><p className="loading" role="status">Loading model…</p></Html>}>
            <Bounds fit clip observe margin={1.5} maxDuration={0}>
              <Gyroscope />
            </Bounds>
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </main>
  )
}
