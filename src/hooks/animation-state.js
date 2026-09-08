// Stable mutable state: animation consumers read this without React renders.
export function createAnimationState() {
  const state = {
    scroll: 0, progress: 0, velocity: 0, idleTime: 0,
    mouse: { x: 0, y: 0, velocityX: 0, velocityY: 0 },
    hero: { intro: 0, active: false, progress: 0, velocity: 0, wake: 0, exit: 0 },
  }
  const listeners = new Set()
  let pointerTime = null
  return {
    state,
    setHero(values) { Object.assign(state.hero, values) },
    subscribe(callback) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    updateScroll({ scroll, limit, velocity }) {
      if (scroll !== state.scroll) state.idleTime = 0
      state.scroll = scroll
      state.progress = limit > 0 ? Math.max(0, Math.min(1, scroll / limit)) : 0
      state.velocity = velocity
    },
    updatePointer(x, y, now) {
      const dt = pointerTime === null ? 0 : Math.max((now - pointerTime) / 1000, 1 / 240)
      const mouse = state.mouse
      mouse.velocityX = dt ? (x - mouse.x) / dt : 0
      mouse.velocityY = dt ? (y - mouse.y) / dt : 0
      mouse.x = x
      mouse.y = y
      pointerTime = now
      state.idleTime = 0
    },
    tick(delta) {
      const dt = Math.min(Math.max(delta, 0), 0.05)
      state.idleTime += dt
      const decay = Math.exp(-10 * dt)
      state.mouse.velocityX *= decay
      state.mouse.velocityY *= decay
      listeners.forEach((callback) => callback(state, dt))
    },
  }
}
