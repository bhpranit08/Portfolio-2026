import assert from 'node:assert/strict'
import { heroPhase, updateHeroMotion } from './hero-motion.js'

const hero = { progress: 0, velocity: 0 }
updateHeroMotion(hero, { scroll: 400, velocity: 800 }, 1 / 60, 0, 800)
assert.ok(hero.progress > 0 && hero.progress < 0.5, 'Scroll response is interpolated')
assert.ok(hero.velocity > 0 && hero.velocity < 1, 'Fast scroll is capped and damped')
for (let i = 0; i < 240; i++) updateHeroMotion(hero, { scroll: 400, velocity: 0 }, 1 / 60, 0, 800)
assert.ok(Math.abs(hero.progress - 0.5) < 0.001)
assert.ok(hero.velocity < 0.001, 'Velocity settles independently of scroll position')
updateHeroMotion(hero, { scroll: 300, velocity: -100 }, 1 / 60, 0, 800)
assert.ok(hero.velocity < 0, 'Reverse scrolling preserves direction')
updateHeroMotion(hero, { scroll: 5000, velocity: 10000 }, 100, 0, 800)
assert.ok(hero.progress <= 1 && Math.abs(hero.velocity) <= 1, 'Resume and out-of-hero inputs remain bounded')
updateHeroMotion(hero, { scroll: 300, velocity: 20 }, 1 / 60, 0, 0, true)
assert.deepEqual(hero, { progress: 0, velocity: 0, wake: 0, exit: 0 }, 'Reduced motion clears procedural response')
assert.equal(heroPhase(0, 0.025, 0.2), 0)
assert.ok(heroPhase(0.1, 0.025, 0.2) > 0.35, 'The wake-up is already visible at 10%')
assert.equal(heroPhase(0.2, 0.025, 0.2), 1)
for (let i = 0; i < 240; i++) updateHeroMotion(hero, { scroll: 1600, velocity: 0 }, 1 / 60, 0, 800)
assert.ok(hero.exit > 0.999 && hero.wake > 0.999, 'The final pose holds beyond the hero')
updateHeroMotion(hero, { scroll: 1600, velocity: 90 }, 1 / 60, 0, 800)
assert.ok(hero.velocity > 0, 'The persistent scene still receives velocity after the handoff')
