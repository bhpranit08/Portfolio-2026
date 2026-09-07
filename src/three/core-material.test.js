import assert from 'node:assert/strict'
import { MeshStandardMaterial, Texture, ShaderLib } from 'three'
import { createCoreMaterial } from './core-material.js'

const source = new MeshStandardMaterial({ map: new Texture(), emissiveMap: new Texture(), normalMap: new Texture(), roughnessMap: new Texture(), metalnessMap: new Texture(), aoMap: new Texture() })
const core = createCoreMaterial(source)
assert.notEqual(core, source)
assert.equal(source.color.getHexString(), 'ffffff', 'Cached source material remains untouched')
for (const map of ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) assert.equal(core[map], source[map], 'Original textures are preserved')
const shader = { fragmentShader: ShaderLib.standard.fragmentShader }
core.onBeforeCompile(shader)
assert.ok(shader.fragmentShader.includes('totalEmissiveRadiance *= dot(emissiveColor.rgb'), 'Original emissive brightness masks the purple color')
assert.ok(shader.fragmentShader.includes('diffuseColor.rgb = vec3(dot('), 'Base texture detail becomes neutral')
assert.equal(core.emissive.getHexString(), '8b3dff')
