import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import { updateMotion } from './motion.js'

export default function Gyroscope() {
  const { scene } = useGLTF('/models/gyroscope.glb')
  const group = useRef()
  const motion = useRef({ x: 0, y: 0, still: 0, idle: 0 })
  const reducedMotion = useRef(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reducedMotion.current = query.matches }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useFrame(({ pointer }, delta) => {
    if (!reducedMotion.current) updateMotion(motion.current, group.current.rotation, pointer, delta)
  })

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} dispose={null} />
      </Center>
    </group>
  )
}
