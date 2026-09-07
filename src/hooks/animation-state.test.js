import assert from 'node:assert/strict'
import { createAnimationState } from './animation-state.js'

const store = createAnimationState()
const original = store.state
let notifications = 0
const unsubscribe = store.subscribe((state) => { assert.equal(state, original); notifications++ })
store.updateScroll({ scroll: 250, limit: 1000, velocity: 8 })
assert.equal(store.state.progress, 0.25)
assert.equal(store.state.velocity, 8)
store.tick(1 / 60)
assert.equal(notifications, 1)
assert.ok(store.state.idleTime > 0)
store.updatePointer(0, 0, 0)
store.updatePointer(0.5, -0.5, 100)
assert.equal(store.state.mouse.velocityX, 5)
assert.equal(store.state.mouse.velocityY, -5)
assert.equal(store.state.idleTime, 0)
store.tick(1 / 60)
assert.ok(store.state.mouse.velocityX < 5)
store.updateScroll({ scroll: 20, limit: 0, velocity: 0 })
assert.equal(store.state.progress, 0, 'Non-scrollable pages have finite progress')
store.updateScroll({ scroll: 1200, limit: 1000, velocity: 0 })
assert.equal(store.state.progress, 1, 'Overscroll stays in range')
unsubscribe()
store.tick(100)
assert.equal(notifications, 2, 'Unsubscribed consumers stop receiving updates')
assert.ok(store.state.idleTime <= 0.05, 'Background tabs do not cause large time jumps')
