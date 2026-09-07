import assert from 'node:assert/strict'
import { updateMotion } from './motion.js'

const state = { x: 0, y: 0, still: 0, idle: 0 }
const rotation = { x: 0, y: 0 }
for (let i = 0; i < 120; i++) updateMotion(state, rotation, { x: 0, y: 0 }, 1 / 60)
assert.ok(state.idle > 0 && rotation.y > 0, 'Idle rotation starts when the pointer rests')
const idle = state.idle
const speed = state.speed
updateMotion(state, rotation, { x: 1, y: 1 }, 1 / 60)
assert.equal(state.still, 0)
assert.ok(state.speed < speed && state.idle > idle, 'Pointer motion smoothly brakes idle rotation')
assert.ok(rotation.x < 0, 'Pointer adds subtle tilt')
updateMotion(state, rotation, { x: 1, y: 1 }, 60)
assert.ok(state.still <= 0.05, 'Returning from a background tab cannot jump the animation')

const neutral = { x: 0, y: 0 }
updateMotion({ x: 0, y: 0, still: 0, idle: 0 }, neutral, { x: 1, y: 1 }, 1 / 60, 0)
assert.deepEqual(neutral, { x: 0, y: 0 }, 'Mouse influence can be disabled')
for (let i = 0; i < 36000; i++) updateMotion(state, rotation, { x: 1, y: 1 }, 1 / 60)
assert.ok(Math.abs(rotation.y) <= 0.36 && Math.abs(rotation.x) <= 0.115, 'Idle stays within the composed camera view')
