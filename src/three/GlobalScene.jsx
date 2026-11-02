import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import CoreStage from './CoreStage.jsx'
import CoreEffects from './CoreEffects.jsx'
import SceneFallback from '../components/SceneFallback.jsx'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function GlobalScene() {
  const reducedMotion = useReducedMotion()
  return <div className="global-scene" aria-hidden="true">
    <Canvas camera={{ position: [0, 0, 8.4], fov: 35 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} frameloop={reducedMotion ? 'demand' : 'always'} fallback={<SceneFallback failed />}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-3, 5, 4]} color="#edf1ff" intensity={3} />
      <directionalLight position={[3, -1, -2]} color="#9254ff" intensity={2} />
      <Environment resolution={128} frames={1}>
        <Lightformer position={[-3, 4, 3]} rotation={[Math.PI / 4, 0, 0]} scale={[5, 2, 1]} intensity={5} />
        <Lightformer position={[4, 1, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[1, 5, 1]} intensity={3} />
        <Lightformer position={[0, -3, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[4, 1, 1]} color="#9a6cff" intensity={3} />
      </Environment>
      <CoreStage reducedMotion={reducedMotion} />
      <CoreEffects reducedMotion={reducedMotion} />
    </Canvas>
  </div>
}
