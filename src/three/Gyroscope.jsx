import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D } from 'three'
import { updateMotion, updateRingPose } from './motion.js'
import { createReactorResources } from './core-material.js'
import { useAnimationState } from '../hooks/useAnimationState.js'

function MechanicalRing({ resources, ringRef, scale }) {
  const parts = useRef([])
  const { geometry, material } = resources
  useLayoutEffect(() => {
    const dummy = new Object3D()
    for (let i = 0; i < 36; i++) {
      const angle = i / 36 * Math.PI * 2
      for (let kind = 0; kind < 3; kind++) {
        const radius = kind === 2 ? 1.52 : 1.45
        dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, kind === 0 ? 0 : 0.106)
        dummy.rotation.set(0, 0, angle - Math.PI / 2)
        dummy.updateMatrix()
        parts.current[kind].setMatrixAt(i, dummy.matrix)
      }
    }
    parts.current.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true })
  }, [])
  return <group ref={ringRef} scale={scale}>
    <mesh geometry={geometry.casing} material={material.metal} />
    <mesh geometry={geometry.rim} material={material.silver} position-z={0.07} />
    <mesh geometry={geometry.rim} material={material.silver} position-z={-0.07} />
    <mesh geometry={geometry.channel} material={material.energy} />
    <instancedMesh ref={(node) => { parts.current[0] = node }} args={[geometry.housing, material.dark, 36]} />
    <instancedMesh ref={(node) => { parts.current[1] = node }} args={[geometry.diode, material.energy, 36]} />
    <instancedMesh ref={(node) => { parts.current[2] = node }} args={[geometry.bolt, material.silver, 36]} />
  </group>
}

export default function Gyroscope({ ref, controls, reducedMotion = false }) {
  const root = useRef()
  const motionGroup = useRef()
  const rings = useRef([])
  const crystal = useRef()
  const resources = useMemo(createReactorResources, [])
  const store = useAnimationState()
  const motion = useRef({ x: 0, y: 0, still: 0, idle: 0, phase: 0, pose: { position: [0, 0, 0], rotation: [0, 0, 0] }, color: new Color() })
  useEffect(() => () => resources.dispose(), [resources])
  useImperativeHandle(ref, () => ({ group: root.current }), [])

  useFrame((_, delta) => {
    const state = motion.current
    const dt = Math.min(delta, 0.05)
    const group = motionGroup.current
    if (reducedMotion) {
      group.rotation.set(0, 0, 0)
      group.position.set(0, 0, 0)
      group.scale.setScalar(1)
    } else {
      updateMotion(state, group.rotation, store.state.mouse, dt, 1, controls)
      group.rotation.z = state.roll
      group.position.set(state.offsetX, state.offsetY, 0)
      group.scale.setScalar(state.scale)
      if (controls.active) state.phase = (state.phase + dt * (0.22 + Math.abs(controls.velocity) * 0.5)) % (Math.PI * 120)
    }
    rings.current.forEach((ring, index) => {
      updateRingPose(state.pose, index, state.phase, controls.separation, controls.intro, reducedMotion)
      ring.position.set(...state.pose.position)
      ring.rotation.set(...state.pose.rotation)
    })
    crystal.current.rotation.set(reducedMotion ? 0.2 : state.phase * 0.4, reducedMotion ? 0.3 : state.phase * -0.6, 0.3)
    const pulse = controls.pulse && !reducedMotion ? 1 + Math.sin(state.phase * 7) * 0.18 : 1
    crystal.current.scale.setScalar(pulse)
    state.color.set(controls.color)
    resources.material.energy.emissive.lerp(state.color, reducedMotion ? 1 : 1 - Math.exp(-4 * dt))
    resources.material.energy.emissiveIntensity = (reducedMotion ? controls.energy : state.energy) * pulse
    resources.material.lines.color.copy(resources.material.energy.emissive)
    resources.material.crystal.color.lerp(state.color, reducedMotion ? 1 : 1 - Math.exp(-2 * dt))
  })

  return <group ref={root} name="core-root" dispose={null}>
    <group ref={motionGroup} name="core-motion">
      {[1, 0.82, 0.64].map((scale, index) => <MechanicalRing key={scale} resources={resources} scale={scale} ringRef={(node) => { rings.current[index] = node }} />)}
      <group ref={crystal}>
        <mesh geometry={resources.geometry.crystal} material={resources.material.crystal} />
        <lineSegments geometry={resources.geometry.edges} material={resources.material.lines} />
        <mesh geometry={resources.geometry.heart} material={resources.material.heart} />
      </group>
    </group>
  </group>
}
