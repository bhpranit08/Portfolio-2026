import assert from 'node:assert/strict'
import { coreStates, createCoreState, createSectionStops, fitCoreToLab, sampleCoreState, updateSectionProgress } from './core-timeline.js'
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
const contactStart = timeline.stops.at(-1).anchor
sample(contactStart + (1 - contactStart) * 0.64)
assert.equal(target.opacity, 1, 'Contact holds the reactor until the closing part of its own chapter')
sample(contactStart + (1 - contactStart) * 0.825)
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
assert.ok(mobileStops.at(-1).anchor < 1, 'Short mobile CONTACT still has a finite interval before the final fade')

assert.deepEqual(coreStates.map(({ id }) => id), ['hero', 'about', 'work', 'stack', 'activity', 'lab', 'contact'], 'Scene chapters match the content order')
const labTimeline = { current: 'lab', next: 'contact', progress: 0.1 }
const assembled = structuredClone(sampleCoreState(target, labTimeline, 0.9, false, 'assembled'))
const exploded = structuredClone(sampleCoreState(target, labTimeline, 0.9, false, 'exploded'))
assert.ok(exploded.separation > assembled.separation + 1, 'Lab separates the independent mechanical rings')
const pulse = structuredClone(sampleCoreState(target, labTimeline, 0.9, false, 'pulse'))
assert.ok(pulse.energy > assembled.energy, 'Pulse changes the energy state')
labTimeline.progress = 1
const leaveAssembled = structuredClone(sampleCoreState(target, labTimeline, 0.95, false, 'assembled'))
const leaveExploded = structuredClone(sampleCoreState(target, labTimeline, 0.95, false, 'exploded'))
assert.deepEqual(leaveExploded, leaveAssembled, 'Lab overrides yield completely at the next chapter boundary')
const outsideLab = { current: 'about', next: 'work', progress: 0.2 }
assert.deepEqual(structuredClone(sampleCoreState(target, outsideLab, 0.1, false, 'pulse')), structuredClone(sampleCoreState(target, outsideLab, 0.1, false, 'assembled')), 'Lab modes do not affect other sections')
for (let step = 0; step <= 200; step++) {
  const value = sample(step / 200)
  assert.ok([...value.position, ...value.camera, ...value.lookAt, value.separation].every(Number.isFinite), 'The camera and assembly path remain finite throughout the page')
  assert.ok(value.scale > 0 && value.separation >= 0 && value.opacity >= 0 && value.opacity <= 1)
}

const labFrame = { top: 4000, left: 50, width: 600, height: 440 }
const viewport = { width: 1440, height: 1000, worldHeight: 5.3 }
const labStart = { current: 'lab', next: 'contact', progress: 0 }
sampleCoreState(target, labStart, 0.8)
fitCoreToLab(target, labStart, labFrame, viewport, 3800, false)
assert.ok(Math.abs(target.position[0] - (350 / 1440 - 0.5)) < 1e-10, 'Lab is centered horizontally in its DOM viewing area')
assert.ok(Math.abs(target.position[1] - (0.5 - 420 / 1000)) < 1e-10, 'Lab follows the viewing area as the document scrolls')
assert.ok(target.scale * 3.4 / viewport.worldHeight * viewport.height < labFrame.height, 'The assembled reactor fits inside the Lab frame')
const fitted = structuredClone(target)
assert.deepEqual(fitCoreToLab(target, labStart, null, viewport, 0, false), fitted, 'Missing Lab measurements retain a safe timeline pose')
const contactTimeline = { current: 'contact', next: 'contact', progress: 0.1 }
sampleCoreState(target, contactTimeline, 0.99)
const contactPose = structuredClone(target)
assert.deepEqual(fitCoreToLab(target, contactTimeline, labFrame, viewport, 4000, false), contactPose, 'Lab placement cannot change the Contact composition')

const phoneSections = coreStates.map(({ id }, index) => ({ id, top: [0, 840, 1740, 6740, 7640, 8640, 9640][index] }))
const phoneLimit = 10640 - 844
const phoneLab = { stops: createSectionStops(phoneSections, 844, phoneLimit) }
const controlsInView = 8640 + 650 - 844 / 2
updateSectionProgress(phoneLab, controlsInView / phoneLimit)
assert.equal(phoneLab.current, 'lab', 'Phone Lab controls remain in their own chapter when centered on screen')
sampleCoreState(target, phoneLab, controlsInView / phoneLimit, true, 'exploded')
assert.ok(target.separation > 1, 'The exploded state stays active while visitors use the phone controls')
