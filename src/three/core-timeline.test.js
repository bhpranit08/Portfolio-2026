import assert from 'node:assert/strict'
import { coreStates, createCoreState, createSectionStops, sampleCoreState, updateSectionProgress } from './core-timeline.js'
import { createAnimationState } from '../hooks/animation-state.js'

const sections = coreStates.map(({ id }, index) => ({ id, top: index * 1000 }))
const store = createAnimationState()
store.setSections(sections, 800, 6200)
const timeline = store.state.timeline
const target = createCoreState()
const sample = (progress, mobile = false) => {
  store.updateScroll({ scroll: progress * 6200, limit: 6200, velocity: 0 })
  return sampleCoreState(target, timeline, store.state.progress, mobile)
}
for (const [index, stop] of timeline.stops.entries()) {
  for (const mobile of [false, true]) {
    sample(stop.anchor, mobile)
    const expected = coreStates[index]
    assert.equal(timeline.current, expected.id)
    assert.deepEqual(target.position, mobile ? expected.mobile.position : expected.position)
    assert.deepEqual(target.rotation, expected.rotation)
    assert.equal(target.scale, (mobile && expected.mobile.scale) || expected.scale)
    assert.equal(target.energy, expected.energy)
    assert.equal(target.opacity, 1, 'The CORE remains visible at every section destination')
  }
}
const [hero, about] = timeline.stops
sample(about.anchor * 0.2)
assert.ok(target.rotation[1] > coreStates[0].rotation[1] + 0.25, 'The first scroll visibly wakes the CORE')
assert.ok(target.scale > 1.05 && target.camera[2] < -0.04, 'Scale and camera participate in the wake')
sample(about.anchor * 0.775)
assert.ok(Math.abs(timeline.progress - 0.775) < 1e-12)
assert.ok(target.position[1] > (coreStates[0].position[1] + coreStates[1].position[1]) / 2 + 0.06, 'Travel follows a visible arc')
const halfway = structuredClone(target)
sample(0.9)
sample(about.anchor * 0.775)
assert.deepEqual(target, halfway, 'Reverse scrolling samples the same deterministic target')
for (const stop of timeline.stops.slice(1)) {
  sample(stop.anchor - 1e-8)
  const before = structuredClone(target)
  sample(stop.anchor + 1e-8)
  assert.ok(target.position.every((value, axis) => Math.abs(value - before.position[axis]) < 1e-5), 'Section boundaries are continuous')
}
sample(0.969)
assert.equal(target.opacity, 1, 'No fade before the final 3% of the page')
sample(0.985)
assert.ok(Math.abs(target.opacity - 0.5) < 1e-10)
sample(1)
assert.equal(target.opacity, 0)
assert.ok(target.energy < coreStates.at(-1).energy && target.scale < coreStates.at(-1).scale)
sample(0.9)
assert.equal(target.opacity, 1, 'Scrolling back from the end restores visibility')
sample(-1)
assert.equal(timeline.current, 'hero')
assert.equal(hero.progress, 0)
sample(2)
assert.equal(timeline.current, 'contact')
assert.equal(timeline.progress, 1)
const resized = createSectionStops(sections, 1000, 6000)
assert.notEqual(resized[1].anchor, about.anchor, 'Anchors follow viewport and document dimensions')
store.setSections(sections, 1000, 6000)
assert.equal(timeline.current, 'contact', 'Remeasuring preserves current normalized scroll')
const empty = { stops: [] }
updateSectionProgress(empty, 0)
assert.equal(sampleCoreState(target, empty, 0).scale, 1)
const short = { stops: createSectionStops(sections, 800, 0) }
updateSectionProgress(short, 0)
assert.ok(Number.isFinite(short.progress), 'Collapsed ranges never produce NaN')
assert.equal(short.current, 'hero', 'Non-scrollable pages retain HERO')
const mobileStops = createSectionStops(sections, 844, 6000 + 844 * 0.55 - 844)
assert.ok(mobileStops.at(-1).anchor < 0.97, 'Short mobile CONTACT arrives before the final fade')
