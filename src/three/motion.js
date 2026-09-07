import { MathUtils } from 'three'

export function updateMotion(state, rotation, pointer, delta, mouseInfluence = 1) {
  const dt = Math.min(delta, 0.05)
  state.still = pointer.x !== state.x || pointer.y !== state.y ? 0 : state.still + dt
  state.x = pointer.x
  state.y = pointer.y
  state.speed = MathUtils.damp(state.speed ?? 0, state.still > 0.8 ? 0.18 : 0, 2, dt)
  state.idle += dt * state.speed
  rotation.x = MathUtils.damp(rotation.x, Math.sin(state.idle * 0.7) * 0.035 - pointer.y * 0.08 * mouseInfluence, 3, dt)
  rotation.y = MathUtils.damp(rotation.y, Math.sin(state.idle) * 0.22 + pointer.x * 0.14 * mouseInfluence, 3, dt)
}
