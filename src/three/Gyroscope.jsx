import { useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import { updateMotion } from './motion.js'
import { createCoreMaterial } from './core-material.js'
import { useAnimationState } from '../hooks/useAnimationState.js'

export default function Gyroscope({ ref, controls, mouseInfluence = 1, reducedMotion = false, ...transform }) {
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

  // The section timeline owns the outer rig; idle/pointer motion stays additive inside it.
  useImperativeHandle(ref, () => ({ group: root.current, model, input: store.state, controls }), [model, store, controls])

  useFrame((_, delta) => {
    if (reducedMotion) {
      group.current.rotation.set(0, 0, 0)
      group.current.position.set(0, 0, 0)
      group.current.scale.setScalar(1)
      materials.forEach((material) => { material.emissiveIntensity = controls?.energy ?? 3 })
      return
    }
    updateMotion(motion.current, group.current.rotation, store.state.mouse, delta, mouseInfluence, controls)
    group.current.position.set(motion.current.offsetX, motion.current.offsetY, 0)
    group.current.rotation.z = motion.current.roll
    group.current.scale.setScalar(motion.current.scale)
    materials.forEach((material) => { material.emissiveIntensity = motion.current.energy })
  })

  return (
    <group ref={root} name="core-root" {...transform}>
      <group ref={group} name="core-motion">
        <Center>
          <primitive object={model} dispose={null} />
        </Center>
      </group>
    </group>
  )
}
