import { MathUtils } from 'three'

export function updateMotion(state, rotation, pointer, delta) {
  const dt = Math.min(delta, 0.05)
  state.still = pointer.x !== state.x || pointer.y !== state.y ? 0 : state.still + dt
  state.x = pointer.x
  state.y = pointer.y
  if (state.still > 0.8) state.idle += dt * 0.12
  rotation.x = MathUtils.damp(rotation.x, -pointer.y * 0.12, 4, dt)
  rotation.y = MathUtils.damp(rotation.y, state.idle + pointer.x * 0.2, 4, dt)
}
