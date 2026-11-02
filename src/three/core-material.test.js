import assert from 'node:assert/strict'
import { createReactorResources } from './core-material.js'

const resources = createReactorResources()
let triangles = 0
for (const geometry of Object.values(resources.geometry)) {
  geometry.computeBoundingBox()
  assert.ok(geometry.boundingBox.min.toArray().every(Number.isFinite), 'Procedural geometry has finite bounds')
  triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3
}
assert.ok(triangles < 18000, 'The shared mechanical geometry stays within a small triangle budget')
assert.ok(resources.material.metal.metalness > 0.9, 'The housings use environment reflections')
assert.equal(resources.material.energy.emissive.getHexString(), '9e64ff')
assert.ok(resources.geometry.casing.boundingBox.min.z < 0 && resources.geometry.casing.boundingBox.max.z > 0, 'The casing is centered before assembly')
let disposed = 0
for (const item of [...Object.values(resources.geometry), ...Object.values(resources.material)]) item.addEventListener('dispose', () => disposed++)
resources.dispose()
assert.equal(disposed, Object.keys(resources.geometry).length + Object.keys(resources.material).length, 'Every owned GPU resource has a disposal path')
