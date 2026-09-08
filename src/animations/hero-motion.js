export function updateHeroMotion(hero, input, delta, start, height, reducedMotion = false) {
  const dt = Math.min(Math.max(delta, 0), 0.05)
  const progress = Math.max(0, Math.min(1, (input.scroll - start) / Math.max(height, 1)))
  const velocity = Math.max(-1, Math.min(1, input.velocity / 45))
  const blend = 1 - Math.exp(-5 * dt)
  hero.progress += ((reducedMotion ? 0 : progress) - hero.progress) * blend
  hero.velocity += ((reducedMotion ? 0 : velocity) - hero.velocity) * blend
  if (reducedMotion) hero.progress = hero.velocity = 0
  hero.wake = heroPhase(hero.progress, 0.025, 0.2)
  hero.exit = heroPhase(hero.progress, 0.2, 1)
}
export function heroPhase(progress, start, end) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)))
  return t * t * (3 - 2 * t)
}
