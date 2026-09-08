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
const controls = { active: false, intro: 1, velocity: 0 }
for (let i = 0; i < 120; i++) updateMotion(waiting, pose, { x: 1, y: 1 }, 1 / 60, 1, controls)
assert.equal(waiting.idle, 0, 'Idle waits for the intro')
assert.deepEqual(pose, { x: 0, y: 0 }, 'Mouse waits for the intro')
controls.velocity = 1
updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(pose.y > 0 && pose.y < 0.125, 'Scroll adds a restrained, damped turn')
assert.ok(waiting.energy > 3 && waiting.energy < 3.22, 'Velocity gently increases emission')
controls.velocity = 0
for (let i = 0; i < 600; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(Math.abs(pose.y) < 0.0001 && Math.abs(waiting.energy - 3) < 0.0001, 'Scroll motion and energy settle back')

controls.energy = 1.8
for (let i = 0; i < 240; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(Math.abs(waiting.energy - 1.8) < 0.001, 'The section controls resting energy')
controls.velocity = 1
for (let i = 0; i < 120; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(pose.y > 0.13 && waiting.energy > 2.1, 'Scroll adds bounded additive rotation and energy')
controls.velocity = 0
for (let i = 0; i < 240; i++) updateMotion(waiting, pose, { x: 0, y: 0 }, 1 / 60, 1, controls)
assert.ok(Math.abs(pose.y) < 0.001 && Math.abs(waiting.scale - 1) < 0.001, 'Additive motion settles without overriding the section composition')
