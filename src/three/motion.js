import { MathUtils } from 'three'

export function updateMotion(state, rotation, pointer, delta, mouseInfluence = 1, controls = {}) {
  const dt = Math.min(delta, 0.05)
  const active = controls.active !== false
  const velocity = controls.velocity ?? 0
  const entrance = controls.intro ?? 1
  state.still = pointer.x !== state.x || pointer.y !== state.y ? 0 : state.still + dt
  state.x = pointer.x
  state.y = pointer.y
  state.speed = MathUtils.damp(state.speed ?? 0, active && state.still > 0.8 ? 0.12 : 0, 2, dt)
  state.idle += dt * state.speed
  const influence = active ? mouseInfluence : 0
  const response = Math.abs(velocity) > 0.01 ? 6 : 2.2
  rotation.x = MathUtils.damp(rotation.x, Math.sin(state.idle * 0.7) * 0.035 - pointer.y * 0.08 * influence, response, dt)
  rotation.y = MathUtils.damp(rotation.y, Math.sin(state.idle) * 0.22 + pointer.x * 0.14 * influence + velocity * 0.14 - (1 - entrance) * 0.06, response, dt)
  state.roll = MathUtils.damp(state.roll ?? 0, velocity * 0.06, response, dt)
  state.offsetX = MathUtils.damp(state.offsetX ?? 0, Math.sin(state.idle * 0.6) * 0.008 + pointer.x * 0.012 * influence, response, dt)
  state.offsetY = MathUtils.damp(state.offsetY ?? 0, Math.sin(state.idle * 0.9) * 0.012 + pointer.y * 0.01 * influence + (1 - entrance) * 0.08, response, dt)
  state.scale = MathUtils.damp(state.scale ?? 1, 1 + Math.abs(velocity) * 0.035, response, dt)
  state.energy = MathUtils.damp(state.energy ?? 3, (controls.energy ?? 3) + Math.sin(state.idle * 1.4) * 0.065 + Math.abs(velocity) * 0.35, 4, dt)
}
