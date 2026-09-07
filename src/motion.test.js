import assert from 'node:assert/strict'
import { updateMotion } from './motion.js'

const state = { x: 0, y: 0, still: 0, idle: 0 }
const rotation = { x: 0, y: 0 }
for (let i = 0; i < 120; i++) updateMotion(state, rotation, { x: 0, y: 0 }, 1 / 60)
assert.ok(state.idle > 0 && rotation.y > 0, 'Idle rotation starts when the pointer rests')
const idle = state.idle
updateMotion(state, rotation, { x: 1, y: 1 }, 1 / 60)
assert.equal(state.still, 0)
assert.equal(state.idle, idle, 'Pointer motion pauses idle rotation')
assert.ok(rotation.x < 0, 'Pointer adds subtle tilt')
updateMotion(state, rotation, { x: 1, y: 1 }, 60)
assert.ok(state.still <= 0.05, 'Returning from a background tab cannot jump the animation')
