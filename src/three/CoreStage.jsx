import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Bounds, Sparkles } from '@react-three/drei'
import { MathUtils } from 'three'
import Gyroscope from './Gyroscope.jsx'
import { useAnimationState } from '../hooks/useAnimationState.js'

export default function CoreStage({ reducedMotion }) {
  const { camera, gl, size, invalidate, setDpr } = useThree()
  const store = useAnimationState()
  const core = useRef()
  const particles = useRef()
  const rig = useRef({ frames: 0, baseZ: null, fade: 0 })
  const mobile = size.width < 760

  useEffect(() => {
    camera.setViewOffset(size.width, size.height, mobile ? 0 : -size.width * 0.24, mobile ? -size.height * 0.24 : 0, size.width, size.height)
    setDpr(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.5))
    rig.current.frames = 0
    rig.current.baseZ = null
    invalidate()
    return () => camera.clearViewOffset()
  }, [camera, size.width, size.height, mobile, invalidate, setDpr])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const hero = store.state.hero
    const stage = rig.current
    // Bounds owns the initial camera fit; capture it after fitting has completed.
    if (core.current && stage.baseZ === null && ++stage.frames >= 3) stage.baseZ = camera.position.z
    if (stage.baseZ !== null) camera.position.setZ(reducedMotion
      ? stage.baseZ : MathUtils.damp(camera.position.z, stage.baseZ * (1 - hero.wake * 0.1 + hero.exit * 0.025), 6, dt))
    // Travel toward the lower center as About arrives; hold this composition afterward.
    const offsetX = mobile ? 0 : -size.width * (0.24 - hero.exit * 0.12)
    const offsetY = -size.height * (mobile ? 0.24 : hero.exit * 0.12)
    if (camera.view && (Math.abs(camera.view.offsetX - offsetX) > 0.01 || Math.abs(camera.view.offsetY - offsetY) > 0.01)) {
      camera.setViewOffset(size.width, size.height, offsetX, offsetY, size.width, size.height)
    }
    const targetFade = core.current ? hero.intro : 0
    stage.fade = reducedMotion ? targetFade : MathUtils.damp(stage.fade, targetFade, 6, dt)
    const opacityValue = stage.fade > 0.999 ? '1' : stage.fade.toFixed(4)
    if (gl.domElement.style.opacity !== opacityValue) gl.domElement.style.setProperty('opacity', opacityValue)
    const field = particles.current
    if (field) {
      const energy = reducedMotion ? 0 : Math.abs(hero.velocity)
      if (!reducedMotion && hero.active) field.rotation.y += dt * (0.006 + energy * 0.14)
      if (reducedMotion) field.rotation.set(0, 0, 0)
      const opacity = field.geometry.getAttribute('opacity')
      field.scale.setScalar(1 + hero.wake * 0.12 + energy * 0.12)
      const target = 0.12 + hero.wake * 0.06 + energy * 0.12
      if (Math.abs(opacity.array[0] - target) > 0.001) {
        opacity.array.fill(target)
        opacity.needsUpdate = true
      }
    }
  })

  return (
    <>
      <Bounds fit clip observe margin={mobile ? 2.15 : size.width < 1100 ? 1.9 : 1.565} maxDuration={0}>
        <Gyroscope ref={core} controls={store.state.hero} rotation={[0.08, -0.28, -0.12]} reducedMotion={reducedMotion} />
      </Bounds>
      <Sparkles ref={particles} count={45} scale={[4, 2.7, 2.5]} size={0.65} opacity={0.12} color="#b3adb9" speed={reducedMotion ? 0 : 0.08} />
    </>
  )
}
