import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Box3, Euler, MathUtils, Quaternion, Vector3 } from 'three'
import Gyroscope from './Gyroscope.jsx'
import { useAnimationState } from '../hooks/useAnimationState.js'
import { coreStates, coreTransition, createCoreState, sampleCoreState } from './core-timeline.js'

export default function CoreStage({ reducedMotion }) {
  const { camera, gl, size, invalidate, setDpr, setFrameloop } = useThree()
  const store = useAnimationState()
  const core = useRef()
  const particles = useRef()
  const [controls] = useState(() => ({ active: false, intro: 0, velocity: 0, energy: 3 }))
  const rig = useRef(null)
  if (rig.current === null) rig.current = {
    modelSize: null, baseZ: 6, fade: 0, ready: false,
    target: createCoreState(), rotation: new Euler(), quaternion: new Quaternion(),
    controls, particleIntensity: 1,
  }
  const mobile = size.width < 760

  useLayoutEffect(() => {
    const stage = rig.current
    // Measure the neutral model once. Refitting its animated bounds would drift on resize.
    stage.modelSize ??= new Box3().setFromObject(core.current.group).getSize(new Vector3())
    const margin = mobile ? 2.15 : size.width < 1100 ? 1.9 : 1.565
    // Preserve the original Bounds fit and hero framing, independent of section transforms.
    stage.baseZ = margin * Math.max(...stage.modelSize) / (2 * Math.atan(Math.PI * camera.fov / 360)) / Math.min(1, size.width / size.height)
    camera.position.set(0, 0, stage.baseZ)
    camera.rotation.set(0, 0, 0)
    Object.assign(camera, { near: stage.baseZ / 100, far: stage.baseZ * 100 })
    camera.setViewOffset(size.width, size.height, mobile ? 0 : -size.width * 0.24, mobile ? -size.height * 0.24 : 0, size.width, size.height)
    setDpr(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5))
    stage.ready = false
    invalidate()
    return () => camera.clearViewOffset()
  }, [camera, size.width, size.height, mobile, invalidate, setDpr])

  useEffect(() => {
    let previousProgress = -1
    let previousStops
    let previousMode
    const update = ({ progress, timeline, overlayOpen }) => {
      const mode = document.hidden || overlayOpen ? 'never' : reducedMotion || progress === 1 ? 'demand' : 'always'
      if (mode !== previousMode) { setFrameloop(mode); previousMode = mode; invalidate() }
      if (progress === previousProgress && timeline.stops === previousStops) return
      previousProgress = progress
      previousStops = timeline.stops
      invalidate()
    }
    const visibility = () => { previousProgress = -1; update(store.state) }
    const unsubscribe = store.subscribe(update)
    document.addEventListener('visibilitychange', visibility)
    update(store.state)
    return () => { unsubscribe(); document.removeEventListener('visibilitychange', visibility) }
  }, [store, reducedMotion, invalidate, setFrameloop])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { hero, timeline, progress, velocity } = store.state
    const stage = rig.current
    const target = sampleCoreState(stage.target, timeline, progress, mobile)
    const blend = reducedMotion || progress === 1 || !stage.ready ? 1 : 1 - Math.exp(-coreTransition.damping * dt)
    const height = 2 * stage.baseZ * Math.tan(MathUtils.degToRad(camera.fov / 2))
    const width = height * size.width / size.height
    const origin = mobile ? coreStates[0].mobile.position : coreStates[0].position
    const object = core.current.group
    object.position.x = MathUtils.lerp(object.position.x, (target.position[0] - origin[0]) * width, blend)
    object.position.y = MathUtils.lerp(object.position.y, (target.position[1] - origin[1]) * height, blend)
    object.position.z = MathUtils.lerp(object.position.z, target.position[2] * stage.baseZ, blend)
    stage.quaternion.setFromEuler(stage.rotation.set(...target.rotation))
    object.quaternion.slerp(stage.quaternion, blend)
    object.scale.setScalar(MathUtils.lerp(object.scale.x, target.scale, blend))
    camera.position.set(
      MathUtils.lerp(camera.position.x, target.camera[0] * width, blend),
      MathUtils.lerp(camera.position.y, target.camera[1] * height, blend),
      MathUtils.lerp(camera.position.z, stage.baseZ * (1 + target.camera[2]), blend),
    )
    stage.controls.active = hero.active
    stage.controls.intro = hero.intro
    stage.controls.energy = MathUtils.lerp(stage.controls.energy, target.energy * 3, blend)
    stage.controls.velocity = reducedMotion ? 0 : MathUtils.damp(stage.controls.velocity, MathUtils.clamp(velocity / 45, -1, 1), 5, dt)
    stage.fade = reducedMotion || progress === 1 ? target.opacity : MathUtils.damp(stage.fade, hero.intro * target.opacity, 6, dt)
    const opacityValue = stage.fade > 0.999 ? '1' : stage.fade.toFixed(4)
    if (gl.domElement.style.opacity !== opacityValue) gl.domElement.style.setProperty('opacity', opacityValue)
    const field = particles.current
    if (field) {
      stage.particleIntensity = MathUtils.lerp(stage.particleIntensity, target.particles, blend)
      const energy = Math.abs(stage.controls.velocity)
      if (!reducedMotion && hero.active) field.rotation.y += dt * (0.006 + energy * 0.08) * stage.particleIntensity
      if (reducedMotion) field.rotation.set(0, 0, 0)
      field.position.copy(object.position)
      field.scale.setScalar(object.scale.x * (1 + energy * 0.08))
      const opacity = field.geometry.getAttribute('opacity')
      const value = (0.12 + energy * 0.06) * stage.particleIntensity
      if (Math.abs(opacity.array[0] - value) > 0.001) {
        opacity.array.fill(value)
        opacity.needsUpdate = true
      }
    }
    stage.ready = true
  }, -1)

  return (
    <>
      <Gyroscope ref={core} controls={controls} rotation={coreStates[0].rotation} reducedMotion={reducedMotion} />
      <Sparkles ref={particles} count={mobile ? 18 : 45} scale={[4, 2.7, 2.5]} size={0.65} opacity={0.12} color="#b3adb9" speed={reducedMotion ? 0 : 0.08} />
    </>
  )
}
