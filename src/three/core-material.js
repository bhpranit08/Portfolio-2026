import { ShaderChunk } from 'three'

export function createCoreMaterial(source) {
  const material = source.clone()
  material.color.set('#8a8a8a')
  material.emissive.set('#8b3dff')
  material.emissiveIntensity = 3
  material.envMapIntensity = 0.8
  // Retain all original maps and UVs; remove their amber hue in the shader.
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <map_fragment>', `${ShaderChunk.map_fragment}
        diffuseColor.rgb = vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)));`)
      .replace('#include <emissivemap_fragment>', ShaderChunk.emissivemap_fragment.replace(
        'totalEmissiveRadiance *= emissiveColor.rgb;',
        'totalEmissiveRadiance *= dot(emissiveColor.rgb, vec3(0.2126, 0.7152, 0.0722));',
      ))
  }
  material.customProgramCacheKey = () => 'core-neutral-purple-v1'
  return material
}
