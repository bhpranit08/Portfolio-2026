import { useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import { updateMotion } from './motion.js'
import { createCoreMaterial } from './core-material.js'
import { useAnimationState } from '../hooks/useAnimationState.js'

export default function Gyroscope({ ref, mouseInfluence = 1, reducedMotion = false, ...transform }) {
  const { scene } = useGLTF('/models/gyroscope.glb')
  const root = useRef()
  const group = useRef()
  const motion = useRef({ x: 0, y: 0, still: 0, idle: 0 })
  const store = useAnimationState()
  const { model, materials } = useMemo(() => {
    const model = scene.clone(true)
    const materials = new Map()
    const cloneMaterial = (source) => {
      if (!materials.has(source)) materials.set(source, createCoreMaterial(source))
      return materials.get(source)
    }
    model.traverse((part) => {
      if (part.isMesh) part.material = Array.isArray(part.material)
        ? part.material.map(cloneMaterial) : cloneMaterial(part.material)
    })
    return { model, materials }
  }, [scene])

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  // Outer transforms remain independent of idle motion. Named nodes stay accessible.
  // Shared input stays live without React renders; no scroll choreography yet.
  useImperativeHandle(ref, () => ({ group: root.current, model, input: store.state }), [model, store])

  useFrame((_, delta) => {
    if (!reducedMotion) updateMotion(motion.current, group.current.rotation, store.state.mouse, delta, mouseInfluence)
  })

  return (
    <group ref={root} {...transform}>
      <group ref={group}>
        <Center>
          <primitive object={model} dispose={null} />
        </Center>
      </group>
    </group>
  )
}
