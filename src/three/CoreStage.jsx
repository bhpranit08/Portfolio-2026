import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'
import Gyroscope from './Gyroscope.jsx'
import { useAnimationState } from '../hooks/useAnimationState.js'
import { coreTransition, createCoreState, fitCoreToLab, sampleCoreState } from './core-timeline.js'
import { projects } from '../data/projects.js'

export default function CoreStage({ reducedMotion }) {
  const { camera, gl, size, invalidate, setDpr, setFrameloop } = useThree()
  const store = useAnimationState()
  const core = useRef()
  const particles = useRef()
  const rig = useRef(null)
  if (rig.current === null) rig.current = {
    baseZ: 8.4, ready: false, fade: 0, target: createCoreState(),
    rotation: new Euler(), quaternion: new Quaternion(), lookAt: new Vector3(), lookTarget: new Vector3(),
    controls: { active: false, intro: 0, velocity: 0, energy: 3, separation: 0, color: '#a875ff', pulse: false },
  }
  const mobile = size.width < 760

  useLayoutEffect(() => {
    rig.current.baseZ = 8.4 / Math.min(1, size.width / size.height)
    camera.position.set(0, 0, rig.current.baseZ)
    camera.near = 0.1
    camera.far = 100
    camera.updateProjectionMatrix()
    setDpr(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5))
    rig.current.ready = false
    invalidate()
  }, [camera, size.width, size.height, mobile, invalidate, setDpr])

  useEffect(() => {
    let previousMode
    let previousInput = ''
    const update = ({ progress, overlayOpen, timeline, labMode, activeProject }) => {
      const mode = document.hidden || overlayOpen ? 'never' : reducedMotion || progress === 1 ? 'demand' : 'always'
      const input = `${progress}/${timeline.current}/${timeline.progress}/${labMode}/${activeProject}`
      if (mode !== previousMode || input !== previousInput) {
        setFrameloop(mode)
        if (mode !== 'never') invalidate()
        previousMode = mode
        previousInput = input
      }
    }
    const visibility = () => update(store.state)
    const unsubscribe = store.subscribe(update)
    document.addEventListener('visibilitychange', visibility)
    store.setSceneStatus('ready')
    update(store.state)
    return () => { unsubscribe(); document.removeEventListener('visibilitychange', visibility) }
  }, [store, reducedMotion, invalidate, setFrameloop])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { hero, timeline, progress, scroll, velocity, labMode, activeProject, labAnchor } = store.state
    const stage = rig.current
    const target = sampleCoreState(stage.target, timeline, progress, mobile, labMode)
    const blend = reducedMotion || !stage.ready || progress === 1 ? 1 : 1 - Math.exp(-coreTransition.damping * dt)
    const height = 2 * stage.baseZ * Math.tan(MathUtils.degToRad(camera.fov / 2))
    const width = height * size.width / size.height
    fitCoreToLab(target, timeline, labAnchor, { width: size.width, height: size.height, worldHeight: height }, scroll, mobile)
    const object = core.current.group
    object.position.x = MathUtils.lerp(object.position.x, target.position[0] * width, blend)
    object.position.y = MathUtils.lerp(object.position.y, target.position[1] * height, blend)
    object.position.z = MathUtils.lerp(object.position.z, target.position[2] * stage.baseZ, blend)
    stage.quaternion.setFromEuler(stage.rotation.set(...target.rotation))
    object.quaternion.slerp(stage.quaternion, blend)
    object.scale.setScalar(MathUtils.lerp(object.scale.x, target.scale, blend))
    camera.position.set(
      MathUtils.lerp(camera.position.x, target.camera[0] * width, blend),
      MathUtils.lerp(camera.position.y, target.camera[1] * height, blend),
      MathUtils.lerp(camera.position.z, stage.baseZ * (1 + target.camera[2]), blend),
    )
    stage.lookTarget.set(target.lookAt[0] * width, target.lookAt[1] * height, target.lookAt[2])
    stage.lookAt.lerp(stage.lookTarget, blend)
    camera.lookAt(stage.lookAt)
    Object.assign(stage.controls, {
      active: hero.active, intro: hero.intro,
      energy: MathUtils.lerp(stage.controls.energy, target.energy * 3, blend),
      separation: MathUtils.lerp(stage.controls.separation, target.separation, blend),
      velocity: reducedMotion ? 0 : MathUtils.damp(stage.controls.velocity, MathUtils.clamp(velocity / 45, -1, 1), 5, dt),
      color: timeline.current === 'work' ? projects.find(({ number }) => number === activeProject)?.accent ?? '#a875ff' : '#a875ff',
      pulse: timeline.current === 'lab' && labMode === 'pulse',
    })
    stage.fade = reducedMotion || progress === 1 ? target.opacity : MathUtils.damp(stage.fade, target.opacity * Math.min(1, 0.3 + hero.intro), 8, dt)
    gl.domElement.style.opacity = stage.fade > 0.999 ? '1' : stage.fade.toFixed(3)
    const field = particles.current
    if (field) {
      field.position.copy(object.position)
      field.scale.setScalar(target.scale)
      if (!reducedMotion) field.rotation.y += dt * 0.015
    }
    stage.ready = true
  }, -1)

  return <>
    <Gyroscope ref={core} controls={rig.current.controls} reducedMotion={reducedMotion} />
    <Sparkles ref={particles} count={mobile ? 20 : 60} scale={[5, 4, 3]} size={1.2} opacity={0.2} color="#c9b4f0" speed={reducedMotion ? 0 : 0.12} />
  </>
}
