import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { Vector2 } from 'three'

export default function CoreEffects() {
  const { gl, scene, camera, size, viewport } = useThree()
  const composer = useRef()

  useEffect(() => {
    const effects = new EffectComposer(gl)
    const render = new RenderPass(scene, camera)
    // Purple has low luminance; keep the threshold below its textured emission.
    const bloom = new UnrealBloomPass(new Vector2(size.width, size.height), 0.22, 0.35, 0.25)
    const output = new OutputPass()
    effects.setPixelRatio(viewport.dpr)
    effects.setSize(size.width, size.height)
    effects.addPass(render)
    effects.addPass(bloom)
    effects.addPass(output)
    composer.current = effects
    return () => {
      composer.current = null
      render.dispose()
      bloom.dispose()
      output.dispose()
      effects.dispose()
    }
  }, [gl, scene, camera, size.width, size.height, viewport.dpr])

  useFrame(() => {
    if (composer.current) composer.current.render()
    else gl.render(scene, camera)
  }, 1)

  return null
}
