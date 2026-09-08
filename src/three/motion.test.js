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

const waiting = { x: 0, y: 0, still: 0, idle: 0 }
const pose = { x: 0, y: 0 }
const controls = { active: false, intro: 1, progress: 0, velocity: 0 }
for (let i = 0; i < 120; i++) updateMotion(waiting, pose, { x: 1, y: 1 }, 1 / 60, 1, controls)
assert.equal(waiting.idle, 0, 'Idle waits for the intro')
assert.deepEqual(pose, { x: 0, y: 0 }, 'Mouse waits for the intro')
controls.progress = 0.5
controls.velocity = 1
updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(pose.y > 0 && pose.y < 0.125, 'Scroll adds a restrained, damped turn')
assert.ok(waiting.energy > 3 && waiting.energy < 3.22, 'Velocity gently increases emission')
controls.progress = controls.velocity = 0
for (let i = 0; i < 600; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(Math.abs(pose.y) < 0.0001 && Math.abs(waiting.energy - 3) < 0.0001, 'Scroll motion and energy settle back')

controls.progress = 0.2
for (let i = 0; i < 240; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(pose.y > 0.34 && waiting.scale > 1.11 && waiting.offsetX > 0.13, 'First scroll visibly turns, enlarges, and moves the CORE')
controls.progress = 1
for (let i = 0; i < 240; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(Math.abs(pose.y - 1) < 0.001 && Math.abs(waiting.scale - 0.8) < 0.001, 'Hero exit holds a deliberate new pose')
const settledYaw = pose.y
controls.velocity = 1
for (let i = 0; i < 120; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(pose.y > settledYaw + 0.13 && waiting.energy > 3.7, 'Fast scroll adds bounded rotation and energy')
controls.velocity = 0
for (let i = 0; i < 240; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(Math.abs(pose.y - settledYaw) < 0.001, 'Velocity settles toward the current pose, not the initial hero')
