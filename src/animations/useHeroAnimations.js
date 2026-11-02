import { useLayoutEffect } from 'react'
import { createScope, createTimeline, stagger, utils } from 'animejs'
import { useAnimationState } from '../hooks/useAnimationState.js'
import useReducedMotion from '../hooks/useReducedMotion.js'
import { updateHeroMotion } from './hero-motion.js'

export default function useHeroAnimations(root) {
  const store = useAnimationState()
  const reducedMotion = useReducedMotion()
  useLayoutEffect(() => {
    const element = root.current
    const hero = store.state.hero
    let start = 0
    let height = 1
    const measure = () => {
      start = element.getBoundingClientRect().top + window.scrollY
      height = element.offsetHeight
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(element)
    const scope = createScope({ root })
    const finish = () => {
      store.setHero({ intro: 1, active: true })
      element.setAttribute('data-intro-complete', 'true')
    }
    if (reducedMotion || hero.active || window.scrollY > start + height * 0.2) finish()
    else scope.add(() => {
      store.setHero({ intro: 0 })
      element.setAttribute('data-intro-complete', 'false')
      utils.set('.wordmark, .system-status, .eyebrow, .hero-description, .core-caption, .hero-footer > span, .hero-enter a', { opacity: 0 })
      utils.set('[data-hero-line]', { y: '105%' })
      createTimeline({ defaults: { duration: 480, ease: 'out(3)' }, onComplete: finish })
        .add('.wordmark', { opacity: [0, 1], y: [-5, 0] }, 0)
        .add('.system-status', { opacity: [0, 1] }, 140)
        .add('.eyebrow', { opacity: [0, 1], y: [6, 0] }, 280)
        .add(hero, { intro: [0, 1], duration: 700 }, 420)
        .add('[data-hero-line]', { y: ['105%', '0%'], duration: 620, delay: stagger(80) }, 380)
        .add('.hero-description', { opacity: [0, 1], y: [8, 0] }, 1000)
        .add('.core-caption, .hero-footer > span', { opacity: [0, 1] }, 1150)
        .add('.hero-enter a', { opacity: [0, 1], y: [5, 0], duration: 350 }, 1300)
    })
    let previousProgress = -1
    const unsubscribe = store.subscribe((input, delta) => {
      updateHeroMotion(hero, input, delta, start, height, reducedMotion)
      const p = Number(hero.progress.toFixed(4))
      if (p === previousProgress) return
      previousProgress = p
      element.style.setProperty('--hero-title-x', `${-hero.wake * 24 - hero.exit * 64}px`)
      element.style.setProperty('--hero-title-y', `${-hero.wake * 32 - hero.exit * 108}px`)
      element.style.setProperty('--hero-title-opacity', String(1 - hero.exit * 0.85))
      element.style.setProperty('--hero-support-y', `${-hero.wake * 14 - hero.exit * 34}px`)
      element.style.setProperty('--hero-indicator-opacity', reducedMotion ? '1' : String(Math.max(0, 1 - p * 6)))
      element.style.setProperty('--hero-indicator-y', `${p * 10}px`)
    })
    return () => {
      unsubscribe()
      resize.disconnect()
      scope.revert()
      for (const property of ['--hero-title-x', '--hero-title-y', '--hero-title-opacity', '--hero-support-y', '--hero-indicator-opacity', '--hero-indicator-y']) element.style.removeProperty(property)
      element.removeAttribute('data-intro-complete')
    }
  }, [root, store, reducedMotion])
}
